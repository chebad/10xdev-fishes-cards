import React from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary";
  };
  children?: ReactNode;
  className?: string;
}

/**
 * Komponent dla pustych stanów (empty states)
 */
export default function EmptyState({
  icon = "📭",
  title,
  description,
  action,
  children,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      <div className="max-w-md mx-auto space-y-4">
        {/* Ikona */}
        <div className="text-6xl mb-4">
          {icon}
        </div>

        {/* Tytuł */}
        <h3 className="text-xl font-semibold text-gray-900">
          {title}
        </h3>

        {/* Opis */}
        {description && (
          <p className="text-gray-600 leading-relaxed">
            {description}
          </p>
        )}

        {/* Akcja */}
        {action && (
          <div className="pt-4">
            <Button
              onClick={action.onClick}
              variant={action.variant || "default"}
              className="inline-flex items-center gap-2"
            >
              {action.label}
            </Button>
          </div>
        )}

        {/* Dodatkowa zawartość */}
        {children && (
          <div className="pt-4">
            {children}
          </div>
        )}
      </div>
    </div>
  );
} 