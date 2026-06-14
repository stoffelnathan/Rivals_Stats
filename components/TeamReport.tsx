"use client";

import { Crown, Shield, Target, Users } from "lucide-react";

import { RoleBadge } from "@/components/RoleBadge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { TeamAnalysis } from "@/types";

export function TeamReport({ analysis }: { analysis: TeamAnalysis }) {
  return (
    <Card className="scout-card border-[#e85dab]/35 ring-0">
      <CardHeader>
        <CardTitle className="scout-section-title scout-section-title-magenta flex items-center gap-2 text-lg">
          <Target className="size-5 text-[#e85dab]" />
          Team Lobby Analysis
        </CardTitle>
        <CardDescription className="scout-subtitle">
          Recent ranked stats for each player in this lobby.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="scout-section-title flex items-center gap-2">
            <Users className="size-4" />
            Lobby Roster
          </p>
          <ul className="space-y-2">
            {analysis.players.map((player) => (
              <li key={player.username} className="scout-roster-row">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-[#eef2ff]">
                    {player.username}
                  </span>
                  <RoleBadge role={player.playerRole} />
                </div>
                {player.topHeroes.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm text-[#9aa3c7]">
                    {player.topHeroes.map((hero) => (
                      <li key={`${player.username}-${hero}`}>{hero}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>

        <Separator className="scout-separator" />

        <HighlightSection
          title="Strongest Player"
          icon={<Crown className="size-4 text-[#f5b942]" />}
          highlight={analysis.strongest}
          tone="strong"
        />
        <Separator className="scout-separator" />
        <HighlightSection
          title="Weakest Player"
          icon={<Shield className="size-4 text-[#9aa3c7]" />}
          highlight={analysis.weakest}
          tone="weak"
        />
      </CardContent>
    </Card>
  );
}

function HighlightSection({
  title,
  icon,
  highlight,
  tone,
}: {
  title: string;
  icon: React.ReactNode;
  highlight: TeamAnalysis["strongest"];
  tone: "strong" | "weak";
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <p className="font-[family-name:var(--font-display)] font-medium tracking-wide text-[#eef2ff]">
          {title}
        </p>
        <Badge
          variant="outline"
          className={
            tone === "strong"
              ? "scout-highlight-name"
              : "border-[#93a0dc]/35 bg-[#1e2445] text-[#9aa3c7]"
          }
        >
          {highlight.username}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Stat label="Role" value={highlight.playerRole} />
        <Stat label="Recent Ranked MVP Rate" value={highlight.mvpRate} highlight />
        <Stat label="Recent Ranked KDA" value={highlight.kda} />
        <Stat label="Recent Ranked Win Rate" value={highlight.winRate} />
      </div>
      {highlight.topHeroes.length > 0 && (
        <ul className="space-y-1 text-sm text-[#9aa3c7]">
          {highlight.topHeroes.map((hero) => (
            <li key={hero}>{hero}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="scout-stat">
      <p className="scout-stat-label">{label}</p>
      <p className={highlight ? "scout-stat-value" : "font-medium text-[#eef2ff]"}>
        {value}
      </p>
    </div>
  );
}
