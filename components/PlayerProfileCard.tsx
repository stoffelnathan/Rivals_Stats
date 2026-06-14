"use client";

import { AlertCircle, User } from "lucide-react";

import { RoleBadge } from "@/components/RoleBadge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatHeroRecord } from "@/lib/marvel-rivals/heroDisplay";
import type { PlayerProfile } from "@/types";
import { INDIVIDUAL_HERO_LIMIT } from "@/types";

export function PlayerProfileCard({ player }: { player: PlayerProfile }) {
  if (!player.success) {
    return (
      <Card className="scout-card scout-card-danger ring-0">
        <CardHeader>
          <CardTitle>{player.username}</CardTitle>
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Lookup Failed</AlertTitle>
            <AlertDescription>
              {player.errorMessage ??
                "Could not retrieve stats for this username."}
            </AlertDescription>
          </Alert>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="scout-card ring-0">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="scout-user-icon">
              <User className="size-4" />
            </div>
            <CardTitle className="font-[family-name:var(--font-display)] text-xl tracking-wide text-[#eef2ff]">
              {player.username}
            </CardTitle>
          </div>
          <RoleBadge role={player.playerRole.label} />
        </div>
        <CardDescription className="scout-subtitle space-y-1">
          <p>
            {player.searchedUsername &&
            player.searchedUsername.toLowerCase() !==
              player.username.toLowerCase()
              ? `Searched as ${player.searchedUsername} · `
              : ""}
            Level {player.level} · {player.totalMatches} recent ranked matches
          </p>
          {player.matchHistoryRange && player.matchHistoryCount > 0 && (
            <p className="text-xs">
              Sample ({player.matchHistoryCount} games): {player.matchHistoryRange}
            </p>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {player.matchWarning && (
          <Alert className="border-[#f5b942]/35 bg-[#f5b942]/10">
            <AlertTitle className="text-[#f5b942]">Account match note</AlertTitle>
            <AlertDescription>{player.matchWarning}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Stat label="Current Rank" value={player.rank} />
          <Stat label="Peak Rank" value={player.peakRank} />
          <Stat label="Recent Ranked Win Rate" value={player.winRate} />
          <Stat label="Recent Ranked KDA" value={player.kda} />
        </div>

        {player.heroes.length > 0 && (
          <>
            <Separator className="scout-separator" />
            <div>
              <p className="scout-section-title mb-2 text-base">
                Recent Ranked Heroes
              </p>
              <ul className="space-y-2">
                {player.heroes.slice(0, INDIVIDUAL_HERO_LIMIT).map((hero) => (
                  <li key={`${hero.heroId}-${hero.name}`} className="scout-hero-row">
                    {formatHeroRecord(hero)}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="scout-stat">
      <p className="scout-stat-label">{label}</p>
      <p className="scout-stat-value">{value}</p>
    </div>
  );
}
