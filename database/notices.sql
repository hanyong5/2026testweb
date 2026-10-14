-- Applied as create_notices_board. Do not rerun on the migrated project.
create table public.notices (
  id bigint generated always as identity primary key,
  title text not null constraint notices_title_length check (char_length(btrim(title)) between 1 and 120),
  body text not null constraint notices_body_length check (char_length(btrim(body)) between 1 and 10000),
  author_id uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index notices_created_at_id_idx on public.notices (created_at desc, id desc);
create index notices_author_id_idx on public.notices (author_id);
alter table public.notices enable row level security;
revoke all on table public.notices from public, anon, authenticated;
grant select on table public.notices to anon, authenticated;
grant insert (title, body), update (title, body), delete on table public.notices to authenticated;
grant usage on sequence public.notices_id_seq to authenticated;
grant all on table public.notices to service_role;
grant all on sequence public.notices_id_seq to service_role;
create policy notices_public_read on public.notices for select to anon, authenticated using (true);
create policy notices_admin_insert on public.notices for insert to authenticated with check (
  exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
);
create policy notices_admin_update on public.notices for update to authenticated using (
  exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
) with check (
  exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
);
create policy notices_admin_delete on public.notices for delete to authenticated using (
  exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
);
create function public.set_notice_updated_at() returns trigger
language plpgsql security invoker set search_path = ''
as $$ begin new.updated_at := now(); return new; end; $$;
create trigger notices_updated_at before update on public.notices for each row execute function public.set_notice_updated_at();
revoke execute on function public.set_notice_updated_at() from public, anon, authenticated;
comment on table public.notices is '나의이웃 공지사항. 공개 읽기, 서버의 admin 역할만 작성·수정·삭제.';
