import Head from 'next/head'
import Link from 'next/link'
import SectionHeader from '@/components/ui/SectionHeader'
import { ArrowRight, Check, Globe, Shield, Users, Scale } from '@/components/ui/Icons'

const milestones = [
  {
    year: '2009',
    title: 'Founded',
    description: 'Started operations focusing on Turkish marble exports to the Middle East.',
  },
  {
    year: '2012',
    title: 'European Expansion',
    description: 'Expanded operations to serve European markets, establishing logistics partnerships.',
  },
  {
    year: '2015',
    title: 'Multi-Origin Sourcing',
    description: 'Built relationships with quarries in Spain, Italy, India, and Brazil.',
  },
  {
    year: '2018',
    title: 'Project Services',
    description: 'Launched dedicated project management services for large-scale developments.',
  },
  {
    year: '2021',
    title: 'Americas Market',
    description: 'Extended reach to North and South American contractors and developers.',
  },
  {
    year: 'Today',
    title: '26 Countries',
    description: 'Serving clients worldwide with a track record of 91 completed projects.',
  },
]

const values = [
  {
    icon: Shield,
    title: 'Reliability First',
    description: 'We do what we say. Timelines are commitments, not estimates. Quality is non-negotiable.',
  },
  {
    icon: Scale,
    title: 'Transparent Pricing',
    description: 'Clear quotes with all costs itemized. No surprises, no hidden fees, no renegotiation games.',
  },
  {
    icon: Users,
    title: 'Long-Term Relationships',
    description: 'We build partnerships, not transactions. Most of our business comes from repeat clients.',
  },
  {
    icon: Globe,
    title: 'Global Perspective',
    description: "We understand international trade complexities and navigate them so you don't have to.",
  },
]

const stats = [
  { value: '15+', label: 'Years in Business' },
  { value: '91', label: 'Projects Delivered' },
  { value: '26', label: 'Countries Served' },
  { value: '98%', label: 'On-Time Delivery' },
]

export default function About() {
  return (
    <>
      <Head>
        <title>About Us | Experience & Values | Marble Professionals</title>
        <meta
          name="description"
          content="15+ years of international stone trade experience. Learn about our approach to quality, reliability, and client partnerships in natural stone supply."
        />
      </Head>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-marble-cream to-white">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-medium tracking-widest uppercase text-stone-500 mb-4">
                About Us
              </p>
              <h1 className="font-display text-display-sm md:text-display text-stone-900">
                Built on experience, driven by reliability
              </h1>
              <p className="mt-6 text-lg text-stone-600 leading-relaxed">
                We've spent over 15 years in the natural stone trade, learning what matters most
                to international buyers: consistent quality, reliable delivery, and clear communication.
                That's what we deliver.
              </p>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] bg-gradient-to-br from-stone-100 to-stone-200 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-stone-200 via-marble-warm to-stone-100 opacity-80" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-stone-900">
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

      {/* Our Approach */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <SectionHeader
                label="Our Approach"
                title="No marketing fluff. Just straightforward trade."
              />
              <div className="mt-8 space-y-6 text-stone-600 leading-relaxed">
                <p>
                  We're not the biggest stone supplier in the market. We're not trying to be.
                  We focus on doing what we do well: sourcing quality materials, ensuring
                  consistency, and delivering on time.
                </p>
                <p>
                  Our clients are professionals—contractors, developers, importers—who have been
                  burned by suppliers who over-promise and under-deliver. They come to us because
                  they need reliability, not sales pitches.
                </p>
                <p>
                  We've built our business on repeat customers. Most of our new clients come
                  from referrals. That only happens when you consistently deliver on your promises.
                </p>
              </div>

              <div className="mt-10 p-6 bg-stone-50 border-l-4 border-stone-900">
                <p className="text-stone-700 italic">
                  "We treat every shipment like our reputation depends on it—because it does."
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-medium tracking-widest uppercase text-stone-500 mb-8">
                What We Won't Do
              </h3>
              <ul className="space-y-4">
                {[
                  "Quote a price we can't hold",
                  "Promise delivery dates we can't meet",
                  "Ship materials without thorough inspection",
                  "Disappear when problems arise",
                  "Pressure you into quick decisions",
                  "Compromise quality for margin",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 py-3 border-b border-stone-100">
                    <span className="w-2 h-2 rounded-full bg-stone-900 flex-shrink-0 mt-2" />
                    <span className="text-stone-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-marble-cream">
        <div className="container-wide">
          <SectionHeader
            label="Our Values"
            title="Principles that guide our work"
            align="center"
          />

          <div className="mt-16 grid md:grid-cols-2 gap-8">
            {values.map((value) => {
              const IconComponent = value.icon
              return (
                <div key={value.title} className="card">
                  <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-6">
                    <IconComponent className="w-5 h-5 text-stone-600" />
                  </div>
                  <h3 className="text-xl font-display font-medium text-stone-900">
                    {value.title}
                  </h3>
                  <p className="mt-3 text-stone-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <SectionHeader
            label="Our Journey"
            title="15 years of building trust"
          />

          <div className="mt-16 relative">
            {/* Timeline line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-stone-200 -translate-x-1/2 hidden md:block" />

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.year}
                  className={`relative grid md:grid-cols-2 gap-8 ${
                    index % 2 === 0 ? '' : 'md:text-right'
                  }`}
                >
                  {/* Content */}
                  <div className={index % 2 === 0 ? 'md:pr-16' : 'md:order-2 md:pl-16'}>
                    <span className="inline-block text-xs font-medium tracking-widest uppercase text-stone-400 mb-2">
                      {milestone.year}
                    </span>
                    <h3 className="text-xl font-display font-medium text-stone-900">
                      {milestone.title}
                    </h3>
                    <p className="mt-2 text-stone-600">
                      {milestone.description}
                    </p>
                  </div>

                  {/* Empty column for spacing */}
                  <div className={index % 2 === 0 ? 'md:order-2' : ''} />

                  {/* Dot on timeline */}
                  <div className="absolute left-0 md:left-1/2 top-0 w-4 h-4 rounded-full bg-stone-900 border-4 border-white -translate-x-1/2 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Where We Operate */}
      <section className="section-padding bg-stone-900">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionHeader
                label="Global Reach"
                title="Sourcing from key regions, delivering worldwide"
                dark
              />
              <p className="mt-6 text-stone-300 leading-relaxed">
                We maintain relationships with quarries and processing facilities across major
                stone-producing regions. This allows us to source the right materials for your
                project regardless of origin requirements.
              </p>

              <div className="mt-10 grid sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-medium tracking-widest uppercase text-stone-500 mb-4">
                    Sourcing Regions
                  </h4>
                  <ul className="space-y-2 text-stone-300">
                    <li>Turkey</li>
                    <li>Italy</li>
                    <li>Spain</li>
                    <li>India</li>
                    <li>Brazil</li>
                    <li>Portugal</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-medium tracking-widest uppercase text-stone-500 mb-4">
                    Key Markets
                  </h4>
                  <ul className="space-y-2 text-stone-300">
                    <li>Middle East & GCC</li>
                    <li>Europe</li>
                    <li>North America</li>
                    <li>Asia Pacific</li>
                    <li>Africa</li>
                    <li>South America</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-stone-800 rounded-sm overflow-hidden">
                {/* World map placeholder - using abstract pattern */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `radial-gradient(circle at 30% 40%, #fff 2px, transparent 2px),
                                      radial-gradient(circle at 70% 30%, #fff 2px, transparent 2px),
                                      radial-gradient(circle at 50% 60%, #fff 2px, transparent 2px),
                                      radial-gradient(circle at 20% 70%, #fff 2px, transparent 2px),
                                      radial-gradient(circle at 80% 65%, #fff 2px, transparent 2px)`,
                    backgroundSize: '100% 100%',
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
            Ready to work with us?
          </h2>
          <p className="mt-6 text-lg text-stone-600 max-w-2xl mx-auto">
            We'd like to learn about your project. Whether you have a specific material
            in mind or need guidance on options, we're here to help.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/contact" className="btn-primary">
              Get in Touch
              <ArrowRight className="ml-3 w-4 h-4" />
            </Link>
            <Link href="/products" className="btn-secondary">
              Browse Materials
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
