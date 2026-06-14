export interface MarvelRivalsHeroRanked {
  hero_id?: number;
  hero_name?: string;
  matches?: number;
  wins?: number;
  mvp?: number;
  svp?: number;
  kills?: number;
  deaths?: number;
  assists?: number;
  play_time?: number;
}

export interface MarvelRivalsModeStats {
  total_matches?: number;
  total_wins?: number;
  total_assists?: number;
  total_deaths?: number;
  total_kills?: number;
  total_mvp?: number;
  total_svp?: number;
}

export interface MarvelRivalsMatchPerformance {
  player_uid?: number;
  hero_id?: number;
  hero_name?: string;
  kills?: number;
  deaths?: number;
  assists?: number;
  is_win?: {
    is_win?: boolean;
  };
}

export interface MarvelRivalsPlayerResponse {
  uid?: number | string;
  name?: string;
  updates?: {
    info_update_time?: string;
    last_history_update?: string | null;
  };
  player?: {
    level?: string;
    nickname?: string;
    rank?: {
      rank?: string;
      peak_rank?: {
        rank?: string;
      };
      score?: string;
    };
    info?: {
      rank_game_season?: Record<
        string,
        {
          level?: number;
          max_level?: number;
          rank_score?: number;
          update_time?: number;
          win_count?: number;
        }
      >;
    };
  };
  rank_history?: Array<{
    match_time_stamp?: number;
    level_progression?: { to?: number };
    score_progression?: { total_score?: number };
  }>;
  overall_stats?: {
    total_matches?: number;
    total_wins?:
      | number
      | {
          wins?: number;
          win_percentage?: {
            percentile?: number;
            percentile_raw?: number;
            placement?: string;
          };
        };
    overall_kda?: {
      kda?: number;
    };
    total_mvps?: {
      mvps?: number;
      mvp_percentage?: {
        percentile?: number;
        percentile_raw?: number;
        placement?: string;
      };
    };
    ranked?: MarvelRivalsModeStats;
    unranked?: MarvelRivalsModeStats;
  };
  heroes_ranked?: MarvelRivalsHeroRanked[];
  heroes_unranked?: MarvelRivalsHeroRanked[];
  match_history?: Array<{
    match_uid?: string;
    match_time_stamp?: number;
    date?: string;
    season?: number;
    player_performance?: MarvelRivalsMatchPerformance;
  }>;
}

/** Typical MVP rate when one player earns MVP per 12-player match. */
export const POPULATION_AVERAGE_MVP_RATE = 100 / 12;
