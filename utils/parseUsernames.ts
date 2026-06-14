/**
 * Parse user-entered names from newline or comma-separated input.
 */
export function parseUsernames(input: string): string[] {
  const seen = new Set<string>();
  const usernames: string[] = [];

  for (const part of input.split(/[\n,]+/)) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    usernames.push(trimmed);
  }

  return usernames;
}
