import { useMemo } from 'react'
import { STATUSES } from '../constants'
import { cardClass } from '../ui/styles'

/**
 * StatCard — a single metric tile in the dashboard grid.
 *
 * @param {string} label   - Visible label (e.g. "Applied")
 * @param {string|number} value - The metric value
 * @param {string} accent  - Tailwind text-colour class for the number
 * @param {string} [icon]  - Optional emoji/icon shown before the label
 */
function StatCard({ label, value, accent, icon }) {
  return (
    <div className={`${cardClass} flex flex-col gap-1 p-3 transition-transform duration-200 hover:scale-[1.02] sm:p-4`}>
      <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-300 sm:text-xs">
        {icon && <span aria-hidden="true">{icon}</span>}
        {label}
      </p>
      <p
        className={`mt-1 text-2xl font-bold tabular-nums sm:mt-1.5 sm:text-3xl ${accent}`}
        aria-label={`${label}: ${value}`}
      >
        {value}
      </p>
    </div>
  )
}

/**
 * Dashboard — responsive stat grid summarising the user's job applications.
 *
 * Computes counts once per render via useMemo so the grid never does
 * redundant work when unrelated state changes.
 */
function Dashboard({ jobs }) {
  const stats = useMemo(() => {
    // Build a zero-count map for every status in one pass
    const counts = Object.fromEntries(STATUSES.map((status) => [status, 0]))

    for (const job of jobs) {
      if (counts[job.Status] !== undefined) {
        counts[job.Status] += 1
      }
    }

    const total     = jobs.length
    const offered   = counts.Offered
    const offerRate = total === 0 ? 0 : Math.round((offered / total) * 100)

    return { total, counts, offerRate }
  }, [jobs])

  return (
    <section className="mb-6 sm:mb-8" aria-labelledby="dashboard-heading">
      <h2
        id="dashboard-heading"
        className="mb-3 text-base font-semibold text-white sm:mb-4 sm:text-lg"
      >
        Dashboard
      </h2>

      {/* 2 cols on mobile → 3 on tablet → 6 on desktop */}
      <div
        className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6"
        role="list"
        aria-label="Application statistics"
      >
        <div role="listitem">
          <StatCard label="Total"      value={stats.total}               accent="text-white"       icon="📋" />
        </div>
        <div role="listitem">
          <StatCard label="Applied"    value={stats.counts.Applied}      accent="text-sky-300"     icon="📤" />
        </div>
        <div role="listitem">
          <StatCard label="Interview"  value={stats.counts.Interview}    accent="text-amber-300"   icon="🗓️" />
        </div>
        <div role="listitem">
          <StatCard label="Offered"    value={stats.counts.Offered}      accent="text-emerald-300" icon="🎉" />
        </div>
        <div role="listitem">
          <StatCard label="Rejected"   value={stats.counts.Rejected}     accent="text-rose-300"    icon="❌" />
        </div>
        <div role="listitem">
          <StatCard label="Offer rate" value={`${stats.offerRate}%`}     accent="text-indigo-200"  icon="📊" />
        </div>
      </div>
    </section>
  )
}

export default Dashboard
