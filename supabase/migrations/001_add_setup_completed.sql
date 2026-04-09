-- Migration: Add setup_completed column to profiles
-- Run this if you already have the profiles table created

-- Add the setup_completed column
alter table public.profiles
add column if not exists setup_completed boolean default false;

-- Update the trigger function to include setup_completed
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role, setup_completed)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', 'New User'),
    coalesce(new.raw_user_meta_data->>'role', 'caregiver'),
    false
  );
  return new;
end;
$$ language plpgsql security definer;
