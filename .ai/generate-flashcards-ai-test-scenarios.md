# Scenariusze Testowe: POST /api/flashcards/generate-ai

## Przygotowanie do testów

**Base URL:** `http://localhost:3000`

**Uwaga:** Przed uruchomieniem testów zastąp `PUT_BEARER_TOKEN_HERE` w poniższych komendach swoim aktualnym tokenem JWT Bearer. Upewnij się również, że zmienna środowiskowa `OPENAI_API_KEY` jest poprawnie skonfigurowana po stronie serwera.

## 1. Testy Poprawnych Scenariuszy (Happy Path)

### 1.1. Podstawowe generowanie AI fiszek (200 OK)

```bash
curl -X POST "http://localhost:3000/api/flashcards/generate-ai" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "sourceText": "Fotosynteza to proces biologiczny zachodzący w roślinach, podczas którego energia świetlna jest przekształcana w energię chemiczną. W tym procesie rośliny wykorzystują dwutlenek węgla z atmosfery oraz wodę z gleby. Dzięki obecności chlorofilu w liściach, rośliny potrafią pochłaniać światło słoneczne i przekształcać je w glukozę. Produktami ubocznymi fotosyntezy są tlen i woda. Proces ten jest fundamentalny dla życia na Ziemi, ponieważ produkuje tlen niezbędny dla oddychania większości organizmów. Fotosynteza składa się z dwóch głównych faz: reakcji świetlnych i cyklu Calvina. Reakcje świetlne zachodzą w tylakoidach chloroplastów, gdzie energia światła jest wykorzystywana do rozbicia cząsteczek wody i produkcji ATP oraz NADPH. Cykl Calvina odbywa się w stromie chloroplastów, gdzie dwutlenek węgla jest wiązany i przekształcany w glukozę przy użyciu energii z ATP i NADPH wyprodukowanych wcześniej. Ten złożony proces pozwala roślinom na wytwarzanie własnego pożywienia i jest podstawą większości łańcuchów pokarmowych na naszej planecie."
  }' \
  -v
```

**Oczekiwany wynik:** `200 OK` z listą sugestii fiszek.

### 1.2. Generowanie z tekstem o minimalnej długości (1000 znaków) (200 OK)

```bash
# Przygotuj sourceText o długości dokładnie 1000 znaków
TEXT_1000_CHARS="$(printf '%0.sLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.X' {1..1})" # Upewnij się, że tekst ma 1000 znaków

curl -X POST "http://localhost:3000/api/flashcards/generate-ai" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d "{\"sourceText\": \"$TEXT_1000_CHARS\"}" \
  -v
```

**Oczekiwany wynik:** `200 OK`.

### 1.3. Generowanie z tekstem o maksymalnej długości (10000 znaków) (200 OK)

```bash
# Przygotuj sourceText o długości dokładnie 10000 znaków
# Ze względu na ograniczenia długości polecenia, ten tekst należy przygotować w pliku lub skrypcie
# Przykład: head -c 10000 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9 ' | head -c 10000 > long_text.txt
# JSON_PAYLOAD=$(jq -n --arg text "$(cat long_text.txt)" '{sourceText: $text}')

# curl -X POST "http://localhost:3000/api/flashcards/generate-ai" \
#   -H "Content-Type: application/json" \
#   -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
#   -d "$JSON_PAYLOAD" \
#   -v
```

**Opis:** Test wymaga przygotowania bardzo długiego tekstu. Manualnie przygotuj tekst o długości 10000 znaków.
**Oczekiwany wynik:** `200 OK`.

## 2. Testy Walidacji (400 Bad Request)

### 2.1. Brak pola `sourceText`

```bash
curl -X POST "http://localhost:3000/api/flashcards/generate-ai" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{}' \
  -v
```

**Oczekiwany wynik:** `400 Bad Request` z `{"error":"Validation failed","details":{"sourceText":["Source text is required."]}}`.

### 2.2. `sourceText` zbyt krótki (< 1000 znaków)

```bash
curl -X POST "http://localhost:3000/api/flashcards/generate-ai" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "sourceText": "Krótki tekst."
  }' \
  -v
```

**Oczekiwany wynik:** `400 Bad Request` z `{"error":"Validation failed","details":{"sourceText":["Source text must be between 1000 and 10000 characters."]}}`.

### 2.3. `sourceText` zbyt długi (> 10000 znaków)

**Opis:** Test wymaga przygotowania tekstu > 10000 znaków.

```bash
# Przygotuj tekst > 10000 znaków i wyślij analogicznie do testu 1.3
```

**Oczekiwany wynik:** `400 Bad Request` z `{"error":"Validation failed","details":{"sourceText":["Source text must be between 1000 and 10000 characters."]}}`.

### 2.4. Nieprawidłowy format JSON

```bash
curl -X POST "http://localhost:3000/api/flashcards/generate-ai" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "sourceText": "Nieprawidłowy JSON' \
  -v # Brakujący zamykający nawias klamrowy
```

**Oczekiwany wynik:** `400 Bad Request` z `{"error":"Invalid JSON body."}`.

### 2.5. Pusty `sourceText`

```bash
curl -X POST "http://localhost:3000/api/flashcards/generate-ai" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PUT_BEARER_TOKEN_HERE" \
  -d '{
    "sourceText": ""
  }' \
  -v
```

**Oczekiwany wynik:** `400 Bad Request` z `{"error":"Validation failed","details":{"sourceText":["Source text must be between 1000 and 10000 characters."]}}`.

## 3. Testy Uwierzytelniania (401 Unauthorized)

### 3.1. Brak nagłówka `Authorization`

```bash
curl -X POST "http://localhost:3000/api/flashcards/generate-ai" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceText": "Poprawny tekst o odpowiedniej długości, np. ten z testu 1.1"
  }' \
  -v
```

**Oczekiwany wynik:** `401 Unauthorized` z `{"error":"User not authenticated"}`.

### 3.2. Nieprawidłowy JWT token

```bash
curl -X POST "http://localhost:3000/api/flashcards/generate-ai" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer NIEPRAWIDLOWY_TOKEN" \
  -d '{
    "sourceText": "Poprawny tekst o odpowiedniej długości, np. ten z testu 1.1"
  }' \
  -v
```

**Oczekiwany wynik:** `401 Unauthorized` z `{"error":"User not authenticated"}`.

### 3.3. Wygasły JWT token

**Opis:** Wymaga użycia tokena, który stracił ważność.

```bash
curl -X POST "http://localhost:3000/api/flashcards/generate-ai" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer WYGASLY_TOKEN" \
  -d '{
    "sourceText": "Poprawny tekst o odpowiedniej długości, np. ten z testu 1.1"
  }' \
  -v
```

**Oczekiwany wynik:** `401 Unauthorized` z `{"error":"User not authenticated"}`.

## 4. Testy Błędów OpenAI API (500/503)

### 4.1. Brak klucza API OpenAI (500)

**Warunki:** Zmienna środowiskowa `OPENAI_API_KEY` nie jest ustawiona lub jest pusta na serwerze.
**Oczekiwany wynik:** `500 Internal Server Error` z `{"error":"AI service configuration error."}`.

### 4.2. Nieprawidłowy klucz API OpenAI (503)

**Warunki:** `OPENAI_API_KEY` zawiera nieprawidłowy klucz.
**Oczekiwany wynik:** `503 Service Unavailable` z `{"error":"The AI service encountered an error. Please try again later."}`.

### 4.3. Timeout OpenAI API (503)

**Warunki:** OpenAI API nie odpowiada w ciągu 30 sekund (wymaga symulacji lub rzeczywistego problemu z API).
**Oczekiwany wynik:** `503 Service Unavailable` z `{"error":"The AI service is temporarily unavailable. Please try again later."}`.

### 4.4. OpenAI API zwraca błąd 500 (503)

**Warunki:** OpenAI API zwraca wewnętrzny błąd serwera (wymaga symulacji).
**Oczekiwany wynik:** `503 Service Unavailable` z `{"error":"The AI service is temporarily unavailable. Please try again later."}`.

### 4.5. OpenAI API zwraca nieprawidłową strukturę odpowiedzi (500)

**Warunki:** OpenAI API zwraca odpowiedź JSON, której nie można sparsować do oczekiwanej struktury (wymaga symulacji lub zmiany w API).
**Oczekiwany wynik:** `500 Internal Server Error` z `{"error":"An unexpected error occurred on the server."}`.

## 5. Testy Wydajności i Edge Cases

### 5.1. Czas odpowiedzi

**Opis:** Sprawdzenie czasu odpowiedzi dla standardowego żądania (Test 1.1).
**Oczekiwania:** Odpowiedź w ciągu 30 sekund. Logi serwera powinny pokazywać czas wykonania.

### 5.2. Tekst z polskimi znakami diakrytycznymi

**Żądanie:** Analogiczne do Testu 1.1, ale z tekstem bogatym w polskie znaki: "Zażółć gęślą jaźń..."
**Oczekiwania:** `200 OK`, poprawne przetworzenie, fiszki w języku polskim.

### 5.3. Tekst z emoji i znakami specjalnymi

**Żądanie:** Analogiczne do Testu 1.1, ale z tekstem zawierającym np. 🌟, @, #, $, %.
**Oczekiwania:** `200 OK`, poprawne przetworzenie, znaki specjalne mogą być zignorowane lub odpowiednio obsłużone przez AI.

## 6. Oczekiwane Struktury Odpowiedzi

### Sukces (200 OK)

```json
{
  "suggestions": [
    {
      "suggestedQuestion": "Przykładowe pytanie?",
      "suggestedAnswer": "Przykładowa odpowiedź.",
      "aiModelUsed": "gpt-3.5-turbo"
    }
    // ... więcej sugestii (zazwyczaj 5-8)
  ],
  "sourceTextEcho": "Początek oryginalnego tekstu źródłowego..."
}
```

### Błąd 400 (Bad Request - Validation)

```json
{
  "error": "Validation failed",
  "details": {
    "sourceText": ["Komunikat błędu dotyczący sourceText, np. o długości."]
  }
}
```

### Błąd 400 (Bad Request - Invalid JSON)

```json
{
  "error": "Invalid JSON body."
}
```

### Błąd 401 (Unauthorized)

```json
{
  "error": "User not authenticated"
}
```

### Błąd 500 (Internal Server Error - AI Config)

```json
{
  "error": "AI service configuration error."
}
```

### Błąd 500 (Internal Server Error - Unexpected)

```json
{
  "error": "An unexpected error occurred on the server."
}
```

### Błąd 503 (Service Unavailable - AI Service Error/Timeout)

```json
{
  "error": "The AI service encountered an error. Please try again later." // lub timeout
}
```

## 7. Pomocne Komendy do Przygotowania Testów

### 7.1. Uzyskanie tokenu JWT

- Zaloguj się do aplikacji przez interfejs użytkownika.
- Otwórz narzędzia deweloperskie przeglądarki (Developer Tools).
- Przejdź do zakładki "Network" (Sieć).
- Znajdź żądanie do API (np. logowanie, pobieranie danych), które zawiera nagłówek `Authorization`.
- Skopiuj wartość tokenu z nagłówka `Authorization: Bearer <TOKEN_TUTAJ>`.

## 8. Checklist Weryfikacji

- [ ] Endpoint zwraca 200 OK dla poprawnych żądań.
- [ ] Endpoint zwraca 401 dla nieuwierzytelnionych użytkowników lub złego tokenu.
- [ ] Walidacja `sourceText` (długość, istnienie) działa poprawnie (400).
- [ ] Endpoint zwraca 400 dla nieprawidłowego JSON.
- [ ] Endpoint poprawnie obsługuje błędy konfiguracji AI (brak klucza - 500).
- [ ] Endpoint poprawnie obsługuje błędy API OpenAI (nieprawidłowy klucz, timeout, błędy serwera AI - 503).
- [ ] Endpoint poprawnie obsługuje błędy parsowania odpowiedzi z AI (500).
- [ ] Logowanie `requestId` działa poprawnie.
- [ ] Logowanie czasów wykonania operacji AI działa.
- [ ] Polskie znaki i znaki specjalne są obsługiwane.
- [ ] Struktura odpowiedzi jest zgodna z oczekiwaniami dla sukcesu i błędów.

## 9. Debugging Tips

1. **Sprawdź logi serwera Astro** podczas testowania - endpoint loguje szczegóły żądań (`[API:requestId]`) oraz operacji AI (`[AI]`).
2. **Użyj flagi `-v`** w `curl`, aby zobaczyć pełne nagłówki HTTP żądania i odpowiedzi.
3. **Weryfikuj token JWT** – upewnij się, że nie wygasł i jest poprawnie wklejony.
4. **Sprawdź zmienną środowiskową `OPENAI_API_KEY`** na serwerze.
5. **Monitoruj konsolę OpenAI Platform** pod kątem ewentualnych błędów API po stronie OpenAI, jeśli masz dostęp.
