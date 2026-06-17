import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChallengeBySlug, getBoard } from "@/lib/data";
import ChallengeView from "@/components/ChallengeView";
import { coverGradientKey, PRESET_COVERS } from "@/lib/covers";

export const dynamic = "force-dynamic";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tally.app";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const challenge = await getChallengeBySlug(params.id);
  if (!challenge) return { title: "Challenge not found" };

  const rows = await getBoard(challenge.id);
  let imageUrl = `${SITE}/covers/books.jpg`;

  if (challenge.cover_type === "preset" && challenge.cover_value) {
    const p = PRESET_COVERS[challenge.cover_value];
    if (p) imageUrl = `${SITE}${p.src}`;
  } else if (challenge.cover_type === "url" && challenge.cover_value) {
    imageUrl = challenge.cover_value;
  }

  const desc = `Join "${challenge.name}" -${rows.length} on the board, counting ${challenge.unit}. Live leaderboard on Tally.`;

  return {
    title: `${challenge.name} | Tally`,
    description: desc,
    openGraph: {
      title: challenge.name,
      description: desc,
      type: "website",
      images: [{ url: imageUrl, width: 800, height: 420, alt: challenge.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: challenge.name,
      description: desc,
      images: [imageUrl],
    },
  };
}

export default async function ChallengePage({
  params,
}: {
  params: { id: string };
}) {
  const challenge = await getChallengeBySlug(params.id);
  if (!challenge) notFound();
  const rows = await getBoard(challenge.id);
  return <ChallengeView challenge={challenge} initialRows={rows} />;
}
