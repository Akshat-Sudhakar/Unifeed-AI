// ============================================================
// UniFeed AI — BlueprintHistory Component
// ============================================================
// Sidebar panel displaying past content generation history.
// Supports reload, delete, clear-all, and links to swipe file.
// ============================================================

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import type { Blueprint, Platform } from '@/lib/types';
import { PLATFORMS, SEGMENTS } from '@/lib/constants';

// ── Props ──────────────────────────────────────────────────────
interface BlueprintHistoryProps {
  blueprints: Blueprint[];
  onLoad: (blueprint: Blueprint) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

// ── Platform color map ─────────────────────────────────────────
const PLATFORM_COLORS: Record<Platform, string> = {
  linkedin: '#0A66C2',
  'instagram-post': '#E1306C',
  'instagram-reels': '#833AB4',
};

// ── Relative time helper ───────────────────────────────────────
function getRelativeTime(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

// ================================================================
// BlueprintHistory Component
// ================================================================
export default function BlueprintHistory({
  blueprints,
  onLoad,
  onDelete,
  onClearAll,
}: BlueprintHistoryProps) {
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      if (confirmingDelete === id) {
        onDelete(id);
        setConfirmingDelete(null);
      } else {
        setConfirmingDelete(id);
        // Auto-reset after 3 seconds
        setTimeout(() => setConfirmingDelete(null), 3000);
      }
    },
    [confirmingDelete, onDelete]
  );

  const handleClearAll = useCallback(() => {
    if (showClearConfirm) {
      onClearAll();
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 4000);
    }
  }, [showClearConfirm, onClearAll]);

  return (
    <aside
      className="flex h-full w-full flex-col border-l-4 border-[#111111] bg-[#F9F9F7]"
      aria-label="Blueprint history"
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b-2 border-[#111111] px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#111111]">History</h2>
          {mounted && blueprints.length > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center bg-[#111111] px-1.5 text-[11px] font-bold text-[#F9F9F7]">
              {blueprints.length}
            </span>
          )}
        </div>

        {/* Saved Ideas link */}
        <Link
          href="/swipe-file"
          className="flex items-center gap-1 border border-transparent px-2 py-1 text-xs font-bold uppercase tracking-widest text-[#CC0000] transition-colors hover:border-[#CC0000] hover:bg-[#CC0000]/10"
          aria-label="Open Saved Ideas"
        >
          Saved Ideas →
        </Link>
      </div>

      {/* ── Scrollable list ─────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {!mounted ? null : blueprints.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
            <p className="font-serif text-lg font-bold italic text-[#737373]">
              No blueprints on record.
            </p>
            <p className="mt-2 text-xs uppercase tracking-widest text-[#A3A3A3]">
              The presses are waiting.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col" role="list">
            {blueprints.map((bp) => {
              const segmentInfo = SEGMENTS.find(
                (s) => s.id === bp.request.segment
              );
              const platforms = bp.request.platforms;

              return (
                <li key={bp.id} className="group relative border-b border-[#111111]">
                  <button
                    type="button"
                    onClick={() => onLoad(bp)}
                    className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-[#F5F5F5]"
                    aria-label={`Load blueprint: ${bp.title}`}
                  >
                    {/* Segment icon */}
                    <span
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center border border-[#111111] bg-white text-sm"
                      aria-label={segmentInfo?.label ?? bp.request.segment}
                    >
                      {segmentInfo?.icon ?? '📄'}
                    </span>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-serif text-base font-bold text-[#111111]">
                        {bp.title}
                      </p>

                      {/* Platform icons row */}
                      <div className="mt-1 flex items-center gap-2">
                        {platforms.map((pId) => {
                          const pInfo = PLATFORMS.find((p) => p.id === pId);
                          return (
                            <span
                              key={pId}
                              className="font-mono text-[10px] uppercase tracking-widest text-[#525252]"
                              title={pInfo?.label ?? pId}
                            >
                              {pInfo?.label ?? pId}
                            </span>
                          );
                        })}
                        <span className="ml-auto font-mono text-[10px] text-[#A3A3A3]">
                          {getRelativeTime(bp.createdAt)}
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(bp.id);
                    }}
                    className={`absolute right-3 top-3 flex h-6 w-6 items-center justify-center border border-[#111111] bg-white text-xs font-bold transition-all ${
                      confirmingDelete === bp.id
                        ? 'bg-[#CC0000] text-white border-[#CC0000]'
                        : 'text-[#111111] opacity-0 hover:bg-[#111111] hover:text-white group-hover:opacity-100'
                    }`}
                    aria-label={
                      confirmingDelete === bp.id
                        ? `Confirm delete: ${bp.title}`
                        : `Delete: ${bp.title}`
                    }
                    title={
                      confirmingDelete === bp.id
                        ? 'Click again to confirm'
                        : 'Delete'
                    }
                  >
                    {confirmingDelete === bp.id ? '!' : '×'}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── Footer: Clear All ───────────────────────────────── */}
      {blueprints.length > 0 && (
        <div className="border-t-2 border-[#111111] p-4">
          <button
            type="button"
            onClick={handleClearAll}
            className={`btn-editorial-outline w-full ${
              showClearConfirm ? '!border-[#CC0000] !text-[#CC0000] shadow-[4px_4px_0px_0px_#CC0000]' : ''
            }`}
            aria-label={
              showClearConfirm
                ? 'Click again to confirm clearing all history'
                : 'Clear all history'
            }
          >
            {showClearConfirm ? 'Confirm Clear All' : 'Clear All History'}
          </button>
        </div>
      )}
    </aside>
  );
}
