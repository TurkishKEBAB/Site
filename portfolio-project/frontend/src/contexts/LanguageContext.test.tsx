import React from 'react'
import { render, screen, waitFor, act, cleanup } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { LanguageProvider, useLanguage } from './LanguageContext'

// ─── Mock api module ──────────────────────────────────────────────────────────
const mockGet = vi.fn()

vi.mock('../services/api', () => ({
  default: {
    get: (...args: unknown[]) => mockGet(...args),
  },
  apiEndpoints: {
    auth: {
      me: '/auth/me',
      loginJson: '/auth/login/json',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
    },
    translations: {
      byLanguage: (lang: string) => `/api/v1/translations/${lang}`,
    },
  },
}))

// ─── Consumer component ───────────────────────────────────────────────────────
function LanguageConsumer() {
  const { language, t, isLoading, setLanguage } = useLanguage()
  return (
    <div>
      <span data-testid="language">{language}</span>
      <span data-testid="isLoading">{String(isLoading)}</span>
      <span data-testid="nav_home">{t('nav_home')}</span>
      <button onClick={() => setLanguage('tr')}>use-tr</button>
      <button onClick={() => setLanguage('en')}>use-en</button>
    </div>
  )
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('LanguageContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('defaults to "en" when no language is stored', async () => {
    mockGet.mockResolvedValueOnce({ data: {} })

    render(
      <LanguageProvider>
        <LanguageConsumer />
      </LanguageProvider>,
    )

    await waitFor(() =>
      expect(screen.getByTestId('isLoading').textContent).toBe('false'),
    )
    expect(screen.getByTestId('language').textContent).toBe('en')
  })

  it('uses "tr" when "tr" is stored in localStorage', async () => {
    localStorage.setItem('lang', 'tr')
    mockGet.mockResolvedValueOnce({ data: {} })

    render(
      <LanguageProvider>
        <LanguageConsumer />
      </LanguageProvider>,
    )

    await waitFor(() =>
      expect(screen.getByTestId('isLoading').textContent).toBe('false'),
    )
    expect(screen.getByTestId('language').textContent).toBe('tr')
  })

  it('applies custom translation values returned from API', async () => {
    mockGet.mockResolvedValueOnce({ data: { nav_home: 'Homepage' } })

    render(
      <LanguageProvider>
        <LanguageConsumer />
      </LanguageProvider>,
    )

    // Wait for the API response to actually be applied (not just isLoading to flip)
    await waitFor(() =>
      expect(screen.getByTestId('nav_home').textContent).toBe('Homepage'),
    )
  })

  it('falls back to built-in translations when API fails', async () => {
    mockGet.mockRejectedValueOnce(new Error('Network error'))

    render(
      <LanguageProvider>
        <LanguageConsumer />
      </LanguageProvider>,
    )

    await waitFor(() =>
      expect(screen.getByTestId('isLoading').textContent).toBe('false'),
    )
    // Fallback English value
    expect(screen.getByTestId('nav_home').textContent).toBe('Home')
  })

  it('triggers a new API fetch when language changes', async () => {
    mockGet
      .mockResolvedValueOnce({ data: {} }) // initial en fetch
      .mockResolvedValueOnce({ data: { nav_home: 'Ana Sayfa (api)' } }) // tr fetch

    render(
      <LanguageProvider>
        <LanguageConsumer />
      </LanguageProvider>,
    )

    // Wait for the initial en fetch to actually complete before switching language
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1))

    act(() => {
      screen.getByRole('button', { name: 'use-tr' }).click()
    })

    await waitFor(() =>
      expect(screen.getByTestId('nav_home').textContent).toBe('Ana Sayfa (api)'),
    )
    expect(mockGet).toHaveBeenCalledTimes(2)
  })

  it('t() returns the key itself when the key is missing from all sources', async () => {
    mockGet.mockResolvedValueOnce({ data: {} })

    render(
      <LanguageProvider>
        <LanguageConsumer />
      </LanguageProvider>,
    )

    await waitFor(() =>
      expect(screen.getByTestId('isLoading').textContent).toBe('false'),
    )

    function MissingKeyConsumer() {
      const { t } = useLanguage()
      return <span data-testid="missing">{t('totally_nonexistent_key')}</span>
    }
    // Standalone render for the extra consumer
    const { getByTestId } = render(
      <LanguageProvider>
        <MissingKeyConsumer />
      </LanguageProvider>,
    )
    // The key itself is returned as the value
    expect(getByTestId('missing').textContent).toBe('totally_nonexistent_key')
  })
})
