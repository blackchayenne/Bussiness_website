import Head from 'next/head'
import Link from 'next/link'
import SectionHeader from '@/components/ui/SectionHeader'
import { ArrowRight, Check, Shield, Globe, Truck, ClipboardCheck } from '@/components/ui/Icons'
import { services } from '@/data/services'
import { siteName, siteUrl, ogImage } from '@/lib/seo'

const serviceIcons = {
  quality: Shield,
  projects: ClipboardCheck,
  sourcing: Globe,
  logistics: Truck,
}

export default function Services() {
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
        name: 'Services',
        item: `${siteUrl}/services`,
      },
    ],
  }

  const serviceListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: services.map((service, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Service',
        name: service.name,
        description: service.tagline,
        url: `${siteUrl}/services#${service.id}`,
      },
    })),
  }

  return (
    <>
      <Head>
        <title>Services | Quality Control, Logistics & Project Management | Marble Professionals</title>
        <meta
          name="description"
          content="Comprehensive stone supply services: quality control, project management, sourcing, and international logistics. End-to-end support for your projects."
        />
        <link rel="canonical" href={`${siteUrl}/services`} />
        <meta property="og:title" content="Services | Quality Control, Logistics & Project Management | Marble Professionals" />
        <meta
          property="og:description"
          content="Comprehensive stone supply services: quality control, project management, sourcing, and international logistics. End-to-end support for your projects."
        />
        <meta property="og:url" content={`${siteUrl}/services`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Services | Quality Control, Logistics & Project Management | Marble Professionals" />
        <meta
          name="twitter:description"
          content="Comprehensive stone supply services: quality control, project management, sourcing, and international logistics. End-to-end support for your projects."
        />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceListSchema) }}
        />
      </Head>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-marble-cream to-white">
        <div className="container-wide">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
            <div className="max-w-3xl">
              <p className="text-sm font-medium tracking-widest uppercase text-stone-500 mb-4">
                Our Services
              </p>
              <h1 className="font-display text-display-sm md:text-display text-stone-900">
                Beyond supply - full project support
              </h1>
              <p className="mt-6 text-lg text-stone-600 leading-relaxed">
                We understand that stone supply is just one part of your project. That's why we offer
                comprehensive services to ensure quality, manage timelines, and handle the
                complexities of international logistics.
              </p>
            </div>
            <div className="lg:justify-self-end">
              <div className="aspect-[4/5] w-full max-w-[360px] overflow-hidden rounded-sm border border-stone-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
                <img
                  src="/images/blue_ageta.jpg"
                  alt="Blue Ageta marble"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Quick Nav */}
          <div className="mt-12 flex flex-wrap gap-3">
            {services.map((service) => (
              <a
                key={service.id}
                href={`#${service.id}`}
                className="px-5 py-2.5 text-sm font-medium bg-white border border-stone-200 text-stone-700 hover:border-stone-400 hover:text-stone-900 transition-colors"
              >
                {service.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Services Detailed */}
      {services.map((service, index) => {
        const IconComponent = serviceIcons[service.id]
        return (
          <section
            key={service.id}
            id={service.id}
            className={`section-padding ${index % 2 === 0 ? 'bg-white' : 'bg-marble-cream'}`}
          >
            <div className="container-wide">
              <div className="grid lg:grid-cols-2 gap-16 items-start">
                {/* Content */}
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mb-8">
                    <IconComponent className="w-6 h-6 text-stone-600" />
                  </div>

                  <span className="text-xs font-medium tracking-widest uppercase text-stone-400">
                    0{index + 1}
                  </span>
                  <h2 className="mt-4 font-display text-display-sm text-stone-900">
                    {service.name}
                  </h2>
                  <p className="mt-2 text-lg font-medium text-stone-500">
                    {service.tagline}
                  </p>
                  <p className="mt-6 text-stone-600 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features List */}
                  <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-stone-400 flex-shrink-0 mt-0.5" />
                        <span className="text-stone-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/contact?service=${encodeURIComponent(service.name)}`}
                    className="mt-10 btn-primary inline-flex"
                  >
                    Discuss Your Project
                    <ArrowRight className="ml-3 w-4 h-4" />
                  </Link>
                </div>

                {/* Process */}
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <div className="bg-stone-50 p-8 lg:p-10">
                    <h3 className="text-xs font-medium tracking-widest uppercase text-stone-500 mb-8">
                      Our Process
                    </h3>
                    <div className="space-y-8">
                      {service.process.map((step, stepIndex) => (
                        <div key={step.step} className="relative">
                          {stepIndex < service.process.length - 1 && (
                            <div className="absolute left-5 top-12 bottom-0 w-px bg-stone-200" />
                          )}
                          <div className="flex gap-6">
                            <div className="w-10 h-10 rounded-full bg-stone-900 text-white text-sm font-medium flex items-center justify-center flex-shrink-0">
                              {step.step}
                            </div>
                            <div className="pt-1">
                              <h4 className="font-medium text-stone-900">
                                {step.title}
                              </h4>
                              <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )
      })}

      {/* Integration Note */}
      <section className="section-padding bg-stone-900">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-display-sm md:text-display text-white">
              All services work together
            </h2>
            <p className="mt-6 text-lg text-stone-300 leading-relaxed">
              Our services aren't isolated offerings - they're integrated to support your project
              from initial inquiry through final delivery. You get a single point of contact
              who coordinates everything.
            </p>

            <div className="mt-12 grid sm:grid-cols-4 gap-6">
              {services.map((service, index) => {
                const IconComponent = serviceIcons[service.id]
                return (
                  <div key={service.id} className="relative">
                    {index < services.length - 1 && (
                      <div className="hidden sm:block absolute top-6 left-full w-full h-px bg-stone-700" />
                    )}
                    <div className="w-12 h-12 mx-auto rounded-full bg-stone-800 flex items-center justify-center mb-4">
                      <IconComponent className="w-5 h-5 text-stone-400" />
                    </div>
                    <p className="text-sm text-stone-300">{service.name}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-marble-cream">
        <div className="container-narrow text-center">
          <h2 className="font-display text-display-sm md:text-display text-stone-900">
            Let's discuss your project
          </h2>
          <p className="mt-6 text-lg text-stone-600 max-w-2xl mx-auto">
            Whether you need a single service or comprehensive support, we're here to help.
            Tell us about your project and we'll recommend the right approach.
          </p>
          <div className="mt-10">
            <Link href="/contact" className="btn-primary">
              Get in Touch
              <ArrowRight className="ml-3 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
