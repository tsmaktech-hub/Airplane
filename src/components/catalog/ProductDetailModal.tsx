import React, { useState } from 'react';
import { AircraftPart } from '../../types/aviation';
import { PARTS_CATALOG } from '../../data/partsData';
import { X, ShieldCheck, ShoppingBag, FileText, CheckCircle2, AlertCircle, ArrowRight, Box } from 'lucide-react';

interface ProductDetailModalProps {
  part: AircraftPart | null;
  onClose: () => void;
  onAddToCart: (part: AircraftPart) => void;
  onRequestQuote: (part: AircraftPart) => void;
  onSelectPart: (part: AircraftPart) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  part,
  onClose,
  onAddToCart,
  onRequestQuote,
  onSelectPart,
}) => {
  const [activeTab, setActiveTab] = useState<'specs' | 'docs' | 'traceability'>('specs');
  const [imageError, setImageError] = useState(false);

  if (!part) return null;

  // Related parts from the same component group or airframe
  const relatedParts = PARTS_CATALOG.filter(
    (p) => p.id !== part.id && (p.componentId === part.componentId || p.category === part.category)
  ).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-neutral-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-numbers text-cyan-400">{part.ataChapter}</span>
            <span className="text-neutral-600">/</span>
            <span className="text-xs font-mono-numbers text-neutral-400">P/N: {part.partNumber}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Image & Airframe Badges */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="w-full aspect-[4/3] bg-neutral-950 rounded-lg border border-neutral-800/80 overflow-hidden flex items-center justify-center p-3">
                {!imageError && part.imageUrl ? (
                  <img
                    src={part.imageUrl}
                    alt={part.name}
                    onError={() => setImageError(true)}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-950 text-neutral-500">
                    <Box className="w-12 h-12 mb-2 text-neutral-600" />
                    <span className="text-xs font-mono-numbers">{part.partNumber}</span>
                  </div>
                )}
              </div>

              {/* Verified Airframe Compatibility */}
              <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-lg">
                <span className="text-xs font-mono-numbers text-neutral-400 block mb-2">
                  AIRFRAME COMPATIBILITY
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {part.airframeCompatibility.map((af) => (
                    <span
                      key={af}
                      className="px-2.5 py-1 bg-neutral-900 border border-neutral-700/60 rounded text-xs text-neutral-200"
                    >
                      {af}
                    </span>
                  ))}
                </div>
              </div>

              {/* Compliance & Quality Seal */}
              <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-lg flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs text-neutral-300">
                  <strong className="text-white block font-medium">Dual Release Airworthiness</strong>
                  Certified with back-to-birth traceability records and non-incident statements.
                </div>
              </div>
            </div>

            {/* Right Column: Title, Purchase Block, Specs */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono-numbers text-cyan-400 mb-1">
                  <span>{part.manufacturer}</span>
                  <span>·</span>
                  <span>{part.condition}</span>
                </div>

                <h1 className="text-2xl font-bold text-white tracking-tight font-tech">
                  {part.name}
                </h1>

                <div className="mt-2 flex items-center gap-4 text-xs text-neutral-400 font-mono-numbers">
                  <span>Primary P/N: <strong className="text-neutral-200">{part.partNumber}</strong></span>
                  {part.altPartNumber && (
                    <span>Alt P/N: <strong className="text-neutral-200">{part.altPartNumber}</strong></span>
                  )}
                </div>

                <p className="mt-4 text-xs md:text-sm text-neutral-300 leading-relaxed">
                  {part.overview}
                </p>

                {/* Purchase / Availability Box */}
                <div className="mt-6 p-4 bg-neutral-950/80 border border-neutral-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase font-mono-numbers block">
                      Procurement Rate
                    </span>
                    {part.priceUSD !== null ? (
                      <div className="text-2xl font-bold text-white font-mono-numbers">
                        ${part.priceUSD.toLocaleString()}
                        <span className="text-xs text-neutral-400 font-normal ml-1">USD</span>
                      </div>
                    ) : (
                      <div className="text-base font-semibold text-cyan-400 font-mono-numbers">
                        Official RFQ Required
                      </div>
                    )}
                    <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono-numbers mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{part.quantityInStock} Units Available ({part.availability})</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {part.priceUSD !== null && (
                      <button
                        onClick={() => {
                          onAddToCart(part);
                          onClose();
                        }}
                        className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onRequestQuote(part);
                        onClose();
                      }}
                      className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <span>Request RFQ</span>
                    </button>
                  </div>
                </div>

                {/* Interactive Technical Tabs */}
                <div className="mt-6">
                  <div className="flex items-center gap-4 border-b border-neutral-800 pb-2 text-xs font-medium">
                    <button
                      onClick={() => setActiveTab('specs')}
                      className={`pb-2 -mb-2 transition-colors ${
                        activeTab === 'specs' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Specifications
                    </button>
                    <button
                      onClick={() => setActiveTab('docs')}
                      className={`pb-2 -mb-2 transition-colors ${
                        activeTab === 'docs' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Airworthiness Docs
                    </button>
                    <button
                      onClick={() => setActiveTab('traceability')}
                      className={`pb-2 -mb-2 transition-colors ${
                        activeTab === 'traceability' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Trace & CMM
                    </button>
                  </div>

                  <div className="mt-4 text-xs">
                    {activeTab === 'specs' && (
                      <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                        <div>
                          <span className="text-neutral-500 block text-[11px]">Weight</span>
                          <span className="text-neutral-200 font-mono-numbers">{part.specifications.weightKg} kg</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block text-[11px]">Dimensions</span>
                          <span className="text-neutral-200 font-mono-numbers">{part.specifications.dimensionsCm || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block text-[11px]">Serial Tracking</span>
                          <span className="text-neutral-200">{part.specifications.serialTracking ? 'Individual S/N Engraved' : 'Lot/Batch Tracked'}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block text-[11px]">Hazardous Material</span>
                          <span className="text-neutral-200">{part.specifications.hazmat ? 'Hazmat Class 9' : 'Non-Hazardous'}</span>
                        </div>
                      </div>
                    )}

                    {activeTab === 'docs' && (
                      <div className="space-y-2">
                        <div className="p-2.5 bg-neutral-950 rounded border border-neutral-800/80 flex items-center justify-between">
                          <span>{part.specifications.traceability}</span>
                          <span className="text-emerald-400 font-mono-numbers">Attached</span>
                        </div>
                        <div className="p-2.5 bg-neutral-950 rounded border border-neutral-800/80 flex items-center justify-between">
                          <span>Non-Incident / Non-Accident Statement (NIS)</span>
                          <span className="text-emerald-400 font-mono-numbers">Verified</span>
                        </div>
                        <div className="p-2.5 bg-neutral-950 rounded border border-neutral-800/80 flex items-center justify-between">
                          <span>Last Operator Trace (Part 121 / Part 145)</span>
                          <span className="text-neutral-400 font-mono-numbers">Available</span>
                        </div>
                      </div>
                    )}

                    {activeTab === 'traceability' && (
                      <div className="space-y-2 text-neutral-300">
                        <p>
                          Component Maintenance Manual (CMM) reference is checked against current manufacturer revision standards.
                        </p>
                        <p className="text-neutral-400">
                          Shelf-life status: <strong className="text-neutral-200">{part.specifications.cureDateOrShelfLife || 'Indefinite'}</strong>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Parts Section */}
          {relatedParts.length > 0 && (
            <div className="mt-8 pt-6 border-t border-neutral-800">
              <h3 className="text-sm font-semibold text-white tracking-tight mb-4">
                Related Aircraft Components
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedParts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectPart(rel)}
                    className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg hover:border-neutral-700 cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-[10px] font-mono-numbers text-cyan-400 mb-0.5">{rel.partNumber}</div>
                      <h4 className="text-xs font-semibold text-neutral-200 line-clamp-1">{rel.name}</h4>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-neutral-900 font-mono-numbers">
                      <span className="text-white">
                        {rel.priceUSD ? `$${rel.priceUSD.toLocaleString()}` : 'RFQ'}
                      </span>
                      <span className="text-cyan-400 flex items-center gap-0.5 text-[11px]">
                        Inspect <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
