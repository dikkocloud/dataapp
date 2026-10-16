create table plans (
  id uuid primary key default gen_random_uuid(),
  network text not null,
  name text not null,
  price_minor integer not null,
  supplier_code text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  plan_id uuid not null references plans(id),
  phone text not null,
  email text not null,
  amount_minor integer not null,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'delivered', 'failed')),
  supplier_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table plans enable row level security;
alter table orders enable row level security;

create policy "public can read active plans" on plans
  for select using (active = true);

insert into plans (network, name, price_minor, supplier_code) values
  ('MTN', '1GB, 7 days', 30000, 'MTN_1GB_7D'),
  ('MTN', '2GB, 30 days', 60000, 'MTN_2GB_30D'),
  ('Airtel', '1.5GB, 30 days', 50000, 'AIRTEL_1_5GB_30D');
