"use client";

import { useState } from "react";

export default function JoinList() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section
      id="list"
      className="grid grid-cols-1 border-b-2 border-ink md:grid-cols-2"
    >
      <div className="flex flex-col justify-center border-b-2 border-ink px-4 py-14 sm:px-10 sm:py-20 md:border-b-0 md:border-r-2">
        <h2 className="font-display text-4xl uppercase leading-[0.92] sm:text-6xl">
          Join the list
        </h2>
        <p className="mt-5 max-w-sm text-sm text-ink/70 sm:text-base">
          First access to drops, restocked-never pieces, and the odd discount
          code. No spam — we barely post as it is.
        </p>
        <form
          className="mt-7 flex max-w-md"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          <input
            type="email"
            required
            placeholder="you@email.com"
            className="w-full border-2 border-r-0 border-ink bg-paper px-4 py-3.5 font-mono text-[13px] outline-none"
          />
          <button
            type="submit"
            className="whitespace-nowrap border-2 border-ink bg-ink px-5 font-mono text-[13px] font-bold text-paper transition-colors hover:bg-coral"
          >
            {submitted ? "On the list ✓" : "Sign up"}
          </button>
        </form>
      </div>
      <div
        className="relative min-h-[220px]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, var(--color-ink), var(--color-ink) 2px, var(--color-paper) 2px, var(--color-paper) 16px)",
        }}
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-6 border-[3px] border-ink bg-paper px-6 py-5 text-center sm:px-8 sm:py-6">
          <p className="font-display text-2xl leading-none sm:text-3xl">VERTIKAL originals</p>
          <p className="mt-1.5 font-mono text-[9px] tracking-widest sm:text-[10px]">
            EST. LAGOS · 2024
          </p>
        </div>
      </div>
    </section>
  );
}
