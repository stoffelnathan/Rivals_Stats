import type { HeroStat, PlayerRoleClassification } from "@/types";

import {
  type BaseRole,
  type Playstyle,
  getHeroRoleProfile,
} from "./heroRoles";

const ALL_BASE_ROLES: BaseRole[] = ["Tank", "DPS", "Support"];

function playstyleLabel(playstyle: Playstyle): string {
  return playstyle;
}

function dominantPlaystyle(
  heroes: HeroStat[],
): { playstyle: Playstyle; share: number } | null {
  const weights = new Map<Playstyle, number>();

  for (const hero of heroes) {
    if (!hero.playstyle) continue;
    weights.set(
      hero.playstyle,
      (weights.get(hero.playstyle) ?? 0) + hero.matchShare,
    );
  }

  let best: { playstyle: Playstyle; share: number } | null = null;
  for (const [playstyle, share] of weights) {
    if (!best || share > best.share) {
      best = { playstyle, share };
    }
  }

  return best;
}

function baseRolesPlayed(heroes: HeroStat[]): Set<BaseRole> {
  const roles = new Set<BaseRole>();
  for (const hero of heroes) {
    if (hero.baseRole && hero.matches > 0) {
      roles.add(hero.baseRole);
    }
  }
  return roles;
}

export function classifyPlayerRole(heroes: HeroStat[]): PlayerRoleClassification {
  const recentHeroes = heroes.filter((hero) => hero.matches > 0 && hero.baseRole);
  const rolesPlayed = baseRolesPlayed(recentHeroes);
  const focus = dominantPlaystyle(recentHeroes);

  if (rolesPlayed.size >= 3) {
    return {
      label: "Flex",
      baseRoles: ALL_BASE_ROLES.filter((role) => rolesPlayed.has(role)),
      primaryFocus: focus
        ? `${playstyleLabel(focus.playstyle)} focus`
        : null,
      reason: "Recent ranked games span Tank, DPS, and Support picks.",
    };
  }

  if (rolesPlayed.size === 2) {
    const roleNames = ALL_BASE_ROLES.filter((role) => rolesPlayed.has(role)).join(
      " / ",
    );
    return {
      label: `${roleNames} Flex`,
      baseRoles: ALL_BASE_ROLES.filter((role) => rolesPlayed.has(role)),
      primaryFocus: focus
        ? `${playstyleLabel(focus.playstyle)} focus`
        : null,
      reason: `Recent ranked games lean ${roleNames}.`,
    };
  }

  const topByMatches = [...recentHeroes]
    .sort((a, b) => b.matches - a.matches)
    .slice(0, 3);

  const specialistStyle =
    dominantPlaystyle(topByMatches)?.playstyle ?? focus?.playstyle;

  if (specialistStyle) {
    return {
      label: playstyleLabel(specialistStyle),
      baseRoles: [
        topByMatches[0]?.baseRole ??
          getHeroRoleProfile(topByMatches[0]?.heroId ?? -1)?.baseRole ??
          "Tank",
      ],
      primaryFocus: null,
      reason: `Recent ranked hero pool skews toward ${playstyleLabel(specialistStyle)}.`,
    };
  }

  return {
    label: "Unknown",
    baseRoles: [],
    primaryFocus: null,
    reason: "Not enough recent hero data to classify.",
  };
}
