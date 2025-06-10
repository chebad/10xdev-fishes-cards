# API Endpoint Implementation Plan: Aktualizacja Fiszki (Update Flashcard)

## 1. Przegląd punktu końcowego

Ten punkt końcowy API umożliwia użytkownikom aktualizację istniejącej fiszki na podstawie jej unikalnego identyfikatora (`flashcardId`). Użytkownik musi być uwierzytelniony i być właścicielem fiszki, aby móc ją zmodyfikować. Aktualizowane mogą być pola `question` i/lub `answer`.

## 2. Szczegóły żądania

- **Metoda HTTP:** `PATCH`
- **Struktura URL:** `/api/flashcards/{flashcardId}`
- **Parametry ścieżki:**
  - `flashcardId` (uuid, wymagany): Identyfikator fiszki do zaktualizowania.
- **Ciało żądania (Request Body):** JSON, z opcjonalnymi polami. Co najmniej jedno z pól (`question` lub `answer`) musi być obecne.

```json
{
  "question": "string (min 5 chars, optional)",
  "answer": "string (min 3 chars, optional)"
}
```

## 3. Wykorzystywane typy

- **Command Model (ciało żądania):** `UpdateFlashcardCommand` (z `src/types.ts`)

```typescript
export type UpdateFlashcardCommand = Partial<Pick<TablesUpdate<"flashcards">, "question" | "answer">>;
```

- **DTO (odpowiedź sukcesu):** `FlashcardDto` (z `src/types.ts`)

```typescript
export interface FlashcardDto {
  id: Tables<"flashcards">["id"];
  userId: Tables<"flashcards">["user_id"];
  question: Tables<"flashcards">["question"];
  answer: Tables<"flashcards">["answer"];
  sourceTextForAi: Tables<"flashcards">["source_text_for_ai"];
  isAiGenerated: Tables<"flashcards">["is_ai_generated"];
  aiAcceptedAt: Tables<"flashcards">["ai_accepted_at"];
  createdAt: Tables<"flashcards">["created_at"];
  updatedAt: Tables<"flashcards">["updated_at"];
  isDeleted: Tables<"flashcards">["is_deleted"];
}
```

- **Schemat walidacji Zod:**

```typescript
import { z } from "zod";

export const updateFlashcardPathParamsSchema = z.object({
  flashcardId: z.string().uuid({ message: "Invalid flashcard ID format." }),
});

export const updateFlashcardBodySchema = z
  .object({
    question: z.string().min(5, { message: "Question must be at least 5 characters long." }).optional(),
    answer: z.string().min(3, { message: "Answer must be at least 3 characters long." }).optional(),
  })
  .refine((data) => data.question !== undefined || data.answer !== undefined, {
    message: "At least one field (question or answer) must be provided for update.",
    path: [], // Apply error to the whole object if refinement fails
  });
```

## 4. Szczegóły odpowiedzi

- **Sukces (200 OK):** Zwraca zaktualizowany obiekt fiszki (`FlashcardDto`).

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
  "updatedAt": "timestamp", // Zaktualizowana wartość
  "isDeleted": "boolean" // Powinno być false
}
```

- **Błędy:**
  - `400 Bad Request`: Nieprawidłowe dane wejściowe (np. błędy walidacji Zod, `flashcardId` nie jest UUID, brak pól `question`/`answer`).
  - `401 Unauthorized`: Użytkownik nie jest uwierzytelniony (obsługiwane przez middleware).
  - `403 Forbidden`: Użytkownik jest uwierzytelniony, ale nie ma uprawnień do aktualizacji tej fiszki (nie jest jej właścicielem).
  - `404 Not Found`: Fiszka o podanym `flashcardId` nie istnieje lub nie należy do użytkownika (RLS może spowodować, że fiszka będzie niewidoczna).
  - `500 Internal Server Error`: Niespodziewany błąd serwera.

## 5. Przepływ danych

1. Żądanie `PATCH` trafia do punktu końcowego `/api/flashcards/[flashcardId].ts` w Astro.
2. Middleware Astro (`src/middleware/index.ts`) weryfikuje uwierzytelnienie użytkownika. Jeśli użytkownik nie jest uwierzytelniony, zwraca `401 Unauthorized`. Ustawia `context.locals.user` i `context.locals.supabase`.
3. Handler API (`PATCH` function w pliku Astro) pobiera `flashcardId` z parametrów ścieżki (`Astro.params`) oraz ciało żądania (`await Astro.request.json()`).
4. Walidacja `flashcardId` przy użyciu `updateFlashcardPathParamsSchema`. W przypadku błędu zwraca `400 Bad Request` ze szczegółami błędu.
5. Walidacja ciała żądania przy użyciu `updateFlashcardBodySchema`. W przypadku błędu zwraca `400 Bad Request` ze szczegółami błędu.
6. Wywołanie metody serwisu, np. `flashcardService.updateFlashcard(userId, flashcardId, validatedBody)`. `userId` jest pobierane z `context.locals.user.id`.
7. **Serwis `FlashcardService` (`src/lib/services/flashcard.service.ts`):**
   a. Używa klienta Supabase (`this.supabase` - wstrzykniętego lub przekazanego) do wykonania operacji `UPDATE` na tabeli `flashcards`.
   b. Zapytanie `UPDATE` powinno zawierać klauzulę `WHERE id = flashcardId AND user_id = userId AND is_deleted = FALSE`. Supabase RLS również wymusi te warunki.
   c. Pola do aktualizacji (`question`, `answer`) są przekazywane dynamicznie tylko jeśli zostały podane w żądaniu.
   d. Po wykonaniu `UPDATE`, zapytanie powinno zwrócić zaktualizowany wiersz (`.select().single()`).
   e. Jeśli `UPDATE` nie zwróci żadnego wiersza (lub zwróci błąd), oznacza to, że fiszka nie została znaleziona, nie należy do użytkownika, lub jest usunięta. W takim przypadku serwis zwraca odpowiedni błąd (np. `NotFoundError` lub `ForbiddenError`).
   f. Jeśli aktualizacja powiedzie się, serwis mapuje wynik z bazy danych na `FlashcardDto` i zwraca go. Trigger w bazie danych automatycznie zaktualizuje `updated_at`.
8. Handler API w Astro odbiera wynik z serwisu:
   a. Jeśli serwis zwrócił `FlashcardDto`, handler zwraca odpowiedź `200 OK` z tym DTO.
   b. Jeśli serwis zwrócił błąd (np. `NotFoundError`, `ForbiddenError`), handler mapuje go na odpowiedni kod statusu HTTP (`404 Not Found`, `403 Forbidden`) i zwraca odpowiedź błędu.
   c. W przypadku nieoczekiwanych błędów w serwisie lub handlerze, zwracany jest `500 Internal Server Error`.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie:** Zapewniane przez middleware Astro, który weryfikuje sesję użytkownika. Dostęp do punktu końcowego jest możliwy tylko dla uwierzytelnionych użytkowników.
- **Autoryzacja:**

  - Zapewniana przez Supabase Row Level Security (RLS) na tabeli `flashcards`. Polityka `UPDATE` pozwala na modyfikację tylko własnych, nieusuniętych fiszek:

    ```sql
    CREATE POLICY "Allow users to update their own non-deleted flashcards"
    ON flashcards
    FOR UPDATE
    USING (auth.uid() = user_id AND is_deleted = FALSE)
    WITH CHECK (auth.uid() = user_id AND is_deleted = FALSE);
    ```

  - Dodatkowo, warunek `user_id = userId` w zapytaniu `UPDATE` w serwisie zapewnia, że operacja dotyczy fiszki zalogowanego użytkownika.

- **Walidacja danych wejściowych:**
  - `flashcardId` jest walidowany jako UUID.
  - Ciało żądania jest walidowane (minimalna długość pól, obecność co najmniej jednego pola) przy użyciu Zod. Zapobiega to błędom bazy danych związanym z naruszeniem ograniczeń `CHECK` oraz niepoprawnym żądaniom.
- **Ochrona przed nadmiernym wykorzystaniem (Rate Limiting):** W zależności od potrzeb, można rozważyć implementację rate limiting na poziomie globalnym lub dla tego konkretnego endpointu. (Poza zakresem MVP tej implementacji).

## 7. Obsługa błędów

- **Błędy walidacji (400):** Zwracane z komunikatami z Zod.

```json
{
  "error": "Validation failed",
  "details": [
    { "path": ["question"], "message": "Question must be at least 5 characters long." }
    // lub { "path": [], "message": "At least one field (question or answer) must be provided for update." }
  ]
}
```

- **Brak uwierzytelnienia (401):** Standardowa odpowiedź z middleware.

```json
{ "error": "Unauthorized" }
```

- **Brak autoryzacji (403):** Gdy użytkownik próbuje modyfikować nie swoją fiszkę (a fiszka istnieje).

```json
{ "error": "Forbidden", "message": "You do not have permission to update this flashcard." }
```

- **Nie znaleziono zasobu (404):** Gdy fiszka o danym ID nie istnieje lub nie należy do użytkownika (i RLS ją ukrywa).

```json
{ "error": "Not Found", "message": "Flashcard not found." }
```

- **Błąd serwera (500):** W przypadku nieoczekiwanych problemów.

```json
{ "error": "Internal Server Error", "message": "An unexpected error occurred." }
```

- **Logowanie:** Błędy 500 powinny być szczegółowo logowane po stronie serwera. Błędy 4xx mogą być logowane w sposób mniej szczegółowy.

## 8. Rozważania dotyczące wydajności

- Zapytanie `UPDATE` do bazy danych jest kierowane na konkretny `id` (klucz główny) oraz `user_id`, co powinno być wydajne, zwłaszcza z odpowiednimi indeksami (`idx_flashcards_user_id`).
- Automatyczna aktualizacja `updated_at` przez trigger bazodanowy jest wydajna.
- Walidacja Zod jest szybka i nie powinna stanowić wąskiego gardła.
- Objętość przesyłanych danych jest mała.

## 9. Etapy wdrożenia

1. **Utworzenie/aktualizacja plików:**
   - Utwórz plik `src/pages/api/flashcards/[flashcardId].ts` (jeśli nie istnieje) lub dodaj do niego handler `PATCH`.
   - Upewnij się, że `src/middleware/index.ts` poprawnie obsługuje uwierzytelnianie i udostępnia `context.locals.user` oraz `context.locals.supabase`.
   - Jeśli serwis `FlashcardService` (`src/lib/services/flashcard.service.ts`) nie istnieje, utwórz go. W przeciwnym razie, dodaj do niego metodę `updateFlashcard`.
2. **Implementacja handlera API w `src/pages/api/flashcards/[flashcardId].ts`:**
   - Dodaj `export const prerender = false;`.
   - Zaimplementuj funkcję `PATCH({ params, request, locals }: APIContext)`:
     - Sprawdź `locals.user`. Jeśli brak, zwróć `401`.
     - Pobierz `flashcardId` z `params.flashcardId`.
     - Zwaliduj `flashcardId` używając `updateFlashcardPathParamsSchema`. W razie błędu, zwróć `400`.
     - Pobierz i zwaliduj ciało żądania (`await request.json()`) używając `updateFlashcardBodySchema`. W razie błędu, zwróć `400`.
     - Wywołaj `flashcardService.updateFlashcard(locals.user.id, flashcardId, validatedBody)`.
     - Obsłuż odpowiedź z serwisu (sukces lub błąd) i zwróć odpowiednią odpowiedź HTTP.
     - Zaimplementuj globalny `try...catch` do obsługi nieoczekiwanych błędów i zwracania `500`.
3. **Implementacja metody `updateFlashcard` w `FlashcardService`:**
   - Metoda powinna przyjmować `userId: string`, `flashcardId: string`, `data: UpdateFlashcardCommand`.
   - Skonstruuj obiekt `updateData` zawierający tylko te pola (`question`, `answer`), które są obecne w `data`.
   - Użyj `this.supabase.from('flashcards').update(updateData).eq('id', flashcardId).eq('user_id', userId).eq('is_deleted', false).select().single()`.
   - Jeśli `error` z Supabase, przeanalizuj go:
     - Jeśli błąd wskazuje na naruszenie RLS lub brak wiersza, rzuć `NotFoundError` lub `ForbiddenError`.
     - W przeciwnym razie, rzuć generyczny błąd serwera.
   - Jeśli `data` z Supabase jest `null` (a nie było błędu), również potraktuj jako `NotFoundError`.
   - Jeśli sukces, zmapuj zwrócone dane na `FlashcardDto` i zwróć.
4. **Typy i schematy Zod:**
   - Upewnij się, że typy `UpdateFlashcardCommand` i `FlashcardDto` w `src/types.ts` są zgodne.
   - Zdefiniuj schematy `updateFlashcardPathParamsSchema` i `updateFlashcardBodySchema` (np. w pliku z handlerem API lub w dedykowanym pliku ze schematami).
5. **Testowanie:**
   - Napisz testy jednostkowe dla logiki serwisu.
   - Napisz testy integracyjne/E2E dla punktu końcowego API, obejmujące:
     - Pomyślną aktualizację (zmieniając tylko `question`, tylko `answer`, oraz oba).
     - Próbę aktualizacji z pustym ciałem żądania (oczekiwany błąd 400).
     - Próbę aktualizacji z niepoprawnymi danymi (np. za krótkie `question`, oczekiwany błąd 400).
     - Próbę aktualizacji z niepoprawnym `flashcardId` (oczekiwany błąd 400).
     - Próbę aktualizacji nieistniejącej fiszki (oczekiwany błąd 404).
     - Próbę aktualizacji fiszki przez nieuwierzytelnionego użytkownika (oczekiwany błąd 401).
     - Próbę aktualizacji fiszki należącej do innego użytkownika (oczekiwany błąd 403 lub 404).
     - Próbę aktualizacji usuniętej fiszki (oczekiwany błąd 404).
6. **Dokumentacja:** Upewnij się, że specyfikacja API (np. w OpenAPI/Swagger, jeśli jest używana) jest zaktualizowana. Ten plan może służyć jako wewnętrzna dokumentacja techniczna.
