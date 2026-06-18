'use client';

import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { IdeaCard } from '@/lib/types';

export interface SavedIdea extends IdeaCard {
  savedAt: string;
}

interface UseSavedIdeasReturn {
  savedIdeas: SavedIdea[];
  saveIdea: (idea: IdeaCard) => void;
  removeIdea: (id: string) => void;
  isSaved: (id: string) => boolean;
  clearAll: () => void;
  exportAll: () => void;
}

export function useSavedIdeas(): UseSavedIdeasReturn {
  const [savedIdeas, setSavedIdeas] = useLocalStorage<SavedIdea[]>('unifeed-saved-ideas', []);

  const saveIdea = useCallback((idea: IdeaCard) => {
    setSavedIdeas((prev) => {
      // Don't save duplicates
      if (prev.some((p) => p.id === idea.id)) return prev;
      
      const newIdea: SavedIdea = {
        ...idea,
        savedAt: new Date().toISOString(),
      };
      
      const updated = [newIdea, ...prev];
      // Keep up to 50 saved ideas
      if (updated.length > 50) return updated.slice(0, 50);
      return updated;
    });
  }, [setSavedIdeas]);

  const removeIdea = useCallback((id: string) => {
    setSavedIdeas((prev) => prev.filter((idea) => idea.id !== id));
  }, [setSavedIdeas]);

  const isSaved = useCallback((id: string) => {
    return savedIdeas.some((idea) => idea.id === id);
  }, [savedIdeas]);

  const clearAll = useCallback(() => {
    setSavedIdeas([]);
  }, [setSavedIdeas]);

  const exportAll = useCallback(() => {
    if (savedIdeas.length === 0) return;
    
    const headers = ['Title', 'Hook/Angle', 'Engineered Prompt', 'Saved At'];
    
    const escapeCSV = (value: string) => {
      if (/[,"\n\r]/.test(value)) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };
    
    const rows = savedIdeas.map(idea => [
      escapeCSV(idea.idea?.title),
      escapeCSV(idea.idea?.core_angle),
      escapeCSV(idea.engineered_prompt),
      escapeCSV(new Date(idea.savedAt).toLocaleDateString())
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unifeed-ideas-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [savedIdeas]);

  return useMemo(
    () => ({
      savedIdeas,
      saveIdea,
      removeIdea,
      isSaved,
      clearAll,
      exportAll,
    }),
    [savedIdeas, saveIdea, removeIdea, isSaved, clearAll, exportAll]
  );
}
