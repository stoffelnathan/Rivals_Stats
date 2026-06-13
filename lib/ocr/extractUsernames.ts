/**
 * Convert raw OCR output into candidate usernames.
 * No correction, fuzzy matching, or normalization beyond basic cleanup.
 */
export function extractUsernames(ocrText: string): string[] {
  const lines = ocrText.split(/\r?\n/);
  const seen = new Set<string>();
  const usernames: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    usernames.push(trimmed);
  }

  return usernames;
}
