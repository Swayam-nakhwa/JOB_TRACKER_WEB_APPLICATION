import express from 'express'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'
import { User } from '../models/User.js'
import { Otp } from '../models/Otp.js'
import { getIsMongoConnected, fallbackStore } from '../db.js'
import { authMiddleware, generateToken } from '../middleware/auth.js'

const router = express.Router()

// Helper to format safe user object without password
function sanitizeUser(user) {
  const id = user._id ? user._id.toString() : user.id
  return {
    id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`,
    createdAt: user.createdAt,
  }
}

// ── REGISTER (with bcrypt hashing) ───────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Full name is required.' })
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' })
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' })
    }

    const cleanEmail = email.trim().toLowerCase()

    // 1. Hash the password with bcrypt (10 salt rounds)
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    if (getIsMongoConnected()) {
      const existing = await User.findOne({ email: cleanEmail })
      if (existing) {
        return res.status(400).json({ success: false, error: 'An account with this email already exists.' })
      }

      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`
      const newUser = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        avatar,
      })

      const token = generateToken(newUser)
      return res.status(201).json({
        success: true,
        token,
        user: sanitizeUser(newUser),
      })
    } else {
      // Resilient fallback store
      const users = fallbackStore.getUsers()
      if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
        return res.status(400).json({ success: false, error: 'An account with this email already exists.' })
      }

      const newUser = {
        id: `user_${Date.now()}`,
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`,
        createdAt: new Date().toISOString(),
      }

      users.push(newUser)
      fallbackStore.saveUsers(users)

      const token = generateToken(newUser)
      return res.status(201).json({
        success: true,
        token,
        user: sanitizeUser(newUser),
      })
    }
  } catch (err) {
    console.error('Registration error:', err)
    return res.status(500).json({ success: false, error: 'Internal server error during registration.' })
  }
})

// ── LOGIN (with bcrypt comparison) ──────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' })
    }

    const cleanEmail = email.trim().toLowerCase()

    let user = null
    if (getIsMongoConnected()) {
      user = await User.findOne({ email: cleanEmail })
    } else {
      const users = fallbackStore.getUsers()
      user = users.find((u) => u.email.toLowerCase() === cleanEmail)
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password. Please verify your credentials or register an account.',
      })
    }

    // Compare provided password with bcrypt hashed password in database
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password. Please verify your credentials.',
      })
    }

    const token = generateToken(user)
    return res.json({
      success: true,
      token,
      user: sanitizeUser(user),
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ success: false, error: 'Internal server error during sign in.' })
  }
})

// ── CURRENT AUTHENTICATED USER ─────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    let user = null
    if (getIsMongoConnected()) {
      user = await User.findById(req.user.id)
    } else {
      const users = fallbackStore.getUsers()
      user = users.find((u) => u.id === req.user.id)
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'User profile not found.' })
    }

    return res.json({ success: true, user: sanitizeUser(user) })
  } catch (err) {
    console.error('Get profile error:', err)
    return res.status(500).json({ success: false, error: 'Failed to fetch user profile.' })
  }
})

// ── FORGOT PASSWORD (generate OTP & dispatch) ──────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email is required.' })
    }

    const cleanEmail = email.trim().toLowerCase()

    let userExists = false
    if (getIsMongoConnected()) {
      userExists = await User.exists({ email: cleanEmail })
    } else {
      const users = fallbackStore.getUsers()
      userExists = users.some((u) => u.email.toLowerCase() === cleanEmail)
    }

    if (!userExists) {
      return res.status(404).json({
        success: false,
        error: 'No account registered with this email address. Please register an account first.',
      })
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    if (getIsMongoConnected()) {
      await Otp.deleteMany({ email: cleanEmail })
      await Otp.create({ email: cleanEmail, otp, expiresAt })
    } else {
      const otps = fallbackStore.getOtps().filter((o) => o.email !== cleanEmail)
      otps.push({ email: cleanEmail, otp, expiresAt: expiresAt.toISOString() })
      fallbackStore.saveOtps(otps)
    }

    // Attempt real email delivery via Nodemailer if SMTP configured
    const gmailUser = process.env.GMAIL_USER
    const gmailPass = process.env.GMAIL_APP_PASSWORD

    let deliveredViaRealEmail = false
    if (gmailUser && gmailPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: gmailUser, pass: gmailPass },
        })

        await transporter.sendMail({
          from: `"Job Application Tracker" <${gmailUser}>`,
          to: cleanEmail,
          subject: 'Your Password Reset Verification Code (OTP)',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h2 style="color: #4f46e5; margin-bottom: 12px;">Password Reset Verification</h2>
              <p>You requested to reset your password. Use the verification code below:</p>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #059669; padding: 16px 0; font-family: monospace;">
                ${otp}
              </div>
              <p style="color: #64748b; font-size: 12px;">This code will expire in 10 minutes. If you did not request this, you can ignore this email.</p>
            </div>
          `,
        })
        deliveredViaRealEmail = true
      } catch (mailErr) {
        console.warn('SMTP dispatch failed:', mailErr.message)
      }
    }

    console.log(`\n📬 [OTP DISPATCH] Recipient: ${cleanEmail} | 6-Digit Code: ${otp}\n`)

    return res.json({
      success: true,
      deliveredViaRealEmail,
      email: cleanEmail,
      otp: deliveredViaRealEmail ? undefined : otp, // Provide in dev response if no SMTP configured
      message: deliveredViaRealEmail
        ? `Verification code dispatched to ${cleanEmail}. Please check your inbox.`
        : `Verification code generated for ${cleanEmail}.`,
    })
  } catch (err) {
    console.error('Forgot password error:', err)
    return res.status(500).json({ success: false, error: 'Failed to process password reset request.' })
  }
})

// ── VERIFY OTP ─────────────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and OTP code are required.' })
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanOtp = otp.toString().trim()

    let record = null
    if (getIsMongoConnected()) {
      record = await Otp.findOne({ email: cleanEmail, otp: cleanOtp })
      if (!record || new Date() > new Date(record.expiresAt)) {
        return res.status(400).json({ success: false, error: 'Invalid or expired verification code.' })
      }
    } else {
      const otps = fallbackStore.getOtps()
      record = otps.find((o) => o.email === cleanEmail && o.otp === cleanOtp)
      if (!record || new Date() > new Date(record.expiresAt)) {
        return res.status(400).json({ success: false, error: 'Invalid or expired verification code.' })
      }
    }

    return res.json({ success: true, message: 'Code verified successfully.' })
  } catch (err) {
    console.error('Verify OTP error:', err)
    return res.status(500).json({ success: false, error: 'Failed to verify code.' })
  }
})

// ── RESET PASSWORD (with bcrypt hashing) ───────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, error: 'Email, OTP, and new password are required.' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters.' })
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanOtp = otp.toString().trim()

    // Validate OTP
    if (getIsMongoConnected()) {
      const record = await Otp.findOne({ email: cleanEmail, otp: cleanOtp })
      if (!record || new Date() > new Date(record.expiresAt)) {
        return res.status(400).json({ success: false, error: 'Invalid or expired verification code.' })
      }
      await Otp.deleteMany({ email: cleanEmail })
    } else {
      const otps = fallbackStore.getOtps()
      const record = otps.find((o) => o.email === cleanEmail && o.otp === cleanOtp)
      if (!record || new Date() > new Date(record.expiresAt)) {
        return res.status(400).json({ success: false, error: 'Invalid or expired verification code.' })
      }
      fallbackStore.saveOtps(otps.filter((o) => o.email !== cleanEmail))
    }

    // Hash new password with bcrypt
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    if (getIsMongoConnected()) {
      await User.updateOne({ email: cleanEmail }, { $set: { password: hashedPassword } })
    } else {
      const users = fallbackStore.getUsers()
      const user = users.find((u) => u.email.toLowerCase() === cleanEmail)
      if (user) {
        user.password = hashedPassword
        fallbackStore.saveUsers(users)
      }
    }

    return res.json({ success: true, message: 'Password has been reset successfully.' })
  } catch (err) {
    console.error('Reset password error:', err)
    return res.status(500).json({ success: false, error: 'Failed to reset password.' })
  }
})

export default router
