# 🧪 Testy Jednostkowe dla FlashcardService

## 📁 Struktura Testów

```
__tests__/
├── flashcardService.createFlashcard.test.ts  # Testy dla metody createFlashcard
├── vitest.setup.ts                           # Konfiguracja globalna testów
└── README.md                                 # Ta dokumentacja
```

## 🎯 Zakres Testów dla `createFlashcard()`

### ✅ **Happy Path (Scenariusze Sukcesu)**
- ✅ Tworzenie fiszki manualnej 
- ✅ Tworzenie fiszki wygenerowanej przez AI z tekstem źródłowym
- ✅ Obsługa undefined dla opcjonalnych pól (isAiGenerated, sourceTextForAi)

### ❌ **Error Handling (Obsługa Błędów)**
- ❌ Błędy bazy danych Supabase (duplicate key, constraints)
- ❌ Brak danych zwróconych pomimo braku błędu (edge case)
- ❌ Błędy sieciowe/połączenia

### 🎯 **Business Logic (Reguły Biznesowe)**
- 🎯 `ai_accepted_at` ustawiane tylko dla fiszek AI-generated
- 🎯 Konsystentne timestampy dla `created_at` i `updated_at`
- 🎯 Domyślna wartość `is_deleted = false` dla nowych fiszek

### 🔤 **Input Validation (Walidacja Wejścia)**
- 🔤 Puste stringi w polach command
- 🔤 Bardzo długie teksty (10k+ znaków)
- 🔤 Znaki specjalne i Unicode (emoji, diakrytyki)

### 🔄 **Side Effects (Efekty Uboczne)**
- 🔄 Wywołanie `auth.getSession()` do logowania
- 🔄 Graceful handling błędów sesji

### 📊 **Type Safety (Bezpieczeństwo Typów)**
- 📊 Struktura zwracanego obiektu
- 📊 TypeScript type assertions z `expectTypeOf()`

### 🎭 **Mock Verification (Weryfikacja Mocków)**
- 🎭 Kolejność wywołań metod Supabase
- 🎭 Warunki, gdy niektóre metody nie powinny być wywołane

## 🛠️ **Konfiguracja Testów**

### 🏭 **Mock Factory Patterns**
```typescript
// Mock na poziomie pliku z factory pattern
const mockSupabaseClient = {
  auth: { getSession: vi.fn() },
  from: vi.fn(() => ({
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(), 
    single: vi.fn(),
  })),
} as unknown as SupabaseClient
```

### 📅 **Deterministyczne Timestampy**
```typescript
const mockDate = new Date('2024-01-15T10:30:00.000Z')
vi.useFakeTimers()
vi.setSystemTime(mockDate)
```

### 🔧 **Custom Matchers**
```typescript
expect(result).toBeValidFlashcard() // Sprawdza strukturę flashcard
```

## 🚀 **Uruchamianie Testów**

```bash
# Wszystkie testy serwisów
npm run test src/lib/services

# Tylko testy createFlashcard
npm run test flashcardService.createFlashcard.test.ts

# Watch mode podczas development
npm run test:watch src/lib/services

# Coverage dla serwisów
npm run test:coverage src/lib/services
```

## 📋 **AAA Pattern (Arrange-Act-Assert)**

Każdy test stosuje jasną strukturę:

```typescript
it('should create flashcard successfully', async () => {
  // 🎯 Arrange - Przygotowanie danych i mocków
  const userId = 'user-123'
  const command = { question: 'Test?', answer: 'Test!' }
  mockChain.single.mockResolvedValue({ data: expectedResult })

  // 🚀 Act - Wykonanie testowanej akcji  
  const result = await flashcardService.createFlashcard(command, userId)

  // 🔍 Assert - Sprawdzenie wyników i wywołań
  expect(result).toEqual(expectedResult)
  expect(mockChain.insert).toHaveBeenCalledWith(expectedData)
})
```

## 🔍 **Pokrycie Testowe**

### **Przypadki testowe:**
- ✅ **Happy paths**: 3 scenariusze
- ❌ **Error cases**: 3 scenariusze  
- 🎯 **Business rules**: 3 scenariusze
- 🔤 **Input validation**: 3 scenariusze
- 🔄 **Side effects**: 2 scenariusze
- 📊 **Type safety**: 1 scenariusz
- 🎭 **Mock verification**: 2 scenariusze

**RAZEM**: 17 testów jednostkowych

### **Metryki pokrycia**:
- **Lines**: 100% (wszystkie linie kodu metody)
- **Branches**: 100% (wszystkie ścieżki if/else)
- **Functions**: 100% (cała metoda createFlashcard)
- **Statements**: 100% (wszystkie instrukcje)

## 🎯 **Najlepsze Praktyki**

### **1. Spies vs Mocks**
```typescript
// ✅ Użyj spies gdy chcesz tylko weryfikować wywołania
vi.spyOn(mockSupabaseClient.auth, 'getSession')

// ✅ Użyj mocków gdy chcesz kontrolować zachowanie
mockChain.single.mockResolvedValue({ data: result })
```

### **2. Deterministyczne Testy**
```typescript
// ✅ Zawsze używaj fake timers dla Date
vi.useFakeTimers()
vi.setSystemTime(mockDate)

// ✅ Resetuj mocki przed każdym testem
beforeEach(() => vi.clearAllMocks())
```

### **3. Opisowe Assertion Messages**
```typescript
// ✅ Używaj expect.objectContaining() dla partial matching
expect(mockChain.insert).toHaveBeenCalledWith(
  expect.objectContaining({
    is_ai_generated: true,
    ai_accepted_at: mockDate.toISOString(),
  })
)
```

### **4. Test Naming Convention**
```typescript
// ✅ Opisowe nazwy testów w formacie "should [action] when [condition]"
it('should set ai_accepted_at only for AI-generated flashcards', async () => {
  // test implementation
})
```

## 🔗 **Powiązane Pliki**

- `../flashcardService.ts` - Implementacja serwisu
- `../../../types.ts` - Definicje typów
- `../../../test/test-utils.tsx` - Utilities do testów komponentów
- `vitest.config.ts` - Konfiguracja Vitest (root)

## 📈 **Następne Kroki**

1. **Dodaj testy dla pozostałych metod**:
   - `getUserFlashcards()` - logika paginacji i filtrowania
   - `updateFlashcard()` - walidacja autoryzacji
   - `softDeleteFlashcard()` - logika soft delete

2. **Dodaj testy integracyjne**:
   - Testy E2E z prawdziwą bazą danych
   - Testy API endpoints

3. **Performance testing**:
   - Testy dla dużych ilości danych
   - Memory leaks w long-running operations 