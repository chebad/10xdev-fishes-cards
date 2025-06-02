import { useState } from "react";
import type { DashboardTabType } from "@/types";

export const useDashboard = () => {
  const [activeTab, setActiveTab] = useState<DashboardTabType>("ai-generator");

  const switchTab = (tab: DashboardTabType) => {
    setActiveTab(tab);
  };

  return {
    activeTab,
    setActiveTab,
    switchTab,
  };
};
