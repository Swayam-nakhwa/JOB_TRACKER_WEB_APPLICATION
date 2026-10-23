import { useEffect, useState } from 'react'
import { AuthContext } from './authContextCore'
import { apiRequest, setAuthToken, getAuthToken } from '../utils/api'

const AUTH_USER_KEY = 'job-tracker-current-user'

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  // Verify session with backend on startup
  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      if (currentUser) {
        setCurrentUser(null)
        localStorage.removeItem(AUTH_USER_KEY)
      }
      return
    }

    apiRequest('/api/auth/me')
      .then((res) => {
        if (res.success && res.user) {
          setCurrentUser(res.user)
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user))
        } else if (res.status === 401 || (res.error && res.error.includes('expired'))) {
          // Token expired or invalid
          setAuthToken(null)
          setCurrentUser(null)
          localStorage.removeItem(AUTH_USER_KEY)
        }
      })
      .catch(() => {})
  }, [])

  // Sync currentUser with localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser))
    } else {
      localStorage.removeItem(AUTH_USER_KEY)
    }
  }, [currentUser])

  // 1. Email & Password Login via Backend (with bcrypt verification)
  const loginWithEmail = async (email, password) => {
    const res = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    if (!res.success) {
      return { success: false, error: res.error || 'Invalid email or password.' }
    }

    setAuthToken(res.token)
    setCurrentUser(res.user)
    setIsAuthModalOpen(false)
    return { success: true, user: res.user }
  }

  // 2. Email & Password Registration via Backend (with bcrypt hashing)
  const registerWithEmail = async (name, email, password) => {
    const res = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })

    if (!res.success) {
      return { success: false, error: res.error || 'Failed to create account.' }
    }

    setAuthToken(res.token)
    setCurrentUser(res.user)
    setIsAuthModalOpen(false)
    return { success: true, user: res.user }
  }

  // 3. Request OTP for Password Reset
  const requestPasswordResetOtp = async (email) => {
    const res = await apiRequest('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })

    if (!res.success) {
      return { success: false, error: res.error || 'Failed to request OTP.' }
    }

    return {
      success: true,
      email: res.email,
      otp: res.otp, // Dev OTP code provided when SMTP is not configured
      deliveredViaRealEmail: res.deliveredViaRealEmail,
      message: res.message,
    }
  }

  // 4. Verify OTP Code
  const verifyPasswordResetOtp = async (email, otp) => {
    const res = await apiRequest('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    })

    if (!res.success) {
      return { success: false, error: res.error || 'Invalid or expired OTP code.' }
    }

    return { success: true }
  }

  // 5. Reset Password With OTP (hashes new password with bcrypt on backend)
  const resetPasswordWithOtp = async (email, otp, newPassword) => {
    const res = await apiRequest('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    })

    if (!res.success) {
      return { success: false, error: res.error || 'Failed to reset password.' }
    }

    return { success: true }
  }

  // 6. Logout
  const logout = () => {
    setAuthToken(null)
    setCurrentUser(null)
    localStorage.removeItem(AUTH_USER_KEY)
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        loginWithEmail,
        registerWithEmail,
        requestPasswordResetOtp,
        verifyPasswordResetOtp,
        resetPasswordWithOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
