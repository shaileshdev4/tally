"use client";

import { useRef, useState } from "react";
import { HiArrowPath, HiCheck, HiPlus } from "react-icons/hi2";
import { supabase } from "@/lib/supabase";
import { GRADIENT_KEYS, GradientCover } from "@/lib/covers";

export type CoverValue = {
  type: "gradient" | "preset" | "custom" | "url";
  value: string;
};

export default function CoverPicker({
  value,
  onChange,
  suggestedUrls = [],
  loading = false,
}: {
  value: CoverValue;
  onChange: (c: CoverValue) => void;
  suggestedUrls?: string[];
  loading?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    const path = `covers/${crypto.randomUUID()}-${file.name.replace(/[^\w.]/g, "")}`;
    const { error } = await supabase.storage
      .from("proofs")
      .upload(path, file, { upsert: false });
    if (!error) onChange({ type: "custom", value: path });
    setUploading(false);
  }

  return (
    <div className="mt-2 space-y-3">
      <div>
        <div className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted">
          Banner photos
        </div>
        {loading && suggestedUrls.length === 0 ? (
          <div className="flex h-20 items-center justify-center gap-2 rounded-xl border border-dashed border-line text-sm text-muted">
            <HiArrowPath className="h-4 w-4 animate-spin" aria-hidden />
            Finding images for your challenge…
          </div>
        ) : suggestedUrls.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {suggestedUrls.map((url) => {
              const active = value.type === "url" && value.value === url;
              return (
                <button
                  key={url}
                  type="button"
                  onClick={() => onChange({ type: "url", value: url })}
                  className="relative h-20 overflow-hidden rounded-xl border-2 transition hover:scale-[1.02]"
                  style={{ borderColor: active ? "var(--accent)" : "#2A2F38" }}
                >
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  {active && (
                    <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-canvas">
                      <HiCheck className="h-3 w-3" aria-hidden />
                    </span>
                  )}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex h-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line text-muted transition hover:border-muted hover:text-ink disabled:opacity-50"
            >
              {uploading ? (
                <HiArrowPath className="h-5 w-5 animate-spin" aria-hidden />
              ) : value.type === "custom" ? (
                <HiCheck className="h-5 w-5 text-mint" aria-hidden />
              ) : (
                <HiPlus className="h-5 w-5" aria-hidden />
              )}
              <span className="font-mono text-[10px] uppercase tracking-wider">
                {uploading
                  ? "Uploading"
                  : value.type === "custom"
                    ? "Uploaded"
                    : "Upload"}
              </span>
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-line p-4 text-center text-sm text-muted">
            No banner suggestions yet - pick a gradient below or upload your
            own.
          </div>
        )}
      </div>

      <div>
        <div className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted">
          Gradients
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {GRADIENT_KEYS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onChange({ type: "gradient", value: g })}
              className="group relative h-12 overflow-hidden rounded-lg border-2 transition hover:scale-[1.03]"
              style={{
                borderColor:
                  value.type === "gradient" && value.value === g
                    ? "var(--accent)"
                    : "transparent",
              }}
              title={g}
            >
              <GradientCover
                gradientKey={g}
                seed={g}
                className="h-full w-full"
              />
              {value.type === "gradient" && value.value === g && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <HiCheck className="h-4 w-4 text-ink" aria-hidden />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
      />
    </div>
  );
}
