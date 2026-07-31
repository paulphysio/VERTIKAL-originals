-- =====================================================
-- RLS POLICIES FOR CLOTHES STORE
-- Run this after creating the tables
-- =====================================================

-- =====================================================
-- 1. HELPER FUNCTION
-- =====================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- =====================================================
-- 2. PROFILES
-- =====================================================
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Admins can do everything on profiles"
  on public.profiles for all
  using (is_admin())
  with check (is_admin());

-- =====================================================
-- 3. CATEGORIES
-- =====================================================
alter table public.categories enable row level security;

create policy "Categories are viewable by everyone"
  on public.categories for select
  using (true);

create policy "Only admins can manage categories"
  on public.categories for all
  using (is_admin())
  with check (is_admin());

-- =====================================================
-- 4. PRODUCTS
-- =====================================================
alter table public.products enable row level security;

create policy "Active products are viewable by everyone"
  on public.products for select
  using (is_active = true or is_admin());

create policy "Only admins can manage products"
  on public.products for all
  using (is_admin())
  with check (is_admin());

-- =====================================================
-- 5. PRODUCT VARIANTS
-- =====================================================
alter table public.product_variants enable row level security;

create policy "Variants are viewable by everyone"
  on public.product_variants for select
  using (true);

create policy "Only admins can manage variants"
  on public.product_variants for all
  using (is_admin())
  with check (is_admin());

-- =====================================================
-- 6. PRODUCT IMAGES
-- =====================================================
alter table public.product_images enable row level security;

create policy "Product images are viewable by everyone"
  on public.product_images for select
  using (true);

create policy "Only admins can manage product images"
  on public.product_images for all
  using (is_admin())
  with check (is_admin());

-- =====================================================
-- 7. WISHLISTS
-- =====================================================
alter table public.wishlists enable row level security;

create policy "Users can view their own wishlist"
  on public.wishlists for select
  using (auth.uid() = user_id);

create policy "Users can insert into their own wishlist"
  on public.wishlists for insert
  with check (auth.uid() = user_id);

create policy "Users can delete from their own wishlist"
  on public.wishlists for delete
  using (auth.uid() = user_id);

create policy "Admins can manage all wishlists"
  on public.wishlists for all
  using (is_admin())
  with check (is_admin());

-- =====================================================
-- 8. CARTS
-- =====================================================
alter table public.carts enable row level security;

create policy "Users can view their own cart"
  on public.carts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own cart"
  on public.carts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own cart"
  on public.carts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own cart"
  on public.carts for delete
  using (auth.uid() = user_id);

create policy "Admins can manage all carts"
  on public.carts for all
  using (is_admin())
  with check (is_admin());

-- =====================================================
-- 9. CART ITEMS
-- =====================================================
alter table public.cart_items enable row level security;

create policy "Users can view items in their own cart"
  on public.cart_items for select
  using (
    exists (
      select 1 from public.carts
      where carts.id = cart_items.cart_id
        and carts.user_id = auth.uid()
    )
  );

create policy "Users can insert items into their own cart"
  on public.cart_items for insert
  with check (
    exists (
      select 1 from public.carts
      where carts.id = cart_items.cart_id
        and carts.user_id = auth.uid()
    )
  );

create policy "Users can update items in their own cart"
  on public.cart_items for update
  using (
    exists (
      select 1 from public.carts
      where carts.id = cart_items.cart_id
        and carts.user_id = auth.uid()
    )
  );

create policy "Users can delete items from their own cart"
  on public.cart_items for delete
  using (
    exists (
      select 1 from public.carts
      where carts.id = cart_items.cart_id
        and carts.user_id = auth.uid()
    )
  );

create policy "Admins can manage all cart items"
  on public.cart_items for all
  using (is_admin())
  with check (is_admin());

-- =====================================================
-- 10. PROMO CODES
-- =====================================================
alter table public.promo_codes enable row level security;

create policy "Active promo codes are viewable by everyone"
  on public.promo_codes for select
  using (is_active = true or is_admin());

create policy "Only admins can manage promo codes"
  on public.promo_codes for all
  using (is_admin())
  with check (is_admin());

-- =====================================================
-- 11. ORDERS
-- =====================================================
alter table public.orders enable row level security;

create policy "Users can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id or is_admin());

create policy "Users can create their own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own pending orders (limited)"
  on public.orders for update
  using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id);

create policy "Admins can do everything on orders"
  on public.orders for all
  using (is_admin())
  with check (is_admin());

-- =====================================================
-- 12. ORDER ITEMS
-- =====================================================
alter table public.order_items enable row level security;

create policy "Users can view items of their own orders"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and (orders.user_id = auth.uid() or is_admin())
    )
  );

create policy "Users can insert items into their own orders"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

create policy "Admins can manage all order items"
  on public.order_items for all
  using (is_admin())
  with check (is_admin());

-- =====================================================
-- 13. REVIEWS
-- =====================================================
alter table public.reviews enable row level security;

create policy "Approved reviews are viewable by everyone"
  on public.reviews for select
  using (is_approved = true or auth.uid() = user_id or is_admin());

create policy "Users can create reviews for their own orders"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own reviews"
  on public.reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own reviews"
  on public.reviews for delete
  using (auth.uid() = user_id);

create policy "Admins can manage all reviews"
  on public.reviews for all
  using (is_admin())
  with check (is_admin());

-- =====================================================
-- 14. SHIPPING ZONES
-- =====================================================
alter table public.shipping_zones enable row level security;

create policy "Shipping zones are viewable by everyone"
  on public.shipping_zones for select
  using (true);

create policy "Only admins can manage shipping zones"
  on public.shipping_zones for all
  using (is_admin())
  with check (is_admin());
