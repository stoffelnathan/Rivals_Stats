"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { extractUsernames } from "@/lib/ocr/extractUsernames";
import { runOcr, type OcrProgress } from "@/lib/ocr/runOcr";
import type {
  CapturedImage,
  OcrResult,
  PlayerStatsSummary,
  ScoutStep,
} from "@/types";

interface ScoutContextValue {
  step: ScoutStep;
  capturedImage: CapturedImage | null;
  ocrResult: OcrResult | null;
  ocrProgress: OcrProgress | null;
  usernames: string[];
  playerStats: PlayerStatsSummary[];
  isProcessing: boolean;
  error: string | null;
  setCapturedImage: (image: CapturedImage) => void;
  runOcrOnCapture: () => Promise<void>;
  lookupPlayers: () => Promise<void>;
  reset: () => void;
}

const ScoutContext = createContext<ScoutContextValue | null>(null);

export function ScoutProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<ScoutStep>("camera");
  const [capturedImage, setCapturedImageState] = useState<CapturedImage | null>(
    null,
  );
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [ocrProgress, setOcrProgress] = useState<OcrProgress | null>(null);
  const [usernames, setUsernames] = useState<string[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStatsSummary[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setCapturedImage = useCallback((image: CapturedImage) => {
    setCapturedImageState(image);
    setOcrResult(null);
    setOcrProgress(null);
    setUsernames([]);
    setPlayerStats([]);
    setError(null);
    setStep("preview");
  }, []);

  const runOcrOnCapture = useCallback(async () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    setError(null);
    setStep("ocr");
    setOcrProgress({ status: "initializing", progress: 0 });

    try {
      const result = await runOcr(capturedImage.dataUrl, setOcrProgress);
      setOcrResult(result);

      const extracted = extractUsernames(result.text);
      setUsernames(extracted);
      setStep("usernames");
    } catch (err) {
      setError(err instanceof Error ? err.message : "OCR failed");
      setStep("preview");
    } finally {
      setIsProcessing(false);
      setOcrProgress(null);
    }
  }, [capturedImage]);

  const lookupPlayers = useCallback(async () => {
    if (usernames.length === 0) return;

    setIsProcessing(true);
    setError(null);
    setStep("stats");

    try {
      const response = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernames }),
      });

      if (!response.ok) {
        throw new Error("Player lookup request failed");
      }

      const data = (await response.json()) as { results: PlayerStatsSummary[] };
      setPlayerStats(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setIsProcessing(false);
    }
  }, [usernames]);

  const reset = useCallback(() => {
    setStep("camera");
    setCapturedImageState(null);
    setOcrResult(null);
    setOcrProgress(null);
    setUsernames([]);
    setPlayerStats([]);
    setIsProcessing(false);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      step,
      capturedImage,
      ocrResult,
      ocrProgress,
      usernames,
      playerStats,
      isProcessing,
      error,
      setCapturedImage,
      runOcrOnCapture,
      lookupPlayers,
      reset,
    }),
    [
      step,
      capturedImage,
      ocrResult,
      ocrProgress,
      usernames,
      playerStats,
      isProcessing,
      error,
      setCapturedImage,
      runOcrOnCapture,
      lookupPlayers,
      reset,
    ],
  );

  return (
    <ScoutContext.Provider value={value}>{children}</ScoutContext.Provider>
  );
}

export function useScout() {
  const context = useContext(ScoutContext);
  if (!context) {
    throw new Error("useScout must be used within ScoutProvider");
  }
  return context;
}
