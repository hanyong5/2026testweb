-- Applied to kntxqcsoglxkmefyszox as create_member_profiles.
-- Reference copy; do not rerun against the already migrated project.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null constraint profiles_name_length check (char_length(btrim(name)) between 1 and 60),
  created_at timestamptz not null default now()
);
comment on table public.profiles is '나의이웃 회원 프로필. 인증 정보와 세션은 Supabase Auth에서 관리한다.';
comment on column public.profiles.name is '회원가입 화면의 이름 (공백 제외 1~60자).';
alter table public.profiles enable row level security;
revoke all on table public.profiles from public, anon, authenticated;
grant select on table public.profiles to authenticated;
grant insert (id, name) on table public.profiles to authenticated;
grant update (name) on table public.profiles to authenticated;
grant all on table public.profiles to service_role;
create policy profiles_select_own on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy profiles_insert_own on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
