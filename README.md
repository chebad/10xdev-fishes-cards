# 10xdevs-fishes-cards

## 1. Project Name

10xdevs-fishes-cards

## 2. Project Description

This project is a web application called **10xdevs-fishes-cards**, designed for quickly creating high-quality educational flashcards. The application allows users to generate flashcards using AI, as well as manually create, edit, review, and delete them. It includes a simple user account management system, user notifications for operations, a static FAQ section, and a contact form. The primary goal is to help users efficiently create flashcards, especially from academic texts, to support learning via spaced repetition.

This repository contains the foundational codebase for the `10xdevs-fishes-cards` application.

## 3. Tech Stack

- **Frontend:**
  - Astro 5
  - React 19 (for interactive components)
  - TypeScript 5
  - Tailwind CSS 4
  - Shadcn/ui (for UI components)
- **Backend:**
  - Supabase (PostgreSQL database, SDKs, Authentication)
- **AI Integration:**
  - OpenAI Platform (GPT-3.5-turbo, GPT-4)
- **CI/CD & Hosting:**
  - GitHub Actions
  - DigitalOcean (via Docker image)

## 4. Getting Started Locally

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js version `22.14.0` (as specified in `.nvmrc`). It's recommended to use a Node version manager like `nvm`.

    ```bash
    nvm use
    ```

- npm, yarn, or pnpm as a package manager. The examples below use `npm`.

### Installation

1. **Install NPM packages:**

    ```bash
    npm install
    ```

2. **Set up environment variables:**
    Create a `.env` file in the root of the project. This file will contain necessary API keys and configuration for services like Supabase and OpenAI. You might need to refer to an `.env.example` file if available, or set up the following (actual variable names might differ):

    ```env
    # Example variables (replace with actual ones needed for the project)
    PUBLIC_SUPABASE_URL=your_supabase_url
    PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    OPENAI_API_KEY=your_openai_api_key
    ```

3. **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) (or the port specified in your Astro config/console output) to view it in the browser.

## 5. Available Scripts

In the project directory, you can run the following scripts:

- `npm run dev`: Runs the app in development mode.
- `npm run build`: Builds the app for production.
- `npm run preview`: Starts a local server to preview the production build.
- `npm run astro`: Access Astro CLI commands.
- `npm run lint`: Lints the codebase using ESLint.
- `npm run lint:fix`: Lints the codebase and attempts to fix issues automatically.
- `npm run format`: Formats the code using Prettier.

## 6. Project Scope

### Key Features

- **AI-Powered Flashcard Generation:** Users can input text (between 1,000 and 10,000 characters) for AI to generate flashcards.
- **Manual Flashcard Creation:** Users can create flashcards by manually entering questions and answers.
- **Flashcard Management:** Edit, delete, and review saved flashcards.
- **User Accounts:** Registration and login functionality, including privacy policy acceptance.
- **User Notifications:** Feedback mechanisms (e.g., toast notifications) for successful operations.

### Out of Scope (for the current phase)

- Implementation of an advanced spaced repetition algorithm (like SuperMemo or Anki).
- Support for importing various file formats (PDF, DOCX, etc.).
- Sharing flashcard sets between users.
- Integration with other educational platforms.
- Full integration with a spaced repetition algorithm (at this stage).
- Mobile application version.
- Advanced UI customization options (e.g., dark mode, keyboard shortcuts).
- Flashcards with multimedia content (initially text-only).

## 7. Project Status

The project is currently in its early stages of development (Version `0.0.1`). Key functionalities are being built, focusing on delivering a Minimum Viable Product (MVP).

## 8. License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.

## 9. Additional Information

### OpenAI API

#### Generowanie fiszek przez AI

Aplikacja używa OpenAI API do automatycznego generowania fiszek na podstawie tekstu źródłowego:

- **Endpoint:** `POST /api/flashcards/generate-ai`
- **Model:** GPT-3.5-turbo (ekonomiczny) lub GPT-4 (zaawansowany)
- **Wymagania:** Tekst źródłowy 1000-10000 znaków
- **Wynik:** 5-8 sugestii fiszek w języku polskim

#### Gdzie uzyskać klucze API:

1. **OpenAI API Key:**
   - Zarejestruj się na [OpenAI Platform](https://platform.openai.com/)
   - Przejdź do [API Keys](https://platform.openai.com/api-keys)
   - Utwórz nowy klucz API
   - Skopiuj klucz i dodaj do zmiennej `OPENAI_API_KEY`

2. **Supabase:**
   - Utwórz nowy projekt na [Supabase](https://supabase.com/)
   - W ustawieniach projektu znajdź URL i anon key
   - Dodaj je do odpowiednich zmiennych środowiskowych

### API Documentation

Szczegółowa dokumentacja API dostępna w katalogu `.ai/`.

## 🔗 API Endpoints

Aplikacja posiada w pełni funkcjonalne API endpoints dla zarządzania fiszkami:

### Flashcards API

- **`POST /api/flashcards/generate-ai`** - Generowanie fiszek przez AI
  - Body: `{ sourceText: string }` (1000-10000 znaków)
  - Response: `{ suggestions: AiFlashcardSuggestionItem[], sourceTextEcho: string }`

- **`POST /api/flashcards`** - Tworzenie nowej fiszki
  - Body: `{ question: string, answer: string, isAiGenerated?: boolean, sourceTextForAi?: string }`
  - Response: `FlashcardDto`

- **`GET /api/flashcards`** - Pobieranie listy fiszek
  - Query: `page?, limit?, sortBy?, sortOrder?, search?, isAiGenerated?`
  - Response: `{ data: FlashcardListItemDto[], pagination: PaginationDetails }`

- **`PATCH /api/flashcards/[id]`** - Edycja fiszki
  - Body: `{ question?: string, answer?: string }`
  - Response: `FlashcardDto`

- **`DELETE /api/flashcards/[id]`** - Usuwanie fiszki (soft delete)
  - Response: `{ success: boolean }`

### Autoryzacja

Wszystkie endpoints wymagają autoryzacji przez Supabase session w cookies.

## ⚙️ Konfiguracja

### Zmienne środowiskowe

Utwórz plik `.env` w głównym katalogu projektu:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI API Configuration (opcjonalne - w dev mode używa mock service)
OPENAI_API_KEY=your_openai_api_key
```

### AI Service

- **Z OPENAI_API_KEY**: Używa prawdziwego OpenAI API (GPT-3.5-turbo)
- **Bez OPENAI_API_KEY**: Automatycznie przełącza na Mock AI Service w trybie development

### Development vs Production

- **Development**: Mock AI service generuje przykładowe fiszki
- **Production**: Wymaga prawdziwego OPENAI_API_KEY
