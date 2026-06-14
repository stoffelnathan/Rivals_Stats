import type { PlayerProfile, TeamAnalysis } from "@/types";
import { TEAM_HERO_LIMIT } from "@/types";

import { formatHeroRecord } from "@/lib/marvel-rivals/heroDisplay";

function topHeroLabels(player: PlayerProfile, limit = TEAM_HERO_LIMIT): string[] {
  return player.heroes.slice(0, limit).map(formatHeroRecord);
}

function buildHighlight(player: PlayerProfile): TeamAnalysis["strongest"] {
  return {
    username: player.username,
    rank: player.rank,
    peakRank: player.peakRank,
    kda: player.kda,
    winRate: player.winRate,
    mvpRate: player.mvpRate,
    playerRole: player.playerRole.label,
    topHeroes: topHeroLabels(player),
  };
}

function buildPlayerSummaries(players: PlayerProfile[]): TeamAnalysis["players"] {
  return players
    .filter((player) => player.success)
    .map((player) => ({
      username: player.username,
      playerRole: player.playerRole.label,
      topHeroes: topHeroLabels(player),
    }));
}

export function buildTeamAnalysis(players: PlayerProfile[]): TeamAnalysis | null {
  const successful = players.filter(
    (player) => player.success && player.totalMatches > 0,
  );

  if (successful.length < 2) {
    return null;
  }

  const sorted = [...successful].sort(
    (a, b) => (b.mvpRateRaw ?? 0) - (a.mvpRateRaw ?? 0),
  );

  return {
    players: buildPlayerSummaries(successful),
    strongest: buildHighlight(sorted[0]),
    weakest: buildHighlight(sorted[sorted.length - 1]),
  };
}
