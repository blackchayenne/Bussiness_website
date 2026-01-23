import Head from 'next/head'
import Link from 'next/link'

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | MarbleSource</title>
        <meta name="description" content="Privacy policy for MarbleSource natural stone export and supply." />
      </Head>

      <section className="pt-32 pb-20 bg-marble-cream">
        <div className="container-narrow">
          <h1 className="font-display text-display-sm md:text-display text-stone-900">
            Privacy Policy
          </h1>
          <p className="mt-4 text-stone-500">
            Last updated: January 2025
          </p>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-narrow prose prose-stone max-w-none">
          <h2>Information We Collect</h2>
          <p>
            When you submit an inquiry through our contact form, we collect the following information:
          </p>
          <ul>
            <li>Name and company name</li>
            <li>Email address and phone number</li>
            <li>Country/region</li>
            <li>Project details and requirements</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>
            We use the information you provide to:
          </p>
          <ul>
            <li>Respond to your inquiry</li>
            <li>Provide quotes and product information</li>
            <li>Communicate about your orders and projects</li>
            <li>Send relevant updates about our products and services (with your consent)</li>
          </ul>

          <h2>Data Protection</h2>
          <p>
            We implement appropriate security measures to protect your personal information.
            We do not sell, trade, or transfer your information to third parties without your consent,
            except as necessary to fulfill your requests (e.g., shipping companies, payment processors).
          </p>

          <h2>Cookies</h2>
          <p>
            Our website uses essential cookies to ensure proper functionality. We may also use
            analytics cookies to understand how visitors interact with our site.
          </p>

          <h2>Your Rights</h2>
          <p>
            You have the right to:
          </p>
          <ul>
            <li>Request access to your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt out of marketing communications</li>
          </ul>

          <h2>Contact Us</h2>
          <p>
            For privacy-related inquiries, please contact us at{' '}
            <a href="mailto:export@marblesource.com">export@marblesource.com</a>.
          </p>

          <div className="mt-12 pt-8 border-t border-stone-200">
            <Link href="/" className="text-stone-600 hover:text-stone-900 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
