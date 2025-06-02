import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabaseClient } from "@/db/supabase.client";

interface AuthenticatedHeaderProps {
  userEmail: string;
}

export default function AuthenticatedHeader({ userEmail }: AuthenticatedHeaderProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (!error) {
        window.location.href = "/";
      } else {
        console.error("Błąd podczas wylogowywania:", error);
      }
    } catch (error) {
      console.error("Błąd podczas wylogowywania:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getInitials = (email: string) => {
    const name = email.split("@")[0];
    const initials = name
      .split(/[._-]/)
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
    return initials || email.charAt(0).toUpperCase();
  };

  return (
    <div className="w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo i nazwa aplikacji */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">🧠</span>
              </div>
              <div className="absolute -top-1 -right-1">
                <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5">
                  AI
                </Badge>
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FishCards
              </h1>
              <p className="text-xs text-gray-500 -mt-1">AI-powered learning</p>
            </div>
          </div>

          {/* Panel użytkownika */}
          <div className="flex items-center space-x-4">
            {/* Status online */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-green-50 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">Online</span>
            </div>

            {/* Informacje o użytkowniku */}
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              <div className="relative">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md ring-2 ring-white">
                  {getInitials(userEmail)}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>

              {/* Email i przycisk wylogowania */}
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium text-gray-900 truncate max-w-32 md:max-w-none">
                  {userEmail.split("@")[0]}
                </span>
                <span className="text-xs text-gray-500 truncate max-w-32 md:max-w-none">{userEmail}</span>
              </div>

              {/* Przycisk wylogowania */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="ml-2 text-gray-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors duration-200"
              >
                {isLoggingOut ? (
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">Wylogowywanie...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <span className="text-sm">🚪</span>
                    <span className="hidden sm:inline">Wyloguj</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
