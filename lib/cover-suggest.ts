import type { Category } from "@/lib/categories";
import { categoryMeta } from "@/lib/categories";

const KEYWORD_PHOTOS: Record<string, string[]> = {
  "marathon running road": ["photo-1571008887538-b36bb32f4571", "photo-1476480862126-209bfaa8edc4"],
  "trail running forest": ["photo-1452626038306-9d8edf1c2e45", "photo-1571008887538-b36bb32f4571"],
  "gym weights training": ["photo-1534438327276-14e5300c3a48", "photo-1517836357463-d25dfeac3438"],
  "fitness workout running": ["photo-1571008887538-b36bb32f4571", "photo-1534438327276-14e5300c3a48"],
  "books library reading": ["photo-1495446815901-a7297e633e8d", "photo-1481627834876-b7833e8f5570"],
  "open book cozy": ["photo-1512820790801-4159f42d9365", "photo-1495446815901-a7297e633e8d"],
  "meditation peaceful": ["photo-1506126613408-eca07ce68773", "photo-1544367567-0f2fcb009e0b"],
  "meditation morning calm": ["photo-1506126613408-eca07ce68773", "photo-1545389336-cf090694435e"],
  "coding laptop algorithms": ["photo-1516321318423-f06f85e504b3", "photo-1522071820081-009f0129c71c"],
  "laptop study coding": ["photo-1516321318423-f06f85e504b3", "photo-1522071820081-009f0129c71c"],
  "students studying campus": ["photo-1524178232363-1fb2b075b655", "photo-1434030216411-0b793f4b4173"],
  "nature wellness health": ["photo-1506126613408-eca07ce68773", "photo-1544367567-0f2fcb009e0b"],
  "art studio creative": ["photo-1513542789411-b6a5d4f31634", "photo-1513364776144-60967b0f800f"],
  "painting art studio": ["photo-1513542789411-b6a5d4f31634", "photo-1513364776144-60967b0f800f"],
  "office teamwork laptop": ["photo-1522071820081-009f0129c71c", "photo-1552664730-d307ca884978"],
  "savings money goals": ["photo-1554224155-6726b3ff858f", "photo-1559526324-4b87b5e36e44"],
  "piggy bank savings": ["photo-1554224155-6726b3ff858f", "photo-1554224154-26032ffc0d07"],
  "friends coffee meetup": ["photo-1529156069898-49953e39b3ac", "photo-1517245386807-bb43f82c33c4"],
  "friends coffee shop": ["photo-1529156069898-49953e39b3ac", "photo-1517245386807-bb43f82c33c4"],
  "healthy food cooking": ["photo-1490645935967-10de6ba17061", "photo-1504674900247-0877df9cc836"],
  "cooking kitchen healthy": ["photo-1490645935967-10de6ba17061", "photo-1504674900247-0877df9cc836"],
  "gaming setup neon": ["photo-1542751371-adc38448a05e", "photo-1511512578047-dfb367046420"],
  "gaming esports controller": ["photo-1542751371-adc38448a05e", "photo-1511512578047-dfb367046420"],
  "team goals motivation": ["photo-1522071820081-009f0129c71c", "photo-1552664730-d307ca884978"],
  "yoga studio mat": ["photo-1544367567-0f2fcb009e0b", "photo-1506126613408-eca07ce68773"],
};

const CATEGORY_FALLBACK_POOL: Record<Category, string[]> = {
  reading: ["photo-1495446815901-a7297e633e8d", "photo-1481627834876-b7833e8f5570"],
  fitness: ["photo-1571008887538-b36bb32f4571", "photo-1534438327276-14e5300c3a48"],
  habits: ["photo-1506126613408-eca07ce68773", "photo-1544367567-0f2fcb009e0b"],
  learning: ["photo-1516321318423-f06f85e504b3", "photo-1524178232363-1fb2b075b655"],
  wellness: ["photo-1544367567-0f2fcb009e0b", "photo-1506126613408-eca07ce68773"],
  creative: ["photo-1513542789411-b6a5d4f31634", "photo-1513364776144-60967b0f800f"],
  work: ["photo-1522071820081-009f0129c71c", "photo-1552664730-d307ca884978"],
  finance: ["photo-1554224155-6726b3ff858f", "photo-1559526324-4b87b5e36e44"],
  social: ["photo-1529156069898-49953e39b3ac", "photo-1517245386807-bb43f82c33c4"],
  food: ["photo-1490645935967-10de6ba17061", "photo-1504674900247-0877df9cc836"],
  gaming: ["photo-1542751371-adc38448a05e", "photo-1511512578047-dfb367046420"],
  custom: ["photo-1522071820081-009f0129c71c", "photo-1552664730-d307ca884978"],
};

export function unsplashUrl(photoId: string, w = 800) {
  return `https://images.unsplash.com/${photoId}?w=${w}&q=80&auto=format&fit=crop`;
}

function normalizeKeywords(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 3)
    .join(" ");
}

function curatedIdsForKeywords(keywords: string, category: Category): string[] {
  const k = normalizeKeywords(keywords);
  if (KEYWORD_PHOTOS[k]) return KEYWORD_PHOTOS[k];

  for (const [phrase, ids] of Object.entries(KEYWORD_PHOTOS)) {
    const words = k.split(" ");
    if (words.length >= 2 && words.every((w) => phrase.includes(w))) return ids;
  }

  return CATEGORY_FALLBACK_POOL[category] ?? CATEGORY_FALLBACK_POOL.custom;
}

export async function suggestCoverUrls(
  category: Category,
  imageKeywords: string,
  count = 4
): Promise<string[]> {
  const keywords =
    normalizeKeywords(imageKeywords) || categoryMeta(category).defaultImageKeywords;
  const key = process.env.UNSPLASH_ACCESS_KEY;

  if (key) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keywords)}&per_page=${count}&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${key}` }, next: { revalidate: 3600 } }
      );
      if (res.ok) {
        const data = await res.json();
        const urls = (data.results ?? [])
          .map((r: { urls?: { regular?: string } }) => r.urls?.regular)
          .filter(Boolean) as string[];
        if (urls.length) return urls.slice(0, count);
      }
    } catch {
      /* fall through */
    }
  }

  const ids = curatedIdsForKeywords(keywords, category);
  const seed = keywords.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const rotated = [...ids.slice(seed % ids.length), ...ids.slice(0, seed % ids.length)];
  const extra = CATEGORY_FALLBACK_POOL[category] ?? [];
  const merged = Array.from(new Set([...rotated, ...extra])).slice(0, count);
  return merged.map((id) => unsplashUrl(id));
}
