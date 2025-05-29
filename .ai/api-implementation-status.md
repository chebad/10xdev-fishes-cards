# Status Implementacji API: POST /api/flashcards

## Przegląd

Endpoint `POST /api/flashcards` został pomyślnie zaimplementowany zgodnie z planem API. Poniżej znajduje się szczegółowy status implementacji oraz ewentualne rozbieżności od pierwotnego planu.

## ✅ Zaimplementowane komponenty

### 1. Typy DTO i Command Models

- **Lokalizacja:** `src/types.ts`
- **Status:** ✅ Kompletne
- **Typy:**
  - `CreateFlashcardCommand` - model żądania
  - `FlashcardDto` - model odpowiedzi

### 2. Schemat walidacji Zod

- **Lokalizacja:** `src/lib/validation/flashcardSchemas.ts`
- **Status:** ✅ Kompletne
- **Funkcjonalności:**
  - Walidacja minimalnych długości dla `question` (≥5) i `answer` (≥3)
  - Walidacja warunkowa dla `sourceTextForAi` gdy `isAiGenerated=true`
  - Obsługa wszystkich opcjonalnych pól

### 3. Serwis logiki biznesowej

- **Lokalizacja:** `src/lib/services/flashcardService.ts`
- **Status:** ✅ Kompletne z ulepszeniami
- **Funkcjonalności:**
  - Mapowanie `CreateFlashcardCommand` na format bazy danych
  - Warunkowe ustawienie `ai_accepted_at`
  - Obsługa błędów Supabase
  - Dodatkowe pola debugowania (dodane podczas testowania)

### 4. API Route Handler

- **Lokalizacja:** `src/pages/api/flashcards/index.ts`
- **Status:** ✅ Kompletne z ulepszeniami
- **Funkcjonalności:**
  - Uwierzytelnianie poprzez JWT token
  - Walidacja ciała żądania JSON
  - Walidacja danych za pomocą Zod
  - Mapowanie odpowiedzi na DTO
  - Kompleksowa obsługa błędów
  - Dodatkowe logi debugowania

### 5. Middleware uwierzytelniania

- **Lokalizacja:** `src/middleware/index.ts`
- **Status:** ✅ Kompletne (zaktualizowane)
- **Funkcjonalności:**
  - Weryfikacja JWT tokenów z nagłówka Authorization
  - Inicjalizacja klienta Supabase z tokenem użytkownika
  - Ustawienie sesji w `context.locals`
  - Obsługa żądań z tokenem i bez tokenu

## 📋 Zgodność z planem API

### Request Body

```json
{
  "question": "string (min 5 chars)", // ✅ Zaimplementowane
  "answer": "string (min 3 chars)",   // ✅ Zaimplementowane
  "isAiGenerated": "boolean (optional, default: false)", // ✅ Zaimplementowane
  "sourceTextForAi": "string (optional, required if isAiGenerated is true)" // ✅ Zaimplementowane
}
```

### Response Body (201 Created)

```json
{
  "id": "uuid",           // ✅ Zaimplementowane
  "userId": "uuid",       // ✅ Zaimplementowane
  "question": "string",   // ✅ Zaimplementowane
  "answer": "string",     // ✅ Zaimplementowane
  "sourceTextForAi": "string | null", // ✅ Zaimplementowane
  "isAiGenerated": "boolean",         // ✅ Zaimplementowane
  "aiAcceptedAt": "timestamp | null", // ✅ Zaimplementowane
  "createdAt": "timestamp",           // ✅ Zaimplementowane
  "updatedAt": "timestamp",           // ✅ Zaimplementowane
  "isDeleted": "boolean"              // ✅ Zaimplementowane
}
```

### Kody statusu HTTP

- `201 Created` - ✅ Zaimplementowane
- `400 Bad Request` - ✅ Zaimplementowane (walidacja JSON, walidacja Zod)
- `401 Unauthorized` - ✅ Zaimplementowane
- `500 Internal Server Error` - ✅ Zaimplementowane

## 🔧 Zmiany i ulepszenia względem pierwotnego planu

### 1. Middleware

- **Zmiana:** Użycie `createClient` z `@supabase/supabase-js` zamiast własnej funkcji
- **Powód:** Uproszczenie konfiguracji i lepsze wsparcie dla tokenów użytkownika

### 2. Debugowanie

- **Dodano:** Logi debugowania w handlerze API i serwisie
- **Lokalizacja:**
  - `src/pages/api/flashcards/index.ts` - logi userId i validatedData
  - `src/lib/services/flashcardService.ts` - logi sesji Supabase i szczegółowe błędy

### 3. Explicite ustawienie pól bazy danych

- **Dodano:** Ręczne ustawienie `is_deleted`, `created_at`, `updated_at` w serwisie
- **Powód:** Zapewnienie konsystentności danych niezależnie od domyślnych wartości DB

## 📋 Status testowania

- **Testy manualne:** ✅ Przeprowadzone z curl - endpoint działa poprawnie
- **Dokumentacja testów:** ✅ Utworzona (`.ai/api-tests.md`)
- **Testy automatyczne:** 📋 Do implementacji (przykłady dostępne w dokumentacji)

## 📚 Utworzona dokumentacja

1. **Plan implementacji:** `.ai/create-flashcards-implementation-plan.md`
2. **Dokumentacja testów:** `.ai/api-tests.md`
3. **Status implementacji:** `.ai/api-implementation-status.md` (ten dokument)

## 🚀 Gotowość do produkcji

Endpoint `POST /api/flashcards` jest gotowy do użycia produkcyjnego z następującymi zaleceniami:

### Przed wdrożeniem produkcyjnym

1. ✅ ~~Zdefiniować poprawne typy dla `Astro.locals` w `src/env.d.ts`~~ - ROZWIĄZANE
2. 📋 Usunąć logi debugowania z kodu produkcyjnego
3. 📋 Wdrożyć testy automatyczne
4. 📋 Skonfigurować monitoring i alerty dla błędów 5xx
5. 📋 Przegląd bezpieczeństwa (Rate limiting, CORS, itp.)

### Zalecenia operacyjne

1. Monitorowanie wydajności zapytań do bazy danych
2. Logowanie metryk biznesowych (liczba utworzonych fiszek, stosunek AI vs manual)
3. Regularne backupy bazy danych
4. Monitoring przestrzeni dyskowej (szczególnie dla pola `source_text_for_ai`)

## 📞 Kontakt w razie problemów

W przypadku problemów z endpointem, sprawdź:

1. Logi middleware (`src/middleware/index.ts`)
2. Logi handlera API (`src/pages/api/flashcards/index.ts`)
3. Logi serwisu (`src/lib/services/flashcardService.ts`)
4. Dokumentację testów (`.ai/api-tests.md`) dla przykładów użycia

---

# Status Implementacji API: GET /api/flashcards

## Przegląd

Endpoint `GET /api/flashcards` został pomyślnie zaimplementowany zgodnie z planem API. Poniżej znajduje się szczegółowy status implementacji oraz ewentualne rozbieżności od pierwotnego planu.

## ✅ Zaimplementowane komponenty

### 1. Typy DTO i Query Models

- **Lokalizacja:** `src/types.ts`
- **Status:** ✅ Kompletne
- **Typy:**
  - `GetFlashcardsQuery` - model parametrów zapytania (query parameters)
  - `FlashcardListItemDto` - model elementu listy w odpowiedzi
  - `PaginationDetails` - model szczegółów paginacji
  - `FlashcardsListDto` - model odpowiedzi (lista fiszek + paginacja)
  - `GetFlashcardsSortBy` - typ dla dozwolonych pól sortowania

### 2. Schemat walidacji Zod

- **Lokalizacja:** `src/lib/validation/flashcardSchemas.ts`
- **Status:** ✅ Kompletne
- **Funkcjonalności:**
  - Walidacja typów i wartości dla wszystkich parametrów zapytania (`page`, `limit`, `sortBy`, `sortOrder`, `search`, `isAiGenerated`)
  - Ustawienie wartości domyślnych dla opcjonalnych parametrów
  - Obsługa wartości `null` dla opcjonalnych parametrów
  - Konwersja typów (np. `string` na `number` lub `boolean`)

### 3. Serwis logiki biznesowej

- **Lokalizacja:** `src/lib/services/flashcardService.ts`
- **Status:** ✅ Kompletne z ulepszeniami
- **Funkcjonalności:**
  - Budowanie dynamicznego zapytania do Supabase na podstawie parametrów
  - Filtrowanie po `userId` (tylko własne fiszki) i `is_deleted = false` (RLS)
  - Wyszukiwanie tekstowe (ILIKE) w polu `question` (z escapowaniem znaków specjalnych)
  - Filtrowanie po `is_ai_generated`
  - Sortowanie (`createdAt`, `updatedAt`, `question`)
  - Paginacja (offset, limit)
  - Zliczanie całkowitej liczby pasujących elementów (`count: "exact"`)
  - Mapowanie wyników z bazy danych na `FlashcardListItemDto`
  - Obliczanie i zwracanie szczegółów paginacji
  - Obsługa błędów Supabase i edge cases (np. strona poza zakresem)

### 4. API Route Handler

- **Lokalizacja:** `src/pages/api/flashcards/index.ts`
- **Status:** ✅ Kompletne z ulepszeniami
- **Funkcjonalności:**
  - Uwierzytelnianie poprzez JWT token (Astro locals)
  - Odczytanie i parsowanie parametrów zapytania z URL
  - Walidacja parametrów zapytania za pomocą Zod (`GetFlashcardsQuerySchema`)
  - Wywołanie serwisu `flashcardService.getUserFlashcards`
  - Zwrócenie odpowiedzi `FlashcardsListDto`
  - Kompleksowa obsługa błędów i logowanie
  - Dodana dokumentacja JSDoc

### 5. Middleware uwierzytelniania

- **Lokalizacja:** `src/middleware/index.ts`
- **Status:** ✅ Kompletne (współdzielone z POST)
- **Funkcjonalności:** Zapewnia `session` i `supabase` w `context.locals`

### 6. Migracje Bazy Danych

- **Lokalizacja:**
  - `supabase/migrations/20241005123000_create_flashcards_and_contact_form_submissions.sql` (RLS, podstawowe indeksy)
  - `supabase/migrations/20250127140000_add_missing_flashcards_indexes.sql` (dodatkowe indeksy dla wydajności)
- **Status:** ✅ Kompletne
- **Funkcjonalności:**
  - Dodano indeksy na `updated_at`, `user_id+updated_at`, `user_id+created_at`
  - Włączono rozszerzenie `pg_trgm` i dodano indeks GIN na `question`
  - Dodano indeks na `user_id+is_ai_generated`

## 📋 Zgodność z planem API

### Query Parameters

- `page` (optional, integer, default: 1): ✅ Zaimplementowane
- `limit` (optional, integer, default: 10, max: 100): ✅ Zaimplementowane
- `sortBy` (optional, string, default: `createdAt`): ✅ Zaimplementowane (`createdAt`, `updatedAt`, `question`)
- `sortOrder` (optional, string, default: `desc`): ✅ Zaimplementowane (`asc`, `desc`)
- `search` (optional, string): ✅ Zaimplementowane (case-insensitive, partial match)
- `isAiGenerated` (optional, boolean): ✅ Zaimplementowane

### Response Body (200 OK)

```json
{
    "data": [
        {
            "id": "uuid",
            "userId": "uuid",
            "question": "string",
            "answer": "string",
            "isAiGenerated": "boolean",
            "aiAcceptedAt": "timestamp | null",
            "createdAt": "timestamp",
            "updatedAt": "timestamp"
        }
    ],
    "pagination": {
        "currentPage": 1,
        "totalPages": 5,
        "totalItems": 50,
        "limit": 10
    }
}
```

- **Status:** ✅ Zaimplementowane (zgodnie ze specyfikacją)

### Kody statusu HTTP

- `200 OK`: ✅ Zaimplementowane
- `400 Bad Request`: ✅ Zaimplementowane (walidacja parametrów zapytania)
- `401 Unauthorized`: ✅ Zaimplementowane
- `500 Internal Server Error`: ✅ Zaimplementowane

## 🔧 Zmiany i ulepszenia względem pierwotnego planu

- **Walidacja Zod:** Ulepszono schemę `GetFlashcardsQuerySchema` do obsługi `null` z `URL.searchParams.get()` i poprawnego stosowania wartości domyślnych.
- **Serwis:** Dodano escapowanie znaków specjalnych (`%`, `_`, `\`) w parametrze `search` dla zapytań ILIKE. Dodano obsługę błędu dla żądania strony poza zakresem.
- **Baza Danych:** Dodano migrację z nowymi indeksami w celu optymalizacji zapytań.
- **Typy:** Rozszerzono `GetFlashcardsQuery` o możliwość przyjmowania `null` dla wszystkich opcjonalnych parametrów, aby dopasować do logiki Zod i `URL.searchParams.get()`.

## 📋 Status testowania

- **Testy manualne:** ✅ Przeprowadzone z curl - endpoint działa poprawnie, w tym obsługa wartości domyślnych i przypadków brzegowych.
- **Dokumentacja testów:** ✅ Utworzona (`.ai/get-flashcards-test-scenarios.md`)
- **Testy automatyczne:** 📋 Do implementacji.

## 📚 Utworzona dokumentacja

1. **Plan implementacji:** `.ai/get-flashcards-implementation-plan.md`
2. **Dokumentacja testów:** `.ai/get-flashcards-test-scenarios.md`
3. **Status implementacji:** Zaktualizowano ten dokument (`.ai/api-implementation-status.md`)

## 🚀 Gotowość do produkcji

Endpoint `GET /api/flashcards` jest gotowy do użycia produkcyjnego z następującymi zaleceniami:

### Przed wdrożeniem produkcyjnym

1. 📋 Usunąć logi debugowania z kodu produkcyjnego (`console.log` w handlerze API i serwisie).
2. 📋 Wdrożyć testy automatyczne.
3. 📋 Skonfigurować monitoring i alerty dla błędów 5xx.
4. 📋 Przeprowadzić testy wydajnościowe pod obciążeniem.
5. 📋 Zastosować migrację `20250127140000_add_missing_flashcards_indexes.sql` na środowisku produkcyjnym.

### Zalecenia operacyjne

1. Monitorowanie wydajności zapytań do bazy danych, szczególnie tych z wieloma filtrami i sortowaniem.
2. Regularne backupy bazy danych.

## 📞 Kontakt w razie problemów

W przypadku problemów z endpointem, sprawdź:

1. Logi middleware (`src/middleware/index.ts`)
2. Logi handlera API (`src/pages/api/flashcards/index.ts`)
3. Logi serwisu (`src/lib/services/flashcardService.ts`)
4. Dokumentację testów (`.ai/get-flashcards-test-scenarios.md`) dla przykładów użycia

---

# Status Implementacji API: GET /api/flashcards/{flashcardId}

## Przegląd

Endpoint `GET /api/flashcards/{flashcardId}` został pomyślnie zaimplementowany zgodnie z planem API. Poniżej znajduje się szczegółowy status implementacji oraz ewentualne rozbieżności od pierwotnego planu.

## ✅ Zaimplementowane komponenty

### 1. Typy DTO

- **Lokalizacja:** `src/types.ts`
- **Status:** ✅ Kompletne (współdzielone z POST)
- **Typy:**
  - `FlashcardDto` - model odpowiedzi (używany również przez POST endpoint)

### 2. Schemat walidacji Zod

- **Lokalizacja:** `src/pages/api/flashcards/[flashcardId].ts`
- **Status:** ✅ Kompletne
- **Funkcjonalności:**
  - Walidacja UUID dla `flashcardId` parametru ścieżki
  - Użycie `z.string().uuid()` z customowym komunikatem błędu
  - Obsługa zarówno wielkich jak i małych liter w UUID

### 3. Serwis logiki biznesowej

- **Lokalizacja:** `src/lib/services/flashcardService.ts`
- **Status:** ✅ Kompletne z ulepszeniami
- **Funkcjonalności:**
  - Metoda `getFlashcardById(flashcardId: string, userId: string)`
  - Walidacja parametrów wejściowych
  - Wykorzystanie RLS policies dla automatycznej filtracji (user_id i is_deleted)
  - Optymalizowane zapytanie (bez redundantnych warunków WHERE)
  - Obsługa błędów Supabase z rozróżnieniem na "not found" vs "database error"
  - Szczegółowe logowanie dla debugowania

### 4. API Route Handler

- **Lokalizacja:** `src/pages/api/flashcards/[flashcardId].ts`
- **Status:** ✅ Kompletne z ulepszeniami
- **Funkcjonalności:**
  - Uwierzytelnianie poprzez JWT token (Astro locals)
  - Walidacja parametru `flashcardId` z URL params
  - Walidacja formatu UUID za pomocą Zod
  - Mapowanie wyniku z bazy danych na `FlashcardDto`
  - Kompleksowa obsługa błędów (401, 400, 404, 500)
  - Szczegółowe logowanie żądań
  - Zgodność z clean code practices (early returns, guard clauses)

### 5. Middleware uwierzytelniania

- **Lokalizacja:** `src/middleware/index.ts`
- **Status:** ✅ Kompletne (współdzielone z innymi endpointami)
- **Funkcjonalności:** Zapewnia `session` i `supabase` w `context.locals`

## 📋 Zgodność z planem API

### URL Pattern

- `GET /api/flashcards/{flashcardId}`: ✅ Zaimplementowane
- Dynamic routing w Astro: `[flashcardId].ts`: ✅ Zaimplementowane

### Path Parameters

- `flashcardId` (string, UUID format, required): ✅ Zaimplementowane z walidacją Zod

### Response Body (200 OK)

```json
{
  "id": "uuid",
  "userId": "uuid", 
  "question": "string",
  "answer": "string",
  "sourceTextForAi": "string | null",
  "isAiGenerated": "boolean",
  "aiAcceptedAt": "timestamp | null",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "isDeleted": "boolean"
}
```

- **Status:** ✅ Zaimplementowane (zgodnie ze specyfikacją)

### Kody statusu HTTP

- `200 OK`: ✅ Zaimplementowane
- `400 Bad Request`: ✅ Zaimplementowane (walidacja UUID)
- `401 Unauthorized`: ✅ Zaimplementowane
- `404 Not Found`: ✅ Zaimplementowane (fiszka nie istnieje, usunięta, lub należy do innego użytkownika)
- `500 Internal Server Error`: ✅ Zaimplementowane

## 🔧 Zmiany i ulepszenia względem pierwotnego planu

### 1. Optymalizacja zapytań do bazy danych

- **Zmiana:** Usunięto redundantną weryfikację `user_id` w zapytaniu SQL
- **Powód:** RLS policies automatycznie filtrują według `user_id = auth.uid()` i `is_deleted = false`
- **Korzyść:** Lepsza wydajność i uproszczenie kodu

### 2. Walidacja UUID

- **Dodano:** Kompleksową walidację UUID z Zod bezpośrednio w route handlerze
- **Korzyść:** Wczesne wykrywanie błędów i lepsze komunikaty dla użytkownika

### 3. Mapowanie błędów

- **Dodano:** Szczegółowe mapowanie błędów Supabase na odpowiednie kody HTTP
- **Przypadki:** PGRST116 (no rows) → 404, PGRST301 (connection) → 500
- **Korzyść:** Lepsze doświadczenie użytkownika i łatwiejsze debugowanie

### 4. Dokumentacja kodu

- **Dodano:** Szczegółowe komentarze JSDoc z przykładami użycia
- **Dodano:** Informacje o bezpieczeństwie i RLS policies
- **Dodano:** Przykłady curl w komentarzach

## 📋 Status testowania

- **Testy manualne:** ✅ Przeprowadzone z curl - wszystkie scenariusze działają poprawnie
- **Dokumentacja testów:** ✅ Utworzona (`.ai/get-single-flashcard-test-scenarios.md`)
- **Testy automatyczne:** 📋 Do implementacji (przykłady dostępne w dokumentacji)

### Przetestowane scenariusze

- ✅ Pobieranie istniejącej fiszki (200)
- ✅ Nieprawidłowy format UUID (400)
- ✅ Brak uwierzytelnienia (401)
- ✅ Nieistniejąca fiszka (404)
- ✅ Dostęp do fiszki innego użytkownika (404 - RLS policy)
- ✅ Błędy serwera (500)

## 📚 Utworzona dokumentacja

1. **Plan implementacji:** `.ai/get-single-flashcard-implementation-plan.md`
2. **Dokumentacja testów:** `.ai/get-single-flashcard-test-scenarios.md`
3. **Status implementacji:** Zaktualizowano ten dokument (`.ai/api-implementation-status.md`)

## 🚀 Gotowość do produkcji

Endpoint `GET /api/flashcards/{flashcardId}` jest gotowy do użycia produkcyjnego z następującymi zaleceniami:

### Przed wdrożeniem produkcyjnym

1. 📋 Usunąć logi debugowania z kodu produkcyjnego (`console.log` w handlerze API i serwisie)
2. 📋 Wdrożyć testy automatyczne
3. 📋 Skonfigurować monitoring i alerty dla błędów 5xx
4. 📋 Przeprowadzić testy wydajnościowe dla dużych ilości równoczesnych żądań
5. 📋 Przegląd bezpieczeństwa (rate limiting, dodatkowe walidacje)

### Zalecenia operacyjne

1. **Monitoring wydajności:** Szczególnie dla zapytań z różnymi UUID (optymalizacja indeksów)
2. **Logowanie metryk:** Częstotliwość dostępu do fiszek, popularne fiszki
3. **Cache'owanie:** Rozważyć cache dla często pobieranych fiszek
4. **Backup strategy:** Regularne backupy bazy danych

### Metryki do monitorowania

- Czas odpowiedzi endpointu
- Stosunek żądań 200:404:400:500
- Częstotliwość dostępu do różnych fiszek
- Błędy RLS policy (wskazujące na problemy z uprawnieniami)

## 🔒 Funkcje bezpieczeństwa

### Implementowane zabezpieczenia

1. **JWT Authentication:** ✅ Wymagane dla wszystkich żądań
2. **RLS Policies:** ✅ Automatyczna filtracja według user_id i is_deleted
3. **UUID Validation:** ✅ Zapobiega injection attacks
4. **Input Sanitization:** ✅ Walidacja wszystkich parametrów wejściowych
5. **Error Handling:** ✅ Nie wyciekają szczegóły wewnętrzne systemu

### Testy bezpieczeństwa

- ✅ Dostęp bez tokenu (401)
- ✅ Dostęp z nieprawidłowym tokenem (401)
- ✅ Próba dostępu do fiszek innych użytkowników (404)
- ✅ SQL injection poprzez UUID (zabezpieczone przez Zod)
- ✅ Dostęp do usuniętych fiszek (404)

## 📞 Kontakt w razie problemów

W przypadku problemów z endpointem, sprawdź:

1. **Logi middleware** (`src/middleware/index.ts`) - problemy z uwierzytelnianiem
2. **Logi handlera API** (`src/pages/api/flashcards/[flashcardId].ts`) - walidacja i żądania
3. **Logi serwisu** (`src/lib/services/flashcardService.ts`) - problemy z bazą danych
4. **Dokumentację testów** (`.ai/get-single-flashcard-test-scenarios.md`) - przykłady użycia
5. **RLS policies** w Supabase - uprawnienia dostępu

### Częste problemy i rozwiązania

| Problem | Możliwa przyczyna | Rozwiązanie |
|---------|-------------------|-------------|
| 401 Unauthorized | Brak/nieprawidłowy token | Sprawdź nagłówek Authorization |
| 400 Bad Request | Nieprawidłowy UUID | Sprawdź format flashcardId |
| 404 Not Found | Fiszka nie istnieje/nie należy do użytkownika | Sprawdź ownership i is_deleted |
| 500 Internal Server Error | Błąd bazy danych | Sprawdź logi serwisu i połączenie z Supabase |

### Sprawdzenie stanu fiszki przed aktualizacją

```bash
# Pobierz fiszkę przed aktualizacją
curl -X GET "http://localhost:3000/api/flashcards/{flashcardId}" \
  -H "Authorization: Bearer {token}"

# Wykonaj aktualizację
curl -X PATCH "http://localhost:3000/api/flashcards/{flashcardId}" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"question": "Nowe pytanie"}'

# Sprawdź czy updated_at się zmieniło
curl -X GET "http://localhost:3000/api/flashcards/{flashcardId}" \
  -H "Authorization: Bearer {token}"
```

---

# Status Implementacji API: PATCH /api/flashcards/{flashcardId}

## Przegląd

Endpoint `PATCH /api/flashcards/{flashcardId}` został pomyślnie zaimplementowany zgodnie z planem API. Poniżej znajduje się szczegółowy status implementacji oraz ewentualne rozbieżności od pierwotnego planu.

## ✅ Zaimplementowane komponenty

### 1. Typy DTO i Command Models

- **Lokalizacja:** `src/types.ts`
- **Status:** ✅ Kompletne (współdzielone z innymi endpointami)
- **Typy:**
  - `UpdateFlashcardCommand` - model żądania (Partial<Pick<TablesUpdate<"flashcards">, "question" | "answer">>)
  - `FlashcardDto` - model odpowiedzi (współdzielony z GET i POST)

### 2. Schematy walidacji Zod

- **Lokalizacja:** `src/lib/validation/flashcardSchemas.ts`
- **Status:** ✅ Kompletne
- **Funkcjonalności:**
  - `updateFlashcardPathParamsSchema` - walidacja UUID dla parametru ścieżki `flashcardId`
  - `updateFlashcardBodySchema` - walidacja ciała żądania z regułą minimum jednego pola
  - Walidacja minimalnych długości dla `question` (≥5) i `answer` (≥3)
  - Obsługa opcjonalnych pól z wymuszeniem obecności co najmniej jednego
  - Zgodność z regułami walidacji bazy danych (CHECK constraints)

### 3. Serwis logiki biznesowej

- **Lokalizacja:** `src/lib/services/flashcardService.ts`
- **Status:** ✅ Kompletne z ulepszeniami
- **Funkcjonalności:**
  - Metoda `updateFlashcard(userId: string, flashcardId: string, data: UpdateFlashcardCommand)`
  - Walidacja parametrów wejściowych na poziomie serwisu
  - Konstruowanie obiektu aktualizacji z tylko podanymi polami
  - Zapytanie UPDATE z warunkami: `id`, `user_id`, `is_deleted = false`
  - Wykorzystanie RLS policies dla dodatkowego bezpieczeństwa
  - Automatyczna aktualizacja `updated_at` przez trigger bazodanowy
  - Szczegółowa obsługa błędów Supabase (PGRST116, PGRST301, 23514)
  - Mapowanie wyniku na `Tables<"flashcards">`

### 4. API Route Handler

- **Lokalizacja:** `src/pages/api/flashcards/[flashcardId].ts`
- **Status:** ✅ Kompletne z ulepszeniami
- **Funkcjonalności:**
  - Uwierzytelnianie poprzez JWT token (Astro locals)
  - Walidacja parametru ścieżki `flashcardId` za pomocą `updateFlashcardPathParamsSchema`
  - Walidacja ciała żądania JSON za pomocą `updateFlashcardBodySchema`
  - Obsługa błędów parsowania JSON z dedykowanym komunikatem błędu
  - Wywołanie serwisu `flashcardService.updateFlashcard`
  - Mapowanie wyniku na `FlashcardDto` i zwracanie odpowiedzi
  - Kompleksowa obsługa błędów (400, 401, 404, 500)
  - Szczegółowe logowanie żądań i błędów
  - Dodana dokumentacja JSDoc z przykładami użycia

### 5. Middleware uwierzytelniania

- **Lokalizacja:** `src/middleware/index.ts`
- **Status:** ✅ Kompletne (współdzielone z innymi endpointami)
- **Funkcjonalności:** Zapewnia `session` i `supabase` w `context.locals`

## 📋 Zgodność z planem API

### URL Pattern

- `PATCH /api/flashcards/{flashcardId}`: ✅ Zaimplementowane
- Dynamic routing w Astro: `[flashcardId].ts`: ✅ Zaimplementowane (współdzielone z GET)

### Path Parameters

- `flashcardId` (string, UUID format, required): ✅ Zaimplementowane z walidacją Zod

### Request Body

```json
{
  "question": "string (min 5 chars, optional)",
  "answer": "string (min 3 chars, optional)"
}
```

- **Status:** ✅ Zaimplementowane z walidacją przynajmniej jednego pola

### Response Body (200 OK)

```json
{
  "id": "uuid",
  "userId": "uuid",
  "question": "string",
  "answer": "string",
  "sourceTextForAi": "string | null",
  "isAiGenerated": "boolean",
  "aiAcceptedAt": "timestamp | null",
  "createdAt": "timestamp",
  "updatedAt": "timestamp", // Automatycznie zaktualizowane
  "isDeleted": "boolean"
}
```

- **Status:** ✅ Zaimplementowane (zgodnie ze specyfikacją)

### Kody statusu HTTP

- `200 OK`: ✅ Zaimplementowane
- `400 Bad Request`: ✅ Zaimplementowane (walidacja UUID, walidacja ciała żądania, nieprawidłowy JSON)
- `401 Unauthorized`: ✅ Zaimplementowane
- `403 Forbidden`: ✅ Zaimplementowane (obsługiwane przez RLS policy → 404)
- `404 Not Found`: ✅ Zaimplementowane (fiszka nie istnieje, usunięta, lub należy do innego użytkownika)
- `500 Internal Server Error`: ✅ Zaimplementowane

## 🔧 Zmiany i ulepszenia względem pierwotnego planu

### 1. Schemat walidacji

- **Ulepszenie:** Zastosowano `.refine()` w Zod do wymagania przynajmniej jednego pola w aktualizacji
- **Korzyść:** Lepsze komunikaty błędów i bardziej precyzyjna walidacja

### 2. Mapowanie błędów RLS

- **Zmiana:** 403 Forbidden błędy są mapowane na 404 Not Found przez RLS policy
- **Powód:** RLS automatycznie ukrywa fiszki innych użytkowników, więc z perspektywy API wyglądają jak nieistniejące
- **Korzyść:** Bezpieczeństwo - nie ujawnia informacji o istnieniu fiszek innych użytkowników

### 3. Obsługa błędów bazodanowych

- **Dodano:** Szczegółowe mapowanie kodów błędów Supabase
- **Przypadki:** PGRST116 (no rows) → 404, PGRST301 (connection) → 500, 23514 (CHECK constraint) → 400
- **Korzyść:** Lepsze doświadczenie użytkownika i łatwiejsze debugowanie

### 4. Optymalizacja zapytań

- **Implementacja:** Konstrukcja obiektu aktualizacji z tylko podanymi polami
- **Korzyść:** Wydajność - aktualizowane są tylko rzeczywiście zmieniane kolumny

### 5. Trigger bazodanowy

- **Wykorzystanie:** Automatyczna aktualizacja `updated_at` przez trigger
- **Korzyść:** Spójność danych i redukcja kompleksności kodu aplikacji

## 📋 Status testowania

- **Testy manualne:** ✅ Przeprowadzone z curl - wszystkie scenariusze działają poprawnie
- **Dokumentacja testów:** ✅ Utworzona (`.ai/update-flashcard-test-scenarios.md`)
- **Testy automatyczne:** 📋 Do implementacji (przykłady dostępne w dokumentacji)

### Przetestowane scenariusze

- ✅ Aktualizacja tylko pytania (200)
- ✅ Aktualizacja tylko odpowiedzi (200)
- ✅ Aktualizacja obu pól (200)
- ✅ Puste ciało żądania (400)
- ✅ Za krótkie pytanie/odpowiedź (400)
- ✅ Nieprawidłowy format UUID (400)
- ✅ Nieprawidłowy JSON (400)
- ✅ Brak uwierzytelnienia (401)
- ✅ Nieistniejąca fiszka (404)
- ✅ Fiszka innego użytkownika (404 - RLS policy)
- ✅ Usuniętą fiszkę (404 - RLS policy)
- ✅ Zachowanie metadanych AI (`isAiGenerated`, `aiAcceptedAt`, `sourceTextForAi`)

## 📚 Utworzona dokumentacja

1. **Plan implementacji:** `.ai/update-flashcard-implementation-plan.md`
2. **Dokumentacja testów:** `.ai/update-flashcard-test-scenarios.md`
3. **Status implementacji:** Zaktualizowano ten dokument (`.ai/api-implementation-status.md`)

## 🚀 Gotowość do produkcji

Endpoint `PATCH /api/flashcards/{flashcardId}` jest gotowy do użycia produkcyjnego z następującymi zaleceniami:

### Przed wdrożeniem produkcyjnym

1. 📋 Usunąć logi debugowania z kodu produkcyjnego (`console.log` w handlerze API i serwisie)
2. 📋 Wdrożyć testy automatyczne
3. 📋 Skonfigurować monitoring i alerty dla błędów 5xx
4. 📋 Przeprowadzić testy wydajnościowe dla dużych ilości równoczesnych aktualizacji
5. 📋 Przegląd bezpieczeństwa (rate limiting, dodatkowe walidacje)
6. 📋 Zweryfikować poprawność działania triggerów bazodanowych na środowisku produkcyjnym

### Zalecenia operacyjne

1. **Monitoring wydajności:** Szczególnie dla zapytań UPDATE z różnymi warunkami WHERE
2. **Logowanie metryk:** Częstotliwość aktualizacji, popularne fiszki do edycji
3. **Audit trail:** Rozważyć logowanie historii zmian dla fiszek (poza zakresem MVP)
4. **Cache invalidation:** Jeśli implementowany jest cache, zapewnić jego unieważnienie po aktualizacji

### Metryki do monitorowania

- Czas odpowiedzi endpointu
- Stosunek żądań 200:400:404:500
- Częstotliwość aktualizacji różnych pól (`question` vs `answer` vs oba)
- Błędy RLS policy (wskazujące na problemy z uprawnieniami)
- Wydajność triggerów bazodanowych (`updated_at`)

## 🔒 Funkcje bezpieczeństwa

### Implementowane zabezpieczenia

1. **JWT Authentication:** ✅ Wymagane dla wszystkich żądań
2. **RLS Policies:** ✅ Automatyczna filtracja według user_id i is_deleted
3. **UUID Validation:** ✅ Zapobiega injection attacks
4. **Input Sanitization:** ✅ Walidacja wszystkich parametrów wejściowych
5. **Field Validation:** ✅ Ograniczenia długości zgodne z regułami biznesowymi
6. **Error Handling:** ✅ Nie wyciekają szczegóły wewnętrzne systemu
7. **Partial Updates:** ✅ Tylko określone pola mogą być aktualizowane

### Testy bezpieczeństwa

- ✅ Dostęp bez tokenu (401)
- ✅ Dostęp z nieprawidłowym tokenem (401)
- ✅ Próba aktualizacji fiszek innych użytkowników (404)
- ✅ SQL injection poprzez UUID (zabezpieczone przez Zod)
- ✅ Próba aktualizacji usuniętych fiszek (404)
- ✅ Próba ustawienia dodatkowych pól (ignorowane przez Zod)
- ✅ Próba obejścia walidacji długości (zabezpieczone przez CHECK constraints)

## 📞 Kontakt w razie problemów

W przypadku problemów z endpointem, sprawdź:

1. **Logi middleware** (`src/middleware/index.ts`) - problemy z uwierzytelnianiem
2. **Logi handlera API** (`src/pages/api/flashcards/[flashcardId].ts`) - walidacja i żądania
3. **Logi serwisu** (`src/lib/services/flashcardService.ts`) - problemy z bazą danych
4. **Dokumentację testów** (`.ai/update-flashcard-test-scenarios.md`) - przykłady użycia
5. **RLS policies** w Supabase - uprawnienia dostępu
6. **Triggery bazodanowe** - automatyczne aktualizacje `updated_at`

### Częste problemy i rozwiązania

| Problem | Możliwa przyczyna | Rozwiązanie |
|---------|-------------------|-------------|
| 401 Unauthorized | Brak/nieprawidłowy token | Sprawdź nagłówek Authorization |
| 400 Bad Request (UUID) | Nieprawidłowy UUID | Sprawdź format flashcardId |
| 400 Bad Request (Body) | Brak pól lub za krótkie | Sprawdź walidację question/answer |
| 400 Bad Request (JSON) | Nieprawidłowy JSON | Sprawdź składnię JSON |
| 404 Not Found | Fiszka nie istnieje/nie należy do użytkownika | Sprawdź ownership i is_deleted |
| 500 Internal Server Error | Błąd bazy danych/triggera | Sprawdź logi serwisu i połączenie z Supabase |

### Sprawdzenie stanu fiszki przed aktualizacją

```bash
# Pobierz fiszkę przed aktualizacją
curl -X GET "http://localhost:3000/api/flashcards/{flashcardId}" \
  -H "Authorization: Bearer {token}"

# Wykonaj aktualizację
curl -X PATCH "http://localhost:3000/api/flashcards/{flashcardId}" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"question": "Nowe pytanie"}'

# Sprawdź czy updated_at się zmieniło
curl -X GET "http://localhost:3000/api/flashcards/{flashcardId}" \
  -H "Authorization: Bearer {token}"
```

---

# Status Implementacji API: DELETE /api/flashcards/{flashcardId}

## Przegląd

Endpoint `DELETE /api/flashcards/{flashcardId}` został pomyślnie zaimplementowany. Realizuje on miękkie usuwanie fiszki poprzez ustawienie flagi `is_deleted` na `true` i zapisanie daty usunięcia w `deleted_at`. Endpoint nie usuwa fizycznie danych z bazy.

## ✅ Zaimplementowane komponenty

### 1. Typy DTO i Command Models

- **Lokalizacja:** `src/types.ts` (pośrednio, przez użycie `flashcardId`)
- **Status:** ✅ Kompletne
- **Typy:** Brak dedykowanych typów DTO dla żądania/odpowiedzi. Operacja modyfikuje istniejący zasób na podstawie identyfikatora.

### 2. Schemat walidacji Zod

- **Lokalizacja:** `src/lib/validation/flashcardSchemas.ts`
- **Status:** ✅ Kompletne
- **Nazwa Schematu:** `deleteFlashcardPathParamsSchema`
- **Funkcjonalności:**
  - Walidacja UUID dla parametru ścieżki `flashcardId`

### 3. Serwis logiki biznesowej

- **Lokalizacja:** `src/lib/services/flashcardService.ts`
- **Status:** ✅ Kompletne z ulepszeniami
- **Metoda:** `softDeleteFlashcard(userId: string, flashcardId: string)`
- **Funkcjonalności:**
  - Walidacja parametrów wejściowych (`userId`, `flashcardId`).
  - Wykonanie operacji UPDATE na tabeli `flashcards`, ustawiając `is_deleted = true` i `deleted_at = NOW()`.
  - Zapytanie zawiera warunki: `id = flashcardId`, `user_id = userId`, oraz `is_deleted = false` (aby zapobiec wielokrotnemu "usuwaniu" tej samej fiszki i zapewnić, że modyfikujemy tylko aktywne fiszki).
  - Wykorzystanie RLS (Row Level Security) w Supabase dla dodatkowego zabezpieczenia operacji na danych użytkownika.
  - Sprawdzenie, czy operacja `UPDATE` faktycznie zmodyfikowała jakiś wiersz. Jeśli nie (np. fiszka nie została znaleziona, należała do innego użytkownika, lub była już usunięta), serwis rzuca odpowiedni błąd.
  - Szczegółowa obsługa błędów Supabase (np. PGRST116 dla "no rows affected", co jest mapowane na błąd "Flashcard not found or already deleted").
  - Logowanie informacji o przebiegu operacji i ewentualnych błędach.

### 4. API Route Handler

- **Lokalizacja:** `src/pages/api/flashcards/[flashcardId].ts` (handler `DEL`)
- **Status:** ✅ Kompletne z ulepszeniami
- **Funkcjonalności:**
  - Uwierzytelnianie użytkownika za pomocą JWT tokenu pobieranego z `Astro.locals`.
  - Walidacja parametru ścieżki `flashcardId` przy użyciu `deleteFlashcardPathParamsSchema`.
  - Wywołanie metody `flashcardService.softDeleteFlashcard` z `userId` (z sesji) i `flashcardId`.
  - Zwrócenie kodu statusu `204 No Content` w przypadku pomyślnego miękkiego usunięcia fiszki.
  - Kompleksowa obsługa błędów:
    - `400 Bad Request` dla nieprawidłowego formatu `flashcardId`.
    - `401 Unauthorized` jeśli użytkownik nie jest uwierzytelniony.
    - `404 Not Found` jeśli fiszka nie została znaleziona, należy do innego użytkownika, lub była już wcześniej usunięta (obsługiwane przez błąd rzucony z serwisu).
    - `500 Internal Server Error` dla nieoczekiwanych błędów serwera lub bazy danych.
  - Szczegółowe logowanie żądań, walidacji i wyników operacji.

### 5. Middleware uwierzytelniania

- **Lokalizacja:** `src/middleware/index.ts`
- **Status:** ✅ Kompletne (współdzielone z innymi endpointami)
- **Funkcjonalności:** Zapewnia `session` (w tym `userId`) i klienta `supabase` w `context.locals`, niezbędne do uwierzytelniania i autoryzacji operacji.

## 📋 Zgodność z planem API

### URL Pattern

- `DELETE /api/flashcards/{flashcardId}`: ✅ Zaimplementowane
- Dynamic routing w Astro: `[flashcardId].ts` (handler `DEL`): ✅ Zaimplementowane

### Path Parameters

- `flashcardId` (string, UUID format, required): ✅ Zaimplementowane z walidacją Zod

### Request Body

- Brak: ✅ Zaimplementowane (operacja DELETE nie wymaga ciała żądania)

### Response Body (204 No Content)

- Brak ciała odpowiedzi: ✅ Zaimplementowane

### Kody statusu HTTP

- `204 No Content`: ✅ Zaimplementowane
- `400 Bad Request`: ✅ Zaimplementowane (głównie dla walidacji UUID `flashcardId`)
- `401 Unauthorized`: ✅ Zaimplementowane
- `403 Forbidden`: ✅ Zaimplementowane (efektywnie obsługiwane przez RLS i logikę serwisu, co skutkuje `404 Not Found`, aby nie ujawniać istnienia zasobu)
- `404 Not Found`: ✅ Zaimplementowane (fiszka nie istnieje, należy do innego użytkownika, lub została już wcześniej usunięta)
- `500 Internal Server Error`: ✅ Zaimplementowane

## 🔧 Zmiany i ulepszenia względem pierwotnego planu

- **Logika Serwisu:** Dodano w `flashcardService.softDeleteFlashcard` sprawdzanie, czy operacja UPDATE faktycznie zmodyfikowała wiersz. Jeśli `count` (liczba zmodyfikowanych wierszy) wynosi 0, rzucany jest błąd, który jest następnie mapowany na `404 Not Found` w handlerze API. To zapewnia, że klient otrzymuje informację zwrotną, jeśli próbuje usunąć nieistniejącą lub już usuniętą fiszkę.
- **Obsługa Błędów w Handlerze:** Ulepszono obsługę błędów w handlerze `DEL`, aby poprawnie interpretować błędy rzucane przez serwis (np. `FlashcardNotFoundError` lub `FlashcardAlreadyDeletedError` z serwisu są mapowane na HTTP 404).
- **Polityka RLS dla UPDATE:** Zaktualizowano politykę RLS dla operacji UPDATE na tabeli `flashcards`, aby umożliwić użytkownikom modyfikację (w tym miękkie usuwanie) własnych fiszek. Klauzula `USING` to `(auth.uid() = user_id)`, a `WITH CHECK` to `true` (lub bardziej szczegółowe, jeśli wymagane).

## 📋 Status testowania

- **Testy manualne:** ✅ Przeprowadzone z cURL - wszystkie kluczowe scenariusze (pomyślne usunięcie, próba usunięcia nieistniejącej/cudzej/już usuniętej fiszki, niepoprawny UUID, brak autoryzacji) działają poprawnie.
- **Dokumentacja testów:** ✅ Utworzona (`.ai/delete-flashcard-test-scenarios.md`)
- **Testy automatyczne:** 📋 Do implementacji.

## 📚 Utworzona dokumentacja

1. **Plan implementacji:** `.ai/delete-flashcard-implementation-plan.md`
2. **Dokumentacja testów:** `.ai/delete-flashcard-test-scenarios.md` (ten dokument)
3. **Status implementacji:** Zaktualizowano ten dokument (`.ai/api-implementation-status.md`)

## 🚀 Gotowość do produkcji

Endpoint `DELETE /api/flashcards/{flashcardId}` jest gotowy do użycia produkcyjnego z następującymi zaleceniami:

### Przed wdrożeniem produkcyjnym

1. 📋 Usunąć lub odpowiednio skonfigurować logi debugowania (`console.log`) z kodu produkcyjnego.
2. 📋 Wdrożyć kompleksowe testy automatyczne (jednostkowe, integracyjne, E2E).
3. 📋 Skonfigurować monitoring i alerty dla błędów 5xx oraz nietypowych wzorców użycia (np. masowe usuwanie).
4. 📋 Przeprowadzić przegląd bezpieczeństwa, w tym weryfikację polityk RLS i rate limiting.

### Zalecenia operacyjne

1. **Monitoring wydajności:** Monitorować czas odpowiedzi endpointu i wydajność zapytań UPDATE do bazy danych.
2. **Logowanie metryk:** Śledzić liczbę usuwanych fiszek, częstotliwość operacji DELETE.
3. **Strategia przywracania danych:** Chociaż jest to miękkie usuwanie, należy mieć strategię na wypadek potrzeby przywrócenia "usuniętych" danych lub analizy historii.
4. **Regularne backupy bazy danych:** Standardowa procedura.

### Metryki do monitorowania

- Czas odpowiedzi endpointu.
- Stosunek żądań HTTP: 204 vs 4xx vs 5xx.
- Liczba operacji miękkiego usuwania w jednostce czasu.
- Liczba błędów 404 (może wskazywać na próby dostępu do nieistniejących zasobów lub problemy z UI).

## 🔒 Funkcje bezpieczeństwa

### Implementowane zabezpieczenia

1. **JWT Authentication:** ✅ Wymagane dla wszystkich żądań; operacja DELETE jest dostępna tylko dla uwierzytelnionych użytkowników.
2. **RLS Policies (Row Level Security):** ✅ Polityki Supabase zapewniają, że użytkownik może modyfikować (w tym miękko usuwać) tylko własne fiszki. Warunek `user_id = auth.uid()` jest kluczowy.
3. **UUID Validation:** ✅ Parametr `flashcardId` jest walidowany jako UUID, co zapobiega prostym atakom typu path traversal czy injection przez ten parametr.
4. **Input Sanitization (pośrednio):** ✅ Walidacja UUID i użycie parametryzowanych zapytań przez klienta Supabase chroni przed SQL injection.
5. **Error Handling:** ✅ Endpoint zwraca generyczne komunikaty błędów (np. 404 zamiast szczegółów o błędzie RLS), aby nie ujawniać wewnętrznej logiki ani istnienia zasobów, do których użytkownik nie ma dostępu.
6. **Ochrona przed wielokrotnym usuwaniem:** ✅ Logika serwisu sprawdza `is_deleted = false` przed wykonaniem UPDATE, co zapobiega niepotrzebnym operacjom na już usuniętych fiszkach.

### Testy bezpieczeństwa (manualne)

- ✅ Dostęp bez tokenu (oczekiwany: 401 Unauthorized).
- ✅ Dostęp z nieprawidłowym/wygasłym tokenem (oczekiwany: 401 Unauthorized).
- ✅ Próba usunięcia fiszki innego użytkownika (oczekiwany: 404 Not Found).
- ✅ SQL injection poprzez `flashcardId` (zabezpieczone przez walidację UUID i ORM Supabase).
- ✅ Próba usunięcia już usuniętej fiszki (oczekiwany: 404 Not Found lub podobny błąd wskazujący na niemożność wykonania operacji).

## 📞 Kontakt w razie problemów

W przypadku problemów z endpointem, sprawdź:

1. **Logi middleware** (`src/middleware/index.ts`) - problemy z uwierzytelnianiem, inicjalizacją sesji.
2. **Logi handlera API** (`src/pages/api/flashcards/[flashcardId].ts`) - błędy walidacji `flashcardId`, błędy zwracane przez serwis.
3. **Logi serwisu** (`src/lib/services/flashcardService.ts`) - szczegóły operacji na bazie danych, błędy Supabase.
4. **Dokumentację testów** (`.ai/delete-flashcard-test-scenarios.md`) - przykłady użycia i oczekiwane zachowania.
5. **Polityki RLS** w panelu Supabase dla tabeli `flashcards` (szczególnie dla operacji UPDATE).
6. **Stan fiszki w bazie danych** (wartości `user_id`, `is_deleted`, `deleted_at`).

### Częste problemy i rozwiązania

| Problem                   | Możliwa przyczyna                                                                 | Rozwiązanie                                                                                                                               |
|---------------------------|-----------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| `401 Unauthorized`        | Brak/nieprawidłowy token JWT.                                                     | Sprawdź nagłówek `Authorization: Bearer {token}`. Upewnij się, że token jest aktualny i poprawny.                                         |
| `400 Bad Request`         | Nieprawidłowy format `flashcardId` (nie jest UUID).                               | Upewnij się, że `flashcardId` w URL jest poprawnym UUID.                                                                                    |
| `404 Not Found`           | Fiszka o podanym ID nie istnieje, należy do innego użytkownika, lub jest już usunięta. | Sprawdź poprawność `flashcardId`. Upewnij się, że fiszka istnieje i należy do zalogowanego użytkownika oraz nie została wcześniej usunięta. |
| `500 Internal Server Error` | Błąd bazy danych, problem z połączeniem Supabase, nieoczekiwany błąd w serwisie.   | Sprawdź logi serwera (API i serwis) oraz logi Supabase. Zweryfikuj połączenie z bazą danych i poprawność polityk RLS.                     |
