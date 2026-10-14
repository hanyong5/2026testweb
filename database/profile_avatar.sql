-- Applied as add_profile_avatar_seed. Do not rerun on the migrated project.
alter table public.profiles add column avatar_seed integer not null default 0 constraint profiles_avatar_seed_valid check (avatar_seed >= 0);
comment on column public.profiles.avatar_seed is '브라우저에서 생성하는 캐릭터 아바타의 재현용 정수. 이미지 파일과 외부 URL은 저장하지 않는다.';
grant update (avatar_seed) on table public.profiles to authenticated;
