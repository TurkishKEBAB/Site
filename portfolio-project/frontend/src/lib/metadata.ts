import type { Metadata } from "next";

import { defaultKeywords, getLocaleValue, seoContent, siteConfig, type Locale } from "@/content/site";

type SeoKey = keyof typeof seoContent;

// A misconfigured NEXT_PUBLIC_SITE_URL (scheme-less host, stray whitespace)
// used to reach `new URL(path, base)` untouched and abort the production build
// with `TypeError: Invalid URL`. Metadata is not worth failing a deploy over, so
// anything that is not an absolute URL falls back to the canonical domain.
export const getSiteUrl = (): string => {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) {
    return siteConfig.siteUrl;
  }

  try {
    return new URL(configured).origin;
  } catch {
    return siteConfig.siteUrl;
  }
};

export const buildMetadata = (
  key: SeoKey,
  locale: Locale,
  path: string,
): Metadata => {
  const seo = getLocaleValue(seoContent[key], locale);
  const url = new URL(path, getSiteUrl()).toString();

  return {
    metadataBase: new URL(getSiteUrl()),
    title: seo.title,
    description: seo.description,
    keywords: defaultKeywords,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      url,
      title: seo.title,
      description: seo.description,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          alt: `${siteConfig.name} social card`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [siteConfig.ogImage],
    },
  };
};

export const buildPersonJsonLd = (locale: Locale) => ({
  "@context": "https://schema.org",
  "@type": "Person",
  name: siteConfig.name,
  jobTitle: `${siteConfig.role} - ${siteConfig.focus}`,
  url: getSiteUrl(),
  email: siteConfig.email,
  knowsAbout: defaultKeywords,
  sameAs: [siteConfig.github, siteConfig.linkedin, siteConfig.twitter],
  address: {
    "@type": "PostalAddress",
    addressLocality: getLocaleValue(siteConfig.location, locale),
    addressCountry: locale === "tr" ? "Türkiye" : "Turkey",
  },
});
