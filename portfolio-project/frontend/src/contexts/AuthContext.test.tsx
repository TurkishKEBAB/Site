import React from 'react'
import { render, screen, waitFor, act, cleanup } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { AuthProvider, useAuth } from './AuthContext'

// ─── Mock api module (prevents VITE_API_BASE_URL throw on import) ─────────────
const mockGet = vi.fn()
const mockPost = vi.fn()

vi.mock('../services/api', () => ({
  default: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
  },
  apiEndpoints: {
    auth: {
      me: '/auth/me',
      loginJson: '/auth/login/json',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
    },
    translations: {
      byLanguage: (lang: string) => `/translations/${lang}`,
    },
  },
}))

// ─── Consumer component that exposes context values ───────────────────────────
function AuthConsumer() {
  const { isLoading, isAuthenticated, user, token } = useAuth()
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user">{user ? user.email : 'none'}</span>
      <span data-testid="token">{token ?? 'none'}</span>
    </div>
  )
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('starts unauthenticated when no token is stored', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )

    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false'),
    )
    expect(screen.getByTestId('authenticated').textContent).toBe('false')
    expect(screen.getByTestId('user').textContent).toBe('none')
  })

  it('verifies stored token and loads user on mount', async () => {
    localStorage.setItem('token', 'valid-access-token')
    mockGet.mockResolvedValueOnce({
      data: { id: '1', email: 'admin@test.com', is_admin: true, is_active: true },
    })

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )

    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false'),
    )
    expect(screen.getByTestId('authenticated').textContent).toBe('true')
    expect(screen.getByTestId('user').textContent).toBe('admin@test.com')
  })

  it('clears auth state when token verification fails', async () => {
    localStorage.setItem('token', 'expired-token')
    localStorage.setItem('refresh_token', 'some-refresh')
    mockGet.mockRejectedValueOnce(new Error('401 Unauthorized'))

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )

    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false'),
    )
    expect(screen.getByTestId('authenticated').textContent).toBe('false')
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('updates token state when token-refreshed event is dispatched', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )

    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false'),
    )

    // Provide a mock response for the re-verification useEffect([token]) triggers
    const userData = { id: '1', email: 'admin@test.com', is_admin: true, is_active: true }
    mockGet.mockResolvedValueOnce({ data: userData })

    act(() => {
      window.dispatchEvent(
        new CustomEvent('token-refreshed', { detail: { token: 'refreshed-token' } }),
      )
    })

    await waitFor(() =>
      expect(screen.getByTestId('token').textContent).toBe('refreshed-token'),
    )
  })

  it('login sets token and fetches user', async () => {
    const userData = { id: '2', email: 'user@test.com', is_admin: false, is_active: true }
    mockPost.mockResolvedValueOnce({
      data: { access_token: 'new-access', refresh_token: 'new-refresh' },
    })
    // Use mockResolvedValue (not Once) so both the explicit /auth/me call inside login()
    // and any re-verification call from useEffect([token]) both succeed
    mockGet.mockResolvedValue({ data: userData })

    function LoginConsumer() {
      const { login, isAuthenticated, user } = useAuth()
      return (
        <div>
          <span data-testid="authenticated">{String(isAuthenticated)}</span>
          <span data-testid="user">{user ? user.email : 'none'}</span>
          <button onClick={() => void login('user@test.com', 'pass')}>login</button>
        </div>
      )
    }

    render(
      <AuthProvider>
        <LoginConsumer />
      </AuthProvider>,
    )

    const btn = screen.getByRole('button', { name: 'login' })
    act(() => {
      btn.click()
    })

    await waitFor(() =>
      expect(screen.getByTestId('user').textContent).toBe('user@test.com'),
    )
    expect(screen.getByTestId('authenticated').textContent).toBe('true')
    expect(localStorage.getItem('token')).toBe('new-access')
  })

  it('logout clears token and user', async () => {
    localStorage.setItem('token', 'valid-token')
    mockGet.mockResolvedValueOnce({
      data: { id: '1', email: 'admin@test.com', is_admin: true, is_active: true },
    })
    mockPost.mockResolvedValueOnce({}) // logout response

    function LogoutConsumer() {
      const { logout, isAuthenticated } = useAuth()
      return (
        <div>
          <span data-testid="authenticated">{String(isAuthenticated)}</span>
          <button onClick={() => void logout()}>logout</button>
        </div>
      )
    }

    render(
      <AuthProvider>
        <LogoutConsumer />
      </AuthProvider>,
    )

    // Wait for mount verification to complete
    await waitFor(() =>
      expect(screen.getByTestId('authenticated').textContent).toBe('true'),
    )

    act(() => {
      screen.getByRole('button', { name: 'logout' }).click()
    })

    await waitFor(() =>
      expect(screen.getByTestId('authenticated').textContent).toBe('false'),
    )
    expect(localStorage.getItem('token')).toBeNull()
  })
})
