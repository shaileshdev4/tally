import type { ReactNode } from "react";
import Cover from "@/components/Cover";
import LogoMark from "@/components/LogoMark";

export default function PageHero({
  label,
  title,
  subtitle,
  actions,
  imageSrc,
  coverType,
  coverValue,
  coverSeed = "hero",
  size = "default",
}: {
  label?: string;
  title: ReactNode;
  subtitle?: string;
  actions?: ReactNode;
  imageSrc?: string;
  coverType?: string;
  coverValue?: string | null;
  coverSeed?: string;
  size?: "default" | "compact";
}) {
  const height =
    size === "compact"
      ? "min-h-[200px] sm:min-h-[220px]"
      : "min-h-[280px] sm:min-h-[320px]";

  return (
    <section
      className={`hero-scene relative mb-10 overflow-hidden rounded-3xl ${height}`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0">
        {imageSrc ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt=""
              className="h-full w-full scale-110 object-cover blur-[2px] brightness-[0.45] saturate-[1.15]"
            />
          </>
        ) : coverType ? (
          <Cover
            type={coverType}
            value={coverValue ?? null}
            seed={coverSeed}
            className="h-full w-full scale-110 object-cover brightness-[0.5]"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-surface2 via-canvas to-surface" />
        )}
      </div>

      {/* Scrim - no stacked dot/grid patterns */}
      <div className="hero-scrim absolute inset-0" />

      {/* Content */}
      <div className="relative flex h-full min-h-[inherit] flex-col justify-end p-6 sm:p-10">
        {label && (
          <div className="section-label mb-3 flex items-center gap-2 text-ink/90">
            <LogoMark
              size={16}
              className="shadow-[0_0_12px_-2px_rgba(255,107,53,0.5)]"
            />
            {label}
          </div>
        )}
        <h1 className="font-display text-3xl font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.25rem]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink/75 sm:text-lg">
            {subtitle}
          </p>
        )}
        {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
      </div>
    </section>
  );
}
