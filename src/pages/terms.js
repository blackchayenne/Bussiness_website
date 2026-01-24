import Head from 'next/head'
import Link from 'next/link'
import { siteName, siteUrl, ogImage } from '@/lib/seo'

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Service | Marble Professionals</title>
        <meta name="description" content="Terms of service for Marble Professionals natural stone export and supply." />
        <link rel="canonical" href={`${siteUrl}/terms`} />
        <meta property="og:title" content="Terms of Service | Marble Professionals" />
        <meta
          property="og:description"
          content="Terms of service for Marble Professionals natural stone export and supply."
        />
        <meta property="og:url" content={`${siteUrl}/terms`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Terms of Service | Marble Professionals" />
        <meta
          name="twitter:description"
          content="Terms of service for Marble Professionals natural stone export and supply."
        />
        <meta name="twitter:image" content={ogImage} />
      </Head>

      <section className="pt-32 pb-20 bg-marble-cream">
        <div className="container-narrow">
          <h1 className="font-display text-display-sm md:text-display text-stone-900">
            Terms of Service
          </h1>
          <p className="mt-4 text-stone-500">
            Last updated: January 2025
          </p>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-narrow prose prose-stone max-w-none">
          <h2>Website Use</h2>
          <p>
            This website is provided for informational purposes about our products and services.
            By using this website, you agree to these terms.
          </p>

          <h2>Product Information</h2>
          <p>
            Product images, descriptions, and specifications on this website are for reference only.
            Natural stone is a natural product with inherent variations in color, veining, and pattern.
            Actual products may vary from images shown. Physical samples should be requested for
            accurate assessment.
          </p>

          <h2>Pricing</h2>
          <p>
            Prices are not listed on this website due to market fluctuations and order-specific factors.
            All pricing is provided upon inquiry and is valid for the period stated in the quotation.
          </p>

          <h2>Orders and Agreements</h2>
          <p>
            Orders are governed by our separate sales agreements, which include detailed terms
            regarding payment, delivery, quality specifications, and dispute resolution.
            Website content does not constitute a binding offer.
          </p>

          <h2>Intellectual Property</h2>
          <p>
            All content on this website, including text, images, and design, is the property of
            MarbleSource and may not be reproduced without permission.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            We make reasonable efforts to ensure the accuracy of information on this website but
            do not warrant that it is error-free. We are not liable for any damages arising from
            the use of this website.
          </p>

          <h2>Governing Law</h2>
          <p>
            These terms are governed by the laws of the Republic of Turkey. Any disputes shall
            be resolved in the courts of Istanbul.
          </p>

          <h2>Contact</h2>
          <p>
            For questions about these terms, please contact us at{' '}
            <a href="mailto:export@marblesource.com">export@marblesource.com</a>.
          </p>

          <div className="mt-12 pt-8 border-t border-stone-200">
            <Link href="/" className="text-stone-600 hover:text-stone-900 transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
