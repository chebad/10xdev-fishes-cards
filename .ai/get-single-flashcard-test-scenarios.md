# Scenariusze Testowe dla GET /api/flashcards/{flashcardId}

## Przygotowanie do testów

**Base URL:** `http://localhost:3000`

**Uwaga:** Przed uruchomieniem testów zastąp `PUT_BEARER_TOKEN_HERE` w poniższych komendach swoim aktualnym tokenem JWT Bearer.

## 1. Testy Podstawowe

### 1.1. Test bez uwierzytelnienia (401)

```bash
curl -X GET "http://localhost:3000/api/flashcards/123e4567-e89b-12d3-a456-426614174000" \
  -H "Content-Type: application/json" \
  -v
```

**Oczekiwany wynik:** `401 Unauthorized`

### 1.2. Test z prawidłowym UUID fiszki (200)

```bash
curl -X GET "http://localhost:3000/api/flashcards/VALID_FLASHCARD_UUID_HERE" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

**Oczekiwany wynik:** `200 OK` z danymi fiszki

**Uwaga:** Zastąp `VALID_FLASHCARD_UUID_HERE` rzeczywistym UUID fiszki z Twojej bazy danych.

## 2. Testy Walidacji UUID

### 2.1. Test z nieprawidłowym formatem UUID (400)

```bash
curl -X GET "http://localhost:3000/api/flashcards/invalid-uuid-format" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

**Oczekiwany wynik:** `400 Bad Request` z błędem walidacji UUID

### 2.2. Test z pustym UUID (400)

```bash
curl -X GET "http://localhost:3000/api/flashcards/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

**Oczekiwany wynik:** `400 Bad Request` lub `404 Not Found` (zależnie od routingu Astro)

### 2.3. Test z UUID z nieprawidłowymi znakami (400)

```bash
curl -X GET "http://localhost:3000/api/flashcards/123e4567-e89b-12d3-a456-42661417400g" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

**Oczekiwany wynik:** `400 Bad Request`

## 3. Testy Dostępu i Bezpieczeństwa

### 3.1. Test dostępu do nieistniejącej fiszki (404)

```bash
curl -X GET "http://localhost:3000/api/flashcards/123e4567-e89b-12d3-a456-426614174999" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

**Oczekiwany wynik:** `404 Not Found`

### 3.2. Test dostępu do fiszki innego użytkownika (404)

```bash
curl -X GET "http://localhost:3000/api/flashcards/OTHER_USER_FLASHCARD_UUID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

**Oczekiwany wynik:** `404 Not Found` (dzięki RLS policy)

**Uwaga:** Aby przetestować ten scenariusz, potrzebujesz UUID fiszki należącej do innego użytkownika.

### 3.3. Test dostępu do usuniętej fiszki (404)

```bash
curl -X GET "http://localhost:3000/api/flashcards/DELETED_FLASHCARD_UUID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

**Oczekiwany wynik:** `404 Not Found` (dzięki RLS policy filtrującej `is_deleted = false`)

## 4. Testy Edge Cases

### 4.1. Test z bardzo długim UUID (400)

```bash
curl -X GET "http://localhost:3000/api/flashcards/123e4567-e89b-12d3-a456-426614174000-extra-characters" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

**Oczekiwany wynik:** `400 Bad Request`

### 4.2. Test z UUID w wielkich literach (200)

```bash
curl -X GET "http://localhost:3000/api/flashcards/123E4567-E89B-12D3-A456-426614174000" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

**Oczekiwany wynik:** `200 OK` lub `404 Not Found` (zależnie od tego czy fiszka istnieje)

### 4.3. Test z dodatkowym znakiem ukośnika (404/400)

```bash
curl -X GET "http://localhost:3000/api/flashcards/123e4567-e89b-12d3-a456-426614174000/extra" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

**Oczekiwany wynik:** `404 Not Found` (route nie zostanie dopasowany)

## 5. Testy Różnych Typów Fiszek

### 5.1. Test fiszki wygenerowanej przez AI

```bash
curl -X GET "http://localhost:3000/api/flashcards/AI_GENERATED_FLASHCARD_UUID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

**Oczekiwany wynik:** `200 OK` z `isAiGenerated: true` i `aiAcceptedAt` nie null

### 5.2. Test fiszki utworzonej manualnie

```bash
curl -X GET "http://localhost:3000/api/flashcards/MANUAL_FLASHCARD_UUID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

**Oczekiwany wynik:** `200 OK` z `isAiGenerated: false` i `aiAcceptedAt: null`

## 6. Oczekiwane Struktury Odpowiedzi

### Sukces (200 OK)

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "user-uuid-here",
  "question": "What is the capital of France?",
  "answer": "Paris",
  "sourceTextForAi": null,
  "isAiGenerated": false,
  "aiAcceptedAt": null,
  "createdAt": "2024-01-27T14:30:00Z",
  "updatedAt": "2024-01-27T14:30:00Z",
  "isDeleted": false
}
```

### Błąd 400 (Bad Request - Invalid UUID)

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

### Błąd 404 (Not Found)

```json
{
  "error": "Flashcard not found."
}
```

### Błąd 500 (Internal Server Error)

```json
{
  "error": "Internal server error."
}
```

## 7. Pomocne Komendy do Przygotowania Testów

### 7.1. Uzyskanie listy własnych fiszek (do znalezienia prawidłowych UUID)

```bash
curl -X GET "http://localhost:3000/api/flashcards?limit=5" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

### 7.2. Utworzenie nowej fiszki do testów

```bash
curl -X POST "http://localhost:3000/api/flashcards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "question": "Test question for GET endpoint",
    "answer": "Test answer",
    "isAiGenerated": false
  }' \
  -v
```

## 8. Checklist Weryfikacji

- [ ] Endpoint zwraca 401 dla nieuwierzytelnionych użytkowników
- [ ] Walidacja UUID działa poprawnie (400 dla nieprawidłowych formatów)
- [ ] Endpoint zwraca 404 dla nieistniejących fiszek
- [ ] RLS policy blokuje dostęp do fiszek innych użytkowników (404)
- [ ] RLS policy blokuje dostęp do usuniętych fiszek (404)
- [ ] Endpoint zwraca poprawną strukturę danych dla istniejących fiszek (200)
- [ ] Pola `isAiGenerated` i `aiAcceptedAt` są poprawnie mapowane
- [ ] Obsługa błędów 500 działa przy problemach z bazą danych
- [ ] UUID w różnych formatach (wielkie/małe litery) są obsługiwane
- [ ] Endpoint jest bezpieczny przed atakami injection

## 9. Testowanie Wydajności

### 9.1. Test równoczesnych żądań

```bash
# Uruchom kilka równoczesnych żądań
for i in {1..5}; do
  curl -X GET "http://localhost:3000/api/flashcards/VALID_FLASHCARD_UUID" \
    -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" &
done
wait
```

### 9.2. Test z różnymi UUID

```bash
# Test z listą różnych UUID (zastąp rzeczywistymi UUID)
UUIDS=("uuid1" "uuid2" "uuid3")
for uuid in "${UUIDS[@]}"; do
  curl -X GET "http://localhost:3000/api/flashcards/$uuid" \
    -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE"
  echo ""
done
```

## 10. Debugging Tips

1. **Sprawdź logi serwera** podczas testowania - endpoint loguje szczegóły żądań
2. **Użyj flagi `-v`** w curl aby zobaczyć pełne nagłówki HTTP
3. **Sprawdź RLS policies** w Supabase jeśli testy bezpieczeństwa nie przechodzą
4. **Weryfikuj tokeny JWT** - upewnij się, że token nie wygasł
5. **Sprawdź middleware** - upewnij się, że `session` i `supabase` są dostępne w `locals` 