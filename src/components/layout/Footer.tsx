import React from 'react';
import { ShieldCheck, Globe, Plane } from 'lucide-react';

interface FooterProps {
  onNavigateSection: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateSection }) => {
  return (
    <footer id="about" className="border-t border-neutral-800 bg-neutral-950 text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand & Mission */}
          <div className="md:col-span-2">
            <span className="text-xl font-bold text-white tracking-tight font-tech block mb-3">
              AeroCore Technologies
            </span>
            <p className="text-neutral-400 max-w-sm leading-relaxed text-xs">
              Premier aerospace components provider supplying dual-release rotable units, structural assemblies, and LRU hardware to global airlines, MROs, and aircraft lessors.
            </p>

            <div className="mt-6 flex flex-wrap gap-4 text-xs font-mono-numbers text-neutral-300">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>FAA AC 00-56B Compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>ASA-100 Accredited</span>
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <span className="text-xs font-mono-numbers text-white block uppercase mb-3">
              Marketplace
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigateSection('top')}
                  className="hover:text-white transition-colors"
                >
                  3D Flight Visualizer
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection('disassembly')}
                  className="hover:text-white transition-colors"
                >
                  Interactive Disassembly
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection('catalog')}
                  className="hover:text-white transition-colors"
                >
                  Parts Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection('models')}
                  className="hover:text-white transition-colors"
                >
                  Aircraft Model Fleet
                </button>
              </li>
            </ul>
          </div>

          {/* Logistics & Dispatch Hubs */}
          <div>
            <span className="text-xs font-mono-numbers text-white block uppercase mb-3">
              Global AOG Hubs
            </span>
            <ul className="space-y-2 text-xs text-neutral-400 font-mono-numbers">
              <li>North America: Miami Logistics Center (KMIA)</li>
              <li>Europe: Frankfurt Aeropark (EDDF)</li>
              <li>Middle East: Dubai World Central (OMDW)</li>
              <li>Asia-Pacific: Singapore Changi (WSSS)</li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Line */}
        <div className="mt-12 pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-500 font-mono-numbers text-[11px]">
          <div>
            © {new Date().getFullYear()} AeroCore Technologies Inc. All aviation rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Airworthiness Trace Guaranteed</span>
            <span aria-hidden="true">·</span>
            <span>ITAR & EAR Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
