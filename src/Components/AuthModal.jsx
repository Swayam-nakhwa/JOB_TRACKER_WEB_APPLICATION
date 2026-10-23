import { useState } from 'react'
import { useAuth } from '../context/useAuth'

function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    loginWithEmail,
    registerWithEmail,
  } = useAuth()

  // Tabs: 'email-login', 'email-register', 'learn-tech'
  const [activeTab, setActiveTab] = useState('email-login')

  // Email form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  if (!isAuthModalOpen) return null

  const handleEmailLogin = (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please provide both your email and password.')
      return
    }

    const res = loginWithEmail(email, password)
    if (!res.success) {
      setError(res.error)
    }
  }

  const handleEmailRegister = (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    const res = registerWithEmail(name, email, password)
    if (!res.success) {
      setError(res.error)
    }
  }

  const handleCustomGoogleSubmit = (e) => {
    e.preventDefault()
    if (!customGmail.trim()) {
      setError('Please enter your Gmail address.')
      return
    }
    const cleanEmail = customGmail.trim().toLowerCase()
    const finalEmail = cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@gmail.com`

    loginWithGoogle({
      id: `google_${Date.now()}`,
      name: customName.trim() || finalEmail.split('@')[0],
      email: finalEmail,
    })
  }

  const fillDemoAccount = () => {
    setEmail('alex.developer@gmail.com')
    setPassword('password123')
    setError('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header banner */}
        <div className="relative bg-gradient-to-r from-indigo-900/60 via-slate-900 to-indigo-950/60 p-6 pb-5 border-b border-slate-800">
          <button
            onClick={closeAuthModal}
            className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-2xl shadow-inner">
              🔐
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Authentication Portal</h2>
              <p className="text-xs text-slate-400">
                Sign in with your email &amp; password or create an account
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-5 flex gap-1 rounded-xl bg-slate-950/60 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => {
                setActiveTab('email-login')
                setError('')
              }}
              className={`flex-1 rounded-lg py-2 font-medium transition-all ${
                activeTab === 'email-login'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Email & Password
            </button>
            <button
              onClick={() => {
                setActiveTab('learn-tech')
                setError('')
              }}
              className={`rounded-lg px-2.5 py-2 font-medium transition-all ${
                activeTab === 'learn-tech'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-sky-400 hover:text-sky-300'
              }`}
              title="Learn technical terms: OAuth 2.0, OIDC, Passwords"
            >
              📚 Tech Terms
            </button>
          </div>
        </div>

        {/* Error / Alert banner */}
        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            <svg className="h-4 w-4 shrink-0 text-rose-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: EMAIL & PASSWORD (Local Authentication) */}
        {activeTab === 'email-login' && (
          <form onSubmit={handleEmailLogin} className="p-6 space-y-4">
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 text-xs text-sky-200/90 leading-relaxed">
              💡 <strong>Email & Password Login:</strong> This is for an account password created
              specifically for this website. You should <strong>never</strong> use your private Google
              account password!
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@gmail.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">App Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your account password"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-indigo-700 transition-all active:scale-[0.99]"
            >
              Sign In with Email & Password
            </button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={fillDemoAccount}
                className="font-medium text-slate-400 hover:text-indigo-300 transition-colors"
              >
                ⚡ Use Pre-filled Demo Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('email-register')
                  setError('')
                }}
                className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Create New Account →
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: REGISTER NEW ACCOUNT */}
        {activeTab === 'email-register' && (
          <form onSubmit={handleEmailRegister} className="p-6 space-y-4">
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 text-xs text-indigo-200/90 leading-relaxed">
              ✨ <strong>Register Account:</strong> Choose your name, email, and a password for your Job Tracker workspace.
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-slate-300">Your Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Create Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters (for this app only)"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-indigo-700 transition-all active:scale-[0.99]"
            >
              Register & Sign In
            </button>

            <div className="text-center pt-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('email-login')
                  setError('')
                }}
                className="text-slate-400 hover:text-slate-200"
              >
                Already have an account? <span className="font-semibold text-indigo-400">Sign in</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: TECHNICAL TERMS EXPLANATION (Answers user's question directly) */}
        {activeTab === 'learn-tech' && (
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-left text-xs">
            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/40 p-4">
              <h3 className="text-sm font-bold text-white mb-1">
                📖 Technical Terms Demystified
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Here are the exact industry terms used by software engineers:
              </p>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-sky-500/20 px-2 py-0.5 font-mono text-[11px] font-bold text-sky-400">
                    OAuth 2.0 & OpenID Connect (OIDC)
                  </span>
                </div>
                <p className="mt-2 text-slate-300 leading-relaxed">
                  <strong>OAuth 2.0</strong> is the authorization standard, and <strong>OpenID Connect (OIDC)</strong> is the identity authentication protocol built on top of it. Together they allow users to sign in with Google securely without sharing credentials.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-indigo-500/20 px-2 py-0.5 font-mono text-[11px] font-bold text-indigo-400">
                    Social Login / SSO (Single Sign-On)
                  </span>
                </div>
                <p className="mt-2 text-slate-300 leading-relaxed">
                  <strong>Social Login</strong> (or Federated Authentication) refers to letting users authenticate using existing third-party accounts like Google, GitHub, or Apple instead of creating a brand-new username/password.
                </p>
              </div>

              <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3.5">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-rose-500/20 px-2 py-0.5 font-mono text-[11px] font-bold text-rose-400">
                    ⚠️ The Password Rule
                  </span>
                </div>
                <p className="mt-2 text-rose-200/90 leading-relaxed">
                  <strong>Why apps NEVER ask for Google passwords:</strong> When using Google Sign-In, Google handles the password internally on <code>accounts.google.com</code>. Google never gives the password to third-party websites. Asking for a Google password inside a custom app is prohibited and treated as a security violation (phishing / credential harvesting).
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('google')}
              className="w-full rounded-xl bg-slate-800 py-2.5 font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-950/40 px-6 py-3 flex items-center justify-between text-[11px] text-slate-500">
          <span>Job Application Tracker</span>
          <button
            onClick={closeAuthModal}
            className="hover:text-slate-300 transition-colors underline"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthModal
