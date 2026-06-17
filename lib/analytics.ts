"use client";

import { supabase } from "@/lib/supabase";

export function track(event: string, properties: Record<string, unknown> = {}) {
  void supabase.auth.getUser().then(({ data }) => {
    const userId = data.user?.id ?? null;
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, properties, userId }),
    }).catch(() => {});

    if (typeof window !== "undefined" && (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag) {
      (window as unknown as { gtag: (...a: unknown[]) => void }).gtag("event", event, {
        ...properties,
        user_id: userId,
      });
    }
  });
}
