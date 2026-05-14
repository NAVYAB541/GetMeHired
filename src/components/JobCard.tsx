'use client'
import { Job } from '@/lib/types'

interface JobCardProps {
  job: Job
  saved: boolean
  applied: boolean
  onSave: (id: string) => void
  onApply: (id: string) => void
}

const SOURCE_COLORS: Record<string, string> = {
  Seek: 'bg-blue-50 text-blue-700 border-blue-200',
  LinkedIn: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  GradAustralia: 'bg-purple-50 text-purple-700 border-purple-200',
  Indeed: 'bg-orange-50 text-orange-700 border-orange-200',
  Otta: 'bg-pink-50 text-pink-700 border-pink-200',
}

const TYPE_COLORS: Record<string, string> = {
  Graduate: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Junior: 'bg-teal-50 text-teal-700 border-teal-200',
  'Software Engineer': 'bg-sky-50 text-sky-700 border-sky-200',
  'Full Stack': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Frontend: 'bg-violet-50 text-violet-700 border-violet-200',
  Backend: 'bg-blue-50 text-blue-700 border-blue-200',
  'AI / ML': 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  DevOps: 'bg-amber-50 text-amber-700 border-amber-200',
  Data: 'bg-rose-50 text-rose-700 border-rose-200',
}

function daysLabel(d: number) {
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  return `${d} days ago`
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-amber-500 text-xs font-medium flex items-center gap-0.5">
      <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      {rating.toFixed(1)}
    </span>
  )
}

export default function JobCard({ job, saved, applied, onSave, onApply }: JobCardProps) {
  const typeStyle = TYPE_COLORS[job.type] || 'bg-gray-50 text-gray-600 border-gray-200'
  const sourceStyle = SOURCE_COLORS[job.source] || 'bg-gray-50 text-gray-600 border-gray-200'

  const leftBorder = applied
    ? 'border-l-[3px] border-l-blue-500'
    : saved
    ? 'border-l-[3px] border-l-emerald-500'
    : ''

  return (
    <div
      className={`bg-white rounded-xl border border-[var(--border)] p-4 hover:border-[var(--border2)] transition-colors ${leftBorder}`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[15px] text-[var(--text)] leading-snug">{job.title}</h3>
          <div className="flex items-center gap-2 mt-0.5 text-[13px] text-[var(--text2)]">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="font-medium">{job.company}</span>
            {job.companyRating > 0 && <StarRating rating={job.companyRating} />}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onSave(job.id)}
            title={saved ? 'Remove from saved' : 'Save job'}
            className={`p-1.5 rounded-lg transition-colors ${
              saved
                ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                : 'text-[var(--text3)] hover:text-[var(--text)] hover:bg-[var(--surface2)]'
            }`}
          >
            <svg className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
          <button
            onClick={() => onApply(job.id)}
            title={applied ? 'Mark as not applied' : 'Mark as applied'}
            className={`p-1.5 rounded-lg transition-colors ${
              applied
                ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                : 'text-[var(--text3)] hover:text-[var(--text)] hover:bg-[var(--surface2)]'
            }`}
          >
            <svg className="w-4 h-4" fill={applied ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${typeStyle}`}>{job.type}</span>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md border bg-gray-50 text-gray-600 border-gray-200 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {job.location}
        </span>
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${sourceStyle}`}>{job.source}</span>
        {job.remote && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md border bg-amber-50 text-amber-700 border-amber-200">Remote / Hybrid</span>
        )}
        {job.postedDaysAgo === 0 && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md border bg-red-50 text-red-600 border-red-200">New today</span>
        )}
        {saved && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md border bg-emerald-50 text-emerald-700 border-emerald-200">Saved</span>
        )}
        {applied && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md border bg-blue-50 text-blue-700 border-blue-200">Applied</span>
        )}
        {job.salary && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md border bg-[var(--surface2)] text-[var(--text2)] border-[var(--border)]">{job.salary}</span>
        )}
      </div>

      {/* Description */}
      <p className="text-[13px] text-[var(--text2)] mt-2.5 leading-relaxed">{job.description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)]">
        <span className="text-[12px] text-[var(--text3)] flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {daysLabel(job.postedDaysAgo)}
        </span>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
        >
          View & apply
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  )
}
