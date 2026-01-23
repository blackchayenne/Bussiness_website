import { useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import SectionHeader from '@/components/ui/SectionHeader'
import { ArrowRight, ArrowUpRight, Check } from '@/components/ui/Icons'
import { productCategories } from '@/data/products'
import { siteName, siteUrl, ogImage } from '@/lib/seo'

export default function Products() {
  const [lightboxImage, setLightboxImage] = useState(null)
  const [loadedImages, setLoadedImages] = useState({})
  const [failedImages, setFailedImages] = useState({})
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: `${siteUrl}/products`,
      },
    ],
  }

  const productListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: productCategories.map((category, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: category.name,
      url: `${siteUrl}/products#${category.id}`,
    })),
  }

  return (
    <>
      <Head>
        <title>Products | Natural Stone Materials | Marble Professionals</title>
        <meta
          name="description"
          content="Browse our selection of premium marble, granite, travertine, and limestone. Direct quarry sourcing with consistent quality for international projects."
        />
        <link rel="canonical" href={`${siteUrl}/products`} />
        <meta property="og:title" content="Products | Natural Stone Materials | Marble Professionals" />
        <meta
          property="og:description"
          content="Browse our selection of premium marble, granite, travertine, and limestone. Direct quarry sourcing with consistent quality for international projects."
        />
        <meta property="og:url" content={`${siteUrl}/products`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Products | Natural Stone Materials | Marble Professionals" />
        <meta
          name="twitter:description"
          content="Browse our selection of premium marble, granite, travertine, and limestone. Direct quarry sourcing with consistent quality for international projects."
        />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productListSchema) }}
        />
      </Head>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-white hover:text-stone-300 transition-colors z-10"
            onClick={() => setLightboxImage(null)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={lightboxImage.src}
            alt={lightboxImage.name}
            className="max-w-full max-h-[85vh] object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onError={() => setLightboxImage(null)}
          />
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-lg font-medium bg-black/50 px-4 py-2 rounded">
            {lightboxImage.name}
          </p>
        </div>
      )}

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-marble-cream to-white">
        <div className="container-wide">
          <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-12 items-center">
            <div className="max-w-3xl">
              <p className="text-sm font-medium tracking-widest uppercase text-stone-500 mb-4">
                Our Materials
              </p>
              <h1 className="font-display text-display-sm md:text-display text-stone-900">
                Premium natural stone for every application
              </h1>
              <p className="mt-6 text-lg text-stone-600 leading-relaxed">
                We supply a comprehensive range of natural stone materials sourced from established
                quarries worldwide. Each material is selected for quality, consistency, and
                availability in commercial quantities.
              </p>

              {/* Quick Nav */}
              <div className="mt-12 flex flex-wrap gap-3">
                {productCategories.map((category) => (
                  <a
                    key={category.id}
                    href={`#${category.id}`}
                    className="px-5 py-2.5 text-sm font-medium bg-white border border-stone-200 text-stone-700 hover:border-stone-400 hover:text-stone-900 transition-colors"
                  >
                    {category.name}
                  </a>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] bg-stone-100 overflow-hidden">
                <Image
                  src="/images/quarry.jpeg"
                  alt="Marble quarry with stone blocks"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      {productCategories.map((category, categoryIndex) => (
        <section
          key={category.id}
          id={category.id}
          className={`section-padding ${categoryIndex % 2 === 0 ? 'bg-white' : 'bg-marble-cream'}`}
        >
          <div className="container-wide">
            {/* Category Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
              <div className="max-w-2xl">
                <span className="text-xs font-medium tracking-widest uppercase text-stone-400">
                  0{categoryIndex + 1}
                </span>
                <h2 className="mt-4 font-display text-display-sm text-stone-900">
                  {category.name}
                </h2>
                <p className="mt-4 text-stone-600 leading-relaxed">
                  {category.description}
                </p>
              </div>
            </div>

            {/* Subcategories */}
            {category.subcategories.map((subcategory) => (
              <div key={subcategory.id} className="mb-16 last:mb-0">
                {/* Subcategory Header */}
                <h3 className="text-xl font-display font-medium text-stone-800 mb-8 pb-4 border-b border-stone-200">
                  {subcategory.name}
                </h3>

                {/* Products Grid */}
                {subcategory.products.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {subcategory.products.map((product) => (
                      <div key={product.id} className="group">
                        {/* Product Image */}
                        <div
                          className={`aspect-[4/3] bg-gradient-to-br from-stone-100 to-stone-200 relative overflow-hidden mb-6 ${loadedImages[product.id] ? 'cursor-pointer' : ''}`}
                          onClick={() => loadedImages[product.id] && setLightboxImage({ src: product.image, name: product.name })}
                        >
                          {/* Placeholder background - always visible as fallback */}
                          <div className="absolute inset-0 bg-gradient-to-br from-stone-200 via-marble-warm to-stone-100 opacity-80" />
                          <div
                            className="absolute inset-0 opacity-5"
                            style={{
                              backgroundImage: 'radial-gradient(circle at 50% 50%, #000 1px, transparent 1px)',
                              backgroundSize: '8px 8px',
                            }}
                          />

                          {/* Actual image - hidden until loaded */}
                          {product.image && !failedImages[product.id] && (
                            <img
                              src={product.image}
                              alt={product.name}
                              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${loadedImages[product.id] ? 'opacity-100' : 'opacity-0'}`}
                              loading="lazy"
                              decoding="async"
                              onLoad={() => setLoadedImages(prev => ({ ...prev, [product.id]: true }))}
                              onError={() => setFailedImages(prev => ({ ...prev, [product.id]: true }))}
                            />
                          )}

                          {/* View Details Overlay */}
                          <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors duration-300 flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium text-white bg-stone-900/80 px-4 py-2">
                              {loadedImages[product.id] ? 'Click to Enlarge' : 'Request Samples'}
                            </span>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div>
                          <h4 className="text-lg font-medium text-stone-900">
                            {product.name}
                          </h4>
                          <p className="mt-1 text-sm text-stone-500">
                            Origin: {product.origin}
                          </p>

                          <div className="mt-4 space-y-2">
                            <div>
                              <span className="text-xs font-medium tracking-wider uppercase text-stone-400">
                                Applications
                              </span>
                              <p className="mt-1 text-sm text-stone-600">
                                {product.applications}
                              </p>
                            </div>

                            <div>
                              <span className="text-xs font-medium tracking-wider uppercase text-stone-400">
                                Finishes Available
                              </span>
                              <div className="mt-1 flex flex-wrap gap-2">
                                {product.finishes.map((finish) => (
                                  <span
                                    key={finish}
                                    className="text-xs px-2 py-1 bg-stone-100 text-stone-600"
                                  >
                                    {finish}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <Link
                            href={`/contact?product=${encodeURIComponent(product.name)}`}
                            className="mt-6 inline-flex items-center text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors"
                          >
                            Inquire about this material
                            <ArrowUpRight className="ml-2 w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center bg-stone-50 border border-dashed border-stone-200">
                    <p className="text-stone-500">
                      Products coming soon. Contact us for availability.
                    </p>
                    <Link
                      href="/contact"
                      className="mt-4 inline-flex items-center text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors"
                    >
                      Inquire about {subcategory.name}
                      <ArrowUpRight className="ml-2 w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Specifications Note */}
      <section className="section-padding bg-stone-900">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionHeader
                label="Specifications"
                title="Custom dimensions & finishes"
                description="We work with processing facilities that can accommodate custom specifications. Whether you need specific dimensions, unique finishes, or particular edge profiles, we can source accordingly."
                dark
              />

              <ul className="mt-10 space-y-4">
                {[
                  'Custom slab and tile dimensions',
                  'Multiple finish options per material',
                  'Bookmatching and vein-matching available',
                  'Technical data sheets provided',
                  'Sample program for specification',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-stone-400 flex-shrink-0 mt-0.5" />
                    <span className="text-stone-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-stone-700 to-stone-800 rounded-sm overflow-hidden">
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: 'linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%), linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%)',
                    backgroundSize: '40px 40px',
                    backgroundPosition: '0 0, 20px 20px',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-marble-cream">
        <div className="container-narrow text-center">
          <h2 className="font-display text-display-sm md:text-display text-stone-900">
            Need something specific?
          </h2>
          <p className="mt-6 text-lg text-stone-600 max-w-2xl mx-auto">
            If you don't see the exact material you're looking for, contact us.
            We can source specific materials from our network of quarries and suppliers.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/contact" className="btn-primary">
              Request a Quote
              <ArrowRight className="ml-3 w-4 h-4" />
            </Link>
            <Link href="/services#sourcing" className="btn-secondary">
              Learn About Sourcing
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
