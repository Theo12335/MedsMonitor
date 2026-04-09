-- DoseKoPo Database Schema for Supabase
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text not null,
  role text not null check (role in ('caregiver', 'admin')),
  department text,
  setup_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================
-- PATIENTS TABLE
-- ============================================
create table if not exists public.patients (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  room_number text not null,
  admission_date date not null default current_date,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.patients enable row level security;

create policy "Patients viewable by authenticated users"
  on public.patients for select
  using (auth.role() = 'authenticated');

create policy "Admins can insert patients"
  on public.patients for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admins can update patients"
  on public.patients for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- ============================================
-- MEDICATIONS TABLE
-- ============================================
create table if not exists public.medications (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  dosage text not null,
  description text,
  drawer_location text not null,
  current_stock integer default 0,
  minimum_stock integer default 10,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.medications enable row level security;

create policy "Medications viewable by authenticated users"
  on public.medications for select
  using (auth.role() = 'authenticated');

create policy "Admins can manage medications"
  on public.medications for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- ============================================
-- PATIENT_MEDICATIONS TABLE (prescriptions)
-- ============================================
create table if not exists public.patient_medications (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.patients on delete cascade not null,
  medication_id uuid references public.medications on delete cascade not null,
  dosage text not null,
  frequency text not null,
  scheduled_times text[] not null,
  start_date date not null default current_date,
  end_date date,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.patient_medications enable row level security;

create policy "Patient medications viewable by authenticated users"
  on public.patient_medications for select
  using (auth.role() = 'authenticated');

create policy "Admins can manage patient medications"
  on public.patient_medications for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- ============================================
-- MEDICATION_LOGS TABLE (dispensing history)
-- ============================================
create table if not exists public.medication_logs (
  id uuid default uuid_generate_v4() primary key,
  patient_medication_id uuid references public.patient_medications on delete cascade not null,
  patient_id uuid references public.patients on delete cascade not null,
  caregiver_id uuid references public.profiles on delete set null,
  scheduled_time timestamp with time zone not null,
  actual_time timestamp with time zone,
  status text not null check (status in ('pending', 'taken', 'missed', 'skipped')) default 'pending',
  notes text,
  drawer_opened boolean default false,
  verified_by_weight boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.medication_logs enable row level security;

create policy "Medication logs viewable by authenticated users"
  on public.medication_logs for select
  using (auth.role() = 'authenticated');

create policy "Caregivers can insert medication logs"
  on public.medication_logs for insert
  with check (auth.role() = 'authenticated');

create policy "Caregivers can update medication logs"
  on public.medication_logs for update
  using (auth.role() = 'authenticated');

-- ============================================
-- ATTENDANCE_LOGS TABLE (caregiver attendance)
-- ============================================
create table if not exists public.attendance_logs (
  id uuid default uuid_generate_v4() primary key,
  caregiver_id uuid references public.profiles on delete cascade not null,
  date date not null default current_date,
  time_in timestamp with time zone not null,
  time_out timestamp with time zone,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.attendance_logs enable row level security;

create policy "Attendance logs viewable by authenticated users"
  on public.attendance_logs for select
  using (auth.role() = 'authenticated');

create policy "Caregivers can log their own attendance"
  on public.attendance_logs for insert
  with check (auth.uid() = caregiver_id);

create policy "Caregivers can update their own attendance"
  on public.attendance_logs for update
  using (auth.uid() = caregiver_id);

-- ============================================
-- DRAWERS TABLE (hardware integration)
-- ============================================
create table if not exists public.drawers (
  id uuid default uuid_generate_v4() primary key,
  label text unique not null,
  medication_id uuid references public.medications on delete set null,
  current_weight numeric default 0,
  empty_weight numeric default 0,
  pill_weight numeric default 0,
  estimated_pill_count integer default 0,
  minimum_pill_count integer default 10,
  status text not null check (status in ('idle', 'active', 'open', 'low_stock', 'empty')) default 'idle',
  led_active boolean default false,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.drawers enable row level security;

create policy "Drawers viewable by authenticated users"
  on public.drawers for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can update drawers"
  on public.drawers for update
  using (auth.role() = 'authenticated');

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers to all tables
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger handle_patients_updated_at
  before update on public.patients
  for each row execute function public.handle_updated_at();

create trigger handle_medications_updated_at
  before update on public.medications
  for each row execute function public.handle_updated_at();

create trigger handle_patient_medications_updated_at
  before update on public.patient_medications
  for each row execute function public.handle_updated_at();

create trigger handle_medication_logs_updated_at
  before update on public.medication_logs
  for each row execute function public.handle_updated_at();

create trigger handle_attendance_logs_updated_at
  before update on public.attendance_logs
  for each row execute function public.handle_updated_at();

-- Function to handle new user signup (create profile automatically)
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

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- SEED DATA (optional - for testing)
-- ============================================

-- Insert sample drawers (A1-A4, B1-B4)
insert into public.drawers (label, status) values
  ('A1', 'idle'),
  ('A2', 'idle'),
  ('A3', 'idle'),
  ('A4', 'idle'),
  ('B1', 'idle'),
  ('B2', 'idle'),
  ('B3', 'idle'),
  ('B4', 'idle')
on conflict (label) do nothing;
