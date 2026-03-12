import React from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Navigation from './Navigation'

// ─── Mock LanguageContext ─────────────────────────────────────────────────────
const mockSetLanguage = vi.fn()
vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: mockSetLanguage,
    // Return the key itself so aria-labels are predictable
    t: (key: string) => key,
  }),
  Language: {},
}))

// ─── Mock framer-motion: replace animated components with plain HTML ──────────
vi.mock('framer-motion', async () => {
  const React = await import('react')

  function makeMotion(tag: string) {
    return React.forwardRef(
      (
        {
          children,
          initial: _i,
          animate: _a,
          exit: _e,
          whileHover: _wh,
          whileTap: _wt,
          layoutId: _l,
          ...props
        }: Record<string, unknown> & { children?: React.ReactNode },
        ref: React.Ref<unknown>,
      ) =>
        React.createElement(
          tag,
          { ...props, ref } as React.HTMLAttributes<HTMLElement>,
          children,
        ),
    )
  }

  return {
    motion: {
      nav: makeMotion('nav'),
      div: makeMotion('div'),
      button: makeMotion('button'),
      span: makeMotion('span'),
      a: makeMotion('a'),
      ul: makeMotion('ul'),
      li: makeMotion('li'),
    },
    AnimatePresence: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  }
})

// ─── Helpers ──────────────────────────────────────────────────────────────────
function renderNav() {
  return render(
    <MemoryRouter>
      <Navigation />
    </MemoryRouter>,
  )
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders without crashing', () => {
    renderNav()
    expect(document.querySelector('nav')).not.toBeNull()
  })

  it('renders the YO brand link', () => {
    renderNav()
    expect(screen.getByText('YO')).toBeDefined()
  })

  it('opens the language dropdown when the globe button is clicked', () => {
    renderNav()

    // The globe button has aria-label equal to the translation key "nav_language"
    const globeBtn = screen.getByRole('button', { name: 'nav_language' })
    fireEvent.click(globeBtn)

    // After opening, both language options should be visible
    expect(screen.getByText('English')).toBeDefined()
    expect(screen.getByText('Turkce')).toBeDefined()
  })

  it('closes the language dropdown on Escape key', () => {
    renderNav()

    const globeBtn = screen.getByRole('button', { name: 'nav_language' })
    fireEvent.click(globeBtn)

    // Dropdown is open
    expect(screen.getByText('English')).toBeDefined()

    fireEvent.keyDown(document, { key: 'Escape' })

    // Dropdown should be gone
    expect(screen.queryByText('English')).toBeNull()
  })

  it('calls setLanguage when a language option is selected', () => {
    renderNav()

    // Open dropdown
    fireEvent.click(screen.getByRole('button', { name: 'nav_language' }))
    // Click Turkce
    fireEvent.click(screen.getByText('Turkce'))

    expect(mockSetLanguage).toHaveBeenCalledWith('tr')
  })

  it('closes the dropdown when clicking outside', () => {
    renderNav()

    fireEvent.click(screen.getByRole('button', { name: 'nav_language' }))
    expect(screen.getByText('English')).toBeDefined()

    // Simulate mousedown on document body (outside the dropdown)
    fireEvent.mouseDown(document.body)

    expect(screen.queryByText('English')).toBeNull()
  })

  it('toggles mobile menu when hamburger button is clicked', () => {
    renderNav()

    const menuBtn = screen.getByRole('button', { name: 'Toggle menu' })
    fireEvent.click(menuBtn)

    // Mobile menu links should now appear; nav items use t(key) = key as labels
    // The mobile menu renders the same nav items (nav_home, nav_about, etc.)
    const mobileLinks = screen.getAllByText('nav_home')
    // At least one nav_home link present (could be more in mobile section)
    expect(mobileLinks.length).toBeGreaterThan(0)
  })
})
