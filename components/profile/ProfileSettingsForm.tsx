"use client";

import { useState } from "react";
import { HiArrowPath, HiCheck } from "react-icons/hi2";
import { upsertProfileDisplayName } from "@/lib/profile";

export default function ProfileSettingsForm({
  userId,
  initialName,
  email,
  memberSince,
}: {
  userId: string;
  initialName: string;
  email: string | null;
  memberSince: string;
}) {
  const [name, setName] = useState(initialName);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    const clean = name.trim();
    if (!clean) {
      setErr("Display name can't be empty.");
      return;
    }
    setBusy(true);
    setErr(null);
    setSaved(false);

    const { error } = await upsertProfileDisplayName(userId, clean);
    if (error) {
      setErr(error.message);
      setBusy(false);
      return;
    }

    window.pendo?.track("profile_updated", {
      display_name_changed: clean !== initialName,
    });
    setSaved(true);
    setBusy(false);
    setTimeout(() => setSaved(false), 2500);
  }

  const joinedDate = new Date(memberSince).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <section className="settings-module relative">
      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="h-8 w-1 rounded-full bg-accent" aria-hidden />
          <div>
            <h2 className="text-title text-lg">Profile</h2>
            <p className="text-meta mt-0.5">
              This name appears on leaderboards and when you join challenges.
            </p>
          </div>
        </div>

        <label className="mt-6 block">
          <span className="section-label">Display name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            className="input-field mt-2 w-full"
            placeholder="Your name"
          />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="section-label">Email</div>
            <div className="input-field mt-2 cursor-default text-muted">
              {email ?? "-"}
            </div>
          </div>
          <div>
            <div className="section-label">Member since</div>
            <div className="input-field mt-2 cursor-default text-muted">
              {joinedDate}
            </div>
          </div>
        </div>

        {err && <p className="mt-3 font-mono text-sm text-accent">{err}</p>}

        <button
          type="button"
          onClick={save}
          disabled={busy || name.trim() === initialName}
          className="btn-primary mt-5 text-sm"
        >
          {busy ? (
            <>
              <HiArrowPath className="h-4 w-4 animate-spin" aria-hidden />
              Saving
            </>
          ) : saved ? (
            <>
              <HiCheck className="h-4 w-4" aria-hidden />
              Saved
            </>
          ) : (
            "Save changes"
          )}
        </button>
      </div>
    </section>
  );
}
