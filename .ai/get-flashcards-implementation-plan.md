# Plan Implementacji Punktu Końcowego API: Pobieranie Listy Fiszek Użytkownika

## 1. Przegląd Punktu Końcowego

Celem tego punktu końcowego jest umożliwienie uwierzytelnionym użytkownikom pobierania listy ich własnych fiszek. Endpoint obsługuje paginację, sortowanie, wyszukiwanie tekstowe w pytaniach fiszek oraz filtrowanie po statusie wygenerowania przez AI. Zwracane są tylko fiszki, które nie zostały miękko usunięte.

## 2. Szczegóły Żądania

- **Metoda HTTP:** `GET`
- **Struktura URL:** `/api/flashcards`
- **Parametry Zapytania (Query Parameters):**
  - `page` (opcjonalny, integer, domyślnie: 1): Numer strony dla paginacji.
  - `limit` (opcjonalny, integer, domyślnie: 10): Liczba elementów na stronie.
  - `sortBy` (opcjonalny, string, domyślnie: `createdAt`): Pole, według którego sortowane są wyniki. Dozwolone wartości: `createdAt`, `updatedAt`, `question`.
  - `sortOrder` (opcjonalny, string, domyślnie: `desc`): Kierunek sortowania. Dozwolone wartości: `asc`, `desc`.
  - `search` (opcjonalny, string): Termin wyszukiwania do filtrowania fiszek na podstawie treści pytania (dopasowanie częściowe, niewrażliwe na wielkość liter).
  - `isAiGenerated` (opcjonalny, boolean): Filtr statusu wygenerowania fiszki przez AI.
- **Request Body:** Brak (dla żądania GET).

## 3. Wykorzystywane Typy

Do implementacji tego punktu końcowego wykorzystane zostaną następujące typy zdefiniowane w `src/types.ts`:

- **`GetFlashcardsQuery`**: Model dla parametrów zapytania.

    ```typescript
    export interface GetFlashcardsQuery {
      page?: number;
      limit?: number;
      sortBy?: "createdAt" | "updatedAt" | "question";
      sortOrder?: "asc" | "desc";
      search?: string;
      isAiGenerated?: boolean;
    }
    ```

- **`FlashcardListItemDto`**: DTO dla pojedynczej fiszki na liście.

    ```typescript
    export type FlashcardListItemDto = Pick<
      FlashcardDto,
      "id" | "userId" | "question" | "answer" | "isAiGenerated" | "aiAcceptedAt" | "createdAt" | "updatedAt"
    >;
    ```

- **`PaginationDetails`**: DTO dla szczegółów paginacji.

    ```typescript
    export interface PaginationDetails {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      limit: number;
    }
    ```

- **`FlashcardsListDto`**: Główny DTO odpowiedzi.

    ```typescript
    export interface FlashcardsListDto {
      data: FlashcardListItemDto[];
      pagination: PaginationDetails;
    }
    ```

## 4. Szczegóły Odpowiedzi

- **Sukces (200 OK):**
  - Struktura odpowiedzi (JSON):

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
                // ... więcej fiszek
            ],
            "pagination": {
                "currentPage": 1,
                "totalPages": 5,
                "totalItems": 50,
                "limit": 10
            }
        }
    ```

- **Błędy:**
  - `400 Bad Request`: Nieprawidłowe parametry zapytania.
  - `401 Unauthorized`: Użytkownik nie jest uwierzytelniony.
  - `500 Internal Server Error`: Wewnętrzny błąd serwera.

## 5. Przepływ Danych

1. Żądanie `GET` trafia do endpointu `/api/flashcards` w aplikacji Astro.
2. Middleware Astro weryfikuje token JWT użytkownika i udostępnia `user` oraz `supabase` (klient Supabase) w `context.locals`. Jeśli użytkownik nie jest uwierzytelniony, zwracany jest błąd `401`.
3. Handler endpointu (np. w `src/pages/api/flashcards/index.ts`) odczytuje parametry zapytania z URL.
4. Parametry zapytania są walidowane przy użyciu schemy Zod. W przypadku niepowodzenia walidacji, zwracany jest błąd `400 Bad Request`.
5. Handler wywołuje metodę serwisu `FlashcardService` (np. `flashcardService.getUserFlashcards(userId, validatedQueryParams)`), przekazując ID uwierzytelnionego użytkownika, zwalidowane parametry zapytania oraz klienta Supabase.
6. `FlashcardService` konstruuje zapytanie do bazy danych Supabase (PostgreSQL) na podstawie przekazanych parametrów:
    - Wybiera odpowiednie kolumny dla `FlashcardListItemDto`.
    - Filtruje wyniki, aby uwzględnić `search` (dla pola `question`, używając `ILIKE`) oraz `isAiGenerated`, jeśli zostały podane.
    - **Ważne:** Zasady RLS (Row Level Security) w Supabase automatycznie zapewniają, że pobierane są tylko fiszki należące do `auth.uid()` (zalogowanego użytkownika) oraz te, które mają `is_deleted = FALSE`. Serwis nie musi explicitnie dodawać tych warunków `WHERE` do zapytania.
    - Stosuje sortowanie (`sortBy`, `sortOrder`).
    - Stosuje paginację (`page`, `limit`) używając `range()`.
7. `FlashcardService` wykonuje dwa zapytania: jedno do pobrania danych fiszek dla bieżącej strony, drugie do uzyskania całkowitej liczby fiszek pasujących do kryteriów filtrowania (dla `PaginationDetails`). Supabase może pozwolić na pobranie `count` w ramach jednego zapytania, co jest preferowane.
8. `FlashcardService` mapuje wyniki z bazy danych na listę `FlashcardListItemDto` oraz tworzy obiekt `PaginationDetails`.
9. `FlashcardService` zwraca obiekt `FlashcardsListDto` (lub rzuca wyjątek w przypadku błędu).
10. Handler endpointu otrzymuje `FlashcardsListDto` od serwisu.
11. Handler serializuje `FlashcardsListDto` do JSON i wysyła odpowiedź `200 OK`.
12. W przypadku błędów w serwisie (np. problem z bazą danych), jest on przechwytywany, logowany, a handler zwraca odpowiedź `500 Internal Server Error`.

## 6. Względy Bezpieczeństwa

- **Uwierzytelnianie:** Dostęp do endpointu musi być ograniczony tylko do uwierzytelnionych użytkowników. Realizowane przez middleware Astro, które weryfikuje token JWT i ustawia `context.locals.user`. Brak lub niepoprawny token skutkuje `401 Unauthorized`.
- **Autoryzacja:** Zasady RLS w Supabase są kluczowe dla zapewnienia, że użytkownicy mogą odczytywać tylko własne fiszki (`auth.uid() = user_id`) i tylko te nieusunięte (`is_deleted = FALSE`).
- **Walidacja Danych Wejściowych:** Wszystkie parametry zapytania (`page`, `limit`, `sortBy`, `sortOrder`, `search`, `isAiGenerated`) muszą być rygorystycznie walidowane (typ, zakres, dozwolone wartości) za pomocą Zod, aby zapobiec błędom i potencjalnym atakom (np. przez zbyt duży `limit`). Odpowiedź `400 Bad Request` dla niepoprawnych danych.
- **Ochrona przed SQL Injection:** Użycie Supabase JavaScript SDK z jego wbudowanym query builderem minimalizuje ryzyko SQL Injection, ponieważ zapytania są parametryzowane. Należy unikać ręcznego konstruowania fragmentów SQL z danych wejściowych.
- **Ochrona przed DoS:** Walidacja parametru `limit` powinna obejmować maksymalną dopuszczalną wartość (np. 100), aby zapobiec żądaniom pobrania zbyt dużej liczby danych naraz.
- **Ujawnienie Informacji:** Endpoint powinien zwracać tylko niezbędne dane zdefiniowane w `FlashcardListItemDto`. Pola takie jak `is_deleted` czy `deleted_at` nie powinny być częścią odpowiedzi, co jest zgodne ze specyfikacją.

## 7. Obsługa Błędów

- **`200 OK`**: Pomyślne pobranie listy fiszek.
- **`400 Bad Request`**: Zwracany, gdy parametry zapytania nie przejdą walidacji Zod. Odpowiedź powinna zawierać szczegóły błędów walidacji.

    ```json
    {
        "message": "Invalid query parameters",
        "errors": { /* Zod error details */ }
    }
    ```

- **`401 Unauthorized`**: Zwracany, gdy użytkownik nie jest uwierzytelniony (np. brak nagłówka `Authorization` lub nieprawidłowy token).

    ```json
    {
        "message": "Unauthorized"
    }
    ```

- **`500 Internal Server Error`**: Zwracany w przypadku nieoczekiwanych błędów po stronie serwera (np. błąd połączenia z bazą danych, błąd w logice serwisu). Szczegóły błędu powinny być logowane po stronie serwera (np. do konsoli lub dedykowanego systemu logowania).

    ```json
    {
        "message": "Internal Server Error"
    }
    ```

- **Logowanie Błędów:** Błędy 500 powinny być logowane z wystarczającą ilością szczegółów (stack trace, kontekst żądania), aby umożliwić diagnozę. Należy stosować się do "Guidelines for clean code" dotyczących "proper error logging".

## 8. Rozważania dotyczące Wydajności

- **Indeksy Bazodanowe:**
  - Kluczowe dla wydajności będą odpowiednie indeksy w tabeli `flashcards`. Zgodnie z `db-plan.md` istnieją już:
    - `idx_flashcards_user_id_is_deleted` (dla `user_id, is_deleted`) - bardzo ważny dla RLS i podstawowego zapytania.
    - `idx_flashcards_created_at` (dla sortowania po `createdAt`).
    - `idx_flashcards_is_ai_generated` (dla filtrowania po `isAiGenerated`).
  - Dla sortowania po `updatedAt` i `question` oraz wyszukiwania `ILIKE` po `question`, należy rozwazyć/zweryfikować istnienie odpowiednich indeksów:
    - Indeks na `updated_at`.
    - Dla `ILIKE '%search%'` na kolumnie `question`, indeks `GIN` z `pg_trgm` (np. `CREATE INDEX idx_flashcards_question_trgm ON flashcards USING gin (question gin_trgm_ops);`) może znacząco poprawić wydajność, jeśli wyszukiwanie tekstowe będzie często używane. Należy to ocenić na podstawie rzeczywistego użycia.
- **Paginacja:** Implementacja paginacji jest niezbędna do ograniczenia ilości danych przesyłanych w jednej odpowiedzi i zmniejszenia obciążenia bazy danych.
- **Rozmiar Odpowiedzi:** Zwracanie tylko niezbędnych pól (zgodnie z `FlashcardListItemDto`) zmniejsza rozmiar odpowiedzi.
- **Zapytania do Bazy Danych:** Należy dążyć do minimalizacji liczby zapytań. Jeśli to możliwe, pobranie danych i całkowitej liczby elementów powinno odbyć się w jak najmniejszej liczbie zapytań (Supabase oferuje opcję `.select('*, count:total_count')` lub podobne mechanizmy do pobrania liczby pasujących wierszy wraz z danymi).
- **Prerendering:** Dla dynamicznych API endpointów w Astro, należy ustawić `export const prerender = false;`.

## 9. Etapy Wdrożenia

1. **Przygotowanie Środowiska i Konfiguracja:**
    - Upewnić się, że projekt Astro jest poprawnie skonfigurowany do obsługi API routes.
    - Zweryfikować konfigurację Supabase i dostępność klienta Supabase w `context.locals` przez middleware Astro.
    - Upewnić się, że typy `database.types.ts` generowane przez Supabase CLI są aktualne.

2. **Definicja Typów i Schemy Walidacji:**
    - Potwierdzić, że typy `GetFlashcardsQuery`, `FlashcardListItemDto`, `PaginationDetails`, `FlashcardsListDto` w `src/types.ts` są zgodne ze specyfikacją.
    - Stworzyć schemę walidacji Zod dla parametrów zapytania `GetFlashcardsQuery` w pliku endpointu. Uwzględnić parsowanie `isAiGenerated` z ciągu znaków na boolean.

3. **Implementacja Serwisu `FlashcardService`:**
    - Utworzyć plik (np. `src/lib/services/flashcardService.ts`) lub dodać do istniejącego serwisu.
    - Zaimplementować metodę, np. `async getUserFlashcards(supabase: SupabaseClient, userId: string, query: GetFlashcardsQueryValidated): Promise<FlashcardsListDto>`.
    - W metodzie:
        - Skonstruować zapytanie do Supabase (`flashcards` table) używając przekazanego klienta.
        - Dynamicznie dodawać filtry na podstawie `query.search` (używając `ilike` dla `question`) i `query.isAiGenerated` (używając `eq`).
        - Implementować sortowanie (`order`) na podstawie `query.sortBy` i `query.sortOrder`.
        - Implementować paginację (`range`) na podstawie `query.page` i `query.limit`.
        - Pobrać listę fiszek oraz całkowitą liczbę pasujących fiszek (np. za pomocą `{ count: 'exact' }` w opcjach zapytania Supabase).
        - Zmapować wyniki na `FlashcardListItemDto[]`.
        - Obliczyć `PaginationDetails` (`currentPage`, `totalPages`, `totalItems`, `limit`).
        - Zwrócić obiekt `FlashcardsListDto`.
        - Obsłużyć potencjalne błędy z Supabase i rzucić odpowiedni wyjątek lub zwrócić strukturę błędu.

4. **Implementacja Handlera API Endpointu:**
    - Utworzyć plik API route w Astro, np. `src/pages/api/flashcards.ts` lub `src/pages/api/flashcards/index.ts`.
    - Zaimplementować funkcję `GET` typu `APIRoute`.
    - Dodać `export const prerender = false;`.
    - Pobrać `user` i `supabase` z `context.locals`. Jeśli `user` nie istnieje, zwrócić `401 Unauthorized`.
    - Odczytać parametry zapytania z `request.url`.
    - Zwalidować parametry używając przygotowanej schemy Zod. W przypadku błędu, zwrócić `400 Bad Request` z detalami.
    - Utworzyć instancję `FlashcardService`.
    - Wywołać metodę serwisu (np. `flashcardService.getUserFlashcards(...)`).
    - W bloku `try...catch` obsłużyć ewentualne błędy z serwisu:
        - Zalogować błąd serwera.
        - Zwrócić `500 Internal Server Error`.
    - Jeśli wywołanie serwisu się powiedzie, zwrócić `200 OK` z `FlashcardsListDto` w ciele odpowiedzi (jako JSON).

5. **Testowanie:**
    - **Testy jednostkowe:** Dla logiki w `FlashcardService` (mockując klienta Supabase).
    - **Testy integracyjne/API:**
        - Sprawdzić poprawność działania dla uwierzytelnionego użytkownika.
        - Przetestować działanie z różnymi kombinacjami parametrów zapytania:
            - Domyślne wartości.
            - Paginacja (`page`, `limit`).
            - Sortowanie (`sortBy`, `sortOrder` dla wszystkich dozwolonych pól).
            - Wyszukiwanie (`search` - różne przypadki, częściowe dopasowania, brak wyników).
            - Filtrowanie (`isAiGenerated=true`, `isAiGenerated=false`).
            - Kombinacje powyższych.
        - Sprawdzić, czy zwracane są tylko fiszki należące do użytkownika i nieusunięte.
        - Sprawdzić poprawność struktury odpowiedzi i danych w `FlashcardListItemDto` oraz `PaginationDetails`.
        - Przetestować obsługę błędów:
            - Nieautoryzowany dostęp (`401`).
            - Nieprawidłowe parametry zapytania (`400` z poprawnymi komunikatami błędów Zod).
            - Symulacja błędu serwera/bazy danych (`500`).

6. **Dokumentacja (jeśli dotyczy):**
    - Zaktualizować dokumentację API (np. Swagger/OpenAPI), jeśli jest prowadzona.

7. **Code Review i Refaktoryzacja:**
    - Przeprowadzić przegląd kodu pod kątem zgodności z wytycznymi (`shared.mdc`, `astro.mdc`, `backend.mdc`), czystości kodu i potencjalnych problemów.
    - Dokonać ewentualnej refaktoryzacji.

8. **Weryfikacja Indeksów Bazodanowych:**
    - Sprawdzić, czy w bazie danych PostgreSQL istnieją odpowiednie indeksy (jak opisano w sekcji "Rozważania dotyczące Wydajności"). Jeśli nie, dodać brakujące indeksy, szczególnie `idx_flashcards_question_trgm` jeśli wyszukiwanie tekstowe będzie intensywnie używane.
