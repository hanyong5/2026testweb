-- Run as a database administrator. Test rows roll back; identity sequences may advance.
begin;
select set_config('test.notice_admin', gen_random_uuid()::text, true), set_config('test.notice_user', gen_random_uuid()::text, true);
insert into auth.users(id) values (current_setting('test.notice_admin')::uuid), (current_setting('test.notice_user')::uuid);
insert into public.profiles(id, name, role) values (current_setting('test.notice_admin')::uuid, 'Notice admin test', 'admin'), (current_setting('test.notice_user')::uuid, 'Notice user test', 'user');
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.notice_admin'), true);
do $$
declare new_id bigint; affected integer;
begin
  insert into public.notices(title, body) values ('Notice RLS test', 'Temporary content') returning id into new_id;
  perform set_config('test.notice_id', new_id::text, true);
  if (select author_id from public.notices where id=new_id) <> current_setting('test.notice_admin')::uuid then raise exception 'Incorrect author'; end if;
  update public.notices set title='Edited notice', body='Edited temporary content' where id=new_id;
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'Admin update failed'; end if;
end $$;
select set_config('request.jwt.claim.sub', current_setting('test.notice_user'), true);
do $$
declare affected integer;
begin
  begin
    insert into public.notices(title,body) values ('Forbidden notice','Forbidden content');
    raise exception 'User insert allowed';
  exception when insufficient_privilege then null;
  end;
  update public.notices set title='Forbidden edit' where id=current_setting('test.notice_id')::bigint;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'User update allowed'; end if;
  delete from public.notices where id=current_setting('test.notice_id')::bigint;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'User delete allowed'; end if;
end $$;
set local role anon;
do $$
begin
  if not exists(select 1 from public.notices where id=current_setting('test.notice_id')::bigint) then raise exception 'Public read denied'; end if;
  begin
    insert into public.notices(title,body) values ('Anon forbidden','No');
    raise exception 'Anonymous insert allowed';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
update public.profiles set role='user' where id=current_setting('test.notice_admin')::uuid;
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.notice_admin'), true);
do $$
declare affected integer;
begin
  update public.notices set title='Revoked admin edit' where id=current_setting('test.notice_id')::bigint;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Revoked admin update allowed'; end if;
end $$;
reset role;
update public.profiles set role='admin' where id=current_setting('test.notice_admin')::uuid;
set local role authenticated;
do $$
declare affected integer;
begin
  delete from public.notices where id=current_setting('test.notice_id')::bigint;
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'Admin delete failed'; end if;
end $$;
rollback;
select true as notice_security_tests_passed, true as test_rows_rolled_back;
