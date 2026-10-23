import { useAuth } from '../context/useAuth'
import GoogleMark from './GoogleMark'

/**
 * Navbar — site header showing the app brand and the signed-in user's
 * profile chip with a sign-out button.
 *
 * Stacks vertically on mobile (flex-col) and becomes a single row on sm+.
 * The user chip truncates long names/emails gracefully on narrow viewports.
 */
function Navbar() {
  const { currentUser, logout } = useAuth()

  return (
    <nav
      className="mb-6 flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 backdrop-blur-md sm:mb-8 sm:flex-row sm:items-center sm:px-6 sm:py-4"
      aria-label="Site header"
    >
      {/* Brand */}
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 text-xl font-bold text-white shadow-lg shadow-indigo-500/20"
          aria-hidden="true"
        >
          💼
        </div>
        <p className="truncate text-base font-bold tracking-tight text-white sm:text-lg">
          Job Application Tracker
        </p>
      </div>

      {/* User profile chip + sign-out — only shown when authenticated */}
      {currentUser && (
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end sm:gap-3">
          {/* Avatar + name + provider badge */}
          <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-slate-700/60 bg-slate-800/80 px-3 py-1.5 sm:flex-none">
            <img
              src={currentUser.avatar}
              alt=""                          /* decorative — name announced below */
              width={32}
              height={32}
              decoding="async"
              loading="lazy"
              className="h-8 w-8 shrink-0 rounded-full border border-indigo-400/30 bg-slate-700 object-cover"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=6366f1&color=fff`
              }}
            />

            <div className="min-w-0 text-left">
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="truncate text-xs font-semibold text-white">
                  {currentUser.name}
                </span>

                {/* Provider badge */}
                {currentUser.provider === 'google' ? (
                  <span
                    className="inline-flex shrink-0 items-center gap-1 rounded border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-medium text-rose-300"
                    aria-label="Signed in via Google"
                  >
                    <GoogleMark className="h-2.5 w-2.5" aria-hidden="true" />
                    Google
                  </span>
                ) : (
                  <span
                    className="shrink-0 rounded border border-indigo-500/20 bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-medium text-indigo-300"
                    aria-label="Signed in via email"
                  >
                    Email
                  </span>
                )}
              </div>
              <span className="block truncate text-[11px] text-slate-400">
                {currentUser.email}
              </span>
            </div>
          </div>

          {/* Sign-out button */}
          <button
            type="button"
            onClick={logout}
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-300 transition-all duration-150 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            aria-label="Sign out of your account"
          >
            {/* Logout icon */}
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </nav>
  )
}

export default Navbar
