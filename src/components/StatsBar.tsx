'use client'

interface StatsBarProps {
  total: number
  newToday: number
  saved: number
  applied: number
}

export default function StatsBar({ total, newToday, saved, applied }: StatsBarProps) {
  const stats = [
    { label: 'Total found', value: total },
    { label: 'New today', value: newToday, accent: 'text-red-500' },
    { label: 'Saved', value: saved, accent: 'text-emerald-600' },
    { label: 'Applied', value: applied, accent: 'text-blue-600' },
  ]

  return (
    <div className="grid grid-cols-4 gap-3 mb-5">
      {stats.map((s) => (
        <div key={s.label} className="bg-[var(--surface2)] rounded-xl px-4 py-3">
          <div className={`text-[22px] font-semibold ${s.accent ?? 'text-[var(--text)]'}`}>{s.value}</div>
          <div className="text-[12px] text-[var(--text3)] mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  )
}
