import { describe, expect, it } from 'vitest'

import { getSeoConfig } from './seoConfig'

describe('getSeoConfig', () => {
  it('returns blog metadata for blog detail routes', () => {
    const config = getSeoConfig('/blog/my-first-post', 'en')

    expect(config.title).toContain('Blog')
    expect(config.canonicalPath).toBe('/blog')
  })

  it('returns localized metadata for known routes', () => {
    const english = getSeoConfig('/projects', 'en')
    const turkish = getSeoConfig('/projects', 'tr')

    expect(english.title).toContain('Projects')
    expect(turkish.title).toContain('Projeler')
    expect(english.description).not.toEqual(turkish.description)
  })

  it('falls back to not found metadata for unknown routes', () => {
    const config = getSeoConfig('/unknown-page', 'en')

    expect(config.title).toContain('Page Not Found')
    expect(config.canonicalPath).toBe('/unknown-page')
  })
})
