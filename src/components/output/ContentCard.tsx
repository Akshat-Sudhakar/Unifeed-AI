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
    <article className="border-x-2 border-b-2 border-[#111111] bg-white p-8 transition-all duration-300">
      {/* ─── Hook Variations ────────────────────────────── */}
      <section aria-label="Hook variations" className="mb-8">
        <h4 className="mb-4 text-[10px] font-mono font-bold uppercase tracking-widest text-[#111111] border-b-2 border-[#111111] pb-2">
          Hook Variations
        </h4>
        <div className="flex flex-col gap-4">
          {idea.hooks.map((hook, idx) => {
            const label = hookLabels[idx] ?? `Hook ${idx + 1}`;
            const key = `hook-${idx}`;
            const copied = isCopied(key);

            return (
              <div
                key={hook.id}
                className="group relative border border-[#111111] bg-[#F9F9F7] p-5 transition-all duration-200 sharp-corners hover:bg-[#E5E5E0]"
              >
                <span className="mb-2 inline-block border border-[#111111] bg-[#111111] px-2 py-0.5 text-[10px] font-bold font-mono uppercase tracking-widest text-[#F9F9F7] sharp-corners">
                  {label}
                </span>
                <p className="text-base leading-relaxed font-serif text-[#111111]">
                  {hook.text}
                </p>

                {/* Copy button */}
                <button
                  type="button"
                  onClick={() => handleCopy(hook.text, key)}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center border border-[#111111] bg-white text-[#111111] opacity-0 transition-all group-hover:opacity-100 hover:bg-[#111111] hover:text-white sharp-corners"
                  aria-label={copied ? 'Copied' : `Copy ${label}`}
                >
                  {copied ? (
                    <span className="font-bold">✓</span>
                  ) : (
                    <CopyIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Main Body ──────────────────────────────────── */}
      <section aria-label="Content body" className="mb-8">
        <h4 className="mb-4 text-[10px] font-mono font-bold uppercase tracking-widest text-[#111111] border-b-2 border-[#111111] pb-2">
          Body
        </h4>
        <div className="border border-[#111111] bg-[#F9F9F7] p-6 sharp-corners">
          <p className="whitespace-pre-line text-lg leading-relaxed font-serif text-[#111111] first-letter:text-5xl first-letter:font-black first-letter:float-left first-letter:mr-2 first-letter:mt-1">
            {idea.body}
          </p>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────── */}
      {idea.cta && (
        <section aria-label="Call to action" className="mb-8">
          <h4 className="mb-4 text-[10px] font-mono font-bold uppercase tracking-widest text-[#111111] border-b-2 border-[#111111] pb-2">
            Call to Action
          </h4>
          <div className="border border-[#111111] bg-white px-5 py-4 sharp-corners shadow-[4px_4px_0px_0px_#CC0000]">
            <p className="text-base font-bold text-[#CC0000] font-sans">{idea.cta}</p>
          </div>
        </section>
      )}

      {/* ─── Hashtags ───────────────────────────────────── */}
      {idea.hashtags.length > 0 && (
        <section aria-label="Hashtags" className="mb-8">
          <h4 className="mb-4 text-[10px] font-mono font-bold uppercase tracking-widest text-[#111111] border-b-2 border-[#111111] pb-2">
            Hashtags
          </h4>
          <div className="flex flex-wrap gap-2">
            {idea.hashtags.map((tag) => (
              <span
                key={tag}
                className="border border-[#111111] bg-[#F9F9F7] px-3 py-1 text-xs font-mono font-bold text-[#111111] sharp-corners hover:bg-[#111111] hover:text-[#F9F9F7] transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ─── Reels Script Timeline ──────────────────────── */}
      {idea.reelsScript && idea.reelsScript.scenes.length > 0 && (
        <section aria-label="Reels script" className="mb-8">
          <h4 className="mb-4 text-[10px] font-mono font-bold uppercase tracking-widest text-[#111111] border-b-2 border-[#111111] pb-2">
            🎬 Scene-by-Scene Script
          </h4>
          <div className="relative space-y-0">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-1 bg-[#111111]" aria-hidden="true" />

            {idea.reelsScript.scenes.map((scene, idx) => (
              <div key={idx} className="relative pl-10 pb-6 last:pb-0">
                {/* Timeline dot */}
                <div className="absolute left-[14px] top-1 h-3 w-3 bg-[#CC0000] border-2 border-[#111111] sharp-corners" aria-hidden="true" />

                <div className="border border-[#111111] bg-[#F9F9F7] p-5 sharp-corners">
                  <div className="mb-3 flex items-center justify-between border-b border-[#111111] pb-2">
                    <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-[#111111]">
                      Scene {idx + 1}
                    </span>
                    <span className="border border-[#111111] bg-[#111111] px-2 py-0.5 text-[10px] font-mono text-white sharp-corners">
                      {scene.duration}
                    </span>
                  </div>

                  <div className="grid gap-4 text-sm sm:grid-cols-3 font-serif">
                    {/* Visual */}
                    <div>
                      <span className="mb-1 block text-xs font-bold font-mono uppercase tracking-widest text-[#525252]">
                        🎥 Visual
                      </span>
                      <p className="leading-relaxed text-[#111111]">
                        {scene.visual}
                      </p>
                    </div>
                    {/* Text Overlay */}
                    <div>
                      <span className="mb-1 block text-xs font-bold font-mono uppercase tracking-widest text-[#525252]">
                        ✏️ Text
                      </span>
                      <p className="leading-relaxed text-[#111111]">
                        {scene.textOverlay}
                      </p>
                    </div>
                    {/* Audio */}
                    <div>
                      <span className="mb-1 block text-xs font-bold font-mono uppercase tracking-widest text-[#525252]">
                        🔊 Audio
                      </span>
                      <p className="leading-relaxed text-[#111111]">
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
      <div className="mt-8 flex flex-wrap items-center gap-4 border-t-2 border-[#111111] pt-6">
        {/* Copy All */}
        <button
          type="button"
          onClick={() => handleCopy(buildFullContent(), 'all')}
          className="btn-editorial-outline px-6 py-3"
          aria-label={isCopied('all') ? 'Content copied' : 'Copy entire content'}
        >
          {isCopied('all') ? (
            <>
              <span className="font-bold">✓</span>
              <span>COPIED!</span>
            </>
          ) : (
            <>
              <CopyIcon className="h-4 w-4" />
              COPY ALL
            </>
          )}
        </button>

        {/* Save to Saved Ideas */}
        <button
          type="button"
          onClick={() => onSave(idea)}
          disabled={isSaved}
          className={
            isSaved
              ? 'btn-editorial-outline px-6 py-3 !bg-[#111111] !text-white'
              : 'btn-editorial px-6 py-3'
          }
          aria-label={isSaved ? 'Saved to saved ideas' : 'Save to saved ideas'}
        >
          {isSaved ? (
            <BookmarkFilledIcon className="h-4 w-4" />
          ) : (
            <BookmarkIcon className="h-4 w-4" />
          )}
          {isSaved ? 'SAVED' : 'SAVE TO SAVED IDEAS'}
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
