export type ScoutStep = "camera" | "preview" | "ocr" | "usernames" | "stats";

export interface CapturedImage {
  dataUrl: string;
  width: number;
  height: number;
}

export interface OcrResult {
  text: string;
  confidence: number;
}

export interface PlayerStatsSummary {
  username: string;
  rank: string;
  level: string;
  winRate: string;
  kda: string;
  heroUsage: string[];
  success: boolean;
}

export interface PlayerLookupRequest {
  usernames: string[];
}

export interface PlayerLookupResponse {
  results: PlayerStatsSummary[];
}
