-- =====================================================
-- CLOTHES STORE DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID
create extension if not exists "uuid-ossp";

-- =====================================================
-- PROFILES
-- =====================================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  phone text,
  role text default 'customer' check (role in ('customer', 'admin')),
  loyalty_points integer default 0,
  created_at timestamptz default now()
);

-- =====================================================
-- CATEGORIES
-- =====================================================
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  image_url text,
  parent_id uuid references categories(id)
);

-- =====================================================
-- PRODUCTS
-- =====================================================
create table products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  category_id uuid references categories(id),
  base_price decimal(10,2) not null,
  is_active boolean default true,
  is_featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================================================
-- PRODUCT VARIANTS (size + color + stock)
-- =====================================================
create table product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  size text not null,
  color text not null,
  color_hex text,
  sku text unique,
  price decimal(10,2),
  stock integer not null default 0,
  image_url text
);

-- =====================================================
-- PRODUCT IMAGES
-- =====================================================
create table product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  url text not null,
  alt text,
  is_primary boolean default false,
  sort_order integer default 0
);

-- =====================================================
-- WISHLISTS
-- =====================================================
create table wishlists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  unique(user_id, product_id)
);

-- =====================================================
-- CARTS (guest + logged-in)
-- =====================================================
create table carts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  session_id text,
  created_at timestamptz default now()
);

create table cart_items (
  id uuid primary key default uuid_generate_v4(),
  cart_id uuid references carts(id) on delete cascade,
  variant_id uuid references product_variants(id),
  quantity integer not null check (quantity > 0),
  unique(cart_id, variant_id)
);

-- =====================================================
-- PROMO CODES
-- =====================================================
create table promo_codes (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  type text check (type in ('percentage', 'fixed')),
  value decimal(10,2) not null,
  min_order_amount decimal(10,2) default 0,
  max_uses integer,
  used_count integer default 0,
  expires_at timestamptz,
  is_active boolean default true
);

-- =====================================================
-- ORDERS
-- =====================================================
create table orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text unique not null,
  user_id uuid references profiles(id),
  status text default 'pending' check (status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
  subtotal decimal(10,2),
  discount decimal(10,2) default 0,
  shipping_fee decimal(10,2) default 0,
  total decimal(10,2),
  promo_code_id uuid references promo_codes(id),
  shipping_address jsonb,
  payment_method text,
  payment_status text default 'pending',
  paystack_reference text,
  receipt_url text,
  tracking_number text,
  notes text,
  created_at timestamptz default now()
);

create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  variant_id uuid references product_variants(id),
  product_name text,
  size text,
  color text,
  quantity integer,
  unit_price decimal(10,2),
  total_price decimal(10,2)
);

-- =====================================================
-- REVIEWS (product + delivery)
-- =====================================================
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id),
  product_id uuid references products(id),
  user_id uuid references profiles(id),
  rating integer check (rating between 1 and 5),
  delivery_rating integer check (delivery_rating between 1 and 5),
  comment text,
  images text[],
  is_approved boolean default false,
  created_at timestamptz default now()
);

-- =====================================================
-- SHIPPING ZONES
-- =====================================================
create table shipping_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null default 'Nigeria',
  state text not null,
  lga text,
  city text,
  fee numeric not null default 0,
  delivery_time_min integer not null default 3,
  delivery_time_max integer not null default 5,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
