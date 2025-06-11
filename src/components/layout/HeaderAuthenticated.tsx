import { useState } from "react";

import { LogOut, Loader2 } from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface HeaderAuthenticatedProps {
  userEmail?: string;
}

export function HeaderAuthenticated({ userEmail }: HeaderAuthenticatedProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Logout error:", data.error);

        toast.error("Błąd wylogowania", {
          description: data.error || "Wystąpił błąd podczas wylogowania. Spróbuj ponownie.",
        });

        return;
      }

      toast.success("Wylogowano pomyślnie", {
        description: "Zostałeś pomyślnie wylogowany.",
      });

      // Przekierowanie na stronę główną po krótkim opóźnieniu

      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      console.error("Unexpected logout error:", error);

      toast.error("Błąd wylogowania", {
        description: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
      });
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}

          <div className="flex items-center">
            <a
              href="/app"
              className="text-xl sm:text-2xl font-bold text-primary hover:text-primary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
            >
              FishCards
            </a>
          </div>

          {/* User info and logout */}

          <div className="flex items-center space-x-4">
            {userEmail && <span className="text-sm text-gray-600 hidden sm:inline">Cześć {userEmail}!</span>}

            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />

                  <span className="hidden sm:inline">Wylogowywanie...</span>
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" />

                  <span className="hidden sm:inline">Wyloguj</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
