"use client";

import { useRouter } from "next/navigation";
import AuthGate from "@/components/AuthGate";

export default function MeAuthGate() {
  const router = useRouter();
  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=/profile`
      : "/auth/callback?next=/profile";

  return (
    <AuthGate
      redirectTo={redirectTo}
      skipInitialSession
      onUser={() => router.refresh()}
    />
  );
}
