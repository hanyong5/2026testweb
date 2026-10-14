-- Run as a database administrator. All fixture changes roll back.
begin;
select set_config('test.member_id', gen_random_uuid()::text, true);
insert into auth.users (id, raw_user_meta_data) values (current_setting('test.member_id')::uuid, '{"role":"admin","name":"Role test"}'::jsonb);
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.member_id'), true);
insert into public.profiles (id, name) values (current_setting('test.member_id')::uuid, 'Role test');
do $$
begin
  if (select role from public.profiles where id = current_setting('test.member_id')::uuid) <> 'user' then raise exception 'New member role is not user'; end if;
  begin
    update public.profiles set role='admin' where id=current_setting('test.member_id')::uuid;
    raise exception 'Member self-promotion allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.profiles (id, name, role) values (gen_random_uuid(), 'Role injection', 'admin');
    raise exception 'Explicit admin insert allowed';
  exception when insufficient_privilege then null;
  end;
  update public.profiles set name='Updated role test', avatar_seed=54321 where id=current_setting('test.member_id')::uuid;
  if (select role from public.profiles where id=current_setting('test.member_id')::uuid) <> 'user' then raise exception 'Profile edit changed role'; end if;
end $$;
rollback;
select true as role_tests_passed, true as fixtures_rolled_back;
