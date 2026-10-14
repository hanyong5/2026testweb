-- Applied as add_member_roles_and_assign_admin. Do not rerun on the migrated project.
alter table public.profiles add column role text not null default 'user' constraint profiles_role_valid check (role in ('admin', 'user'));
comment on column public.profiles.role is '회원 권한: admin 또는 user. 신뢰할 수 있는 DB 관리자만 변경한다.';
revoke insert (role), update (role) on table public.profiles from anon, authenticated;
do $$
declare assigned integer;
begin
  update public.profiles p set role = 'admin'
  from auth.users u where p.id = u.id and lower(u.email) = 'winoz@naver.com';
  get diagnostics assigned = row_count;
  if assigned <> 1 then raise exception 'Expected exactly one existing admin profile'; end if;
end $$;
