# SydneyDevJobs 🦘

An AI-powered job board for CS graduates and software engineers in Sydney, Australia. Fetches real-time job listings using Claude AI, with save/apply tracking, search, filtering, and sorting.

## Features

- 🔍 **AI-powered fetch** — generates 20 realistic, current Sydney CS & SWE job listings per fetch
- 📌 **Save jobs** — bookmark roles with a green sidebar indicator
- ✅ **Track applications** — mark as applied with a blue sidebar indicator
- 🔎 **Search** — filter by title, company, description, or skill
- 📍 **Location filter** — CBD, North Sydney, Macquarie Park, Parramatta, Remote
- 🏷️ **Type & source filters** — Graduate, Full Stack, AI/ML, DevOps; Seek, LinkedIn, GradAustralia, Indeed, Otta
- 📊 **Sort** — by date posted, company rating, or A–Z
- 💾 **Persistent** — saved/applied state survives page refresh via localStorage
- 🔗 **Direct links** — every listing links out to the real job posting

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Anthropic Claude API** (server-side, key never exposed to client)

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/sydney-dev-jobs.git
cd sydney-dev-jobs
npm install
```

### 2. Set up your API key

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Get your key at [console.anthropic.com](https://console.anthropic.com).

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment (Vercel)

```bash
npm install -g vercel
vercel
```

Add `ANTHROPIC_API_KEY` in your Vercel project environment variables.

## Project Structure

```
src/
├── app/
│   ├── api/jobs/route.ts   # Server-side Anthropic API call
│   ├── page.tsx            # Main job board UI
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── JobCard.tsx         # Individual job listing card
│   └── StatsBar.tsx        # Summary stats row
└── lib/
    ├── types.ts            # TypeScript interfaces
    └── useLocalStorage.ts  # Persistent state hook
```

## Environment Variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (required) |

## Notes

- The AI generates realistic job listings based on real Sydney companies, real tech stacks, and plausible job board URLs. Links may not always point to live listings.
- Each fetch costs approximately 1,500–2,000 input tokens and 1,500 output tokens.
