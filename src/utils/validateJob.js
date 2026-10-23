export function isValidHttpUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function validateJob({ companyName, jobRole, jobUrl }) {
  const errors = {}

  if (!companyName.trim()) {
    errors.companyName = 'Company name is required.'
  }

  if (!jobRole.trim()) {
    errors.jobRole = 'Position is required.'
  }

  if (jobUrl.trim() && !isValidHttpUrl(jobUrl.trim())) {
    errors.jobUrl =
      'Enter a valid URL starting with http:// or https://, or leave this field empty.'
  }

  return errors
}
