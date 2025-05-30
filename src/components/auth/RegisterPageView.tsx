import { useState } from "react";
import { toast } from "sonner";

import { supabaseClient } from "@/db/supabase.client";
import { RegistrationForm } from "./RegistrationForm";
import type { RegisterFormData } from "@/types";

export function RegisterPageView() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const { data: authData, error } = await supabaseClient.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        const errorMessage = getErrorMessage(error.message);
        setApiError(errorMessage);
        toast.error("Błąd rejestracji", {
          description: errorMessage,
        });
        return;
      }

      if (authData.user) {
        toast.success("Rejestracja pomyślna!", {
          description: "Sprawdź swoją skrzynkę email, aby potwierdzić konto.",
        });

        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    } catch (error) {
      const errorMessage = "Wystąpił nieoczekiwany błąd podczas rejestracji. Spróbuj ponownie później.";
      setApiError(errorMessage);
      toast.error("Błąd rejestracji", {
        description: errorMessage,
      });
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <RegistrationForm onSubmit={handleRegister} isLoading={isLoading} apiError={apiError} />
      </div>
    </div>
  );
}

function getErrorMessage(message: string): string {
  if (message.includes("User already registered")) {
    return "Użytkownik o tym adresie email już istnieje. Czy chcesz się zalogować?";
  }

  if (message.includes("Password should be")) {
    return "Hasło jest zbyt słabe. Spróbuj dłuższego lub bardziej złożonego hasła.";
  }

  if (message.includes("Invalid email")) {
    return "Niepoprawny format adresu email.";
  }

  return message;
}
