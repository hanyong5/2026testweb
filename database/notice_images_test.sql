-- Run as a database administrator. Test rows roll back; identity sequences may advance.
begin;
select set_config('test.image_admin', gen_random_uuid()::text, true);
insert into auth.users(id) values(current_setting('test.image_admin')::uuid);
insert into public.profiles(id,name,role) values(current_setting('test.image_admin')::uuid,'Image constraint test','admin');
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.image_admin'), true);
do $$
declare notice_id bigint; paths text[];
begin
  paths := array['notices/11111111-1111-4111-8111-111111111111.png','notices/22222222-2222-4222-8222-222222222222.jpg','notices/33333333-3333-4333-8333-333333333333.webp'];
  insert into public.notices(title,body,image_paths) values('Image constraint test','Temporary content',paths) returning id into notice_id;
  if (select image_paths[1] from public.notices where id=notice_id) <> paths[1] then raise exception 'Image order not preserved'; end if;
  begin
    update public.notices set image_paths=paths||array['notices/44444444-4444-4444-8444-444444444444.png'] where id=notice_id;
    raise exception 'Four images allowed';
  exception when check_violation then null;
  end;
  begin
    update public.notices set image_paths=array['https://external.test/image.svg'] where id=notice_id;
    raise exception 'External path allowed';
  exception when check_violation then null;
  end;
  begin
    update public.notices set image_paths=array[null::text] where id=notice_id;
    raise exception 'Null image allowed';
  exception when check_violation then null;
  end;
  update public.notices set image_paths='{}' where id=notice_id;
end $$;
rollback;
select true as image_constraints_passed, true as test_rows_rolled_back;
