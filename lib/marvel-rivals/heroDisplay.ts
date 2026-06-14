import type { HeroStat } from "@/types";

export function formatHeroRecord(hero: HeroStat): string {
  return `${hero.name} (${hero.wins}W-${hero.losses}L, ${hero.winRate})`;
}
