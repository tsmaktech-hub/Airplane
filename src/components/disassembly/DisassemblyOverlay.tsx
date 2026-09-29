import React from 'react';
import { AIRCRAFT_COMPONENTS } from '../../data/partsData';
import { AircraftComponentTarget } from '../../types/aviation';
import { ArrowRight, ChevronRight, X, Layers, Crosshair } from 'lucide-react';

interface DisassemblyOverlayProps {
  screenPositions: Record<string, { x: number; y: number; visible: boolean }>;
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onViewPartsInCatalog: (componentId: string) => void;
  scrollProgress: number;
}

export const DisassemblyOverlay: React.FC<DisassemblyOverlayProps> = ({
  screenPositions,
  selectedComponentId,
  onSelectComponent,
  onViewPartsInCatalog,
  scrollProgress,
}) => {
  // Only show exploded callouts when scroll reaches disassembly section
  const isExplodedPhase = scrollProgress >= 0.55;
  const opacity = Math.min(1, Math.max(0, (scrollProgress - 0.55) / 0.15));

  if (!isExplodedPhase) return null;

  const selectedComp: AircraftComponentTarget | undefined = AIRCRAFT_COMPONENTS.find(
    (c) => c.id === selectedComponentId
  );

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-300"
      style={{ opacity }}
    >
      {/* SVG Technical Leader Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="calloutGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {AIRCRAFT_COMPONENTS.map((comp) => {
          const pos = screenPositions[comp.id];
          if (!pos || !pos.visible) return null;

          const isSelected = selectedComponentId === comp.id;
          // Offset label horizontally for clean layout
          const isRightSide = pos.x > window.innerWidth / 2;
          const labelX = isRightSide ? pos.x + 40 : pos.x - 40;
          const labelY = pos.y - 30;

          return (
            <g key={comp.id}>
              {/* Pulsing Target Dot on 3D Component */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? 6 : 3.5}
                fill={isSelected ? '#38bdf8' : '#e2e8f0'}
                className="transition-all duration-200"
              />
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? 14 : 8}
                fill="none"
                stroke={isSelected ? '#38bdf8' : '#38bdf8'}
                strokeWidth={1}
                strokeDasharray={isSelected ? '2 2' : 'none'}
                opacity={0.6}
              />

              {/* Connecting Technical Line */}
              <polyline
                points={`${pos.x},${pos.y} ${labelX},${labelY} ${isRightSide ? labelX + 60 : labelX - 60},${labelY}`}
                fill="none"
                stroke={isSelected ? '#38bdf8' : 'rgba(148, 163, 184, 0.45)'}
                strokeWidth={isSelected ? 1.5 : 1}
                strokeDasharray={isSelected ? 'none' : '3 3'}
              />
            </g>
          );
        })}
      </svg>

      {/* Floating 2D Clickable Labels */}
      {AIRCRAFT_COMPONENTS.map((comp) => {
        const pos = screenPositions[comp.id];
        if (!pos || !pos.visible) return null;

        const isSelected = selectedComponentId === comp.id;
        const isRightSide = pos.x > window.innerWidth / 2;
        const left = isRightSide ? pos.x + 45 : pos.x - 170;
        const top = pos.y - 48;

        return (
          <div
            key={comp.id}
            style={{ left: `${left}px`, top: `${top}px` }}
            className={`absolute pointer-events-auto transition-transform duration-200 ${
              isSelected ? 'scale-105 z-30' : 'hover:scale-102 z-20'
            }`}
          >
            <button
              onClick={() => onSelectComponent(isSelected ? null : comp.id)}
              className={`flex flex-col text-left px-3 py-1.5 rounded border backdrop-blur-md transition-all ${
                isSelected
                  ? 'bg-neutral-900/90 border-cyan-400 text-white shadow-lg shadow-cyan-950/50'
                  : 'bg-neutral-950/70 border-neutral-800 text-neutral-300 hover:border-neutral-600 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-mono-numbers text-cyan-400 font-semibold tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>{comp.ataChapter.split('·')[0].trim()}</span>
              </div>
              <div className="text-xs font-semibold text-neutral-100 whitespace-nowrap">
                {comp.name}
              </div>
              <div className="text-[11px] text-neutral-400 flex items-center justify-between gap-3 font-mono-numbers">
                <span>{comp.relatedPartCount} Parts Cataloged</span>
                <ChevronRight className="w-3 h-3 text-neutral-400" />
              </div>
            </button>
          </div>
        );
      })}

      {/* Selected Component Inspection Card (HUD panel on bottom right) */}
      {selectedComp && (
        <div className="absolute right-6 bottom-8 w-96 max-w-[calc(100vw-3rem)] pointer-events-auto bg-neutral-950/90 backdrop-blur-md border border-neutral-800 rounded-lg p-5 shadow-2xl z-40 transition-all animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-start justify-between pb-3 border-b border-neutral-800">
            <div>
              <div className="text-xs font-mono-numbers text-cyan-400 font-medium">
                {selectedComp.ataChapter}
              </div>
              <h3 className="text-base font-semibold text-white tracking-tight mt-0.5">
                {selectedComp.name}
              </h3>
            </div>
            <button
              onClick={() => onSelectComponent(null)}
              className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Close inspection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed mt-3">
            {selectedComp.description}
          </p>

          <div className="mt-4 pt-3 border-t border-neutral-900 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-neutral-500 block text-[11px]">Primary Category</span>
              <span className="text-neutral-200 font-medium">{selectedComp.category}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px]">Certified Parts</span>
              <span className="text-cyan-400 font-mono-numbers font-medium">{selectedComp.relatedPartCount} Ready Units</span>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2">
            <button
              onClick={() => onViewPartsInCatalog(selectedComp.id)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-medium transition-colors"
            >
              <span>Explore {selectedComp.name} Parts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSelectComponent(null)}
              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs font-medium transition-colors"
            >
              Reset View
            </button>
          </div>
        </div>
      )}

      {/* Quick Component Navigator Ribbon at Screen Bottom */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-neutral-950/80 backdrop-blur-md border border-neutral-800 rounded-full max-w-[90vw] overflow-x-auto">
        <span className="text-[11px] font-mono-numbers text-neutral-400 px-2 flex items-center gap-1 shrink-0">
          <Layers className="w-3 h-3 text-cyan-400" />
          <span>ASSEMBLY:</span>
        </span>
        {AIRCRAFT_COMPONENTS.map((comp) => {
          const isSelected = selectedComponentId === comp.id;
          return (
            <button
              key={comp.id}
              onClick={() => onSelectComponent(isSelected ? null : comp.id)}
              className={`px-2.5 py-1 text-xs rounded-full transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
              }`}
            >
              {comp.name.split(' ')[0]}
            </button>
          );
        })}
      </div>
    </div>
  );
};
