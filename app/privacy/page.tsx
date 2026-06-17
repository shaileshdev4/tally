export default function PrivacyPage() {
  return (
    <main className="prose prose-invert mx-auto max-w-2xl px-5 py-14">
      <h1 className="font-display text-3xl font-bold text-ink">Privacy</h1>
      <p className="mt-4 text-muted">
        Tally stores challenge data, display names, logs, and optional proof
        images. If you sign in, we associate your progress with your account via
        Supabase Auth (email or Google).
      </p>
      <h2 className="mt-8 font-display text-xl text-ink">What we collect</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
        <li>Challenge and log data you create</li>
        <li>Email address when you use magic link or Google sign-in</li>
        <li>
          Optional analytics events (create, join, log) -no third-party ad
          tracking
        </li>
        <li>Strava activity data only if you connect Strava</li>
      </ul>
      <h2 className="mt-8 font-display text-xl text-ink">Deletion</h2>
      <p className="mt-2 text-muted">
        Email us or delete logs you own from the activity feed. Account deletion
        can be requested by contacting the challenge host or removing your
        membership data from active challenges.
      </p>
    </main>
  );
}
