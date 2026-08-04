import Link from "next/link";
import { getFeaturedProducts, getTopCategories } from "@/lib/queries";
import HeroSketch from "@/components/hero/sketch-hero";
import CategoryTape from "@/components/layout/category-tape";
import ProductCard from "@/components/product/product-card";
import Marquee from "@/components/layout/marquee";
import JoinList from "@/components/layout/join-list";

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getFeaturedProducts(8),
    getTopCategories(),
  ]);
  // eslint-disable-next-line react-hooks/purity -- Server Component, runs once per request, never re-renders on the client
  const now = Date.now();

  return (
    <main>
      {/* Hero */}
      <section className="grid grid-cols-1 border-b-2 border-ink md:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-center border-b-2 border-ink px-4 py-12 sm:px-10 sm:py-16 md:border-b-0 md:border-r-2 md:py-0">
          <div className="mb-5 flex w-fit items-center gap-2 border-2 border-ink bg-acid px-2.5 py-1 font-mono text-[11px] tracking-wide">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-coral" />
            NEW ARRIVALS — SHOP NOW
          </div>
          <h1 className="font-display text-[15vw] uppercase leading-[0.86] sm:text-[64px] md:text-[76px] lg:text-[92px]">
            We're
            <br />
            <span className="text-coral">Up</span>
            <br />
            <span className="text-paper [-webkit-text-stroke:2px_var(--color-ink)]">
              Always
            </span>
          </h1>
          {/* <p className="mt-6 max-w-md text-[15px] text-ink/70 sm:text-base">
            No cap, just fits. We keep the rotation fresh with pieces that hit different.
            Your wardrobe, upgraded.
          </p> */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 border-2 border-ink bg-ink px-6 py-3.5 font-mono text-[13px] font-bold uppercase tracking-wide text-paper transition-transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0_var(--color-coral)]"
            >
              Shop now →
            </Link>
            <Link
              href="/archive"
              className="inline-flex items-center gap-2 border-2 border-ink px-6 py-3.5 font-mono text-[13px] font-bold uppercase tracking-wide transition-transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0_var(--color-ink)]"
            >
              View lookbook
            </Link>
          </div>
        </div>

        <div
          className="relative h-[360px] sm:h-[440px] md:h-auto"
          style={{
            backgroundColor: "#F5F4EF",
            backgroundImage:
              "linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
        >
          <HeroSketch />
          <div className="absolute bottom-4 left-4 border-2 border-ink bg-paper px-2.5 py-1.5 font-mono text-[10px] tracking-wide sm:bottom-6 sm:left-6">
            VERTIKAL ORIGINALS
          </div>
        </div>
      </section>

      <CategoryTape categories={categories} />

      <div className="flex items-baseline justify-between border-b-2 border-ink px-4 py-8 sm:px-10 sm:py-10">
        <h2 className="font-display text-3xl uppercase sm:text-5xl">
          Shop the collection
        </h2>
        <Link
          href="/products"
          className="border-b-2 border-ink pb-0.5 font-mono text-[11px] font-bold sm:text-xs"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-2 border-b-2 border-ink lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} now={now} />
        ))}
      </div>

      <div className="flex flex-col divide-y-2 divide-ink border-b-2 border-ink sm:flex-row sm:divide-x-2 sm:divide-y-0">
        {[
          ["01", "Paystack + bank transfer"],
          ["02", "Dispatch within 48hrs"],
          ["03", "Secure payments"],
          ["04", "Order tracking"],
        ].map(([n, label]) => (
          <div key={n} className="flex-1 px-5 py-5 font-mono text-[12px] tracking-wide sm:px-6">
            <span className="mr-2 font-bold text-coral">{n}</span>
            {label}
          </div>
        ))}
      </div>

      <JoinList />
    </main>
  );
}
