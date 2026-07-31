import Link from "next/link";
import type { Category } from "@/lib/types";

const ACCENTS: Record<number, string> = {
  0: "bg-cobalt text-paper",
  1: "bg-coral text-paper",
  2: "bg-acid text-ink",
  3: "bg-ink text-paper",
};

export default function CategoryTape({ categories }: { categories: Category[] }) {
  return (
    <section className="border-b-2 border-ink py-6 sm:py-9">
      <div className="flex gap-4 overflow-x-auto px-4 sm:gap-5 sm:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((cat, i) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className={`flex h-32 w-52 shrink-0 flex-col justify-between border-2 border-ink p-4 transition-transform hover:-translate-y-1 hover:-rotate-1 sm:h-[150px] sm:w-64 ${ACCENTS[i % 4]}`}
          >
            <span className="font-mono text-[10px] tracking-wide sm:text-[11px]">
              0{i + 1} / SHOP
            </span>
            <span className="font-display text-3xl uppercase leading-none sm:text-4xl">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
