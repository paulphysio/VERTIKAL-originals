import { createClient } from "@/lib/supabase/server";
import type { Category, Product } from "@/lib/types";

const PRODUCT_SELECT = `
  id, name, slug, description, category_id, base_price,
  is_active, is_featured, created_at,
  category:categories ( id, name, slug ),
  product_images ( id, product_id, url, alt, is_primary, sort_order ),
  product_variants ( id, product_id, size, color, color_hex, sku, price, stock, image_url )
`;

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }
  
  if (!data || data.length === 0) {
    console.log("No products found");
    return [];
  }
  
  console.log("Fetched products:", data.length);
  console.log("First product images:", data[0]?.product_images);
  return data as unknown as Product[];
}

export async function getTopCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, image_url, parent_id")
    .is("parent_id", null)
    .order("name");

  if (error || !data || data.length === 0) {
    return DEMO_CATEGORIES;
  }
  return data as Category[];
}

// Fallback content so the homepage renders something real while the
// catalog is still empty in Supabase — swap out once products exist.
const DEMO_CATEGORIES: Category[] = [
  { id: "c1", name: "Men", slug: "men", image_url: null, parent_id: null },
  { id: "c2", name: "Women", slug: "women", image_url: null, parent_id: null },
  { id: "c3", name: "Accessories", slug: "accessories", image_url: null, parent_id: null },
  { id: "c4", name: "Archive", slug: "archive", image_url: null, parent_id: null },
];

const img = (seed: number) =>
  `https://loremflickr.com/600/800/streetwear,fashion/all?lock=${seed}`;

export const DEMO_PRODUCTS: Product[] = [
  {
    id: "p1", name: "Cracked Vinyl Hoodie", slug: "cracked-vinyl-hoodie",
    description: null, category_id: "c1", base_price: 24500,
    is_active: true, is_featured: true, created_at: new Date().toISOString(),
    category: { id: "c1", name: "Men", slug: "men" },
    product_images: [
      { id: "i1", product_id: "p1", url: img(101), alt: "Cracked Vinyl Hoodie", is_primary: true, sort_order: 0 },
      { id: "i2", product_id: "p1", url: img(102), alt: "Cracked Vinyl Hoodie back", is_primary: false, sort_order: 1 },
      { id: "i3", product_id: "p1", url: img(103), alt: "Cracked Vinyl Hoodie worn", is_primary: false, sort_order: 2 },
    ],
    product_variants: [],
  },
  {
    id: "p2", name: "Frayed Cargo Pant", slug: "frayed-cargo-pant",
    description: null, category_id: "c1", base_price: 31000, compare_at_price: 39000,
    is_active: true, is_featured: true, created_at: new Date().toISOString(),
    category: { id: "c1", name: "Men", slug: "men" },
    product_images: [
      { id: "i4", product_id: "p2", url: img(104), alt: "Frayed Cargo Pant", is_primary: true, sort_order: 0 },
      { id: "i5", product_id: "p2", url: img(105), alt: "Frayed Cargo Pant detail", is_primary: false, sort_order: 1 },
    ],
    product_variants: [],
  },
  {
    id: "p3", name: "Bleached Denim Jacket", slug: "bleached-denim-jacket",
    description: null, category_id: "c2", base_price: 42000,
    is_active: true, is_featured: true, created_at: new Date().toISOString(),
    category: { id: "c2", name: "Women", slug: "women" },
    product_images: [
      { id: "i6", product_id: "p3", url: img(106), alt: "Bleached Denim Jacket", is_primary: true, sort_order: 0 },
      { id: "i7", product_id: "p3", url: img(107), alt: "Bleached Denim Jacket styled", is_primary: false, sort_order: 1 },
      { id: "i8", product_id: "p3", url: img(108), alt: "Bleached Denim Jacket worn", is_primary: false, sort_order: 2 },
    ],
    product_variants: [],
  },
  {
    id: "p4", name: "Off-Register Tee", slug: "off-register-tee",
    description: null, category_id: "c1", base_price: 12500,
    is_active: true, is_featured: true, created_at: new Date().toISOString(),
    category: { id: "c1", name: "Men", slug: "men" },
    product_images: [
      { id: "i9", product_id: "p4", url: img(109), alt: "Off-Register Tee", is_primary: true, sort_order: 0 },
      { id: "i10", product_id: "p4", url: img(110), alt: "Off-Register Tee detail", is_primary: false, sort_order: 1 },
    ],
    product_variants: [],
  },
  {
    id: "p5", name: "Static Slip Dress", slug: "static-slip-dress",
    description: null, category_id: "c2", base_price: 36500, compare_at_price: 45000,
    is_active: true, is_featured: true, created_at: new Date().toISOString(),
    category: { id: "c2", name: "Women", slug: "women" },
    product_images: [
      { id: "i11", product_id: "p5", url: img(111), alt: "Static Slip Dress", is_primary: true, sort_order: 0 },
      { id: "i12", product_id: "p5", url: img(112), alt: "Static Slip Dress styled", is_primary: false, sort_order: 1 },
    ],
    product_variants: [],
  },
  {
    id: "p6", name: "Runoff Puffer Vest", slug: "runoff-puffer-vest",
    description: null, category_id: "c1", base_price: 29500,
    is_active: true, is_featured: true, created_at: new Date().toISOString(),
    category: { id: "c1", name: "Men", slug: "men" },
    product_images: [
      { id: "i13", product_id: "p6", url: img(113), alt: "Runoff Puffer Vest", is_primary: true, sort_order: 0 },
      { id: "i14", product_id: "p6", url: img(114), alt: "Runoff Puffer Vest styled", is_primary: false, sort_order: 1 },
    ],
    product_variants: [],
  },
  {
    id: "p7", name: "Scrap Metal Chain", slug: "scrap-metal-chain",
    description: null, category_id: "c3", base_price: 8500,
    is_active: true, is_featured: true, created_at: new Date().toISOString(),
    category: { id: "c3", name: "Accessories", slug: "accessories" },
    product_images: [
      { id: "i15", product_id: "p7", url: img(115), alt: "Scrap Metal Chain", is_primary: true, sort_order: 0 },
      { id: "i16", product_id: "p7", url: img(116), alt: "Scrap Metal Chain worn", is_primary: false, sort_order: 1 },
    ],
    product_variants: [],
  },
  {
    id: "p8", name: "Salvage Bucket Hat", slug: "salvage-bucket-hat",
    description: null, category_id: "c3", base_price: 9500,
    is_active: true, is_featured: true, created_at: new Date().toISOString(),
    category: { id: "c3", name: "Accessories", slug: "accessories" },
    product_images: [
      { id: "i17", product_id: "p8", url: img(117), alt: "Salvage Bucket Hat", is_primary: true, sort_order: 0 },
      { id: "i18", product_id: "p8", url: img(118), alt: "Salvage Bucket Hat styled", is_primary: false, sort_order: 1 },
    ],
    product_variants: [],
  },
];
