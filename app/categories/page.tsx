import Link from "next/link";
import { HiArrowRight } from "react-icons/hi2";
import Cover from "@/components/Cover";
import PageHero from "@/components/PageHero";
import CategoryTheme from "@/components/CategoryTheme";
import { CATEGORIES, CATEGORY_ACCENT, categoryCover } from "@/lib/categories";
import { defaultTemplateFor } from "@/lib/templates";
import { PAGE_HERO_IMAGES } from "@/lib/hero-images";

export const metadata = {
  title: "All categories - Tally",
  description:
    "Browse every challenge category - reading, fitness, learning, wellness, and more.",
};

export default function CategoriesPage() {
  return (
    <main className="page-shell relative px-5 py-8 sm:py-12">
      <PageHero
        imageSrc={PAGE_HERO_IMAGES.categories}
        size="compact"
        label="12 ways to compete"
        title="Pick your category"
        subtitle="Reading, fitness, and habits are the classics - but there's a whole shelf of goals. Choose one and we'll set the right units and templates."
        actions={
          <Link href="/create" className="btn-secondary">
            Or describe it in one line
            <HiArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c) => {
          const tpl = defaultTemplateFor(c.id);
          const cover = categoryCover(c.id);
          const a = CATEGORY_ACCENT[c.id];
          return (
            <CategoryTheme key={c.id} category={c.id}>
              <Link
                href={`/create?category=${c.id}${tpl ? `&template=${tpl.id}` : ""}`}
                className="card-featured group block"
              >
                <div className="relative h-32 w-full overflow-hidden">
                  <Cover
                    type={cover.type}
                    value={cover.value}
                    seed={c.id}
                    gradientFallback={c.gradient}
                    className="h-full w-full transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-canvas/95 via-transparent to-transparent" />
                </div>
                <div className="relative p-4">
                  <div
                    className="text-title text-lg"
                    style={{ color: a.accent }}
                  >
                    {c.label}
                  </div>
                  <div className="text-meta mt-1 normal-case tracking-normal">
                    {c.blurb}
                  </div>
                </div>
              </Link>
            </CategoryTheme>
          );
        })}
      </div>
    </main>
  );
}
