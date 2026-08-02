"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { createClient } from "@/lib/supabase/client";

export default function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const cartItemCount = useCartStore((state) => state.getItemCount());
  const fetchCart = useCartStore((state) => state.fetchCart);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    fetchCart();
    checkUserRole();
  }, [fetchCart]);

  const checkUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      setUserRole(profile?.role || null);
    }
  };

  const navLinks = [
    { label: "New in", href: "/products?sort=new" },
    { label: "Shop", href: "/products" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Archive", href: "/archive" },
  ];

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b-2 border-ink bg-paper px-4 py-4 sm:px-10 sm:py-5">
      <Link href="/" className="font-display text-xl tracking-tight sm:text-2xl">
        VERTIKAL originals
      </Link>

      {/* Desktop Navigation */}
      <ul className="hidden gap-8 md:flex">
        {navLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group relative text-[13px] font-bold uppercase tracking-wide"
            >
              {link.label}
              <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-coral transition-all duration-200 group-hover:w-full" />
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-4 text-[12px] font-bold sm:gap-5 sm:text-[13px]">
        <Link href="/search" className="hidden sm:inline">Search</Link>
        {userRole === 'admin' && <Link href="/admin" className="hidden sm:inline">Admin</Link>}
        <Link href="/account" className="hidden sm:inline">Account</Link>
        <Link href="/cart" className="flex items-center gap-1.5">
          Bag
          <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-ink bg-acid font-mono text-[10px]">
            {mounted ? cartItemCount : 0}
          </span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-paper border-b-2 border-ink md:hidden">
          <ul className="flex flex-col">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-4 border-b border-ink/10 text-[13px] font-bold uppercase tracking-wide hover:bg-ink/5"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-4 border-b border-ink/10 text-[13px] font-bold uppercase tracking-wide hover:bg-ink/5"
              >
                Search
              </Link>
            </li>
            {userRole === 'admin' && (
              <li>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-4 border-b border-ink/10 text-[13px] font-bold uppercase tracking-wide hover:bg-ink/5"
                >
                  Admin
                </Link>
              </li>
            )}
            <li>
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-4 text-[13px] font-bold uppercase tracking-wide hover:bg-ink/5"
              >
                Account
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
