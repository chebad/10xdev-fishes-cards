import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AiSuggestionItem from "./AiSuggestionItem";
import type { AiSuggestionsListProps } from "@/types";

export default function AiSuggestionsList({ suggestions, onAccept, onReject }: AiSuggestionsListProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sugestie Fiszek AI</CardTitle>
        <CardDescription>
          Wygenerowano {suggestions.length}{" "}
          {suggestions.length === 1 ? "fiszkę" : suggestions.length < 5 ? "fiszki" : "fiszek"}. Możesz je przejrzeć i
          wybrać te, które chcesz zapisać.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <AiSuggestionItem
              key={`${suggestion.suggestedQuestion}-${index}`}
              suggestion={suggestion}
              onAccept={onAccept}
              onReject={onReject}
              index={index + 1}
            />
          ))}
        </div>

        {suggestions.length > 0 && (
          <div className="mt-6 p-4 bg-amber-50 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Wskazówka:</strong> Przejrzyj wszystkie sugestie przed zaakceptowaniem. Możesz edytować zapisane
              fiszki później w zakładce &quot;Moje Fiszki&quot;.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
