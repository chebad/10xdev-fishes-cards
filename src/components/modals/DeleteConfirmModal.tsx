import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { FlashcardListItemDto } from "@/types";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  flashcard?: FlashcardListItemDto;
  isDeleting: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  flashcard,
  isDeleting,
}: DeleteConfirmModalProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error("Błąd podczas usuwania:", error);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isDeleting && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-red-600">Usuń fiszkę</DialogTitle>
          <DialogDescription>
            Ta operacja jest nieodwracalna. Czy na pewno chcesz usunąć tę fiszkę?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Ostrzeżenie */}
          <Alert variant="destructive">
            <AlertDescription>
              <strong>Uwaga!</strong> Po usunięciu fiszki nie będzie można jej przywrócić.
            </AlertDescription>
          </Alert>

          {/* Podgląd usuwanej fiszki */}
          {flashcard && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Pytanie:</h4>
                <p className="text-sm text-gray-900 bg-blue-50 p-2 rounded">
                  {truncateText(flashcard.question, 150)}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Odpowiedź:</h4>
                <p className="text-sm text-gray-900 bg-green-50 p-2 rounded">
                  {truncateText(flashcard.answer, 150)}
                </p>
              </div>
            </div>
          )}

          {/* Przyciski */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={isDeleting}
            >
              Anuluj
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="min-w-[120px]"
            >
              {isDeleting ? "Usuwanie..." : "Usuń fiszkę"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 