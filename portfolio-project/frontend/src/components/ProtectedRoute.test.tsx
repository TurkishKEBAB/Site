import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

// ─── Mock contexts to avoid transitive api.ts import ─────────────────────────
const mockUseAuth = vi.fn()
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({ language: 'en' }),
}))

vi.mock('./Toast', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────
function renderRoute(ui: React.ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows a loading spinner while auth is resolving', () => {
    mockUseAuth.mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
      isAdmin: false,
      user: null,
    })

    renderRoute(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
    )

    expect(screen.queryByText('Protected Content')).toBeNull()
    expect(document.querySelector('.animate-spin')).not.toBeNull()
  })

  it('redirects unauthenticated users to /login', () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      isAdmin: false,
      user: null,
    })

    renderRoute(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
    )

    // Children must not be rendered
    expect(screen.queryByText('Protected Content')).toBeNull()
  })

  it('renders children when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      isAdmin: false,
      user: { id: '1', email: 'user@test.com', is_admin: false, is_active: true },
    })

    renderRoute(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
    )

    expect(screen.getByText('Protected Content')).toBeDefined()
  })

  it('redirects authenticated non-admin when requireAdmin is true', () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      isAdmin: false,
      user: { id: '1', email: 'user@test.com', is_admin: false, is_active: true },
    })

    renderRoute(
      <ProtectedRoute requireAdmin>
        <div>Admin Content</div>
      </ProtectedRoute>,
    )

    expect(screen.queryByText('Admin Content')).toBeNull()
  })

  it('renders children for admin when requireAdmin is true', () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      isAdmin: true,
      user: { id: '1', email: 'admin@test.com', is_admin: true, is_active: true },
    })

    renderRoute(
      <ProtectedRoute requireAdmin>
        <div>Admin Content</div>
      </ProtectedRoute>,
    )

    expect(screen.getByText('Admin Content')).toBeDefined()
  })
})
