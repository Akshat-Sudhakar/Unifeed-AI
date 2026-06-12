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
      className="flex h-full w-full flex-col border-r border-white/10 bg-[#0F1115]"
      aria-label="Blueprint history"
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-white">History</h2>
          {mounted && blueprints.length > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F7931A]/20 px-1.5 text-[11px] font-bold text-[#F7931A]">
              {blueprints.length}
            </span>
          )}
        </div>

        {/* Swipe File link */}
        <Link
          href="/swipe-file"
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[#F7931A] transition-colors hover:bg-[#F7931A]/10"
          aria-label="Open Swipe File"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z"
              clipRule="evenodd"
            />
          </svg>
          Swipe File
        </Link>
      </div>

      {/* ── Scrollable list ─────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {!mounted ? null : blueprints.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-6 w-6 text-white/15"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-white/40">
              No blueprints yet.
            </p>
            <p className="mt-1 text-xs text-white/25">
              Generate your first content!
            </p>
          </div>
        ) : (
          <ul className="space-y-0.5 p-2" role="list">
            {blueprints.map((bp) => {
              const segmentInfo = SEGMENTS.find(
                (s) => s.id === bp.request.segment
              );
              const platforms = bp.request.platforms;

              return (
                <li key={bp.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => onLoad(bp)}
                    className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                    aria-label={`Load blueprint: ${bp.title}`}
                  >
                    {/* Segment icon */}
                    <span
                      className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-white/5 text-sm"
                      aria-label={segmentInfo?.label ?? bp.request.segment}
                    >
                      {segmentInfo?.icon ?? '📄'}
                    </span>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white/80 group-hover:text-white">
                        {bp.title}
                      </p>

                      {/* Platform icons row */}
                      <div className="mt-1 flex items-center gap-1.5">
                        {platforms.map((pId) => {
                          const pInfo = PLATFORMS.find((p) => p.id === pId);
                          return (
                            <span
                              key={pId}
                              className="inline-flex h-4 w-4 items-center justify-center rounded text-[10px]"
                              style={{
                                backgroundColor: `${PLATFORM_COLORS[pId]}20`,
                                color: PLATFORM_COLORS[pId],
                              }}
                              title={pInfo?.label ?? pId}
                            >
                              {pInfo?.icon ?? '•'}
                            </span>
                          );
                        })}
                        <span className="ml-1 text-[11px] text-white/25">
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
                    className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md text-xs transition-all ${
                      confirmingDelete === bp.id
                        ? 'bg-red-500/20 text-red-400'
                        : 'text-white/20 opacity-0 hover:bg-white/5 hover:text-white/50 group-hover:opacity-100'
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
                    {confirmingDelete === bp.id ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      >
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── Footer: Clear All ───────────────────────────────── */}
      {blueprints.length > 0 && (
        <div className="border-t border-white/5 px-3 py-3">
          <button
            type="button"
            onClick={handleClearAll}
            className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              showClearConfirm
                ? 'bg-red-500/15 text-red-400'
                : 'bg-white/[0.03] text-white/30 hover:bg-white/5 hover:text-white/50'
            }`}
            aria-label={
              showClearConfirm
                ? 'Click again to confirm clearing all history'
                : 'Clear all history'
            }
          >
            {showClearConfirm ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                Click again to clear all
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 01.78.72l.5 6a.75.75 0 01-1.49.12l-.5-6a.75.75 0 01.71-.84zm2.84 0a.75.75 0 01.71.84l-.5 6a.75.75 0 11-1.49-.12l.5-6a.75.75 0 01.78-.72z"
                    clipRule="evenodd"
                  />
                </svg>
                Clear All History
              </>
            )}
          </button>
        </div>
      )}
    </aside>
  );
}
