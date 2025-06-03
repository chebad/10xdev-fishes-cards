import React, { useState } from 'react';
import { toast } from 'sonner';
import { ContactForm } from './ContactForm';
import { Toaster } from '@/components/ui/sonner';
import type { ContactFormData } from '../types';

/**
 * Główny kontener dla formularza kontaktowego
 * Zarządza powiadomieniami toast i komunikatami sukcesu
 */
export const ContactFormContainer: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState<Date | null>(null);

  const handleFormSubmit = async (data: ContactFormData) => {
    try {
      // Oznacz sukces
      setIsSuccess(true);
      setLastSubmissionTime(new Date());

      // Wyświetl toast sukcesu
      toast.success('Wiadomość została wysłana!', {
        description: 'Dziękujemy za kontakt. Odpowiemy na Twoje zapytanie tak szybko, jak to możliwe.',
        duration: 5000,
      });

      // Ukryj komunikat sukcesu po 10 sekundach
      setTimeout(() => {
        setIsSuccess(false);
      }, 10000);

    } catch (error) {
      console.error('Unexpected error in ContactFormContainer:', error);
      
      // Backup toast - jeśli coś pójdzie nie tak w kontenerze
      toast.error('Wystąpił nieoczekiwany błąd', {
        description: 'Spróbuj ponownie lub skontaktuj się z nami w inny sposób.',
        duration: 5000,
      });
    }
  };

  const handleTryAgain = () => {
    setIsSuccess(false);
  };

  if (isSuccess) {
    return (
      <>
        <div className="text-center py-8">
          {/* Ikona sukcesu */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Komunikat sukcesu */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-foreground">
              Wiadomość została wysłana!
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              Dziękujemy za kontakt. Otrzymaliśmy Twoją wiadomość i odpowiemy 
              na Twoje zapytanie tak szybko, jak to możliwe.
            </p>
            
            {lastSubmissionTime && (
              <p className="text-sm text-muted-foreground">
                Wysłano: {lastSubmissionTime.toLocaleString('pl-PL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>

          {/* Przyciski akcji */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <button
              onClick={handleTryAgain}
              className="px-6 py-2 text-primary hover:text-primary/80 border border-primary/20 hover:border-primary/40 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Wyślij kolejną wiadomość
            </button>
            
            <a
              href="/faq"
              className="px-6 py-2 text-muted-foreground hover:text-foreground border border-border hover:border-border/80 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Zobacz FAQ
            </a>
          </div>
        </div>

        {/* Toast Provider - zawsze dostępny */}
        <Toaster />
      </>
    );
  }

  return (
    <div className="w-full">
      {/* Główny formularz */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <ContactForm onSubmit={handleFormSubmit} />
      </div>

      {/* Dodatkowa informacja dla użytkowników */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Odpowiadamy zwykle w ciągu 24 godzin w dni robocze.
        </p>
      </div>

      {/* Toast Provider */}
      <Toaster />
    </div>
  );
}; 