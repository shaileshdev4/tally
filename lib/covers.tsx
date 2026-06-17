export const GRADIENTS: Record<string, [string, string, string]> = {
  ember: ["#FF6B35", "#C2410C", "#7C2D12"],
  sky: ["#3B82F6", "#2563EB", "#1E3A8A"],
  teal: ["#2DD4BF", "#0D9488", "#134E4A"],
  violet: ["#A78BFA", "#7C3AED", "#4C1D95"],
  dusk: ["#F472B6", "#DB2777", "#831843"],
  forest: ["#4ADE80", "#16A34A", "#14532D"],
};

export const GRADIENT_KEYS = Object.keys(GRADIENTS);

export function GradientCover({
  gradientKey = "ember",
  seed = "tally",
  className = "",
}: {
  gradientKey?: string;
  seed?: string;
  className?: string;
}) {
  const [a, b, c] = GRADIENTS[gradientKey] ?? GRADIENTS.ember;
  const h = Array.from(seed).reduce(
    (s, ch) => (s * 31 + ch.charCodeAt(0)) % 1000,
    7,
  );
  const x1 = 20 + (h % 40);
  const y1 = 20 + ((h >> 2) % 40);
  const x2 = 60 + (h % 30);
  const y2 = 50 + ((h >> 3) % 30);
  const gradId = `g-${gradientKey}-${h}`;
  const blurId = `blur-${h}`;

  return (
    <svg
      viewBox="0 0 400 200"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={a} />
          <stop offset="60%" stopColor={b} />
          <stop offset="100%" stopColor={c} />
        </linearGradient>
        <filter id={blurId}>
          <feGaussianBlur stdDeviation="30" />
        </filter>
      </defs>
      <rect width="400" height="200" fill={`url(#${gradId})`} />
      <g filter={`url(#${blurId})`} opacity="0.5">
        <circle cx={x1 * 4} cy={y1 * 2} r="60" fill={a} />
        <circle cx={x2 * 4} cy={y2 * 2} r="50" fill={c} />
      </g>
    </svg>
  );
}

function unsplash(photoId: string, w = 800) {
  return `https://images.unsplash.com/${photoId}?w=${w}&q=80&auto=format&fit=crop`;
}

/** Curated preset covers -Unsplash URLs (local /covers/*.jpg overrides optional). */
export const PRESET_COVERS: Record<string, { src: string; gradient: string }> =
  {
    books: {
      src: unsplash("photo-1495446815901-a7297e633e8d"),
      gradient: "ember",
    },
    run: { src: unsplash("photo-1571008887538-b36bb32f4571"), gradient: "sky" },
    gym: { src: unsplash("photo-1534438327276-14e5300c3a48"), gradient: "sky" },
    calm: {
      src: unsplash("photo-1506126613408-eca07ce68773"),
      gradient: "teal",
    },
    study: {
      src: unsplash("photo-1516321318423-f06f85e504b3"),
      gradient: "violet",
    },
    campus: {
      src: unsplash("photo-1524178232363-1fb2b075b655"),
      gradient: "violet",
    },
    code: {
      src: unsplash("photo-1522071820081-009f0129c71c"),
      gradient: "violet",
    },
    wellness: {
      src: unsplash("photo-1544367567-0f2fcb009e0b"),
      gradient: "forest",
    },
    creative: {
      src: unsplash("photo-1513542789411-b6a5d4f31634"),
      gradient: "dusk",
    },
    writing: {
      src: unsplash("photo-1513364776144-60967b0f800f"),
      gradient: "dusk",
    },
    office: { src: unsplash("photo-1552664730-d307ca884978"), gradient: "sky" },
    finance: {
      src: unsplash("photo-1554224155-6726b3ff858f"),
      gradient: "forest",
    },
    social: {
      src: unsplash("photo-1529156069898-49953e39b3ac"),
      gradient: "ember",
    },
    food: {
      src: unsplash("photo-1490645935967-10de6ba17061"),
      gradient: "ember",
    },
    gaming: {
      src: unsplash("photo-1542751371-adc38448a05e"),
      gradient: "violet",
    },
    team: {
      src: unsplash("photo-1522071820081-009f0129c71c"),
      gradient: "violet",
    },
  };

export type CoverType = "gradient" | "preset" | "custom";

/** Resolve display: gradient fallback → preset image → custom storage/public path. */
export function coverGradientKey(
  coverType: string,
  coverValue: string | null,
  fallback = "ember",
): string {
  if (coverType === "gradient" && coverValue) return coverValue;
  if (coverType === "preset" && coverValue) {
    return PRESET_COVERS[coverValue]?.gradient ?? fallback;
  }
  return fallback;
}

export function presetCoverValue(
  key: string,
): { type: "preset" | "gradient"; value: string } | null {
  const p = PRESET_COVERS[key];
  if (!p) return null;
  return { type: "preset", value: key };
}
