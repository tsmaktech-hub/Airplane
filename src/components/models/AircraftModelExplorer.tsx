import React, { useState } from 'react';
import { AIRCRAFT_MODELS } from '../../data/partsData';
import { ArrowRight, Plane, CheckCircle2, ChevronRight } from 'lucide-react';
import { AirframeFamily } from '../../types/aviation';

interface AircraftModelExplorerProps {
  onSelectAirframe: (airframe: AirframeFamily) => void;
}

export const AircraftModelExplorer: React.FC<AircraftModelExplorerProps> = ({
  onSelectAirframe,
}) => {
  const [selectedModelId, setSelectedModelId] = useState<string>('b737');

  const currentModel = AIRCRAFT_MODELS.find((m) => m.id === selectedModelId) || AIRCRAFT_MODELS[0];

  return (
    <section id="models" className="max-w-7xl mx-auto px-6 py-20 border-t border-neutral-800">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-neutral-800">
        <div>
          <div className="text-xs font-mono-numbers text-cyan-400 tracking-wider uppercase mb-1">
            SUPPORTED FLEET PLATFORMS
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight font-tech">
            AIRCRAFT MODEL EXPLORER
          </h2>
          <p className="mt-2 text-sm text-neutral-400 max-w-xl">
            Targeted parts catalogs and rotable pooling tailored to active commercial airline fleets worldwide.
          </p>
        </div>
      </div>

      {/* Model Selection Tabs */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {AIRCRAFT_MODELS.map((model) => {
          const isSelected = selectedModelId === model.id;
          return (
            <button
              key={model.id}
              onClick={() => setSelectedModelId(model.id)}
              className={`p-4 rounded-lg text-left transition-all border ${
                isSelected
                  ? 'bg-neutral-900 border-cyan-500 shadow-lg shadow-cyan-950/40'
                  : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <Plane className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-neutral-500'}`} />
                <span className="text-[11px] font-mono-numbers text-neutral-400">
                  {model.catalogPartsCount} Units
                </span>
              </div>
              <div className="mt-2 text-sm font-semibold text-white whitespace-nowrap">
                {model.name.split(' ')[0]} {model.name.split(' ')[1]}
              </div>
              <div className="text-[11px] font-mono-numbers text-neutral-400 mt-0.5">
                {model.code.split('/')[0].trim()}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Model Technical Card */}
      <div className="mt-6 p-6 md:p-8 bg-neutral-900/60 border border-neutral-800 rounded-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7">
          <div className="flex items-center gap-2 text-xs font-mono-numbers text-cyan-400 mb-2">
            <span>PLATFORM SPECIFICATION</span>
            <span>·</span>
            <span>{currentModel.code}</span>
          </div>

          <h3 className="text-2xl font-bold text-white tracking-tight font-tech">
            {currentModel.name}
          </h3>

          <p className="mt-3 text-sm text-neutral-300 leading-relaxed">
            {currentModel.description}
          </p>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-neutral-800/80 text-xs">
            <div>
              <span className="text-neutral-500 block text-[11px]">Powerplant Architecture</span>
              <span className="text-neutral-200 font-mono-numbers font-medium">{currentModel.engineType}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px]">Wingspan Geometry</span>
              <span className="text-neutral-200 font-mono-numbers font-medium">{currentModel.wingspanM} meters</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px]">Max Takeoff Weight (MTOW)</span>
              <span className="text-neutral-200 font-mono-numbers font-medium">
                {currentModel.maxTakeoffWeightKg.toLocaleString()} kg
              </span>
            </div>
          </div>
        </div>

        {/* Action Callout Box */}
        <div className="lg:col-span-5 bg-neutral-950 p-6 rounded-lg border border-neutral-800/80 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono-numbers mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Full Line-Replaceable Unit (LRU) Coverage</span>
            </div>
            <h4 className="text-base font-semibold text-white">
              Procure {currentModel.family} Components
            </h4>
            <p className="mt-1 text-xs text-neutral-400">
              Explore rotable components, carbon brake heat sinks, and avionics specifically certified for this airframe family.
            </p>
          </div>

          <div className="mt-6">
            <button
              onClick={() => onSelectAirframe(currentModel.family)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold transition-colors shadow-md shadow-cyan-950"
            >
              <span>Filter Catalog for {currentModel.name.split(' ')[0]} {currentModel.name.split(' ')[1]}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
