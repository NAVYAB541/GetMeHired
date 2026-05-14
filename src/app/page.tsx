'use client'
import { useState, useCallback, useMemo } from 'react'
import { Job, SortKey, TabKey, Filters } from '@/lib/types'
import { useLocalStorage } from '@/lib/useLocalStorage'
import JobCard from '@/components/JobCard'
import StatsBar from '@/components/StatsBar'

const LOCATIONS = ['Sydney CBD', 'North Sydney', 'Macquarie Park', 'Parramatta', 'Surry Hills', 'Pyrmont', 'Remote']
const JOB_TYPES = ['Graduate', 'Junior', 'Software Engineer', 'Full Stack', 'Frontend', 'Backend', 'AI / ML', 'DevOps', 'Data']
const SOURCES = ['Seek', 'LinkedIn', 'GradAustralia', 'Indeed', 'Otta']

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState('')
  const [sort, setSort] = useState<SortKey>('date')
  const [tab, setTab] = useState<TabKey>('all')
  const [filters, setFilters] = useState<Filters>({ keyword: '', location: '', type: '', source: '', status: '' })
  const [savedIds, setSavedIds] = useLocalStorage<string[]>('gmh_saved', [])
  const [appliedIds, setAppliedIds] = useLocalStorage<string[]>('gmh_applied', [])

  const savedSet = useMemo(() => new Set(savedIds), [savedIds])
  const appliedSet = useMemo(() => new Set(appliedIds), [appliedIds])

  async function fetchJobs() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/jobs')
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      setJobs(data.jobs)
      setLastUpdated(new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }))
    } catch (e) {
      setError('Failed to fetch jobs. Check your ANTHROPIC_API_KEY and try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleSave = useCallback((id: string) => {
    setSavedIds(savedSet.has(id) ? savedIds.filter(x => x !== id) : [...savedIds, id])
  }, [savedIds, savedSet, setSavedIds])

  const toggleApply = useCallback((id: string) => {
    setAppliedIds(appliedSet.has(id) ? appliedIds.filter(x => x !== id) : [...appliedIds, id])
  }, [appliedIds, appliedSet, setAppliedIds])

  const updateFilter = (key: keyof Filters, value: string) =>
    setFilters(f => ({ ...f, [key]: value }))

  const filteredJobs = useMemo(() => {
    let result = [...jobs]
    const kw = filters.keyword.toLowerCase()
    if (kw) result = result.filter(j =>
      (j.title + j.company + j.description + j.type).toLowerCase().includes(kw))
    if (filters.location) result = result.filter(j =>
      j.location?.includes(filters.location) || (j.remote && filters.location === 'Remote'))
    if (filters.type) result = result.filter(j => j.type === filters.type)
    if (filters.source) result = result.filter(j => j.source === filters.source)
    if (filters.status === 'saved') result = result.filter(j => savedSet.has(j.id))
    if (filters.status === 'applied') result = result.filter(j => appliedSet.has(j.id))
    if (filters.status === 'new') result = result.filter(j => j.postedDaysAgo === 0)
    if (tab === 'saved') result = result.filter(j => savedSet.has(j.id))
    if (tab === 'applied') result = result.filter(j => appliedSet.has(j.id))
    if (sort === 'date') result.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo)
    if (sort === 'rating') result.sort((a, b) => b.companyRating - a.companyRating)
    if (sort === 'alpha') result.sort((a, b) => a.company.localeCompare(b.company))
    return result
  }, [jobs, filters, sort, tab, savedSet, appliedSet])

  const newTodayCount = jobs.filter(j => j.postedDaysAgo === 0).length

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-semibold text-[var(--text)] flex items-center gap-2">
              <svg className="w-5 h-5 text-[var(--teal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              GetMeHired
            </h1>
            <p className="text-[13px] text-[var(--text3)] mt-0.5">Your next Sydney CS &amp; SWE role, one click away</p>
          </div>
          {lastUpdated && (
            <span className="text-[12px] text-[var(--text3)]">Updated {lastUpdated}</span>
          )}
        </div>

        {/* Fetch button */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={fetchJobs}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--teal)] text-white text-[14px] font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Fetching jobs…' : 'Fetch latest jobs'}
          </button>
          {loading && (
            <span className="text-[13px] text-[var(--text3)]">Searching Seek, LinkedIn, GradAustralia, Indeed…</span>
          )}
          {error && (
            <span className="text-[13px] text-red-500">{error}</span>
          )}
        </div>

        {/* Stats */}
        <StatsBar
          total={jobs.length}
          newToday={newTodayCount}
          saved={savedIds.length}
          applied={appliedIds.length}
        />

        {/* Search + location */}
        <div className="flex gap-2 mb-2.5 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text3)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search title, company, skill…"
              value={filters.keyword}
              onChange={e => updateFilter('keyword', e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-[14px] bg-white border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--border2)] text-[var(--text)] placeholder:text-[var(--text3)]"
            />
          </div>
          <select
            value={filters.location}
            onChange={e => updateFilter('location', e.target.value)}
            className="px-3 py-2 text-[14px] bg-white border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--border2)] text-[var(--text)] min-w-[150px]"
          >
            <option value="">All locations</option>
            {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* Filters row */}
        <div className="flex gap-2 mb-2.5 flex-wrap">
          <select
            value={filters.type}
            onChange={e => updateFilter('type', e.target.value)}
            className="px-3 py-2 text-[14px] bg-white border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--border2)] text-[var(--text)]"
          >
            <option value="">All types</option>
            {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={filters.source}
            onChange={e => updateFilter('source', e.target.value)}
            className="px-3 py-2 text-[14px] bg-white border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--border2)] text-[var(--text)]"
          >
            <option value="">All sources</option>
            {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filters.status}
            onChange={e => updateFilter('status', e.target.value)}
            className="px-3 py-2 text-[14px] bg-white border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--border2)] text-[var(--text)]"
          >
            <option value="">All statuses</option>
            <option value="new">New today</option>
            <option value="saved">Saved</option>
            <option value="applied">Applied</option>
          </select>
          {(filters.keyword || filters.location || filters.type || filters.source || filters.status) && (
            <button
              onClick={() => setFilters({ keyword: '', location: '', type: '', source: '', status: '' })}
              className="px-3 py-2 text-[13px] text-[var(--text2)] border border-[var(--border)] rounded-xl hover:bg-[var(--surface2)] transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          )}
        </div>

        {/* Sort row */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-[13px] text-[var(--text3)]">Sort:</span>
          {(['date', 'rating', 'alpha'] as SortKey[]).map(s => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-3 py-1.5 text-[13px] rounded-lg border transition-colors ${
                sort === s
                  ? 'bg-[var(--surface2)] border-[var(--border2)] text-[var(--text)]'
                  : 'bg-white border-[var(--border)] text-[var(--text2)] hover:bg-[var(--surface2)]'
              }`}
            >
              {s === 'date' ? '📅 Date' : s === 'rating' ? '⭐ Rating' : '🔤 A–Z'}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(['all', 'saved', 'applied'] as TabKey[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-[13px] rounded-lg border transition-colors capitalize ${
                tab === t
                  ? 'bg-[var(--surface2)] border-[var(--border2)] text-[var(--text)] font-medium'
                  : 'bg-white border-[var(--border)] text-[var(--text2)] hover:bg-[var(--surface2)]'
              }`}
            >
              {t === 'all' ? 'All jobs' : t === 'saved' ? `Saved (${savedIds.length})` : `Applied (${appliedIds.length})`}
            </button>
          ))}
        </div>

        {/* Job count */}
        {jobs.length > 0 && (
          <p className="text-[13px] text-[var(--text3)] mb-3">{filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} shown</p>
        )}

        {/* Jobs list */}
        {filteredJobs.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filteredJobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                saved={savedSet.has(job.id)}
                applied={appliedSet.has(job.id)}
                onSave={toggleSave}
                onApply={toggleApply}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-[var(--text3)]">
            <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-[14px]">
              {jobs.length === 0
                ? 'Click "Fetch latest jobs" to load Sydney CS & SWE roles'
                : 'No jobs match your current filters'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
