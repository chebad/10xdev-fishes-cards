import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { FAQAccordionProps } from "@/types";

/**
 * Komponent React wykorzystujący Shadcn/ui Accordion do prezentacji pytań i odpowiedzi FAQ.
 * Zapewnia dostępną nawigację klawiaturą i responsywny design.
 */
export function FAQAccordion({ items, allowMultiple = true, className = "" }: FAQAccordionProps) {
  // Walidacja danych FAQ
  const validItems = items.filter((item) => item.id && item.question?.trim() && item.answer?.trim());

  if (validItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto max-w-md">
          <div className="mb-4 text-4xl text-muted-foreground/50">🤔</div>
          <h3 className="text-lg font-medium text-foreground mb-2">Brak dostępnych pytań</h3>
          <p className="text-muted-foreground text-sm">Nie znaleziono żadnych pytań i odpowiedzi do wyświetlenia.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <Accordion type={allowMultiple ? "multiple" : "single"} className="w-full space-y-3" collapsible>
        {validItems.map((item, index) => (
          <AccordionItem
            key={item.id}
            value={item.id}
            className="group border border-border/40 rounded-xl overflow-hidden bg-card/20 hover:bg-card/40 transition-all duration-200 hover:shadow-md hover:border-border/60"
          >
            <AccordionTrigger className="text-left hover:no-underline px-6 py-4 [&[data-state=open]>svg]:rotate-180 transition-all duration-200">
              <div className="flex items-start gap-4 w-full pr-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium mt-0.5">
                  {index + 1}
                </div>
                <h3 className="text-base font-semibold text-foreground leading-relaxed text-left group-hover:text-primary transition-colors duration-200 sm:text-lg">
                  {item.question}
                </h3>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="ml-12 text-muted-foreground leading-relaxed">
                {item.answer.split("\n").map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex} className="mb-3 last:mb-0 text-sm sm:text-base">
                    {paragraph}
                  </p>
                ))}
                {item.category && (
                  <div className="mt-4 pt-4 border-t border-border/30">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                      {item.category}
                    </span>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
