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
    <header className="sticky top-0 z-50 border-b-4 border-[#111111] bg-[#F9F9F7] newsprint-texture">
      <div className="mx-auto flex min-h-[5rem] max-w-screen-xl items-center justify-between px-4 lg:px-8">

        {/* Logo */}
        <Link href="/" className="group flex flex-col justify-center leading-none text-[#111111] hover:text-[#CC0000] transition-colors" aria-label="UniFeed AI Home">
          <span className="font-heading text-4xl font-black tracking-tighter">
            UniFeed.
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mt-1">
            The Content Record
          </span>
        </Link>

        {/* Edition Metadata */}
        <div className="flex flex-col items-center justify-center font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-[#111111]">
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 border-b border-[#111111] pb-1 mb-1">
            <span className="hidden sm:inline">Vol. 1.0</span>
            <span className="hidden sm:inline h-2 w-px bg-[#111111]"></span>
            <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span className="h-2 w-px bg-[#111111]"></span>
            <span>B2B Edition</span>
          </div>
          <span className="text-[#525252] hidden sm:inline">All the Threads That Fit the Brand</span>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-2" aria-label="Main navigation">
          <Link
            href="/"
            className={`btn-editorial-outline px-3 py-1.5 text-xs ${
              pathname === '/' ? 'bg-[#111111] text-[#F9F9F7] shadow-[4px_4px_0px_0px_#CC0000] border-[#CC0000]' : ''
            }`}
            aria-current={pathname === '/' ? 'page' : undefined}
          >
            Generator
          </Link>

          <Link
            href="/swipe-file"
            className={`btn-editorial-outline px-3 py-1.5 text-xs ${
              pathname === '/swipe-file' ? 'bg-[#111111] text-[#F9F9F7] shadow-[4px_4px_0px_0px_#CC0000] border-[#CC0000]' : ''
            }`}
            aria-current={pathname === '/swipe-file' ? 'page' : undefined}
          >
            Saved Ideas
          </Link>

          {onHistoryToggle && (
            <button
              type="button"
              onClick={onHistoryToggle}
              className="btn-editorial px-3 py-1.5 text-xs ml-2"
              aria-label="Toggle history panel"
            >
              History
              {mounted && historyCount > 0 && (
                <span
                  className="ml-1.5 bg-[#F9F9F7] text-[#111111] px-1 font-mono text-[10px]"
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
