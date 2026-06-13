import type { PlayerStatsSummary } from "@/types";

import type { MarvelRivalsPlayerResponse } from "./types";

export function transformPlayerResponse(
  username: string,
  data: MarvelRivalsPlayerResponse,
): PlayerStatsSummary {
  const winRateRaw = data.overall_stats?.total_wins?.win_percentage;
  const winRate =
    winRateRaw?.placement ??
    (typeof winRateRaw?.percentile === "number"
      ? `${winRateRaw.percentile}%`
      : "N/A");

  const kdaValue = data.overall_stats?.overall_kda?.kda;
  const kda = typeof kdaValue === "number" ? kdaValue.toFixed(2) : "N/A";

  const heroUsage = (data.heroes_ranked ?? [])
    .filter((hero) => hero.hero_name)
    .sort((a, b) => (b.matches ?? 0) - (a.matches ?? 0))
    .slice(0, 5)
    .map((hero) => {
      const matches = hero.matches ?? 0;
      const wins = hero.wins ?? 0;
      return `${hero.hero_name} (${wins}/${matches})`;
    });

  return {
    username: data.player?.nickname ?? data.name ?? username,
    rank: data.player?.rank?.rank ?? "Unranked",
    level: data.player?.level ?? "N/A",
    winRate,
    kda,
    heroUsage,
    success: true,
  };
}

export function failedLookup(username: string): PlayerStatsSummary {
  return {
    username,
    rank: "Lookup Failed",
    level: "Lookup Failed",
    winRate: "Lookup Failed",
    kda: "Lookup Failed",
    heroUsage: [],
    success: false,
  };
}
