/**
 * Contact Form API Handler
 *
 * This is a placeholder API route for handling contact form submissions.
 * In production, you would integrate this with:
 * - An email service (SendGrid, AWS SES, Resend, etc.)
 * - A CRM system
 * - A database for lead tracking
 *
 * For now, it validates the input and simulates a successful submission.
 */

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

    // Basic validation
    if (!name || !company || !email || !country || !message) {
      return res.status(400).json({
        message: 'Missing required fields'
      })
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Invalid email format'
      })
    }

    // In production, you would:
    // 1. Send notification email to sales team
    // 2. Send confirmation email to the inquirer
    // 3. Store the lead in a database/CRM

    // Example with a generic email service (pseudo-code):
    /*
    await sendEmail({
      to: process.env.SALES_EMAIL,
      subject: `New Inquiry from ${company} - ${country}`,
      template: 'new-inquiry',
      data: {
        name,
        company,
        email,
        phone,
        country,
        projectType,
        volume,
        materials,
        message,
        timestamp: new Date().toISOString(),
      }
    })

    await sendEmail({
      to: email,
      subject: 'Thank you for your inquiry - MarbleSource',
      template: 'inquiry-confirmation',
      data: { name }
    })
    */

    // Log the inquiry (in production, store in database)
    console.log('New inquiry received:', {
      name,
      company,
      email,
      phone: phone || 'Not provided',
      country,
      projectType: projectType || 'Not specified',
      volume: volume || 'Not specified',
      materials: materials || 'Not specified',
      message,
      timestamp: new Date().toISOString(),
    })

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500))

    return res.status(200).json({
      success: true,
      message: 'Inquiry submitted successfully'
    })

  } catch (error) {
    console.error('Contact form error:', error)
    return res.status(500).json({
      message: 'Internal server error'
    })
  }
}
