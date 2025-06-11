# Scenariusze Testowe dla DELETE /api/flashcards/{flashcardId}

## Przygotowanie do testów

**Base URL:** `http://localhost:3000`

**Token JWT:** Zastąp `PUT_BEARER_TOKEN_HERE` w poniższych komendach swoim aktualnym tokenem JWT.
**Flashcard ID:** Zastąp `FLASHCARD_ID_TO_DELETE` identyfikatorem UUID fiszki, którą chcesz usunąć. Upewnij się, że ta fiszka istnieje i należy do użytkownika skojarzonego z tokenem JWT.

**Ważne:** Operacja DELETE jest operacją modyfikującą dane (miękkie usuwanie). Po pomyślnym wykonaniu testu, fiszka zostanie oznaczona jako usunięta. Aby ponownie przetestować pomyślne usunięcie tej samej fiszki, konieczne może być jej "przywrócenie" w bazie danych (np. przez ustawienie `is_deleted = false` i `deleted_at = NULL`) lub użycie innej, aktywnej fiszki.

## 1. Testy Podstawowe

### 1.1. Pomyślne miękkie usunięcie fiszki (204 No Content)

```bash
curl -X DELETE "http://localhost:3000/api/flashcards/FLASHCARD_ID_TO_DELETE" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

**Oczekiwany wynik:**

- Kod statusu: `204 No Content`
- Brak ciała odpowiedzi.
- W bazie danych: dla fiszki o podanym ID, `is_deleted` powinno być `true`, a `deleted_at` powinno zawierać timestamp.

### 1.2. Test bez uwierzytelnienia (401 Unauthorized)

```bash
curl -X DELETE "http://localhost:3000/api/flashcards/FLASHCARD_ID_TO_DELETE" \
  -v
```

**Oczekiwany wynik:**

- Kod statusu: `401 Unauthorized`
- Ciało odpowiedzi może zawierać komunikat o błędzie, np.: `{"error":"User not authenticated."}`

## 2. Testy Walidacji Parametru Ścieżki (`flashcardId`)

### 2.1. Nieprawidłowy format `flashcardId` (400 Bad Request)

```bash
curl -X DELETE "http://localhost:3000/api/flashcards/invalid-uuid-format" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

**Oczekiwany wynik:**

- Kod statusu: `400 Bad Request`
- Ciało odpowiedzi powinno zawierać szczegóły błędu walidacji, np.: `{"error":"Invalid flashcard ID format.","details":["Flashcard ID must be a valid UUID."]}`

### 2.2. `flashcardId` jako pusty string (zwykle problem z routingiem, może być 404 lub błąd frameworka)

```bash
# Ten test może nie być bezpośrednio obsługiwany przez logikę aplikacji,
# a raczej przez mechanizmy routingu Astro/serwera HTTP.
curl -X DELETE "http://localhost:3000/api/flashcards/" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

**Oczekiwany wynik:** Prawdopodobnie `404 Not Found` (jeśli router nie dopasuje ścieżki) lub specyficzny błąd serwera/frameworka, jeśli pusty parametr jest niedozwolony na niższym poziomie.

## 3. Testy Logiki Biznesowej i Bezpieczeństwa

### 3.1. Próba usunięcia nieistniejącej fiszki (404 Not Found)

Użyj UUID, który na pewno nie istnieje w bazie danych.

```bash
curl -X DELETE "http://localhost:3000/api/flashcards/123e4567-e89b-12d3-a456-426614174999" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

**Oczekiwany wynik:**

- Kod statusu: `404 Not Found`
- Ciało odpowiedzi może zawierać komunikat, np.: `{"error":"Flashcard not found or already deleted."}`

### 3.2. Próba usunięcia fiszki należącej do innego użytkownika (404 Not Found)

**Przygotowanie:** Potrzebujesz `flashcardId` fiszki, która istnieje, ale należy do innego użytkownika niż ten, którego token JWT jest używany.

```bash
curl -X DELETE "http://localhost:3000/api/flashcards/OTHER_USER_FLASHCARD_ID" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

**Oczekiwany wynik:**

- Kod statusu: `404 Not Found` (dzięki politykom RLS i logice serwisu, która nie powinna ujawniać istnienia zasobu)

### 3.3. Próba usunięcia już usuniętej fiszki (404 Not Found)

**Przygotowanie:** Najpierw usuń fiszkę (test 1.1), a następnie spróbuj ją usunąć ponownie używając tego samego `flashcardId`.

```bash
# Krok 1: Usuń fiszkę (upewnij się, że się udało - 204)
# curl -X DELETE "http://localhost:3000/api/flashcards/FLASHCARD_ID_TO_DELETE" ...

# Krok 2: Spróbuj usunąć ją ponownie
curl -X DELETE "http://localhost:3000/api/flashcards/FLASHCARD_ID_TO_DELETE" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

**Oczekiwany wynik:**

- Kod statusu: `404 Not Found`
- Ciało odpowiedzi może zawierać komunikat, np.: `{"error":"Flashcard not found or already deleted."}` (ponieważ serwis sprawdza `is_deleted = false`)

## 4. Sprawdzenie Stanu Po Usunięciu

Te testy weryfikują, czy fiszka rzeczywiście została oznaczona jako usunięta i czy RLS (lub inna logika GET) poprawnie ją traktuje.

### 4.1. Próba pobrania usuniętej fiszki przez GET (oczekiwane 404)

**Przygotowanie:** Najpierw usuń fiszkę (test 1.1).

```bash
# Krok 1: Usuń fiszkę
# curl -X DELETE "http://localhost:3000/api/flashcards/FLASHCARD_ID_DELETED_FOR_GET_TEST" ...

# Krok 2: Spróbuj pobrać usuniętą fiszkę
curl -X GET "http://localhost:3000/api/flashcards/FLASHCARD_ID_DELETED_FOR_GET_TEST" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

**Oczekiwany wynik:**

- Kod statusu: `404 Not Found` (zakładając, że endpoint GET /api/flashcards/{id} honoruje flagę `is_deleted` lub jest objęty RLS filtrującym `is_deleted = false`).

### 4.2. Sprawdzenie listy fiszek (usunięta fiszka nie powinna być widoczna)

**Przygotowanie:** Najpierw usuń fiszkę (test 1.1).

```bash
# Krok 1: Usuń fiszkę
# curl -X DELETE "http://localhost:3000/api/flashcards/FLASHCARD_ID_DELETED_FOR_LIST_TEST" ...

# Krok 2: Pobierz listę fiszek
curl -X GET "http://localhost:3000/api/flashcards" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

**Oczekiwany wynik:**

- Kod statusu: `200 OK`
- W odpowiedzi JSON (w tablicy `data`), usunięta fiszka (`FLASHCARD_ID_DELETED_FOR_LIST_TEST`) nie powinna się znajdować.

## 5. Oczekiwane Struktury Odpowiedzi Błędów

### Błąd 400 (Bad Request - Invalid `flashcardId`)

```json
{
  "error": "Invalid flashcard ID format.",
  "details": ["Flashcard ID must be a valid UUID."]
}
```

### Błąd 401 (Unauthorized)

```json
{
  "error": "User not authenticated."
}
```

### Błąd 404 (Not Found - np. nie istnieje, należy do kogoś innego, już usunięta)

```json
{
  "error": "Flashcard not found or already deleted."
}
// lub bardziej generyczny, jeśli RLS ukrywa przyczynę
// {
//   "error": "Flashcard not found."

// }
```

### Błąd 500 (Internal Server Error)

```json
{
  "error": "Internal server error."
}
```

## 6. Pomocne Komendy do Przygotowania Testów

### 6.1. Uzyskanie listy własnych fiszek (do znalezienia `flashcardId` do usunięcia)

```bash
curl -X GET "http://localhost:3000/api/flashcards?limit=5" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE"
```

### 6.2. Utworzenie nowej fiszki (jeśli potrzebujesz świeżej do testów usuwania)

```bash
curl -X POST "http://localhost:3000/api/flashcards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "question": "Test question for DELETE scenario",
    "answer": "Test answer for DELETE"
  }'
```

Zwrócone ID można użyć jako `FLASHCARD_ID_TO_DELETE`.

## 7. Checklist Weryfikacji

- [ ] Endpoint zwraca `204 No Content` dla pomyślnego miękkiego usunięcia.
- [ ] Flaga `is_deleted` jest ustawiana na `true` w bazie danych.
- [ ] Pole `deleted_at` jest ustawiane na aktualny timestamp w bazie danych.
- [ ] Endpoint zwraca `401 Unauthorized` dla nieuwierzytelnionych żądań.
- [ ] Walidacja `flashcardId` (UUID) działa poprawnie, zwracając `400 Bad Request`.
- [ ] Endpoint zwraca `404 Not Found` przy próbie usunięcia nieistniejącej fiszki.
- [ ] Polityki RLS (lub logika serwisu) uniemożliwiają usunięcie fiszki innego użytkownika (zwracając `404`).
- [ ] Endpoint zwraca `404 Not Found` przy próbie ponownego usunięcia już usuniętej fiszki.
- [ ] Usunięta fiszka nie jest zwracana przez endpoint `GET /api/flashcards/{flashcardId}` (oczekiwane `404`).
- [ ] Usunięta fiszka nie jest listowana przez endpoint `GET /api/flashcards`.
- [ ] Obsługa błędów `500 Internal Server Error` działa w przypadku problemów z bazą danych (trudne do zasymulowania manualnie, ale ważne dla testów automatycznych).

## 8. Debugging Tips

1.  **Sprawdź logi serwera Astro:** Dostarczą informacji o przebiegu żądania, walidacji i błędach w handlerze API.
2.  **Sprawdź logi `flashcardService.ts`:** Jeśli logowanie zostało tam zaimplementowane, może dać wgląd w operacje na bazie danych.
3.  **Użyj flagi `-v` w cURL:** Aby zobaczyć pełne nagłówki żądania i odpowiedzi HTTP.
4.  **Weryfikuj stan w bazie danych Supabase:** Bezpośrednio sprawdzaj wartości `is_deleted` i `deleted_at` dla testowanej fiszki po wykonaniu operacji DELETE.
5.  **Sprawdź polityki RLS (Row Level Security) w Supabase:** Upewnij się, że polityki dla tabeli `flashcards` (szczególnie dla operacji `UPDATE` i `SELECT`) są poprawnie skonfigurowane i aktywne.
6.  **Sprawdź ważność tokenu JWT:** Upewnij się, że używany token jest aktualny i poprawny.
