import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AiGeneratorTab from "./AiGeneratorTab";
import MyFlashcardsTab from "./MyFlashcardsTab";
import type { DashboardTabType } from "@/types";

export default function DashboardTabs() {
  const [activeTab, setActiveTab] = useState<DashboardTabType>("ai-generator");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
          <AiGeneratorTab />
        </TabsContent>

        <TabsContent value="my-flashcards" className="mt-0">
          <MyFlashcardsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
