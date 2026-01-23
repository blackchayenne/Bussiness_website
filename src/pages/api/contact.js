import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || '')

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
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
    } = req.body

    if (!name || !company || !email || !country || !message) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const fromEmail =
      process.env.RESEND_FROM_EMAIL ||
      process.env.RESEND_EMAIL ||
      'Marble Professionals <onboarding@resend.dev>'
    const safeMessage = String(message).replace(/\r?\n/g, '<br/>')

    await resend.emails.send({
      from: fromEmail,
      to: salesEmail,
      reply_to: email,
      subject: `New Inquiry - ${company} (${country})`,
      html: `
        <h2>New Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || '-'}</p>
        <p><strong>Country:</strong> ${country}</p>
        <p><strong>Project Type:</strong> ${projectType || '-'}</p>
        <p><strong>Volume:</strong> ${volume || '-'}</p>
        <p><strong>Materials:</strong> ${materials || '-'}</p>
        <p><strong>Message:</strong><br/>${safeMessage}</p>
      `,
    })

    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'We received your inquiry',
      html: `
        <p>Hi ${name},</p>
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
