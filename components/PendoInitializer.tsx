"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { getProfile } from "@/lib/profile";

export default function PendoInitializer() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Boot Pendo once with an anonymous visitor.
    // Empty id lets the SDK resolve from cookies/localStorage if available,
    // otherwise it falls back to a new anonymous visitor.
    pendo.initialize({
      visitor: { id: "" },
    });

    // If the user already has a session, identify them immediately.
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const profile = await getProfile(data.user.id);
        if (profile) {
          identifyVisitor(profile);
        }
      }
    });

    // Listen for auth state changes to identify on sign-in
    // and clear session on sign-out.
    const { data: sub } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const profile = await getProfile(session.user.id);
          if (profile) {
            identifyVisitor(profile);
          }
        } else if (event === "SIGNED_OUT") {
          pendo.clearSession();
        }
      }
    );

    return () => sub.subscription.unsubscribe();
  }, []);

  return null;
}

function identifyVisitor(profile: {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}) {
  pendo.identify({
    visitor: {
      id: profile.id,
      email: profile.email ?? "",
      full_name: profile.display_name ?? "",
      displayName: profile.display_name ?? "",
      avatarUrl: profile.avatar_url ?? "",
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    },
  });
}
