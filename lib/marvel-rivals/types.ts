export interface MarvelRivalsHeroRanked {
  hero_name?: string;
  matches?: number;
  wins?: number;
}

export interface MarvelRivalsPlayerResponse {
  name?: string;
  player?: {
    level?: string;
    nickname?: string;
    rank?: {
      rank?: string;
    };
  };
  overall_stats?: {
    overall_kda?: {
      kda?: number;
    };
    total_wins?: {
      win_percentage?: {
        percentile?: number;
        placement?: string;
      };
    };
  };
  heroes_ranked?: MarvelRivalsHeroRanked[];
}
