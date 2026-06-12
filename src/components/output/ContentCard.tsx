'use client';

import { useState, useCallback } from 'react';
import type { ContentIdea } from '@/lib/types';
import VisualBrief from './VisualBrief';

interface ContentCardProps {
  idea: ContentIdea;
  onSave: (idea: ContentIdea) => void;
  isSaved: boolean;
}

/** Label mapping for hook variations */
const hookLabels = ['Hook A', 'Hook B', 'Hook C', 'Hook D', 'Hook E'];

/**
 * Copies text to the clipboard and returns a promise.
 * Falls back to textarea trick for older browsers.
 */
async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
}

export default function ContentCard({ idea, onSave, isSaved }: ContentCardProps) {
  // Track which individual items are in "copied" state (by key)
  const [copiedKeys, setCopiedKeys] = useState<Set<string>>(new Set());

  const handleCopy = useCallback(async (text: string, key: string) => {
    try {
      await copyToClipboard(text);
      setCopiedKeys((prev) => new Set(prev).add(key));
      setTimeout(() => {
        setCopiedKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }, 2000);
    } catch {
      // Silently ignore — clipboard API might be unavailable
    }
  }, []);

  /** Build the full-content text for the "Copy All" button */
  const buildFullContent = useCallback((): string => {
    const parts: string[] = [];
    idea.hooks.forEach((h, i) => {
      parts.push(`${hookLabels[i] ?? `Hook ${i + 1}`}: ${h.text}`);
    });
    parts.push('');
    parts.push(idea.body);
    parts.push('');
    if (idea.cta) {
      parts.push(`CTA: ${idea.cta}`);
      parts.push('');
    }
    if (idea.hashtags.length > 0) {
      parts.push(idea.hashtags.join(' '));
    }
    return parts.join('\n');
  }, [idea]);

  const isCopied = (key: string) => copiedKeys.has(key);

  return (
    <article className="rounded-2xl border border-white/10 bg-[#0F1115] p-6 transition-all duration-300 hover:border-[#F7931A]/20 hover:shadow-[0_0_30px_-10px_rgba(247,147,26,0.15)]">
      {/* ─── Hook Variations ────────────────────────────── */}
      <section aria-label="Hook variations" className="mb-5">
        <h4 className="mb-3 text-[10px] font-mono uppercase tracking-widest text-[#94A3B8]">
          Hook Variations
        </h4>
        <div className="flex flex-col gap-3">
          {idea.hooks.map((hook, idx) => {
            const label = hookLabels[idx] ?? `Hook ${idx + 1}`;
            const key = `hook-${idx}`;
            const copied = isCopied(key);

            return (
              <div
                key={hook.id}
                className="group relative rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition-all duration-200 hover:border-[#F7931A]/20"
              >
                <span className="mb-1.5 inline-block rounded-md border border-[#F7931A]/20 bg-[#F7931A]/10 px-2 py-0.5 text-[10px] font-bold font-mono uppercase tracking-widest text-[#F7931A]">
                  {label}
                </span>
                <p className="text-sm leading-relaxed text-white/80">
                  {hook.text}
                </p>

                {/* Copy button */}
                <button
                  type="button"
                  onClick={() => handleCopy(hook.text, key)}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#94A3B8] opacity-0 transition-all group-hover:opacity-100 hover:border-[#F7931A]/30 hover:text-[#F7931A] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F7931A]"
                  aria-label={copied ? 'Copied' : `Copy ${label}`}
                >
                  {copied ? (
                    <CheckIcon className="h-3.5 w-3.5 text-[#FFD600]" />
                  ) : (
                    <CopyIcon className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Main Body ──────────────────────────────────── */}
      <section aria-label="Content body" className="mb-5">
        <h4 className="mb-3 text-[10px] font-mono uppercase tracking-widest text-[#94A3B8]">
          Body
        </h4>
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
          <p className="whitespace-pre-line text-sm leading-relaxed text-white/80">
            {idea.body}
          </p>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────── */}
      {idea.cta && (
        <section aria-label="Call to action" className="mb-5">
          <h4 className="mb-3 text-[10px] font-mono uppercase tracking-widest text-[#94A3B8]">
            Call to Action
          </h4>
          <div className="rounded-xl border border-[#F7931A]/20 bg-[#F7931A]/5 px-4 py-3">
            <p className="text-sm font-semibold text-[#F7931A]">{idea.cta}</p>
          </div>
        </section>
      )}

      {/* ─── Hashtags ───────────────────────────────────── */}
      {idea.hashtags.length > 0 && (
        <section aria-label="Hashtags" className="mb-5">
          <h4 className="mb-3 text-[10px] font-mono uppercase tracking-widest text-[#94A3B8]">
            Hashtags
          </h4>
          <div className="flex flex-wrap gap-2">
            {idea.hashtags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#F7931A]/20 bg-[#F7931A]/8 px-3 py-1 text-xs font-mono text-[#F7931A]"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ─── Reels Script Timeline ──────────────────────── */}
      {idea.reelsScript && idea.reelsScript.scenes.length > 0 && (
        <section aria-label="Reels script" className="mb-5">
          <h4 className="mb-3 text-[10px] font-mono uppercase tracking-widest text-[#94A3B8]">
            🎬 Scene-by-Scene Script
          </h4>
          <div className="relative space-y-0">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-[#F7931A]/50 via-[#EA580C]/30 to-transparent" aria-hidden="true" />

            {idea.reelsScript.scenes.map((scene, idx) => (
              <div key={idx} className="relative pl-10 pb-4 last:pb-0">
                {/* Timeline dot */}
                <div className="absolute left-[11px] top-1 h-2.5 w-2.5 rounded-full bg-[#F7931A] ring-2 ring-[#030304] shadow-[0_0_8px_2px_rgba(247,147,26,0.5)]" aria-hidden="true" />

                <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-[#F7931A]">
                      Scene {idx + 1}
                    </span>
                    <span className="rounded-md border border-[#F7931A]/20 bg-[#F7931A]/10 px-2 py-0.5 text-[10px] font-mono text-[#F7931A]">
                      {scene.duration}
                    </span>
                  </div>

                  <div className="grid gap-2 text-xs sm:grid-cols-3">
                    {/* Visual */}
                    <div>
                      <span className="mb-0.5 block text-xs font-semibold text-[#94A3B8]">
                        🎥 Visual
                      </span>
                      <p className="leading-relaxed text-xs text-white/70">
                        {scene.visual}
                      </p>
                    </div>
                    {/* Text Overlay */}
                    <div>
                      <span className="mb-0.5 block text-xs font-semibold text-[#94A3B8]">
                        ✏️ Text
                      </span>
                      <p className="leading-relaxed text-xs text-white/70">
                        {scene.textOverlay}
                      </p>
                    </div>
                    {/* Audio */}
                    <div>
                      <span className="mb-0.5 block text-xs font-semibold text-[#94A3B8]">
                        🔊 Audio
                      </span>
                      <p className="leading-relaxed text-xs text-white/70">
                        {scene.audio}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Visual Brief ───────────────────────────────── */}
      <VisualBrief brief={idea.visualBrief} />

      {/* ─── Action Bar ─────────────────────────────────── */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {/* Copy All */}
        <button
          type="button"
          onClick={() => handleCopy(buildFullContent(), 'all')}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-mono uppercase tracking-wider text-[#94A3B8] transition-all duration-200 hover:border-[#F7931A]/30 hover:text-[#F7931A] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F7931A]"
          aria-label={isCopied('all') ? 'Content copied' : 'Copy entire content'}
        >
          {isCopied('all') ? (
            <>
              <CheckIcon className="h-4 w-4 text-[#FFD600]" />
              <span className="text-[#FFD600]">Copied!</span>
            </>
          ) : (
            <>
              <CopyIcon className="h-4 w-4" />
              Copy All
            </>
          )}
        </button>

        {/* Save to Swipe File */}
        <button
          type="button"
          onClick={() => onSave(idea)}
          disabled={isSaved}
          className={
            isSaved
              ? 'inline-flex items-center gap-2 rounded-full border border-[#F7931A]/30 bg-[#F7931A]/10 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#F7931A] cursor-default focus-visible:outline-none'
              : 'inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_0_15px_-5px_rgba(234,88,12,0.5)] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_25px_-5px_rgba(247,147,26,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7931A]'
          }
          aria-label={isSaved ? 'Saved to swipe file' : 'Save to swipe file'}
        >
          {isSaved ? (
            <BookmarkFilledIcon className="h-4 w-4" />
          ) : (
            <BookmarkIcon className="h-4 w-4" />
          )}
          {isSaved ? 'Saved' : 'Save to Swipe File'}
        </button>
      </div>
    </article>
  );
}

/* ────────────────────────────────────────────────────────────
 * Inline SVG Icons
 * ──────────────────────────────────────────────────────────── */

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x={9} y={9} width={13} height={13} rx={2} ry={2} />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function BookmarkFilledIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
