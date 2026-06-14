import type { RecentOneTrickSignal } from "@/types";

import type { V2MatchEntry } from "@/lib/marvel-rivals/matchHistory";

const RECENT_WINDOW = 15;
const RECENT_ONE_TRICK_THRESHOLD = 0.45;
const MIN_RECENT_GAMES = 4;

function formatPercent(value: number): string {
  return `${value.toFixed(0)}%`;
}

export function detectRecentOneTrick(
  matchHistory: V2MatchEntry[] | undefined,
  heroNames: Map<number, string>,
): RecentOneTrickSignal | null {
  const sorted = [...(matchHistory ?? [])].sort(
    (a, b) => (b.match_time_stamp ?? 0) - (a.match_time_stamp ?? 0),
  );

  const window = sorted.slice(0, RECENT_WINDOW);
  if (window.length < MIN_RECENT_GAMES) {
    return null;
  }

  const counts = new Map<number, number>();

  for (const match of window) {
    const heroId = match.match_player?.player_hero?.hero_id;
    if (heroId === undefined) continue;
    counts.set(heroId, (counts.get(heroId) ?? 0) + 1);
  }

  let topHeroId = -1;
  let topCount = 0;

  for (const [heroId, count] of counts) {
    if (count > topCount) {
      topHeroId = heroId;
      topCount = count;
    }
  }

  if (topHeroId < 0) {
    return null;
  }

  const share = topCount / window.length;
  if (share < RECENT_ONE_TRICK_THRESHOLD || topCount < MIN_RECENT_GAMES) {
    return null;
  }

  const fallbackName =
    window.find(
      (match) => match.match_player?.player_hero?.hero_id === topHeroId,
    )?.match_player?.player_hero?.hero_name ?? "Unknown";

  const heroName =
    heroNames.get(topHeroId) ??
    (fallbackName.trim() ? fallbackName : `Hero #${topHeroId}`);

  return {
    hero: heroName,
    heroId: topHeroId,
    games: topCount,
    windowGames: window.length,
    sharePercent: formatPercent(share * 100),
  };
}
