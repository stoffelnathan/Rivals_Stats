"use client";

import { useState } from "react";
import { RefreshCw, Zap } from "lucide-react";

import { PlayerProfileCard } from "@/components/PlayerProfileCard";
import { TeamReport } from "@/components/TeamReport";
import { UsernameInput } from "@/components/UsernameInput";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { PlayerLookupResponse, PlayerProfile } from "@/types";

export function ScoutApp() {
  const [input, setInput] = useState("");
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [teamAnalysis, setTeamAnalysis] =
    useState<PlayerLookupResponse["teamAnalysis"]>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleLookup(usernames: string[]) {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernames }),
      });

      if (!response.ok) {
        const data = (await response.json()) as PlayerLookupResponse;
        throw new Error(
          data.error ?? "Player lookup request failed.",
        );
      }

      const data = (await response.json()) as PlayerLookupResponse;
      setPlayers(data.players);
      setTeamAnalysis(data.teamAnalysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed.");
      setPlayers([]);
      setTeamAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setInput("");
    setPlayers([]);
    setTeamAnalysis(null);
    setError(null);
    setHasSearched(false);
  }

  return (
    <div className="scout-arena scout-grid min-h-full">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 py-8">
        <header className="space-y-3 text-center">
          <div className="scout-icon-ring mx-auto">
            <Zap className="size-6" aria-hidden />
          </div>
          <div className="space-y-1">
            <h1 className="scout-title">Rivals Scout</h1>
            <p className="scout-subtitle text-sm">
              Recent ranked stats · hero pools · lobby breakdown
            </p>
          </div>
        </header>

        <UsernameInput
          value={input}
          onChange={setInput}
          onSubmit={handleLookup}
          isLoading={isLoading}
        />

        {error && (
          <Alert
            variant="destructive"
            className="scout-card scout-card-danger border-[#f05d5e]/40"
          >
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <Alert className="scout-card scout-alert-cyan">
            <AlertTitle>Scanning players…</AlertTitle>
            <AlertDescription>
              Pulling recent ranked data from the API.
            </AlertDescription>
          </Alert>
        )}

        {teamAnalysis && <TeamReport analysis={teamAnalysis} />}

        {players.length === 1 &&
          players.map((player) => (
            <PlayerProfileCard key={player.username} player={player} />
          ))}

        {hasSearched && !isLoading && players.length === 0 && !error && (
          <Alert className="scout-card">
            <AlertTitle>No results</AlertTitle>
            <AlertDescription>
              Enter at least one username to look up player stats.
            </AlertDescription>
          </Alert>
        )}

        {hasSearched && (
          <Button
            variant="outline"
            onClick={handleReset}
            className="scout-btn-outline"
          >
            <RefreshCw data-icon="inline-start" />
            Clear Results
          </Button>
        )}
      </div>
    </div>
  );
}
