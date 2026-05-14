import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `You generate realistic, current Sydney Australia job listings for CS graduates and software engineers.
Return ONLY a valid JSON array — no markdown, no code fences, no preamble. Each object must have exactly these keys:

id           – unique 8-char alphanumeric string
title        – job title
company      – real or plausible Sydney company name
location     – Sydney suburb (e.g. "Sydney CBD", "North Sydney", "Parramatta", "Macquarie Park", "Pyrmont", "Chatswood")
type         – one of: Graduate | Junior | Software Engineer | Full Stack | Frontend | Backend | AI / ML | DevOps | Data
source       – one of: Seek | LinkedIn | GradAustralia | Indeed | Otta
postedDaysAgo – integer 0–14
companyRating – float 3.2–5.0 to 1 decimal place
description  – 2 specific sentences mentioning the tech stack and what the role does
url          – realistic URL on a job board or company careers page
remote       – boolean
salary       – string like "$85,000 – $105,000" or "Competitive" or "$120k + super"
tags         – array of 3–5 skill strings e.g. ["React","TypeScript","Node.js","AWS"]

Generate exactly 20 diverse, realistic openings. Mix: big tech (Atlassian, Canva, Cochlear, REA Group, Macquarie Bank, ANZ, etc.), scale-ups, fintech, healthtech, gov tech (NSW DCS, Service NSW), and boutique consultancies. Include a healthy spread of graduate and experienced roles. All located in Sydney, Australia.`

export async function GET() {
  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 4096,
      system: SYSTEM,
      messages: [
        {
          role: 'user',
          content: 'Fetch current Sydney CS and software engineering job listings. Return JSON array only.',
        },
      ],
    })

    const raw = message.content.find((b) => b.type === 'text')?.text ?? '[]'
    const clean = raw.replace(/```json|```/g, '').trim()
    const jobs = JSON.parse(clean)

    return NextResponse.json({ jobs, fetchedAt: new Date().toISOString() })
  } catch (err) {
    console.error('[/api/jobs]', err)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}
