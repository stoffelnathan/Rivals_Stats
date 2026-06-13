# Rivals Stats

Marvel Rivals Scout — a mobile-first web app that captures a loading screen photo, runs browser OCR to detect player usernames, and looks up stats via the Marvel Rivals API.

## Proof of Concept (Phases 1–6)

- Next.js App Router with TypeScript and Tailwind CSS
- shadcn/ui components
- Browser camera capture (rear camera preferred)
- Tesseract.js OCR in the browser
- Username extraction from raw OCR output
- Marvel Rivals API lookup via Next.js API route

## Getting Started

```bash
npm install
cp .env.example .env.local
# Add your MARVEL_RIVALS_API_KEY to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on a mobile device or desktop with a camera.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MARVEL_RIVALS_API_KEY` | API key from [MarvelRivalsAPI.com](https://marvelrivalsapi.com) |

## Deployment

Deploy to Vercel and set `MARVEL_RIVALS_API_KEY` in project environment variables.

## Status

Proof of concept complete. OCR correction, lobby reports, caching, and accounts are planned for future phases.
