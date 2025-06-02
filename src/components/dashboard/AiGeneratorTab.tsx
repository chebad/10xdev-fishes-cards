import { useAiGeneration } from "@/hooks/useAiGeneration";
import AiGeneratorForm from "../ai/AiGeneratorForm";
import AiSuggestionsList from "../ai/AiSuggestionsList";

export default function AiGeneratorTab() {
  const { state, generateSuggestions, acceptSuggestion, rejectSuggestion } = useAiGeneration();

  return (
    <div className="space-y-6">
      <AiGeneratorForm onGenerate={generateSuggestions} isGenerating={state.isGenerating} error={state.error} />

      {state.suggestions.length > 0 && (
        <AiSuggestionsList suggestions={state.suggestions} onAccept={acceptSuggestion} onReject={rejectSuggestion} />
      )}
    </div>
  );
}
