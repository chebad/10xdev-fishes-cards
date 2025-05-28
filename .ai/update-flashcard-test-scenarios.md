# Scenariusze Testowe dla PATCH /api/flashcards/{flashcardId}

## Przygotowanie do testów

**Base URL:** `http://localhost:3000`

**Uwaga:** Przed uruchomieniem testów zastąp `PUT_BEARER_TOKEN_HERE` w poniższych komendach swoim aktualnym tokenem JWT Bearer.

## 1. Testy Podstawowe

### 1.1. Test bez uwierzytelnienia (401)

```bash
curl -X PATCH "http://localhost:3000/api/flashcards/123e4567-e89b-12d3-a456-426614174000" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Zaktualizowane pytanie?"
  }' \
  -v
```

**Oczekiwany wynik:** `401 Unauthorized`

### 1.2. Test pomyślnej aktualizacji - tylko pytanie (200)

```bash
curl -X PATCH "http://localhost:3000/api/flashcards/VALID_FLASHCARD_UUID_HERE" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "question": "Zaktualizowane pytanie - co to jest TypeScript?"
  }' \
  -v
```

**Oczekiwany wynik:** `200 OK` z zaktualizowanymi danymi fiszki

### 1.3. Test pomyślnej aktualizacji - tylko odpowiedź (200)

```bash
curl -X PATCH "http://localhost:3000/api/flashcards/VALID_FLASHCARD_UUID_HERE" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "answer": "TypeScript to superset JavaScriptu dodający statyczne typowanie - zaktualizowana odpowiedź."
  }' \
  -v
```

**Oczekiwany wynik:** `200 OK` z zaktualizowanymi danymi fiszki

### 1.4. Test pomyślnej aktualizacji - oba pola (200)

```bash
curl -X PATCH "http://localhost:3000/api/flashcards/VALID_FLASHCARD_UUID_HERE" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "question": "Kompletnie nowe pytanie o React?",
    "answer": "React to biblioteka JavaScript do budowania interfejsów użytkownika."
  }' \
  -v
```

**Oczekiwany wynik:** `200 OK` z zaktualizowanymi danymi fiszki

**Uwaga:** Zastąp `VALID_FLASHCARD_UUID_HERE` rzeczywistym UUID fiszki z Twojej bazy danych.

## 2. Testy Walidacji UUID

### 2.1. Test z nieprawidłowym formatem UUID (400)

```bash
curl -X PATCH "http://localhost:3000/api/flashcards/invalid-uuid-format" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "question": "Prawidłowe pytanie?"
  }' \
  -v
```

**Oczekiwany wynik:** `400 Bad Request` z błędem walidacji UUID

### 2.2. Test z UUID z nieprawidłowymi znakami (400)

```bash
curl -X PATCH "http://localhost:3000/api/flashcards/123e4567-e89b-12d3-a456-42661417400g" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "question": "Prawidłowe pytanie?"
  }' \
  -v
```

**Oczekiwany wynik:** `400 Bad Request`

### 2.3. Test z UUID w wielkich literach (200/404)

```bash
curl -X PATCH "http://localhost:3000/api/flashcards/123E4567-E89B-12D3-A456-426614174000" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "question": "Pytanie z wielkich liter UUID?"
  }' \
  -v
```

**Oczekiwany wynik:** `200 OK` lub `404 Not Found` (zależnie od tego czy fiszka istnieje)

## 3. Testy Walidacji Ciała Żądania

### 3.1. Test z pustym ciałem żądania (400)

```bash
curl -X PATCH "http://localhost:3000/api/flashcards/VALID_FLASHCARD_UUID_HERE" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{}' \
  -v
```

**Oczekiwany wynik:** `400 Bad Request` z komunikatem "At least one field (question or answer) must be provided for update."

### 3.2. Test z za krótkim pytaniem (400)

```bash
curl -X PATCH "http://localhost:3000/api/flashcards/VALID_FLASHCARD_UUID_HERE" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "question": "Co?"
  }' \
  -v
```

**Oczekiwany wynik:** `400 Bad Request` z komunikatem "Question must be at least 5 characters long."

### 3.3. Test z za krótką odpowiedzią (400)

```bash
curl -X PATCH "http://localhost:3000/api/flashcards/VALID_FLASHCARD_UUID_HERE" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "answer": "X"
  }' \
  -v
```

**Oczekiwany wynik:** `400 Bad Request` z komunikatem "Answer must be at least 3 characters long."

### 3.4. Test z nieprawidłowym formatem JSON (400)

```bash
curl -X PATCH "http://localhost:3000/api/flashcards/VALID_FLASHCARD_UUID_HERE" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{ invalid json' \
  -v
```

**Oczekiwany wynik:** `400 Bad Request` z komunikatem "Invalid JSON format in request body."

### 3.5. Test z nieobsługiwanymi polami (200)

```bash
curl -X PATCH "http://localhost:3000/api/flashcards/VALID_FLASHCARD_UUID_HERE" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "question": "Prawidłowe pytanie?",
    "extraField": "To pole powinno zostać zignorowane"
  }' \
  -v
```

**Oczekiwany wynik:** `200 OK` (dodatkowe pola są ignorowane przez Zod)

## 4. Testy Dostępu i Bezpieczeństwa

### 4.1. Test aktualizacji nieistniejącej fiszki (404)

```bash
curl -X PATCH "http://localhost:3000/api/flashcards/123e4567-e89b-12d3-a456-426614174999" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "question": "Pytanie do nieistniejącej fiszki?"
  }' \
  -v
```

**Oczekiwany wynik:** `404 Not Found`

### 4.2. Test aktualizacji fiszki innego użytkownika (404)

```bash
curl -X PATCH "http://localhost:3000/api/flashcards/OTHER_USER_FLASHCARD_UUID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "question": "Pytanie do fiszki innego użytkownika?"
  }' \
  -v
```

**Oczekiwany wynik:** `404 Not Found` (dzięki RLS policy)

**Uwaga:** Aby przetestować ten scenariusz, potrzebujesz UUID fiszki należącej do innego użytkownika.

### 4.3. Test aktualizacji usuniętej fiszki (404)

```bash
curl -X PATCH "http://localhost:3000/api/flashcards/DELETED_FLASHCARD_UUID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "question": "Pytanie do usuniętej fiszki?"
  }' \
  -v
```

**Oczekiwany wynik:** `404 Not Found` (dzięki RLS policy filtrującej `is_deleted = false`)

## 5. Testy Edge Cases

### 5.1. Test z bardzo długim pytaniem (200)

```bash
curl -X PATCH "http://localhost:3000/api/flashcards/VALID_FLASHCARD_UUID_HERE" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "question": "'"$(printf 'A%.0s' {1..500})"' - bardzo długie pytanie?"
  }' \
  -v
```

**Oczekiwany wynik:** `200 OK` (brak limitu górnego w schemacie)

### 5.2. Test z bardzo długą odpowiedzią (200)

```bash
curl -X PATCH "http://localhost:3000/api/flashcards/VALID_FLASHCARD_UUID_HERE" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "answer": "'"$(printf 'A%.0s' {1..1000})"' - bardzo długa odpowiedź."
  }' \
  -v
```

**Oczekiwany wynik:** `200 OK` (brak limitu górnego w schemacie)

### 5.3. Test z dodatkowymi spacjami w polach (200)

```bash
curl -X PATCH "http://localhost:3000/api/flashcards/VALID_FLASHCARD_UUID_HERE" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "question": "  Pytanie z przestrzeniami na początku i końcu  ",
    "answer": "  Odpowiedź z przestrzeniami  "
  }' \
  -v
```

**Oczekiwany wynik:** `200 OK` (spacje są zachowane)

## 6. Testy Różnych Typów Fiszek

### 6.1. Test aktualizacji fiszki wygenerowanej przez AI

```bash
curl -X PATCH "http://localhost:3000/api/flashcards/AI_GENERATED_FLASHCARD_UUID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "question": "Zaktualizowane pytanie AI fiszki?"
  }' \
  -v
```

**Oczekiwany wynik:** `200 OK` z zachowaniem `isAiGenerated: true`, `aiAcceptedAt` i `sourceTextForAi`

### 6.2. Test aktualizacji fiszki utworzonej manualnie

```bash
curl -X PATCH "http://localhost:3000/api/flashcards/MANUAL_FLASHCARD_UUID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "answer": "Zaktualizowana odpowiedź manualnej fiszki."
  }' \
  -v
```

**Oczekiwany wynik:** `200 OK` z `isAiGenerated: false` i `aiAcceptedAt: null`

## 7. Oczekiwane Struktury Odpowiedzi

### Sukces (200 OK)

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "user-uuid-here",
  "question": "Zaktualizowane pytanie - co to jest TypeScript?",
  "answer": "TypeScript to superset JavaScriptu dodający statyczne typowanie - zaktualizowana odpowiedź.",
  "sourceTextForAi": null,
  "isAiGenerated": false,
  "aiAcceptedAt": null,
  "createdAt": "2024-01-27T14:30:00Z",
  "updatedAt": "2024-01-27T14:35:00Z",
  "isDeleted": false
}
```

### Błąd 400 (Bad Request - Invalid UUID)

```json
{
  "error": "Validation failed",
  "details": {
    "flashcardId": ["Invalid flashcard ID format."]
  }
}
```

### Błąd 400 (Bad Request - Validation Failed)

```json
{
  "error": "Validation failed",
  "details": {
    "question": ["Question must be at least 5 characters long."]
  }
}
```

### Błąd 400 (Bad Request - No Fields Provided)

```json
{
  "error": "Validation failed",
  "details": {
    "_errors": ["At least one field (question or answer) must be provided for update."]
  }
}
```

### Błąd 400 (Bad Request - Invalid JSON)

```json
{
  "error": "Invalid JSON format in request body."
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

## 8. Pomocne Komendy do Przygotowania Testów

### 8.1. Uzyskanie listy własnych fiszek (do znalezienia prawidłowych UUID)

```bash
curl -X GET "http://localhost:3000/api/flashcards?limit=5" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

### 8.2. Pobranie konkretnej fiszki przed aktualizacją

```bash
curl -X GET "http://localhost:3000/api/flashcards/VALID_FLASHCARD_UUID_HERE" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

### 8.3. Utworzenie nowej fiszki do testów aktualizacji

```bash
curl -X POST "http://localhost:3000/api/flashcards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "question": "Test question for PATCH endpoint",
    "answer": "Test answer",
    "isAiGenerated": false
  }' \
  -v
```

## 9. Checklist Weryfikacji

- [ ] Endpoint zwraca 401 dla nieuwierzytelnionych użytkowników
- [ ] Walidacja UUID działa poprawnie (400 dla nieprawidłowych formatów)
- [ ] Walidacja ciała żądania działa poprawnie (400 dla nieprawidłowych danych)
- [ ] Endpoint zwraca 404 dla nieistniejących fiszek
- [ ] RLS policy blokuje aktualizację fiszek innych użytkowników (404)
- [ ] RLS policy blokuje aktualizację usuniętych fiszek (404)
- [ ] Endpoint zwraca poprawną strukturę danych dla pomyślnych aktualizacji (200)
- [ ] Pole `updatedAt` jest automatycznie aktualizowane przez trigger bazodanowy
- [ ] Pola `isAiGenerated`, `aiAcceptedAt` i `sourceTextForAi` są zachowane podczas aktualizacji
- [ ] Obsługa błędów 500 działa przy problemach z bazą danych
- [ ] Endpoint jest bezpieczny przed atakami injection
- [ ] Dodatkowe pola w JSON są ignorowane (nie powodują błędów)

## 10. Testowanie Wydajności

### 10.1. Test równoczesnych żądań aktualizacji

```bash
# Uruchom kilka równoczesnych żądań aktualizacji (różne fiszki)
for i in {1..5}; do
  curl -X PATCH "http://localhost:3000/api/flashcards/VALID_FLASHCARD_UUID_$i" \
    -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
    -H "Content-Type: application/json" \
    -d "{\"question\": \"Updated question $i\"}" &
done
wait
```

### 10.2. Test z różnymi UUID i danymi

```bash
# Test z listą różnych UUID (zastąp rzeczywistymi UUID)
UUIDS=("uuid1" "uuid2" "uuid3")
for i in "${!UUIDS[@]}"; do
  curl -X PATCH "http://localhost:3000/api/flashcards/${UUIDS[$i]}" \
    -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
    -H "Content-Type: application/json" \
    -d "{\"answer\": \"Updated answer $i\"}"
  echo ""
done
```

## 11. Debugging Tips

1. **Sprawdź logi serwera** podczas testowania - endpoint loguje szczegóły żądań i błędów
2. **Użyj flagi `-v`** w curl aby zobaczyć pełne nagłówki HTTP
3. **Sprawdź RLS policies** w Supabase jeśli testy bezpieczeństwa nie przechodzą
4. **Weryfikuj tokeny JWT** - upewnij się, że token nie wygasł
5. **Sprawdź middleware** - upewnij się, że `session` i `supabase` są dostępne w `locals`
6. **Monitoruj trigger bazodanowy** - sprawdź czy `updated_at` jest automatycznie aktualizowane
7. **Testuj walidację Zod** - sprawdź dokładne komunikaty błędów dla lepszego debugowania
