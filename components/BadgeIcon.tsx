import type { IconType } from "react-icons";
import {
  HiArrowTrendingUp,
  HiBolt,
  HiCheckCircle,
  HiFire,
  HiFlag,
  HiSparkles,
  HiTrophy,
} from "react-icons/hi2";
import type { BadgeId } from "@/lib/badges";

const BADGE_ICONS: Record<BadgeId, IconType> = {
  leader: HiTrophy,
  halfway: HiBolt,
  goal: HiFlag,
  streak7: HiFire,
  streak3: HiSparkles,
  consistent: HiArrowTrendingUp,
  today: HiCheckCircle,
};

export default function BadgeIcon({
  id,
  className = "h-3 w-3 shrink-0",
}: {
  id: BadgeId;
  className?: string;
}) {
  const Icon = BADGE_ICONS[id];
  return <Icon className={className} aria-hidden />;
}
