import React from "react";
import type { CharacterCounterProps } from "@/types";

/**
 * Komponent wyświetlający licznik znaków z wizualną informacją o statusie
 */
export default function CharacterCounter({ current, min, max, showProgress = false }: CharacterCounterProps) {
  // Oblicz procent wykorzystania
  const percentage = max > 0 ? (current / max) * 100 : 0;

  // Określ kolor na podstawie statusu
  const getColorClass = () => {
    if (current < min) {
      return "text-orange-600"; // Za mało znaków
    }
    if (current > max) {
      return "text-red-600"; // Za dużo znaków
    }
    if (percentage > 90) {
      return "text-yellow-600"; // Blisko limitu
    }
    return "text-gray-500"; // OK
  };

  // Określ czy stan jest poprawny
  const isValid = current >= min && current <= max;

  // Wiadomość pomocnicza
  const getMessage = () => {
    if (current < min) {
      const needed = min - current;
      return `Potrzebujesz jeszcze ${needed} ${needed === 1 ? "znak" : needed < 5 ? "znaki" : "znaków"}`;
    }
    if (current > max) {
      const excess = current - max;
      return `Przekroczono limit o ${excess} ${excess === 1 ? "znak" : excess < 5 ? "znaki" : "znaków"}`;
    }
    if (percentage > 90) {
      const remaining = max - current;
      return `Zostało ${remaining} ${remaining === 1 ? "znak" : remaining < 5 ? "znaki" : "znaków"}`;
    }
    return null;
  };

  const message = getMessage();

  return (
    <div className="space-y-1">
      {/* Główny licznik */}
      <div className={`text-xs font-medium ${getColorClass()}`}>
        {current}/{max} znaków
        {!isValid && <span className="ml-1">⚠️</span>}
      </div>

      {/* Pasek postępu (opcjonalny) */}
      {showProgress && (
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-200 ${
              current > max
                ? "bg-red-500"
                : percentage > 90
                  ? "bg-yellow-500"
                  : current >= min
                    ? "bg-green-500"
                    : "bg-orange-500"
            }`}
            style={{
              width: `${Math.min(percentage, 100)}%`,
            }}
          />
        </div>
      )}

      {/* Wiadomość pomocnicza */}
      {message && <div className={`text-xs ${getColorClass()}`}>{message}</div>}
    </div>
  );
}
