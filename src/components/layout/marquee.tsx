export default function Marquee({
  items,
  variant = "dark",
}: {
  items: string[];
  variant?: "dark" | "acid";
}) {
  const loop = [...items, ...items];
  return (
    <div
      className={`overflow-hidden whitespace-nowrap border-b border-ink py-1 ${
        variant === "dark" ? "bg-ink text-paper" : "bg-acid text-ink"
      }`}
    >
      <div className="inline-flex animate-marquee">
        {loop.map((text, i) => (
          <span
            key={i}
            className="mx-5 font-mono text-[10px] tracking-wide sm:text-[11px]"
          >
            {text} ✦
          </span>
        ))}
      </div>
    </div>
  );
}
