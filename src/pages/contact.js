import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import SectionHeader from '@/components/ui/SectionHeader'
import { ArrowRight, Mail, Phone, MapPin, Check } from '@/components/ui/Icons'
import { siteName, siteUrl, ogImage } from '@/lib/seo'

const projectTypes = [
  'Residential Development',
  'Commercial Project',
  'Hospitality',
  'Infrastructure',
  'Import / Distribution',
  'Other',
]

const volumeRanges = [
  '1-5 containers',
  '5-20 containers',
  '20-50 containers',
  '50+ containers',
  'Ongoing supply contract',
]

const faqItems = [
  {
    q: 'Do you provide samples?',
    a: 'Yes, we provide physical samples for approved inquiries. Sample costs vary by material and are typically credited against orders.',
  },
  {
    q: 'What are your payment terms?',
    a: 'Standard terms are 30% deposit with order confirmation, 70% before shipment. Letters of Credit accepted for established clients.',
  },
  {
    q: 'How long is the typical lead time?',
    a: 'Standard orders take 3-6 weeks from confirmation, depending on material and processing requirements. We provide specific timelines with every quote.',
  },
  {
    q: 'Do you handle shipping?',
    a: 'We offer both FOB and CIF terms. Our logistics team coordinates container booking, documentation, and tracking for CIF orders.',
  },
  {
    q: 'Can you source materials not listed on your site?',
    a: "Yes, our sourcing network extends beyond what's listed. If you have a specific material in mind, let us know and we'll check availability.",
  },
  {
    q: 'How can I reach you quickly?',
    a: 'The fastest way to reach us is via WhatsApp at +90 532 406 99 97. We typically respond within a few hours during business days.',
  },
]

export default function Contact() {
  const router = useRouter()
  const [formState, setFormState] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    country: '',
    projectType: '',
    volume: '',
    materials: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }

  // Pre-fill from URL params
  useEffect(() => {
    const { product, service } = router.query
    if (product) {
      setFormState(prev => ({
        ...prev,
        materials: product,
        message: `I'm interested in ${product}. `
      }))
    }
    if (service) {
      setFormState(prev => ({
        ...prev,
        message: `I'm interested in your ${service} service. `
      }))
    }
  }, [router.query])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormState(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      })

      if (!response.ok) throw new Error('Submission failed')

      setIsSubmitted(true)
    } catch (err) {
      setError('There was an error submitting your inquiry. Please try again or email us directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Head>
        <title>Contact Us | Request a Quote | Marble Professionals</title>
        <meta
          name="description"
          content="Get in touch for stone sourcing inquiries, project quotes, and partnership discussions. We respond within 24 hours."
        />
        <link rel="canonical" href={`${siteUrl}/contact`} />
        <meta property="og:title" content="Contact Us | Request a Quote | Marble Professionals" />
        <meta
          property="og:description"
          content="Get in touch for stone sourcing inquiries, project quotes, and partnership discussions. We respond within 24 hours."
        />
        <meta property="og:url" content={`${siteUrl}/contact`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contact Us | Request a Quote | Marble Professionals" />
        <meta
          name="twitter:description"
          content="Get in touch for stone sourcing inquiries, project quotes, and partnership discussions. We respond within 24 hours."
        />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </Head>

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-marble-cream to-white">
        <div className="container-wide">
          <div className="max-w-3xl">
            <p className="text-sm font-medium tracking-widest uppercase text-stone-500 mb-4">
              Contact Us
            </p>
            <h1 className="font-display text-display-sm md:text-display text-stone-900">
              Let's discuss your project
            </h1>
            <p className="mt-6 text-lg text-stone-600 leading-relaxed">
              Tell us about your requirements and we'll get back to you with relevant information.
              No sales pressure—just straightforward answers to your questions.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <div className="grid lg:grid-cols-3 gap-16">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <h2 className="text-xs font-medium tracking-widest uppercase text-stone-500 mb-8">
                Contact Information
              </h2>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-stone-600" />
                  </div>
                  <div>
                    <p className="text-sm text-stone-500 mb-1">Phone & WhatsApp</p>
                    <a
                      href="tel:+905324069997"
                      className="text-stone-900 hover:text-stone-600 transition-colors block"
                    >
                      +90 532 406 99 97
                    </a>
                    <a
                      href="tel:+16452436766"
                      className="text-stone-900 hover:text-stone-600 transition-colors block mt-1"
                    >
                      +1 645 243 67 66
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-stone-600" />
                  </div>
                  <div>
                    <p className="text-sm text-stone-500 mb-1">Head Office - Denizli</p>
                    <address className="not-italic text-stone-900">
                      Altintop mah. Mimar Sinan cd.<br />
                      Bayram apt. No:19/3<br />
                      Merkezefendi/Denizli, Turkey
                    </address>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-stone-600" />
                  </div>
                  <div>
                    <p className="text-sm text-stone-500 mb-1">Izmir Branch</p>
                    <address className="not-italic text-stone-900">
                      Villakent mah. Sahin cd.<br />
                      No:97/1 Menemen/Izmir, Turkey
                    </address>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-6 bg-stone-50">
                <h3 className="text-sm font-medium text-stone-900 mb-3">
                  Response Time
                </h3>
                <p className="text-sm text-stone-600">
                  We respond to all inquiries within 24 hours during business days.
                  For urgent matters, please call or WhatsApp.
                </p>
              </div>

              <div className="mt-6 p-6 bg-stone-50">
                <h3 className="text-sm font-medium text-stone-900 mb-3">
                  What to Include
                </h3>
                <ul className="text-sm text-stone-600 space-y-2">
                  <li>• Material type and specifications</li>
                  <li>• Estimated quantities</li>
                  <li>• Delivery location</li>
                  <li>• Project timeline</li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              {isSubmitted ? (
                <div className="bg-stone-50 p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-stone-900 flex items-center justify-center mx-auto mb-6">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-display font-medium text-stone-900">
                    Thank you for your inquiry
                  </h2>
                  <p className="mt-4 text-stone-600 max-w-md mx-auto">
                    We've received your message and will respond within 24 hours.
                    Check your email for a confirmation.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false)
                      setFormState({
                        name: '',
                        company: '',
                        email: '',
                        phone: '',
                        country: '',
                        projectType: '',
                        volume: '',
                        materials: '',
                        message: '',
                      })
                    }}
                    className="mt-8 btn-secondary"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="label-text">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formState.name}
                        onChange={handleChange}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className="label-text">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        required
                        value={formState.company}
                        onChange={handleChange}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="email" className="label-text">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formState.email}
                        onChange={handleChange}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="label-text">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formState.phone}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Include country code"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="country" className="label-text">
                      Country / Region *
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      required
                      value={formState.country}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="projectType" className="label-text">
                        Project Type
                      </label>
                      <select
                        id="projectType"
                        name="projectType"
                        value={formState.projectType}
                        onChange={handleChange}
                        className="input-field"
                      >
                        <option value="">Select...</option>
                        {projectTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="volume" className="label-text">
                        Estimated Volume
                      </label>
                      <select
                        id="volume"
                        name="volume"
                        value={formState.volume}
                        onChange={handleChange}
                        className="input-field"
                      >
                        <option value="">Select...</option>
                        {volumeRanges.map((range) => (
                          <option key={range} value={range}>{range}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="materials" className="label-text">
                      Materials of Interest
                    </label>
                    <input
                      type="text"
                      id="materials"
                      name="materials"
                      value={formState.materials}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="e.g., White marble, Travertine tiles"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="label-text">
                      Project Details / Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formState.message}
                      onChange={handleChange}
                      className="input-field resize-none"
                      placeholder="Tell us about your project, specifications needed, timeline, etc."
                    />
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-stone-500">
                      * Required fields
                    </p>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                      {!isSubmitting && <ArrowRight className="ml-3 w-4 h-4" />}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-marble-cream">
        <div className="container-wide">
          <SectionHeader
            label="Common Questions"
            title="Before you reach out"
          />

          <div className="mt-12 grid md:grid-cols-2 gap-8">
            {faqItems.map((faq) => (
              <div key={faq.q} className="bg-white p-6">
                <h3 className="font-medium text-stone-900">{faq.q}</h3>
                <p className="mt-3 text-sm text-stone-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
