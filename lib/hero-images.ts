import { PRESET_COVERS } from "@/lib/covers";

/** Default cinematic backdrops for page heroes */
export const PAGE_HERO_IMAGES = {
  home: PRESET_COVERS.team.src,
  categories: PRESET_COVERS.study.src,
  create: PRESET_COVERS.creative.src,
  profile: PRESET_COVERS.calm.src,
  challenges: PRESET_COVERS.run.src,
  history: PRESET_COVERS.wellness.src,
  settings: PRESET_COVERS.office.src,
} as const;
