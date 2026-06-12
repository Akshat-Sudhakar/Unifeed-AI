// ============================================================
// UniFeed AI — useGenerate Hook
// ============================================================
// Custom hook for calling the /api/generate endpoint.
// ============================================================

'use client';

import { useState, useCallback } from 'react';
import type { GenerateRequest, GenerateResponse } from '@/lib/types';

interface UseGenerateReturn {
  result: GenerateResponse | null;
  isLoading: boolean;
  error: string | null;
  generate: (request: GenerateRequest) => Promise<GenerateResponse | null>;
  reset: () => void;
}

export function useGenerate(): UseGenerateReturn {
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (request: GenerateRequest): Promise<GenerateResponse | null> => {
      setIsLoading(true);
      setError(null);
      setResult(null);

      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage =
            data.message || data.error || 'Generation failed. Please try again.';
          setError(errorMessage);
          return null;
        }

        setResult(data as GenerateResponse);
        return data as GenerateResponse;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Network error. Please check your connection.';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { result, isLoading, error, generate, reset };
}
