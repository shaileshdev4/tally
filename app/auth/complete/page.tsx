import { Suspense } from "react";
import AuthCompleteClient from "./AuthCompleteClient";
import Logo from "@/components/Logo";

export default function AuthCompletePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex max-w-md flex-col items-center px-5 py-32 text-center">
          <Logo orientation="stacked" size={48} wordmarkSize="md" />
          <p className="text-meta mt-4">Loading…</p>
        </main>
      }
    >      <AuthCompleteClient />
    </Suspense>
  );
}
