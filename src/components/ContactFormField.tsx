import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ContactFormFieldProps } from "../types";

/**
 * Wielokrotnego użytku komponent pola formularza kontaktowego
 * Obsługuje różne typy pól: email, text, textarea
 */
export const ContactFormField: React.FC<ContactFormFieldProps> = ({
  name,
  label,
  type,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  placeholder,
  maxLength,
}) => {
  const fieldId = `contact-form-${name}`;
  const errorId = `${fieldId}-error`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleBlur = () => {
    onBlur();
  };

  const commonProps = {
    id: fieldId,
    name,
    value,
    onChange: handleChange,
    onBlur: handleBlur,
    placeholder,
    maxLength,
    "aria-invalid": !!error,
    "aria-describedby": error ? errorId : undefined,
    className: error ? "border-destructive focus-visible:ring-destructive" : undefined,
  };

  return (
    <div className="space-y-2">
      {/* Etykieta pola */}
      <Label htmlFor={fieldId} className="text-sm font-medium text-foreground">
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="wymagane">
            *
          </span>
        )}
      </Label>

      {/* Pole input/textarea */}
      {type === "textarea" ? (
        <Textarea {...commonProps} rows={4} className={`resize-none ${commonProps.className || ""}`} />
      ) : (
        <Input {...commonProps} type={type} autoComplete={type === "email" ? "email" : "off"} />
      )}

      {/* Licznik znaków dla pól z ograniczeniem */}
      {maxLength && value && (
        <div className="flex justify-end">
          <span
            className={`text-xs ${value.length > maxLength * 0.9 ? "text-destructive" : "text-muted-foreground"}`}
            aria-live="polite"
          >
            {value.length}/{maxLength}
          </span>
        </div>
      )}

      {/* Komunikat błędu */}
      {error && (
        <div id={errorId} role="alert" aria-live="polite" className="text-sm text-destructive font-medium">
          {error}
        </div>
      )}
    </div>
  );
};
