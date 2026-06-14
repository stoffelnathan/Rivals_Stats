import type { BaseRole, Playstyle } from "@/lib/analysis/heroRoles";

export interface HeroStat {
  heroId: number;
  name: string;
  matches: number;
  wins: number;
  losses: number;
  winRate: string;
  winRateRaw: number;
  playTime: string;
  playTimeSeconds: number;
  playTimeShare: number;
  matchShare: number;
  kda: string;
  kdaRaw: number | null;
  mvp: number;
  svp: number;
  baseRole: BaseRole | null;
  playstyle: Playstyle | null;
  roleLabel: string | null;
}

export interface PlayerRoleClassification {
  label: string;
  baseRoles: BaseRole[];
  primaryFocus: string | null;
  reason: string;
}

export interface RecentOneTrickSignal {
  hero: string;
  heroId: number;
  games: number;
  windowGames: number;
  sharePercent: string;
}

export interface PlayerProfile {
  username: string;
  searchedUsername?: string;
  uid: string;
  matchedName: string | null;
  matchWarning: string | null;
  dataLastUpdated: string | null;
  lastMatchDate: string | null;
  matchHistoryRange: string | null;
  matchHistoryCount: number;
  lastRankUpdateDate: string | null;
  statsScope: "recent-ranked";
  success: boolean;
  errorMessage?: string;
  rank: string;
  peakRank: string;
  level: string;
  winRate: string;
  winRateRaw: number | null;
  kda: string;
  kdaRaw: number | null;
  totalMatches: number;
  mvpCount: number;
  mvpRate: string;
  mvpRateRaw: number | null;
  averageMvpRate: string;
  mvpComparison: string;
  heroes: HeroStat[];
  playerRole: PlayerRoleClassification;
  recentOneTrick: RecentOneTrickSignal | null;
  powerScore: number | null;
}

export interface TeamPlayerSummary {
  username: string;
  playerRole: string;
  topHeroes: string[];
}

export interface TeamAnalysis {
  players: TeamPlayerSummary[];
  strongest: PlayerHighlight;
  weakest: PlayerHighlight;
}

export interface PlayerHighlight {
  username: string;
  rank: string;
  peakRank: string;
  kda: string;
  winRate: string;
  mvpRate: string;
  playerRole: string;
  topHeroes: string[];
}

export interface PlayerLookupRequest {
  usernames: string[];
}

export interface PlayerLookupResponse {
  players: PlayerProfile[];
  teamAnalysis: TeamAnalysis | null;
  error?: string;
}

export const INDIVIDUAL_HERO_LIMIT = 5;
export const TEAM_HERO_LIMIT = 3;
