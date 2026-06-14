import { decodeCompositeHeroId } from "@/lib/marvel-rivals/heroes";

export type BaseRole = "Tank" | "DPS" | "Support";

export type Playstyle =
  | "Main Tank"
  | "Brawl Tank"
  | "Poke DPS"
  | "Dive DPS"
  | "Brawl DPS"
  | "Support";

export interface HeroRoleProfile {
  baseRole: BaseRole;
  playstyle: Playstyle;
}

/** API Vanguard / Duelist / Strategist → scout base role. */
const API_ROLE_TO_BASE: Record<string, BaseRole> = {
  Vanguard: "Tank",
  Duelist: "DPS",
  Strategist: "Support",
};

/**
 * Playstyle overrides keyed by base hero ID.
 * Defaults: Vanguard → Brawl Tank, Duelist → Brawl DPS, Strategist → Support.
 */
const PLAYSTYLE_OVERRIDES: Record<number, Playstyle> = {
  1011: "Brawl Tank", // Hulk
  1014: "Poke DPS", // Punisher
  1015: "Poke DPS", // Storm
  1017: "Brawl DPS", // Human Torch
  1018: "Brawl Tank", // Doctor Strange
  1021: "Poke DPS", // Hawkeye
  1022: "Main Tank", // Captain America
  1024: "Poke DPS", // Hela
  1026: "Dive DPS", // Black Panther
  1027: "Main Tank", // Groot
  1029: "Dive DPS", // Magik
  1030: "Dive DPS", // Moon Knight
  1032: "Brawl DPS", // Squirrel Girl
  1033: "Poke DPS", // Black Widow
  1034: "Brawl DPS", // Iron Man
  1036: "Dive DPS", // Spider-Man
  1037: "Main Tank", // Magneto
  1038: "Brawl DPS", // Scarlet Witch
  1039: "Main Tank", // Thor
  1040: "Poke DPS", // Mister Fantastic
  1041: "Poke DPS", // Winter Soldier
  1042: "Brawl Tank", // Peni Parker
  1043: "Dive DPS", // Star-Lord
  1045: "Brawl DPS", // Namor
  1048: "Dive DPS", // Psylocke
  1049: "Dive DPS", // Wolverine
  1051: "Main Tank", // The Thing
  1052: "Dive DPS", // Iron Fist
  1053: "Brawl Tank", // Emma Frost
  1054: "Poke DPS", // Phoenix
  1057: "Brawl DPS", // Deadpool (default duelist form)
  1061: "Dive DPS", // Black Cat
  1062: "Brawl Tank", // Devil Dinosaur
  1065: "Brawl Tank", // Rogue
};

/** Deadpool composite forms: baseId 1057, variantId → role. */
const DEADPOOL_VARIANT_PROFILES: Record<number, HeroRoleProfile> = {
  0: { baseRole: "DPS", playstyle: "Brawl DPS" },
  1: { baseRole: "Tank", playstyle: "Brawl Tank" },
  2: { baseRole: "DPS", playstyle: "Brawl DPS" },
  3: { baseRole: "Support", playstyle: "Support" },
};

/** Heroes not always present on the public list endpoint. */
const EXTRA_API_ROLES: Record<number, string> = {
  1057: "Duelist",
  1061: "Duelist",
  1062: "Vanguard",
  1065: "Vanguard",
};

const DEFAULT_PLAYSTYLE_BY_BASE: Record<BaseRole, Playstyle> = {
  Tank: "Brawl Tank",
  DPS: "Brawl DPS",
  Support: "Support",
};

export function getHeroRoleProfile(heroId: number): HeroRoleProfile | null {
  const decoded = decodeCompositeHeroId(heroId);

  if (decoded.baseId === 1057 && decoded.isComposite) {
    return DEADPOOL_VARIANT_PROFILES[decoded.variantId] ?? null;
  }

  const apiRole = EXTRA_API_ROLES[decoded.baseId];
  if (!apiRole) {
    return null;
  }

  const baseRole = API_ROLE_TO_BASE[apiRole];
  if (!baseRole) {
    return null;
  }

  const playstyle =
    PLAYSTYLE_OVERRIDES[decoded.baseId] ?? DEFAULT_PLAYSTYLE_BY_BASE[baseRole];

  return { baseRole, playstyle };
}

export function registerHeroApiRoles(
  heroes: Array<{ id: string; role: string }>,
): void {
  for (const hero of heroes) {
    const id = Number(hero.id);
    if (!Number.isFinite(id) || EXTRA_API_ROLES[id]) continue;
    EXTRA_API_ROLES[id] = hero.role;
  }
}
