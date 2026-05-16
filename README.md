# GetMeHired

**Live demo: [get-me-hired-ht89vu8i5-navyas-projects-6c360713.vercel.app](https://get-me-hired-ht89vu8i5-navyas-projects-6c360713.vercel.app/)**

A real-time job board for CS graduates and software engineers in Sydney, Australia. Scrapes live listings from Seek, LinkedIn, Indeed and more via the Adzuna API, with save/apply tracking, search, filtering, and sorting.

## Features

- **Real job listings** — live data from Seek, LinkedIn, Indeed, and more via Adzuna
- **Save jobs** — bookmark roles with a green sidebar indicator
- **Track applications** — mark as applied with a blue sidebar indicator
- **Search** — filter by title, company, description, or skill
- **Location filter** — CBD, North Sydney, Macquarie Park, Parramatta, Remote
- **Type & source filters** — Graduate, Full Stack, AI/ML, DevOps; Seek, LinkedIn, Indeed, Adzuna
- **Sort** — by date posted, company rating, or A–Z
- **Persistent** — saved/applied state survives page refresh via localStorage
- **Direct links** — every listing links to the real job posting

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Adzuna API** — real-time job aggregation from Seek, LinkedIn, Indeed & more

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/NAVYAB541/getmehired.git
cd getmehired
npm install
```

### 2. Set up API keys

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
ADZUNA_APP_ID=your-app-id
ADZUNA_APP_KEY=your-app-key
```

Get your free Adzuna key at [developer.adzuna.com](https://developer.adzuna.com).

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

Add `ADZUNA_APP_ID` and `ADZUNA_APP_KEY` in your Vercel project environment variables.

## Project Structure

```
app/
├── api/jobs/route.ts   # Server-side Adzuna API call
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
| `ADZUNA_APP_ID` | Adzuna App ID — free at developer.adzuna.com |
| `ADZUNA_APP_KEY` | Adzuna App Key — free at developer.adzuna.com |

## Notes

- Job listings are real and sourced live from major Australian job boards.
- Each "View & apply" link goes directly to the original job posting.
- Free tier: 250 API requests/day.
