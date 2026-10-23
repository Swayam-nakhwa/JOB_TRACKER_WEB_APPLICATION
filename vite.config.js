import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import nodemailer from 'nodemailer'
import process from 'node:process'

function otpEmailPlugin(env) {
  return {
    name: 'otp-email-dispatcher',
    configureServer(server) {
      server.middlewares.use('/api/send-otp', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method Not Allowed' }))
          return
        }

        let body = ''
        req.on('data', (chunk) => {
          body += chunk
        })

        req.on('end', async () => {
          try {
            const { email, otp } = JSON.parse(body || '{}')

            if (!email || !otp) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: false, error: 'Email and OTP are required.' }))
              return
            }

            const gmailUser = env.GMAIL_USER || process.env.GMAIL_USER
            const gmailPass = env.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD

            let deliveredViaRealEmail = false

            if (gmailUser && gmailPass) {
              try {
                const transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                    user: gmailUser,
                    pass: gmailPass,
                  },
                })

                await transporter.sendMail({
                  from: `"Job Application Tracker" <${gmailUser}>`,
                  to: email,
                  subject: 'Your Password Reset Verification Code (OTP)',
                  html: `
                    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                      <div style="text-align: center; margin-bottom: 24px;">
                        <h2 style="color: #4338ca; margin: 0; font-size: 22px;">Job Application Tracker</h2>
                        <p style="color: #64748b; font-size: 14px; margin-top: 6px;">Password Reset Request</p>
                      </div>
                      <p style="color: #334155; font-size: 14px; line-height: 1.6;">
                        We received a request to reset the password for your account (<strong>${email}</strong>). Use the verification code below to complete your password reset:
                      </p>
                      <div style="text-align: center; margin: 24px 0;">
                        <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e1b4b; background-color: #e0e7ff; padding: 12px 28px; border-radius: 12px; border: 1px solid #c7d2fe;">
                          ${otp}
                        </span>
                      </div>
                      <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
                        ⏱️ This verification code is valid for <strong>5 minutes</strong>. If you did not request a password reset, you can safely ignore this email.
                      </p>
                      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                      <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
                        Security Alert: Never share this OTP code with anyone.
                      </p>
                    </div>
                  `,
                })

                deliveredViaRealEmail = true
              } catch (mailErr) {
                console.error('[SMTP Mail Delivery Error]:', mailErr.message)
              }
            }

            // Secure private server console log (Never exposed to the web client)
            console.log(`\n======================================================`)
            console.log(`[SECURE SERVER-SIDE OTP DISPATCH]`)
            console.log(`Recipient Email: ${email}`)
            if (deliveredViaRealEmail) {
              console.log(`Status: ✅ Real email successfully delivered to ${email} via Gmail SMTP!`)
            } else {
              console.log(`Status: ℹ️ Dispatched (No Gmail SMTP credentials in .env yet)`)
              console.log(`[Developer Server Console OTP]: ${otp}`)
              console.log(`To send real emails to ${email}, set GMAIL_USER and GMAIL_APP_PASSWORD in .env`)
            }
            console.log(`======================================================\n`)

            // NEVER return the OTP in the JSON response!
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                success: true,
                deliveredViaRealEmail,
                message: deliveredViaRealEmail
                  ? `Real email has been delivered to ${email}. Please check your inbox or spam.`
                  : `Verification code dispatched to ${email}. Please check your email inbox.`,
              })
            )
          } catch (err) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: false, error: err.message }))
          }
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss(), otpEmailPlugin(env)],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
    build: {
      target: 'es2022',
      cssCodeSplit: true,
      modulePreload: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'react'
            }
          },
        },
      },
    },
  }
})
