const SCRIPT_ID = 'google-identity-services'

/**
 * Loads Google Identity Services only when the Google sign-in tab is shown.
 * Avoids paying the cost of that third-party script on every page load.
 */
export function loadGoogleIdentity() {
  if (window.google?.accounts?.id) {
    return Promise.resolve()
  }

  const existing = document.getElementById(SCRIPT_ID)
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('GIS script failed')), {
        once: true,
      })
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('GIS script failed'))
    document.head.appendChild(script)
  })
}
