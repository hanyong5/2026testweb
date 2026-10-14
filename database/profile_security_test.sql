-- Run only as a database administrator. All fixture changes roll back.
begin;
select set_config('test.profile_a', gen_random_uuid()::text, true), set_config('test.profile_b', gen_random_uuid()::text, true);
insert into auth.users(id) values (current_setting('test.profile_a')::uuid), (current_setting('test.profile_b')::uuid);
insert into public.profiles(id, name) values (current_setting('test.profile_b')::uuid, 'Other test member');
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.profile_a'), true);
insert into public.profiles(id, name) values (current_setting('test.profile_a')::uuid, 'Test member');
do $$
declare affected integer;
begin
  update public.profiles set name = 'Updated member', avatar_seed = 12345 where id = current_setting('test.profile_a')::uuid;
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'Own profile update failed'; end if;
  if (select count(*) from public.profiles) <> 1 then raise exception 'Other profiles visible'; end if;
  update public.profiles set avatar_seed = 67890 where id = current_setting('test.profile_b')::uuid;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Other profile changed'; end if;
  begin
    update public.profiles set avatar_seed = -1 where id = current_setting('test.profile_a')::uuid;
    raise exception 'Invalid avatar accepted';
  exception when check_violation then null;
  end;
  begin
    update public.profiles set id = current_setting('test.profile_b')::uuid where id = current_setting('test.profile_a')::uuid;
    raise exception 'Protected ID changed';
  exception when insufficient_privilege then null;
  end;
end $$;
set local role anon;
do $$
begin
  begin
    perform id from public.profiles;
    raise exception 'Anonymous profile read allowed';
  exception when insufficient_privilege then null;
  end;
end $$;
rollback;
select true as profile_security_tests_passed, true as test_data_rolled_back;
