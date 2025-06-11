# Scenariusze Testowe dla POST /api/contact-submissions

## Przygotowanie do testów

**Base URL:** `http://localhost:3000` (lub inny port, na którym działa Twoja aplikacja Astro)

**Uwaga:** Dla testów uwierzytelnionego użytkownika, zastąp `YOUR_JWT_TOKEN_HERE` w poniższych komendach swoim aktualnym tokenem JWT Bearer.

## 1. Testy Podstawowe

### 1.1. Zgłoszenie od użytkownika anonimowego (Sukces 201)

```bash
curl -X POST "http://localhost:3000/api/contact-submissions" \
  -H "Content-Type: application/json" \
  -d '{
    "emailAddress": "test.anon@example.com",
    "subject": "Test od Anonima",
    "messageBody": "To jest testowa wiadomość od użytkownika anonimowego."
  }' \
  -v
```

**Oczekiwany wynik:** `201 Created` z danymi zgłoszenia, `userId` powinno być `null`.

### 1.2. Zgłoszenie od użytkownika uwierzytelnionego (Sukces 201)

```bash
curl -X POST "http://localhost:3000/api/contact-submissions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "emailAddress": "user.auth@example.com",
    "subject": "Test od Zalogowanego",
    "messageBody": "To jest testowa wiadomość od użytkownika zalogowanego."
  }' \
  -v
```

**Oczekiwany wynik:** `201 Created` z danymi zgłoszenia, `userId` powinno być ustawione na ID zalogowanego użytkownika.

### 1.3. Zgłoszenie bez tematu (Sukces 201 - pole opcjonalne)

```bash
curl -X POST "http://localhost:3000/api/contact-submissions" \
  -H "Content-Type: application/json" \
  -d '{
    "emailAddress": "no.subject@example.com",
    "messageBody": "Ta wiadomość nie ma tematu."
  }' \
  -v
```

**Oczekiwany wynik:** `201 Created` z danymi zgłoszenia, `subject` powinno być `null` lub nieobecne.

## 2. Testy Walidacji Danych Wejściowych (Błędy 400)

### 2.1. Brakujący adres email (400 Bad Request)

```bash
curl -X POST "http://localhost:3000/api/contact-submissions" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Brak emaila",
    "messageBody": "Ta wiadomość nie ma adresu email."
  }' \
  -v
```

**Oczekiwany wynik:** `400 Bad Request` z błędem walidacji dla `emailAddress`.

### 2.2. Nieprawidłowy format adresu email (400 Bad Request)

```bash
curl -X POST "http://localhost:3000/api/contact-submissions" \
  -H "Content-Type: application/json" \
  -d '{
    "emailAddress": "niepoprawny-email",
    "messageBody": "Tu jest niepoprawny email."
  }' \
  -v
```

**Oczekiwany wynik:** `400 Bad Request` z błędem walidacji dla `emailAddress`.

### 2.3. Brakująca treść wiadomości (400 Bad Request)

```bash
curl -X POST "http://localhost:3000/api/contact-submissions" \
  -H "Content-Type: application/json" \
  -d '{
    "emailAddress": "test@example.com"
  }' \
  -v
```

**Oczekiwany wynik:** `400 Bad Request` z błędem walidacji dla `messageBody`.

### 2.4. Pusta treść wiadomości (400 Bad Request)

```bash
curl -X POST "http://localhost:3000/api/contact-submissions" \
  -H "Content-Type: application/json" \
  -d '{
    "emailAddress": "test@example.com",
    "messageBody": ""
  }' \
  -v
```

**Oczekiwany wynik:** `400 Bad Request` z błędem walidacji dla `messageBody`.

### 2.5. Za długi adres email (400 Bad Request)

```bash
# Tworzenie bardzo długiego stringa dla emaila (np. 300 znaków)
LONG_EMAIL=$(printf 'a%.0s' {1..290})@example.com
curl -X POST "http://localhost:3000/api/contact-submissions" \
  -H "Content-Type: application/json" \
  -d "{ \"emailAddress\": \"$LONG_EMAIL\", \"messageBody\": \"Test z długim emailem.\" }" \
  -v
```

**Oczekiwany wynik:** `400 Bad Request` z błędem walidacji dla `emailAddress` (przekroczenie 255 znaków).

### 2.6. Za długi temat (400 Bad Request)

```bash
# Tworzenie bardzo długiego stringa dla tematu (np. 300 znaków)
LONG_SUBJECT=$(printf 's%.0s' {1..300})
curl -X POST "http://localhost:3000/api/contact-submissions" \
  -H "Content-Type: application/json" \
  -d "{ \"emailAddress\": \"test@example.com\", \"subject\": \"$LONG_SUBJECT\", \"messageBody\": \"Test z długim tematem.\" }" \
  -v
```

**Oczekiwany wynik:** `400 Bad Request` z błędem walidacji dla `subject` (przekroczenie 255 znaków).

### 2.7. Za długa treść wiadomości (400 Bad Request)

```bash
# Tworzenie bardzo długiego stringa dla treści (np. 6000 znaków)
LONG_MESSAGE=$(printf 'm%.0s' {1..6000})
curl -X POST "http://localhost:3000/api/contact-submissions" \
  -H "Content-Type: application/json" \
  -d "{ \"emailAddress\": \"test@example.com\", \"messageBody\": \"$LONG_MESSAGE\" }" \
  -v
```

**Oczekiwany wynik:** `400 Bad Request` z błędem walidacji dla `messageBody` (przekroczenie 5000 znaków).

### 2.8. Nieprawidłowy JSON w ciele żądania (400 Bad Request)

```bash
curl -X POST "http://localhost:3000/api/contact-submissions" \
  -H "Content-Type: application/json" \
  -d '{
    "emailAddress": "test@example.com",
    "messageBody": "Niedomknięty JSON,
  }' \
  -v
```

**Oczekiwany wynik:** `400 Bad Request` z komunikatem o błędzie parsowania JSON.

## 3. Testy Zachowania Serwera

### 3.1. Symulacja błędu serwera (500 Internal Server Error)

Ten test jest trudny do bezpośredniego zasymulowania przez cURL bez modyfikacji kodu serwera w celu wywołania błędu. Testy jednostkowe/integracyjne serwisu `ContactSubmissionsService` powinny pokrywać scenariusze, w których Supabase zwraca błąd (np. problem z połączeniem, naruszenie unikalnego klucza, jeśli taki by istniał, itp.).

## 4. Oczekiwane Struktury Odpowiedzi

### Sukces (201 Created)

```json
{
  "id": "uuid-string-generowany-przez-baze",
  "userId": "uuid-string-id-uzytkownika-lub-null",
  "emailAddress": "podany.email@example.com",
  "subject": "Podany temat lub null",
  "messageBody": "Podana treść wiadomości.",
  "submittedAt": "timestamp-string-w-formacie-iso"
}
```

### Błąd Walidacji (400 Bad Request)

```json
{
  "error": "Validation failed",
  "details": {
    "nazwaPola": ["Komunikat błędu walidacji dla tego pola."]
    // np. "emailAddress": ["Invalid email format."] lub "messageBody": ["Message body cannot be empty."]
  }
}
```

### Błąd Parsowania JSON (400 Bad Request)

```json
{
  "error": "Invalid JSON body."
}
```

### Błąd Serwera (500 Internal Server Error)

```json
{
  "error": "Internal Server Error"
  // lub bardziej szczegółowy błąd, jeśli jest zwracany np. "Database connection error."
}
```

## 5. Checklist Weryfikacji

- [ ] Endpoint zwraca `201 Created` dla poprawnych zgłoszeń (anonimowych i uwierzytelnionych).
- [ ] `userId` jest poprawnie ustawiane dla użytkowników uwierzytelnionych i `null` dla anonimowych.
- [ ] `subject` jest opcjonalny i poprawnie obsługiwany (wartość lub `null`).
- [ ] Walidacja Zod działa poprawnie dla wszystkich pól (`emailAddress`, `subject`, `messageBody`), w tym:
  - Wymagane pola.
  - Poprawny format emaila.
  - Minimalne i maksymalne długości znaków.
- [ ] Endpoint zwraca `400 Bad Request` z odpowiednimi szczegółami dla błędów walidacji.
- [ ] Endpoint zwraca `400 Bad Request` dla nieprawidłowego formatu JSON.
- [ ] Obsługa błędów Supabase w serwisie jest mapowana na odpowiednie kody HTTP (głównie 500, ewentualnie 400 dla naruszeń constraintów które są wynikiem walidacji).
- [ ] Logowanie po stronie serwera (z request ID) działa i dostarcza użytecznych informacji.
- [ ] Polityki RLS Supabase dla tabeli `contact_form_submissions` są respektowane.

## 6. Dodatkowe Uwagi

- **Wrażliwość na wielkość liter w emailu:** Standardowo adresy email nie są wrażliwe na wielkość liter po stronie serwera pocztowego, ale Supabase i PostgreSQL będą przechowywać je tak, jak zostały podane. Walidacja Zod `.email()` nie normalizuje wielkości liter.
- **Duplikaty zgłoszeń:** Obecna implementacja nie ma wbudowanej logiki zapobiegania duplikatom zgłoszeń (np. ten sam email i treść w krótkim czasie). Jeśli jest to wymagane, należałoby dodać taką logikę w serwisie lub na poziomie bazy danych (np. unikalny constraint na kombinację pól, co mogłoby prowadzić do błędów 400 jeśli serwis rzuci odpowiedni wyjątek).
- **RLS Policies:** Testowanie RLS wymaga sprawdzenia, czy polityka INSERT (`Allow anyone to submit a contact form` lub `Allow public inserts to contact form`) działa poprawnie, oraz czy polityki SELECT/UPDATE/DELETE (`Allow admin access`) poprawnie ograniczają dostęp dla zwykłych użytkowników/anonimowych.
