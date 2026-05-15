# GetMeHired 🦘

An AI-powered job board for CS graduates and software engineers in Sydney, Australia. Fetches job listings using Groq AI (LLaMA 3.3 70B), with save/apply tracking, search, filtering, and sorting.

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
- **Groq API** — LLaMA 3.3 70B (server-side, key never exposed to client)

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/NAVYAB541/getmehired.git
cd getmehired
npm install
```

### 2. Set up your API key

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Groq API key:

```
GROQ_API_KEY=gsk_...
```

Get your free key at [console.groq.com](https://console.groq.com).

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

Add `GROQ_API_KEY` in your Vercel project environment variables.

## Project Structure

```
app/
├── api/jobs/route.ts   # Server-side Groq API call
├── page.tsx            # Main job board UI
├── layout.tsx
├── globals.css
└── lib/
    ├── types.ts            # TypeScript interfaces
    └── useLocalStorage.ts  # Persistent state hook
```

## Environment Variables

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Your Groq API key (required) — free at console.groq.com |

## Notes

- The AI generates realistic job listings based on real Sydney companies, real tech stacks, and plausible job board URLs. Links may not always point to live listings.
- Groq runs LLaMA 3.3 70B at ~800 tokens/sec — responses arrive in seconds.
- Free tier: 14,400 requests/day, 500,000 tokens/minute.
