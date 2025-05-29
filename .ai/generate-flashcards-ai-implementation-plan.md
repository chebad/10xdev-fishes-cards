# Plan Implementacji Punktu Końcowego API: Generowanie Fiszek AI

## 1. Przegląd Punktu Końcowego

**Nazwa Punktu Końcowego:** Generowanie Fiszek AI
**URL:** `/api/flashcards/generate-ai`
**Metoda HTTP:** `POST`

**Opis:**
Ten punkt końcowy przyjmuje tekst źródłowy od uwierzytelnionego użytkownika i wykorzystuje OpenAI Platform (GPT-3.5-turbo lub GPT-4) do wygenerowania listy potencjalnych pytań i odpowiedzi do fiszek. Wygenerowane sugestie są zwracane użytkownikowi i nie są automatycznie zapisywane w bazie danych. Użytkownik decyduje, które sugestie chce przekształcić w rzeczywiste fiszki (np. poprzez oddzielny endpoint `POST /api/flashcards`).

## 2. Szczegóły Żądania

- **Metoda HTTP:** `POST`
- **Struktura URL:** `/api/flashcards/generate-ai`
- **Nagłówki:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <SUPABASE_JWT>` (Oczekiwane przez Supabase do uwierzytelnienia)
- **Ciało Żądania (Request Body):**
    Format: JSON
    Struktura:

```json
    {
        "sourceText": "string"
    }
```

- **Parametry:**
  - **Wymagane (w ciele żądania):**
    - `sourceText` (string): Tekst źródłowy do generowania fiszek. Musi mieć długość od 1000 do 10000 znaków.
  - **Opcjonalne:** Brak.

## 3. Wykorzystywane Typy

Do implementacji tego punktu końcowego wykorzystane zostaną następujące typy zdefiniowane w `src/types.ts`:

- **Command Model (Dla Ciała Żądania):**

```typescript
    export interface GenerateAiFlashcardsCommand {
      sourceText: string; // Walidacja: min 1000 znaków, max 10000 znaków
    }
```

- **DTO (Dla Odpowiedzi):**

```typescript
    export interface AiFlashcardSuggestionItem {
      suggestedQuestion: string;
      suggestedAnswer: string;
      aiModelUsed: string; // Np. "GPT-4", "Claude-3-Opus"
    }

    export interface AiFlashcardSuggestionsDto {
      suggestions: AiFlashcardSuggestionItem[];
      sourceTextEcho: string; // Oryginalny tekst źródłowy
    }
```

## 4. Szczegóły Odpowiedzi

- **Odpowiedź Sukcesu (200 OK):**
    Zwracana, gdy sugestie fiszek zostaną pomyślnie wygenerowane.
    Format: JSON
    Struktura:

```json
    {
        "suggestions": [
            {
                "suggestedQuestion": "string",
                "suggestedAnswer": "string",
                "aiModelUsed": "string"
            }
            // ... inne sugestie
        ],
        "sourceTextEcho": "string"
    }
```

- **Odpowiedzi Błędów:**
  - **`400 Bad Request`**: Nieprawidłowe dane wejściowe.

    ```json
        {
            "error": "Validation failed",
            "details": { "sourceText": "Source text must be between 1000 and 10000 characters." }
            // lub inne szczegóły błędu walidacji Zod
        }
    ```

  - **`401 Unauthorized`**: Użytkownik nie jest uwierzytelniony.

    ```json
        { "error": "User not authenticated" }
    ```

  - **`500 Internal Server Error`**: Wewnętrzny błąd serwera (np. problem z przetwarzaniem odpowiedzi AI, nieoczekiwany wyjątek).

    ```json
        { "error": "An unexpected error occurred on the server." }
    ```

  - **`503 Service Unavailable`**: Usługa AI jest tymczasowo niedostępna lub wystąpił problem z komunikacją.

    ```json
        { "error": "The AI service is temporarily unavailable. Please try again later." }
    ```

## 5. Przepływ Danych

1. Klient wysyła żądanie `POST` na `/api/flashcards/generate-ai` z `sourceText` w ciele JSON oraz tokenem JWT w nagłówku `Authorization`.
2. Middleware Astro lub handler endpointu weryfikuje token JWT użytkownika za pomocą `Astro.locals.supabase`. Jeśli użytkownik nie jest uwierzytelniony, zwracany jest błąd `401 Unauthorized`.
3. Handler endpointu (`src/pages/api/flashcards/generate-ai.ts`) odbiera żądanie.
4. Dane wejściowe (`sourceText`) są walidowane przy użyciu schematu Zod (długość 1000-10000 znaków). Jeśli walidacja zawiedzie, zwracany jest błąd `400 Bad Request`.
5. Handler endpointu wywołuje metodę serwisu `AiFlashcardGeneratorService` (np. `generateSuggestions(sourceText: string)`), przekazując zwalidowany `sourceText`.
6. `AiFlashcardGeneratorService` (`src/lib/services/aiFlashcardGeneratorService.ts`):
    a.  Pobiera klucz API dla OpenAI ze zmiennych środowiskowych (`import.meta.env.OPENAI_API_KEY`).
    b.  Konstruuje odpowiednie żądanie do OpenAI API, zawierające `sourceText` i parametry modelu.
    c.  Wysyła żądanie do OpenAI.
    d.  Odbiera odpowiedź od OpenAI.
    e.  Obsługuje potencjalne błędy komunikacji z OpenAI (np. timeout, błędy API OpenAI, przekroczone limity). Jeśli wystąpi błąd wskazujący na niedostępność usługi, serwis powinien zwrócić błąd, który endpoint przetłumaczy na `503 Service Unavailable`. Inne błędy mogą skutkować `500 Internal Server Error`.
    f.  Przetwarza pomyślną odpowiedź z OpenAI, mapując ją na strukturę `AiFlashcardSuggestionItem[]` (wypełniając `suggestedQuestion`, `suggestedAnswer`, `aiModelUsed`).
    g.  Zwraca listę sugestii lub zgłasza błąd do handlera endpointu.
7. Handler endpointu otrzymuje listę sugestii (lub błąd) od serwisu.
8. Jeśli operacja w serwisie zakończyła się sukcesem:
    a.  Handler konstruuje obiekt `AiFlashcardSuggestionsDto` zawierający `suggestions` i `sourceTextEcho`.
    b.  Zwraca odpowiedź `200 OK` z `AiFlashcardSuggestionsDto` w ciele JSON.
9. Jeśli serwis zwrócił błąd:
    a.  Handler mapuje błąd na odpowiedni kod statusu HTTP (`500` lub `503`) i komunikat błędu, a następnie zwraca odpowiedź.
10. Błędy serwera (5xx) powinny być logowane po stronie serwera (np. do konsoli).

## 6. Względy Bezpieczeństwa

- **Uwierzytelnianie:**
  - Punkt końcowy musi być chroniony i dostępny tylko dla uwierzytelnionych użytkowników.
  - Uwierzytelnianie będzie realizowane za pomocą tokenów JWT Supabase, weryfikowanych przez `Astro.locals.supabase` (lub `Astro.locals.getSession()` i `Astro.locals.user`).
  - Brak lub nieprawidłowy token skutkuje odpowiedzią `401 Unauthorized`.
- **Autoryzacja:**
  - Każdy uwierzytelniony użytkownik może korzystać z tej funkcji. Nie ma dodatkowych ról ani uprawnień do sprawdzenia poza faktem bycia zalogowanym.
- **Walidacja Danych Wejściowych:**
  - `sourceText` musi być rygorystycznie walidowany (typ, wymagana obecność, minimalna i maksymalna długość) za pomocą Zod, aby zapobiec błędom przetwarzania i potencjalnym problemom z usługą AI (np. zbyt duże żądania generujące koszty).
  - Maksymalna długość chroni również przed atakami DoS poprzez wysyłanie nadmiernie dużych danych.
- **Zarządzanie Kluczami API:**
  - Klucz API do usługi OpenAI musi być przechowywany jako zmienna środowiskowa (np. `OPENAI_API_KEY` w pliku `.env`) i dostępny tylko po stronie serwera (`import.meta.env`).
  - Klucz API nie może być ujawniony w kodzie frontendowym ani w odpowiedziach API.
- **Ochrona przed Nadużyciami (Rate Limiting):**
  - (Potencjalne przyszłe ulepszenie) Rozważyć zaimplementowanie mechanizmu ograniczania liczby żądań (rate limiting) na poziomie użytkownika lub IP, aby zapobiec nadużyciom i kontrolować koszty związane z API AI. W ramach MVP, nie jest to wymagane, ale należy o tym pamiętać.
- **Bezpieczeństwo Transmisji Danych:**
  - Użycie HTTPS jest standardem i zapewnia szyfrowanie danych w tranzycie między klientem a serwerem oraz między serwerem a usługą AI.
- **Logowanie Błędów:**
  - Szczegółowe logowanie błędów po stronie serwera (bez ujawniania wrażliwych informacji użytkownikom) pomoże w diagnozowaniu problemów, w tym potencjalnych prób ataków.

## 7. Rozważania dotyczące Wydajności

- **Czas Odpowiedzi Zewnętrznego API:**
  - Głównym czynnikiem wpływającym na wydajność będzie czas odpowiedzi od usługi AI (OpenAI). Może on być zmienny w zależności od obciążenia usługi AI i złożoności generowania.
  - Należy rozważyć ustawienie rozsądnego timeoutu dla żądań do usługi AI, aby uniknąć zbyt długiego oczekiwania przez użytkownika.
- **Rozmiar Przesyłanych Danych:**
  - Ograniczenie długości `sourceText` (1000-10000 znaków) pomaga kontrolować rozmiar danych przesyłanych do AI i czas przetwarzania.
- **Przetwarzanie Po Stronie Serwera:**
  - Logika po stronie serwera Astro (walidacja, wywołanie serwisu, formatowanie odpowiedzi) powinna być zoptymalizowana, aby nie dodawać znaczącego narzutu. Użycie skompilowanego kodu (Astro) i efektywnych bibliotek (Zod) jest korzystne.
- **Brak Interakcji z Bazą Danych:**
  - Ten konkretny endpoint nie wchodzi w interakcję z bazą danych w celu zapisu lub odczytu fiszek, co eliminuje potencjalne wąskie gardła związane z operacjami DB.

## 8. Etapy Wdrożenia

1. **Konfiguracja Środowiska:**
    - Upewnić się, że zmienna środowiskowa `OPENAI_API_KEY` (lub odpowiednik dla wybranej usługi AI) jest zdefiniowana w pliku `.env` i dostępna dla aplikacji Astro (`import.meta.env.OPENAI_API_KEY`).

2. **Definicja Typów i Schematu Walidacji:**
    - Sprawdzić istniejące typy `GenerateAiFlashcardsCommand`, `AiFlashcardSuggestionItem`, `AiFlashcardSuggestionsDto` w `src/types.ts`.
    - Stworzyć schemat Zod dla `GenerateAiFlashcardsCommand` w pliku endpointu lub dedykowanym pliku walidatorów, uwzględniając walidację długości `sourceText` (min 1000, max 10000).

3. **Implementacja Serwisu `AiFlashcardGeneratorService`:**
    - Utworzyć nowy plik: `src/lib/services/aiFlashcardGeneratorService.ts`.
    - Zaimplementować funkcję, np. `generateFlashcardSuggestions(sourceText: string): Promise<AiFlashcardSuggestionItem[]>`.
    - Wewnątrz funkcji:
        - Pobrać klucz API OpenAI ze zmiennych środowiskowych.
        - Skonstruować i wysłać żądanie do OpenAI API, zawierające `sourceText` i parametry modelu.
        - Wysyła żądanie do OpenAI.
        - Odbiera odpowiedź od OpenAI.
        - Obsługuje potencjalne błędy komunikacji z OpenAI (np. timeout, błędy API OpenAI, przekroczone limity). Jeśli wystąpi błąd wskazujący na niedostępność usługi, serwis powinien zwrócić błąd, który endpoint przetłumaczy na `503 Service Unavailable`. Inne błędy mogą skutkować `500 Internal Server Error`.
        - Przetwarza pomyślną odpowiedź z OpenAI, mapując ją na strukturę `AiFlashcardSuggestionItem[]` (wypełniając `suggestedQuestion`, `suggestedAnswer`, `aiModelUsed`).
        - Zwraca listę sugestii lub zgłasza błąd do handlera endpointu.
    - Eksportować funkcję serwisu.

4. **Implementacja Punktu Końcowego API w Astro:**
    - Utworzyć nowy plik: `src/pages/api/flashcards/generate-ai.ts`.
    - Dodać `export const prerender = false;` na początku pliku.
    - Zaimplementować handler dla metody `POST`: `export async function POST({ request, locals }: APIContext) { ... }`.
    - **Uwierzytelnianie:**
        - Pobrać sesję użytkownika: `const session = await locals.getSession();`.
        - Sprawdzić, czy użytkownik jest zalogowany: `if (!session?.user) { return new Response(JSON.stringify({ error: "User not authenticated" }), { status: 401 }); }`.
    - **Pobieranie i Walidacja Danych Wejściowych:**
        - Odczytać ciało żądania: `const body = await request.json();`.
        - Zwalidować ciało żądania przy użyciu przygotowanego schematu Zod dla `GenerateAiFlashcardsCommand`.
        - Jeśli walidacja nie powiodła się, zwrócić odpowiedź `400 Bad Request` ze szczegółami błędu z Zod.
    - **Wywołanie Serwisu:**
        - Wywołać funkcję z `AiFlashcardGeneratorService`, np. `const suggestions = await aiFlashcardGeneratorService.generateFlashcardSuggestions(validatedBody.sourceText);`.
    - **Obsługa Odpowiedzi i Błędów z Serwisu:**
        - Użyć bloku `try...catch` do obsługi błędów z serwisu.
        - W bloku `catch`:
            - Logować błąd po stronie serwera.
            - Zwrócić odpowiedź `503 Service Unavailable` lub `500 Internal Server Error` w zależności od typu błędu.
    - **Konstrukcja i Zwrócenie Odpowiedzi Sukcesu:**
        - Przygotować obiekt `AiFlashcardSuggestionsDto`.
        - Zwrócić odpowiedź `200 OK` z `AiFlashcardSuggestionsDto` jako JSON.

5. **Logowanie:**
    - Dodać odpowiednie logowanie po stronie serwera dla błędów krytycznych (5xx) w handlerze API i w serwisie AI.

6. **Testowanie:**
    - **Testy jednostkowe (opcjonalne dla MVP, ale zalecane):**
        - Dla serwisu `AiFlashcardGeneratorService` (mockując `fetch` do OpenAI).
        - Dla logiki walidacji w punkcie końcowym.
    - **Testy integracyjne/manualne:**
        - Sprawdzić poprawność działania dla prawidłowych danych wejściowych (`200 OK`).
        - Sprawdzić obsługę błędów walidacji (`400 Bad Request`) dla różnych przypadków (brak `sourceText`, za krótki, za długi).
        - Sprawdzić obsługę braku uwierzytelnienia (`401 Unauthorized`).
        - Symulować błędy usługi AI (jeśli to możliwe) lub przygotować mock serwisu zwracający błędy, aby przetestować ścieżki `500` i `503`.
        - Zweryfikować strukturę odpowiedzi JSON.

7. **Dokumentacja (jeśli dotyczy):**
    - Zaktualizować dokumentację API (np. w Postman, Swagger/OpenAPI), jeśli jest prowadzona oddzielnie. Ten plan może służyć jako podstawa.

Ten plan powinien zapewnić kompleksowe wytyczne dla zespołu programistów do wdrożenia punktu końcowego `/api/flashcards/generate-ai`.
