# API Endpoint Implementation Plan: Get Single Flashcard

## 1. Przegląd punktu końcowego

Celem tego punktu końcowego jest umożliwienie uwierzytelnionym użytkownikom pobierania pojedynczej fiszki na podstawie jej unikalnego identyfikatora (`flashcardId`). Użytkownik musi być właścicielem fiszki, a fiszka nie może być oznaczona jako usunięta.

## 2. Szczegóły żądania

- **Metoda HTTP:** `GET`
- **Struktura URL:** `/api/flashcards/{flashcardId}`
- **Parametry:**
  - **Wymagane:**
    - `flashcardId` (parametr ścieżki, typ: `uuid`): Identyfikator fiszki do pobrania.
  - **Opcjonalne:** Brak.
- **Request Body:** Brak (żądanie `GET`).

## 3. Wykorzystywane typy

- **DTO odpowiedzi:** `FlashcardDto` (zdefiniowany w `src/types.ts`)

  ```typescript
  export interface FlashcardDto {
    id: string; // uuid
    userId: string; // uuid
    question: string;
    answer: string;
    sourceTextForAi: string | null;
    isAiGenerated: boolean;
    aiAcceptedAt: string | null; // timestamp
    createdAt: string; // timestamp
    updatedAt: string; // timestamp
    isDeleted: boolean; // Zawsze false dla pomyślnej odpowiedzi
  }
  ```

- **Command Modele:** Brak.

## 4. Szczegóły odpowiedzi

- **Sukces (200 OK):**

  - **Opis:** Fiszka została pomyślnie pobrana.
  - **Ciało odpowiedzi (JSON):** Obiekt `FlashcardDto`.

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
      "isDeleted": false
    }
    ```

- **Błędy:**
  - `401 Unauthorized`: Użytkownik nie jest uwierzytelniony.
  - `403 Forbidden`: Użytkownik nie ma uprawnień do dostępu do tej fiszki (nie jest jej właścicielem).
  - `404 Not Found`: Fiszka o podanym ID nie istnieje lub została (miękko) usunięta.
  - `500 Internal Server Error`: Wystąpił nieoczekiwany błąd serwera.

## 5. Przepływ danych

1. Żądanie `GET` trafia do endpointu `/api/flashcards/{flashcardId}` w aplikacji Astro.
2. Middleware Astro weryfikuje uwierzytelnienie użytkownika (np. poprzez `context.locals.supabase` i `context.locals.user`). Jeśli użytkownik nie jest uwierzytelniony, zwracany jest błąd `401 Unauthorized`.
3. Handler endpointu (np. w `src/pages/api/flashcards/[flashcardId].ts`) odczytuje `flashcardId` z parametrów ścieżki.
4. Handler waliduje format `flashcardId` (powinien być to UUID). Astro może obsłużyć podstawową walidację formatu na poziomie routingu.
5. Handler wywołuje funkcję serwisową, np. `flashcardService.getFlashcardById(flashcardId, user.id, context.locals.supabase)`.
6. Funkcja serwisowa (`src/lib/services/flashcardService.ts`):
   a. Konstruuje zapytanie do bazy danych Supabase (tabela `flashcards`).
   b. Zapytanie powinno pobierać fiszkę o danym `id`, gdzie `user_id` pasuje do ID zalogowanego użytkownika i `is_deleted` jest `false`.
   c. Wykorzystuje klienta Supabase (`SupabaseClient`) przekazanego z `context.locals.supabase`.
7. Funkcja serwisowa analizuje wynik z bazy danych:
   a. Jeśli fiszka nie zostanie znaleziona (lub `is_deleted` jest `true`), serwis zwraca informację wskazującą na `404 Not Found`.
   b. Jeśli fiszka zostanie znaleziona, ale `user_id` nie pasuje (chociaż RLS powinien temu zapobiec na poziomie bazy, dodatkowa weryfikacja jest bezpieczna), serwis zwraca informację wskazującą na `403 Forbidden`.
   c. Jeśli fiszka zostanie pomyślnie znaleziona i należy do użytkownika, serwis mapuje dane z bazy na `FlashcardDto` i zwraca je.
8. Handler endpointu na podstawie odpowiedzi z serwisu:
   a. Jeśli otrzymał `FlashcardDto`, zwraca odpowiedź `200 OK` z DTO w ciele.
   b. Jeśli otrzymał informację o braku fiszki, zwraca `404 Not Found`.
   c. Jeśli otrzymał informację o braku uprawnień, zwraca `403 Forbidden`.
9. W przypadku nieoczekiwanych błędów w handlerze lub serwisie, globalny mechanizm obsługi błędów powinien przechwycić wyjątek i zwrócić `500 Internal Server Error`.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie:** Endpoint musi być chroniony i dostępny tylko dla uwierzytelnionych użytkowników. Realizowane przez middleware Astro i integrację z Supabase Auth. Używać `Astro.locals.user` i `Astro.locals.supabase`.
- **Autoryzacja:**

  - Użytkownik może pobrać tylko własne fiszki. Jest to realizowane przez warunek `user_id = auth.uid()` w zapytaniu SQL oraz przez zasady RLS (Row Level Security) w Supabase dla tabeli `flashcards`.
  - Polityka RLS `SELECT` dla `flashcards`:

    ```sql
        CREATE POLICY "Allow users to read their own non-deleted flashcards"
        ON flashcards
        FOR SELECT
        USING (auth.uid() = user_id AND is_deleted = FALSE);
    ```

- **Walidacja danych wejściowych:** `flashcardId` musi być walidowany jako poprawny UUID. Astro routing (np. `[id].ts` gdzie `id` jest sprawdzane regexem lub specjalnym matcherem dla UUID) może pomóc. W przeciwnym razie, endpoint powinien zwrócić `400 Bad Request` lub `404 Not Found`, jeśli format jest niepoprawny i nie pasuje do trasy.
- **Ochrona przed IDOR (Insecure Direct Object References):** Zapewniona przez sprawdzanie `user_id` w zapytaniu oraz przez RLS.
- **Dostęp do usuniętych danych:** Zapytanie musi jawnie filtrować `is_deleted = FALSE`. RLS również to zapewnia.

## 7. Obsługa błędów

- **`400 Bad Request`**: (Potencjalnie, jeśli `flashcardId` ma nieprawidłowy format i nie jest obsługiwane przez routing jako 404)
  - **Przyczyna:** Niepoprawny format `flashcardId`.
  - **Obsługa:** Zwrócić odpowiedź JSON z kodem błędu i komunikatem.
- **`401 Unauthorized`**:
  - **Przyczyna:** Użytkownik nie jest zalogowany lub token jest nieprawidłowy.
  - **Obsługa:** Zwrócić standardową odpowiedź błędu (często obsługiwane przez middleware).
- **`403 Forbidden`**:
  - **Przyczyna:** Użytkownik próbuje uzyskać dostęp do fiszki, której nie jest właścicielem.
  - **Obsługa:** Zwrócić odpowiedź JSON z kodem błędu i komunikatem.
- **`404 Not Found`**:
  - **Przyczyna:** Fiszka o podanym `flashcardId` nie istnieje, lub jest oznaczona jako `is_deleted = true`.
  - **Obsługa:** Zwrócić odpowiedź JSON z kodem błędu i komunikatem.
- **`500 Internal Server Error`**:
  - **Przyczyna:** Nieoczekiwany błąd serwera (np. błąd połączenia z bazą danych, nieprzechwycony wyjątek w kodzie).
  - **Obsługa:** Zarejestrować szczegóły błędu po stronie serwera. Zwrócić generyczną odpowiedź JSON z kodem błędu.

## 8. Rozważania dotyczące wydajności

- **Indeksy bazy danych:** Upewnić się, że istnieje indeks na kolumnie `id` (primary key) oraz złożony indeks na `(user_id, is_deleted)` w tabeli `flashcards` (zgodnie z `.ai/db-plan.md`: `idx_flashcards_user_id_is_deleted`).
  - `CREATE INDEX idx_flashcards_user_id_is_deleted ON flashcards(user_id, is_deleted);`
- **Rozmiar odpowiedzi:** Odpowiedź zawiera wszystkie pola `FlashcardDto`. Jeśli niektóre pola byłyby bardzo duże i nie zawsze potrzebne, można by rozważyć lżejszą wersję DTO, ale obecna specyfikacja wymaga pełnego obiektu.
- **Optymalizacja zapytań:** Zapytanie powinno być proste i efektywnie wykorzystywać indeksy (`SELECT * FROM flashcards WHERE id = $1 AND user_id = $2 AND is_deleted = FALSE`).

## 9. Etapy wdrożenia

1. **Utworzenie/Aktualizacja pliku routingu Astro:**
   - Utworzyć plik `src/pages/api/flashcards/[flashcardId].ts`.
   - Zdefiniować handler `GET` w tym pliku.
2. **Implementacja logiki handlera `GET`:**
   - Pobranie `flashcardId` z `Astro.params`.
   - Pobranie `user` i `supabase` z `Astro.locals`.
   - Obsługa przypadku braku uwierzytelnienia (zwrot `401 Unauthorized`).
   - Wywołanie odpowiedniej metody serwisu `flashcardService`.
   - Obsługa odpowiedzi z serwisu i zwracanie odpowiednich kodów statusu (`200 OK`, `403 Forbidden`, `404 Not Found`).
   - Implementacja globalnej obsługi błędów dla `500 Internal Server Error`.
3. **Utworzenie/Aktualizacja serwisu `flashcardService.ts`:**
   - Utworzyć plik `src/lib/services/flashcardService.ts` (jeśli nie istnieje).
   - Dodać metodę np. `async getFlashcardById(id: string, userId: string, supabase: SupabaseClient): Promise<FlashcardDto | null | 'forbidden'>` (lub rzucającą dedykowane błędy).
   - W metodzie:
     - Zbudować i wykonać zapytanie do Supabase, aby pobrać fiszkę (`id`, `user_id`, `is_deleted = false`).
     - Zmapować wynik na `FlashcardDto` lub zwrócić odpowiedni status/błąd.
4. **Walidacja `flashcardId`:**
   - Rozważyć użycie Zod do walidacji `flashcardId` jako UUID w handlerze, jeśli routing Astro tego nie zapewnia w wystarczającym stopniu.
5. **Dodanie typów:**
   - Upewnić się, że `FlashcardDto` w `src/types.ts` jest zgodny ze specyfikacją odpowiedzi.
6. **Testowanie:**
   - **Testy jednostkowe:** Dla logiki serwisu (mockowanie Supabase client).
   - **Testy integracyjne/E2E:**
     - Pomyślne pobranie fiszki (200 OK).
     - Próba pobrania nieistniejącej fiszki (404 Not Found).
     - Próba pobrania usuniętej fiszki (404 Not Found).
     - Próba pobrania fiszki bez uwierzytelnienia (401 Unauthorized).
     - Próba pobrania fiszki należącej do innego użytkownika (403 Forbidden).
     - Próba pobrania fiszki z niepoprawnym formatem `flashcardId` (oczekiwany odpowiedni błąd, np. 404 lub 400).
7. **Dokumentacja:**
   - Zaktualizować dokumentację API (np. Swagger/OpenAPI), jeśli jest używana.
8. **Przegląd kodu (Code Review):**
   - Upewnić się, że implementacja przestrzega zasad czystego kodu, bezpieczeństwa i wydajności.
   - Sprawdzić zgodność z wytycznymi projektu (Astro, Supabase, RLS, struktura projektu).
