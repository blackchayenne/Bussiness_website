import Head from 'next/head'
import Script from 'next/script'
import { siteName, siteUrl, ogImage } from '@/lib/seo'

export default function Instagram() {
  const handleFrameLoad = (event) => {
    if (typeof window !== 'undefined' && typeof window.iFrameSetup === 'function') {
      window.iFrameSetup(event.currentTarget)
    }
  }

  return (
    <>
      <Head>
        <title>Instagram | Marble Professionals</title>
        <meta
          name="description"
          content="Recent Instagram posts from Marble Professionals."
        />
        <link rel="canonical" href={`${siteUrl}/instagram`} />
        <meta property="og:title" content="Instagram | Marble Professionals" />
        <meta
          property="og:description"
          content="Recent Instagram posts from Marble Professionals."
        />
        <meta property="og:url" content={`${siteUrl}/instagram`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Instagram | Marble Professionals" />
        <meta
          name="twitter:description"
          content="Recent Instagram posts from Marble Professionals."
        />
        <meta name="twitter:image" content={ogImage} />
      </Head>

      <section className="pt-32 pb-16 bg-gradient-to-b from-marble-cream to-white">
        <div className="container-wide">
          <div className="max-w-3xl">
            <p className="text-sm font-medium tracking-widest uppercase text-stone-500 mb-4">
              Instagram
            </p>
            <h1 className="font-display text-display-sm md:text-display text-stone-900">
              Recent loadings
            </h1>
            <p className="mt-6 text-lg text-stone-600 leading-relaxed">
              Follow our latest shipments, quarry updates, and completed projects.
            </p>
          </div>
        </div>
      </section>

      <section className="py-10 bg-white">
        <div className="container-wide">
          <div className="bg-stone-50 border border-stone-100 overflow-hidden">
            <iframe
              title="Marble Professionals Instagram feed"
              src="https://app.mirror-app.com/feed-instagram/693da5f9-e90e-4e61-a841-b18af3c5b798/preview"
              style={{ width: '100%', border: 'none', overflow: 'hidden' }}
              scrolling="no"
              onLoad={handleFrameLoad}
            />
          </div>
        </div>
      </section>

      <Script
        src="https://cdn.jsdelivr.net/npm/@mirrorapp/iframe-bridge@latest/dist/index.umd.js"
        strategy="afterInteractive"
      />
    </>
  )
}
