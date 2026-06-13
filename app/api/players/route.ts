import { NextResponse } from "next/server";

import {
  failedLookup,
  transformPlayerResponse,
} from "@/lib/marvel-rivals/transform";
import type { MarvelRivalsPlayerResponse } from "@/lib/marvel-rivals/types";
import type { PlayerLookupRequest, PlayerStatsSummary } from "@/types";

const API_BASE = "https://marvelrivalsapi.com/api/v2";

async function lookupPlayer(username: string): Promise<PlayerStatsSummary> {
  const apiKey = process.env.MARVEL_RIVALS_API_KEY;

  if (!apiKey) {
    return failedLookup(username);
  }

  try {
    const response = await fetch(
      `${API_BASE}/player/${encodeURIComponent(username)}`,
      {
        headers: {
          "x-api-key": apiKey,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return failedLookup(username);
    }

    const data = (await response.json()) as MarvelRivalsPlayerResponse;
    return transformPlayerResponse(username, data);
  } catch {
    return failedLookup(username);
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as PlayerLookupRequest;
  const usernames = Array.isArray(body.usernames) ? body.usernames : [];

  if (usernames.length === 0) {
    return NextResponse.json({ results: [] });
  }

  const results = await Promise.all(
    usernames.map((username) => lookupPlayer(username)),
  );

  return NextResponse.json({ results });
}
