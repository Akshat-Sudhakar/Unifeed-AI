'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type KeyboardEvent,
} from 'react';
import type { ContentIdea, GenerateRequest, PostingTime, Platform } from '@/lib/types';
import ContentCard from './ContentCard';
import BestTimeToPost from './BestTimeToPost';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface OutputWorkspaceProps {
  ideas: ContentIdea[];
  postingTimes: PostingTime[];
  request: GenerateRequest | null;
  onSaveToSwipeFile: (idea: ContentIdea) => void;
  isIdeaSaved: (body: string) => boolean;
}

/* ------------------------------------------------------------------ */
/*  Platform metadata                                                  */
/* ------------------------------------------------------------------ */

interface TabMeta {
  platform: Platform;
  label: string;
  icon: string;
}

const platformMeta: Record<Platform, TabMeta> = {
  linkedin: { platform: 'linkedin', label: 'LinkedIn', icon: '💼' },
  'instagram-post': {
    platform: 'instagram-post',
    label: 'Instagram Post',
    icon: '📸',
  },
  'instagram-reels': {
    platform: 'instagram-reels',
    label: 'Reels',
    icon: '🎬',
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function OutputWorkspace({
  ideas,
  postingTimes,
  request,
  onSaveToSwipeFile,
  isIdeaSaved,
}: OutputWorkspaceProps) {
  /* ── derive available tabs from ideas ─────────────────────────── */
  const tabs = useMemo<TabMeta[]>(() => {
    const seen = new Set<Platform>();
    const result: TabMeta[] = [];
    for (const idea of ideas) {
      if (!seen.has(idea.platform)) {
        seen.add(idea.platform);
        const meta = platformMeta[idea.platform];
        if (meta) result.push(meta);
      }
    }
    return result;
  }, [ideas]);

  const [activeTab, setActiveTab] = useState<Platform | null>(null);

  /* Reset active tab when tabs change */
  useEffect(() => {
    if (tabs.length > 0) {
      setActiveTab((prev) => {
        if (prev && tabs.some((t) => t.platform === prev)) return prev;
        return tabs[0].platform;
      });
    } else {
      setActiveTab(null);
    }
  }, [tabs]);

  /* ── animated underline ───────────────────────────────────────── */
  const tabRefs = useRef<Map<Platform, HTMLButtonElement>>(new Map());
  const tablistRef = useRef<HTMLDivElement>(null);
  const [underline, setUnderline] = useState({ left: 0, width: 0 });

  const measureUnderline = useCallback(() => {
    if (!activeTab) return;
    const btn = tabRefs.current.get(activeTab);
    const container = tablistRef.current;
    if (btn && container) {
      const containerRect = container.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      setUnderline({
        left: btnRect.left - containerRect.left,
        width: btnRect.width,
      });
    }
  }, [activeTab]);

  useEffect(() => {
    measureUnderline();
    window.addEventListener('resize', measureUnderline);
    return () => window.removeEventListener('resize', measureUnderline);
  }, [measureUnderline]);

  /* ── keyboard navigation ──────────────────────────────────────── */
  const handleTabKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      if (tabs.length === 0) return;
      const idx = tabs.findIndex((t) => t.platform === activeTab);
      let next = idx;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        next = (idx + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        next = (idx - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        next = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        next = tabs.length - 1;
      } else {
        return;
      }

      const nextPlatform = tabs[next].platform;
      setActiveTab(nextPlatform);
      tabRefs.current.get(nextPlatform)?.focus();
    },
    [tabs, activeTab],
  );

  /* ── find the idea for the active tab ─────────────────────────── */
  const activeIdea = useMemo(
    () => ideas.find((i) => i.platform === activeTab) ?? null,
    [ideas, activeTab],
  );

  /* ── empty state ──────────────────────────────────────────────── */
  if (ideas.length === 0) {
    return (
      <section
        aria-label="Output workspace"
        className="flex min-h-[420px] flex-col items-center justify-center border-2 border-[#111111] bg-white p-10 text-center sharp-corners hard-shadow-hover"
      >
        {/* Newspaper Illustration */}
        <div className="relative mb-8">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter">
            <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M2 15h10" />
            <path d="M2 18h10" />
            <path d="M2 21h10" />
          </svg>
          {/* Accent block */}
          <div className="absolute -bottom-2 -right-2 h-4 w-4 bg-[#CC0000] border-2 border-[#111111] sharp-corners" aria-hidden="true" />
        </div>

        <h3 className="mb-2 text-2xl font-heading font-black text-[#111111] uppercase tracking-tighter">
          Awaiting Content
        </h3>
        <p className="max-w-sm text-sm leading-relaxed font-serif text-[#525252] italic">
          Fill in the configuration on the left and strike the{' '}
          <span className="font-bold text-[#111111] not-italic uppercase tracking-widest text-xs">Print Content Blueprint</span>{' '}
          button to begin the press.
        </p>

        {/* Decorative dots */}
        <div className="mt-8 flex gap-2" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 bg-[#111111] sharp-corners"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </section>
    );
  }

  /* ── main render ──────────────────────────────────────────────── */
  return (
    <section aria-label="Output workspace" className="space-y-6">
      {/* ── Tab Bar ──────────────────────────────────────────── */}
      <div className="relative border-b-4 border-[#111111] bg-[#F9F9F7] sharp-corners">
        <div
          ref={tablistRef}
          role="tablist"
          aria-label="Content platforms"
          className="relative flex"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.platform;
            return (
              <button
                key={tab.platform}
                ref={(el) => {
                  if (el) tabRefs.current.set(tab.platform, el);
                }}
                role="tab"
                id={`tab-${tab.platform}`}
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.platform}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(tab.platform)}
                onKeyDown={handleTabKeyDown}
                className={`relative z-10 flex items-center gap-2 px-5 py-4 text-sm font-mono font-bold uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#111111] ${
                  isActive
                    ? 'text-[#111111] bg-[#E5E5E0]'
                    : 'text-[#737373] hover:text-[#111111] hover:bg-black/5'
                }`}
              >
                <span aria-hidden="true">{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}

          {/* Animated underline */}
          <span
            className="absolute bottom-0 h-1 bg-[#111111] transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ left: underline.left, width: underline.width }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* ── Tab Panels ───────────────────────────────────────── */}
      {tabs.map((tab) => {
        const isActive = activeTab === tab.platform;
        const idea = ideas.find((i) => i.platform === tab.platform);
        if (!idea) return null;

        return (
          <div
            key={tab.platform}
            role="tabpanel"
            id={`tabpanel-${tab.platform}`}
            aria-labelledby={`tab-${tab.platform}`}
            hidden={!isActive}
            tabIndex={0}
            className={`transition-opacity duration-300 focus-visible:outline-none ${
              isActive ? 'animate-fade-in opacity-100' : 'opacity-0'
            }`}
          >
            {isActive && (
              <ContentCard
                idea={idea}
                onSave={onSaveToSwipeFile}
                isSaved={isIdeaSaved(idea.body)}
              />
            )}
          </div>
        );
      })}

      {/* ── Best Time to Post ────────────────────────────────── */}
      <BestTimeToPost postingTimes={postingTimes} />
    </section>
  );
}
