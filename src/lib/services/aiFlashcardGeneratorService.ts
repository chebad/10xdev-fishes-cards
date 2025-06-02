import type { AiFlashcardSuggestionItem } from "../../types";

/**
 * Interface for AI flashcard generation service
 */
interface IAiFlashcardGeneratorService {
  generateFlashcardSuggestions(sourceText: string): Promise<AiFlashcardSuggestionItem[]>;
}

/**
 * OpenAI API response structure
 */
interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  model: string;
}

/**
 * Flashcard structure from AI response
 */
interface AiFlashcardRaw {
  question: string;
  answer: string;
}

/**
 * Service for generating flashcard suggestions using AI models via OpenAI Platform.
 */
export class AiFlashcardGeneratorService implements IAiFlashcardGeneratorService {
  private readonly openAiApiKey: string;
  private readonly openAiBaseUrl = "https://api.openai.com/v1";
  private readonly defaultModel = "gpt-3.5-turbo"; // Ekonomiczny model do testów
  private readonly timeout = 30000; // 30 sekund timeout

  constructor() {
    const apiKey = import.meta.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    this.openAiApiKey = apiKey;
  }

  /**
   * Generates flashcard suggestions from source text using AI.
   *
   * @param sourceText - Text to generate flashcards from (1000-10000 chars)
   * @returns Promise that resolves to array of flashcard suggestions
   * @throws {Error} When AI service is unavailable or fails
   */
  async generateFlashcardSuggestions(sourceText: string): Promise<AiFlashcardSuggestionItem[]> {
    if (!sourceText || sourceText.length < 1000 || sourceText.length > 10000) {
      throw new Error("Source text must be between 1000 and 10000 characters");
    }

    const startTime = Date.now();
    console.log(`[AI] Starting flashcard generation with ${sourceText.length} characters`);

    try {
      const response = await this.callOpenAIAPI(sourceText);
      const suggestions = this.parseOpenAIResponse(response);

      const endTime = Date.now();
      console.log(`[AI] Successfully generated ${suggestions.length} suggestions in ${endTime - startTime}ms`);

      return suggestions;
    } catch (error) {
      const endTime = Date.now();
      console.error(`[AI] Error after ${endTime - startTime}ms:`, error);

      if (error instanceof Error) {
        // Rozróżniaj typy błędów dla odpowiednich kodów HTTP
        if (error.message.includes("timeout") || error.message.includes("network")) {
          console.error("[AI] Service unavailable - timeout or network issue");
          throw new Error("AI_SERVICE_UNAVAILABLE");
        }
        if (error.message.includes("API") || error.message.includes("OpenAI")) {
          console.error("[AI] Service error - API issue:", error.message);
          throw new Error("AI_SERVICE_ERROR");
        }
        if (error.message.includes("OPENAI_API_KEY")) {
          console.error("[AI] Configuration error - missing API key");
          throw error; // Zachowaj oryginalny komunikat
        }
      }

      console.error("[AI] Unexpected error during generation:", error);
      throw new Error("INTERNAL_SERVER_ERROR");
    }
  }

  /**
   * Calls OpenAI API to generate flashcard suggestions.
   */
  private async callOpenAIAPI(sourceText: string): Promise<OpenAIResponse> {
    const prompt = this.buildPrompt(sourceText);

    const requestBody = {
      model: this.defaultModel,
      messages: [
        {
          role: "system",
          content:
            "Jesteś ekspertem w tworzeniu fiszek edukacyjnych. Twoim zadaniem jest stworzenie pytań i odpowiedzi na podstawie podanego tekstu.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    };

    console.log(`[AI] Calling OpenAI API with model: ${this.defaultModel}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error(`[AI] Request timeout after ${this.timeout}ms`);
      controller.abort();
    }, this.timeout);

    try {
      const response = await fetch(`${this.openAiBaseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.openAiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`[AI] OpenAI API responded with status: ${response.status}`);

      if (!response.ok) {
        if (response.status >= 500) {
          console.error(`[AI] OpenAI server error: ${response.status} ${response.statusText}`);
          throw new Error("AI service is temporarily unavailable");
        }

        const errorData = await response.json().catch(() => null);
        const errorMessage = `OpenAI API error: ${response.status} ${response.statusText} ${errorData ? JSON.stringify(errorData) : ""}`;
        console.error(`[AI] API error:`, errorMessage);
        throw new Error(errorMessage);
      }

      const data = (await response.json()) as OpenAIResponse;
      console.log(`[AI] Successfully received response from OpenAI`);
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        console.error(`[AI] Request aborted due to timeout`);
        throw new Error("Request timeout - AI service is taking too long to respond");
      }

      console.error(`[AI] Network or fetch error:`, error);
      throw error;
    }
  }

  /**
   * Builds the prompt for AI to generate flashcards.
   */
  private buildPrompt(sourceText: string): string {
    return `Na podstawie poniższego tekstu źródłowego, wygeneruj 5-8 fiszek edukacyjnych. Każda fiszka powinna zawierać:
- Pytanie (konkretne, jasne i sprawdzające zrozumienie)
- Odpowiedź (dokładną i zwięzłą)

Odpowiedź podaj w formacie JSON jako tablicę obiektów z polami: "question" i "answer".

Przykład formatu odpowiedzi:
[
  {
    "question": "Co to jest fotosynteza?",
    "answer": "Proces, w którym rośliny wykorzystują światło słoneczne do produkcji glukozy z dwutlenku węgla i wody."
  }
]

Tekst źródłowy:
${sourceText}

Odpowiedź (tylko JSON):`;
  }

  /**
   * Parses OpenAI API response and extracts flashcard suggestions.
   */
  private parseOpenAIResponse(response: OpenAIResponse): AiFlashcardSuggestionItem[] {
    if (!response?.choices?.[0]?.message?.content) {
      console.error("[AI] Invalid response structure from OpenAI:", JSON.stringify(response, null, 2));
      throw new Error("Invalid response format from AI service");
    }

    const content = response.choices[0].message.content.trim();
    console.log(`[AI] Parsing AI response content (${content.length} chars)`);

    try {
      // Próbuj wyekstrahować JSON z odpowiedzi
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;

      const flashcards = JSON.parse(jsonString) as AiFlashcardRaw[];

      if (!Array.isArray(flashcards)) {
        console.error("[AI] Parsed content is not an array:", flashcards);
        throw new Error("AI response is not an array");
      }

      console.log(`[AI] Successfully parsed ${flashcards.length} flashcards from AI response`);

      return flashcards.map((card: AiFlashcardRaw, index: number) => {
        if (!card.question || !card.answer) {
          console.error(`[AI] Invalid flashcard at index ${index}:`, card);
          throw new Error(`Invalid flashcard format at index ${index}: missing question or answer`);
        }

        return {
          suggestedQuestion: String(card.question).trim(),
          suggestedAnswer: String(card.answer).trim(),
          aiModelUsed: response.model || this.defaultModel,
        };
      });
    } catch {
      console.error("[AI] Failed to parse AI response as JSON. Raw content:", content);
      throw new Error("Failed to parse AI response - invalid JSON format");
    }
  }
}

/**
 * Factory function to create AiFlashcardGeneratorService instance.
 */
export function getAiFlashcardGeneratorService(): IAiFlashcardGeneratorService {
  // W środowisku deweloperskim bez OPENAI_API_KEY, użyj mock service
  const apiKey = import.meta.env.OPENAI_API_KEY;
  if (!apiKey && import.meta.env.MODE === "development") {
    console.warn("[AI] Using Mock AI Service - OPENAI_API_KEY not provided");
    return new MockAiFlashcardGeneratorService();
  }

  return new AiFlashcardGeneratorService();
}

/**
 * Mock AI service for development when OpenAI API key is not available
 */
class MockAiFlashcardGeneratorService implements IAiFlashcardGeneratorService {
  async generateFlashcardSuggestions(sourceText: string): Promise<AiFlashcardSuggestionItem[]> {
    if (!sourceText || sourceText.length < 1000 || sourceText.length > 10000) {
      throw new Error("Source text must be between 1000 and 10000 characters");
    }

    console.log(`[AI:MOCK] Generating mock flashcards for ${sourceText.length} characters`);

    // Symuluj opóźnienie API
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const firstWords = sourceText.slice(0, 100);
    const mockSuggestions: AiFlashcardSuggestionItem[] = [
      {
        suggestedQuestion: `Co jest głównym tematem tego tekstu, który zaczyna się od: "${firstWords.slice(0, 50)}..."?`,
        suggestedAnswer: `Głównym tematem jest zawartość przedstawiona w podanym tekście źródłowym.`,
        aiModelUsed: "mock-ai-v1.0",
      },
      {
        suggestedQuestion: `Jakie kluczowe informacje zawiera podany materiał?`,
        suggestedAnswer: `Materiał zawiera informacje edukacyjne wymagające pogłębionej analizy.`,
        aiModelUsed: "mock-ai-v1.0",
      },
      {
        suggestedQuestion: `Dlaczego ten temat jest istotny w kontekście nauki?`,
        suggestedAnswer: `Ten temat jest istotny, ponieważ dostarcza cennej wiedzy w danej dziedzinie.`,
        aiModelUsed: "mock-ai-v1.0",
      },
      {
        suggestedQuestion: `Jakie są praktyczne zastosowania tej wiedzy?`,
        suggestedAnswer: `Wiedza ta może być wykorzystana w praktyce do lepszego zrozumienia tematu.`,
        aiModelUsed: "mock-ai-v1.0",
      },
      {
        suggestedQuestion: `Co należy zapamiętać z tego materiału?`,
        suggestedAnswer: `Należy zapamiętać kluczowe pojęcia i koncepcje przedstawione w tekście.`,
        aiModelUsed: "mock-ai-v1.0",
      },
    ];

    console.log(`[AI:MOCK] Generated ${mockSuggestions.length} mock flashcard suggestions`);
    return mockSuggestions;
  }
}
