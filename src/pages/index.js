import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import SectionHeader from '@/components/ui/SectionHeader'
import { ArrowRight, ArrowUpRight, Check, Shield, Globe, Truck, ClipboardCheck } from '@/components/ui/Icons'
import { productCategories } from '@/data/products'
import { services } from '@/data/services'
import { siteName, siteUrl, ogImage } from '@/lib/seo'

const stats = [
  { value: '15+', label: 'Years Experience' },
  { value: '26', label: 'Countries Served' },
  { value: '91', label: 'Projects Completed' },
  { value: '98%', label: 'On-Time Delivery' },
]

const benefits = [
  {
    title: 'Direct Quarry Access',
    description: 'We source directly from established quarries, eliminating middlemen and ensuring competitive pricing.',
  },
  {
    title: 'Consistent Quality',
    description: 'Rigorous inspection at every stage. Every slab photographed and documented before shipping.',
  },
  {
    title: 'Reliable Communication',
    description: 'Dedicated project coordinators who understand international trade and keep you informed.',
  },
  {
    title: 'Transparent Pricing',
    description: 'Clear quotes with no hidden fees. What we quote is what you pay.',
  },
]

const clientTypes = [
  'Importers & Distributors',
  'Construction Companies',
  'Project Developers',
  'Architects & Designers',
  'Hospitality Groups',
  'Government Projects',
]

export default function Home() {
  return (
    <>
      <Head>
        <title>Marble Professionals | Premium Natural Stone Export & Supply</title>
        <meta
          name="description"
          content="International natural stone export and supply. Premium marble, granite, travertine, and limestone for large-scale projects. Direct quarry sourcing with rigorous quality control."
        />
        <meta name="keywords" content="marble export, natural stone supplier, granite wholesale, travertine, limestone, building materials" />
        <link rel="canonical" href={siteUrl} />
        <meta property="og:title" content="Marble Professionals | Premium Natural Stone Export & Supply" />
        <meta
          property="og:description"
          content="International natural stone export and supply. Premium marble, granite, travertine, and limestone for large-scale projects. Direct quarry sourcing with rigorous quality control."
        />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Marble Professionals | Premium Natural Stone Export & Supply" />
        <meta
          name="twitter:description"
          content="International natural stone export and supply. Premium marble, granite, travertine, and limestone for large-scale projects. Direct quarry sourcing with rigorous quality control."
        />
        <meta name="twitter:image" content={ogImage} />
      </Head>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-marble-white via-marble-cream to-marble-warm" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="container-wide relative z-10">
          <div className="max-w-4xl">
            <p className="text-sm font-medium tracking-widest uppercase text-stone-500 mb-6 animate-fade-in">
              Natural Stone Export & Supply
            </p>
            <h1 className="font-display text-display-sm sm:text-display md:text-display-lg text-stone-900 animate-fade-in-up">
              Premium stone for
              <br />
              <span className="text-stone-500">international projects</span>
            </h1>
            <p className="mt-8 text-xl text-stone-600 max-w-2xl leading-relaxed animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              We supply marble, granite, travertine, and limestone to contractors and developers worldwide.
              Direct quarry sourcing, rigorous quality control, and reliable logistics.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <Link href="/contact" className="btn-primary">
                Request a Quote
                <ArrowRight className="ml-3 w-4 h-4" />
              </Link>
              <Link href="/products" className="btn-secondary">
                View Materials
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-stone-300 to-stone-400" />
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-stone-900 py-16">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl md:text-5xl font-display font-semibold text-white">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm tracking-wide text-stone-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionHeader
                label="Who We Work With"
                title="Built for large-scale buyers"
                description="We work exclusively with businesses that require consistent, high-volume natural stone supply. Our clients are professionals who value reliability over the lowest price."
              />

              <div className="mt-10 grid grid-cols-2 gap-4">
                {clientTypes.map((type) => (
                  <div key={type} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-stone-400 flex-shrink-0" />
                    <span className="text-stone-700">{type}</span>
                  </div>
                ))}
              </div>

              <div className="mt-12">
                <Link href="/about" className="btn-text">
                  Learn about our approach
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] bg-stone-100 rounded-sm overflow-hidden relative">
                <Image
                  src="/images/port-shipping.jpg"
                  alt="International shipping port with containers"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              {/* Caption */}
              <p className="mt-4 text-sm text-stone-500">
                International logistics - Reliable delivery to ports worldwide
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding bg-marble-cream">
        <div className="container-wide">
          <SectionHeader
            label="Why Choose Us"
            title="What sets us apart"
            align="center"
          />

          <div className="mt-16 grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div key={benefit.title} className="card">
                <span className="text-xs font-medium tracking-widest text-stone-400">
                  0{index + 1}
                </span>
                <h3 className="mt-4 text-xl font-display font-semibold text-stone-900">
                  {benefit.title}
                </h3>
                <p className="mt-3 text-stone-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Materials Preview */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
            <SectionHeader
              label="Our Materials"
              title="Premium natural stone"
              description="We supply a comprehensive range of natural stone materials, each sourced from established quarries with consistent quality records."
            />
            <Link href="/products" className="btn-text whitespace-nowrap">
              View all materials
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productCategories.map((category) => (
              <Link
                key={category.id}
                href={`/products#${category.id}`}
                className="group"
              >
                <div className="aspect-[3/4] bg-gradient-to-br from-stone-100 to-stone-200 relative overflow-hidden">
                  {/* Visual texture for stone */}
                  <div className="absolute inset-0 bg-gradient-to-br from-stone-200 via-marble-warm to-stone-100 opacity-80" />
                  <div
                    className="absolute inset-0 opacity-5"
                    style={{
                      backgroundImage: 'radial-gradient(circle at 50% 50%, #000 1px, transparent 1px)',
                      backgroundSize: '10px 10px',
                    }}
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors duration-300" />
                </div>
                <div className="mt-4">
                  <h3 className="font-display text-lg font-medium text-stone-900 group-hover:text-stone-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-sm text-stone-500">
                    {category.subcategories.reduce((total, sub) => total + sub.products.length, 0)} varieties available
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="section-padding bg-stone-900">
        <div className="container-wide">
          <SectionHeader
            label="Our Services"
            title="End-to-end support"
            description="Beyond supply, we offer comprehensive services to ensure your project runs smoothly from specification to delivery."
            align="center"
            dark
          />

          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <Link
                key={service.id}
                href={`/services#${service.id}`}
                className="group p-8 border border-stone-700 hover:border-stone-500 transition-colors duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center mb-6">
                  {service.id === 'quality' && <Shield className="w-5 h-5 text-stone-400" />}
                  {service.id === 'projects' && <ClipboardCheck className="w-5 h-5 text-stone-400" />}
                  {service.id === 'sourcing' && <Globe className="w-5 h-5 text-stone-400" />}
                  {service.id === 'logistics' && <Truck className="w-5 h-5 text-stone-400" />}
                </div>
                <h3 className="text-lg font-medium text-white group-hover:text-stone-300 transition-colors">
                  {service.name}
                </h3>
                <p className="mt-2 text-sm text-stone-400">
                  {service.tagline}
                </p>
                <div className="mt-6 flex items-center text-sm text-stone-500 group-hover:text-stone-400 transition-colors">
                  Learn more
                  <ArrowUpRight className="ml-2 w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <SectionHeader
            label="How We Work"
            title="Simple, transparent process"
            align="center"
          />

          <div className="mt-16 grid md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Inquiry',
                description: 'Share your project requirements, quantities, and specifications.',
              },
              {
                step: '02',
                title: 'Quotation',
                description: 'Receive detailed pricing with material options and lead times.',
              },
              {
                step: '03',
                title: 'Confirmation',
                description: 'Approve samples, finalize specs, and confirm the order.',
              },
              {
                step: '04',
                title: 'Delivery',
                description: 'Production, quality control, shipping, and delivery tracking.',
              },
            ].map((item, index) => (
              <div key={item.step} className="relative">
                {/* Connector line */}
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-stone-200 -translate-y-1/2" />
                )}
                <div className="text-5xl font-display font-light text-stone-200">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-medium text-stone-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-marble-cream">
        <div className="container-narrow text-center">
          <h2 className="font-display text-display-sm md:text-display text-stone-900">
            Ready to discuss your project?
          </h2>
          <p className="mt-6 text-lg text-stone-600 max-w-2xl mx-auto">
            Tell us about your requirements and we'll provide a detailed quotation.
            No obligations, no pressure - just straightforward information.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/contact" className="btn-primary">
              Request a Quote
              <ArrowRight className="ml-3 w-4 h-4" />
            </Link>
            <a
              href="https://wa.me/905324069997"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
