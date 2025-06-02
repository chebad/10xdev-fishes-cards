import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AiGeneratorFormProps } from "@/types";

export default function AiGeneratorForm({ onGenerate, isGenerating, error }: AiGeneratorFormProps) {
  const [sourceText, setSourceText] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleTextChange = useCallback((value: string) => {
    setSourceText(value);

    // Walidacja w czasie rzeczywistym
    if (value.length < 1000 && value.length > 0) {
      setValidationError(`Tekst musi mieć co najmniej 1000 znaków. Obecnie: ${value.length}`);
    } else if (value.length > 10000) {
      setValidationError(`Tekst nie może przekraczać 10000 znaków. Obecnie: ${value.length}`);
    } else {
      setValidationError(null);
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Ostateczna walidacja przed wysłaniem
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
      } catch (err) {
        // Błąd będzie obsłużony przez rodzica
        console.error("Błąd podczas generowania:", err);
      }
    },
    [sourceText, onGenerate]
  );

  const isValid = sourceText.length >= 1000 && sourceText.length <= 10000;
  const charCount = sourceText.length;
  const getCharCountColor = () => {
    if (charCount < 1000) return "text-red-500";
    if (charCount > 10000) return "text-red-500";
    return "text-green-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generator Fiszek AI</CardTitle>
        <CardDescription>
          Wprowadź tekst z którego chcesz wygenerować fiszki. Tekst powinien mieć od 1000 do 10000 znaków.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="sourceText" className="text-sm font-medium text-gray-700">
              Tekst źródłowy
            </label>
            <Textarea
              id="sourceText"
              placeholder="Wklej tutaj tekst z którego chcesz wygenerować fiszki. Może to być fragment podręcznika, artykuł naukowy, notatki lub dowolny materiał edukacyjny..."
              value={sourceText}
              onChange={(e) => handleTextChange(e.target.value)}
              className="min-h-[200px] resize-y"
              disabled={isGenerating}
            />

            {/* Licznik znaków */}
            <div className={`text-sm ${getCharCountColor()}`}>
              {charCount}/10000 znaków
              {charCount > 0 && charCount < 1000 && (
                <span className="ml-2">(potrzebujesz jeszcze {1000 - charCount} znaków)</span>
              )}
            </div>
          </div>

          {/* Błędy walidacji */}
          {validationError && (
            <Alert variant="destructive">
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {/* Błędy API */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Przycisk generowania */}
          <div className="flex justify-end">
            <Button type="submit" disabled={!isValid || isGenerating} className="min-w-[140px]">
              {isGenerating ? "Generuję..." : "Generuj fiszki"}
            </Button>
          </div>
        </form>

        {/* Instrukcje użycia */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Wskazówki</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Najlepsze rezultaty uzyskasz z tekstami o charakterze edukacyjnym</li>
            <li>• AI automatycznie podzieli tekst na logiczne pytania i odpowiedzi</li>
            <li>• Po wygenerowaniu będziesz mógł przejrzeć i wybrać najlepsze fiszki</li>
            <li>• Każdą fiszkę możesz później edytować lub usunąć</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
