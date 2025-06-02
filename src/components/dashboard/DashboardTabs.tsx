import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type DashboardTabType = "ai-generator" | "my-flashcards";

export default function DashboardTabs() {
  const [activeTab, setActiveTab] = useState<DashboardTabType>("ai-generator");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log("DashboardTabs loaded successfully");
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Ładowanie...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Nagłówek */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-lg text-gray-600">Witaj w aplikacji do nauki z fiszkami!</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DashboardTabType)}>
        <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
          <TabsTrigger value="ai-generator" className="text-base font-medium">
            🤖 Generator AI
          </TabsTrigger>
          <TabsTrigger value="my-flashcards" className="text-base font-medium">
            📚 Moje Fiszki
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-generator" className="mt-0">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🤖 Generator Fiszek AI</h2>
            <p className="text-gray-600 mb-6">Wklej tekst, a AI automatycznie wygeneruje dla Ciebie fiszki do nauki.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-blue-800 font-medium">💡 Ta funkcja będzie dostępna po implementacji API</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="my-flashcards" className="mt-0">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📚 Moja Kolekcja Fiszek</h2>
            <p className="text-gray-600 mb-6">
              Tutaj znajdziesz wszystkie swoje fiszki - zarówno wygenerowane przez AI, jak i utworzone ręcznie.
            </p>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <p className="text-purple-800 font-medium">🎯 Ta funkcja będzie dostępna po implementacji bazy danych</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Informacje o koncie */}
      <div className="bg-gray-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ℹ️ Informacje o koncie</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Status:</span>
            <span className="ml-2 text-green-600">✅ Zalogowany</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Wersja:</span>
            <span className="ml-2 text-gray-600">Beta 1.0</span>
          </div>
        </div>
      </div>

      {/* Logowanie działania */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-blue-900 font-medium mb-2">🎉 Logowanie działa!</h4>
        <p className="text-blue-800 text-sm">
          Pomyślnie zalogowałeś się do aplikacji. Ta strona dashboard jest tymczasowa - w przyszłości będzie zawierać
          funkcje zarządzania fiszkami.
        </p>
      </div>
    </div>
  );
}
