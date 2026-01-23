import { siteUrl } from '@/lib/seo'

const staticPages = [
  '/',
  '/products',
  '/services',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
]

export async function getServerSideProps({ res }) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : siteUrl)

  const urls = staticPages
    .map((path) => `<url><loc>${baseUrl}${path}</loc></url>`)
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`

  res.setHeader('Content-Type', 'application/xml')
  res.write(xml)
  res.end()

  return { props: {} }
}

export default function Sitemap() {
  return null
}
