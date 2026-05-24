'use client'

import { useState, useMemo, useCallback } from 'react'
import type { Job, SortKey, StatusFilter } from './lib/types'
import { useLocalStorage } from './lib/useLocalStorage'

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconRefresh = ({ spin }: { spin?: boolean }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={spin ? 'spin' : ''}>
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
)
const IconBookmark = ({ filled }: { filled: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
)
const IconCheck = ({ filled }: { filled: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)
const IconExternal = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
)
const IconClock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)

const SOURCE_STYLES: Record<string, { badge: string; dot: string }> = {
  Seek:      { badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',       dot: 'bg-blue-400' },
  LinkedIn:  { badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',          dot: 'bg-sky-400' },
  Indeed:    { badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30', dot: 'bg-indigo-400' },
  Glassdoor: { badge: 'bg-green-500/15 text-green-300 border-green-500/30',    dot: 'bg-green-400' },
  Adzuna:    { badge: 'bg-violet-500/15 text-violet-300 border-violet-500/30', dot: 'bg-violet-400' },
}

const TYPE_STYLES: Record<string, { badge: string; accent: string }> = {
  Graduate:           { badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', accent: '#10b981' },
  Junior:             { badge: 'bg-teal-500/15 text-teal-300 border-teal-500/30',          accent: '#14b8a6' },
  'Software Engineer':{ badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',             accent: '#0ea5e9' },
  'Full Stack':       { badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',          accent: '#22d3ee' },
  Frontend:           { badge: 'bg-violet-500/15 text-violet-300 border-violet-500/30',    accent: '#8b5cf6' },
  Backend:            { badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',          accent: '#3b82f6' },
  'AI / ML':          { badge: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30', accent: '#d946ef' },
  DevOps:             { badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',       accent: '#f59e0b' },
  Data:               { badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',          accent: '#f43f5e' },
}

function daysLabel(d: number) {
  if (d === 0) return 'Today'
  if (d === 1) return '1d ago'
  return `${d}d ago`
}

function JobCard({ job, saved, applied, onSave, onApply }: {
  job: Job; saved: boolean; applied: boolean; onSave: () => void; onApply: () => void
}) {
  const ts = TYPE_STYLES[job.type] ?? { badge: 'bg-white/10 text-[var(--text2)] border-white/10', accent: '#6b7280' }
  const ss = SOURCE_STYLES[job.source] ?? { badge: 'bg-white/10 text-[var(--text2)] border-white/10', dot: 'bg-gray-400' }
  const accentColor = applied ? 'var(--primary)' : saved ? 'var(--green)' : ts.accent

  return (
    <div
      className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-4 hover:border-[var(--border2)] hover:bg-[var(--surface2)] transition-all group fade-up"
      style={{ borderLeftColor: accentColor, borderLeftWidth: 3 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold text-[var(--text)] leading-snug group-hover:text-white transition-colors">{job.title}</h3>
          <span className="text-[13px] font-medium text-[var(--text2)] mt-0.5 block">{job.company}</span>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={onSave} title={saved ? 'Unsave' : 'Save'}
            className={`p-1.5 rounded-xl transition-all ${saved
              ? 'text-[var(--green)] bg-[var(--green-dim)] ring-1 ring-[var(--green)]/30'
              : 'text-[var(--text3)] hover:text-[var(--primary)] hover:bg-[var(--surface3)]'}`}>
            <IconBookmark filled={saved} />
          </button>
          <button onClick={onApply} title={applied ? 'Unmark applied' : 'Mark applied'}
            className={`p-1.5 rounded-xl transition-all ${applied
              ? 'text-[var(--primary)] bg-[var(--primary-glow)] ring-1 ring-[var(--primary)]/30'
              : 'text-[var(--text3)] hover:text-[var(--primary)] hover:bg-[var(--surface3)]'}`}>
            <IconCheck filled={applied} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border ${ts.badge}`}>{job.type}</span>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${ss.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${ss.dot}`}/>{job.source}
        </span>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-lg border bg-white/5 text-[var(--text2)] border-[var(--border)]">
          {job.location}{job.remote ? ' · Remote' : ''}
        </span>
        {job.salary && job.salary !== 'Competitive' && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg border bg-[var(--amber-dim)] text-[var(--amber)] border-[var(--amber)]/30">{job.salary}</span>
        )}
        {job.postedDaysAgo === 0 && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg border bg-[var(--rose-dim)] text-[var(--rose)] border-[var(--rose)]/30">New today</span>
        )}
        {saved && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg border bg-[var(--green-dim)] text-[var(--green)] border-[var(--green)]/30">Saved</span>}
        {applied && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg border bg-[var(--primary-glow)] text-[var(--primary)] border-[var(--primary)]/30">Applied</span>}
      </div>

      {job.tags && job.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {job.tags.map((t) => (
            <span key={t} className="font-mono text-[11px] text-[var(--text3)] bg-[var(--surface3)] px-1.5 py-0.5 rounded border border-[var(--border)]">{t}</span>
          ))}
        </div>
      )}

      <p className="text-[13px] text-[var(--text2)] leading-relaxed mt-2.5">{job.description}</p>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)]">
        <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text3)] font-mono">
          <IconClock /> {daysLabel(job.postedDaysAgo)}
        </span>
        <a href={job.url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--bg)] bg-[var(--primary)] hover:bg-[#c084fc] px-3 py-1.5 rounded-xl transition-all shadow-md shadow-[var(--primary-glow)] active:scale-95">
          View &amp; apply <IconExternal />
        </a>
      </div>
    </div>
  )
}

const JOB_TYPES = ['Graduate', 'Junior', 'Software Engineer', 'Full Stack', 'Frontend', 'Backend', 'AI / ML', 'DevOps', 'Cloud', 'Data', 'Mobile', 'QA', 'Cybersecurity', 'IT']
const SOURCES   = ['Seek', 'LinkedIn', 'Indeed', 'Glassdoor', 'Adzuna']
const LOCATIONS = ['Sydney CBD', 'North Sydney', 'Parramatta', 'Macquarie Park', 'Pyrmont', 'Chatswood', 'Remote']

const selCls = "px-3 py-2 text-[13px] bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text2)] focus:outline-none focus:border-[var(--primary)] transition-colors"

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fetchedAt, setFetchedAt] = useState('')

  const [savedIds, setSavedIds] = useLocalStorage<string[]>('sdj_saved', [])
  const [appliedIds, setAppliedIds] = useLocalStorage<string[]>('sdj_applied', [])

  const [keyword, setKeyword] = useState('')
  const [locFilter, setLocFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('')
  const [entryOnly, setEntryOnly] = useState(true)
  const [sort, setSort] = useState<SortKey>('date')
  const [tab, setTab] = useState<'all' | 'saved' | 'applied'>('all')

  const savedSet = useMemo(() => new Set(savedIds), [savedIds])
  const appliedSet = useMemo(() => new Set(appliedIds), [appliedIds])

  const fetchJobs = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/jobs')
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      setJobs(data.jobs ?? [])
      setFetchedAt(data.fetchedAt ?? '')
    } catch { setError('Could not fetch jobs — check your ADZUNA keys and try again.') }
    finally { setLoading(false) }
  }, [])

  const toggleSave  = useCallback((id: string) => setSavedIds((p)  => p.includes(id) ? p.filter(x => x !== id) : [...p, id]), [setSavedIds])
  const toggleApply = useCallback((id: string) => setAppliedIds((p) => p.includes(id) ? p.filter(x => x !== id) : [...p, id]), [setAppliedIds])

  const SENIOR_RE = /\b(senior|sr\.|lead|principal|staff|head of|manager|director|vp|architect)\b/i

  const filtered = useMemo(() => {
    const kw = keyword.toLowerCase()
    let list = [...jobs]
    if (tab === 'saved')   list = list.filter(j => savedSet.has(j.id))
    if (tab === 'applied') list = list.filter(j => appliedSet.has(j.id))
    if (entryOnly)         list = list.filter(j => !SENIOR_RE.test(j.title))
    if (kw) list = list.filter(j => `${j.title} ${j.company} ${j.description} ${(j.tags??[]).join(' ')}`.toLowerCase().includes(kw))
    if (locFilter)    list = list.filter(j => j.location.includes(locFilter) || (j.remote && locFilter === 'Remote'))
    if (typeFilter)   list = list.filter(j => j.type === typeFilter)
    if (sourceFilter) list = list.filter(j => j.source === sourceFilter)
    if (statusFilter === 'saved')   list = list.filter(j => savedSet.has(j.id))
    if (statusFilter === 'applied') list = list.filter(j => appliedSet.has(j.id))
    if (statusFilter === 'new')     list = list.filter(j => j.postedDaysAgo === 0)
    if (sort === 'date')   list.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo)
    if (sort === 'rating') list.sort((a, b) => b.companyRating - a.companyRating)
    if (sort === 'alpha')  list.sort((a, b) => a.company.localeCompare(b.company))
    return list
  }, [jobs, keyword, locFilter, typeFilter, sourceFilter, statusFilter, sort, tab, savedSet, appliedSet, entryOnly])

  const newCount = jobs.filter(j => j.postedDaysAgo === 0).length
  const hasFilters = !!(keyword || locFilter || typeFilter || sourceFilter || statusFilter)

  const stats = [
    { label: 'Total found', value: jobs.length,      color: 'text-[var(--primary)]', bg: 'bg-[var(--primary-glow)] border-[var(--primary)]/20' },
    { label: 'New today',   value: newCount,          color: 'text-[var(--rose)]',    bg: 'bg-[var(--rose-dim)] border-[var(--rose)]/20' },
    { label: 'Saved',       value: savedIds.length,   color: 'text-[var(--green)]',   bg: 'bg-[var(--green-dim)] border-[var(--green)]/20' },
    { label: 'Applied',     value: appliedIds.length, color: 'text-[var(--cyan)]',    bg: 'bg-[var(--cyan-dim)] border-[var(--cyan)]/20' },
  ]

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <header className="bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--primary-dark)] to-[var(--primary)] flex items-center justify-center shadow-lg shadow-[var(--primary-glow)]">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <span className="font-bold text-[16px] text-[var(--text)]">Get<span className="text-[var(--primary)]">Me</span>Hired</span>
              <span className="text-[var(--text3)] text-[12px] ml-2">Sydney CS &amp; SWE roles</span>
            </div>
          </div>
          {fetchedAt && (
            <span className="text-[11px] text-[var(--text3)] font-mono">
              updated {new Date(fetchedAt).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">

        {/* Fetch */}
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={fetchJobs} disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[14px] font-semibold text-white rounded-xl bg-gradient-to-r from-[var(--primary-dark)] to-[var(--primary)] hover:from-[#6d28d9] hover:to-[#c084fc] shadow-lg shadow-[var(--primary-glow)] disabled:opacity-50 transition-all active:scale-95">
            <IconRefresh spin={loading} />
            {loading ? 'Fetching jobs…' : 'Fetch latest jobs'}
          </button>
          {loading && (
            <div className="flex items-center gap-1.5 text-[13px] text-[var(--text3)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] dot1 inline-block"/>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] dot2 inline-block"/>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] dot3 inline-block"/>
              <span className="ml-1">Searching Seek, LinkedIn, Indeed…</span>
            </div>
          )}
          {error && <span className="text-[13px] text-[var(--rose)] bg-[var(--rose-dim)] border border-[var(--rose)]/30 px-3 py-1.5 rounded-lg">{error}</span>}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2.5">
          {stats.map(s => (
            <div key={s.label} className={`rounded-xl border px-3 py-3 ${s.bg}`}>
              <div className={`text-[22px] font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-[11px] text-[var(--text3)] mt-0.5 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text3)] pointer-events-none"><IconSearch /></span>
            <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)}
              placeholder="Search by title, company, skill, tag…"
              className="w-full pl-9 pr-3 py-2 text-[14px] bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder:text-[var(--text3)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-glow)] transition-all"/>
          </div>
          <select value={locFilter} onChange={e => setLocFilter(e.target.value)} className={selCls}>
            <option value="">All locations</option>
            {LOCATIONS.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>

        {/* Entry level toggle — always visible on its own row */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEntryOnly(e => !e)}
            className={`px-4 py-2 text-[13px] rounded-xl border transition-all font-medium flex items-center gap-2 ${
              entryOnly
                ? 'bg-[var(--green-dim)] border-[var(--green)]/40 text-[var(--green)]'
                : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text3)] hover:border-[var(--green)] hover:text-[var(--green)]'
            }`}
          >
            <span className="text-base leading-none">{entryOnly ? '✓' : '○'}</span>
            Entry level only
          </button>
          <span className="text-[12px] text-[var(--text3)]">
            {entryOnly ? 'Hiding senior / lead / manager titles' : 'Showing all seniority levels'}
          </span>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-[12px] text-[var(--text3)]">Filter:</span>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className={selCls}>
            <option value="">All types</option>
            {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className={selCls}>
            <option value="">All sources</option>
            {SOURCES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)} className={selCls}>
            <option value="">All statuses</option>
            <option value="saved">Saved only</option>
            <option value="applied">Applied only</option>
            <option value="new">New today</option>
          </select>
          {hasFilters && (
            <button onClick={() => { setKeyword(''); setLocFilter(''); setTypeFilter(''); setSourceFilter(''); setStatusFilter('') }}
              className="px-3 py-2 text-[13px] text-[var(--primary)] border border-[var(--border)] rounded-xl hover:bg-[var(--surface2)] transition-colors flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
              Clear
            </button>
          )}
        </div>

        {/* Sort + Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-[var(--text3)] mr-1">Sort:</span>
            {(['date', 'rating', 'alpha'] as SortKey[]).map(s => (
              <button key={s} onClick={() => setSort(s)}
                className={`px-3 py-1.5 text-[12px] rounded-lg border transition-all font-medium ${sort === s
                  ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-md shadow-[var(--primary-glow)]'
                  : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text2)] hover:border-[var(--primary)] hover:text-[var(--primary)]'}`}>
                {s === 'date' ? '📅 Date' : s === 'rating' ? '⭐ Rating' : '🔤 A–Z'}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {(['all', 'saved', 'applied'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 text-[12px] rounded-lg border transition-all font-medium ${tab === t
                  ? 'bg-[var(--cyan)] border-[var(--cyan)] text-[var(--bg)] shadow-md'
                  : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text2)] hover:border-[var(--cyan)] hover:text-[var(--cyan)]'}`}>
                {t === 'saved' ? `Saved${savedIds.length ? ` (${savedIds.length})` : ''}`
                  : t === 'applied' ? `Applied${appliedIds.length ? ` (${appliedIds.length})` : ''}`
                  : 'All jobs'}
              </button>
            ))}
          </div>
        </div>

        {jobs.length > 0 && (
          <p className="text-[12px] text-[var(--text3)] font-mono">{filtered.length} job{filtered.length !== 1 ? 's' : ''} shown</p>
        )}

        {/* Job list */}
        <div className="space-y-3">
          {filtered.length === 0 && !loading && (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--surface2)] border border-[var(--border)] flex items-center justify-center">
                <svg className="w-7 h-7 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <p className="text-[15px] font-semibold text-[var(--text)]">
                {jobs.length === 0 ? 'Ready to find your next role?' : 'No jobs match your filters'}
              </p>
              <p className="text-[13px] text-[var(--text3)] mt-1">
                {jobs.length === 0 ? 'Hit "Fetch latest jobs" to load real Sydney CS & SWE roles' : 'Try adjusting your search criteria'}
              </p>
            </div>
          )}
          {filtered.map(job => (
            <JobCard key={job.id} job={job}
              saved={savedSet.has(job.id)} applied={appliedSet.has(job.id)}
              onSave={() => toggleSave(job.id)} onApply={() => toggleApply(job.id)}/>
          ))}
        </div>
      </div>
    </main>
  )
}
