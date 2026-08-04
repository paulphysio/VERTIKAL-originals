"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { lowestVariantPrice, productImageUrls } from "@/lib/types";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/lib/store/wishlist";

function formatNaira(amount: number) {
  return `\u20a6${Math.round(amount).toLocaleString("en-NG")}`;
}

export default function ProductCard({
  product,
  now,
}: {
  product: Product;
  /** Reference timestamp (ms) computed once on the server, so this
   * client component never calls Date.now() during render. */
  now: number;
}) {
  const images = productImageUrls(product, 3);
  const [active, setActive] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const wishlistItems = useWishlistStore((state) => state.items);
  const addItem = useWishlistStore((state) => state.addItem);
  const removeItem = useWishlistStore((state) => state.removeItem);

  useEffect(() => {
    setIsWishlisted(wishlistItems.some((item) => item.productId === product.id));
  }, [wishlistItems, product.id]);

  useEffect(() => {
    if (images.length <= 1) return;
    timer.current = setInterval(() => {
      setActive((i) => (i + 1) % images.length);
    }, 2600);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [images.length]);

  const price = lowestVariantPrice(product);
  const wasPrice = product.compare_at_price ?? null;

  // Check if product is out of stock (all variants have stock === 0)
  const isOutOfStock = product.product_variants?.every(
    (v: any) => v.stock === 0
  ) || false;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setHeartAnimating(true);
    setTimeout(() => setHeartAnimating(false), 300);

    if (isWishlisted) {
      removeItem(product.id);
    } else {
      addItem({
        productId: product.id,
        name: product.name,
        price: price,
        image: images[0] || '',
        addedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block border-b-2 border-ink sm:border-r-2 sm:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r-2 lg:[&:nth-child(4n)]:border-r-0"
      onMouseEnter={() => {
        if (timer.current) clearInterval(timer.current);
      }}
      onMouseLeave={() => {
        if (images.length > 1) {
          timer.current = setInterval(() => {
            setActive((i) => (i + 1) % images.length);
          }, 2600);
        }
      }}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-concrete/20">
        {wasPrice && (
          <span
            className="absolute left-2 top-2 z-10 border-2 border-ink bg-coral px-2 py-0.5 font-mono text-[10px] font-bold tracking-wide text-paper"
          >
            SALE
          </span>
        )}

        <button
          onClick={handleWishlistClick}
          className={`absolute right-2 top-2 z-10 p-2 bg-paper border-2 border-ink transition-all ${
            isWishlisted ? 'text-coral border-coral' : 'text-ink'
          } ${heartAnimating ? 'scale-125' : 'scale-100'}`}
        >
          <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {isOutOfStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <img
              src="/sold-out.png"
              alt="Out of Stock"
              className="w-[30%] h-[30%] object-contain"
            />
          </div>
        )}

        {images.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-out ${
              i === active ? "opacity-100" : "opacity-0"
            } group-hover:scale-105 duration-[6000ms]`}
          />
        ))}

        {images.length > 1 && (
          <div className="absolute bottom-2 left-2 z-10 flex gap-1">
            {images.map((_, i) => (
              <span
                key={i}
                className={`block h-1.5 w-1.5 border border-ink ${
                  i === active ? "bg-acid" : "bg-paper/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="px-3 py-3 sm:px-4 sm:py-4">
        <p className="truncate text-sm font-bold sm:text-[15px]">{product.name}</p>
        <p className="mt-0.5 font-mono text-[11px] uppercase text-ink/50">
          {product.category?.name ?? "Shop"}
        </p>
        <div className="mt-2.5 flex items-center justify-between">
          <span className="font-mono text-sm font-bold">
            {wasPrice && (
              <span className="mr-1.5 text-concrete line-through">
                {formatNaira(wasPrice)}
              </span>
            )}
            {formatNaira(price)}
          </span>
          <span className="flex h-7 w-7 items-center justify-center border-2 border-ink text-base transition-transform group-hover:rotate-90 group-hover:bg-ink group-hover:text-paper">
            +
          </span>
        </div>
      </div>
    </Link>
  );
}
