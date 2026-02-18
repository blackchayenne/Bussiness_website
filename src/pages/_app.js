import '@/styles/globals.css'
import Head from 'next/head'
import Script from 'next/script'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import { siteName, siteUrl } from '@/lib/seo'
import { GA_MEASUREMENT_ID, pageview } from '@/lib/analytics'

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim()

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) {
      return
    }

    const handleRouteChange = (url) => {
      pageview(url)
    }

    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/favicon.svg`,
    email: 'info@marblepros.net',
    telephone: '+90 532 406 99 97',
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        {googleSiteVerification && (
          <meta
            name="google-site-verification"
            content={googleSiteVerification}
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </Head>
      {GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', { page_path: window.location.pathname });
            `}
          </Script>
        </>
      )}
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  )
}
