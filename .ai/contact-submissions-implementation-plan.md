# API Endpoint Implementation Plan: Create Contact Submission

## 1. Przegląd punktu końcowego

Celem tego punktu końcowego jest umożliwienie użytkownikom (zarówno anonimowym, jak i uwierzytelnionym) przesyłania zgłoszeń za pośrednictwem formularza kontaktowego. Jeśli użytkownik jest uwierzytelniony, jego `user_id` zostanie powiązane ze zgłoszeniem. Zgłoszenia są zapisywane w bazie danych.

## 2. Szczegóły żądania

- **Metoda HTTP:** `POST`
- **Struktura URL:** `/api/contact-submissions`
- **Parametry:**
  - Wymagane: Brak parametrów URL.
  - Opcjonalne: Brak parametrów URL.
- **Request Body (JSON):**

    ```json
    {
        "emailAddress": "string (valid email, required)",
        "subject": "string (optional)",
        "messageBody": "string (required)"
    }
    ```

  - `emailAddress`: Adres email osoby przesyłającej zgłoszenie. Musi być poprawnym formatem email.
  - `subject`: Temat zgłoszenia.
  - `messageBody`: Treść wiadomości zgłoszenia.

## 3. Wykorzystywane typy

- **Command Model (Request):** `CreateContactSubmissionCommand` (zdefiniowany w `src/types.ts`)

    ```typescript
    export interface CreateContactSubmissionCommand {
      emailAddress: TablesInsert<"contact_form_submissions">["email_address"]; // string
      subject?: TablesInsert<"contact_form_submissions">["subject"]; // string | undefined
      messageBody: TablesInsert<"contact_form_submissions">["message_body"]; // string
    }
    ```

- **Data Transfer Object (Response):** `ContactSubmissionDto` (zdefiniowany w `src/types.ts`)

    ```typescript
    export interface ContactSubmissionDto {
      id: Tables<"contact_form_submissions">["id"]; // string (uuid)
      userId: Tables<"contact_form_submissions">["user_id"]; // string (uuid) | null
      emailAddress: Tables<"contact_form_submissions">["email_address"]; // string
      subject: Tables<"contact_form_submissions">["subject"]; // string | null
      messageBody: Tables<"contact_form_submissions">["message_body"]; // string
      submittedAt: Tables<"contact_form_submissions">["submitted_at"]; // string (timestamp)
    }
    ```

## 4. Szczegóły odpowiedzi

- **Sukces (201 Created):**

    ```json
    {
        "id": "uuid",
        "userId": "uuid | null",
        "emailAddress": "string",
        "subject": "string | null",
        "messageBody": "string",
        "submittedAt": "timestamp"
    }
    ```

    Zwraca nowo utworzony obiekt zgłoszenia kontaktowego.
- **Błędy:**
  - `400 Bad Request`: Nieprawidłowe dane wejściowe.

        ```json
        {
            "error": "Validation failed",
            "details": {
                "emailAddress": "Invalid email format." // Przykładowy błąd walidacji
            }
        }
        ```

  - `500 Internal Server Error`: Wewnętrzny błąd serwera.

        ```json
        {
            "error": "Internal Server Error"
        }
        ```

## 5. Przepływ danych

1. Klient wysyła żądanie `POST` na `/api/contact-submissions` z danymi w formacie JSON (`CreateContactSubmissionCommand`).
2. Handler API Astro (`src/pages/api/contact-submissions.ts`) odbiera żądanie.
3. Pobierany jest potencjalny `userId` zalogowanego użytkownika z `Astro.locals.user.id`.
4. Dane wejściowe są walidowane przy użyciu schematu Zod na podstawie `CreateContactSubmissionCommand`.
    - Jeśli walidacja nie powiedzie się, zwracana jest odpowiedź `400 Bad Request` ze szczegółami błędów.
5. Jeśli walidacja powiedzie się, wywoływana jest funkcja serwisu `contactSubmissionsService.createSubmission(data, userId)`.
6. Serwis `contactSubmissionsService` (`src/lib/services/contactSubmissionsService.ts`):
    a.  Przygotowuje obiekt danych do wstawienia do tabeli `contact_form_submissions` w Supabase, włączając `userId` (jeśli istnieje).
    b.  Wykonuje operację wstawienia do bazy danych za pomocą klienta Supabase (`context.locals.supabase` zgodnie z regułą `backend.mdc`).
    c.  Jeśli operacja na bazie danych nie powiedzie się, serwis rzuca błąd.
7. Jeśli serwis pomyślnie utworzy zgłoszenie, zwraca utworzony obiekt (`ContactSubmissionDto`).
8. Handler API zwraca odpowiedź `201 Created` z danymi utworzonego zgłoszenia.
9. W przypadku błędu w serwisie lub nieoczekiwanego błędu w handlerze, zwracana jest odpowiedź `500 Internal Server Error`.

## 6. Względy bezpieczeństwa

- **Walidacja danych wejściowych:** Użycie Zod do walidacji wszystkich pól (`emailAddress`, `subject`, `messageBody`) zgodnie z typami i ograniczeniami (`emailAddress` musi być prawidłowym emailem, `messageBody` nie może być puste). Chroni to przed podstawowymi atakami typu injection i zapewnia integralność danych. Długości pól są również sprawdzane przez bazę danych.
- **Uwierzytelnianie:** Endpoint jest dostępny dla użytkowników anonimowych i uwierzytelnionych. `userId` jest pobierane z `Astro.locals.user.id`, co jest bezpiecznym sposobem identyfikacji zalogowanego użytkownika, zamiast polegania na danych z request body.
- **Autoryzacja:**
  - Wstawianie: Zgodnie z `.ai/db-plan.md` i polityką RLS `Allow public inserts to contact form` lub `Allow anyone to submit a contact form`, każdy może wstawić zgłoszenie. Polityka RLS weryfikuje, czy `user_id` jest poprawnie ustawione (NULL dla anonimowych, `auth.uid()` dla zalogowanych) jeśli aplikacja backendowa to zapewnia.
  - Odczyt/Modyfikacja/Usuwanie: Dostęp do `contact_form_submissions` dla tych operacji jest ograniczony do ról administracyjnych (np. `service_role`) przez politykę RLS `Allow admin access to contact_form_submissions`.
- **Ochrona przed spamem/DoS:** Nie jest częścią tej implementacji, ale należy rozważyć wdrożenie mechanizmów rate limiting na poziomie globalnym (np. middleware Astro) lub CAPTCHA w przyszłości, aby chronić endpoint przed nadużyciami.
- **SQL Injection:** Użycie Supabase Client SDK z parametryzowanymi zapytaniami chroni przed atakami SQL Injection.
- **XSS (Cross-Site Scripting):** Chociaż dane są głównie zapisywane, należy pamiętać o oczyszczaniu danych (`messageBody`, `subject`) przy ich potencjalnym wyświetlaniu w interfejsie administracyjnym.

## 7. Obsługa błędów

- **Błędy walidacji (400 Bad Request):**
  - Występują, gdy dane wejściowe nie przejdą walidacji Zod.
  - Odpowiedź zawiera obiekt JSON ze szczegółami błędów walidacji dla każdego pola.
  - Przykład: brakujące `emailAddress`, nieprawidłowy format `emailAddress`, brakujące `messageBody`.
- **Błędy serwera (500 Internal Server Error):**
  - Występują w przypadku problemów z połączeniem z bazą danych, błędów podczas operacji na bazie danych (np. naruszenie unikalnego klucza, jeśli dotyczy, chociaż nie w tym schemacie), lub innych nieoczekiwanych wyjątków w logice serwera.
  - Odpowiedź zawiera generyczny komunikat błędu.
  - Błędy te powinny być logowane po stronie serwera (np. `console.error` lub dedykowany system logowania) w celu dalszej analizy.
- **Zgodność z politykami RLS:** Błędy mogą również wynikać z naruszenia polityk RLS, jeśli logika aplikacji nieprawidłowo ustawi `user_id`. Supabase zwróci wtedy odpowiedni błąd, który najprawdopodobniej zostanie obsłużony jako `500 Internal Server Error`, chyba że zostanie przechwycony i zmapowany inaczej.

## 8. Rozważania dotyczące wydajności

- **Operacje na bazie danych:** Operacja `INSERT` na tabeli `contact_form_submissions` jest zazwyczaj szybka. Tabela posiada indeksy na `user_id`, `email_address` i `submitted_at`, co jest istotne dla przyszłych zapytań administracyjnych, ale nie wpływa bezpośrednio na wydajność samego zapisu.
- **Walidacja:** Walidacja Zod jest wydajna i nie powinna stanowić wąskiego gardła.
- **Połączenia z bazą:** Należy zapewnić efektywne zarządzanie połączeniami z Supabase, co jest obsługiwane przez Astro middleware i Supabase client.
- **Rozmiar payloadu:** Rozmiar JSON request i response jest mały, więc nie powinien wpływać na wydajność.

## 9. Etapy wdrożenia

1. **Utworzenie pliku endpointu API:**
    - Stwórz plik `src/pages/api/contact-submissions.ts`.
    - Zdefiniuj `export const prerender = false;` zgodnie z regułami projektu.
2. **Implementacja handlera `POST`:**
    - W `src/pages/api/contact-submissions.ts` zaimplementuj funkcję `POST({ request, locals }: APIContext)`.
3. **Pobranie danych użytkownika:**
    - W handlerze `POST`, uzyskaj dostęp do `locals.user` i `locals.supabase` z obiektu `APIContext`.
    - Odczytaj `userId` z `locals.user.id` (jeśli użytkownik jest zalogowany).
4. **Walidacja danych wejściowych:**
    - Zdefiniuj schemat Zod dla `CreateContactSubmissionCommand` w `src/lib/schemas/contactSubmissionSchemas.ts` (lub podobnym pliku, jeśli nie istnieje, utwórz go).

        ```typescript
        // src/lib/schemas/contactSubmissionSchemas.ts
        import { z } from 'zod';

        export const CreateContactSubmissionSchema = z.object({
          emailAddress: z.string({ required_error: "Email address is required." }).email({ message: "Invalid email format." }),
          subject: z.string().optional(),
          messageBody: z.string({ required_error: "Message body is required." }).min(1, { message: "Message body cannot be empty." })
        });
        ```

    - W handlerze `POST`, sparsuj i zwaliduj `await request.json()` używając `CreateContactSubmissionSchema.safeParseAsync()`.
    - W przypadku niepowodzenia walidacji, zwróć odpowiedź `400 Bad Request` z odpowiednio sformatowanymi błędami.
5. **Utworzenie serwisu `contactSubmissionsService`:**
    - Stwórz plik `src/lib/services/contactSubmissionsService.ts` (jeśli nie istnieje).
    - Zaimplementuj funkcję `async createSubmission(submissionData: CreateContactSubmissionCommand, userId: string | null, supabase: SupabaseClient): Promise<ContactSubmissionDto>`
        - Funkcja powinna przyjmować dane zgłoszenia, opcjonalne `userId` oraz instancję klienta Supabase.
        - Przygotuj obiekt do zapisu, mapując `CreateContactSubmissionCommand` na `TablesInsert<"contact_form_submissions">`.
        - Użyj `supabase.from('contact_form_submissions').insert({...submissionData, user_id: userId}).select().single()`.
        - Obsłuż potencjalne błędy z Supabase (np. opakowując wywołanie w `try...catch` i rzucając niestandardowy błąd lub pozwalając na propagację).
        - Zwróć zmapowane dane jako `ContactSubmissionDto`.
6. **Wywołanie serwisu z handlera API:**
    - W handlerze `POST`, po pomyślnej walidacji, wywołaj `contactSubmissionsService.createSubmission(validatedData.data, userId, locals.supabase)`.
7. **Obsługa odpowiedzi i błędów:**
    - Jeśli serwis zwróci dane, zwróć odpowiedź `201 Created` z tymi danymi (`ContactSubmissionDto`).
    - Jeśli serwis rzuci błąd lub wystąpi inny nieoczekiwany błąd, zaloguj go i zwróć odpowiedź `500 Internal Server Error`.
8. **Definicja typów:**
    - Upewnij się, że typy `CreateContactSubmissionCommand` i `ContactSubmissionDto` w `src/types.ts` są zgodne ze specyfikacją i schematem bazy danych.
    - Upewnij się, że typ `SupabaseClient` jest importowany z `src/db/supabase.client.ts` (lub odpowiedniego miejsca zgodnie z projektem).
9. **Testowanie:**
    - Przetestuj endpoint przy użyciu narzędzia takiego jak Postman lub curl.
    - Sprawdź przypadki:
        - Poprawne zgłoszenie od użytkownika anonimowego.
        - Poprawne zgłoszenie od użytkownika zalogowanego (weryfikacja `userId` w bazie).
        - Zgłoszenie z brakującymi wymaganymi polami (`emailAddress`, `messageBody`).
        - Zgłoszenie z nieprawidłowym formatem `emailAddress`.
        - Zgłoszenie z opcjonalnym polem `subject` i bez niego.
    - Sprawdź kody odpowiedzi i formaty JSON odpowiedzi.
10. **Dokumentacja (opcjonalnie, jeśli wymagane):**
    - Zaktualizuj dokumentację API (np. Swagger/OpenAPI), jeśli jest prowadzona.
