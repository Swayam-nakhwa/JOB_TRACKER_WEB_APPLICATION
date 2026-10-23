import { STATUSES } from '../constants'
import { fieldClass, fieldOk, primaryButtonClass, secondaryButtonClass } from '../ui/styles'

/**
 * FieldLabel — accessible label with required/optional indicator.
 *
 * The asterisk (*) is hidden from AT via aria-hidden and supplemented
 * by "required" text in the SR-only span, so screen readers announce
 * "Company (required)" rather than the decorative "*".
 */
function FieldLabel({ htmlFor, children, required }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-200">
      {children}
      {required ? (
        <>
          <span className="ml-1 text-rose-400" aria-hidden="true">*</span>
          <span className="sr-only"> (required)</span>
        </>
      ) : (
        <span className="ml-2 text-xs font-normal text-slate-400">(optional)</span>
      )}
    </label>
  )
}

/**
 * JobForm — Add / Edit job application form.
 *
 * All inputs are properly labelled, error-associated via aria-describedby,
 * and marked aria-invalid so AT announces validation failures.
 */
function JobForm({
  companyName,
  jobRole,
  jobUrl,
  status,
  errors = {},
  isEditing,
  onCompanyChange,
  onCompanyNameChange,
  onRoleChange,
  onJobRoleChange,
  onUrlChange,
  onJobUrlChange,
  onStatusChange,
  onSubmit,
  onCancelEdit,
  onCancel,
}) {
  const handleCompanyChange = onCompanyChange || onCompanyNameChange
  const handleRoleChange = onRoleChange || onJobRoleChange
  const handleUrlChange = onUrlChange || onJobUrlChange
  const handleCancel = onCancelEdit || onCancel

  /** Returns the correct border class depending on whether the field has an error. */
  const inputClass = (hasError) =>
    `${fieldClass} ${hasError ? 'border-rose-400/70 focus-visible:ring-rose-400/40' : fieldOk}`

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label={isEditing ? 'Edit job application' : 'Add job application'}
      className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur-sm sm:mb-8 sm:p-6"
    >
      <h2 className="mb-4 text-base font-semibold text-white sm:text-lg">
        {isEditing ? 'Update application' : 'Add application'}
      </h2>

      {/* 1-col on mobile, 2-col on sm+ */}
      <div className="grid gap-4 sm:grid-cols-2">

        {/* Company Name */}
        <div>
          <FieldLabel htmlFor="company-name" required>Company</FieldLabel>
          <input
            id="company-name"
            name="company"
            type="text"
            autoComplete="organization"
            value={companyName}
            onChange={handleCompanyChange}
            aria-invalid={Boolean(errors.companyName)}
            aria-describedby={errors.companyName ? 'company-error' : undefined}
            aria-required="true"
            placeholder="e.g. Google"
            className={inputClass(errors.companyName)}
          />
          {errors.companyName && (
            <p id="company-error" className="mt-1.5 flex items-center gap-1 text-sm text-rose-300" role="alert">
              <span aria-hidden="true">⚠</span>
              {errors.companyName}
            </p>
          )}
        </div>

        {/* Job Role / Position */}
        <div>
          <FieldLabel htmlFor="job-role" required>Position</FieldLabel>
          <input
            id="job-role"
            name="role"
            type="text"
            autoComplete="off"
            value={jobRole}
            onChange={handleRoleChange}
            aria-invalid={Boolean(errors.jobRole)}
            aria-describedby={errors.jobRole ? 'role-error' : undefined}
            aria-required="true"
            placeholder="e.g. Frontend Developer"
            className={inputClass(errors.jobRole)}
          />
          {errors.jobRole && (
            <p id="role-error" className="mt-1.5 flex items-center gap-1 text-sm text-rose-300" role="alert">
              <span aria-hidden="true">⚠</span>
              {errors.jobRole}
            </p>
          )}
        </div>

        {/* Job URL — spans both columns */}
        <div className="sm:col-span-2">
          <FieldLabel htmlFor="job-url">Job URL</FieldLabel>
          <input
            id="job-url"
            name="url"
            type="url"
            inputMode="url"
            autoComplete="url"
            value={jobUrl}
            onChange={handleUrlChange}
            aria-invalid={Boolean(errors.jobUrl)}
            aria-describedby={errors.jobUrl ? 'url-error' : undefined}
            placeholder="https://company.com/careers/role"
            className={inputClass(errors.jobUrl)}
          />
          {errors.jobUrl && (
            <p id="url-error" className="mt-1.5 flex items-center gap-1 text-sm text-rose-300" role="alert">
              <span aria-hidden="true">⚠</span>
              {errors.jobUrl}
            </p>
          )}
        </div>

        {/* Application Status */}
        <div>
          <FieldLabel htmlFor="job-status" required>Status</FieldLabel>
          <select
            id="job-status"
            name="status"
            value={status}
            onChange={onStatusChange}
            aria-required="true"
            className={`${fieldClass} ${fieldOk} cursor-pointer`}
          >
            {STATUSES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button type="submit" className={primaryButtonClass}>
          {isEditing ? 'Save changes' : 'Add application'}
        </button>
        {isEditing && (
          <button type="button" onClick={handleCancel} className={secondaryButtonClass}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export default JobForm
