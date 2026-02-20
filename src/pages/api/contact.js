import { Resend } from 'resend'
import { checkRateLimit, getClientId, RATE_LIMITS, getRateLimitHeaders } from '@/lib/utils/rate-limit'

const resend = new Resend(process.env.RESEND_API_KEY || '')
const MIN_FORM_FILL_TIME_MS = 3000
const MAX_FORM_FILL_TIME_MS = 2 * 60 * 60 * 1000
const MAX_URL_OCCURRENCES = 2

function normalize(value) {
  return String(value || '').trim()
}

function countUrls(text) {
  return (text.match(/https?:\/\/|www\./gi) || []).length
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const clientId = getClientId(req)
    const limitResult = checkRateLimit(`contact:${clientId}`, RATE_LIMITS.contact)
    const rateHeaders = getRateLimitHeaders(limitResult)
    Object.entries(rateHeaders).forEach(([key, value]) => res.setHeader(key, value))

    if (!limitResult.allowed) {
      return res.status(429).json({ message: 'Too many requests. Please try later.' })
    }

    const salesEmail = process.env.SALES_EMAIL
    if (!process.env.RESEND_API_KEY || !salesEmail) {
      return res.status(500).json({ message: 'Server email is not configured' })
    }

    const {
      name,
      company,
      email,
      phone,
      country,
      projectType,
      volume,
      materials,
      message,
      website, // Honeypot: must stay empty for real users
      startedAt,
    } = req.body

    const safeName = normalize(name)
    const safeCompany = normalize(company)
    const safeEmail = normalize(email).toLowerCase()
    const safeCountry = normalize(country)
    const safeMessagePlain = normalize(message)
    const safeWebsite = normalize(website)

    if (!safeName || !safeCompany || !safeEmail || !safeCountry || !safeMessagePlain) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    if (safeWebsite) {
      return res.status(400).json({ message: 'Invalid submission' })
    }

    const startedAtMs = Number(startedAt)
    if (!Number.isFinite(startedAtMs)) {
      return res.status(400).json({ message: 'Invalid submission metadata' })
    }

    const elapsed = Date.now() - startedAtMs
    if (elapsed < MIN_FORM_FILL_TIME_MS || elapsed > MAX_FORM_FILL_TIME_MS) {
      return res.status(400).json({ message: 'Suspicious submission timing' })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeEmail)) {
      return res.status(400).json({ message: 'Invalid email address' })
    }

    if (safeMessagePlain.length < 20 || safeMessagePlain.length > 4000) {
      return res.status(400).json({ message: 'Message must be between 20 and 4000 characters' })
    }

    if (countUrls(safeMessagePlain) > MAX_URL_OCCURRENCES) {
      return res.status(400).json({ message: 'Too many links in message' })
    }

    const fromEmail =
      process.env.RESEND_FROM_EMAIL ||
      process.env.RESEND_EMAIL ||
      'Marble Professionals <onboarding@resend.dev>'
    const safeMessage = safeMessagePlain.replace(/\r?\n/g, '<br/>')

    await resend.emails.send({
      from: fromEmail,
      to: salesEmail,
      reply_to: safeEmail,
      subject: `New Inquiry - ${safeCompany} (${safeCountry})`,
      html: `
        <h2>New Inquiry</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Company:</strong> ${safeCompany}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Phone:</strong> ${phone || '-'}</p>
        <p><strong>Country:</strong> ${safeCountry}</p>
        <p><strong>Project Type:</strong> ${projectType || '-'}</p>
        <p><strong>Volume:</strong> ${volume || '-'}</p>
        <p><strong>Materials:</strong> ${materials || '-'}</p>
        <p><strong>Message:</strong><br/>${safeMessage}</p>
      `,
    })

    await resend.emails.send({
      from: fromEmail,
      to: safeEmail,
      subject: 'We received your inquiry',
      html: `
        <p>Hi ${safeName},</p>
        <p>Thanks for reaching out to Marble Professionals. We have received your inquiry and will respond within 24 hours on business days.</p>
        <p><strong>Your message:</strong><br/>${safeMessage}</p>
        <p>Best regards,<br/>Marble Professionals</p>
      `,
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
