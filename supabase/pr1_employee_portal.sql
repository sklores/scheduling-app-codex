-- PR1: Employee portal schema + safety RLS

alter table public.employees
  add column if not exists employee_code text unique,
  add column if not exists is_active boolean default true;

create index if not exists idx_employees_employee_code
  on public.employees (employee_code);

-- Keep RLS enabled as a safety guard.
alter table public.employees enable row level security;

-- Safety: anon should not read employees rows directly.
-- Manager/privileged access should remain controlled by existing authenticated/service-role paths.
drop policy if exists "employees_anon_no_select" on public.employees;
create policy "employees_anon_no_select"
on public.employees
for select
to anon
using (false);
