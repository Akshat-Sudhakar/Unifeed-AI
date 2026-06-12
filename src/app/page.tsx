'use client';

import { useState, useCallback } from 'react';
import Header from '@/components/layout/Header';
import InputPanel from '@/components/input/InputPanel';
import OutputWorkspace from '@/components/output/OutputWorkspace';
import BlueprintHistory from '@/components/history/BlueprintHistory';
import { useGenerate } from '@/hooks/useGenerate';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useSwipeFile } from '@/hooks/useSwipeFile';
import type { GenerateRequest, Blueprint, ContentIdea } from '@/lib/types';
import { APP_CONFIG } from '@/lib/constants';

// Removed SkeletonCard as it is no longer needed in the centered layout design

// ── Main page ─────────────────────────────────────────────────────
export default function DashboardPage() {
  const { result, isLoading, error, generate, reset } = useGenerate();
  const { addEntry, isIdSaved } = useSwipeFile();
  const [blueprints, setBlueprints] = useLocalStorage<Blueprint[]>('unifeed-blueprints', []);
  const [currentRequest, setCurrentRequest] = useState<GenerateRequest | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const handleGenerate = useCallback(
    async (request: GenerateRequest) => {
      setCurrentRequest(request);
      const response = await generate(request);
      if (response) {
        const blueprint: Blueprint = {
          id: `bp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          request,
          response,
          createdAt: new Date().toISOString(),
          title: request.topic,
        };
        setBlueprints((prev: Blueprint[]) => {
          const updated = [blueprint, ...prev];
          return updated.length > APP_CONFIG.maxHistoryItems
            ? updated.slice(0, APP_CONFIG.maxHistoryItems)
            : updated;
        });
      }
    },
    [generate, setBlueprints]
  );

  const handleLoadBlueprint = useCallback(
    (blueprint: Blueprint) => {
      setCurrentRequest(blueprint.request);
      reset();
      window.dispatchEvent(new CustomEvent('load-blueprint', { detail: blueprint }));
      setHistoryOpen(false);
    },
    [reset]
  );

  const handleDeleteBlueprint = useCallback(
    (id: string) => setBlueprints((prev: Blueprint[]) => prev.filter((b) => b.id !== id)),
    [setBlueprints]
  );

  const handleClearAll = useCallback(() => setBlueprints([]), [setBlueprints]);

  const handleSaveToSwipeFile = useCallback(
    (idea: ContentIdea) => {
      if (currentRequest) {
        addEntry(idea, currentRequest.segment, currentRequest.topic, currentRequest.tone);
      }
    },
    [addEntry, currentRequest]
  );

  const hasContent = isLoading || !!result || !!error;

  return (
    <div style={{ minHeight: '100vh', background: '#030304' }} className="flex flex-col">
      <Header
        historyCount={blueprints.length}
        onHistoryToggle={() => setHistoryOpen((o) => !o)}
      />

      {/* History backdrop */}
      {historyOpen && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-sm"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setHistoryOpen(false)}
          aria-hidden="true"
        />
      )}
      {/* History drawer */}
      <div
        aria-label="Blueprint history"
        style={{ transition: 'transform 0.3s ease-in-out' }}
        className={`fixed inset-y-0 right-0 z-50 w-80 ${historyOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <BlueprintHistory
          blueprints={blueprints}
          onLoad={handleLoadBlueprint}
          onDelete={handleDeleteBlueprint}
          onClearAll={handleClearAll}
        />
      </div>

      {/* ── Main dynamic layout ─────────────────────────────── */}
      <div
        className="flex flex-1 gap-6 px-6 py-6 lg:px-8 lg:py-8 transition-all duration-700 ease-in-out"
        style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', justifyContent: hasContent ? 'flex-start' : 'center' }}
      >
        {/* ── LEFT/CENTER: Input panel ────────────────────────── */}
        <aside 
          className="transition-all duration-700 ease-in-out"
          style={{ 
            flex: hasContent ? '0 0 45%' : '0 0 100%', 
            maxWidth: hasContent ? '45%' : '640px', 
            minWidth: '340px' 
          }}
        >
          {/* Sticky card that fills the viewport height */}
          <div
            className="rounded-2xl border"
            style={{
              background: '#0F1115',
              borderColor: 'rgba(255,255,255,0.08)',
              position: 'sticky',
              top: '72px',
              /* Exact height = viewport minus header minus 2×vertical padding */
              height: 'calc(100vh - 72px - 48px)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              padding: '24px',
            }}
          >
            <InputPanel onGenerate={handleGenerate} isLoading={isLoading} />
          </div>
        </aside>

        {/* ── RIGHT: Output ───────────────────────────── */}
        <main 
          id="main-content" 
          className={`transition-all duration-700 ease-in-out overflow-hidden ${hasContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95 w-0 hidden'}`}
          style={{ flex: hasContent ? '1 1 55%' : '0 0 0%', minWidth: 0 }}
        >

          {/* Error */}
          {error && (
            <div
              className="mb-6 flex items-start gap-3 rounded-xl border p-4 animate-slide-down"
              style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}
              role="alert"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-red-400">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <p className="font-medium text-red-300">{error}</p>
                <button type="button" onClick={reset} className="mt-1.5 text-sm text-red-400 underline hover:text-red-300">
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
              <div className="relative mb-8">
                <div className="h-16 w-16 rounded-full" style={{ border: '4px solid rgba(255,255,255,0.05)' }} />
                <div
                  className="absolute inset-0 h-16 w-16 animate-spin rounded-full"
                  style={{ border: '4px solid transparent', borderTopColor: '#F7931A' }}
                />
                <div
                  className="absolute inset-2 h-12 w-12 animate-spin rounded-full"
                  style={{ border: '4px solid transparent', borderTopColor: '#FFD600', animationDirection: 'reverse', animationDuration: '1.5s' }}
                />
              </div>
              <h3 className="font-heading text-xl font-semibold text-white">Crafting Your Blueprint</h3>
              <p className="mt-2 max-w-xs text-center text-sm" style={{ color: '#94A3B8' }}>
                AI is generating hyper-targeted content for UniforMeFy…
              </p>
              <div className="mt-5 flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-2 w-2 animate-bounce rounded-full" style={{ background: '#F7931A', animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* Output workspace */}
          {!isLoading && result && (
            <OutputWorkspace
              ideas={result.ideas}
              postingTimes={result.postingTimes}
              request={currentRequest}
              onSaveToSwipeFile={handleSaveToSwipeFile}
              isIdeaSaved={isIdSaved}
            />
          )}

          {/* Empty State removed per new centered layout design */}
        </main>
      </div>
    </div>
  );
}
