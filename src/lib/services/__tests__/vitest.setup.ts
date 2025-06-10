import { vi, expect, afterEach } from "vitest";

// 🌍 Globalne mocki dla środowiska testowego
vi.mock("../../../db/supabase.client", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      range: vi.fn(),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        download: vi.fn(),
        remove: vi.fn(),
      })),
    },
  })),
}));

// 📅 Stabilne Date mocki dla testów
const mockDate = new Date("2024-01-15T10:30:00.000Z");
vi.setSystemTime(mockDate);

// 🔧 Custom matchers dla lepszych asercji
expect.extend({
  toBeValidFlashcard(received: unknown) {
    const pass =
      received &&
      typeof received === "object" &&
      received !== null &&
      "id" in received &&
      "user_id" in received &&
      "question" in received &&
      "answer" in received &&
      "is_ai_generated" in received &&
      "is_deleted" in received &&
      "created_at" in received &&
      "updated_at" in received &&
      typeof (received as Record<string, unknown>).id === "string" &&
      typeof (received as Record<string, unknown>).user_id === "string" &&
      typeof (received as Record<string, unknown>).question === "string" &&
      typeof (received as Record<string, unknown>).answer === "string" &&
      typeof (received as Record<string, unknown>).is_ai_generated === "boolean" &&
      typeof (received as Record<string, unknown>).is_deleted === "boolean" &&
      typeof (received as Record<string, unknown>).created_at === "string" &&
      typeof (received as Record<string, unknown>).updated_at === "string";

    if (pass) {
      return {
        message: () => `Expected ${JSON.stringify(received)} not to be a valid flashcard`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected ${JSON.stringify(received)} to be a valid flashcard`,
        pass: false,
      };
    }
  },
});

// 🏷️ Rozszerzenie typów dla custom matcherów
declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> {
    toBeValidFlashcard(): T;
  }
  interface AsymmetricMatchersContaining {
    toBeValidFlashcard(): unknown;
  }
}

// 🧹 Cleanup po każdym teście
afterEach(() => {
  vi.clearAllMocks();
});
