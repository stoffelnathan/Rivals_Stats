import type { HeroStat, PlayerProfile } from "@/types";

import { classifyPlayerRole } from "@/lib/analysis/playerRole";
import { detectRecentOneTrick } from "@/lib/analysis/recentOneTrick";
import {
  extractMatchDates,
  extractMatchDatesFromHistory,
} from "./dates";
import { formatPercent } from "./format";
import {
  aggregateRecentMatchStats,
  type V2MatchEntry,
} from "./matchHistory";
import { resolveCompetitiveRank } from "./rank";
import type { PlayerResolution } from "./client";
import {
  POPULATION_AVERAGE_MVP_RATE,
  type MarvelRivalsPlayerResponse,
} from "./types";

function buildMvpComparison(mvpRateRaw: number | null): string {
  if (mvpRateRaw !== null) {
    const diff = mvpRateRaw - POPULATION_AVERAGE_MVP_RATE;
    const direction = diff >= 0 ? "above" : "below";
    return `${formatPercent(Math.abs(diff))} ${direction} the ~${formatPercent(POPULATION_AVERAGE_MVP_RATE)} average`;
  }

  return "N/A";
}

export function computePowerScore(player: PlayerProfile): number | null {
  if (!player.success) return null;

  const kda = player.kdaRaw ?? 0;
  const winRate = player.winRateRaw ?? 0;
  const mvpRate = player.mvpRateRaw ?? 0;

  return kda * 0.45 + winRate * 0.35 + mvpRate * 0.2;
}

export function transformPlayerResponse(
  username: string,
  data: MarvelRivalsPlayerResponse,
  options: {
    heroNames: Map<number, string>;
    matchHistory: V2MatchEntry[];
    resolution?: PlayerResolution;
  },
): PlayerProfile {
  const playerUid = String(data.uid ?? options.resolution?.playerId ?? "");
  const recent = aggregateRecentMatchStats(
    options.matchHistory,
    playerUid,
    options.heroNames,
  );
  const matchDates = extractMatchDatesFromHistory(options.matchHistory);
  const rankDates = extractMatchDates(data);
  const ranks = resolveCompetitiveRank(data);

  const winRateRaw =
    recent.totalMatches > 0
      ? (recent.wins / recent.totalMatches) * 100
      : null;
  const kdaRaw =
    recent.deaths > 0 || recent.kills > 0 || recent.assists > 0
      ? recent.deaths > 0
        ? (recent.kills + recent.assists) / recent.deaths
        : recent.kills + recent.assists
      : null;
  const mvpRateRaw =
    recent.totalMatches > 0
      ? (recent.mvpCount / recent.totalMatches) * 100
      : null;

  const heroes: HeroStat[] = recent.heroes;
  const playerRole = classifyPlayerRole(heroes);
  const recentOneTrick = detectRecentOneTrick(
    options.matchHistory,
    options.heroNames,
  );

  const profile: PlayerProfile = {
    username: data.player?.nickname ?? data.name ?? username,
    searchedUsername: username,
    uid: playerUid,
    matchedName: options.resolution?.matchedName ?? null,
    matchWarning: options.resolution?.matchWarning ?? null,
    dataLastUpdated: data.updates?.info_update_time ?? null,
    lastMatchDate: matchDates.lastMatchDate,
    matchHistoryRange: matchDates.matchHistoryRange,
    matchHistoryCount: matchDates.matchHistoryCount,
    lastRankUpdateDate: rankDates.lastRankUpdateDate,
    statsScope: "recent-ranked",
    success: true,
    rank: ranks.rank,
    peakRank: ranks.peakRank,
    level: data.player?.level ?? "N/A",
    winRate: winRateRaw !== null ? formatPercent(winRateRaw) : "N/A",
    winRateRaw,
    kda: kdaRaw !== null ? kdaRaw.toFixed(2) : "N/A",
    kdaRaw,
    totalMatches: recent.totalMatches,
    mvpCount: recent.mvpCount,
    mvpRate: mvpRateRaw !== null ? formatPercent(mvpRateRaw) : "N/A",
    mvpRateRaw,
    averageMvpRate: formatPercent(POPULATION_AVERAGE_MVP_RATE),
    mvpComparison: buildMvpComparison(mvpRateRaw),
    heroes,
    playerRole,
    recentOneTrick,
    powerScore: null,
  };

  profile.powerScore = computePowerScore(profile);

  return profile;
}

const EMPTY_PLAYER_ROLE: PlayerProfile["playerRole"] = {
  label: "Unknown",
  baseRoles: [],
  primaryFocus: null,
  reason: "Lookup failed.",
};

export function failedLookup(
  username: string,
  errorMessage = "Could not retrieve stats for this username.",
): PlayerProfile {
  return {
    username,
    searchedUsername: username,
    uid: "",
    matchedName: null,
    matchWarning: null,
    dataLastUpdated: null,
    lastMatchDate: null,
    matchHistoryRange: null,
    matchHistoryCount: 0,
    lastRankUpdateDate: null,
    statsScope: "recent-ranked",
    success: false,
    errorMessage,
    rank: "Lookup Failed",
    peakRank: "Lookup Failed",
    level: "Lookup Failed",
    winRate: "Lookup Failed",
    winRateRaw: null,
    kda: "Lookup Failed",
    kdaRaw: null,
    totalMatches: 0,
    mvpCount: 0,
    mvpRate: "Lookup Failed",
    mvpRateRaw: null,
    averageMvpRate: formatPercent(POPULATION_AVERAGE_MVP_RATE),
    mvpComparison: "Lookup Failed",
    heroes: [],
    playerRole: EMPTY_PLAYER_ROLE,
    recentOneTrick: null,
    powerScore: null,
  };
}
