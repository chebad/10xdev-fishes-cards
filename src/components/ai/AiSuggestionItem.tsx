import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AiFlashcardSuggestionItem, FlashcardDto } from "@/types";

interface AiSuggestionItemProps {
  suggestion: AiFlashcardSuggestionItem;
  onAccept: (suggestion: AiFlashcardSuggestionItem) => Promise<FlashcardDto | null>;
  onReject: (suggestion: AiFlashcardSuggestionItem) => void;
  index: number;
}

export default function AiSuggestionItem({ suggestion, onAccept, onReject, index }: AiSuggestionItemProps) {
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await onAccept(suggestion);
    } catch (error) {
      console.error("Błąd podczas akceptowania sugestii:", error);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = () => {
    onReject(suggestion);
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="pt-4">
        <div className="space-y-4">
          {/* Nagłówek z numerem */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Fiszka #{index}</span>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">{suggestion.aiModelUsed}</span>
          </div>

          {/* Pytanie */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Pytanie:</h4>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-900">{suggestion.suggestedQuestion}</p>
            </div>
          </div>

          {/* Odpowiedź */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Odpowiedź:</h4>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-900">{suggestion.suggestedAnswer}</p>
            </div>
          </div>

          {/* Przyciski akcji */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={handleAccept} disabled={isAccepting} className="flex-1">
              {isAccepting ? "Zapisywanie..." : "✓ Zapisz fiszkę"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleReject} disabled={isAccepting} className="flex-1">
              ✕ Odrzuć
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
