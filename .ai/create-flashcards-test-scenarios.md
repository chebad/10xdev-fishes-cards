# Scenariusze Testowe dla POST /api/flashcards

## Przygotowanie do testów

**Base URL:** `http://localhost:3000`

**Uwaga:** Przed uruchomieniem testów zastąp `PUT_BEARER_TOKEN_HERE` w poniższych komendach swoim aktualnym tokenem JWT Bearer.

## 1. Testy Podstawowe

### 1.1. Test bez uwierzytelnienia (401)

```bash
curl -X POST "http://localhost:3000/api/flashcards" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is Test Driven Development?",
    "answer": "A software development process relying on software requirements being converted to test cases before software is fully developed."
  }' \
  -v
```

**Oczekiwany wynik:** `401 Unauthorized`

### 1.2. Test poprawnego utworzenia fiszki (201)

```bash
curl -X POST "http://localhost:3000/api/flashcards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "question": "What is BDD?",
    "answer": "Behavior Driven Development is a software development process that emerged from TDD."
  }' \
  -v
```

**Oczekiwany wynik:** `201 Created` z danymi utworzonej fiszki.

### 1.3. Test utworzenia fiszki wygenerowanej przez AI (201)

```bash
curl -X POST "http://localhost:3000/api/flashcards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "question": "Explain the concept of closures in JavaScript.",
    "answer": "A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment).",
    "isAiGenerated": true,
    "sourceTextForAi": "Closures are a fundamental JavaScript concept..."
  }' \
  -v
```

**Oczekiwany wynik:** `201 Created` z `isAiGenerated: true` i ustawionym `aiAcceptedAt`.

## 2. Testy Walidacji Danych Wejściowych (400 Bad Request)

### 2.1. Brakujące pole `question`

```bash
curl -X POST "http://localhost:3000/api/flashcards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "answer": "An answer without a question."
  }' \
  -v
```

### 2.2. Brakujące pole `answer`

```bash
curl -X POST "http://localhost:3000/api/flashcards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "question": "A question without an answer?"
  }' \
  -v
```

### 2.3. Za krótkie pole `question` (mniej niż 5 znaków)

```bash
curl -X POST "http://localhost:3000/api/flashcards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "question": "Hi",
    "answer": "Short question test."
  }' \
  -v
```

### 2.4. Za krótkie pole `answer` (mniej niż 3 znaki)

```bash
curl -X POST "http://localhost:3000/api/flashcards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "question": "Test short answer",
    "answer": "Ok"
  }' \
  -v
```

### 2.5. `isAiGenerated` ustawione na true, ale brak `sourceTextForAi`

```bash
curl -X POST "http://localhost:3000/api/flashcards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "question": "AI question without source",
    "answer": "This should fail.",
    "isAiGenerated": true
  }' \
  -v
```

### 2.6. Nieprawidłowy typ danych (np. `question` jako liczba)

```bash
curl -X POST "http://localhost:3000/api/flashcards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "question": 12345,
    "answer": "Answer for a numeric question."
  }' \
  -v
```

### 2.7. Pusty JSON w ciele żądania

```bash
curl -X POST "http://localhost:3000/api/flashcards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{}' \
  -v
```

### 2.8. Nieprawidłowy JSON (błąd parsowania)

```bash
curl -X POST "http://localhost:3000/api/flashcards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{"question": "Test", "answer": "Test"' \
  -v
```

## 3. Oczekiwane Struktury Odpowiedzi

### Sukces (201 Created)

```json
{
  "id": "uuid",
  "userId": "uuid",
  "question": "string",
  "answer": "string",
  "sourceTextForAi": "string | null",
  "isAiGenerated": false,
  "aiAcceptedAt": "timestamp | null",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "isDeleted": false
}
```

### Błąd 400 (Bad Request - błędy walidacji Zod)

```json
{
  "error": "Validation failed",
  "details": {
    "question": [
      "Question must be at least 5 characters long."
    ]
  }
}
```

### Błąd 400 (Bad Request - nieprawidłowy JSON)

```json
{
  "error": "Invalid JSON body."
}
```

### Błąd 401 (Unauthorized)

```json
{
  "error": "User not authenticated."
}
```

### Błąd 500 (Internal Server Error)

```json
{
  "error": "Failed to create flashcard due to a server error."
}
```

## 4. Checklist Weryfikacji

- [ ] Endpoint zwraca 401 dla nieuwierzytelnionych użytkowników.
- [ ] Poprawne żądanie tworzy fiszkę i zwraca 201 z danymi fiszki.
- [ ] Poprawne żądanie z `isAiGenerated: true` i `sourceTextForAi` tworzy fiszkę AI.
- [ ] Brakujące wymagane pola (`question`, `answer`) skutkują błędem 400.
- [ ] Za krótkie pola (`question` < 5, `answer` < 3) skutkują błędem 400.
- [ ] Ustawienie `isAiGenerated: true` bez `sourceTextForAi` skutkuje błędem 400.
- [ ] Nieprawidłowe typy danych w żądaniu skutkują błędem 400.
- [ ] Puste lub nieprawidłowe ciało JSON skutkuje błędem 400.
- [ ] Pola `userId`, `createdAt`, `updatedAt`, `isDeleted` są poprawnie ustawiane przez serwer.
- [ ] Pole `aiAcceptedAt` jest ustawiane, gdy `isAiGenerated` jest `true`.
- [ ] Struktura odpowiedzi jest zgodna ze specyfikacją.
