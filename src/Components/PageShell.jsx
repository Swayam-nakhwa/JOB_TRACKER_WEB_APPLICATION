/**
 * PageShell — Full-page wrapper with ambient glow, safe-area padding,
 * and a centred column.
 *
 * Props:
 *   wide — true for the logged-in dashboard (wider max-width);
 *          false (default) for auth screens (narrower, centred).
 */
function PageShell({ children, wide = false }) {
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-slate-950 text-slate-100">
      {/* Decorative ambient glow — hidden from AT */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Top-centre purple glow */}
        <div className="absolute -top-40 left-1/2 h-[min(70vw,520px)] w-[min(100%,680px)] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[130px]" />
        {/* Bottom-right sky glow */}
        <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-sky-600/8 blur-[100px] sm:h-96 sm:w-96" />
        {/* Bottom-left faint indigo accent */}
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-indigo-800/8 blur-[80px] sm:h-64 sm:w-64" />
      </div>

      {/*
       * Content column:
       *   – mx-auto + max-w-* centres it
       *   – safe-area-inset overrides ensure notch/home-bar clearance on iOS
       *   – overflow-x-hidden prevents horizontal scroll on small viewports
       */}
      <div
        className={[
          'relative mx-auto w-full',
          'px-4 sm:px-6 lg:px-8',
          wide ? 'max-w-6xl py-5 sm:py-8 lg:py-10' : 'max-w-lg py-8 sm:py-12',
        ].join(' ')}
        style={{
          paddingTop:    'max(1.25rem, env(safe-area-inset-top))',
          paddingBottom: 'max(1.5rem,  env(safe-area-inset-bottom))',
          paddingLeft:   'max(1rem,    env(safe-area-inset-left))',
          paddingRight:  'max(1rem,    env(safe-area-inset-right))',
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default PageShell
