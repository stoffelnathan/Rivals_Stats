import type { HeroStat } from "@/types";

import { getHeroRoleProfile } from "@/lib/analysis/heroRoles";
import { formatKda, formatPercent } from "./format";
import { isRecognizedHeroName } from "./heroes";

/** Competitive ranked mode ID in the Marvel Rivals API match history filter. */
export const RANKED_GAME_MODE_ID = 2;

export interface V2MatchEntry {
  match_time_stamp?: number;
  game_mode_id?: number;
  mvp_uid?: number;
  svp_uid?: number;
  match_player?: {
    player_uid?: number;
    kills?: number;
    deaths?: number;
    assists?: number;
    is_win?: { is_win?: boolean };
    player_hero?: {
      hero_id?: number;
      hero_name?: string;
      kills?: number;
      deaths?: number;
      assists?: number;
    };
  };
}

interface V2MatchHistoryResponse {
  match_history?: V2MatchEntry[];
  pagination?: {
    has_more?: boolean;
  };
}

export interface RecentMatchAggregate {
  heroes: HeroStat[];
  totalMatches: number;
  wins: number;
  kills: number;
  deaths: number;
  assists: number;
  mvpCount: number;
  svpCount: number;
}

export function isRankedMatch(match: V2MatchEntry): boolean {
  return match.game_mode_id === RANKED_GAME_MODE_ID;
}

async function fetchMatchHistoryPages(
  playerId: string,
  apiKey: string,
  gameMode?: number,
): Promise<V2MatchEntry[]> {
  const matches: V2MatchEntry[] = [];
  const limit = 50;
  const gameModeQuery =
    gameMode !== undefined ? `&game_mode=${gameMode}` : "";

  for (let page = 1; page <= 20; page++) {
    const response = await fetch(
      `https://marvelrivalsapi.com/api/v2/player/${encodeURIComponent(playerId)}/match-history?page=${page}&limit=${limit}${gameModeQuery}`,
      {
        headers: { "x-api-key": apiKey },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      break;
    }

    const data = (await response.json()) as V2MatchHistoryResponse;
    const batch = data.match_history ?? [];
    if (batch.length === 0) {
      break;
    }

    matches.push(...batch);

    if (!data.pagination?.has_more) {
      break;
    }
  }

  return matches;
}

export async function fetchRankedMatchHistory(
  playerId: string,
  apiKey: string,
): Promise<V2MatchEntry[]> {
  const rankedMatches = await fetchMatchHistoryPages(
    playerId,
    apiKey,
    RANKED_GAME_MODE_ID,
  );

  if (rankedMatches.length > 0) {
    return rankedMatches;
  }

  const allMatches = await fetchMatchHistoryPages(playerId, apiKey);
  return allMatches.filter(isRankedMatch);
}

export function aggregateRecentMatchStats(
  matches: V2MatchEntry[],
  playerUid: string,
  heroNames: Map<number, string>,
): RecentMatchAggregate {
  const heroBuckets = new Map<
    number,
    {
      name: string;
      matches: number;
      wins: number;
      kills: number;
      deaths: number;
      assists: number;
      baseRole: HeroStat["baseRole"];
      playstyle: HeroStat["playstyle"];
    }
  >();

  let wins = 0;
  let kills = 0;
  let deaths = 0;
  let assists = 0;
  let mvpCount = 0;
  let svpCount = 0;
  const uid = Number(playerUid);

  for (const match of matches) {
    const player = match.match_player;
    if (!player) continue;

    if (player.is_win?.is_win) {
      wins += 1;
    }

    kills += player.kills ?? 0;
    deaths += player.deaths ?? 0;
    assists += player.assists ?? 0;

    if (uid && match.mvp_uid === uid) {
      mvpCount += 1;
    }
    if (uid && match.svp_uid === uid) {
      svpCount += 1;
    }

    const heroId = player.player_hero?.hero_id;
    if (heroId === undefined || heroId === null || heroId <= 0) continue;

    const name =
      heroNames.get(heroId) ??
      player.player_hero?.hero_name?.trim() ??
      `Unrecognized hero (#${heroId})`;
    const roleProfile = getHeroRoleProfile(heroId);
    const heroKills = player.player_hero?.kills ?? 0;
    const heroDeaths = player.player_hero?.deaths ?? 0;
    const heroAssists = player.player_hero?.assists ?? 0;

    const bucket = heroBuckets.get(heroId) ?? {
      name,
      matches: 0,
      wins: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
      baseRole: roleProfile?.baseRole ?? null,
      playstyle: roleProfile?.playstyle ?? null,
    };

    bucket.matches += 1;
    if (player.is_win?.is_win) {
      bucket.wins += 1;
    }
    bucket.kills += heroKills;
    bucket.deaths += heroDeaths;
    bucket.assists += heroAssists;
    heroBuckets.set(heroId, bucket);
  }

  const totalMatches = matches.length;
  const heroMatchesTotal = [...heroBuckets.values()]
    .filter((hero) => isRecognizedHeroName(hero.name))
    .reduce((sum, hero) => sum + hero.matches, 0);

  const heroes: HeroStat[] = [...heroBuckets.entries()]
    .map(([heroId, hero]) => {
      const losses = Math.max(hero.matches - hero.wins, 0);
      const winRateValue =
        hero.matches > 0 ? (hero.wins / hero.matches) * 100 : 0;
      const kda = formatKda(hero.kills, hero.deaths, hero.assists);
      const shareBase = heroMatchesTotal > 0 ? heroMatchesTotal : hero.matches;

      return {
        heroId,
        name: hero.name,
        matches: hero.matches,
        wins: hero.wins,
        losses,
        winRate: formatPercent(winRateValue),
        winRateRaw: winRateValue,
        playTime: "",
        playTimeSeconds: 0,
        playTimeShare: 0,
        matchShare: shareBase > 0 ? hero.matches / shareBase : 0,
        kda: kda.display,
        kdaRaw: kda.raw,
        mvp: 0,
        svp: 0,
        baseRole: hero.baseRole,
        playstyle: hero.playstyle,
        roleLabel: null,
      };
    })
    .sort((a, b) => {
      if (b.matches !== a.matches) {
        return b.matches - a.matches;
      }
      return b.wins - a.wins;
    });

  return {
    heroes,
    totalMatches,
    wins,
    kills,
    deaths,
    assists,
    mvpCount,
    svpCount,
  };
}
