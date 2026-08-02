import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="flex flex-col items-start gap-4 px-4 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-10">
      <span className="font-mono text-[11px] text-ink/50">
        © 2026 VERTIKAL originals. ALL RIGHTS RESERVED.
      </span>
      <ul className="flex flex-wrap gap-5">
        {[
          { label: "Shipping", href: "/shipping" },
          { label: "Returns", href: "/returns" },
          { label: "Contact", href: "/contact" },
          { label: "Instagram", href: "https://instagram.com", external: true },
        ].map((l) => (
          <li key={l.label}>
            {l.external ? (
              <a 
                href={l.href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[12px] font-bold uppercase"
              >
                {l.label}
              </a>
            ) : (
              <Link href={l.href} className="text-[12px] font-bold uppercase">
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </footer>
  );
}
