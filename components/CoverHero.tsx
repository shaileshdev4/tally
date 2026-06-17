"use client";

import Cover from "@/components/Cover";

export default function CoverHero({
  type,
  value,
  seed,
  title,
  subtitle,
  badge,
}: {
  type: string;
  value: string | null;
  seed: string;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
}) {
  return (
    <section className="hero-scene relative h-44 w-full overflow-hidden rounded-3xl sm:h-52">
      <div className="absolute inset-0">
        <Cover type={type} value={value} seed={seed} className="h-full w-full scale-110 object-cover" />
      </div>
      <div className="hero-scrim absolute inset-0" />
      {badge && <div className="absolute right-4 top-4 z-10">{badge}</div>}
      <div className="relative flex h-full flex-col justify-end p-5 sm:p-7">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
        {subtitle && (
          <p className="text-meta mt-1.5 text-ink/70 sm:text-sm">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
