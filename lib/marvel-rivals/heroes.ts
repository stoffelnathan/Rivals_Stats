import { registerHeroApiRoles } from "@/lib/analysis/heroRoles";

interface HeroListEntry {
  id: string;
  name: string;
  role: string;
}

interface HeroTransformation {
  id?: string;
  name?: string;
}

interface HeroDetail {
  id?: string;
  name?: string;
  transformations?: HeroTransformation[];
}

interface CompositeHeroId {
  rawId: number;
  baseId: number;
  variantId: number;
  isComposite: boolean;
}

const heroNameCache = new Map<string, string>();
const heroDetailCache = new Map<string, HeroDetail>();
let heroListPromise: Promise<void> | null = null;

/** Role labels for heroes that use composite IDs (baseId * 10 + variantId). */
const HERO_VARIANT_ROLES: Record<number, Record<number, string>> = {
  1057: {
    0: "DPS",
    1: "Tank",
    2: "DPS",
    3: "Support",
  },
};

function getVariantRoleLabel(baseId: number, variantId: number): string | null {
  return HERO_VARIANT_ROLES[baseId]?.[variantId] ?? null;
}

/**
 * Player stats sometimes use composite hero IDs:
 * baseHeroId * 10 + transformationId (e.g. Deadpool 1057 + form 1 => 10571).
 */
export function decodeCompositeHeroId(heroId: number): CompositeHeroId {
  if (heroId >= 10000) {
    return {
      rawId: heroId,
      baseId: Math.floor(heroId / 10),
      variantId: heroId % 10,
      isComposite: true,
    };
  }

  return {
    rawId: heroId,
    baseId: heroId,
    variantId: 0,
    isComposite: false,
  };
}

function isUnknownHeroName(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return (
    !normalized ||
    normalized === "unknown" ||
    normalized === "unknown hero"
  );
}

async function loadHeroList(apiKey: string): Promise<void> {
  const response = await fetch("https://marvelrivalsapi.com/api/v1/heroes", {
    headers: { "x-api-key": apiKey },
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!response.ok) {
    return;
  }

  const data = (await response.json()) as HeroListEntry[];
  registerHeroApiRoles(data);
  for (const hero of data) {
    heroNameCache.set(String(hero.id), hero.name);
  }
}

async function fetchHeroDetail(
  heroId: string,
  apiKey: string,
): Promise<HeroDetail | null> {
  const cached = heroDetailCache.get(heroId);
  if (cached) {
    return cached;
  }

  const response = await fetch(
    `https://marvelrivalsapi.com/api/v1/heroes/hero/${encodeURIComponent(heroId)}`,
    {
      headers: { "x-api-key": apiKey },
      next: { revalidate: 60 * 60 * 24 },
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as HeroDetail;
  if (data.id && data.name) {
    heroNameCache.set(String(data.id), data.name);
    heroDetailCache.set(String(data.id), data);
    return data;
  }

  return null;
}

function normalizeHeroName(name: string): string {
  return name
    .split(" ")
    .map((part) =>
      part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : part,
    )
    .join(" ");
}

function formatHeroLabel(
  detail: HeroDetail,
  variantId: number,
  baseId: number,
): string {
  const baseName = normalizeHeroName(detail.name ?? "Unknown");
  const roleLabel = getVariantRoleLabel(baseId, variantId);

  if (roleLabel) {
    return `${baseName} (${roleLabel})`;
  }

  if (variantId <= 0) {
    return baseName;
  }

  const transformation = detail.transformations?.find(
    (entry) => entry.id === String(variantId),
  );

  if (transformation?.name) {
    const variantName = normalizeHeroName(transformation.name);
    if (variantName.toLowerCase() !== baseName.toLowerCase()) {
      return `${baseName} (${variantName})`;
    }
  }

  return `${baseName} (Form ${variantId + 1})`;
}

async function resolveHeroId(
  heroId: number,
  fallbackName: string,
  apiKey: string,
): Promise<string> {
  if (!isUnknownHeroName(fallbackName)) {
    return normalizeHeroName(fallbackName);
  }

  const decoded = decodeCompositeHeroId(heroId);

  if (!decoded.isComposite) {
    const cached = heroNameCache.get(String(heroId));
    if (cached) {
      return normalizeHeroName(cached);
    }

    const detail = await fetchHeroDetail(String(heroId), apiKey);
    if (detail?.name) {
      return formatHeroLabel(detail, 0, heroId);
    }

    return `Unrecognized hero (#${heroId})`;
  }

  const detail = await fetchHeroDetail(String(decoded.baseId), apiKey);
  if (detail?.name) {
    return formatHeroLabel(detail, decoded.variantId, decoded.baseId);
  }

  return `Unrecognized hero (#${heroId}, base #${decoded.baseId})`;
}

export async function resolveHeroNames(
  apiKey: string,
  heroes: Array<{ hero_id?: number; hero_name?: string }>,
): Promise<Map<number, string>> {
  if (!heroListPromise) {
    heroListPromise = loadHeroList(apiKey);
  }

  await heroListPromise;

  const resolved = new Map<number, string>();

  for (const hero of heroes) {
    if (hero.hero_id === undefined) continue;

    resolved.set(
      hero.hero_id,
      await resolveHeroId(
        hero.hero_id,
        hero.hero_name?.trim() ?? "",
        apiKey,
      ),
    );
  }

  return resolved;
}

export function isRecognizedHeroName(name: string): boolean {
  return !name.toLowerCase().startsWith("unrecognized hero");
}

export interface UnresolvedHeroDebugInfo {
  heroId: number;
  apiName: string;
  decodedBaseId: number;
  decodedVariantId: number;
  matches: number;
  wins: number;
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  heal: number;
  playTimeSeconds: number;
}

export function extractUnresolvedHeroDebug(
  hero: {
    hero_id?: number;
    hero_name?: string;
    matches?: number;
    wins?: number;
    kills?: number;
    deaths?: number;
    assists?: number;
    damage?: number;
    heal?: number;
    play_time?: number;
  },
): UnresolvedHeroDebugInfo | null {
  if (hero.hero_id === undefined) return null;

  const decoded = decodeCompositeHeroId(hero.hero_id);
  const apiName = hero.hero_name?.trim() ?? "";

  if (!isUnknownHeroName(apiName) && !decoded.isComposite) {
    return null;
  }

  return {
    heroId: hero.hero_id,
    apiName,
    decodedBaseId: decoded.baseId,
    decodedVariantId: decoded.variantId,
    matches: hero.matches ?? 0,
    wins: hero.wins ?? 0,
    kills: hero.kills ?? 0,
    deaths: hero.deaths ?? 0,
    assists: hero.assists ?? 0,
    damage: hero.damage ?? 0,
    heal: hero.heal ?? 0,
    playTimeSeconds: hero.play_time ?? 0,
  };
}
