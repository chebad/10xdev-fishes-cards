# Plan Implementacji Punktu Końcowego API: Miękkie Usuwanie Fiszki (DELETE /api/flashcards/{flashcardId})

## 1. Przegląd Punktu Końcowego

Celem tego punktu końcowego jest umożliwienie uwierzytelnionym użytkownikom "miękkiego usunięcia" ich własnych fiszek. Operacja ta nie usuwa fizycznie rekordu z bazy danych, lecz oznacza go jako usunięty poprzez ustawienie flagi `is_deleted` na `true` oraz zapisanie znacznika czasu `deleted_at`.

## 2. Szczegóły Żądania

- **Metoda HTTP:** `DELETE`
- **Struktura URL:** `/api/flashcards/{flashcardId}`
- **Parametry Ścieżki:**
  - `flashcardId` (UUID, wymagany): Identyfikator fiszki, która ma zostać miękko usunięta.
- **Ciało Żądania (Request Body):** Brak.

## 3. Wykorzystywane Typy

- Parametr ścieżki `flashcardId` będzie walidowany jako `z.string().uuid()`.
- Do interakcji z bazą danych Supabase będą wykorzystywane typy generowane automatycznie, np. `Tables<"flashcards">` i `TablesUpdate<"flashcards">` z `src/db/database.types.ts`.
- Nie są wymagane dedykowane typy DTO ani Command Models dla tego punktu końcowego.

## 4. Szczegóły Odpowiedzi

- **Odpowiedź Sukcesu:**
  - Kod Statusu: `204 No Content`
  - Ciało Odpowiedzi: Puste.
- **Odpowiedzi Błędów:**

  - `400 Bad Request`: Jeśli `flashcardId` ma nieprawidłowy format.

        ```json
        {
          "error": "Invalid flashcard ID.",
          "details": { "flashcardId": ["Invalid uuid"] }
        }
        ```

  - `401 Unauthorized`: Jeśli użytkownik nie jest uwierzytelniony.

        ```json
        {
          "error": "User not authenticated."
        }
        ```

  - `403 Forbidden`: Jeśli użytkownik nie jest właścicielem fiszki.
    - Ciało Odpowiedzi: Puste lub ogólny komunikat błędu.
  - `404 Not Found`: Jeśli fiszka o podanym ID nie istnieje lub nie należy do użytkownika (i RLS blokuje dostęp), lub jeśli fiszka była już wcześniej usunięta.
    - Ciało Odpowiedzi: Puste lub ogólny komunikat błędu.
  - `500 Internal Server Error`: W przypadku nieoczekiwanych błędów serwera.

        ```json
        {
          "error": "Unexpected server error."
        }
        ```

## 5. Przepływ Danych

1. Żądanie `DELETE` dociera do punktu końcowego Astro (`src/pages/api/flashcards/[flashcardId].ts`).
2. Middleware Astro weryfikuje uwierzytelnienie użytkownika i udostępnia `user` oraz klienta `supabase` w `context.locals`.
3. Handler API (`DEL`) odczytuje `flashcardId` z parametrów ścieżki.
4. **Walidacja `flashcardId`**: Format `flashcardId` jest walidowany przy użyciu Zod. Jeśli niepoprawny, zwracany jest błąd `400`.
5. **Sprawdzenie uwierzytelnienia**: Handler sprawdza, czy `context.locals.user` istnieje. Jeśli nie, zwracany jest błąd `401`.
6. Handler wywołuje metodę serwisu `FlashcardService.softDeleteFlashcard(supabase, userId, flashcardId)`.
7. **Logika Serwisu (`FlashcardService`):**
   a. Pobiera fiszkę z bazy danych używając `supabase.from('flashcards').select('user_id, is_deleted').eq('id', flashcardId).single()`.
   b. **Obsługa nieznalezienia/braku dostępu**: Jeśli zapytanie zwróci błąd (np. PGRST116 z Supabase dla `single()` gdy RLS blokuje lub rekord nie istnieje), serwis interpretuje to jako `404 Not Found`.
   c. **Weryfikacja właściciela**: Porównuje `flashcard.user_id` z `userId` (ID zalogowanego użytkownika). Jeśli nie pasują, zwraca błąd prowadzący do odpowiedzi `403 Forbidden`.
   d. **Sprawdzenie, czy już usunięta**: Jeśli `flashcard.is_deleted` jest `true`, operacja jest uznawana za idempotentną i serwis zwraca sukces (co prowadzi do odpowiedzi `204 No Content`).
   e. **Aktualizacja rekordu**: Wykonuje `UPDATE` na tabeli `flashcards`, ustawiając `is_deleted = true` i `deleted_at = new Date().toISOString()` dla danego `flashcardId` i `user_id`.
   f. Jeśli aktualizacja w bazie danych nie powiedzie się, serwis zwraca błąd prowadzący do odpowiedzi `500 Internal Server Error`.
   g. Jeśli aktualizacja powiedzie się, serwis zwraca sukces.
8. Handler API na podstawie wyniku z serwisu zwraca odpowiedni kod statusu (`204`, `403`, `404`, `500`).

## 6. Względy Bezpieczeństwa

- **Uwierzytelnianie:** Zapewniane przez middleware Astro; punkt końcowy musi sprawdzać istnienie `context.locals.user`.
- **Autoryzacja:**

  - Na poziomie aplikacji: `FlashcardService` musi jawnie weryfikować, czy `auth.uid()` (ID zalogowanego użytkownika) jest równe `user_id` fiszki przed wykonaniem operacji.
  - Na poziomie bazy danych: Zasady Row Level Security (RLS) dla tabeli `flashcards` muszą być skonfigurowane tak, aby użytkownik mógł modyfikować (w tym przypadku `UPDATE`) własne, jeszcze nieusunięte fiszki. Odpowiednia polityka RLS (`Allow users to soft-delete their own flashcards`) powinna wyglądać mniej więcej tak:

        ```sql
        CREATE POLICY "Allow users to soft-delete their own flashcards"
        ON flashcards
        FOR UPDATE -- Miękkie usuwanie to operacja UPDATE
        USING (auth.uid() = user_id AND is_deleted = FALSE) -- Użytkownik może "widzieć" do aktualizacji tylko swoje nieusunięte fiszki
        WITH CHECK (auth.uid() = user_id); -- Użytkownik nie może zmienić user_id ani przypisać operacji komuś innemu
        ```

- **Walidacja Danych Wejściowych:** `flashcardId` musi być walidowany jako UUID przy użyciu Zod, aby zapobiec błędom i potencjalnym atakom.
- **Ochrona przed IDOR:** Ścisła weryfikacja własności zasobu jest kluczowa.

## 7. Rozważania dotyczące Wydajności

- Operacja dotyczy pojedynczego rekordu i jest oparta o klucz główny (`id`) oraz indeksowany `user_id`, co powinno zapewnić dobrą wydajność.
- Zapytanie `SELECT` przed `UPDATE` dodaje minimalny narzut, ale jest konieczne dla weryfikacji właściciela i statusu `is_deleted`.
- Indeksy na `flashcards(id)` (automatycznie dla PK), `flashcards(user_id)` oraz `flashcards(user_id, is_deleted)` są istotne dla wydajności zapytań i działania RLS.

## 8. Etapy Wdrożenia

1. **Konfiguracja RLS w Supabase (jeśli jeszcze nie istnieje lub wymaga modyfikacji):**

   - Upewnić się, że polityka RLS dla tabeli `flashcards` zezwala użytkownikom na aktualizację (`UPDATE`) własnych, nieusuniętych (`is_deleted = FALSE`) fiszek w celu ustawienia `is_deleted = TRUE` i `deleted_at`.

2. **Utworzenie/aktualizacja `FlashcardService` (`src/lib/services/flashcardService.ts`):**

   - Zaimplementować metodę `async softDeleteFlashcard(supabase: SupabaseClient, userId: string, flashcardId: string): Promise<{ error: ServiceError | null }>`:
     - Pobranie fiszki (ID, user_id, is_deleted).
     - Obsługa przypadku, gdy fiszka nie istnieje (zwróć błąd typu `NotFound`).
     - Weryfikacja, czy `userId` pasuje do `flashcard.user_id` (jeśli nie, zwróć błąd typu `Forbidden`).
     - Sprawdzenie, czy fiszka jest już `is_deleted` (jeśli tak, zwróć sukces – idempotencja).
     - Wykonanie operacji `UPDATE` w Supabase: `supabase.from('flashcards').update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq('id', flashcardId).eq('user_id', userId)`.
     - Obsługa błędów z Supabase (zwróć błąd typu `DatabaseError`).
     - Zwrócenie wyniku operacji.

3. **Implementacja Handlera API Astro (`src/pages/api/flashcards/[flashcardId].ts`):**

   - Utworzyć plik, jeśli nie istnieje.
   - Dodać `export const prerender = false;`.
   - Zaimplementować funkcję `export const DEL: APIRoute = async ({ params, locals }) => { ... }`.
   - Pobrać `user` i `supabase` z `locals`. Sprawdzić, czy `user` istnieje (jeśli nie, zwrócić `401`).
   - Zwalidować `params.flashcardId` przy użyciu Zod (schemat `z.object({ flashcardId: z.string().uuid() })`). W przypadku błędu walidacji zwrócić `400`.
   - Wywołać `flashcardService.softDeleteFlashcard(...)`.
   - Na podstawie wyniku z serwisu, zwrócić odpowiedni kod statusu:
     - Sukces: `204 No Content`.
     - Błąd `NotFound` z serwisu: `404 Not Found`.
     - Błąd `Forbidden` z serwisu: `403 Forbidden`.
     - Inne błędy serwisu (np. `DatabaseError`): `500 Internal Server Error`.
   - Dodać obsługę nieoczekiwanych wyjątków (`try...catch`) i zwrócić `500`.

4. **Testowanie:**

   - **Testy jednostkowe** dla logiki w `FlashcardService` (mockując klienta Supabase).
   - **Testy integracyjne/E2E** dla punktu końcowego API:
     - Przypadek sukcesu (prawidłowy `flashcardId`, użytkownik jest właścicielem, fiszka nieusunięta).
     - Niepoprawny format `flashcardId` (`400`).
     - Brak uwierzytelnienia (`401`).
     - Użytkownik nie jest właścicielem fiszki (`403`).
     - Fiszka nie istnieje (`404`).
     - Fiszka już jest usunięta (oczekiwane `204`).
     - Symulacja błędu bazy danych (`500`).

5. **Dokumentacja (jeśli dotyczy):**
   - Zaktualizować dokumentację API (np. Swagger/OpenAPI), jeśli jest prowadzona oddzielnie. Specyfikacja w tym zadaniu jest już dostarczona.
