'use client'

import { useState, useMemo, useCallback } from 'react'
import type { Job, SortKey, StatusFilter } from './lib/types'
import { useLocalStorage } from './lib/useLocalStorage'

// ─── Icons (inline SVG, no dep) ─────────────────────────────────────────────

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
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
)
const IconClock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconMapPin = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconStar = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)
const IconFilter = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
)

// ─── Source badge colours ────────────────────────────────────────────────────

const SOURCE_COLOURS: Record<string, string> = {
  Seek: 'bg-blue-50 text-blue-700 border-blue-200',
  LinkedIn: 'bg-sky-50 text-sky-700 border-sky-200',
  GradAustralia: 'bg-violet-50 text-violet-700 border-violet-200',
  Indeed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Otta: 'bg-pink-50 text-pink-700 border-pink-200',
}

const TYPE_COLOURS: Record<string, string> = {
  Graduate: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Junior: 'bg-teal-50 text-teal-700 border-teal-200',
  'Software Engineer': 'bg-brand-50 text-brand-700 border-brand-200',
  'Full Stack': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Frontend: 'bg-purple-50 text-purple-700 border-purple-200',
  Backend: 'bg-orange-50 text-orange-700 border-orange-200',
  'AI / ML': 'bg-rose-50 text-rose-700 border-rose-200',
  DevOps: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Data: 'bg-lime-50 text-lime-700 border-lime-200',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysLabel(d: number) {
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  return `${d} days ago`
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Badge({ label, colour }: { label: string; colour: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${colour}`}>
      {label}
    </span>
  )
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="text-2xl font-semibold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  )
}

function JobCard({
  job,
  saved,
  applied,
  onSave,
  onApply,
}: {
  job: Job
  saved: boolean
  applied: boolean
  onSave: () => void
  onApply: () => void
}) {
  const leftBorder = applied
    ? 'border-l-2 border-l-blue-400'
    : saved
    ? 'border-l-2 border-l-emerald-400'
    : ''

  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors p-4 fade-up ${leftBorder}`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-medium text-gray-900 leading-snug">{job.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[13px] text-gray-500">{job.company}</span>
            {job.companyRating > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[11px] text-amber-600 font-medium">
                <IconStar /> {job.companyRating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={onSave}
            title={saved ? 'Unsave' : 'Save job'}
            className={`p-1.5 rounded-lg transition-colors ${
              saved
                ? 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            <IconBookmark filled={saved} />
          </button>
          <button
            onClick={onApply}
            title={applied ? 'Unmark applied' : 'Mark as applied'}
            className={`p-1.5 rounded-lg transition-colors ${
              applied
                ? 'text-blue-500 bg-blue-50 hover:bg-blue-100'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            <IconCheck filled={applied} />
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        <Badge label={job.type} colour={TYPE_COLOURS[job.type] ?? 'bg-gray-50 text-gray-600 border-gray-200'} />
        <Badge
          label={job.source}
          colour={SOURCE_COLOURS[job.source] ?? 'bg-gray-50 text-gray-600 border-gray-200'}
        />
        <Badge
          label={`${job.location}${job.remote ? ' · Remote' : ''}`}
          colour="bg-gray-50 text-gray-600 border-gray-100"
        />
        {job.salary && (
          <Badge label={job.salary} colour="bg-amber-50 text-amber-700 border-amber-100" />
        )}
        {job.postedDaysAgo === 0 && (
          <Badge label="New today" colour="bg-red-50 text-red-600 border-red-100" />
        )}
        {saved && <Badge label="Saved" colour="bg-emerald-50 text-emerald-700 border-emerald-100" />}
        {applied && <Badge label="Applied" colour="bg-blue-50 text-blue-700 border-blue-100" />}
      </div>

      {/* Tags */}
      {job.tags && job.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {job.tags.map((t) => (
            <span key={t} className="font-mono text-[11px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      <p className="text-[13px] text-gray-500 leading-relaxed mt-2.5">{job.description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <span className="inline-flex items-center gap-1 text-[12px] text-gray-400">
          <IconClock /> {daysLabel(job.postedDaysAgo)}
        </span>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[13px] text-brand-600 border border-brand-200 hover:bg-brand-50 px-3 py-1 rounded-lg transition-colors"
        >
          View &amp; apply <IconExternal />
        </a>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const JOB_TYPES = ['Graduate', 'Junior', 'Software Engineer', 'Full Stack', 'Frontend', 'Backend', 'AI / ML', 'DevOps', 'Data']
const SOURCES = ['Seek', 'LinkedIn', 'GradAustralia', 'Indeed', 'Otta']
const LOCATIONS = ['Sydney CBD', 'North Sydney', 'Parramatta', 'Macquarie Park', 'Pyrmont', 'Chatswood', 'Remote']

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
  const [sort, setSort] = useState<SortKey>('date')
  const [tab, setTab] = useState<'all' | 'saved' | 'applied'>('all')

  const savedSet = useMemo(() => new Set(savedIds), [savedIds])
  const appliedSet = useMemo(() => new Set(appliedIds), [appliedIds])

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/jobs')
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      setJobs(data.jobs ?? [])
      setFetchedAt(data.fetchedAt ?? '')
    } catch {
      setError('Could not fetch jobs — check your API key and try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleSave = useCallback(
    (id: string) =>
      setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    [setSavedIds]
  )
  const toggleApply = useCallback(
    (id: string) =>
      setAppliedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    [setAppliedIds]
  )

  const filtered = useMemo(() => {
    const kw = keyword.toLowerCase()
    let list = [...jobs]

    if (tab === 'saved') list = list.filter((j) => savedSet.has(j.id))
    if (tab === 'applied') list = list.filter((j) => appliedSet.has(j.id))

    if (kw) list = list.filter((j) => `${j.title} ${j.company} ${j.description} ${(j.tags ?? []).join(' ')}`.toLowerCase().includes(kw))
    if (locFilter) list = list.filter((j) => j.location.includes(locFilter) || (j.remote && locFilter === 'Remote'))
    if (typeFilter) list = list.filter((j) => j.type === typeFilter)
    if (sourceFilter) list = list.filter((j) => j.source === sourceFilter)
    if (statusFilter === 'saved') list = list.filter((j) => savedSet.has(j.id))
    if (statusFilter === 'applied') list = list.filter((j) => appliedSet.has(j.id))
    if (statusFilter === 'new') list = list.filter((j) => j.postedDaysAgo === 0)

    if (sort === 'date') list.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo)
    if (sort === 'rating') list.sort((a, b) => b.companyRating - a.companyRating)
    if (sort === 'alpha') list.sort((a, b) => a.company.localeCompare(b.company))

    return list
  }, [jobs, keyword, locFilter, typeFilter, sourceFilter, statusFilter, sort, tab, savedSet, appliedSet])

  const newCount = jobs.filter((j) => j.postedDaysAgo === 0).length

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconMapPin />
            <span className="font-semibold text-gray-900 text-[16px]">SydneyDevJobs</span>
            <span className="text-gray-300 text-xs ml-1">CS &amp; SWE roles</span>
          </div>
          {fetchedAt && (
            <span className="text-xs text-gray-400">
              Updated {new Date(fetchedAt).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Fetch button */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchJobs}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-[14px] font-medium bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-60 transition-colors"
            style={{ background: loading ? '#6b7280' : '#3355ef' }}
          >
            <IconRefresh spin={loading} />
            {loading ? 'Fetching jobs…' : 'Fetch latest jobs'}
          </button>
          {loading && (
            <div className="flex items-center gap-1.5 text-[13px] text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dot1 inline-block" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dot2 inline-block" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dot3 inline-block" />
              <span className="ml-1">Searching Seek, LinkedIn, GradAustralia, Indeed…</span>
            </div>
          )}
          {error && <span className="text-[13px] text-red-500">{error}</span>}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <StatCard value={jobs.length} label="Total found" />
          <StatCard value={newCount} label="New today" />
          <StatCard value={savedIds.length} label="Saved" />
          <StatCard value={appliedIds.length} label="Applied" />
        </div>

        {/* Search */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <IconSearch />
            </span>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by title, company, skill, tag…"
              className="w-full pl-9 pr-3 py-2 text-[14px] border border-gray-200 rounded-xl bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
            />
          </div>
          <select
            value={locFilter}
            onChange={(e) => setLocFilter(e.target.value)}
            className="px-3 py-2 text-[13px] border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-200"
          >
            <option value="">All locations</option>
            {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap items-center">
          <span className="inline-flex items-center gap-1 text-[12px] text-gray-400 mr-1">
            <IconFilter /> Filter:
          </span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-[13px] border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none"
          >
            <option value="">All types</option>
            {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-1.5 text-[13px] border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none"
          >
            <option value="">All sources</option>
            {SOURCES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-3 py-1.5 text-[13px] border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none"
          >
            <option value="">All statuses</option>
            <option value="saved">Saved only</option>
            <option value="applied">Applied only</option>
            <option value="new">New today</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[12px] text-gray-400">Sort:</span>
          {(['date', 'rating', 'alpha'] as SortKey[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-3 py-1.5 text-[12px] rounded-lg border transition-colors ${
                sort === s
                  ? 'border-brand-300 bg-brand-50 text-brand-700 font-medium'
                  : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {s === 'date' ? '📅 Date' : s === 'rating' ? '⭐ Rating' : '🔤 A–Z'}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(['all', 'saved', 'applied'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-[13px] rounded-xl border transition-colors capitalize ${
                tab === t
                  ? 'border-gray-300 bg-white text-gray-900 font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'saved'
                ? `Saved${savedIds.length ? ` (${savedIds.length})` : ''}`
                : t === 'applied'
                ? `Applied${appliedIds.length ? ` (${appliedIds.length})` : ''}`
                : 'All jobs'}
            </button>
          ))}
        </div>

        {/* Job list */}
        <div className="space-y-3">
          {filtered.length === 0 && !loading && (
            <div className="text-center py-16 text-gray-400 text-[14px]">
              {jobs.length === 0 ? (
                <>
                  <div className="text-4xl mb-3">🔍</div>
                  Click &ldquo;Fetch latest jobs&rdquo; to load Sydney CS &amp; SWE roles
                </>
              ) : (
                <>
                  <div className="text-4xl mb-3">🎯</div>
                  No jobs match your filters
                </>
              )}
            </div>
          )}
          {filtered.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              saved={savedSet.has(job.id)}
              applied={appliedSet.has(job.id)}
              onSave={() => toggleSave(job.id)}
              onApply={() => toggleApply(job.id)}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
