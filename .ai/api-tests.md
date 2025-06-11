# Testy dla POST /api/flashcards

## Przegląd testów

Ten dokument zawiera przykłady testów dla endpointu `POST /api/flashcards` obejmujące różne scenariusze użycia oraz przypadki błędów.

## 1. Testy pomyślne (Success Cases)

### 1.1. Tworzenie ręcznej fiszki

**Żądanie:**

```bash
curl -X POST http://localhost:4321/api/flashcards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_VALID_JWT_TOKEN" \
  -d '{
    "question": "What is the capital of Poland?",
    "answer": "Warsaw"
  }'
```

**Oczekiwana odpowiedź:** `201 Created`

```json
{
  "id": "uuid",
  "userId": "uuid",
  "question": "What is the capital of Poland?",
  "answer": "Warsaw",
  "sourceTextForAi": null,
  "isAiGenerated": false,
  "aiAcceptedAt": null,
  "createdAt": "2024-01-01T12:00:00Z",
  "updatedAt": "2024-01-01T12:00:00Z",
  "isDeleted": false
}
```

### 1.2. Tworzenie fiszki AI-generated

**Żądanie:**

```bash
curl -X POST http://localhost:4321/api/flashcards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_VALID_JWT_TOKEN" \
  -d '{
    "question": "What is polymorphism in programming?",
    "answer": "Polymorphism is the ability of objects of different types to be treated as instances of the same type through a common interface.",
    "isAiGenerated": true,
    "sourceTextForAi": "Polymorphism is one of the core principles of object-oriented programming. It allows objects of different classes to be treated uniformly through a common interface. This enables code to work with objects at a more abstract level, making it more flexible and reusable. There are several types of polymorphism including runtime polymorphism (achieved through inheritance and virtual functions) and compile-time polymorphism (achieved through function overloading and templates)."
  }'
```

**Oczekiwana odpowiedź:** `201 Created`

```json
{
  "id": "uuid",
  "userId": "uuid",
  "question": "What is polymorphism in programming?",
  "answer": "Polymorphism is the ability of objects of different types to be treated as instances of the same type through a common interface.",
  "sourceTextForAi": "Polymorphism is one of the core principles...",
  "isAiGenerated": true,
  "aiAcceptedAt": "2024-01-01T12:00:00Z",
  "createdAt": "2024-01-01T12:00:00Z",
  "updatedAt": "2024-01-01T12:00:00Z",
  "isDeleted": false
}
```

## 2. Testy błędów walidacji (400 Bad Request)

### 2.1. Brakujące wymagane pole `question`

**Żądanie:**

```bash
curl -X POST http://localhost:4321/api/flashcards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_VALID_JWT_TOKEN" \
  -d '{
    "answer": "Warsaw"
  }'
```

**Oczekiwana odpowiedź:** `400 Bad Request`

```json
{
  "error": "Validation failed",
  "details": {
    "question": ["Required"]
  }
}
```

### 2.2. Za krótkie pytanie (mniej niż 5 znaków)

**Żądanie:**

```bash
curl -X POST http://localhost:4321/api/flashcards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_VALID_JWT_TOKEN" \
  -d '{
    "question": "Hi?",
    "answer": "Hello there"
  }'
```

**Oczekiwana odpowiedź:** `400 Bad Request`

```json
{
  "error": "Validation failed",
  "details": {
    "question": ["Question must be at least 5 characters long."]
  }
}
```

### 2.3. Za krótka odpowiedź (mniej niż 3 znaki)

**Żądanie:**

```bash
curl -X POST http://localhost:4321/api/flashcards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_VALID_JWT_TOKEN" \
  -d '{
    "question": "What is 1+1?",
    "answer": "2"
  }'
```

**Oczekiwana odpowiedź:** `400 Bad Request`

```json
{
  "error": "Validation failed",
  "details": {
    "answer": ["Answer must be at least 3 characters long."]
  }
}
```

### 2.4. Brak sourceTextForAi gdy isAiGenerated=true

**Żądanie:**

```bash
curl -X POST http://localhost:4321/api/flashcards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_VALID_JWT_TOKEN" \
  -d '{
    "question": "What is AI?",
    "answer": "Artificial Intelligence",
    "isAiGenerated": true
  }'
```

**Oczekiwana odpowiedź:** `400 Bad Request`

```json
{
  "error": "Validation failed",
  "details": {
    "sourceTextForAi": ["sourceTextForAi is required if isAiGenerated is true."]
  }
}
```

### 2.5. Nieprawidłowy format JSON

**Żądanie:**

```bash
curl -X POST http://localhost:4321/api/flashcards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_VALID_JWT_TOKEN" \
  -d '{
    "question": "What is AI?",
    "answer": "Artificial Intelligence"
    // missing comma
  }'
```

**Oczekiwana odpowiedź:** `400 Bad Request`

```json
{
  "error": "Invalid JSON body."
}
```

## 3. Testy błędów uwierzytelniania (401 Unauthorized)

### 3.1. Brak tokenu Authorization

**Żądanie:**

```bash
curl -X POST http://localhost:4321/api/flashcards \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is the capital of Poland?",
    "answer": "Warsaw"
  }'
```

**Oczekiwana odpowiedź:** `401 Unauthorized`

```json
{
  "error": "User not authenticated."
}
```

### 3.2. Nieprawidłowy token JWT

**Żądanie:**

```bash
curl -X POST http://localhost:4321/api/flashcards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid_token_here" \
  -d '{
    "question": "What is the capital of Poland?",
    "answer": "Warsaw"
  }'
```

**Oczekiwana odpowiedź:** `401 Unauthorized`

```json
{
  "error": "User not authenticated."
}
```

### 3.3. Wygasły token JWT

**Żądanie:**

```bash
curl -X POST http://localhost:4321/api/flashcards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer EXPIRED_JWT_TOKEN" \
  -d '{
    "question": "What is the capital of Poland?",
    "answer": "Warsaw"
  }'
```

**Oczekiwana odpowiedź:** `401 Unauthorized`

```json
{
  "error": "User not authenticated."
}
```

## 4. Testy przypadków granicznych (Edge Cases)

### 4.1. Maksymalne długości pól

**Żądanie z bardzo długim pytaniem i odpowiedzią:**

```bash
curl -X POST http://localhost:4321/api/flashcards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_VALID_JWT_TOKEN" \
  -d '{
    "question": "'"$(printf 'A%.0s' {1..995})"'?",
    "answer": "'"$(printf 'B%.0s' {1..5000})"'"
  }'
```

**Oczekiwana odpowiedź:** `201 Created` (jeśli mieści się w limitach DB) lub `400/500` w przypadku przekroczenia

### 4.2. Znaki specjalne i Unicode

**Żądanie:**

```bash
curl -X POST http://localhost:4321/api/flashcards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_VALID_JWT_TOKEN" \
  -d '{
    "question": "Co znaczy 🚀 emoji?",
    "answer": "To jest emoji rakiety używane do wyrażenia entuzjazmu lub postępu"
  }'
```

**Oczekiwana odpowiedź:** `201 Created`

## 5. Scenariusze testów automatycznych

### Testy jednostkowe (Unit Tests)

```typescript
// Przykład testu dla FlashcardService
describe("FlashcardService", () => {
  it("should create flashcard with correct data mapping", async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockFlashcardData,
              error: null,
            }),
          }),
        }),
      }),
    };

    const service = new FlashcardService(mockSupabase as any);
    const command: CreateFlashcardCommand = {
      question: "Test question",
      answer: "Test answer",
    };

    const result = await service.createFlashcard(command, "user-id");

    expect(mockSupabase.from).toHaveBeenCalledWith("flashcards");
    expect(result.question).toBe("Test question");
  });
});
```

### Testy integracyjne (Integration Tests)

```typescript
// Przykład testu integracyjnego dla całego endpointu
describe("POST /api/flashcards", () => {
  it("should create flashcard and return 201", async () => {
    const response = await fetch("/api/flashcards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${validToken}`,
      },
      body: JSON.stringify({
        question: "Integration test question",
        answer: "Integration test answer",
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.question).toBe("Integration test question");
    expect(data.isDeleted).toBe(false);
  });
});
```

## 6. Checklist testowania

- [ ] Przypadek pomyślny - tworzenie ręcznej fiszki
- [ ] Przypadek pomyślny - tworzenie fiszki AI-generated z sourceTextForAi
- [ ] Walidacja - brakujące pole question
- [ ] Walidacja - brakujące pole answer
- [ ] Walidacja - za krótkie question (< 5 znaków)
- [ ] Walidacja - za krótka answer (< 3 znaki)
- [ ] Walidacja - brak sourceTextForAi gdy isAiGenerated=true
- [ ] Walidacja - pustý sourceTextForAi gdy isAiGenerated=true
- [ ] Błędy JSON - nieprawidłowy format
- [ ] Uwierzytelnianie - brak tokenu
- [ ] Uwierzytelnianie - nieprawidłowy token
- [ ] Uwierzytelnianie - wygasły token
- [ ] Edge case - maksymalne długości pól
- [ ] Edge case - znaki specjalne i Unicode
- [ ] Edge case - wszystkie opcjonalne pola wypełnione
- [ ] Sprawdzenie, czy RLS działa (użytkownik nie może tworzyć fiszek dla innych)
- [ ] Sprawdzenie poprawności mapowania DTO w odpowiedzi
- [ ] Sprawdzenie logowania błędów po stronie serwera
