import { useState, useCallback, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AiGeneratorFormProps } from "@/types";

export default function AiGeneratorForm({ onGenerate, isGenerating, error }: AiGeneratorFormProps) {
  const [sourceText, setSourceText] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Debounced validation to improve UX
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsTyping(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [sourceText]);

  const handleTextChange = useCallback((value: string) => {
    setSourceText(value);
    setIsTyping(true);

    // Immediate feedback for critical errors
    if (value.length > 10000) {
      setValidationError(`Tekst nie może przekraczać 10000 znaków. Obecnie: ${value.length}`);
    } else {
      setValidationError(null);
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Final validation before submission
      if (sourceText.length < 1000) {
        setValidationError("Tekst musi mieć co najmniej 1000 znaków");
        return;
      }

      if (sourceText.length > 10000) {
        setValidationError("Tekst nie może przekraczać 10000 znaków");
        return;
      }

      setValidationError(null);

      try {
        await onGenerate({ sourceText });
      } catch {
        // Error will be handled by parent component
      }
    },
    [sourceText, onGenerate]
  );

  // Optimized calculations with useMemo
  const stats = useMemo(() => {
    const charCount = sourceText.length;
    const wordCount = sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0;
    const progress = Math.min((charCount / 1000) * 100, 100);
    const isValid = charCount >= 1000 && charCount <= 10000;

    let status: "empty" | "too-short" | "valid" | "too-long" = "empty";
    if (charCount === 0) status = "empty";
    else if (charCount < 1000) status = "too-short";
    else if (charCount <= 10000) status = "valid";
    else status = "too-long";

    return { charCount, wordCount, progress, isValid, status };
  }, [sourceText]);

  const getStatusColor = () => {
    switch (stats.status) {
      case "valid":
        return "text-green-600";
      case "too-long":
        return "text-red-500";
      case "too-short":
        return "text-amber-600";
      default:
        return "text-gray-500";
    }
  };

  const getProgressColor = () => {
    switch (stats.status) {
      case "valid":
        return "bg-green-500";
      case "too-long":
        return "bg-red-500";
      case "too-short":
        return "bg-amber-500";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🤖 Generator Fiszek AI
          {isGenerating && (
            <div className="inline-flex items-center gap-1 text-sm text-blue-600">
              <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
              Generowanie...
            </div>
          )}
        </CardTitle>
        <CardDescription>
          Wprowadź tekst edukacyjny (1000-10000 znaków), a AI automatycznie wygeneruje dla Ciebie fiszki do nauki.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Text input section */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label htmlFor="sourceText" className="text-sm font-medium text-gray-700">
                📝 Tekst źródłowy
              </label>
              <div className="text-xs text-gray-500">
                Słowa: {stats.wordCount} | Znaki: {stats.charCount}
              </div>
            </div>

            <Textarea
              id="sourceText"
              placeholder="Wklej tutaj tekst z którego chcesz wygenerować fiszki...

Przykłady tekstów, które działają najlepiej:
• Fragment podręcznika akademickiego
• Artykuł naukowy lub popularnonaukowy  
• Notatki z wykładu lub prezentacji
• Materiał edukacyjny z definicjami i przykładami
• Tekst zawierający fakty, koncepcje i wzajemne relacje

Unikaj: prostych list, tabel bez kontekstu, bardzo technicznych specyfikacji."
              value={sourceText}
              onChange={(e) => handleTextChange(e.target.value)}
              className="min-h-[200px] resize-y"
              disabled={isGenerating}
              aria-describedby="char-counter validation-message"
            />

            {/* Enhanced character counter with progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className={getStatusColor()}>
                  {stats.charCount}/10000 znaków
                  {stats.status === "too-short" && !isTyping && stats.charCount > 0 && (
                    <span className="ml-2 text-amber-600">(potrzebujesz jeszcze {1000 - stats.charCount} znaków)</span>
                  )}
                  {stats.status === "valid" && <span className="ml-2 text-green-600">✓ Gotowe do generowania</span>}
                </span>
                <span className="text-gray-500">
                  {stats.status === "too-short" && `${Math.round(stats.progress)}%`}
                  {stats.status === "valid" && "✅ Optymalna długość"}
                  {stats.status === "too-long" && "⚠️ Za długi"}
                </span>
              </div>

              {/* Progress bar for texts under 1000 chars */}
              {stats.status === "too-short" && stats.charCount > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColor()}`}
                    style={{ width: `${stats.progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>

          {/* Validation errors */}
          {validationError && !isTyping && (
            <Alert variant="destructive" id="validation-message">
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {/* API errors */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <div>
                  <strong>Wystąpił błąd:</strong> {error}
                  <div className="text-xs mt-1 text-red-600">
                    Sprawdź połączenie internetowe lub spróbuj ponownie za chwilę.
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Generate button with enhanced states */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!stats.isValid || isGenerating || isTyping}
              className="min-w-[160px] transition-all duration-200"
              size="lg"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generuję...
                </span>
              ) : (
                <span className="flex items-center gap-2">✨ Generuj fiszki</span>
              )}
            </Button>
          </div>
        </form>

        {/* Enhanced usage tips */}
        {stats.charCount < 500 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
              💡 Przewodnik wprowadzania tekstu
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h5 className="font-medium mb-2">✅ Idealne teksty:</h5>
                <ul className="space-y-1 text-xs">
                  <li>• Fragmenty podręczników z definicjami</li>
                  <li>• Artykuły z przykładami i wyjaśnieniami</li>
                  <li>• Materiały z jasną strukturą wiedzy</li>
                  <li>• Teksty z konkretnymi faktami</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">❌ Unikaj:</h5>
                <ul className="space-y-1 text-xs">
                  <li>• Prostych list lub enumeracji</li>
                  <li>• Bardzo technicznych specyfikacji</li>
                  <li>• Tekstów bez kontekstu</li>
                  <li>• Fragmentów kodu programowania</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Advanced tips for experienced users */}
        {stats.isValid && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
              🚀 Tekst gotowy do analizy!
            </h4>
            <div className="text-sm text-green-800 space-y-2">
              <p>
                <strong>Co się stanie dalej:</strong>
              </p>
              <ul className="text-xs space-y-1 ml-4">
                <li>• AI przeanalizuje treść i wyodrębni kluczowe koncepcje</li>
                <li>• Zostaną wygenerowane 5-8 pytań sprawdzających zrozumienie</li>
                <li>• Każdą fiszkę będziesz mógł przejrzeć i edytować przed zapisem</li>
                <li>• Proces zajmuje zwykle 10-30 sekund</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
