import Link from 'next/link'

const navigation = {
  main: [
    { name: 'Products', href: '/products' },
    { name: 'Services', href: '/services' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ],
  products: [
    { name: 'Marble', href: '/products#marble' },
    { name: 'Granite', href: '/products#granite' },
    { name: 'Travertine', href: '/products#travertine' },
    { name: 'Limestone', href: '/products#limestone' },
  ],
  services: [
    { name: 'Quality Control', href: '/services#quality' },
    { name: 'Project Management', href: '/services#projects' },
    { name: 'Supply & Sourcing', href: '/services#sourcing' },
    { name: 'Logistics', href: '/services#logistics' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="container-wide section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block">
              <span className="font-display text-xl font-semibold text-white">
                Marble Professionals
              </span>
            </Link>
            <p className="mt-6 text-sm leading-relaxed text-stone-400">
              Premium natural stone export and supply for international projects.
              Trusted by contractors and developers worldwide.
            </p>
            <div className="mt-6">
              <a
                href="https://instagram.com/marbleprofessionals"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                @marbleprofessionals
              </a>
            </div>
          </div>

          {/* Products Column */}
          <div>
            <h4 className="text-xs font-medium tracking-wider uppercase text-stone-500 mb-6">
              Materials
            </h4>
            <ul className="space-y-4">
              {navigation.products.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-stone-400 hover:text-white transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Column */}
          <div>
            <h4 className="text-xs font-medium tracking-wider uppercase text-stone-500 mb-6">
              Services
            </h4>
            <ul className="space-y-4">
              {navigation.services.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-stone-400 hover:text-white transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-xs font-medium tracking-wider uppercase text-stone-500 mb-6">
              Contact
            </h4>
            <ul className="space-y-4 text-sm text-stone-400">
              <li>
                <a
                  href="tel:+905324069997"
                  className="hover:text-white transition-colors duration-200"
                >
                  +90 532 406 99 97
                </a>
              </li>
              <li>
                <a
                  href="tel:+16452436766"
                  className="hover:text-white transition-colors duration-200"
                >
                  +1 645 243 67 66
                </a>
              </li>
              <li className="pt-2">
                <p className="text-xs tracking-wider uppercase text-stone-500 mb-2">Head Office</p>
                <address className="not-italic leading-relaxed">
                  Altintop mah. Mimar Sinan cd.<br />
                  Bayram apt. No:19/3<br />
                  Merkezefendi/Denizli, Turkey
                </address>
              </li>
              <li className="pt-2">
                <p className="text-xs tracking-wider uppercase text-stone-500 mb-2">Izmir Branch</p>
                <address className="not-italic leading-relaxed">
                  Villakent mah. Sahin cd.<br />
                  No:97/1 Menemen/Izmir, Turkey
                </address>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-stone-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-stone-500">
              © {new Date().getFullYear()} MP Madencilik. All rights reserved.
            </p>
            <div className="flex gap-8">
              <Link
                href="/privacy"
                className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
