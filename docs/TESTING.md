# Testowanie w projekcie

## Przegląd

Projekt wykorzystuje dwa główne frameworki do testowania:
- **Vitest** - testy jednostkowe komponentów React
- **Playwright** - testy end-to-end (E2E)

## Testy jednostkowe (Vitest)

### Konfiguracja

Vitest jest skonfigurowany w pliku `vitest.config.ts` z następującymi ustawieniami:
- Środowisko: jsdom
- Setupy: automatyczne importy z `@testing-library/jest-dom`
- Coverage thresholds: 80% dla wszystkich metryk

### Uruchamianie testów jednostkowych

```bash
# Uruchom testy jednostkowe
npm run test

# Uruchom testy w trybie watch
npm run test:watch

# Uruchom testy z interfejsem UI
npm run test:ui

# Uruchom testy z coverage
npm run test:coverage
```

### Struktura testów

```
src/
├── test/
│   ├── setup.ts           # Konfiguracja globalna
│   └── test-utils.tsx     # Utilities do testowania
└── components/
    └── ui/
        └── Button.test.tsx # Przykładowy test
```

### Przykład testu jednostkowego

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test/test-utils'
import userEvent from '@testing-library/user-event'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })
})
```

## Testy E2E (Playwright)

### Konfiguracja

Playwright jest skonfigurowany w pliku `playwright.config.ts` z:
- Przeglądarką: Chromium
- Automatyczne uruchamianie dev servera
- Screenshots i nagrania video przy błędach

### Uruchamianie testów E2E

```bash
# Uruchom testy E2E
npm run test:e2e

# Uruchom testy z interfejsem UI
npm run test:e2e:ui

# Uruchom testy w trybie debug
npm run test:e2e:debug

# Uruchom testy z widoczną przeglądarką
npm run test:e2e:headed
```

### Page Object Model

Testy E2E wykorzystują wzorzec Page Object Model:

```
e2e/
├── pages/
│   ├── base.page.ts      # Bazowa klasa POM
│   └── home.page.ts      # Strona główna
├── fixtures/
│   └── test-data.ts      # Dane testowe
└── home.spec.ts          # Przykładowy test
```

### Przykład testu E2E

```typescript
import { test, expect } from '@playwright/test'
import { HomePage } from './pages/home.page'

test('should load home page successfully', async ({ page }) => {
  const homePage = new HomePage(page)
  
  await homePage.navigateToHome()
  expect(await homePage.isHomePageLoaded()).toBe(true)
})
```

## Uruchamianie wszystkich testów

```bash
# Uruchom testy jednostkowe z coverage i testy E2E
npm run test:all
```

## Najlepsze praktyki

### Testy jednostkowe

1. **Testuj zachowanie, nie implementację**
2. **Używaj Testing Library queries** w odpowiedniej kolejności:
   - `getByRole` (preferowany)
   - `getByLabelText`
   - `getByText`
   - `getByTestId` (ostateczność)

3. **Mockuj zależności zewnętrzne**:
```tsx
vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabaseClient
}))
```

### Testy E2E

1. **Używaj Page Object Model** dla łatwiejszego utrzymania
2. **Grupuj testy logicznie** w describe blocks
3. **Używaj asercji Playwright** zamiast czekania:
```typescript
// Dobrze
await expect(page.locator('.loading')).toBeHidden()

// Źle
await page.waitForTimeout(1000)
```

4. **Korzystaj z auto-waiting** Playwright - nie dodawaj zbędnych oczekiwań

## Debugowanie

### Vitest
- Użyj `npm run test:ui` dla interaktywnego debugowania
- Dodaj `console.log` lub `screen.debug()` w testach

### Playwright
- Użyj `npm run test:e2e:debug` dla step-by-step debugowania
- Włącz trace viewer w konfiguracji
- Screenshots są automatycznie robione przy błędach

## Coverage

Ustawione threshold dla coverage:
- Branches: 80%
- Functions: 80% 
- Lines: 80%
- Statements: 80%

Raporty coverage są generowane w formacie HTML i dostępne w `coverage/` po uruchomieniu testów. 