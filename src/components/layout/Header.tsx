'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface HeaderProps {
  historyCount?: number;
  onHistoryToggle?: () => void;
}

export default function Header({ historyCount = 0, onHistoryToggle }: HeaderProps) {
  const pathname = usePathname();
  // Prevent hydration mismatch — localStorage count is 0 on server, real value on client
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#030304]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3" aria-label="UniFeed AI Home">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#EA580C] to-[#F7931A] shadow-[0_0_16px_-4px_rgba(234,88,12,0.6)] transition-transform group-hover:scale-105">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-heading text-base font-bold text-white">
              UniFeed{' '}
              <span className="bg-gradient-to-r from-[#F7931A] to-[#FFD600] bg-clip-text text-transparent">AI</span>
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#F7931A]/40">
              by UniforMeFy
            </span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1" aria-label="Main navigation">
          <Link
            href="/"
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-mono transition-all ${
              pathname === '/'
                ? 'border border-[#F7931A]/20 bg-[#F7931A]/10 text-[#F7931A]'
                : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
            }`}
            aria-current={pathname === '/' ? 'page' : undefined}
          >
            Generator
          </Link>

          <Link
            href="/swipe-file"
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-mono transition-all ${
              pathname === '/swipe-file'
                ? 'border border-[#F7931A]/20 bg-[#F7931A]/10 text-[#F7931A]'
                : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
            }`}
            aria-current={pathname === '/swipe-file' ? 'page' : undefined}
          >
            Swipe File
          </Link>

          {onHistoryToggle && (
            <button
              type="button"
              onClick={onHistoryToggle}
              className="relative ml-1 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-mono text-[#94A3B8] transition-all hover:border-white/20 hover:text-white"
              aria-label="Toggle history panel"
            >
              History
              {/* Only render badge after client mount to avoid hydration mismatch */}
              {mounted && historyCount > 0 && (
                <span
                  className="flex h-4 w-4 items-center justify-center rounded-full bg-[#F7931A] font-bold text-[#030304]"
                  style={{ fontSize: '9px' }}
                >
                  {historyCount > 9 ? '9+' : historyCount}
                </span>
              )}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
