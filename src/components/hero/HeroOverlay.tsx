import React from 'react';
import { ArrowDown, Compass, ShieldCheck, ChevronRight, Plane, MapPin, Eye } from 'lucide-react';

interface HeroOverlayProps {
  scrollProgress: number;
  onExploreParts: () => void;
  onViewCatalog: () => void;
  isOrbitMode: boolean;
  onToggleOrbitMode: () => void;
}

export const HeroOverlay: React.FC<HeroOverlayProps> = ({
  scrollProgress,
  onExploreParts,
  onViewCatalog,
  isOrbitMode,
  onToggleOrbitMode,
}) => {
  // Fade out hero text as user scrolls down into descent phase
  const heroOpacity = Math.max(0, 1 - scrollProgress * 2.8);
  const isHeroVisible = heroOpacity > 0.02;

  // Calculate telemetry & environment according to scroll progress
  let phaseName = 'SUNSET CRUISE (LONDON AIRSPACE)';
  let altitudeText = 'FL 340 (34,000 FT)';
  let speedText = '485 KTS GS';
  let assemblyState = 'CRUISE CONFIG';
  let environmentText = 'LONDON SUNSET SKYLINE';

  if (scrollProgress > 0.35 && scrollProgress <= 0.68) {
    phaseName = 'RUNWAY 27 APPROACH (LONDON CITY)';
    altitudeText = '1,200 FT AGL · ILS GLIDESLOPE';
    speedText = '142 KTS IAS';
    assemblyState = 'GEAR EXTENDED · 3 GREEN';
    environmentText = 'RUNWAY LIGHTS · CANARY WHARF';
  } else if (scrollProgress > 0.68) {
    phaseName = 'TOUCHDOWN & EXPLODED INSPECTION';
    altitudeText = '0 FT · RUNWAY THRESHOLD';
    speedText = '0 KTS STATIC';
    assemblyState = 'DISASSEMBLY ACTIVE';
    environmentText = 'AIRPORT TARMAC';
  }

  return (
    <>
      {/* Primary Hero Text (Visible at top) */}
      {isHeroVisible && (
        <div 
          className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between px-6 md:px-16 pt-28 pb-12 transition-opacity duration-300"
          style={{ opacity: heroOpacity }}
        >
          {/* Top Aerospace Subtitle */}
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-xs font-mono-numbers text-cyan-400 tracking-wider uppercase mb-3">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>COMMERCIAL FLEET AIRFRAME & ROTABLE INVENTORY</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight font-tech">
              PRECISION PARTS.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-100 via-neutral-300 to-cyan-300">
                BUILT FOR THE SKIES.
              </span>
            </h1>

            <p className="mt-4 text-sm md:text-base text-neutral-300 leading-relaxed max-w-lg font-light">
              Explore genuine commercial airliner assemblies and dual-release certified components in an interactive 3D flight and disassembly experience.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4 pointer-events-auto">
              <button
                onClick={onExploreParts}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-semibold rounded text-xs md:text-sm tracking-wide transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2 group"
              >
                <span>Inspect Aircraft Components</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onViewCatalog}
                className="px-5 py-2.5 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 rounded text-xs md:text-sm font-medium transition-all"
              >
                View Parts Catalog
              </button>
            </div>
          </div>

          {/* Bottom Scroll Prompt */}
          <div className="flex items-end justify-between border-t border-neutral-800/40 pt-4">
            <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono-numbers">
              <span className="text-cyan-400">CFM LEAP-1B</span>
              <span aria-hidden="true">·</span>
              <span>AIRBUS / BOEING ROTABLES</span>
              <span aria-hidden="true">·</span>
              <span>FAA 8130-3 / EASA DUAL RELEASE</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono-numbers animate-bounce">
              <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>SCROLL TO DESCEND & LAND AT AIRPORT</span>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Flight & Telemetry HUD Ribbon (Top Left) */}
      <div className="absolute top-20 left-6 z-20 pointer-events-none hidden lg:flex flex-col gap-1 text-[11px] font-mono-numbers text-neutral-400 bg-neutral-950/70 backdrop-blur-md p-3 border border-neutral-800/80 rounded-lg shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <span className="text-neutral-500">PHASE:</span>
          <span className="text-cyan-400 font-medium">{phaseName}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-neutral-500">ENVIRONMENT:</span>
          <span className="text-amber-400 font-medium flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{environmentText}</span>
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-neutral-500">ALTITUDE:</span>
          <span className="text-neutral-200">{altitudeText}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-neutral-500">AIRSPEED:</span>
          <span className="text-neutral-200">{speedText}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-neutral-500">AIRFRAME:</span>
          <span className="text-white font-medium">COMMERCIAL JETLINER (N737-AC)</span>
        </div>
      </div>

      {/* 3D Orbit Drag Toggle Button */}
      <div className="absolute top-20 right-6 z-20">
        <button
          onClick={onToggleOrbitMode}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono-numbers backdrop-blur-md transition-all shadow-md ${
            isOrbitMode
              ? 'bg-cyan-500/25 text-cyan-300 border-cyan-500/70 shadow-cyan-950/60'
              : 'bg-neutral-950/80 text-neutral-300 border-neutral-800 hover:text-white hover:border-neutral-700'
          }`}
          title="Toggle free 3D rotation"
        >
          <Compass className={`w-3.5 h-3.5 ${isOrbitMode ? 'text-cyan-400 animate-spin' : ''}`} />
          <span>{isOrbitMode ? 'FREE 3D ROTATION: ON' : '3D ROTATION: OFF'}</span>
        </button>
      </div>
    </>
  );
};
