# Plan implementacji widoku Polityki Prywatności

## 1. Przegląd

Widok Polityki Prywatności to statyczna strona informacyjna dostępna pod ścieżką `/privacy-policy`, która przedstawia użytkownikom zasady dotyczące gromadzenia, przetwarzania i ochrony danych osobowych w aplikacji 10xdevs-fishes-cards. Strona jest kluczowym elementem procesu rejestracji, gdyż użytkownicy muszą zaakceptować politykę prywatności przed utworzeniem konta.

## 2. Routing widoku

- **Ścieżka:** `/privacy-policy`
- **Typ routingu:** Statyczna strona Astro
- **Plik:** `src/pages/privacy-policy.astro`
- **Layout:** `AuthLayout` (wspiera zarówno zalogowanych jak i niezalogowanych użytkowników)

## 3. Struktura komponentów

```
PrivacyPolicyPage (privacy-policy.astro)
├── AuthLayout
│   ├── HeaderUnauthenticated/HeaderAuthenticated (dynamiczny)
│   └── Toaster
└── PrivacyPolicyContent
    ├── PageHeader
    ├── ContentSection
    │   ├── GeneralInfo
    │   ├── DataController
    │   ├── DataScope
    │   ├── ProcessingPurpose
    │   ├── UserRights
    │   └── ContactInfo
    └── NavigationFooter
```

## 4. Szczegóły komponentów

### PrivacyPolicyPage (privacy-policy.astro)
- **Opis komponentu:** Główna strona polityki prywatności implementowana jako statyczny komponent Astro
- **Główne elementy:** AuthLayout jako wrapper, container z treścią polityki prywatności, responsywny design
- **Obsługiwane interakcje:** Brak - strona statyczna
- **Obsługiwana walidacja:** Brak - strona informacyjna
- **Typy:** Wykorzystuje Props z AuthLayout dla title
- **Propsy:** Przyjmuje title przekazywany do AuthLayout

### AuthLayout
- **Opis komponentu:** Istniejący layout wspierający zarówno zalogowanych jak i niezalogowanych użytkowników
- **Główne elementy:** HTML head z meta danymi, dynamiczny header (authenticated/unauthenticated), main content area, Toaster
- **Obsługiwane interakcje:** Nawigacja przez header, powiadomienia toast
- **Obsługiwana walidacja:** Sprawdzanie stanu autentykacji użytkownika
- **Typy:** Interface Props z title?: string
- **Propsy:** title (opcjonalny) - tytuł strony

### PrivacyPolicyContent
- **Opis komponentu:** Statyczny komponent zawierający sformatowaną treść polityki prywatności
- **Główne elementy:** Nagłówek h1, sekcje z treścią (h2 + paragrafy + listy), link powrotny
- **Obsługiwane interakcje:** Nawigacja powrotna do rejestracji, link email
- **Obsługiwana walidacja:** Brak
- **Typy:** Brak specjalnych typów
- **Propsy:** Brak

### NavigationFooter
- **Opis komponentu:** Sekcja nawigacyjna na dole strony z linkiem powrotnym
- **Główne elementy:** Link z ikoną powrotu do strony rejestracji
- **Obsługiwane interakcje:** Nawigacja do /register
- **Obsługiwana walidacja:** Brak
- **Typy:** Brak
- **Propsy:** Brak

## 5. Typy

Widok Polityki Prywatności nie wymaga nowych typów. Wykorzystuje istniejące:

```typescript
// Istniejący typ dla AuthLayout
interface Props {
  title?: string;
}

// Wykorzystywany w kontekście rejestracji
interface PrivacyPolicyLinkProps {
  href: string;
  children?: React.ReactNode;
}
```

Żadne dodatkowe DTO ani ViewModel nie są wymagane, ponieważ strona jest statyczna i nie komunikuje się z API.

## 6. Zarządzanie stanem

Widok Polityki Prywatności nie wymaga zarządzania stanem, ponieważ jest to strona statyczna. Jedyny stan obsługiwany przez AuthLayout to sprawdzanie autentykacji użytkownika dla wyświetlenia odpowiedniego headera.

**Stan zarządzany przez AuthLayout:**
- `isAuthenticated` - boolean sprawdzający czy użytkownik jest zalogowany
- `userEmail` - email zalogowanego użytkownika (jeśli dostępny)

## 7. Integracja API

Widok Polityki Prywatności nie wymaga integracji z API. Jest to strona statyczna prezentująca informacje prawne.

**Brak wywołań API:**
- Brak żądań HTTP
- Brak typów request/response
- Brak obsługi loading states

## 8. Interakcje użytkownika

### Główne interakcje:
1. **Przeglądanie treści** - użytkownik przewija i czyta treść polityki prywatności
2. **Nawigacja powrotna** - użytkownik może wrócić do strony rejestracji przez link na dole strony
3. **Kontakt email** - użytkownik może kliknąć w link email w sekcji kontaktowej
4. **Nawigacja przez header** - użytkownik może nawigować przez aplikację używając menu w headerze

### Oczekiwane wyniki:
- Czytelne wyświetlenie treści prawnej
- Płynna nawigacja powrotna do rejestracji
- Otwarcie klienta email po kliknięciu w adres kontaktowy
- Responsywne działanie na urządzeniach mobilnych

## 9. Warunki i walidacja

Widok nie wymaga walidacji danych wejściowych, ponieważ jest stroną informacyjną. Jedyne warunki dotyczą:

### Warunki dostępności:
- **SEO i metadane:** Strona powinna mieć odpowiedni title i meta description
- **Dostępność:** Treść musi być czytelna dla screen readerów
- **Responsywność:** Strona musi być dostępna na urządzeniach mobilnych
- **Kontrasty:** Kolory muszą spełniać standardy WCAG

### Warunki techniczne:
- Poprawna struktura HTML (h1, h2, semantyczne tagi)
- Ładowanie CSS i fontów
- Funkcjonalne linki nawigacyjne

## 10. Obsługa błędów

### Potencjalne błędy i ich obsługa:

1. **404 - Strona nie znaleziona**
   - Obsługa: Astro automatycznie obsługuje routing
   - Rozwiązanie: Sprawdzenie konfiguracji routingu

2. **Błędy CSS/stylowania**
   - Obsługa: Fallback do podstawowych stylów przeglądarki
   - Rozwiązanie: Testy responsywności i kompatybilności

3. **Błędy JavaScript w headerze**
   - Obsługa: AuthLayout powinien działać bez JS (progressive enhancement)
   - Rozwiązanie: Graceful degradation komponentów React

4. **Problemy z ładowaniem fontów**
   - Obsługa: Fallback do system fonts
   - Rozwiązanie: Font display: swap w CSS

## 11. Kroki implementacji

1. **Weryfikacja istniejącej implementacji**
   - Przegląd aktualnej strony `src/pages/privacy-policy.astro`
   - Sprawdzenie czy spełnia wymagania z PRD
   - Identyfikacja obszarów do poprawy

2. **Aktualizacja treści prawnej**
   - Uzupełnienie sekcji z placeholder danych (np. nazwa firmy)
   - Dodanie szczegółowych informacji o cookies
   - Rozszerzenie sekcji o prawa użytkownika zgodnie z RODO

3. **Poprawa dostępności**
   - Weryfikacja struktury nagłówków (h1, h2)
   - Dodanie odpowiednich aria-labels
   - Sprawdzenie kontrastów kolorów
   - Testy z screen readerami

4. **Optymalizacja responsywności**
   - Sprawdzenie wyświetlania na urządzeniach mobilnych
   - Optymalizacja typografii dla małych ekranów
   - Testy na różnych rozdzielczościach

5. **Dodanie metadanych SEO**
   - Meta description dla strony
   - Structured data (opcjonalnie)
   - Canonical URL

6. **Integracja z procesem rejestracji**
   - Weryfikacja linku powrotnego do rejestracji
   - Sprawdzenie czy link jest właściwie wykorzystywany w formularzu rejestracji
   - Testy user journey od rejestracji do polityki i z powrotem

7. **Testy końcowe**
   - Testy funkcjonalne wszystkich linków
   - Weryfikacja na różnych przeglądarkach
   - Sprawdzenie wydajności ładowania
   - Walidacja HTML i dostępności
   - Testy z rzeczywistymi użytkownikami (opcjonalnie)

8. **Dokumentacja**
   - Aktualizacja README z informacją o stronie
   - Dodanie komentarzy w kodzie (jeśli potrzebne)
   - Dokumentacja dla zespołu prawnego o sposobie aktualizacji treści 