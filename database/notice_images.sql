-- Applied as add_notice_images_and_storage. Do not rerun on the migrated project.
alter table public.notices add column image_paths text[] not null default '{}';
create function public.valid_notice_image_paths(paths text[]) returns boolean
language sql immutable security invoker set search_path = ''
as $$ select cardinality(paths) <= 3 and (cardinality(paths) = 0 or array_ndims(paths) = 1)
  and not exists (select 1 from unnest(paths) as item(path) where path is null or path !~ '^notices/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$'); $$;
alter table public.notices add constraint notices_image_paths_valid check (public.valid_notice_image_paths(image_paths));
grant insert (image_paths), update (image_paths) on table public.notices to authenticated;
create index notices_image_paths_idx on public.notices using gin (image_paths);
comment on column public.notices.image_paths is '최대 3개 Storage 경로. 배열 첫 번째 이미지가 목록 썸네일.';
-- Bucket creation via SQL is documented in the Supabase Creating Buckets guide.
-- All file uploads and removals go through the Storage API.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('notice-images', 'notice-images', true, 5242880, array['image/jpeg','image/png','image/webp']);
create policy notice_images_admin_read on storage.objects for select to authenticated using (
  bucket_id = 'notice-images' and exists(select 1 from public.profiles where id=(select auth.uid()) and role='admin')
);
create policy notice_images_admin_upload on storage.objects for insert to authenticated with check (
  bucket_id = 'notice-images' and name ~ '^notices/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$'
  and exists(select 1 from public.profiles where id=(select auth.uid()) and role='admin')
);
create policy notice_images_admin_remove_unreferenced on storage.objects for delete to authenticated using (
  bucket_id = 'notice-images' and exists(select 1 from public.profiles where id=(select auth.uid()) and role='admin')
  and not exists(select 1 from public.notices where image_paths @> array[storage.objects.name])
);
