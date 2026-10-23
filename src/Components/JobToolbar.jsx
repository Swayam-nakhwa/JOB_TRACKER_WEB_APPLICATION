import { STATUSES } from '../constants'
import { fieldClass, fieldOk, labelClass } from '../ui/styles'

/**
 * JobToolbar — Search, filter by status, and sort controls.
 *
 * Laid out as a 1-column stack on mobile and a 3-column row on sm+.
 * The section has an accessible label so AT users can navigate to it
 * directly via landmark navigation.
 */
function JobToolbar({
  search,
  statusFilter,
  sortBy,
  onSearch,
  onSearchChange,
  onStatusFilter,
  onStatusFilterChange,
  onSort,
  onSortByChange,
  onResetSearch,
}) {
  const handleSearch = onSearch || onSearchChange
  const handleStatusFilter = onStatusFilter || onStatusFilterChange
  const handleSort = onSort || onSortByChange

  const controlClass = `${fieldClass} ${fieldOk} cursor-pointer`

  return (
    <section
      className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-3 sm:gap-4 sm:p-5"
      aria-label="Filter and sort applications"
    >
      {/* Search — wider column so it gets visual priority */}
      <div className="sm:col-span-1">
        <label htmlFor="job-search" className={labelClass}>
          Search
        </label>
        <div className="relative">
          {/* Search icon inside the input */}
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="job-search"
            type="search"
            value={search}
            onChange={handleSearch}
            placeholder="Company, position, or URL…"
            autoComplete="off"
            aria-label="Search applications by company, position, or URL"
            className={`${fieldClass} ${fieldOk} pl-9`}
          />
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <label htmlFor="status-filter" className={labelClass}>Filter by status</label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={handleStatusFilter}
          className={controlClass}
          aria-label="Filter applications by status"
        >
          <option value="All">All statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Sort Order */}
      <div>
        <label htmlFor="sort-by" className={labelClass}>Sort by</label>
        <select
          id="sort-by"
          value={sortBy}
          onChange={handleSort}
          className={controlClass}
          aria-label="Sort applications"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="az">Company A → Z</option>
          <option value="za">Company Z → A</option>
        </select>
      </div>
    </section>
  )
}

export default JobToolbar
