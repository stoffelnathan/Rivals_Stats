import type { V2MatchEntry } from "./matchHistory";
import type { MarvelRivalsPlayerResponse } from "./types";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatTimestamp(timestamp: number): string {
  return dateFormatter.format(new Date(timestamp * 1000));
}

export function extractMatchDatesFromHistory(matches: V2MatchEntry[]): {
  lastMatchDate: string | null;
  matchHistoryRange: string | null;
  matchHistoryCount: number;
} {
  const matchTimestamps = matches
    .map((match) => match.match_time_stamp)
    .filter((timestamp): timestamp is number => typeof timestamp === "number")
    .sort((a, b) => a - b);

  if (matchTimestamps.length === 0) {
    return {
      lastMatchDate: null,
      matchHistoryRange: null,
      matchHistoryCount: 0,
    };
  }

  const oldest = matchTimestamps[0];
  const newest = matchTimestamps[matchTimestamps.length - 1];

  return {
    lastMatchDate: formatTimestamp(newest),
    matchHistoryRange:
      oldest === newest
        ? formatTimestamp(newest)
        : `${formatTimestamp(oldest)} – ${formatTimestamp(newest)}`,
    matchHistoryCount: matchTimestamps.length,
  };
}

export function extractMatchDates(data: MarvelRivalsPlayerResponse): {
  lastMatchDate: string | null;
  matchHistoryRange: string | null;
  matchHistoryCount: number;
  lastRankUpdateDate: string | null;
} {
  const matchTimestamps = (data.match_history ?? [])
    .map((match) => match.match_time_stamp)
    .filter((timestamp): timestamp is number => typeof timestamp === "number")
    .sort((a, b) => a - b);

  const rankTimestamps = (data.rank_history ?? [])
    .map((entry) => entry.match_time_stamp)
    .filter((timestamp): timestamp is number => typeof timestamp === "number")
    .sort((a, b) => b - a);

  if (matchTimestamps.length === 0) {
    return {
      lastMatchDate: null,
      matchHistoryRange: null,
      matchHistoryCount: 0,
      lastRankUpdateDate:
        rankTimestamps.length > 0
          ? formatTimestamp(rankTimestamps[0])
          : null,
    };
  }

  const oldest = matchTimestamps[0];
  const newest = matchTimestamps[matchTimestamps.length - 1];

  return {
    lastMatchDate: formatTimestamp(newest),
    matchHistoryRange:
      oldest === newest
        ? formatTimestamp(newest)
        : `${formatTimestamp(oldest)} – ${formatTimestamp(newest)}`,
    matchHistoryCount: matchTimestamps.length,
    lastRankUpdateDate:
      rankTimestamps.length > 0
        ? formatTimestamp(rankTimestamps[0])
        : formatTimestamp(newest),
  };
}
