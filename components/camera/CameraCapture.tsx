"use client";

import { Camera, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCamera } from "@/hooks/useCamera";
import { useScout } from "@/hooks/useScout";

export function CameraCapture() {
  const { setCapturedImage } = useScout();
  const { videoRef, isActive, error, startCamera, capturePhoto } = useCamera({
    onCapture: setCapturedImage,
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Capture Loading Screen</CardTitle>
        <CardDescription>
          Point your camera at the Marvel Rivals lobby loading screen.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            playsInline
            muted
          />
          {!isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-4 text-center text-sm text-white">
              {error ?? "Tap Start Camera to begin"}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {!isActive ? (
            <Button className="w-full" onClick={startCamera}>
              <Camera data-icon="inline-start" />
              Start Camera
            </Button>
          ) : (
            <Button className="w-full" onClick={capturePhoto}>
              <Camera data-icon="inline-start" />
              Capture Photo
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ImagePreview() {
  const { capturedImage, runOcrOnCapture, isProcessing, reset } = useScout();

  if (!capturedImage) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Captured Image</CardTitle>
        <CardDescription>Review your photo before running OCR.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={capturedImage.dataUrl}
          alt="Captured loading screen"
          className="aspect-[3/4] w-full rounded-lg object-cover"
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            className="w-full"
            onClick={runOcrOnCapture}
            disabled={isProcessing}
          >
            Run OCR
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={reset}
            disabled={isProcessing}
          >
            <RefreshCw data-icon="inline-start" />
            Retake
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
