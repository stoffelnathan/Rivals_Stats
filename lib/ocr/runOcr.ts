import Tesseract from "tesseract.js";

import { preprocessImageForOcr } from "@/utils/imageProcessing";

import type { OcrResult } from "@/types";

export interface OcrProgress {
  status: string;
  progress: number;
}

export async function runOcr(
  imageDataUrl: string,
  onProgress?: (progress: OcrProgress) => void,
): Promise<OcrResult> {
  const preprocessed = await preprocessImageForOcr(imageDataUrl);

  const result = await Tesseract.recognize(preprocessed, "eng", {
    logger: (message) => {
      if (message.status && typeof message.progress === "number") {
        onProgress?.({
          status: message.status,
          progress: Math.round(message.progress * 100),
        });
      }
    },
  });

  return {
    text: result.data.text,
    confidence: result.data.confidence,
  };
}
