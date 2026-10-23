/**
 * Heading — hero text block shown above the job tracker on the dashboard.
 *
 * Uses a semantic <header> element; the <h1> is only rendered on the
 * authenticated dashboard (AuthPage has its own <h1>), so there is
 * exactly one <h1> per page at any time.
 */
function Heading() {
  return (
    <header className="mb-2 text-center">
      {/* Eyebrow label */}
      <p
        className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300 sm:text-sm"
        aria-hidden="true"          /* decorative; screen readers get the h1 */
      >
        Stay organized
      </p>

      {/* Main page title */}
      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
        Your applications
      </h1>

      {/* Subtitle */}
      <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300 sm:text-base">
        Log applications, update status, and keep every search in one place.
      </p>
    </header>
  )
}

export default Heading
