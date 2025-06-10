# Scenariusze Testowe dla GET /api/flashcards

## Przygotowanie do testów

**Base URL:** `http://localhost:3000`

**Uwaga:** Przed uruchomieniem testów zastąp `PUT_BEARER_TOKEN_HERE` w poniższych komendach swoim aktualnym tokenem JWT Bearer.

## 1. Testy Podstawowe

### 1.1. Test bez uwierzytelnienia (401)

```bash
curl -X GET "http://localhost:3000/api/flashcards" \
  -H "Content-Type: application/json" \
  -v
```

**Oczekiwany wynik:** `401 Unauthorized`

### 1.2. Test z podstawowymi parametrami domyślnymi (200)

```bash
curl -X GET "http://localhost:3000/api/flashcards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

**Oczekiwany wynik:** `200 OK` z domyślnymi parametrami (page=1, limit=10, sortBy=createdAt, sortOrder=desc)

## 2. Testy Paginacji

### 2.1. Test z niestandardową paginacją

```bash
curl -X GET "http://localhost:3000/api/flashcards?page=2&limit=5" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

### 2.2. Test z nieprawidłową paginacją (400)

```bash
curl -X GET "http://localhost:3000/api/flashcards?page=0&limit=200" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

**Oczekiwany wynik:** `400 Bad Request` z błędami walidacji

## 3. Testy Sortowania

### 3.1. Sortowanie po pytaniu (rosnąco)

```bash
curl -X GET "http://localhost:3000/api/flashcards?sortBy=question&sortOrder=asc" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

### 3.2. Sortowanie po dacie aktualizacji (malejąco)

```bash
curl -X GET "http://localhost:3000/api/flashcards?sortBy=updatedAt&sortOrder=desc" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

### 3.3. Nieprawidłowe pole sortowania (400)

```bash
curl -X GET "http://localhost:3000/api/flashcards?sortBy=invalidField" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

**Oczekiwany wynik:** `400 Bad Request`

## 4. Testy Wyszukiwania

### 4.1. Wyszukiwanie podstawowe

```bash
curl -X GET "http://localhost:3000/api/flashcards?search=javascript" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

### 4.2. Wyszukiwanie z pustym terminem

```bash
curl -X GET "http://localhost:3000/api/flashcards?search=" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

### 4.3. Wyszukiwanie ze znakami specjalnymi

```bash
curl -X GET "http://localhost:3000/api/flashcards?search=test%25_special" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

## 5. Testy Filtrowania AI

### 5.1. Filtrowanie fiszek wygenerowanych przez AI

```bash
curl -X GET "http://localhost:3000/api/flashcards?isAiGenerated=true" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

### 5.2. Filtrowanie fiszek NIE wygenerowanych przez AI

```bash
curl -X GET "http://localhost:3000/api/flashcards?isAiGenerated=false" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

## 6. Testy Kombinacji Parametrów

### 6.1. Test z wszystkimi parametrami

```bash
curl -X GET "http://localhost:3000/api/flashcards?page=1&limit=3&sortBy=question&sortOrder=asc&search=test&isAiGenerated=false" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

## 7. Testy Edge Cases

### 7.1. Test strony poza zakresem

```bash
curl -X GET "http://localhost:3000/api/flashcards?page=999" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

**Oczekiwany wynik:** `200 OK` z pustą tablicą `data` ale prawidłowymi `pagination` details

### 7.2. Test z wyszukiwaniem bez wyników

```bash
curl -X GET "http://localhost:3000/api/flashcards?search=nonexistentterm12345" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -v
```

## 8. Oczekiwane Struktury Odpowiedzi

### Sukces (200 OK)

```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "question": "string",
      "answer": "string",
      "isAiGenerated": false,
      "aiAcceptedAt": null,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "limit": 10
  }
}
```

### Błąd 400 (Bad Request)

```json
{
  "message": "Invalid query parameters",
  "errors": {
    "page": ["Number must be greater than or equal to 1"]
  }
}
```

### Błąd 401 (Unauthorized)

```json
{
  "message": "Unauthorized"
}
```

### Błąd 500 (Internal Server Error)

```json
{
  "message": "Internal Server Error"
}
```

## 9. Checklist Weryfikacji

- [ ] Endpoint zwraca 401 dla nieuwierzytelnionych użytkowników
- [ ] Domyślne parametry działają poprawnie (page=1, limit=10, sortBy=createdAt, sortOrder=desc)
- [ ] Paginacja działa poprawnie z różnymi wartościami page i limit
- [ ] Walidacja parametrów zwraca 400 dla nieprawidłowych wartości
- [ ] Sortowanie działa dla wszystkich dozwolonych pól (createdAt, updatedAt, question)
- [ ] Wyszukiwanie tekstowe działa (case-insensitive, częściowe dopasowanie)
- [ ] Filtrowanie po isAiGenerated działa poprawnie
- [ ] Kombinacje parametrów działają razem
- [ ] Edge cases są obsługiwane (strona poza zakresem, brak wyników)
- [ ] Struktura odpowiedzi jest zgodna ze specyfikacją
- [ ] RLS zapewnia, że użytkownicy widzą tylko własne fiszki
- [ ] Tylko nieusunięte fiszki są zwracane (is_deleted = false)
