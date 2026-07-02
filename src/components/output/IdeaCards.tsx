'use client';

import { useState, useCallback } from 'react';
import type { IdeaCard } from '@/lib/types';

interface IdeaCardsProps {
  ideas: IdeaCard[];
  isStreaming?: boolean;
  isSaved: (id: string) => boolean;
  onSaveIdea: (idea: IdeaCard) => void;
  onRemoveIdea: (id: string) => void;
}

import { CopyIcon, CheckIcon, BookmarkIcon } from '@/components/icons';

// ── Single idea card ──────────────────────────────────────────────
function IdeaCardItem({ idea, index, isSaved, onToggleSave }: { idea: IdeaCard; index: number; isSaved: boolean; onToggleSave: (idea: IdeaCard) => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(idea.engineered_prompt);
    } catch {
      const el = document.createElement('textarea');
      el.value = idea.engineered_prompt;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [idea.engineered_prompt]);

  return (
    <article
      className="border-2 border-[#111111] bg-white sharp-corners animate-slide-down"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
      aria-label={`Idea ${index + 1}: ${idea.idea?.title}`}
    >
      {/* Header */}
      <div className="flex items-start gap-4 border-b-2 border-[#111111] p-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#CC0000] border-2 border-[#111111] sharp-corners" aria-hidden="true">
          <span className="font-mono text-sm font-black text-white leading-none">{String(index + 1).padStart(2, '0')}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-lg font-black text-[#111111] uppercase tracking-tight leading-snug">
            {idea.idea?.title}
          </h3>
          <div className="mt-2 flex flex-wrap gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-[#737373]">
            <span className="bg-[#F0EFE8] px-2 py-0.5 border border-[#111111]">{idea.idea?.format}</span>
            <span className="bg-[#F0EFE8] px-2 py-0.5 border border-[#111111]">{idea.idea?.funnel_stage}</span>
          </div>
        </div>
      </div>

      {/* Idea Details */}
      <div className="px-5 pt-4 pb-4 space-y-4">
        {idea.novelty_note && (
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#CC0000] mb-1.5">Novelty Note</p>
            <p className="font-serif text-sm text-[#333333] leading-relaxed italic">{idea.novelty_note}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#525252] mb-1">Persona</p>
            <p className="text-xs text-[#333333] font-medium">{idea.idea?.persona}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#525252] mb-1">Pillar</p>
            <p className="text-xs text-[#333333] font-medium">{idea.idea?.pillar}</p>
          </div>
        </div>

        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#525252] mb-1">Core Angle</p>
          <p className="font-serif text-sm text-[#333333] leading-relaxed">{idea.idea?.core_angle}</p>
        </div>

        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#525252] mb-1">Why It Works</p>
          <p className="text-xs text-[#333333] leading-relaxed">{idea.idea?.why_it_works}</p>
        </div>

        {idea.idea?.talking_points?.length > 0 && (
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#525252] mb-1.5">Talking Points</p>
            <ul className="list-disc list-inside text-xs text-[#333333] space-y-1">
              {idea.idea.talking_points.map((tp, i) => <li key={i}>{tp}</li>)}
            </ul>
          </div>
        )}

        {idea.idea?.risk && (
          <div className="bg-[#FFF4F4] border border-[#CC0000] p-3 sharp-corners mt-2">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#CC0000] mb-1">Risk</p>
            <p className="text-xs text-[#CC0000] font-medium">{idea.idea.risk}</p>
          </div>
        )}
      </div>

      {/* Engineered prompt */}
      <div className="mx-5 mb-5 border-2 border-[#111111] sharp-corners bg-[#F0EFE8]">
        <div className="flex items-center justify-between border-b-2 border-[#111111] px-3.5 py-2">
          <div className="flex items-center gap-2">
            <div className="flex gap-1" aria-hidden="true">
              <div className="h-2 w-2 rounded-full bg-[#CC0000] border border-[#111111]" />
              <div className="h-2 w-2 rounded-full bg-[#E5A000] border border-[#111111]" />
              <div className="h-2 w-2 rounded-full bg-[#2E7D32] border border-[#111111]" />
            </div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#525252]">
              Engineered Prompt
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onToggleSave(idea)}
              aria-label={isSaved ? 'Remove from saved' : `Save idea ${index + 1}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-widest transition-all duration-200 sharp-corners border ${isSaved
                  ? 'bg-[#111111] border-[#111111] text-white'
                  : 'bg-white border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white'
                }`}
            >
              <BookmarkIcon size={12} filled={isSaved} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? 'Copied!' : `Copy prompt for idea ${index + 1}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-widest transition-all duration-200 sharp-corners border ${copied
                  ? 'bg-[#111111] border-[#111111] text-white'
                  : 'bg-white border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white'
                }`}
            >
              {copied
                ? <><CheckIcon size={12} /><span>Copied!</span></>
                : <><CopyIcon size={12} /><span>Copy Prompt</span></>
              }
            </button>
          </div>
        </div>

        <div className="p-3.5">
          <p className="font-mono text-xs text-[#333333] leading-relaxed whitespace-pre-wrap break-words">
            {idea.engineered_prompt}
          </p>
        </div>
      </div>
    </article>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function IdeaCards({ ideas, isStreaming = false, isSaved, onSaveIdea, onRemoveIdea }: IdeaCardsProps) {
  const [allCopied, setAllCopied] = useState(false);

  const handleCopyAll = useCallback(async () => {
    const text = ideas
      .map((idea, i) => `IDEA ${i + 1}: ${idea.idea?.title}\n\n${idea.engineered_prompt}`)
      .join('\n\n' + '─'.repeat(60) + '\n\n');
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2500);
  }, [ideas]);

  return (
    <section aria-label="Generated content ideas" aria-live="polite" className="space-y-5">
      {/* Header strip */}
      <div className="flex items-center justify-between border-b-4 border-[#111111] pb-3">
        <div>
          <h2 className="font-heading text-2xl font-black text-[#111111] uppercase tracking-tighter">
            {isStreaming && ideas.length === 0 ? 'Generating…' : `${ideas.length} Content ${ideas.length === 1 ? 'Idea' : 'Ideas'}`}
          </h2>
          <p className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[#737373]">
            Copy any prompt → paste into ChatGPT or Claude
          </p>
        </div>

        {/* Streaming pulse dots / Copy All button */}
        {isStreaming && ideas.length < 5 ? (
          <div className="flex gap-1.5" aria-label="Receiving ideas…" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-4 w-3 bg-[#111111] animate-typeset sharp-corners" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        ) : ideas.length > 0 ? (
          <button
            type="button"
            onClick={handleCopyAll}
            aria-label={allCopied ? 'All prompts copied' : 'Copy all engineered prompts'}
            className={`flex items-center gap-2 px-4 py-2 text-[11px] font-mono font-bold uppercase tracking-widest transition-all duration-200 sharp-corners border-2 ${allCopied
                ? 'bg-[#111111] border-[#111111] text-white'
                : 'bg-white border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white'
              }`}
          >
            {allCopied
              ? <><CheckIcon size={12} /><span>Copied All!</span></>
              : <><CopyIcon size={12} /><span>Copy All Prompts</span></>
            }
          </button>
        ) : null}
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-4">
        {ideas.map((idea, index) => (
          <IdeaCardItem
            key={idea.id}
            idea={idea}
            index={index}
            isSaved={isSaved(idea.id)}
            onToggleSave={(i) => isSaved(i.id) ? onRemoveIdea(i.id) : onSaveIdea(i)}
          />
        ))}

        {/* Skeleton placeholder while last cards are still streaming */}
        {isStreaming && ideas.length < 5 && (
          <div
            className="border-2 border-[#D1D1D1] sharp-corners overflow-hidden"
            aria-hidden="true"
            style={{ animationDelay: `${ideas.length * 60}ms` }}
          >
            <div className="border-b-2 border-[#D1D1D1] p-5 flex items-center gap-4">
              <div className="h-9 w-9 shrink-0 animate-shimmer sharp-corners" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-shimmer sharp-corners" />
                <div className="h-3 w-1/2 animate-shimmer sharp-corners" />
              </div>
            </div>
            <div className="p-5 space-y-2">
              <div className="h-3 w-full animate-shimmer sharp-corners" />
              <div className="h-3 w-5/6 animate-shimmer sharp-corners" />
              <div className="h-3 w-4/6 animate-shimmer sharp-corners" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
