import { NextResponse } from "next/server";

import { buildTeamAnalysis } from "@/lib/analysis/teamReport";
import { fetchPlayerStats } from "@/lib/marvel-rivals/client";
import { resolveHeroNames } from "@/lib/marvel-rivals/heroes";
import { fetchRankedMatchHistory } from "@/lib/marvel-rivals/matchHistory";
import {
  failedLookup,
  transformPlayerResponse,
} from "@/lib/marvel-rivals/transform";
import type { PlayerLookupRequest, PlayerLookupResponse } from "@/types";

function getApiKey(): string | null {
  const apiKey = process.env.MARVEL_RIVALS_API_KEY?.trim();
  if (!apiKey || apiKey === "your_api_key_here") {
    return null;
  }
  return apiKey;
}

export async function POST(request: Request) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "MARVEL_RIVALS_API_KEY is not configured. Add your key to .env.local and restart the dev server.",
        players: [],
        teamAnalysis: null,
      },
      { status: 503 },
    );
  }

  const body = (await request.json()) as PlayerLookupRequest;
  const usernames = Array.isArray(body.usernames) ? body.usernames : [];

  if (usernames.length === 0) {
    return NextResponse.json({ players: [], teamAnalysis: null });
  }

  const players = await Promise.all(
    usernames.map(async (username) => {
      const result = await fetchPlayerStats(username, apiKey);

      if (!result.ok) {
        return failedLookup(username, result.message);
      }

      const playerId = String(result.data.uid ?? result.resolution.playerId);
      const matchHistory = await fetchRankedMatchHistory(playerId, apiKey);

      const heroEntries = matchHistory.flatMap((match) => {
        const hero = match.match_player?.player_hero;
        if (!hero?.hero_id) return [];
        return [{ hero_id: hero.hero_id, hero_name: hero.hero_name }];
      });

      const heroNames = await resolveHeroNames(apiKey, heroEntries);

      return transformPlayerResponse(username, result.data, {
        heroNames,
        matchHistory,
        resolution: result.resolution,
      });
    }),
  );

  const response: PlayerLookupResponse = {
    players,
    teamAnalysis: buildTeamAnalysis(players),
  };

  return NextResponse.json(response);
}
