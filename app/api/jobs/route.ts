import { NextResponse } from 'next/server'

const APP_ID  = process.env.ADZUNA_APP_ID
const APP_KEY = process.env.ADZUNA_APP_KEY

const TECH_TAGS = [
  'React','TypeScript','JavaScript','Python','Java','Go','Kotlin','Swift','Rust','C#','.NET',
  'Node.js','Next.js','Vue','Angular','Django','FastAPI','Spring',
  'AWS','GCP','Azure','Docker','Kubernetes','Terraform','CI/CD',
  'PostgreSQL','MySQL','MongoDB','Redis','Kafka','Spark','SQL',
  'GraphQL','REST','Machine Learning','TensorFlow','PyTorch',
]

function classifyType(title: string): string {
  const t = title.toLowerCase()
  if (/graduate|entry.level|intern|cadet/.test(t))                         return 'Graduate'
  if (/\bjunior\b|jr\.|associate/.test(t))                                 return 'Junior'
  if (/front.end|frontend|react dev|ui dev|vue dev/.test(t))               return 'Frontend'
  if (/back.end|backend|api dev/.test(t))                                  return 'Backend'
  if (/full.stack|fullstack/.test(t))                                      return 'Full Stack'
  if (/devops|site reliability|sre|cloud eng|platform eng|infrastructure/.test(t)) return 'DevOps'
  if (/machine learning|deep learning|\bml\b|ai eng|nlp|data sci/.test(t)) return 'AI / ML'
  if (/data eng|data anal|analytics|bi dev/.test(t))                       return 'Data'
  return 'Software Engineer'
}

function extractTags(text: string): string[] {
  return TECH_TAGS.filter(tag =>
    new RegExp(`\\b${tag.replace(/[.+]/g, '\\$&')}\\b`, 'i').test(text)
  ).slice(0, 5)
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim()
}

function truncate(text: string): string {
  const clean = stripHtml(text)
  if (clean.length <= 220) return clean
  const cut = clean.lastIndexOf('. ', 220)
  return cut > 80 ? clean.slice(0, cut + 1) : clean.slice(0, 220) + '…'
}

function formatSalary(min?: number, max?: number): string {
  if (!min && !max) return 'Competitive'
  const fmt = (n: number) => n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  return `From ${fmt(min ?? max!)}`
}

function daysAgo(iso: string): number {
  return Math.min(Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000), 14)
}

function mapLocation(raw: string): string {
  const l = raw.toLowerCase()
  if (/\bcbd\b|city centre|george st/.test(l))    return 'Sydney CBD'
  if (/north sydney/.test(l))                      return 'North Sydney'
  if (/parramatta/.test(l))                        return 'Parramatta'
  if (/macquarie/.test(l))                         return 'Macquarie Park'
  if (/pyrmont|ultimo/.test(l))                    return 'Pyrmont'
  if (/chatswood/.test(l))                         return 'Chatswood'
  if (/surry hills|redfern/.test(l))               return 'Surry Hills'
  if (/remote|work from home|wfh/.test(l))         return 'Remote'
  return 'Sydney'
}

// Returns true if the role is clearly senior/leadership — not suitable for grads / <2yr exp
function isSeniorRole(title: string): boolean {
  return /\b(senior|sr\.|lead|principal|staff|head of|manager|director|vp|vice president|architect|distinguished|fellow|c-level|cto|cpo|ceo|chapter lead|\d{5,}\+?\s*years?)\b/i.test(title)
}

function mapSource(url: string): string {
  if (url.includes('seek.com'))     return 'Seek'
  if (url.includes('linkedin.com')) return 'LinkedIn'
  if (url.includes('indeed.com'))   return 'Indeed'
  if (url.includes('glassdoor'))    return 'Glassdoor'
  return 'Adzuna'
}

// Tech keywords that must appear somewhere in title or description
const TECH_ROLE_RE = /\b(software|engineer|developer|dev|frontend|backend|fullstack|full.stack|devops|cloud|data|machine learning|ml|ai|sre|platform|infrastructure|mobile|ios|android|typescript|javascript|python|java|react|node|api|qa|tester|testing|cyber|security|network|systems|architect|analyst|product manager|scrum|agile|it support|site reliability)\b/i

async function adzunaSearch(query: string): Promise<any[]> {
  const url = new URL('https://api.adzuna.com/v1/api/jobs/au/search/1')
  url.searchParams.set('app_id', APP_ID!)
  url.searchParams.set('app_key', APP_KEY!)
  url.searchParams.set('results_per_page', '20')
  url.searchParams.set('what', query)
  url.searchParams.set('where', 'Sydney')
  url.searchParams.set('distance', '30')
  url.searchParams.set('sort_by', 'date')
  url.searchParams.set('category', 'it-jobs')
  url.searchParams.set('content-type', 'application/json')

  const res = await fetch(url.toString(), { next: { revalidate: 0 } })
  if (!res.ok) throw new Error(`Adzuna ${res.status}`)
  const data = await res.json()
  return data.results ?? []
}

export async function GET() {
  if (!APP_ID || !APP_KEY) {
    return NextResponse.json({ error: 'ADZUNA_APP_ID and ADZUNA_APP_KEY are required' }, { status: 500 })
  }

  try {
    const queries = [
      'graduate software engineer',
      'junior developer',
      'junior software engineer',
      'associate software engineer',
      'entry level developer',
      'frontend developer',
      'backend developer',
      'graduate data engineer',
      'junior devops',
      'junior machine learning',
    ]

    const results = await Promise.allSettled(queries.map(q => adzunaSearch(q)))

    const seen = new Set<string>()
    const jobs = []

    for (const r of results) {
      if (r.status !== 'fulfilled') continue
      for (const item of r.value) {
        if (seen.has(String(item.id))) continue
        if (isSeniorRole(item.title ?? '')) continue
        if (!TECH_ROLE_RE.test((item.title ?? '') + ' ' + (item.description ?? ''))) continue
        seen.add(String(item.id))

        const desc = truncate(item.description ?? '')
        jobs.push({
          id:            String(item.id),
          title:         item.title ?? 'Software Engineer',
          company:       item.company?.display_name ?? 'Unknown',
          location:      mapLocation(item.location?.display_name ?? 'Sydney'),
          type:          classifyType(item.title ?? ''),
          source:        mapSource(item.redirect_url ?? ''),
          postedDaysAgo: daysAgo(item.created ?? new Date().toISOString()),
          companyRating: 0,
          description:   desc,
          url:           item.redirect_url ?? '#',
          remote:        /remote|hybrid|wfh/i.test((item.title ?? '') + ' ' + desc),
          salary:        formatSalary(item.salary_min, item.salary_max),
          tags:          extractTags(desc),
        })
      }
    }

    // Sort by date, take top 40
    jobs.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo)
    const top = jobs.slice(0, 100)

    return NextResponse.json({ jobs: top, fetchedAt: new Date().toISOString() })
  } catch (err) {
    console.error('[/api/jobs]', err)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}
