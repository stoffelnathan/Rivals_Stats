export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatPlayTime(seconds: number): string {
  if (seconds <= 0) {
    return "0m";
  }

  const totalMinutes = Math.round(seconds / 60);
  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function formatKda(
  kills: number,
  deaths: number,
  assists: number,
): { display: string; raw: number | null } {
  if (kills === 0 && deaths === 0 && assists === 0) {
    return { display: "N/A", raw: null };
  }

  const raw = deaths > 0 ? (kills + assists) / deaths : kills + assists;
  return { display: raw.toFixed(2), raw };
}
