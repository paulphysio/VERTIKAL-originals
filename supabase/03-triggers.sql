-- =====================================================
-- DATABASE TRIGGERS
-- Run this after creating tables and RLS policies
-- =====================================================

-- =====================================================
-- 1. AUTO-CREATE PROFILE ON SIGNUP
-- =====================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================
-- 2. DECREASE STOCK ON ORDER CONFIRMATION
-- =====================================================
create or replace function public.decrease_stock_on_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'confirmed' and old.status = 'pending' then
    update public.product_variants
    set stock = stock - oi.quantity
    from public.order_items oi
    where oi.order_id = new.id
      and oi.variant_id = product_variants.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_order_status_change on public.orders;

create trigger on_order_status_change
  after update of status on public.orders
  for each row execute procedure public.decrease_stock_on_order();

-- =====================================================
-- 3. UPDATE LOYALTY POINTS ON DELIVERED ORDER
-- =====================================================
create or replace function public.update_loyalty_points()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  points_to_add integer;
begin
  if new.status = 'delivered' and old.status != 'delivered' then
    -- 1 point per $10 spent (rounded down)
    points_to_add := floor(new.total / 10);
    
    update public.profiles
    set loyalty_points = loyalty_points + points_to_add
    where id = new.user_id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_order_delivered on public.orders;

create trigger on_order_delivered
  after update of status on public.orders
  for each row execute procedure public.update_loyalty_points();

-- =====================================================
-- 4. UPDATE PROMO CODE USAGE
-- =====================================================
create or replace function public.update_promo_usage()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.promo_code_id is not null and (old.promo_code_id is null or old.promo_code_id != new.promo_code_id) then
    update public.promo_codes
    set used_count = used_count + 1
    where id = new.promo_code_id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_order_promo_used on public.orders;

create trigger on_order_promo_used
  after insert or update of promo_code_id on public.orders
  for each row execute procedure public.update_promo_usage();

-- =====================================================
-- 5. UPDATE PRODUCT TIMESTAMP
-- =====================================================
create or replace function public.update_product_timestamp()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_product_update on public.products;

create trigger on_product_update
  before update on public.products
  for each row execute procedure public.update_product_timestamp();

-- =====================================================
-- 6. GENERATE ORDER NUMBER
-- =====================================================
create or replace function public.generate_order_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.order_number is null then
    new.order_number := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || lpad((random() * 10000)::int::text, 4, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists on_order_create on public.orders;

create trigger on_order_create
  before insert on public.orders
  for each row execute procedure public.generate_order_number();
