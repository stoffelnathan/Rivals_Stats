"use client";

import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useScout } from "@/hooks/useScout";

export function OcrResults() {
  const { ocrResult, ocrProgress, isProcessing } = useScout();

  if (isProcessing && ocrProgress) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Running OCR</CardTitle>
          <CardDescription>{ocrProgress.status}</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={ocrProgress.progress} className="w-full" />
          <p className="mt-2 text-sm text-muted-foreground">
            {ocrProgress.progress}% complete
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!ocrResult) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Raw OCR Output</CardTitle>
        <CardDescription>
          Confidence: {ocrResult.confidence.toFixed(1)}%
        </CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">
          {ocrResult.text || "(no text detected)"}
        </pre>
      </CardContent>
    </Card>
  );
}
