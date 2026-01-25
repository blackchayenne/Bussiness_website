import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/products' },
  { name: 'Services', href: '/services' },
  { name: 'About', href: '/about' },
  { name: 'Instagram', href: '/instagram' },
  { name: 'Contact', href: '/contact' },
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [router.pathname])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-sm border-b border-stone-100'
          : 'bg-transparent'
      }`}
    >
      <nav className="container-wide">
        <div className="flex items-center justify-between h-20 lg:h-24">
          {/* Logo */}
          <Link href="/" className="relative z-10">
            <span className="font-display text-xl font-semibold tracking-tight text-stone-900">
              Marble Professionals
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-12">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm tracking-wide transition-colors duration-200 ${
                  router.pathname === item.href
                    ? 'text-stone-900 font-medium'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-6">
            <Link
              href="/warehouse"
              className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-medium tracking-wide uppercase bg-accent-gold text-white hover:bg-accent-copper transition-colors duration-200"
            >
              E-Warehouse
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative z-10 lg:hidden p-2 -mr-2"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span
                className={`block h-0.5 bg-stone-900 transition-all duration-300 ${
                  isOpen ? 'rotate-45 translate-y-2' : ''
                }`}
              />
              <span
                className={`block h-0.5 bg-stone-900 transition-all duration-300 ${
                  isOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block h-0.5 bg-stone-900 transition-all duration-300 ${
                  isOpen ? '-rotate-45 -translate-y-2' : ''
                }`}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-white z-40 lg:hidden transition-all duration-500 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="flex flex-col justify-center items-center h-full">
          <nav className="flex flex-col items-center gap-8">
            {navigation.map((item, index) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-3xl font-display transition-all duration-300 ${
                  router.pathname === item.href
                    ? 'text-stone-900'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                style={{
                  transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
                  transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
                  opacity: isOpen ? 1 : 0
                }}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/warehouse"
              className="btn-primary mt-8"
              style={{
                transitionDelay: isOpen ? '250ms' : '0ms',
                transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
                opacity: isOpen ? 1 : 0
              }}
            >
              E-Warehouse
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
