import type { FAQItem } from "@/types";

/**
 * Statyczne dane FAQ dla aplikacji 10xdevs-fishes-cards
 * Zawiera najczęściej zadawane pytania i odpowiedzi dotyczące funkcjonalności aplikacji
 */
export const faqData: FAQItem[] = [
  {
    id: "getting-started",
    question: "Jak zacząć korzystać z aplikacji do tworzenia fiszek?",
    answer: "Aby rozpocząć, musisz się najpierw zarejestrować, tworząc konto w aplikacji. Po zalogowaniu będziesz mógł tworzyć fiszki ręcznie lub generować je automatycznie przy użyciu sztucznej inteligencji.",
    category: "podstawy"
  },
  {
    id: "ai-generation",
    question: "Jak działa generowanie fiszek przez AI?",
    answer: "Wprowadź tekst o długości między 1000 a 10000 znaków w generator AI. Nasz system przeanalizuje treść i automatycznie utworzy pytania oraz odpowiedzi. Następnie możesz przejrzeć wygenerowane fiszki i zaakceptować te, które Ci odpowiadają.",
    category: "ai"
  },
  {
    id: "text-requirements",
    question: "Jakie są wymagania dotyczące tekstu dla generatora AI?",
    answer: "Tekst musi mieć minimum 1000 znaków i maksymalnie 10000 znaków. Najlepsze rezultaty uzyskasz z tekstów edukacyjnych, takich jak fragmenty podręczników, artykuły naukowe czy notatki z wykładów.",
    category: "ai"
  },
  {
    id: "manual-creation",
    question: "Czy mogę tworzyć fiszki ręcznie?",
    answer: "Tak! Możesz w każdej chwili utworzyć fiszkę ręcznie, wprowadzając własne pytanie i odpowiedź. To daje Ci pełną kontrolę nad treścią i pozwala na dostosowanie fiszek do Twoich potrzeb.",
    category: "tworzenie"
  },
  {
    id: "editing-flashcards",
    question: "Czy mogę edytować już utworzone fiszki?",
    answer: "Oczywiście! Wszystkie fiszki można edytować po ich utworzeniu. Możesz modyfikować zarówno pytania, jak i odpowiedzi, aby lepiej dostosować je do swoich potrzeb nauki.",
    category: "zarządzanie"
  },
  {
    id: "deleting-flashcards",
    question: "Jak usunąć niepotrzebne fiszki?",
    answer: "W sekcji 'Moje fiszki' możesz usunąć dowolną fiszkę poprzez kliknięcie odpowiedniej opcji. Pamiętaj, że usunięcie jest trwałe i nie można go cofnąć.",
    category: "zarządzanie"
  },
  {
    id: "account-management",
    question: "Jak zarządzać swoim kontem?",
    answer: "Po zalogowaniu masz dostęp do wszystkich swoich fiszek oraz możliwość zarządzania kontem. Twoje dane są bezpieczne i chronione zgodnie z naszą polityką prywatności.",
    category: "konto"
  },
  {
    id: "data-security",
    question: "Czy moje dane są bezpieczne?",
    answer: "Tak, dbamy o bezpieczeństwo Twoich danych. Wszystkie informacje są szyfrowane i przechowywane zgodnie z najwyższymi standardami bezpieczeństwa. Szczegóły znajdziesz w naszej polityce prywatności.",
    category: "bezpieczeństwo"
  },
  {
    id: "spaced-repetition",
    question: "Czy aplikacja wspiera metodę powtórek rozłożonych w czasie?",
    answer: "Obecnie koncentrujemy się na tworzeniu i zarządzaniu fiszkami. Funkcje związane z algorytmem powtórek mogą zostać dodane w przyszłości.",
    category: "nauka"
  },
  {
    id: "technical-support",
    question: "Co zrobić, jeśli napotkam problem techniczny?",
    answer: "Jeśli napotkasz problemy z działaniem aplikacji, skorzystaj z formularza kontaktowego dostępnego w aplikacji. Nasz zespół postara się rozwiązać problem jak najszybciej."
  }
]; 