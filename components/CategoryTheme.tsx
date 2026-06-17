"use client";

import { useEffect } from "react";
import { CATEGORY_ACCENT, isCategory, type Category } from "@/lib/categories";

export default function CategoryTheme({
  category,
  children,
  className = "",
}: {
  category: Category;
  children: React.ReactNode;
  className?: string;
}) {
  const a = CATEGORY_ACCENT[isCategory(category) ? category : "custom"];

  useEffect(() => {
    const root = document.documentElement;
    const prev = {
      accent: root.style.getPropertyValue("--accent"),
      soft: root.style.getPropertyValue("--accent-soft"),
      ring: root.style.getPropertyValue("--accent-ring"),
    };
    root.style.setProperty("--accent", a.accent);
    root.style.setProperty("--accent-soft", a.soft);
    root.style.setProperty("--accent-ring", a.ring);
    return () => {
      if (prev.accent) root.style.setProperty("--accent", prev.accent);
      else root.style.removeProperty("--accent");
      if (prev.soft) root.style.setProperty("--accent-soft", prev.soft);
      else root.style.removeProperty("--accent-soft");
      if (prev.ring) root.style.setProperty("--accent-ring", prev.ring);
      else root.style.removeProperty("--accent-ring");
    };
  }, [a.accent, a.soft, a.ring]);

  return (
    <div
      className={className}
      style={{
        ["--accent" as string]: a.accent,
        ["--accent-soft" as string]: a.soft,
        ["--accent-ring" as string]: a.ring,
      }}
    >
      {children}
    </div>
  );
}
