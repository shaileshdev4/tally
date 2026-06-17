import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tally.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/create`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/categories`, changeFrequency: "monthly", priority: 0.85 },
    { url: `${SITE}/profile`, changeFrequency: "weekly", priority: 0.75 },
    { url: `${SITE}/profile/challenges`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE}/profile/history`, changeFrequency: "weekly", priority: 0.65 },
    { url: `${SITE}/profile/settings`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
