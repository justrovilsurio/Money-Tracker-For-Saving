-- Keep one application profile for every Supabase Auth user.
-- SECURITY DEFINER lets the trigger insert into profiles while preserving the
-- table's RLS rules for normal authenticated requests.
create function public.handle_new_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_auth_user_profile() from public, anon, authenticated;

create trigger create_profile_after_auth_user_insert
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user_profile();

-- Repair accounts created before this trigger was installed.
insert into public.profiles (id)
select id
from auth.users
on conflict (id) do nothing;
