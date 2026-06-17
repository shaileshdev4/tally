"use client";

import { useState } from "react";
import { GradientCover, PRESET_COVERS } from "@/lib/covers";
import { supabase } from "@/lib/supabase";

export default function Cover({
  type,
  value,
  seed,
  gradientFallback = "ember",
  className = "",
}: {
  type: string;
  value: string | null;
  seed: string;
  gradientFallback?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (type === "gradient" || !value || failed) {
    const g = type === "gradient" && value ? value : gradientFallback;
    return <GradientCover gradientKey={g} seed={seed} className={className} />;
  }

  if (type === "url") {
    return (
      <img
        src={value}
        alt=""
        className={className}
        style={{ objectFit: "cover" }}
        onError={() => setFailed(true)}
      />
    );
  }

  let src = value;
  if (type === "preset") {
    const p = PRESET_COVERS[value];
    if (!p) return <GradientCover gradientKey={gradientFallback} seed={seed} className={className} />;
    src = p.src;
  } else if (type === "custom") {
    src = supabase.storage.from("proofs").getPublicUrl(value).data.publicUrl;
  }

  return (
    <img
      src={src}
      alt=""
      className={className}
      style={{ objectFit: "cover" }}
      onError={() => setFailed(true)}
    />
  );
}
