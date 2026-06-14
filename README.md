# Rivals Scout

Hero shooter scout tool — look up recent ranked stats, hero usage, and team lobby analysis via the Marvel Rivals API.

## Features

- Manual username input (single player or team lobby)
- Recent ranked player profiles: rank, role, KDA, win rate, top heroes
- Team lobby analysis: roster summary, strongest/weakest by MVP rate

## Getting Started

```powershell
npm install
Copy-Item .env.example .env.local
# Add your MARVEL_RIVALS_API_KEY to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MARVEL_RIVALS_API_KEY` | API key from [MarvelRivalsAPI.com](https://marvelrivalsapi.com) |

## Deployment (Vercel)

Same flow as [FFootball Archive](https://github.com/stoffelnathan/FFootball-Archive): GitHub → Vercel, with secrets in project env vars.

### 1. Push code to GitHub

Repo: [github.com/stoffelnathan/Rivals_Stats](https://github.com/stoffelnathan/Rivals_Stats)

```powershell
git push origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import **Rivals_Stats**
2. Set the project name to **`rivals-scout`** (URL: `https://rivals-scout.vercel.app`)
3. Framework preset: **Next.js** (auto-detected)
4. Add environment variable:

| Variable | Value |
|----------|--------|
| `MARVEL_RIVALS_API_KEY` | Your key from MarvelRivalsAPI.com |

5. Deploy

### 3. Verify

Open `https://rivals-scout.vercel.app`, enter a username, and confirm stats load.

### Making changes after deploy

- **Code/UI changes:** push to `main` on GitHub → Vercel redeploys automatically
- **API key rotation:** update `MARVEL_RIVALS_API_KEY` in Vercel → Settings → Environment Variables, then redeploy

### CLI deploy (optional)

```powershell
npx vercel link --project rivals-scout
npx vercel env add MARVEL_RIVALS_API_KEY
npx vercel --prod
```

### Local production build test

```powershell
npm run build
npm run start
```
