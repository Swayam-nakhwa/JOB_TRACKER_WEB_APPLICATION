import emailjs from '@emailjs/browser'

/**
 * Dispatches an OTP to a real email address.
 * 1. Calls the backend /api/send-otp endpoint (which sends real email via Gmail SMTP/Nodemailer).
 * 2. If EmailJS keys are provided in .env, also triggers EmailJS client dispatch.
 */
export async function sendOtpEmail(email, otp) {
  let backendResult = { success: false, deliveredViaRealEmail: false }

  // 1. Dispatch via local backend /api/send-otp
  try {
    const res = await fetch('/api/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    })

    if (res.ok) {
      backendResult = await res.json()
    }
  } catch (err) {
    console.warn('Backend email dispatcher unavailable, falling back:', err)
  }

  // 2. Optional: If EmailJS credentials are configured in .env, send via EmailJS directly
  const emailjsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  const emailjsServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const emailjsTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID

  if (emailjsPublicKey && emailjsServiceId && emailjsTemplateId) {
    try {
      await emailjs.send(
        emailjsServiceId,
        emailjsTemplateId,
        {
          to_email: email,
          otp_code: otp,
          app_name: 'Job Application Tracker',
        },
        emailjsPublicKey
      )
      return {
        success: true,
        deliveredViaRealEmail: true,
        message: `Real email successfully dispatched to ${email} via EmailJS.`,
      }
    } catch (err) {
      console.warn('EmailJS dispatch warning:', err)
    }
  }

  return {
    success: true,
    deliveredViaRealEmail: backendResult.deliveredViaRealEmail || false,
    message: backendResult.message || `Verification code sent to ${email}.`,
  }
}
