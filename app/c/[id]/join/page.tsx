import { notFound } from "next/navigation";
import { getChallengeBySlug, getBoard } from "@/lib/data";
import JoinForm from "@/components/JoinForm";

export const dynamic = "force-dynamic";

export default async function JoinPage({ params }: { params: { id: string } }) {
  const challenge = await getChallengeBySlug(params.id);
  if (!challenge) notFound();
  const rows = await getBoard(challenge.id);
  return <JoinForm challenge={challenge} memberCount={rows.length} />;
}
