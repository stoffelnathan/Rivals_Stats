const INVALID_RANK_VALUES = new Set([
  "invalid level",
  "unknown",
  "n/a",
  "",
]);

export function sanitizeRank(value: string | undefined | null): string {
  if (!value?.trim()) {
    return "Rank unavailable";
  }

  if (INVALID_RANK_VALUES.has(value.trim().toLowerCase())) {
    return "Rank unavailable";
  }

  return value.trim();
}

interface RankHistoryEntry {
  level_progression?: {
    to?: number;
  };
  score_progression?: {
    total_score?: number;
  };
}

interface SeasonRankEntry {
  level?: number;
  max_level?: number;
  rank_score?: number;
  update_time?: number;
  win_count?: number;
}

export function resolveCompetitiveRank(data: {
  player?: {
    rank?: {
      rank?: string;
      peak_rank?: { rank?: string };
      score?: string;
    };
    info?: {
      rank_game_season?: Record<string, SeasonRankEntry>;
    };
  };
  rank_history?: RankHistoryEntry[];
}): { rank: string; peakRank: string } {
  const apiRank = sanitizeRank(data.player?.rank?.rank);
  const apiPeak = sanitizeRank(data.player?.rank?.peak_rank?.rank);

  const latestHistory = data.rank_history?.[0];
  const historyLevel = latestHistory?.level_progression?.to;
  const historyScore = latestHistory?.score_progression?.total_score;

  const seasons = Object.values(data.player?.info?.rank_game_season ?? {});
  const latestSeason = seasons.sort(
    (a, b) => (b.update_time ?? 0) - (a.update_time ?? 0),
  )[0];

  const seasonLevel = latestSeason?.level ?? latestSeason?.max_level;
  const seasonScore = latestSeason?.rank_score;

  if (apiRank !== "Rank unavailable") {
    return {
      rank: apiRank,
      peakRank: apiPeak !== "Rank unavailable" ? apiPeak : apiRank,
    };
  }

  const competitiveLevel = historyLevel ?? seasonLevel;
  const competitiveScore = historyScore ?? seasonScore;

  if (competitiveLevel !== undefined) {
    const rankLabel = `Competitive level ${competitiveLevel}`;
    const scoreSuffix =
      competitiveScore !== undefined
        ? ` (${Math.round(competitiveScore)} RP)`
        : "";

    return {
      rank: `${rankLabel}${scoreSuffix}`,
      peakRank:
        latestSeason?.max_level !== undefined
          ? `Peak competitive level ${latestSeason.max_level}`
          : `${rankLabel}${scoreSuffix}`,
    };
  }

  return {
    rank: "Rank unavailable",
    peakRank: "Rank unavailable",
  };
}

export function sumCareerRankedWins(
  rankGameSeason?: Record<string, SeasonRankEntry>,
): number {
  return Object.values(rankGameSeason ?? {}).reduce(
    (sum, season) => sum + (season.win_count ?? 0),
    0,
  );
}
