import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
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

    await resend.emails.send({
      from: 'Marble Professionals <onboarding@resend.dev>',
      to: [process.env.SALES_EMAIL, email], // 👈 KRİTİK
      subject: `New Inquiry – ${company} (${country})`,
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
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
