import { memo } from 'react'
import { STATUSES, STATUS_STYLES } from '../constants'
import { fieldClass, fieldOk } from '../ui/styles'

/**
 * JobCard — a single job application card.
 *
 * Wrapped in React.memo so it only re-renders when its own job data or
 * one of its callbacks changes — avoids unnecessary repaints when other
 * cards are edited or the filter changes.
 *
 * @param {object}   job            - The job record
 * @param {Function} onStatusChange - (id, status) => void
 * @param {Function} onEdit         - (job) => void
 * @param {Function} onAskDelete    - (job) => void
 */
const JobCard = memo(function JobCard({ job, onStatusChange, onEdit, onAskDelete }) {
  const statusSelectId = `status-${job.id}`

  const rawDate = job.createdAt || job.date || (typeof job.id === 'number' ? job.id : null)
  const parsedDate = rawDate ? new Date(rawDate) : null
  const isValidDate = parsedDate && !isNaN(parsedDate.getTime())

  const loggedDate = isValidDate
    ? parsedDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : (job.date || 'Recently')

  const isoDateTime = isValidDate ? parsedDate.toISOString() : undefined

  return (
    <article
      className="job-card animate-fade-in-up relative rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-lg transition-all duration-200 hover:border-indigo-400/40 hover:shadow-indigo-500/10 hover:-translate-y-0.5 sm:p-5"
      aria-label={`${job.CompanyName} — ${job.JobRole}`}
    >
      {/* Header: Company name + Role + Status badge */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-white sm:text-lg">
            {job.CompanyName}
          </h3>
          <p className="truncate text-sm text-slate-300">{job.JobRole}</p>
        </div>

        {/* Status badge */}
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${
            STATUS_STYLES[job.Status] ?? STATUS_STYLES.Applied
          }`}
          aria-label={`Status: ${job.Status}`}
        >
          {job.Status}
        </span>
      </div>

      {/* Job posting link */}
      {job.JobUrl ? (
        <a
          href={job.JobUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-indigo-300 underline underline-offset-2 hover:text-indigo-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
        >
          View posting
          {/* Hidden text for AT: announces destination context */}
          <span className="sr-only">for {job.CompanyName} (opens in a new tab)</span>
          {/* External link icon */}
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      ) : (
        <p className="mb-3 flex items-center gap-1 text-sm text-slate-500">
          <span aria-hidden="true">🔗</span>
          No job URL added
        </p>
      )}

      {/* Logged date */}
      <p className="mb-4 text-xs text-slate-400">
        <time dateTime={isoDateTime}>
          Logged {loggedDate}
        </time>
      </p>

      {/* Inline status selector */}
      <label
        htmlFor={statusSelectId}
        className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400"
      >
        Update status
      </label>
      <select
        id={statusSelectId}
        value={job.Status}
        onChange={(e) => onStatusChange(job.id, e.target.value)}
        className={`mb-4 w-full cursor-pointer rounded-xl border bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none transition-all focus-visible:border-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-400/30 ${fieldOk}`}
        aria-label={`Change status for ${job.CompanyName} — ${job.JobRole}`}
      >
        {STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>

      {/* Action buttons: stack on mobile, side-by-side on sm+ */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => onEdit(job)}
          className="min-h-11 flex-1 rounded-xl bg-white/10 px-3 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 active:scale-95"
          aria-label={`Edit ${job.CompanyName} — ${job.JobRole}`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onAskDelete(job)}
          className="min-h-11 flex-1 rounded-xl bg-rose-500/15 px-3 py-2 text-sm font-medium text-rose-200 transition-all duration-150 hover:bg-rose-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 active:scale-95"
          aria-label={`Delete ${job.CompanyName} — ${job.JobRole}`}
        >
          Delete
        </button>
      </div>
    </article>
  )
})

/**
 * JobCardList — renders the responsive grid of JobCard items,
 * or an empty-state message when there are no matching results.
 */
function JobCardList({ jobs, totalCount, onStatusChange, onEdit, onAskDelete }) {
  // Empty state
  if (jobs.length === 0) {
    return (
      <p
        className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-12 text-center text-sm text-slate-300"
        role="status"
        aria-live="polite"
      >
        {totalCount === 0
          ? 'No applications logged yet — add one with the form above.'
          : 'No applications match these filters.'}
      </p>
    )
  }

  return (
    /*
     * Grid layout:
     *  - 1 col on mobile (default)
     *  - 2 cols on md (≥768px)
     *  - 3 cols on xl (≥1280px)
     *
     * role="list" restores list semantics removed by CSS display:grid
     * in some browser/AT combinations (e.g. Safari + VoiceOver).
     */
    <ul
      className="grid list-none gap-4 p-0 md:grid-cols-2 xl:grid-cols-3"
      role="list"
      aria-label={`${jobs.length} job application${jobs.length === 1 ? '' : 's'}`}
    >
      {jobs.map((job) => (
        <li key={job.id}>
          <JobCard
            job={job}
            onStatusChange={onStatusChange}
            onEdit={onEdit}
            onAskDelete={onAskDelete}
          />
        </li>
      ))}
    </ul>
  )
}

export default JobCardList
