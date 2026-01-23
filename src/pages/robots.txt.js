import { siteUrl } from '@/lib/seo'

export async function getServerSideProps({ res }) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : siteUrl)

  const content = `User-agent: *
Allow: /

# Disallow api routes
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`

  res.setHeader('Content-Type', 'text/plain')
  res.write(content)
  res.end()

  return { props: {} }
}

export default function Robots() {
  return null
}
