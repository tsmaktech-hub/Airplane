import React, { useState } from 'react';
import { AircraftPart } from '../../types/aviation';
import { ShoppingBag, ArrowUpRight, ShieldCheck, Box } from 'lucide-react';

interface ProductCardProps {
  part: AircraftPart;
  onSelectPart: (part: AircraftPart) => void;
  onAddToCart: (part: AircraftPart) => void;
  onRequestQuote: (part: AircraftPart) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  part,
  onSelectPart,
  onAddToCart,
  onRequestQuote,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="group flex flex-col bg-neutral-900/60 border border-neutral-800/80 rounded-lg overflow-hidden hover:border-neutral-700 transition-all duration-200">
      {/* Product Image Box */}
      <div 
        onClick={() => onSelectPart(part)}
        className="relative w-full aspect-[4/3] bg-neutral-950/80 overflow-hidden cursor-pointer flex items-center justify-center p-3"
      >
        {!imageError && part.imageUrl ? (
          <img
            src={part.imageUrl}
            alt={part.name}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded opacity-85 group-hover:opacity-100 group-hover:scale-102 transition-all duration-300"
          />
        ) : (
          /* High-Fidelity SVG Fallback Container */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 p-4 text-center rounded border border-neutral-800/50">
            <Box className="w-8 h-8 text-neutral-600 mb-2 group-hover:text-cyan-400 transition-colors" />
            <span className="text-[11px] font-mono-numbers text-neutral-400">{part.partNumber}</span>
            <span className="text-[10px] text-neutral-600 mt-1 uppercase tracking-wider">{part.category}</span>
          </div>
        )}

        {/* Condition and Stock Indicators (Unboxed subtle text) */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-mono-numbers pointer-events-none">
          <span className="px-2 py-0.5 bg-neutral-950/85 backdrop-blur-sm border border-neutral-800 rounded text-neutral-300">
            {part.condition}
          </span>
          <span className="px-2 py-0.5 bg-neutral-950/85 backdrop-blur-sm border border-neutral-800 rounded text-cyan-400">
            {part.availability}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Line */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono-numbers mb-1">
            <span className="text-cyan-400">{part.partNumber}</span>
            <span aria-hidden="true">·</span>
            <span>{part.manufacturer}</span>
          </div>

          {/* Part Name */}
          <h3 
            onClick={() => onSelectPart(part)}
            className="text-sm font-semibold text-neutral-100 group-hover:text-cyan-300 transition-colors cursor-pointer line-clamp-2 leading-snug"
          >
            {part.name}
          </h3>

          {/* Compatibility */}
          <div className="mt-2 text-xs text-neutral-400">
            <span className="text-neutral-500">Airframes: </span>
            <span>{part.airframeCompatibility.join(', ')}</span>
          </div>
        </div>

        {/* Bottom Pricing & Actions */}
        <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-neutral-500 block uppercase font-mono-numbers">Unit Cost</span>
            {part.priceUSD !== null ? (
              <span className="text-base font-semibold text-white font-mono-numbers">
                ${part.priceUSD.toLocaleString()}
              </span>
            ) : (
              <span className="text-xs font-medium text-cyan-400 font-mono-numbers">
                Request Quote
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSelectPart(part)}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
              title="View full engineering details"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>

            {part.priceUSD !== null ? (
              <button
                onClick={() => onAddToCart(part)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-cyan-600 text-neutral-200 hover:text-white rounded text-xs font-medium transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            ) : (
              <button
                onClick={() => onRequestQuote(part)}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-cyan-600 text-neutral-200 hover:text-white rounded text-xs font-medium transition-colors"
              >
                Quote
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
