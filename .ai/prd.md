# Dokument wymagań produktu (PRD) - 10xdevs-fishes-cards

## 1. Przegląd produktu

Produkt 10xdevs-fishes-cards to aplikacja webowa, która umożliwia szybkie tworzenie wysokiej jakości fiszek edukacyjnych. Aplikacja pozwala na generowanie fiszek przy użyciu AI, jak również na ich ręczne tworzenie, edycję, przeglądanie i usuwanie. System zawiera prosty mechanizm zarządzania kontami użytkowników oraz integrację z gotowym algorytmem powtórek, co wspiera efektywną naukę metodą spaced repetition. Dodatkowo, interfejs zawiera mechanizmy informowania użytkownika o powodzeniu operacji (np. powiadomienia typu toast lub krótkie animacje) oraz statyczną sekcję FAQ i formularz zgłoszeniowy.

## 2. Problem użytkownika

Użytkownicy tracą dużo czasu na ręczne tworzenie fiszek, mają trudności ze streszczaniem długich tekstów oraz formułowaniem trafnych pytań i odpowiedzi. Problem dotyczy szczególnie treści akademickich, takich jak podręczniki, artykuły naukowe i notatki, przez co metoda spaced repetition staje się mniej efektywna.

## 3. Wymagania funkcjonalne

- Generowanie fiszek przez AI na podstawie tekstu wejściowego (tekst musi mieć więcej niż 1000 znaków i nie przekraczać 10 000 znaków).
- Ręczne tworzenie fiszek poprzez wprowadzenie pytania i odpowiedzi.
- Edycja fiszek.
- Usuwanie fiszek.
- Przeglądanie zapisanych fiszek na koncie użytkownika.
- System kont użytkowników z procesem rejestracji i logowania, w tym akceptacją polityki prywatności.
- Mechanizm informowania użytkownika o powodzeniu operacji (np. zielony toast lub krótka animacja).

## 4. Granice produktu

- Brak implementacji własnego, zaawansowanego algorytmu powtórek (podobnego do SuperMemo lub Anki).
- Brak wsparcia dla importu wielu formatów plików (PDF, DOCX i inne).
- Brak możliwości współdzielenia zestawów fiszek między użytkownikami.
- Brak integracji z innymi platformami edukacyjnymi.
- Brak integracji z algorytmem powtórek na tym etapie.
- Aplikacja będzie dostępna jedynie jako produkt webowy (bez wersji mobilnej).
- Brak zaawansowanych opcji personalizacji interfejsu (np. tryb ciemny, skróty klawiaturowe).
- Fiszki będą początkowo oparte wyłącznie na treści tekstowej (bez grafiki lub multimediów).

## 5. Historyjki użytkowników

### US-001: Rejestracja i logowanie

- Tytuł: Rejestracja i logowanie
- Opis: Użytkownik tworzy konto poprzez rejestrację, akceptując politykę prywatności, a następnie loguje się, aby uzyskać dostęp do aplikacji.
- Kryteria akceptacji:
  - Formularz rejestracji wymaga podania niezbędnych danych.
  - Użytkownik musi zaznaczyć checkbox akceptacji polityki prywatności.
  - Logowanie umożliwia dostęp do konta przy poprawnych danych oraz wyświetla komunikat błędu przy niepoprawnych danych.

### US-002: Generowanie fiszek przez AI

- Tytuł: Generowanie fiszek przez AI
- Opis: Użytkownik wprowadza tekst o długości większej niż 1000 znaków i mniejszej niż 10 000 znaków, który jest przetwarzany przez AI (np. GPT-4) w celu generowania fiszek. Fiszki są prezentowane użytkownikowi i uznawane za zaakceptowane, po tym jak użytkownik je oznaczy jako zaakceptowane.
- Kryteria akceptacji:
  - System odrzuca teksty, które nie spełniają kryterium minimalnej lub maksymalnej długości.
  - Fiszki są generowane przez AI i prezentowane użytkownikowi.
  - Fiszka jest oznaczona jako zaakceptowana przez akcje użytkownika.

### US-003: Ręczne tworzenie fiszek

- Tytuł: Ręczne tworzenie fiszek
- Opis: Użytkownik ma możliwość tworzenia fiszek poprzez wypełnienie formularza, w którym wpisuje pytanie oraz odpowiedź.
- Kryteria akceptacji:
  - Formularz umożliwia wprowadzenie treści pytania i odpowiedzi.
  - Fiszka zostaje zapisana i wyświetlona na liście po zatwierdzeniu przez użytkownika.

### US-004: Edycja fiszek

- Tytuł: Edycja fiszek
- Opis: Użytkownik może modyfikować istniejące fiszki, aktualizując treść pytania lub odpowiedzi.
- Kryteria akceptacji:
  - Użytkownik może otworzyć edytor dla wybranej fiszki.
  - Zmiany są zapisywane oraz potwierdzane przez mechanizm powiadomień (toast lub animacja).

### US-005: Usuwanie fiszek

- Tytuł: Usuwanie fiszek
- Opis: Użytkownik ma możliwość usuwania niepotrzebnych fiszek ze swojego konta.
- Kryteria akceptacji:
  - Użytkownik wybiera fiszkę i potwierdza jej usunięcie.
  - Fiszka zostaje trwale usunięta z systemu.

### US-006: Przeglądanie fiszek

- Tytuł: Przeglądanie fiszek
- Opis: Użytkownik może przeglądać listę wszystkich zapisanych fiszek na swoim koncie.
- Kryteria akceptacji:
  - System wyświetla listę fiszek w uporządkowany sposób.
  - Użytkownik ma możliwość podstawowego wyszukiwania lub filtrowania fiszek.

## 6. Metryki sukcesu

- Minimum 75% fiszek wygenerowanych przez AI musi zostać zaakceptowanych przez użytkownika.
- Użytkownicy muszą tworzyć co najmniej 75% fiszek przy użyciu funkcji AI.
- Kluczowe KPI obejmują:
  - Liczbę wygenerowanych fiszek tygodniowo.
  - Czas od rejestracji do utworzenia pierwszej fiszki.
  - Procent fiszek zaakceptowanych bez większych modyfikacji.
- Dane KPI będą zbierane manualnie przy użyciu szablonu (CSV/Excel) w tygodniowych odstępach.
