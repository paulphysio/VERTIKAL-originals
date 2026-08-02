import Link from "next/link";
import { getFeaturedProducts } from "@/lib/queries";
import ProductCard from "@/components/product/product-card";

export default async function ArchivePage() {
  const products = await getFeaturedProducts(50);
  const now = Date.now();

  return (
    <main className="min-h-screen">
      <div className="border-b-2 border-ink px-4 py-8 sm:px-10 sm:py-12">
        <h1 className="font-display text-4xl uppercase sm:text-6xl">
          ARCHIVE
        </h1>
        <p className="mt-4 max-w-md font-mono text-sm text-ink/70">
          Past collections and sold-out pieces. A look back at what we've done.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <p className="font-mono text-sm text-ink/50">ARCHIVE EMPTY</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 border-b-2 border-ink lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} now={now} />
          ))}
        </div>
      )}

      <div className="px-4 py-12 sm:px-10">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 border-2 border-ink px-6 py-3.5 font-mono text-[13px] font-bold uppercase tracking-wide transition-transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0_var(--color-coral)]"
        >
          ← Back to Shop
        </Link>
      </div>
    </main>
  );
}
