'use client';

import { useState, useCallback } from 'react';
import Header from '@/components/layout/Header';
import InputPanel from '@/components/input/InputPanel';
import IdeaCards from '@/components/output/IdeaCards';
import SavedIdeasDrawer from '@/components/output/SavedIdeasDrawer';
import { useSavedIdeas } from '@/hooks/useSavedIdeas';
import type { GenerateRequest, IdeaCard } from '@/lib/types';

export default function DashboardPage() {
  const [ideas, setIdeas]           = useState<IdeaCard[]>([]);
  const [isLoading, setIsLoading]   = useState(false);   // spinner before first card
  const [isStreaming, setIsStreaming] = useState(false);  // cards arriving live
  const [error, setError]           = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { savedIdeas, saveIdea, removeIdea, isSaved, clearAll, exportAll } = useSavedIdeas();

  const handleGenerate = useCallback(async (request: GenerateRequest) => {
    setIsLoading(true);
    setIsStreaming(false);
    setError(null);
    setIdeas([]);

    try {
      const res = await fetch('/api/generate-ideas', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(request),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || data.error || 'Generation failed. Please try again.');
        return;
      }

      // Switch immediately from full-page spinner to streaming cards
      setIsLoading(false);
      setIsStreaming(true);

      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      let leftover  = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        leftover += decoder.decode(value, { stream: true });
        const lines = leftover.split('\n');
        leftover = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const data = JSON.parse(trimmed);
            if (data.idea)  setIdeas((prev) => [...prev, data.idea as IdeaCard]);
            if (data.error) setError(data.error as string);
          } catch { /* partial line — wait */ }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, []);

  const hasContent = isLoading || isStreaming || ideas.length > 0 || !!error;

  return (
    <div className="flex flex-col">
      <Header historyCount={savedIdeas.length} onHistoryToggle={() => setIsDrawerOpen(true)} />

      <div
        className="flex flex-1 gap-6 px-6 py-6 lg:px-8 lg:py-8 transition-all duration-700 ease-in-out"
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%',
          justifyContent: hasContent ? 'flex-start' : 'center',
        }}
      >
        {/* ── LEFT / CENTER: Input panel ────────────────────── */}
        <aside
          className="transition-all duration-700 ease-in-out"
          style={{
            flex:     hasContent ? '0 0 45%' : '0 0 100%',
            maxWidth: hasContent ? '45%'      : '800px',
            minWidth: '340px',
          }}
        >
          <div
            className="border-2 border-[#111111] bg-[#F9F9F7] sharp-corners"
            style={{
              position:      'sticky',
              top:           '96px',
              height:        'calc(100vh - 96px - 48px)',
              display:       'flex',
              flexDirection: 'column',
              overflow:      'hidden',
            }}
          >
            <InputPanel onGenerate={handleGenerate} isLoading={isLoading || isStreaming} />
          </div>
        </aside>

        {/* ── RIGHT: Output ─────────────────────────────────── */}
        <main
          id="main-content"
          className={`transition-all duration-700 ease-in-out overflow-hidden ${
            hasContent ? 'opacity-100 flex-1' : 'opacity-0 w-0 hidden'
          }`}
          style={{ minWidth: 0 }}
        >
          {/* Error */}
          {error && (
            <div
              className="mb-6 flex items-start gap-3 border-2 border-[#CC0000] bg-white p-4 animate-slide-down sharp-corners"
              role="alert"
            >
              <span className="text-[#CC0000] font-bold text-xl mt-0.5" aria-hidden="true">!</span>
              <div>
                <p className="font-bold text-[#CC0000] font-mono text-sm uppercase tracking-widest">Error</p>
                <p className="font-serif text-[#111111]">{error}</p>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="mt-2 text-xs font-bold uppercase tracking-widest text-[#111111] underline decoration-[#CC0000] hover:text-[#CC0000] transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Full-page spinner — only while waiting for the very first card */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-32 animate-fade-in" role="status" aria-live="polite">
              <div className="border-2 border-[#111111] bg-white px-8 py-10 text-center max-w-sm w-full sharp-corners">
                <div className="mb-6 font-mono text-xs font-bold uppercase tracking-widest text-[#CC0000] animate-pulse">
                  Generating Ideas...
                </div>
                <h3 className="font-heading text-4xl font-black text-[#111111] mb-4">
                  Idea Engine Active
                </h3>
                <p className="font-serif text-[#525252] italic mb-6">
                  Crafting 5 unique content angles for your parameters.
                </p>
                <div className="flex gap-1.5 justify-center">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-4 w-3 bg-[#111111] animate-typeset sharp-corners"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Cards render progressively as they stream in */}
          {(isStreaming || ideas.length > 0) && (
            <IdeaCards 
              ideas={ideas} 
              isStreaming={isStreaming} 
              isSaved={isSaved}
              onSaveIdea={saveIdea}
              onRemoveIdea={removeIdea}
            />
          )}
        </main>
      </div>

      <SavedIdeasDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        savedIdeas={savedIdeas} 
        onRemove={removeIdea} 
        onClearAll={clearAll}
        onExportAll={exportAll}
      />
    </div>
  );
}
