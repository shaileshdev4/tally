import Link from "next/link";
import LogoMark from "@/components/LogoMark";

const wordmarkClass = {
  sm: "text-base font-semibold",
  md: "text-lg font-bold",
  lg: "text-3xl font-bold",
} as const;

export default function Logo({
  size = 32,
  showWordmark = true,
  wordmarkSize = "md",
  href,
  className = "",
  markClassName = "",
  orientation = "horizontal",
}: {
  size?: number;
  showWordmark?: boolean;
  wordmarkSize?: keyof typeof wordmarkClass;
  href?: string;
  className?: string;
  markClassName?: string;
  orientation?: "horizontal" | "stacked";
}) {
  const stacked = orientation === "stacked";

  const content = (
    <span
      className={`group inline-flex ${
        stacked ? "flex-col items-center gap-3" : "items-center gap-2.5"
      } ${className}`}
    >
      <LogoMark
        size={size}
        className={`shrink-0 shadow-[0_0_20px_-4px_rgba(255,107,53,0.45)] transition group-hover:scale-105 ${markClassName}`}
      />
      {showWordmark && (
        <span
          className={`font-display tracking-tight text-ink transition group-hover:text-accent ${wordmarkClass[wordmarkSize]}`}
        >
          Tally
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
        {content}
      </Link>
    );
  }

  return content;
}
