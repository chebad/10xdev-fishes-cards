import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FlashcardItemProps } from "@/types";

export default function FlashcardItem({ flashcard, onEdit, onDelete }: FlashcardItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDelete = async () => {
    if (window.confirm("Czy na pewno chcesz usunąć tę fiszkę?")) {
      setIsDeleting(true);
      try {
        await onDelete(flashcard.id);
      } catch (error) {
        console.error("Błąd podczas usuwania fiszki:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleEdit = () => {
    onEdit(flashcard);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Card className={`transition-shadow hover:shadow-md ${isDeleting ? "opacity-50" : ""}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Nagłówek z typem fiszki i datą */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {flashcard.isAiGenerated ? (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  🤖 AI
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  ✏️ Ręczne
                </Badge>
              )}
              {flashcard.aiAcceptedAt && (
                <span className="text-xs text-gray-500">Zaakceptowano {formatDate(flashcard.aiAcceptedAt)}</span>
              )}
            </div>
            <span className="text-xs text-gray-500">{formatDate(flashcard.createdAt)}</span>
          </div>

          {/* Pytanie */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Pytanie:</h4>
              {(flashcard.question.length > 150 || flashcard.answer.length > 150) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleExpanded}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {isExpanded ? "Zwiń" : "Rozwiń"}
                </Button>
              )}
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-900">
                {isExpanded ? flashcard.question : truncateText(flashcard.question, 150)}
              </p>
            </div>
          </div>

          {/* Odpowiedź */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Odpowiedź:</h4>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-900">
                {isExpanded ? flashcard.answer : truncateText(flashcard.answer, 150)}
              </p>
            </div>
          </div>

          {/* Przyciski akcji */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              {flashcard.updatedAt !== flashcard.createdAt && <span>Edytowano {formatDate(flashcard.updatedAt)}</span>}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                disabled={isDeleting}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              >
                ✏️ Edytuj
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                {isDeleting ? "Usuwanie..." : "🗑️ Usuń"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
