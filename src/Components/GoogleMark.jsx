/** Compact Google "G" mark used in auth tabs and profile badges. */
function GoogleMark({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="#EA4335"
        d="M12 5c1.5 0 2.8.5 3.9 1.4l2.9-2.9C17 1.8 14.7 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.6 2.8C6.4 7.2 8.9 5 12 5z"
      />
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
      />
      <path
        fill="#FBBC05"
        d="M5.5 14.9c-.3-.8-.4-1.8-.4-2.9s.2-2 .4-2.9L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.6-2.8z"
      />
      <path
        fill="#34A853"
        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.6-2.1-6.5-5.1L1.9 16C3.7 20.4 7.5 23 12 23z"
      />
    </svg>
  )
}

export default GoogleMark
