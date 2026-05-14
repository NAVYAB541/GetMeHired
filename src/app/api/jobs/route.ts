import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You generate realistic, current Sydney Australia job listings for CS graduates and software engineers.
Return ONLY a valid JSON array. No markdown, no code fences, no preamble, no explanation — pure JSON only.

Each object must have exactly these keys:
- id: unique 8-char alphanumeric string
- title: job title (string)
- company: real or plausible Sydney company name (string)
- location: Sydney suburb e.g. "Sydney CBD", "North Sydney", "Macquarie Park", "Parramatta", "Surry Hills", "Pyrmont" (string)
- type: one of "Graduate", "Junior", "Software Engineer", "Full Stack", "Frontend", "Backend", "AI / ML", "DevOps", "Data" (string)
- source: one of "Seek", "LinkedIn", "GradAustralia", "Indeed", "Otta" (string)
- postedDaysAgo: integer 0–14
- companyRating: float 3.2–5.0 with 1 decimal place
- description: 2 specific sentences mentioning real technologies and what the role involves
- url: plausible URL to the job listing on the source platform or company website
- remote: boolean
- salary: string like "$85,000 – $100,000" or "$110k – $130k" or "Competitive"

Rules:
- Generate exactly 20 listings
- Include variety: big tech, fintech, healthtech, govtech, scale-ups, agencies
- Mix of graduate/junior/senior roles
- Use real Sydney companies where possible (Atlassian, Canva, Afterpay, Xero, ANZ, Commonwealth Bank, Telstra, Optus, REA Group, Domain, Tyro, Brighte, SafetyCulture, Nuix, Immutable, etc.) and realistic made-up ones
- Descriptions must mention specific tech (React, TypeScript, Python, Go, Kotlin, Swift, AWS, GCP, PostgreSQL, Kafka, etc.)
- URLs should look real (seek.com.au/job/12345678, linkedin.com/jobs/view/123456789, company.com/careers/role-name, etc.)
- Spread postedDaysAgo evenly (some 0, some 1-3, some 4-14)
- At least 5 remote-friendly roles`

export async function GET() {
  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: 'Generate 20 current Sydney CS and software engineering job listings. Return only the JSON array.'
        }
      ]
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : '[]'
    const clean = raw.replace(/```json|```/g, '').trim()
    const jobs = JSON.parse(clean)

    return NextResponse.json({ jobs, fetchedAt: new Date().toISOString() })
  } catch (error) {
    console.error('Fetch jobs error:', error)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}
