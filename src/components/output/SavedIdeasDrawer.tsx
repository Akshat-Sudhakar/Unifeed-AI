'use client';

import { useState } from 'react';
import type { SavedIdea } from '@/hooks/useSavedIdeas';

interface SavedIdeasDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedIdeas: SavedIdea[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onExportAll: () => void;
}

import { CopyIcon, CheckIcon, TrashIcon, DownloadIcon, CloseIcon } from '@/components/icons';

export default function SavedIdeasDrawer({ isOpen, onClose, savedIdeas, onRemove, onClearAll, onExportAll }: SavedIdeasDrawerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (idea: SavedIdea) => {
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
    setCopiedId(idea.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#111111]/40 z-40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div 
        className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l-4 border-[#111111] shadow-2xl z-50 flex flex-col animate-slide-down"
        style={{ animationName: 'slide-in-right' }}
        role="dialog"
        aria-label="Saved Ideas"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-4 border-[#111111] bg-[#F9F9F7]">
          <div>
            <h2 className="font-heading text-2xl font-black text-[#111111] uppercase tracking-tighter">
              Saved Ideas
            </h2>
            <p className="mt-0.5 font-mono text-xs font-bold uppercase tracking-widest text-[#737373]">
              {savedIdeas.length} {savedIdeas.length === 1 ? 'idea' : 'ideas'} saved
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#E5E5E0] transition-colors sharp-corners border-2 border-transparent hover:border-[#111111]"
            aria-label="Close drawer"
          >
            <CloseIcon size={24} />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F9F9F7] panel-scroll space-y-4">
          {savedIdeas.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-[#A3A3A3] sharp-corners">
              <svg className="mx-auto h-12 w-12 text-[#A3A3A3] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                <path strokeLinecap="square" strokeLinejoin="miter" d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              <h3 className="font-heading text-lg font-black text-[#111111] uppercase tracking-tighter">No saved ideas yet</h3>
              <p className="mt-2 font-serif text-sm text-[#525252]">Click the "Save" button on any generated idea to keep it here for later.</p>
            </div>
          ) : (
            savedIdeas.map((idea) => (
              <div key={idea.id} className="border-2 border-[#111111] bg-white sharp-corners flex flex-col relative group">
                <div className="p-4 border-b-2 border-[#111111]">
                  <div className="flex justify-between items-start gap-3">
                    <h4 className="font-heading text-md font-black text-[#111111] leading-snug">{idea.idea?.title}</h4>
                    <button
                      onClick={() => onRemove(idea.id)}
                      className="text-[#A3A3A3] hover:text-[#CC0000] transition-colors"
                      aria-label="Remove saved idea"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                  <p className="mt-2 font-serif text-xs text-[#525252] line-clamp-2">{idea.idea?.core_angle}</p>
                </div>
                
                <div className="p-3 bg-[#F0EFE8] flex justify-between items-center">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#525252]">Prompt ready</span>
                  <button
                    onClick={() => handleCopy(idea)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest transition-all duration-200 sharp-corners border ${
                      copiedId === idea.id
                        ? 'bg-[#111111] border-[#111111] text-white'
                        : 'bg-white border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white'
                    }`}
                  >
                    {copiedId === idea.id
                      ? <><CheckIcon size={12} /><span>Copied!</span></>
                      : <><CopyIcon size={12} /><span>Copy Prompt</span></>
                    }
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {savedIdeas.length > 0 && (
          <div className="p-6 border-t-4 border-[#111111] bg-white flex flex-col gap-3">
            <button
              onClick={onExportAll}
              className="w-full flex justify-center items-center gap-2 py-3 border-2 border-[#111111] bg-[#111111] text-white font-mono text-xs font-bold uppercase tracking-widest hover:bg-[#333333] transition-colors sharp-corners"
            >
              <DownloadIcon size={14} />
              Export as CSV
            </button>
            <button
              onClick={onClearAll}
              className="w-full flex justify-center items-center gap-2 py-3 border-2 border-[#CC0000] text-[#CC0000] font-mono text-xs font-bold uppercase tracking-widest hover:bg-[#CC0000] hover:text-white transition-colors sharp-corners"
            >
              <TrashIcon size={14} />
              Clear All Saved Ideas
            </button>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}} />
    </>
  );
}
