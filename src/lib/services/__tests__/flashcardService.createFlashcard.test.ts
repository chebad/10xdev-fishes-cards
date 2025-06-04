import { describe, it, expect, vi, beforeEach, afterEach, expectTypeOf } from 'vitest'
import { FlashcardService } from '../flashcardService'
import type { CreateFlashcardCommand } from '../../../types'
import type { SupabaseClient } from '../../../db/supabase.client'

// 🏭 Mock factory patterns na poziomie pliku
const mockSupabaseClient = {
  auth: {
    getSession: vi.fn(),
  },
  from: vi.fn(() => ({
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
} as unknown as SupabaseClient

// 📅 Mock dla Date.now() dla deterministycznych testów
const mockDate = new Date('2024-01-15T10:30:00.000Z')

describe('FlashcardService.createFlashcard', () => {
  let flashcardService: FlashcardService
  let mockChain: any

  beforeEach(() => {
    // 🔄 Resetowanie wszystkich mocków przed każdym testem
    vi.clearAllMocks()
    
    // 📅 Mockowanie Date dla deterministycznych timestampów
    vi.useFakeTimers()
    vi.setSystemTime(mockDate)
    
    // 🏗️ Tworzenie nowej instancji serwisu
    flashcardService = new FlashcardService(mockSupabaseClient)
    
    // ⛓️ Konfiguracja domyślnego chain mocka dla Supabase
    mockChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn(),
    }
    
    mockSupabaseClient.from = vi.fn().mockReturnValue(mockChain)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ✅ HAPPY PATH - Scenariusze sukcesu
  describe('✅ Happy Path', () => {
    it('should create a manual flashcard successfully', async () => {
      // 🎯 Arrange
      const userId = 'user-123'
      const command: CreateFlashcardCommand = {
        question: 'Co to jest TypeScript?',
        answer: 'TypeScript to superset JavaScript z typowaniem statycznym',
        isAiGenerated: false
      }

      const expectedFlashcard = {
        id: 'flashcard-456',
        user_id: userId,
        question: command.question,
        answer: command.answer,
        is_ai_generated: false,
        source_text_for_ai: null,
        ai_accepted_at: null,
        is_deleted: false,
        created_at: mockDate.toISOString(),
        updated_at: mockDate.toISOString(),
      }

      // 🎭 Mock successful session
      mockSupabaseClient.auth.getSession = vi.fn().mockResolvedValue({
        data: { session: { user: { id: userId } } },
        error: null
      })

      // 🎭 Mock successful database insert
      mockChain.single.mockResolvedValue({
        data: expectedFlashcard,
        error: null
      })

      // 🚀 Act
      const result = await flashcardService.createFlashcard(command, userId)

      // 🔍 Assert - Sprawdzenie wywołań
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('flashcards')
      expect(mockChain.insert).toHaveBeenCalledWith({
        user_id: userId,
        question: command.question,
        answer: command.answer,
        is_ai_generated: false,
        source_text_for_ai: null,
        ai_accepted_at: null,
        is_deleted: false,
        created_at: mockDate.toISOString(),
        updated_at: mockDate.toISOString(),
      })
      expect(mockChain.select).toHaveBeenCalled()
      expect(mockChain.single).toHaveBeenCalled()

      // 🔍 Assert - Sprawdzenie wyniku
      expect(result).toEqual(expectedFlashcard)
    })

    it('should create AI-generated flashcard with source text', async () => {
      // 🎯 Arrange
      const userId = 'user-789'
      const command: CreateFlashcardCommand = {
        question: 'Czym jest React?',
        answer: 'React to biblioteka JavaScript do budowania interfejsów użytkownika',
        isAiGenerated: true,
        sourceTextForAi: 'React is a JavaScript library for building user interfaces...'
      }

      const expectedFlashcard = {
        id: 'flashcard-ai-123',
        user_id: userId,
        question: command.question,
        answer: command.answer,
        is_ai_generated: true,
        source_text_for_ai: command.sourceTextForAi,
        ai_accepted_at: mockDate.toISOString(),
        is_deleted: false,
        created_at: mockDate.toISOString(),
        updated_at: mockDate.toISOString(),
      }

      mockSupabaseClient.auth.getSession = vi.fn().mockResolvedValue({
        data: { session: { user: { id: userId } } },
        error: null
      })

      mockChain.single.mockResolvedValue({
        data: expectedFlashcard,
        error: null
      })

      // 🚀 Act
      const result = await flashcardService.createFlashcard(command, userId)

      // 🔍 Assert - Sprawdzenie danych AI
      expect(mockChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          is_ai_generated: true,
          source_text_for_ai: command.sourceTextForAi,
          ai_accepted_at: mockDate.toISOString(),
        })
      )

      expect(result).toEqual(expectedFlashcard)
    })

    it('should handle undefined optional fields correctly', async () => {
      // 🎯 Arrange - Minimal command
      const userId = 'user-minimal'
      const command: CreateFlashcardCommand = {
        question: 'Minimalne pytanie?',
        answer: 'Minimalna odpowiedź'
        // isAiGenerated i sourceTextForAi są undefined
      }

      const expectedInsertData = {
        user_id: userId,
        question: command.question,
        answer: command.answer,
        is_ai_generated: false, // domyślna wartość
        source_text_for_ai: null, // domyślna wartość
        ai_accepted_at: null, // bo nie jest AI
        is_deleted: false,
        created_at: mockDate.toISOString(),
        updated_at: mockDate.toISOString(),
      }

      mockSupabaseClient.auth.getSession = vi.fn().mockResolvedValue({
        data: { session: null },
        error: null
      })

      mockChain.single.mockResolvedValue({
        data: { ...expectedInsertData, id: 'test-id' },
        error: null
      })

      // 🚀 Act
      await flashcardService.createFlashcard(command, userId)

      // 🔍 Assert - Sprawdzenie domyślnych wartości
      expect(mockChain.insert).toHaveBeenCalledWith(expectedInsertData)
    })
  })

  // ❌ ERROR HANDLING - Scenariusze błędów
  describe('❌ Error Handling', () => {
    it('should throw error when Supabase returns database error', async () => {
      // 🎯 Arrange
      const userId = 'user-error'
      const command: CreateFlashcardCommand = {
        question: 'Test pytanie?',
        answer: 'Test odpowiedź'
      }

      const supabaseError = {
        message: 'duplicate key value violates unique constraint',
        code: '23505',
        details: 'Key (id)=(123) already exists.'
      }

      mockSupabaseClient.auth.getSession = vi.fn().mockResolvedValue({
        data: { session: null },
        error: null
      })

      mockChain.single.mockResolvedValue({
        data: null,
        error: supabaseError
      })

      // 🚀 Act & Assert
      await expect(flashcardService.createFlashcard(command, userId))
        .rejects.toThrow('Failed to create flashcard: duplicate key value violates unique constraint')

      // 🔍 Verify error logging
      expect(mockChain.insert).toHaveBeenCalled()
      expect(mockChain.single).toHaveBeenCalled()
    })

    it('should throw error when no data returned despite no error', async () => {
      // 🎯 Arrange - Edge case gdzie Supabase nie zwraca błędu ale też nie ma danych
      const userId = 'user-nodata'
      const command: CreateFlashcardCommand = {
        question: 'Pytanie bez danych?',
        answer: 'Odpowiedź bez danych'
      }

      mockSupabaseClient.auth.getSession = vi.fn().mockResolvedValue({
        data: { session: null },
        error: null
      })

      mockChain.single.mockResolvedValue({
        data: null,
        error: null // Brak błędu ale też brak danych
      })

      // 🚀 Act & Assert
      await expect(flashcardService.createFlashcard(command, userId))
        .rejects.toThrow('Failed to create flashcard: no data returned.')
    })

    it('should handle network/connection errors', async () => {
      // 🎯 Arrange
      const userId = 'user-network'
      const command: CreateFlashcardCommand = {
        question: 'Network test?',
        answer: 'Network answer'
      }

      mockSupabaseClient.auth.getSession = vi.fn().mockResolvedValue({
        data: { session: null },
        error: null
      })

      // 🎭 Mock network error
      mockChain.single.mockRejectedValue(new Error('Network error'))

      // 🚀 Act & Assert
      await expect(flashcardService.createFlashcard(command, userId))
        .rejects.toThrow('Network error')
    })
  })

  // 🎯 BUSINESS LOGIC - Reguły biznesowe
  describe('🎯 Business Logic Rules', () => {
    it('should set ai_accepted_at only for AI-generated flashcards', async () => {
      // 🎯 Arrange - Test dla fiszki manualnej
      const userId = 'user-manual'
      const manualCommand: CreateFlashcardCommand = {
        question: 'Manual question?',
        answer: 'Manual answer',
        isAiGenerated: false
      }

      mockSupabaseClient.auth.getSession = vi.fn().mockResolvedValue({
        data: { session: null },
        error: null
      })

      mockChain.single.mockResolvedValue({
        data: { id: 'test', ai_accepted_at: null },
        error: null
      })

      // 🚀 Act
      await flashcardService.createFlashcard(manualCommand, userId)

      // 🔍 Assert - ai_accepted_at powinno być null dla manual
      expect(mockChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          is_ai_generated: false,
          ai_accepted_at: null
        })
      )
    })

    it('should set timestamps consistently for created_at and updated_at', async () => {
      // 🎯 Arrange
      const userId = 'user-timestamps'
      const command: CreateFlashcardCommand = {
        question: 'Timestamp test?',
        answer: 'Timestamp answer'
      }

      mockSupabaseClient.auth.getSession = vi.fn().mockResolvedValue({
        data: { session: null },
        error: null
      })

      mockChain.single.mockResolvedValue({
        data: { id: 'test' },
        error: null
      })

      // 🚀 Act
      await flashcardService.createFlashcard(command, userId)

      // 🔍 Assert - created_at i updated_at powinny być identyczne przy tworzeniu
      const expectedTimestamp = mockDate.toISOString()
      expect(mockChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          created_at: expectedTimestamp,
          updated_at: expectedTimestamp
        })
      )
    })

    it('should always set is_deleted to false for new flashcards', async () => {
      // 🎯 Arrange
      const userId = 'user-deleted'
      const command: CreateFlashcardCommand = {
        question: 'Deletion test?',
        answer: 'Deletion answer'
      }

      mockSupabaseClient.auth.getSession = vi.fn().mockResolvedValue({
        data: { session: null },
        error: null
      })

      mockChain.single.mockResolvedValue({
        data: { id: 'test' },
        error: null
      })

      // 🚀 Act
      await flashcardService.createFlashcard(command, userId)

      // 🔍 Assert
      expect(mockChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          is_deleted: false
        })
      )
    })
  })

  // 🔤 INPUT VALIDATION - Walidacja danych wejściowych
  describe('🔤 Input Validation', () => {
    it('should handle empty strings in command fields', async () => {
      // 🎯 Arrange
      const userId = 'user-empty'
      const command: CreateFlashcardCommand = {
        question: '', // pusty string
        answer: '', // pusty string
        sourceTextForAi: '' // pusty string
      }

      mockSupabaseClient.auth.getSession = vi.fn().mockResolvedValue({
        data: { session: null },
        error: null
      })

      mockChain.single.mockResolvedValue({
        data: { id: 'empty-test' },
        error: null
      })

      // 🚀 Act
      await flashcardService.createFlashcard(command, userId)

      // 🔍 Assert - Puste stringi powinny być przekazane jako są
      expect(mockChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          question: '',
          answer: '',
          source_text_for_ai: '' // nie null, bo podano pusty string
        })
      )
    })

    it('should handle very long text content', async () => {
      // 🎯 Arrange
      const userId = 'user-long'
      const longText = 'A'.repeat(10000) // 10k znaków
      const command: CreateFlashcardCommand = {
        question: longText,
        answer: longText,
        sourceTextForAi: longText
      }

      mockSupabaseClient.auth.getSession = vi.fn().mockResolvedValue({
        data: { session: null },
        error: null
      })

      mockChain.single.mockResolvedValue({
        data: { id: 'long-test' },
        error: null
      })

      // 🚀 Act
      await flashcardService.createFlashcard(command, userId)

      // 🔍 Assert
      expect(mockChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          question: longText,
          answer: longText,
          source_text_for_ai: longText
        })
      )
    })

    it('should handle special characters and Unicode', async () => {
      // 🎯 Arrange
      const userId = 'user-unicode'
      const specialChars = '🚀 Test z emoji i Unicode: àáâãäåæçèéêë ñóôõö ùúûü'
      const command: CreateFlashcardCommand = {
        question: `${specialChars}?`,
        answer: `Odpowiedź z ${specialChars}`
      }

      mockSupabaseClient.auth.getSession = vi.fn().mockResolvedValue({
        data: { session: null },
        error: null
      })

      mockChain.single.mockResolvedValue({
        data: { id: 'unicode-test' },
        error: null
      })

      // 🚀 Act
      await flashcardService.createFlashcard(command, userId)

      // 🔍 Assert
      expect(mockChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          question: command.question,
          answer: command.answer
        })
      )
    })
  })

  // 🔄 SIDE EFFECTS - Efekty uboczne
  describe('🔄 Side Effects', () => {
    it('should call auth.getSession() for session logging', async () => {
      // 🎯 Arrange
      const userId = 'user-session'
      const command: CreateFlashcardCommand = {
        question: 'Session test?',
        answer: 'Session answer'
      }

      const mockSession = {
        user: { id: userId },
        access_token: 'token123'
      }

      mockSupabaseClient.auth.getSession = vi.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      mockChain.single.mockResolvedValue({
        data: { id: 'session-test' },
        error: null
      })

      // 🚀 Act
      await flashcardService.createFlashcard(command, userId)

      // 🔍 Assert - Sprawdzenie że session został pobrany
      expect(mockSupabaseClient.auth.getSession).toHaveBeenCalledOnce()
    })

    it('should handle session errors gracefully', async () => {
      // 🎯 Arrange
      const userId = 'user-session-error'
      const command: CreateFlashcardCommand = {
        question: 'Session error test?',
        answer: 'Session error answer'
      }

      // 🎭 Mock session error (nie powinno przerwać tworzenia fiszki)
      mockSupabaseClient.auth.getSession = vi.fn().mockResolvedValue({
        data: { session: null },
        error: { message: 'Session expired' }
      })

      mockChain.single.mockResolvedValue({
        data: { id: 'session-error-test' },
        error: null
      })

      // 🚀 Act & Assert - Nie powinno rzucić błędu
      await expect(flashcardService.createFlashcard(command, userId))
        .resolves.toEqual(expect.objectContaining({ id: 'session-error-test' }))
    })
  })

  // 📊 TYPE SAFETY - Bezpieczeństwo typów  
  describe('📊 Type Safety', () => {
    it('should return correct type structure', async () => {
      // 🎯 Arrange
      const userId = 'user-types'
      const command: CreateFlashcardCommand = {
        question: 'Type test?',
        answer: 'Type answer'
      }

      const mockFlashcard = {
        id: 'type-test-123',
        user_id: userId,
        question: command.question,
        answer: command.answer,
        is_ai_generated: false,
        source_text_for_ai: null,
        ai_accepted_at: null,
        is_deleted: false,
        created_at: mockDate.toISOString(),
        updated_at: mockDate.toISOString(),
      }

      mockSupabaseClient.auth.getSession = vi.fn().mockResolvedValue({
        data: { session: null },
        error: null
      })

      mockChain.single.mockResolvedValue({
        data: mockFlashcard,
        error: null
      })

      // 🚀 Act
      const result = await flashcardService.createFlashcard(command, userId)

      // 🔍 Assert - Sprawdzenie struktury zwracanego obiektu
      expect(result).toEqual({
        id: expect.any(String),
        user_id: expect.any(String),
        question: expect.any(String),
        answer: expect.any(String),
        is_ai_generated: expect.any(Boolean),
        source_text_for_ai: null,
        ai_accepted_at: null,
        is_deleted: expect.any(Boolean),
        created_at: expect.any(String),
        updated_at: expect.any(String),
      })

      // 🔍 TypeScript type assertion (sprawdzenie w czasie kompilacji)
      expectTypeOf(result).toMatchTypeOf<{
        id: string
        user_id: string
        question: string
        answer: string
        is_ai_generated: boolean
        source_text_for_ai: string | null
        ai_accepted_at: string | null
        is_deleted: boolean
        created_at: string
        updated_at: string
      }>()
    })
  })

  // 🎭 MOCK VERIFICATION - Weryfikacja mocków
  describe('🎭 Mock Verification', () => {
    it('should call Supabase methods in correct order', async () => {
      // 🎯 Arrange
      const userId = 'user-order'
      const command: CreateFlashcardCommand = {
        question: 'Order test?',
        answer: 'Order answer'
      }

      mockSupabaseClient.auth.getSession = vi.fn().mockResolvedValue({
        data: { session: null },
        error: null
      })

      mockChain.single.mockResolvedValue({
        data: { id: 'order-test' },
        error: null
      })

      // 🚀 Act
      await flashcardService.createFlashcard(command, userId)

      // 🔍 Assert - Sprawdzenie kolejności wywołań
      expect(mockSupabaseClient.auth.getSession).toHaveBeenCalledBefore(
        mockSupabaseClient.from as any
      )
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('flashcards')
      expect(mockChain.insert).toHaveBeenCalledBefore(mockChain.select as any)
      expect(mockChain.select).toHaveBeenCalledBefore(mockChain.single as any)
    })

    it('should not call select().single() if insert fails', async () => {
      // 🎯 Arrange
      const userId = 'user-fail'
      const command: CreateFlashcardCommand = {
        question: 'Fail test?',
        answer: 'Fail answer'
      }

      mockSupabaseClient.auth.getSession = vi.fn().mockResolvedValue({
        data: { session: null },
        error: null
      })

      // 🎭 Mock insert failure
      mockChain.insert.mockImplementation(() => {
        throw new Error('Insert failed')
      })

      // 🚀 Act & Assert
      await expect(flashcardService.createFlashcard(command, userId))
        .rejects.toThrow('Insert failed')

      // 🔍 Assert - select() i single() nie powinny być wywołane
      expect(mockChain.select).not.toHaveBeenCalled()
      expect(mockChain.single).not.toHaveBeenCalled()
    })
  })
}) 