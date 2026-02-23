import { describe, expect, it } from 'vitest'

import { statusToMessage } from './GlobalApiErrorListener'

describe('statusToMessage', () => {
  it('returns auth message for 401/403', () => {
    expect(statusToMessage(401)).toContain('session')
    expect(statusToMessage(403)).toContain('session')
  })

  it('returns tailored messages for common statuses', () => {
    expect(statusToMessage(404)).toContain('not found')
    expect(statusToMessage(500)).toContain('Server error')
  })

  it('returns generic message for unknown statuses', () => {
    expect(statusToMessage(418)).toContain('Request failed')
    expect(statusToMessage(undefined)).toContain('Request failed')
  })
})
