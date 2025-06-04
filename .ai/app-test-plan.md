# Plan Testów - 10xdevs-fishes-cards

## 1. Wprowadzenie i cele testowania

### 1.1 Cel dokumentu
Niniejszy plan testów definiuje strategię i podejście do testowania aplikacji webowej **10xdevs-fishes-cards** - systemu do tworzenia i zarządzania fiszkami edukacyjnymi z wykorzystaniem sztucznej inteligencji.

### 1.2 Cele testowania
- **Funkcjonalne**: Weryfikacja poprawności wszystkich funkcji aplikacji zgodnie ze specyfikacją
- **Bezpieczeństwo**: Zapewnienie ochrony danych użytkowników i odporności na ataki
- **Wydajność**: Sprawdzenie responsywności i skalowalności aplikacji
- **Użyteczność**: Walidacja intuicyjności interfejsu i dostępności
- **Integracja**: Weryfikacja poprawnej współpracy z zewnętrznymi serwisami (OpenAI, Supabase)

## 2. Zakres testów

### 2.1 Obszary objęte testami
- ✅ **API Endpoints** - wszystkie endpointy REST API
- ✅ **Autentykacja i autoryzacja** - logowanie, rejestracja, sesje
- ✅ **Zarządzanie fiszkami** - CRUD operations, AI generation
- ✅ **Komponenty React** - interaktywne elementy UI
- ✅ **Formularze** - walidacja, obsługa błędów
- ✅ **Integracja zewnętrzna** - OpenAI API, Supabase
- ✅ **Responsywność** - działanie na różnych urządzeniach
- ✅ **Dostępność** - zgodność z WCAG 2.1

### 2.2 Obszary wyłączone z testów
- ❌ **Infrastruktura CI/CD** - GitHub Actions, Docker
- ❌ **Testy penetracyjne** - zaawansowane testy bezpieczeństwa
- ❌ **Testy obciążeniowe** - duża skala concurrent users
- ❌ **Browser compatibility** - starsie wersje przeglądarek

## 3. Typy testów do przeprowadzenia

### 3.1 Testy jednostkowe (Unit Tests)
**Narzędzia**: Vitest, React Testing Library  
**Pokrycie**: 80% kodu  
**Zakres**:
- Funkcje pomocnicze (`src/lib/utils/`)
- Serwisy (`src/lib/services/`)
- Komponenty React (izolowane)
- Validatory Zod
- Transformery danych

### 3.2 Testy integracyjne (Integration Tests)
**Narzędzia**: Vitest, MSW (Mock Service Worker)  
**Zakres**:
- API endpoints z bazą danych
- Integracja OpenAI API (z mockami)
- Przepływ autentykacji Supabase
- Komunikacja frontend-backend

### 3.3 Testy komponentów (Component Tests)
**Narzędzia**: Storybook, React Testing Library  
**Zakres**:
- Komponenty UI Shadcn/ui
- Komponenty biznesowe (fiszki, formularze)
- Hooki React
- State management

### 3.4 Testy end-to-end (E2E Tests)
**Narzędzia**: Playwright  
**Zakres**:
- Główne przepływy użytkownika
- Krytyczne ścieżki biznesowe
- Cross-browser testing
- Mobile responsiveness

### 3.5 Testy wydajnościowe (Performance Tests)
**Narzędzia**: Lighthouse, Web Vitals  
**Zakres**:
- Core Web Vitals
- Czas ładowania stron
- Wydajność API
- Memory leaks

### 3.6 Testy dostępności (Accessibility Tests)
**Narzędzia**: axe-core, Pa11y  
**Zakres**:
- WCAG 2.1 AA compliance
- Screen reader compatibility
- Keyboard navigation
- Color contrast

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1 Zarządzanie fiszkami

#### TC-001: Tworzenie fiszki manualnie
**Warunki wstępne**: Użytkownik zalogowany  
**Kroki**:
1. Przejdź do Dashboard → "Moje fiszki"
2. Kliknij "Dodaj fiszkę"
3. Wypełnij pytanie (min. 3 znaki)
4. Wypełnij odpowiedź (min. 3 znaki)
5. Kliknij "Zapisz"

**Oczekiwany rezultat**: Fiszka zostaje utworzona i pojawia się na liście

#### TC-002: Generowanie fiszek przez AI
**Warunki wstępne**: Użytkownik zalogowany, OpenAI API key skonfigurowany  
**Kroki**:
1. Przejdź do Dashboard → "Generator AI"
2. Wklej tekst źródłowy (1000-10000 znaków)
3. Kliknij "Generuj fiszki"
4. Poczekaj na rezultaty AI
5. Zaakceptuj wybrane sugestie

**Oczekiwany rezultat**: 5-8 sugestii fiszek zostaje wygenerowanych

#### TC-003: Edycja fiszki
**Warunki wstępne**: Użytkownik ma przynajmniej jedną fiszkę  
**Kroki**:
1. Przejdź do "Moje fiszki"
2. Kliknij ikonę edycji przy fiszce
3. Zmodyfikuj pytanie lub odpowiedź
4. Kliknij "Zapisz zmiany"

**Oczekiwany rezultat**: Fiszka zostaje zaktualizowana

### 4.2 Autentykacja

#### TC-004: Rejestracja nowego użytkownika
**Kroki**:
1. Przejdź do `/register`
2. Wypełnij email, hasło, potwierdzenie hasła
3. Zaakceptuj politykę prywatności
4. Kliknij "Zarejestruj się"

**Oczekiwany rezultat**: Konto zostaje utworzone, użytkownik zostaje przekierowany

#### TC-005: Logowanie użytkownika
**Warunki wstępne**: Użytkownik ma aktywne konto  
**Kroki**:
1. Przejdź do `/login`
2. Wprowadź poprawne dane logowania
3. Kliknij "Zaloguj się"

**Oczekiwany rezultat**: Użytkownik zostaje zalogowany i przekierowany do dashboard

### 4.3 Formularze i walidacja

#### TC-006: Walidacja formularza kontaktowego
**Kroki**:
1. Przejdź do `/contact`
2. Wypełnij formularz z nieprawidłowymi danymi
3. Sprawdź komunikaty walidacji
4. Popraw dane i wyślij formularz

**Oczekiwany rezultat**: Walidacja działa poprawnie, formularz zostaje wysłany

## 5. Środowisko testowe

### 5.1 Środowiska testowe

#### Development Environment
- **URL**: `http://localhost:3000`
- **Baza danych**: Lokalna instancja Supabase
- **AI Service**: Mock service (bez OpenAI API)
- **Użycie**: Testy developerskie, testy jednostkowe

#### Testing Environment
- **URL**: `https://test.10xdevs-fishes-cards.com`
- **Baza danych**: Supabase testing project
- **AI Service**: OpenAI API z limitowanym budżetem
- **Użycie**: Testy integracyjne, E2E

#### Staging Environment
- **URL**: `https://staging.10xdevs-fishes-cards.com`
- **Baza danych**: Kopia produkcyjnej struktury
- **AI Service**: OpenAI API produkcyjny
- **Użycie**: Testy akceptacyjne, UAT

### 5.2 Dane testowe
- **Testowi użytkownicy**: 10 kont z różnymi rolami
- **Testowe fiszki**: 100 fiszek w różnych kategoriach
- **Testowe teksty**: Zbiór tekstów 1000-10000 znaków

## 6. Narzędzia do testowania

### 6.1 Narzędzia testowe

| Typ testów | Narzędzie | Wersja | Cel |
|------------|-----------|---------|-----|
| Unit Tests | Vitest | ^2.0.0 | Testy jednostkowe JS/TS |
| Component Tests | React Testing Library | ^16.0.0 | Testy komponentów React |
| API Tests | Supertest | ^7.0.0 | Testy HTTP endpoints |
| E2E Tests | Playwright | ^1.45.0 | Testy end-to-end |
| Visual Tests | Storybook | ^8.0.0 | Testy wizualne komponentów |
| Performance | Lighthouse CI | ^12.0.0 | Analiza wydajności |
| Accessibility | axe-core | ^4.9.0 | Testy dostępności |

### 6.2 Narzędzia wspomagające

| Narzędzie | Cel |
|-----------|-----|
| MSW (Mock Service Worker) | Mockowanie API calls |
| Faker.js | Generowanie danych testowych |
| Testing Playground | Debugowanie selektorów |
| Percy/Chromatic | Visual regression testing |

## 7. Harmonogram testów

### 7.1 Faza 1: Przygotowanie (Tydzień 1)
- [ ] Konfiguracja środowisk testowych
- [ ] Instalacja i konfiguracja narzędzi
- [ ] Przygotowanie danych testowych
- [ ] Napisanie podstawowych testów smoke

### 7.2 Faza 2: Testy podstawowe (Tydzień 2-3)
- [ ] Testy jednostkowe dla utils i services
- [ ] Testy API endpoints
- [ ] Testy komponentów UI
- [ ] Testy formularzy i walidacji

### 7.3 Faza 3: Testy integracyjne (Tydzień 4)
- [ ] Testy przepływów użytkownika
- [ ] Testy integracji z OpenAI
- [ ] Testy integracji z Supabase
- [ ] Testy cross-browser

### 7.4 Faza 4: Testy zaawansowane (Tydzień 5)
- [ ] Testy E2E kluczowych funkcji
- [ ] Testy wydajnościowe
- [ ] Testy dostępności
- [ ] Testy bezpieczeństwa

### 7.5 Faza 5: Finalizacja (Tydzień 6)
- [ ] Wykonanie pełnej regresji
- [ ] Dokumentacja wyników
- [ ] Rekomendacje i plan naprawczy
- [ ] Przekazanie do produkcji

## 8. Kryteria akceptacji testów

### 8.1 Kryteria wejścia
- ✅ Kod aplikacji jest kompletny i skompilowany
- ✅ Środowiska testowe są skonfigurowane
- ✅ Dane testowe są przygotowane
- ✅ Zespół testowy jest przeszkolony

### 8.2 Kryteria wyjścia
- ✅ **Pokrycie kodu**: Minimum 80% dla testów jednostkowych
- ✅ **Testy API**: 100% endpoints przetestowane
- ✅ **Testy E2E**: Wszystkie krytyczne ścieżki działają
- ✅ **Performance**: Core Web Vitals > 90 punktów
- ✅ **Accessibility**: 0 błędów krytycznych axe-core
- ✅ **Security**: Brak znanych podatności wysokiego ryzyka

### 8.3 Definicja błędów

| Priorytet | Definicja | Czas reakcji |
|-----------|-----------|--------------|
| **P1 - Krytyczny** | Aplikacja nie działa, utrata danych | 2h |
| **P2 - Wysoki** | Główna funkcja nie działa | 1 dzień |
| **P3 - Średni** | Funkcja działa z ograniczeniami | 3 dni |
| **P4 - Niski** | Kosmetyczne, nie wpływa na funkcjonalność | 1 tydzień |

## 9. Role i odpowiedzialności

### 9.1 Zespół testowy

| Rola | Odpowiedzialności |
|------|-------------------|
| **Lead Tester** | Koordynacja testów, zarządzanie harmonogramem, raportowanie |
| **QA Engineer** | Wykonywanie testów manualnych, pisanie test cases |
| **Test Automation Engineer** | Tworzenie i utrzymanie testów automatycznych |
| **Performance Tester** | Testy wydajnościowe i optymalizacja |

### 9.2 Zespół rozwoju

| Rola | Odpowiedzialności |
|------|-------------------|
| **Frontend Developer** | Wsparcie w testach komponentów React |
| **Backend Developer** | Wsparcie w testach API i integracji |
| **DevOps Engineer** | Konfiguracja środowisk testowych |
| **Product Owner** | Akceptacja wyników testów, priorytetyzacja błędów |

## 10. Procedury raportowania błędów

### 10.1 Narzędzie do śledzenia błędów
**GitHub Issues** z odpowiednimi labelami:
- `bug` - błąd funkcjonalny
- `performance` - problem z wydajnością  
- `accessibility` - problem z dostępnością
- `security` - podatność bezpieczeństwa
- `ui/ux` - problem interfejsu

### 10.2 Szablon raportu błędu

```markdown
## 🐛 Opis błędu
[Krótki opis problemu]

## 🔍 Kroki do reprodukcji
1. [Krok 1]
2. [Krok 2]
3. [Krok 3]

## ✅ Oczekiwane zachowanie
[Co powinno się stać]

## ❌ Rzeczywiste zachowanie  
[Co się dzieje zamiast tego]

## 🌍 Środowisko
- Browser: [Chrome 120.0]
- OS: [Windows 11]
- Device: [Desktop/Mobile]
- URL: [https://app.example.com]

## 📸 Zrzuty ekranu
[Załącz screenshoty jeśli to możliwe]

## 🔧 Dodatkowe informacje
[Console errors, network requests, etc.]

## 📊 Priorytet
[P1/P2/P3/P4]
```

### 10.3 Proces życia błędu

1. **New** → Nowo zgłoszony błąd
2. **Confirmed** → Błąd potwierdzony przez team lead
3. **In Progress** → Developer pracuje nad naprawą
4. **Fixed** → Błąd naprawiony, czeka na weryfikację
5. **Verified** → Naprawa zweryfikowana przez testera
6. **Closed** → Błąd zamknięty
7. **Reopened** → Błąd ponownie otwarty (jeśli nie został naprawiony)

### 10.4 Metryki i raportowanie

#### Raport dzienny
- Liczba nowych błędów
- Liczba naprawionych błędów  
- Postęp wykonania testów
- Blokery i ryzyka

#### Raport tygodniowy
- Trend jakości (bug discovery rate)
- Pokrycie testów
- Wydajność zespołu
- Analiza głównych problemów

#### Raport końcowy
- Podsumowanie wszystkich testów
- Lista znanych problemów
- Rekomendacje dla produkcji
- Lessons learned

---

**Dokument został przygotowany w oparciu o analizę codebase projektu 10xdevs-fishes-cards i najlepsze praktyki testowania aplikacji webowych.** 