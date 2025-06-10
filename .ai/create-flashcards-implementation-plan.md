# API Endpoint Implementation Plan: POST /api/flashcards (Create Flashcard)

## 1. Przegląd punktu końcowego

Ten punkt końcowy umożliwia uwierzytelnionym użytkownikom tworzenie nowych fiszek. Fiszka może być utworzona ręcznie przez użytkownika lub być wynikiem zaakceptowania propozycji wygenerowanej przez AI. Po pomyślnym utworzeniu, punkt końcowy zwraca pełne dane utworzonej fiszki.

## 2. Szczegóły żądania

- **Metoda HTTP:** `POST`
- **Struktura URL:** `/api/flashcards`
- **Nagłówki:**
  - `Authorization: Bearer <YOUR_SUPABASE_JWT>` (wymagane dla uwierzytelnienia)
  - `Content-Type: application/json`
- **Ciało żądania (Request Body):** Struktura JSON opisana przez `CreateFlashcardCommand`.

  ```json
  {
    "question": "string (min 5 chars)",
    "answer": "string (min 3 chars)",
    "isAiGenerated": "boolean (optional, default: false)",
    "sourceTextForAi": "string (optional, required if isAiGenerated is true)"
  }
  ```

- **Parametry:**
  - **Wymagane w ciele żądania:**
    - `question: string`
    - `answer: string`
  - **Opcjonalne w ciele żądania:**
    - `isAiGenerated: boolean` (domyślnie `false`)
    - `sourceTextForAi: string` (staje się wymagane, jeśli `isAiGenerated` jest `true`)

## 3. Wykorzystywane typy

- **Command Model (Żądanie):** `CreateFlashcardCommand` (z `src/types.ts`)

  ```typescript
  export interface CreateFlashcardCommand {
    question: TablesInsert<"flashcards">["question"];
    answer: TablesInsert<"flashcards">["answer"];
    isAiGenerated?: TablesInsert<"flashcards">["is_ai_generated"];
    sourceTextForAi?: TablesInsert<"flashcards">["source_text_for_ai"];
  }
  ```

- **DTO (Odpowiedź):** `FlashcardDto` (z `src/types.ts`)

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
    isDeleted: Tables<"flashcards">["is_deleted"]; // Powinno być false
  }
  ```

- **Schemat Walidacji Zod:** `CreateFlashcardSchema` (do zdefiniowania, np. w `src/lib/validation/flashcardSchemas.ts`)

  ```typescript
  import { z } from "zod";

  export const CreateFlashcardSchema = z
    .object({
      question: z.string().min(5, { message: "Question must be at least 5 characters long." }),
      answer: z.string().min(3, { message: "Answer must be at least 3 characters long." }),
      isAiGenerated: z.boolean().optional().default(false),
      sourceTextForAi: z.string().optional(),
    })
    .refine(
      (data) => {
        if (data.isAiGenerated && (typeof data.sourceTextForAi !== "string" || data.sourceTextForAi.trim() === "")) {
          return false;
        }
        return true;
      },
      {
        message: "sourceTextForAi is required if isAiGenerated is true.",
        path: ["sourceTextForAi"],
      }
    );
  ```

## 4. Szczegóły odpowiedzi

- **Sukces (201 Created):**

  - Nagłówki: `Content-Type: application/json`
  - Ciało odpowiedzi: Obiekt JSON zgodny z `FlashcardDto`.

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

- **Błędy:**
  - `400 Bad Request`: `{ "error": "Validation failed", "details": { ... } }` lub `{ "error": "Invalid JSON body." }`
  - `401 Unauthorized`: `{ "error": "User not authenticated." }`
  - `500 Internal Server Error`: `{ "error": "Error message describing the issue." }`

## 5. Przepływ danych

1. Klient wysyła żądanie `POST` na `/api/flashcards` z tokenem JWT i ciałem żądania (JSON).
2. Middleware Astro (`src/middleware/index.ts`) przechwytuje żądanie:
   a. Weryfikuje token JWT.
   b. Jeśli token jest nieprawidłowy lub go brakuje, zwraca `401 Unauthorized`.
   c. Jeśli token jest prawidłowy, udostępnia sesję użytkownika i klienta Supabase poprzez `Astro.locals`.
3. Handler Astro API Route (`src/pages/api/flashcards/index.ts` dla metody `POST`):
   a. Sprawdza, czy użytkownik jest uwierzytelniony (na podstawie `Astro.locals`). Jeśli nie, zwraca `401`.
   b. Pobiera `userId` z `Astro.locals.session.user.id`.
   c. Odczytuje i parsuje ciało żądania. W przypadku błędu parsowania JSON, zwraca `400 Bad Request`.
   d. Waliduje dane wejściowe używając schematu Zod (`CreateFlashcardSchema`). W przypadku błędów walidacji, zwraca `400 Bad Request` ze szczegółami błędów.
   e. Wywołuje metodę `createFlashcard` z serwisu `flashcardService` (`src/lib/services/flashcardService.ts`), przekazując zwalidowane dane, `userId` oraz klienta Supabase (`Astro.locals.supabase`).
4. Serwis `flashcardService`:
   a. Mapuje `CreateFlashcardCommand` na obiekt `TablesInsert<'flashcards'>` dla Supabase.
   b. Jeśli `isAiGenerated` jest `true`, ustawia `ai_accepted_at` na bieżącą datę/czas. W przeciwnym razie `ai_accepted_at` jest `null`.
   c. Wykonuje operację `insert` do tabeli `flashcards` używając klienta Supabase. RLS w bazie danych zapewni, że `user_id` jest zgodne z `auth.uid()`.
   d. Zwraca utworzony obiekt fiszki (pełny wiersz z bazy danych).
5. Handler Astro API Route:
   a. Otrzymuje utworzoną fiszkę z serwisu.
   b. Mapuje zwrócony obiekt z bazy danych na `FlashcardDto` (jeśli konieczne są drobne transformacje lub zapewnienie zgodności pól).
   c. Zwraca odpowiedź `201 Created` z `FlashcardDto` w ciele.
   d. W przypadku błędów z serwisu (np. błąd bazy danych), loguje błąd i zwraca `500 Internal Server Error`.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie:** Zapewnione przez middleware Astro i Supabase Auth. Dostęp do endpointu mają tylko zalogowani użytkownicy. Token JWT jest wymagany w nagłówku `Authorization`.
- **Autoryzacja:** Zapewniona przez Row Level Security (RLS) w PostgreSQL (Supabase).
  - Polityka `INSERT` dla tabeli `flashcards` (`Allow users to create flashcards for themselves`) gwarantuje, że użytkownik może tworzyć fiszki tylko dla siebie (`auth.uid() = user_id`). Serwis musi zapewnić poprawne przekazanie `user_id`.
- **Walidacja danych wejściowych:**
  - Realizowana po stronie serwera za pomocą Zod, aby zapobiec nieprawidłowym lub złośliwym danym.
  - Obejmuje sprawdzanie typów, wymaganych pól, minimalnych długości (`question`, `answer`) oraz logiki warunkowej (`sourceTextForAi` gdy `isAiGenerated` jest `true`).
  - Ograniczenia na poziomie bazy danych (`CHECK` constraints) stanowią dodatkową warstwę ochrony.
- **Ochrona przed SQL Injection:** Użycie Supabase JS SDK (który korzysta z parametryzowanych zapytań) minimalizuje ryzyko SQL Injection.
- **CSRF:** Jako że jest to API, a uwierzytelnianie opiera się na tokenach Bearer, ryzyko CSRF jest niskie, ale należy upewnić się, że klient wysyła token jako nagłówek, a nie np. w ciasteczku bez odpowiednich zabezpieczeń. Standardowa konfiguracja Astro dla API z tokenami Bearer powinna być bezpieczna.
- **Logowanie błędów:** Wszystkie błędy serwera powinny być logowane po stronie serwera w celu monitorowania i debugowania, ale szczegóły implementacyjne błędów nie powinny być ujawniane klientowi.

## 7. Obsługa błędów

- **`400 Bad Request`**:
  - Jeśli ciało żądania nie jest prawidłowym JSON. Odpowiedź: `{ "error": "Invalid JSON body." }`
  - Jeśli dane wejściowe nie przejdą walidacji Zod. Odpowiedź: `{ "error": "Validation failed", "details": { ... } }` (szczegóły z Zod).
- **`401 Unauthorized`**:
  - Jeśli użytkownik nie jest uwierzytelniony (brak/nieprawidłowy token JWT). Odpowiedź: `{ "error": "User not authenticated." }`
- **`500 Internal Server Error`**:
  - W przypadku niepowodzenia zapisu do bazy danych (np. błąd Supabase, naruszenie RLS, które nie zostało przewidziane). Odpowiedź: `{ "error": "Database error: <wiadomość z błędu Supabase>" }` lub ogólniejsze `{ "error": "Failed to create flashcard due to a server error." }`.
  - W przypadku innych nieoczekiwanych błędów serwera. Odpowiedź: `{ "error": "An unexpected error occurred." }`.
  - Wszystkie błędy 5xx powinny być logowane na serwerze.

## 8. Rozważania dotyczące wydajności

- Operacja `INSERT` do bazy danych jest zazwyczaj szybka dla pojedynczego wiersza.
- Walidacja Zod jest wykonywana w pamięci i powinna być wydajna.
- Użycie indeksów w bazie danych (`idx_flashcards_user_id`, etc.) nie ma bezpośredniego wpływu na operację `INSERT`, ale jest ważne dla ogólnej wydajności systemu.
- W przypadku dużej liczby jednoczesnych żądań tworzenia, należy monitorować obciążenie bazy danych. Na obecnym etapie nie przewiduje się specjalnych optymalizacji wydajnościowych dla tego konkretnego endpointu poza standardowymi dobrymi praktykami.

## 9. Etapy wdrożenia

1. **Przygotowanie typów i schematów walidacji:**
   a. Upewnić się, że typy `CreateFlashcardCommand` i `FlashcardDto` w `src/types.ts` są aktualne i zgodne z planem API.
   b. Zdefiniować schemat walidacji Zod `CreateFlashcardSchema` (np. w nowym pliku `src/lib/validation/flashcardSchemas.ts` lub podobnym).
2. **Implementacja logiki w serwisie:**
   a. Utworzyć lub zaktualizować plik `src/lib/services/flashcardService.ts`.
   b. Zaimplementować metodę `async createFlashcard(command: CreateFlashcardCommand, userId: string, supabase: SupabaseClient): Promise<Tables<'flashcards'>>`.
   c. Metoda powinna zawierać logikę mapowania danych z `command` na strukturę tabeli `flashcards`, ustawienie `user_id`, warunkowe ustawienie `ai_accepted_at`, oraz interakcję z Supabase w celu wstawienia rekordu.
   d. Dodać obsługę błędów z Supabase i rzucanie wyjątków w przypadku niepowodzenia.
3. **Implementacja Astro API Route Handler:**
   a. Utworzyć lub zaktualizować plik `src/pages/api/flashcards/index.ts`.
   b. Dodać funkcję `export const POST: APIRoute = async ({ request, locals }) => { ... };`.
   c. Ustawić `export const prerender = false;`.
   d. Implementować logikę:
   i. Pobranie sesji użytkownika i klienta Supabase z `locals`. Sprawdzenie uwierzytelnienia.
   ii. Odczytanie i sparsowanie ciała żądania JSON.
   iii. Walidacja danych wejściowych przy użyciu `CreateFlashcardSchema`.
   iv. Wywołanie metody `flashcardService.createFlashcard`.
   v. Mapowanie wyniku z serwisu na `FlashcardDto`.
   vi. Zwrócenie odpowiedzi `201 Created` z DTO lub odpowiedniego kodu błędu.
   vii. Implementacja logowania błędów serwera.
4. **Konfiguracja Middleware (jeśli konieczne):**
   a. Upewnić się, że middleware w `src/middleware/index.ts` poprawnie obsługuje uwierzytelnianie JWT i udostępnia `session` oraz `supabase` w `Astro.locals`.
5. **Testowanie:**
   a. Testy jednostkowe dla serwisu (jeśli praktykowane).
   b. Testy integracyjne/manualne dla endpointu API:
   i. Przypadek pomyślny (ręczne tworzenie fiszki).
   ii. Przypadek pomyślny (tworzenie fiszki AI-generated z `sourceTextForAi`).
   iii. Błędy walidacji (brakujące pola, za krótkie teksty, brak `sourceTextForAi` gdy `isAiGenerated=true`).
   iv. Brak uwierzytelnienia (brak tokenu, nieprawidłowy token).
   v. Nieprawidłowy format JSON.
6. **Dokumentacja:**
   a. Zaktualizować dokumentację API (np. Swagger/OpenAPI, jeśli używane), aby odzwierciedlała zaimplementowany endpoint. Plan API w `@api-plan.md` służy jako podstawa.
7. **Code Review:**
   a. Przeprowadzić przegląd kodu w celu zapewnienia jakości, zgodności z wytycznymi i bezpieczeństwa.
