# 🧪 Testy Jednostkowe dla FlashcardService

## 📁 Struktura Testów

```
__tests__/
├── flashcardService.createFlashcard.test.ts   # Testy dla metody createFlashcard
├── flashcardService.getUserFlashcards.test.ts # Testy dla metody getUserFlashcards
├── vitest.setup.ts                            # Konfiguracja globalna testów
└── README.md                                  # Ta dokumentacja
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

## 🎯 Zakres Testów dla `getUserFlashcards()`

### ✅ **Walidacja Parametrów (4 testy)**
- ✅ Rzuca błąd dla pustego userId
- ✅ Rzuca błąd dla userId z białymi znakami
- ✅ Rzuca błąd dla null/undefined userId
- ✅ Akceptuje poprawny userId

### 🔍 **Filtrowanie Wyszukiwania (5 testów)**
- 🔍 Brak filtra dla null/pustego search
- 🔍 Brak filtra dla białych znaków
- 🔍 Escapowanie znaków specjalnych (%, _, \)
- 🔍 Przycinanie białych znaków

### 🤖 **Filtrowanie AI-Generated (4 testy)**
- 🤖 Brak filtra dla undefined/null
- 🤖 Filtrowanie fiszek AI (true/false)

### 📈 **Sortowanie (5 testów)**
- 📈 Domyślne sortowanie (created_at desc)
- 📈 Sortowanie po różnych kolumnach
- 📈 Fallback dla nieprawidłowego sortBy

### 📄 **Paginacja (4 testy)**
- 📄 Domyślne wartości (strona 1, limit 10)
- 📄 Obliczanie offsetów dla różnych stron
- 📄 Obsługa null values

### 🔄 **Mapowanie Danych (1 test)**
- 🔄 Transformacja database → DTO format

### 📊 **Szczegóły Paginacji (4 testy)**
- 📊 Obliczanie totalPages, currentPage
- 📊 Obsługa pustych wyników
- 📊 Obsługa null count

### ⚠️ **Przypadki Brzegowe (3 testy)**
- ⚠️ Strony poza zakresem
- ⚠️ Ostrzeżenia w logach
- ⚠️ Walidacja zakresu stron

### 🚨 **Obsługa Błędów Supabase (5 testów)**
- 🚨 Błędy PGRST116, PGRST301
- 🚨 Nieznane błędy Supabase
- 🚨 Logowanie błędów
- 🚨 Obsługa null data

### 💥 **Błędy Generyczne (3 testy)**
- 💥 JavaScript Error objects
- 💥 Nieoczekiwane błędy
- 💥 Logowanie w catch block

### 🎯 **Scenariusze Integracyjne (3 testy)**
- 🎯 Złożone filtrowanie + sortowanie + paginacja
- 🎯 Brak wyników dla filtrów
- 🎯 Maksymalne limity stron

### 🔗 **Walidacja API Supabase (2 testy)**
- 🔗 Konstrukcja łańcucha zapytań
- 🔗 Minimalne vs pełne query

**RAZEM**: 43 testy jednostkowe dla getUserFlashcards

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

# Tylko testy getUserFlashcards
npm run test flashcardService.getUserFlashcards.test.ts

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

### **Przypadki testowe dla createFlashcard():**
- ✅ **Happy paths**: 3 scenariusze
- ❌ **Error cases**: 3 scenariusze  
- 🎯 **Business rules**: 3 scenariusze
- 🔤 **Input validation**: 3 scenariusze
- 🔄 **Side effects**: 2 scenariusze
- 📊 **Type safety**: 1 scenariusz
- 🎭 **Mock verification**: 2 scenariusze

**RAZEM**: 17 testów jednostkowych

### **Przypadki testowe dla getUserFlashcards():**
- ✅ **Walidacja**: 4 scenariusze
- 🔍 **Filtrowanie**: 9 scenariuszy (search + AI)
- 📈 **Sortowanie**: 5 scenariuszy
- 📄 **Paginacja**: 8 scenariuszy
- 🔄 **Mapowanie**: 1 scenariusz
- ⚠️ **Przypadki brzegowe**: 3 scenariusze
- 🚨 **Obsługa błędów**: 8 scenariuszy
- 🎯 **Integracja**: 3 scenariusze
- 🔗 **API validation**: 2 scenariusze

**RAZEM**: 43 testy jednostkowe

### **Metryki pokrycia**:
- **Lines**: 100% (wszystkie linie kodu metod)
- **Branches**: 100% (wszystkie ścieżki if/else)
- **Functions**: 100% (wszystkie testowane metody)
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

### **5. Factory Patterns dla Data**
```typescript
// ✅ Reuzywalne factory functions dla mock data
const createMockFlashcardData = (overrides = {}) => ({
  id: 'default-id',
  question: 'Default question',
  // ... default values
  ...overrides, // Pozwala na override specific fields
})
```

## 🔗 **Powiązane Pliki**

- `../flashcardService.ts` - Implementacja serwisu
- `../../../types.ts` - Definicje typów
- `../../../test/test-utils.tsx` - Utilities do testów komponentów
- `vitest.config.ts` - Konfiguracja Vitest (root)

## 📈 **Następne Kroki**

1. **Dodaj testy dla pozostałych metod**:
   - `updateFlashcard()` - walidacja autoryzacji
   - `softDeleteFlashcard()` - logika soft delete
   - `getFlashcardById()` - pobieranie pojedynczej fiszki

2. **Dodaj testy integracyjne**:
   - Testy E2E z prawdziwą bazą danych
   - Testy API endpoints

3. **Performance testing**:
   - Testy dla dużych ilości danych
   - Memory leaks w long-running operations

4. **Cross-service testing**:
   - Interakcje między FlashcardService i AI service
   - Testy workflow dla całego procesu tworzenia fiszek 