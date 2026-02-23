import { useEffect } from 'react'

interface SeoProps {
  title: string
  description: string
  keywords: string
  canonicalPath: string
}

const ensureMetaTag = (selector: string, attributes: Record<string, string>) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value))
    document.head.appendChild(element)
  }
  return element
}

const ensureCanonicalTag = () => {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', 'canonical')
    document.head.appendChild(element)
  }
  return element
}

export default function Seo({ title, description, keywords, canonicalPath }: SeoProps) {
  useEffect(() => {
    document.title = title

    const descriptionMeta = ensureMetaTag('meta[name="description"]', { name: 'description' })
    descriptionMeta.setAttribute('content', description)

    const keywordsMeta = ensureMetaTag('meta[name="keywords"]', { name: 'keywords' })
    keywordsMeta.setAttribute('content', keywords)

    const ogTitle = ensureMetaTag('meta[property="og:title"]', { property: 'og:title' })
    ogTitle.setAttribute('content', title)

    const ogDescription = ensureMetaTag('meta[property="og:description"]', { property: 'og:description' })
    ogDescription.setAttribute('content', description)

    const ogType = ensureMetaTag('meta[property="og:type"]', { property: 'og:type' })
    ogType.setAttribute('content', 'website')

    const ogUrl = ensureMetaTag('meta[property="og:url"]', { property: 'og:url' })
    ogUrl.setAttribute('content', `${window.location.origin}${canonicalPath}`)

    const twitterCard = ensureMetaTag('meta[name="twitter:card"]', { name: 'twitter:card' })
    twitterCard.setAttribute('content', 'summary_large_image')

    const canonical = ensureCanonicalTag()
    canonical.setAttribute('href', `${window.location.origin}${canonicalPath}`)
  }, [canonicalPath, description, keywords, title])

  return null
}
