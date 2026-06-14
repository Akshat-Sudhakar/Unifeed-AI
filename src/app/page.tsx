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
    <div className="flex flex-col">
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
            maxWidth: hasContent ? '45%' : '800px', 
            minWidth: '340px' 
          }}
        >
          {/* Sticky card that fills the viewport height */}
          <div
            className="border-2 border-[#111111] bg-[#F9F9F7] sharp-corners"
            style={{
              position: 'sticky',
              top: '96px',
              height: 'calc(100vh - 96px - 48px)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
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
              className="mb-6 flex items-start gap-3 border-2 border-[#CC0000] bg-white p-4 animate-slide-down sharp-corners"
              role="alert"
            >
              <span className="text-[#CC0000] font-bold text-xl mt-0.5">!</span>
              <div>
                <p className="font-bold text-[#CC0000] font-mono text-sm uppercase tracking-widest">Error Processing Request</p>
                <p className="font-serif text-[#111111]">{error}</p>
                <button type="button" onClick={reset} className="mt-2 text-xs font-bold uppercase tracking-widest text-[#111111] underline decoration-[#CC0000] hover:text-[#CC0000]">
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
              <div className="border-2 border-[#111111] bg-white px-8 py-10 text-center max-w-sm w-full sharp-corners hard-shadow-hover">
                <div className="mb-6 font-mono text-xs font-bold uppercase tracking-widest text-[#CC0000] animate-pulse">
                  System Processing...
                </div>
                <h3 className="font-heading text-4xl font-black text-[#111111] mb-4">
                  Printing Press Active
                </h3>
                <p className="font-serif text-[#525252] italic mb-6">
                  Assembling intelligence, typesetting components, and preparing the final blueprint.
                </p>
                <div className="flex gap-1.5 justify-center">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-4 w-3 bg-[#111111] animate-typeset sharp-corners" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
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
