import React, { useState, useEffect, useRef } from 'react';
import { PARTS_CATALOG } from '../../data/partsData';
import { AircraftPart } from '../../types/aviation';
import { Search, X, ArrowRight, Box } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPart: (part: AircraftPart) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectPart,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const results = query.trim()
    ? PARTS_CATALOG.filter((part) => {
        const q = query.toLowerCase();
        return (
          part.name.toLowerCase().includes(q) ||
          part.partNumber.toLowerCase().includes(q) ||
          (part.altPartNumber && part.altPartNumber.toLowerCase().includes(q)) ||
          part.manufacturer.toLowerCase().includes(q) ||
          part.ataChapter.toLowerCase().includes(q) ||
          part.airframeCompatibility.some((af) => af.toLowerCase().includes(q))
        );
      })
    : [];

  const suggestedQueries = [
    '737 landing gear',
    'CFM56',
    'Brake assembly',
    'Honeywell',
    'Avionics',
    'A320',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Search Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search part #, airframe (e.g. 737), OEM (Safran), or ATA chapter..."
            className="flex-1 bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 bg-neutral-800 text-neutral-400 hover:text-white rounded text-xs"
          >
            ESC
          </button>
        </div>

        {/* Suggested Queries */}
        {!query && (
          <div className="p-6">
            <span className="text-xs text-neutral-500 font-mono-numbers block mb-3">
              QUICK AEROSPACE QUERIES
            </span>
            <div className="flex flex-wrap gap-2">
              {suggestedQueries.map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-xs text-neutral-300 hover:border-cyan-500 hover:text-cyan-300 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results List */}
        {query && (
          <div className="max-h-96 overflow-y-auto p-4 space-y-2">
            {results.length > 0 ? (
              results.map((part) => (
                <div
                  key={part.id}
                  onClick={() => {
                    onSelectPart(part);
                    onClose();
                  }}
                  className="p-3 bg-neutral-950/70 border border-neutral-850 rounded-lg hover:border-cyan-500/60 hover:bg-neutral-850 cursor-pointer transition-all flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 text-[10px] font-mono-numbers text-cyan-400">
                      <span>P/N: {part.partNumber}</span>
                      <span>·</span>
                      <span>{part.ataChapter}</span>
                    </div>
                    <div className="text-xs font-semibold text-white mt-0.5">{part.name}</div>
                    <div className="text-[11px] text-neutral-400">
                      {part.airframeCompatibility.join(', ')} · {part.condition}
                    </div>
                  </div>

                  <div className="text-right font-mono-numbers text-xs shrink-0">
                    <div className="text-white font-semibold">
                      {part.priceUSD !== null ? `$${part.priceUSD.toLocaleString()}` : 'RFQ'}
                    </div>
                    <span className="text-[10px] text-cyan-400 flex items-center justify-end gap-1 mt-0.5">
                      Select <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-neutral-500 text-xs">
                No aircraft parts found matching "{query}".
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
