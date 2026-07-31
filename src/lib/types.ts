export type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  parent_id: string | null;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  alt: string | null;
  is_primary: boolean;
  sort_order: number;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  size: string;
  color: string;
  color_hex: string | null;
  sku: string | null;
  price: number | null;
  stock: number;
  image_url: string | null;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  base_price: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  category?: Pick<Category, "id" | "name" | "slug"> | null;
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
  compare_at_price?: number | null;
};

export function productImageUrls(product: Product, max = 3): string[] {
  const sorted = [...(product.product_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const urls = sorted.map((img) => img.url);
  if (urls.length > 0) return urls.slice(0, max);
  const variantImg = product.product_variants?.find((v) => v.image_url)?.image_url;
  return variantImg ? [variantImg] : ["/placeholder-product.jpg"];
}

export function lowestVariantPrice(product: Product): number {
  const variantPrices = (product.product_variants ?? [])
    .map((v) => v.price)
    .filter((p): p is number => typeof p === "number");
  if (variantPrices.length === 0) return product.base_price;
  return Math.min(product.base_price, ...variantPrices);
}
