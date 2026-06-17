import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/auth-server";

export type { Profile };

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  return data as Profile | null;
}

export async function upsertProfileDisplayName(userId: string, displayName: string) {
  const clean = displayName.trim().slice(0, 40);
  if (!clean) return { error: new Error("empty name") };
  return supabase.from("profiles").upsert(
    { id: userId, display_name: clean, updated_at: new Date().toISOString() },
    { onConflict: "id" }
  );
}
