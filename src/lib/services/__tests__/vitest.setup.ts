import { vi, expect, afterEach } from 'vitest'

// 🌍 Globalne mocki dla środowiska testowego
vi.mock('../../../db/supabase.client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  })),
}))

// 📅 Stabilne Date mocki dla testów
const mockDate = new Date('2024-01-15T10:30:00.000Z')
vi.setSystemTime(mockDate)

// 🔧 Custom matchers dla lepszych asercji
expect.extend({
  toBeValidFlashcard(received: any) {
    const pass = received &&
      typeof received.id === 'string' &&
      typeof received.user_id === 'string' &&
      typeof received.question === 'string' &&
      typeof received.answer === 'string' &&
      typeof received.is_ai_generated === 'boolean' &&
      typeof received.is_deleted === 'boolean' &&
      typeof received.created_at === 'string' &&
      typeof received.updated_at === 'string'

    if (pass) {
      return {
        message: () => `Expected ${JSON.stringify(received)} not to be a valid flashcard`,
        pass: true,
      }
    } else {
      return {
        message: () => `Expected ${JSON.stringify(received)} to be a valid flashcard`,
        pass: false,
      }
    }
  },
})

// 🏷️ Rozszerzenie typów dla custom matcherów
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeValidFlashcard(): T
  }
  interface AsymmetricMatchersContaining {
    toBeValidFlashcard(): any
  }
}

// 🧹 Cleanup po każdym teście
afterEach(() => {
  vi.clearAllMocks()
}) 