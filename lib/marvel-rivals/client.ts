import type { MarvelRivalsPlayerResponse } from "./types";

export interface PlayerResolution {
  playerId: string;
  matchedName: string | null;
  matchWarning: string | null;
}

function normalizeUsername(value: string): string {
  return value.toLowerCase().replace(/[\s_-]+/g, "");
}

export async function resolvePlayer(
  username: string,
  apiKey: string,
): Promise<PlayerResolution> {
  const response = await fetch(
    `https://marvelrivalsapi.com/api/v1/find-player/${encodeURIComponent(username)}`,
    {
      headers: { "x-api-key": apiKey },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return {
      playerId: username,
      matchedName: null,
      matchWarning:
        "Exact account match not found. Results may be incomplete.",
    };
  }

  const data = (await response.json()) as {
    name?: string;
    uid?: string | number;
  };

  const playerId =
    data.uid !== undefined && data.uid !== null
      ? String(data.uid)
      : username;
  const matchedName = data.name ?? null;

  let matchWarning: string | null = null;
  if (
    matchedName &&
    normalizeUsername(matchedName) !== normalizeUsername(username)
  ) {
    matchWarning = `Matched "${matchedName}" instead of "${username}". Similar names can point to different accounts — try your exact in-game name (including underscores).`;
  }

  return { playerId, matchedName, matchWarning };
}

export async function fetchPlayerStatsById(
  playerId: string,
  apiKey: string,
): Promise<
  | { ok: true; data: MarvelRivalsPlayerResponse }
  | { ok: false; status: number; message: string }
> {
  const response = await fetch(
    `https://marvelrivalsapi.com/api/v1/player/${encodeURIComponent(playerId)}`,
    {
      headers: { "x-api-key": apiKey },
      cache: "no-store",
    },
  );

  if (response.status === 429) {
    return {
      ok: false,
      status: 429,
      message: "API rate limit reached. Wait a moment and try again.",
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: "Player not found or stats unavailable.",
    };
  }

  const data = (await response.json()) as MarvelRivalsPlayerResponse & {
    error?: boolean | string;
    message?: string;
  };

  if (data.error) {
    return {
      ok: false,
      status: 404,
      message:
        typeof data.message === "string"
          ? data.message
          : "Player not found or stats unavailable.",
    };
  }

  if (!data.player && !data.name) {
    return {
      ok: false,
      status: 404,
      message: "Player not found or stats unavailable.",
    };
  }

  return { ok: true, data };
}

export async function fetchPlayerStats(
  username: string,
  apiKey: string,
): Promise<
  | {
      ok: true;
      data: MarvelRivalsPlayerResponse;
      resolution: PlayerResolution;
    }
  | { ok: false; status: number; message: string }
> {
  const resolution = await resolvePlayer(username, apiKey);
  const result = await fetchPlayerStatsById(resolution.playerId, apiKey);

  if (!result.ok) {
    return result;
  }

  return { ok: true, data: result.data, resolution };
}
