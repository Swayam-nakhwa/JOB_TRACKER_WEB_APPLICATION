import { useCallback } from 'react'
import { useEscapeKey } from '../hooks/useEscapeKey'
import { dangerButtonClass, secondaryButtonClass } from '../ui/styles'

/**
 * DeleteConfirmModal — confirmation dialog before permanently removing a job.
 *
 * Accessibility:
 *  – role="dialog" + aria-modal="true" trap focus within the overlay
 *  – aria-labelledby + aria-describedby connect the heading and body copy
 *  – Escape key closes the dialog (via useEscapeKey hook)
 *  – Clicking the backdrop also cancels
 *  – Focus order: Cancel first (safe default), Delete second
 */
function DeleteConfirmModal({ job, onCancel, onConfirm }) {
  // Stable reference so the hook dependency array stays stable
  const handleCancel = useCallback(() => onCancel(), [onCancel])

  // Close on Escape when the dialog is open
  useEscapeKey(Boolean(job), handleCancel)

  // Return null when there is no job pending deletion
  if (!job) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-title"
      aria-describedby="delete-copy"
    >
      {/* Invisible backdrop button — clicking it cancels, keyboard users reach the real buttons */}
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close confirmation dialog"
        onClick={onCancel}
        tabIndex={-1}         /* keep out of natural tab order */
      />

      {/* Dialog panel — slides up on mobile (items-end), centred on sm+ */}
      <div className="animate-fade-in relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-2xl sm:p-6">
        <h2 id="delete-title" className="text-lg font-semibold text-white">
          Delete this application?
        </h2>

        <p id="delete-copy" className="mt-2 text-sm text-slate-300 leading-relaxed">
          This will permanently remove{' '}
          <strong className="text-white">{job.CompanyName}</strong>{' '}
          — {job.JobRole}. This action cannot be undone.
        </p>

        {/*
         * Button order: Cancel first (safe default action), Delete second.
         * On mobile the column-reverse stacks Cancel on top visually.
         */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className={secondaryButtonClass}
            autoFocus          /* move focus to the safe option when dialog opens */
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={dangerButtonClass}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal
