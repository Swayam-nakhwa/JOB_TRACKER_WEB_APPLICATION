import { lazy, Suspense } from 'react'
import { AuthProvider } from './context/AuthContext.jsx'
import { useAuth } from './context/useAuth.js'
import AuthPage from './Components/AuthPage.jsx'
import Navbar from './Components/Navbar.jsx'
import Heading from './Components/Heading.jsx'
import PageShell from './Components/PageShell.jsx'
import { ErrorBoundary } from './Components/ErrorBoundary.jsx'

/*
 * Lazy-load the heavy tracker chunk so the auth screen loads instantly.
 * The Suspense fallback is shown only during the initial JS parse.
 */
const JobTracker = lazy(() => import('./Components/JOB_APPLICATION_TRACKER_PROJECT.jsx'))

/**
 * TrackerFallback — skeleton shown while the lazy JobTracker chunk loads.
 * Uses role="status" + aria-live="polite" so AT announces it non-intrusively.
 */
function TrackerFallback() {
  return (
    <div
      className="animate-pulse space-y-4"
      role="status"
      aria-live="polite"
      aria-label="Loading your tracker"
    >
      {/* Dashboard skeleton */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-2xl border border-white/10 bg-white/5 sm:h-24"
          />
        ))}
      </div>

      {/* Form skeleton */}
      <div className="h-48 rounded-2xl border border-white/10 bg-white/5" />

      {/* Toolbar skeleton */}
      <div className="h-16 rounded-2xl border border-white/10 bg-white/5" />

      {/* Cards skeleton */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-52 rounded-2xl border border-white/10 bg-white/5"
          />
        ))}
      </div>

      <span className="sr-only">Loading your tracker…</span>
    </div>
  )
}

/**
 * AppContent — renders the correct top-level view based on auth state.
 *
 * Two possible states:
 *  1. Not signed in → AuthPage (full-screen auth flow)
 *  2. Signed in     → Dashboard with Navbar, Heading, and the JobTracker
 */
function AppContent() {
  const { currentUser } = useAuth()

  if (!currentUser) {
    return <AuthPage />
  }

  return (
    <PageShell wide>
      {/* Skip link — keyboard users jump straight to the job tracker */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Navbar />
      <Heading />

      <main id="main-content" className="mt-8 sm:mt-10" tabIndex={-1}>
        <ErrorBoundary>
          <Suspense fallback={<TrackerFallback />}>
            <JobTracker key={currentUser.id} userId={currentUser.id} />
          </Suspense>
        </ErrorBoundary>
      </main>
    </PageShell>
  )
}

/**
 * App — root component. Wraps everything in AuthProvider so the auth
 * context is available to all descendants.
 */
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
