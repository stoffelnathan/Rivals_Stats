"use client";

import { CheckCircle2, RefreshCw } from "lucide-react";

import { CameraCapture, ImagePreview } from "@/components/camera/CameraCapture";
import { OcrResults } from "@/components/ocr/OcrResults";
import { PlayerStatsList } from "@/components/stats/PlayerStatsList";
import { UsernameList } from "@/components/usernames/UsernameList";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ScoutProvider, useScout } from "@/hooks/useScout";

function ScoutContent() {
  const { step, error, reset, playerStats } = useScout();
  const pocComplete =
    step === "stats" && playerStats.length > 0 && !error;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-6">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Marvel Rivals Scout</h1>
        <p className="text-sm text-muted-foreground">
          Scan a loading screen to detect players and look up their stats.
        </p>
      </header>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {(step === "camera" || step === "preview") && step === "camera" && (
        <CameraCapture />
      )}
      {(step === "preview" || step === "ocr") && <ImagePreview />}
      {(step === "ocr" || step === "usernames" || step === "stats") && (
        <OcrResults />
      )}
      {(step === "usernames" || step === "stats") && <UsernameList />}
      <PlayerStatsList />

      {pocComplete && (
        <Alert>
          <CheckCircle2 />
          <AlertTitle>Proof of Concept completed successfully.</AlertTitle>
          <AlertDescription>
            OCR, username extraction, and API lookup are functioning. The next
            phase requires a design decision regarding OCR correction strategy.
          </AlertDescription>
        </Alert>
      )}

      {step !== "camera" && (
        <Button variant="outline" onClick={reset}>
          <RefreshCw data-icon="inline-start" />
          Start Over
        </Button>
      )}
    </div>
  );
}

export function ScoutApp() {
  return (
    <ScoutProvider>
      <ScoutContent />
    </ScoutProvider>
  );
}
