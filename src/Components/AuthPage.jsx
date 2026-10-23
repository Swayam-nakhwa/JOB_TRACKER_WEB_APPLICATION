import { useEffect, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { fieldClass, fieldOk } from '../ui/styles'
import PageShell from './PageShell'

function AuthPage() {
  const {
    loginWithEmail,
    registerWithEmail,
    requestPasswordResetOtp,
    verifyPasswordResetOtp,
    resetPasswordWithOtp,
  } = useAuth()

  // Tabs: 'email-signin', 'email-signup', 'forgot-password'
  const [activeTab, setActiveTab] = useState('email-signin')

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isSendingOtp, setIsSendingOtp] = useState(false)

  // OTP & Forgot Password states
  // otpStep: 1 = Enter Email, 2 = Enter OTP, 3 = Enter New Password, 4 = Success
  const [otpStep, setOtpStep] = useState(1)
  const [forgotEmail, setForgotEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [deliveryStatus, setDeliveryStatus] = useState(null)
  const [devOtpCode, setDevOtpCode] = useState('')

  // Technical terms drawer
  const [showTechInfo, setShowTechInfo] = useState(false)

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    if (!email.trim() || !password) {
      setError('Please provide both your email and password.')
      return
    }
    const res = await loginWithEmail(email, password)
    if (!res.success) {
      setError(res.error)
    }
  }

  const handleEmailRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
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
    const res = await registerWithEmail(name, email, password)
    if (!res.success) {
      setError(res.error)
    }
  }

  // --- FORGOT PASSWORD & OTP HANDLERS ---
  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    setIsSendingOtp(true)

    try {
      const res = await requestPasswordResetOtp(forgotEmail)
      if (!res.success) {
        setError(res.error)
        setIsSendingOtp(false)
        return
      }

      setDeliveryStatus({
        deliveredViaRealEmail: res.deliveredViaRealEmail,
        email: res.email,
        message: res.message,
      })

      if (res.otp) {
        setDevOtpCode(res.otp)
      }

      setResendCooldown(30)
      setOtpStep(2)
      setSuccessMsg(`A 6-digit verification code has been generated for ${res.email}`)
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setError('Please enter the complete 6-digit code from your email.')
      return
    }

    const res = await verifyPasswordResetOtp(forgotEmail, otpCode)
    if (!res.success) {
      setError(res.error)
      return
    }

    setOtpStep(3)
    setSuccessMsg('Code verified successfully! Now create your new password.')
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify both passwords.')
      return
    }

    const res = await resetPasswordWithOtp(forgotEmail, otpCode, newPassword)
    if (!res.success) {
      setError(res.error)
      return
    }

    setOtpStep(4)
    setSuccessMsg('Your password has been reset successfully! You can now sign in.')
    setEmail(forgotEmail)
    setPassword(newPassword)
  }

  const fillDemoAccount = () => {
    setEmail('alex.developer@gmail.com')
    setPassword('password123')
    setError('')
    setSuccessMsg('')
  }

  const authFieldClass = `${fieldClass} ${fieldOk} bg-slate-950`

  return (
    <PageShell>
      <a href="#auth-main" className="skip-link">
        Skip to sign in
      </a>

      <main id="auth-main" tabIndex={-1}>
        <div className="mb-6 text-center sm:mb-8">
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-400/30 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 text-3xl font-bold text-white shadow-xl shadow-indigo-500/25"
            aria-hidden="true"
          >
            💼
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
            Job Application Tracker
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to access your applications dashboard and track your interviews
          </p>
        </div>

        {/* Main Auth Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
          {/* Tabs */}
          <div
            className="flex gap-1 overflow-x-auto border-b border-slate-800 bg-slate-950/60 p-1.5 text-xs"
            role="tablist"
            aria-label="Sign in options"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'email-signin' || activeTab === 'forgot-password'}
              onClick={() => {
                setActiveTab('email-signin')
                setError('')
                setSuccessMsg('')
              }}
              className={`min-h-11 min-w-[5.5rem] flex-1 rounded-xl px-2 py-2.5 font-semibold transition-all ${
                activeTab === 'email-signin' || activeTab === 'forgot-password'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Email & Password
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'email-signup'}
              onClick={() => {
                setActiveTab('email-signup')
                setError('')
                setSuccessMsg('')
              }}
              className={`min-h-11 min-w-[5.5rem] flex-1 rounded-xl px-2 py-2.5 font-semibold transition-all ${
                activeTab === 'email-signup'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div
              className="mx-4 mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300 sm:mx-6 sm:text-xs"
              role="alert"
            >
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

          {successMsg && (
            <div
              className="mx-4 mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300 sm:mx-6 sm:text-xs"
              role="status"
            >
              <svg className="h-4 w-4 shrink-0 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: EMAIL & APP PASSWORD SIGN IN */}
          {activeTab === 'email-signin' && (
            <form onSubmit={handleEmailLogin} className="p-6 space-y-4">
              <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 text-xs text-sky-200/90 leading-relaxed">
                🔑 <strong>Local Credentials:</strong> Sign in using your registered email and application password.
              </div>

              <div className="space-y-1 text-left">
                <label htmlFor="signin-email" className="text-xs font-semibold text-slate-300">
                  Email Address
                </label>
                <input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@gmail.com"
                  className={authFieldClass}
                  required
                />
              </div>

              <div className="space-y-1 text-left">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="signin-password" className="text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('forgot-password')
                        setForgotEmail(email)
                        setOtpStep(1)
                        setError('')
                        setSuccessMsg('')
                      }}
                      className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={authFieldClass}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-indigo-700 transition-all active:scale-[0.99]"
              >
                Sign In & Open Dashboard
              </button>

              <div className="flex flex-col gap-3 pt-2 text-xs sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={fillDemoAccount}
                  className="min-h-11 text-left font-medium text-slate-400 hover:text-indigo-300 transition-colors sm:min-h-0"
                >
                  Auto-fill Demo Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('email-signup')
                    setError('')
                    setSuccessMsg('')
                  }}
                  className="min-h-11 text-left font-semibold text-indigo-400 hover:text-indigo-300 transition-colors sm:min-h-0"
                >
                  Need an account? Sign Up →
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: SIGN UP */}
          {activeTab === 'email-signup' && (
            <form onSubmit={handleEmailRegister} className="p-6 space-y-4">
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 text-xs text-indigo-200/90 leading-relaxed">
                ✨ <strong>Create Account:</strong> Register your real email to start tracking applications.
              </div>

              <div className="space-y-1 text-left">
                <label htmlFor="signup-name" className="text-xs font-semibold text-slate-300">
                  Full Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Swayam"
                  className={authFieldClass}
                  required
                />
              </div>

              <div className="space-y-1 text-left">
                <label htmlFor="signup-email" className="text-xs font-semibold text-slate-300">
                  Email Address
                </label>
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-real-email@gmail.com"
                  className={authFieldClass}
                  required
                />
              </div>

              <div className="space-y-1 text-left">
                <div className="flex items-center justify-between">
                  <label htmlFor="signup-password" className="text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters (for Job Tracker)"
                  className={authFieldClass}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-indigo-700 transition-all active:scale-[0.99]"
              >
                Create Account & Enter Dashboard
              </button>

              <div className="text-center pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('email-signin')
                    setError('')
                    setSuccessMsg('')
                  }}
                  className="text-slate-400 hover:text-slate-200"
                >
                  Already registered? <span className="font-semibold text-indigo-400">Sign in</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: SECURE FORGOT PASSWORD & REAL EMAIL OTP */}
          {activeTab === 'forgot-password' && (
            <div className="p-6 space-y-5 text-left">
              {/* Back to login header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-sm">
                    ✉️
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">Reset Password with OTP</h3>
                    <p className="text-[11px] text-slate-400">
                      Step {otpStep} of 3: {otpStep === 1 ? 'Enter Email' : otpStep === 2 ? 'Check Email for OTP' : 'Create New Password'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('email-signin')
                    setError('')
                    setSuccessMsg('')
                  }}
                  className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>

              {/* STEP 1: Enter Email to receive OTP */}
              {otpStep === 1 && (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 text-xs text-indigo-200/90 leading-relaxed">
                    📩 Enter your registered email address. We will dispatch a <strong>secret 6-digit verification code</strong> directly to your email inbox.
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="forgot-email" className="text-xs font-semibold text-slate-300">
                      Your Registered Email
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      autoComplete="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="your-real-email@gmail.com"
                      className={authFieldClass}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-indigo-700 transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSendingOtp ? (
                      <>
                        <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Dispatching Code to Your Inbox...</span>
                      </>
                    ) : (
                      'Send Verification Code to Email →'
                    )}
                  </button>

                  <div className="text-center space-y-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setForgotEmail('alex.developer@gmail.com')}
                      className="text-[11px] text-slate-400 hover:text-indigo-300"
                    >
                      ⚡ Quick test with demo email: <span className="font-mono text-indigo-400">alex.developer@gmail.com</span>
                    </button>
                    <p className="text-[11px] text-slate-500">
                      (Want to test with your real email? Switch to <button type="button" onClick={() => { setActiveTab('email-signup'); setError(''); }} className="text-indigo-400 underline font-medium">Sign Up</button> to register it first!)
                    </p>
                  </div>
                </form>
              )}

              {/* STEP 2: Enter & Verify 6-Digit OTP from Email */}
              {otpStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  {/* LOCALHOST DEVELOPMENT SIMULATION */}
                  {devOtpCode && (
                    <div className="overflow-hidden rounded-2xl border border-indigo-500/30 bg-indigo-950/20 shadow-lg">
                      <div className="flex items-center justify-between border-b border-indigo-500/20 bg-indigo-900/40 px-3.5 py-2 text-[11px] text-indigo-200">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span>📬 Verification Code Notification</span>
                        </div>
                        <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">
                          Dev Mode
                        </span>
                      </div>
                      <div className="p-3.5 space-y-2.5 text-xs">
                        <div className="text-[11px] text-slate-300">
                          <strong>Recipient:</strong> {forgotEmail} <br />
                          <strong>Subject:</strong> Job Application Tracker - Password Reset Code
                        </div>

                        {deliveryStatus?.deliveredViaRealEmail && (
                          <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300 border border-emerald-500/20">
                            <span>✅ Delivered via SMTP to inbox</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between rounded-xl bg-slate-950/90 p-3 border border-indigo-500/30">
                          <div>
                            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                              Your 6-Digit OTP:
                            </span>
                            <div className="font-mono text-2xl font-black tracking-[0.25em] text-emerald-400">
                              {devOtpCode}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setOtpCode(devOtpCode)
                              setError('')
                            }}
                            className="rounded-xl bg-indigo-500/20 border border-indigo-500/40 px-3 py-1.5 text-xs font-bold text-indigo-200 hover:bg-indigo-500/30 transition-all active:scale-95 flex items-center gap-1.5"
                          >
                            <span>📋 Auto-fill OTP</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label htmlFor="otp-code" className="text-xs font-semibold text-slate-300">
                      Enter 6-Digit Code from Your Email
                    </label>
                    <input
                      id="otp-code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 text-center font-mono text-2xl tracking-[0.4em] text-white shadow-inner placeholder-slate-700 focus:border-indigo-500 focus:outline-none sm:tracking-[0.6em]"
                      required
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-indigo-700 transition-all active:scale-[0.99]"
                  >
                    Verify Code →
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => setOtpStep(1)}
                      className="text-slate-400 hover:text-white"
                    >
                      ← Change Email
                    </button>
                    <button
                      type="button"
                      disabled={resendCooldown > 0}
                      onClick={handleRequestOtp}
                      className={`font-semibold ${
                        resendCooldown > 0
                          ? 'text-slate-600 cursor-not-allowed'
                          : 'text-indigo-400 hover:text-indigo-300'
                      }`}
                    >
                      {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend Code'}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Enter New Password */}
              {otpStep === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-200/90 leading-relaxed">
                    ✅ <strong>Email Identity Verified!</strong> You can now choose a new password for your account.
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="new-password" className="text-xs font-semibold text-slate-300">
                      New Password
                    </label>
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className={authFieldClass}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="confirm-password" className="text-xs font-semibold text-slate-300">
                        Confirm New Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <input
                      id="confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className={authFieldClass}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 transition-all active:scale-[0.99]"
                  >
                    Save New Password
                  </button>
                </form>
              )}

              {/* STEP 4: Success Completion */}
              {otpStep === 4 && (
                <div className="space-y-4 py-2 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-2xl">
                    🎉
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Password Updated!</h4>
                    <p className="mt-1 text-xs text-slate-300">
                      Your password for <strong className="text-white">{forgotEmail}</strong> has been successfully changed.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('email-signin')
                      setError('')
                      setSuccessMsg('You can now sign in with your new password!')
                    }}
                    className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-indigo-700 transition-all"
                  >
                    Proceed to Sign In →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer Info & Tech Terms Toggle */}
          <div className="flex flex-col gap-2 border-t border-slate-800 bg-slate-950/60 px-4 py-3.5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span>Secure Out-of-Band Verification</span>
            <button
              type="button"
              onClick={() => setShowTechInfo(!showTechInfo)}
              className="min-h-11 text-left font-medium text-indigo-400 hover:text-indigo-300 transition-colors sm:min-h-0 sm:text-right"
              aria-expanded={showTechInfo}
            >
              {showTechInfo ? 'Hide Security Details' : "Why OTP isn't shown on screen?"}
            </button>
          </div>
        </div>

        {/* Collapsible Technical Terms Explanation Card */}
        {showTechInfo && (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 text-left text-xs space-y-3.5 shadow-xl animate-in fade-in duration-200">
            <h3 className="font-bold text-white text-sm">
              🛡️ Security Architecture & Principles:
            </h3>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3">
              <span className="font-semibold text-emerald-300">1. Out-of-Band Authentication (OOBA)</span>
              <p className="mt-1 text-emerald-100/90 leading-relaxed text-[11px]">
                The OTP is sent through a separate, private communication channel (the user&apos;s real email inbox). The browser UI <strong>must never</strong> display the code; otherwise, an unauthorized visitor knowing someone&apos;s email could read the code on-screen and hijack their account.
              </p>
            </div>

            <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-3">
              <span className="font-semibold text-indigo-300">2. Real Email Dispatch</span>
              <p className="mt-1 text-indigo-200/90 leading-relaxed text-[11px]">
                Real emails are dispatched using <strong>SMTP</strong> (e.g. Gmail SMTP via Nodemailer) or email services like <strong>EmailJS</strong> and <strong>Resend</strong>. In local development, if SMTP credentials are not yet saved to <code>.env</code>, the server logs the dispatch in the developer&apos;s private terminal.
              </p>
            </div>
          </div>
        )}
      </main>
    </PageShell>
  )
}

export default AuthPage
