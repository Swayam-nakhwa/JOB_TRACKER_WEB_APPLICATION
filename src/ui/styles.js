/**
 * Shared Tailwind class names.
 *
 * Keeping all visual tokens in one file means any design change
 * (colours, radius, sizing) is made here once and instantly
 * applied across every screen — no hunting through components.
 */

/** Base input / select field — works for text, url, email, search, and select */
export const fieldClass = [
  'w-full min-h-11 rounded-xl border bg-slate-900/70 px-3.5 py-2.5',
  'text-base text-white sm:text-sm',
  'outline-none transition-all duration-150 placeholder:text-slate-500',
  // Keyboard-visible focus ring
  'focus-visible:border-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-400/30',
  // Smooth selection highlight
  'selection:bg-indigo-500/30',
].join(' ')

/** Border colour when the field has no validation error */
export const fieldOk = 'border-white/10 hover:border-white/20'

/** Border colour + focus ring when the field has a validation error */
export const fieldError = 'border-rose-400/70 focus-visible:ring-rose-400/40'

/** Primary CTA button — indigo gradient, full-width on mobile, auto on sm+ */
export const primaryButtonClass = [
  'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl',
  'bg-gradient-to-r from-indigo-500 to-indigo-600 px-5 py-2.5',
  'text-sm font-semibold text-white shadow-lg shadow-indigo-500/20',
  'transition-all duration-150',
  'hover:from-indigo-400 hover:to-indigo-500 hover:shadow-indigo-400/30',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
  'active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
  'sm:w-auto',
].join(' ')

/** Secondary / neutral button — ghost-style with subtle border */
export const secondaryButtonClass = [
  'inline-flex min-h-11 items-center justify-center rounded-xl',
  'border border-white/15 px-5 py-2.5 text-sm font-semibold text-slate-200',
  'transition-all duration-150 hover:bg-white/5 hover:border-white/25',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
  'active:scale-[0.98]',
].join(' ')

/** Destructive / delete button — rose background */
export const dangerButtonClass = [
  'inline-flex min-h-11 items-center justify-center rounded-xl',
  'bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white',
  'transition-all duration-150 hover:bg-rose-400',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
  'active:scale-[0.98]',
].join(' ')

/** Frosted-glass card used by the Dashboard stat cards and the form panel */
export const cardClass =
  'rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur-sm sm:p-5'

/** Consistent field label */
export const labelClass = 'mb-1.5 block text-sm font-medium text-slate-200'
