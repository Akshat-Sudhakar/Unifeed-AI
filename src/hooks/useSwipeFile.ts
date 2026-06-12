// ============================================================
// UniFeed AI — useSwipeFile Hook
// ============================================================
// Manages the saved swipe file entries with localStorage sync.
// ============================================================

'use client';

import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type {
  SwipeFileEntry,
  ContentIdea,
  Segment,
  Tone,
  Platform,
} from '@/lib/types';
import { APP_CONFIG } from '@/lib/constants';

interface UseSwipeFileReturn {
  entries: SwipeFileEntry[];
  addEntry: (
    idea: ContentIdea,
    segment: Segment,
    topic: string,
    tone: Tone
  ) => void;
  removeEntry: (id: string) => void;
  removeMultiple: (ids: string[]) => void;
  clearAll: () => void;
  isIdSaved: (ideaBody: string) => boolean;
  filterByPlatform: (platform: Platform) => SwipeFileEntry[];
  filterBySegment: (segment: Segment) => SwipeFileEntry[];
  searchEntries: (query: string) => SwipeFileEntry[];
  exportEntries: (ids?: string[]) => Promise<void>;
}

export function useSwipeFile(): UseSwipeFileReturn {
  const [entries, setEntries] = useLocalStorage<SwipeFileEntry[]>(
    'unifeed-swipe-file',
    []
  );

  const addEntry = useCallback(
    (idea: ContentIdea, segment: Segment, topic: string, tone: Tone) => {
      const newEntry: SwipeFileEntry = {
        id: `sf-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        idea,
        segment,
        topic,
        tone,
        savedAt: new Date().toISOString(),
        tags: [idea.platform, segment, tone],
      };

      setEntries((prev: SwipeFileEntry[]) => {
        const updated = [newEntry, ...prev];
        // Enforce max limit
        if (updated.length > APP_CONFIG.maxSwipeFileItems) {
          return updated.slice(0, APP_CONFIG.maxSwipeFileItems);
        }
        return updated;
      });
    },
    [setEntries]
  );

  const removeEntry = useCallback(
    (id: string) => {
      setEntries((prev: SwipeFileEntry[]) => prev.filter((e) => e.id !== id));
    },
    [setEntries]
  );

  const removeMultiple = useCallback(
    (ids: string[]) => {
      const idSet = new Set(ids);
      setEntries((prev: SwipeFileEntry[]) => prev.filter((e) => !idSet.has(e.id)));
    },
    [setEntries]
  );

  const clearAll = useCallback(() => {
    setEntries([]);
  }, [setEntries]);

  const isIdSaved = useCallback(
    (ideaBody: string) => {
      return entries.some((e) => e.idea.body === ideaBody);
    },
    [entries]
  );

  const filterByPlatform = useCallback(
    (platform: Platform) => {
      return entries.filter((e) => e.idea.platform === platform);
    },
    [entries]
  );

  const filterBySegment = useCallback(
    (segment: Segment) => {
      return entries.filter((e) => e.segment === segment);
    },
    [entries]
  );

  const searchEntries = useCallback(
    (query: string) => {
      const q = query.toLowerCase();
      return entries.filter(
        (e) =>
          e.idea.body.toLowerCase().includes(q) ||
          e.topic.toLowerCase().includes(q) ||
          e.idea.hooks.some((h) => h.text.toLowerCase().includes(q)) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
      );
    },
    [entries]
  );

  const exportEntries = useCallback(
    async (ids?: string[]) => {
      const toExport = ids
        ? entries.filter((e) => ids.includes(e.id))
        : entries;

      if (toExport.length === 0) return;

      try {
        const response = await fetch('/api/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entries: toExport }),
        });

        if (!response.ok) throw new Error('Export failed');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `unifeed-ai-export-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Export error:', err);
        throw err;
      }
    },
    [entries]
  );

  return useMemo(
    () => ({
      entries,
      addEntry,
      removeEntry,
      removeMultiple,
      clearAll,
      isIdSaved,
      filterByPlatform,
      filterBySegment,
      searchEntries,
      exportEntries,
    }),
    [
      entries,
      addEntry,
      removeEntry,
      removeMultiple,
      clearAll,
      isIdSaved,
      filterByPlatform,
      filterBySegment,
      searchEntries,
      exportEntries,
    ]
  );
}
