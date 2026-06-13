"use client";

import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useScout } from "@/hooks/useScout";

export function PlayerStatsList() {
  const { playerStats, isProcessing, step } = useScout();

  if (step !== "stats" || playerStats.length === 0) {
    if (isProcessing && step === "stats") {
      return (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Looking Up Players</CardTitle>
            <CardDescription>Fetching stats from Marvel Rivals API...</CardDescription>
          </CardHeader>
        </Card>
      );
    }
    return null;
  }

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Player Stats</CardTitle>
          <CardDescription>
            Proof of concept lookup results for detected usernames.
          </CardDescription>
        </CardHeader>
      </Card>

      {playerStats.map((player) => (
        <Card key={player.username}>
          <CardHeader>
            <CardTitle className="text-lg">{player.username}</CardTitle>
            {!player.success && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertTitle>Lookup Failed</AlertTitle>
                <AlertDescription>
                  Could not retrieve stats for this username.
                </AlertDescription>
              </Alert>
            )}
          </CardHeader>
          {player.success && (
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Rank" value={player.rank} />
                <Stat label="Level" value={player.level} />
                <Stat label="Win Rate" value={player.winRate} />
                <Stat label="KDA" value={player.kda} />
              </div>
              {player.heroUsage.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="mb-2 font-medium">Hero Usage</p>
                    <ul className="space-y-1 text-muted-foreground">
                      {player.heroUsage.map((hero) => (
                        <li key={hero}>{hero}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
