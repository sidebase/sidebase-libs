import { expect } from 'chai'
import { describe, it } from 'vitest'

import returnsFive from '../src'

describe('The package works correctly', () => {
  it('returns 5', () => {
    expect(returnsFive()).equals(5)
  })
})
