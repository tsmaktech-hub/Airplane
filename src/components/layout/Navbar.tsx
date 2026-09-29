import React from 'react';
import { Search, ShoppingBag, FileText } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onOpenRFQModal: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenSearch,
  onOpenRFQModal,
  onNavigateSection,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800/80">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigateSection('top');
          }}
          className="text-lg font-bold tracking-tight text-white font-tech hover:text-cyan-400 transition-colors whitespace-nowrap"
        >
          AeroCore
        </a>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-neutral-300">
          <button
            onClick={() => onNavigateSection('top')}
            className="hover:text-white transition-colors"
          >
            Flight View
          </button>
          <button
            onClick={() => onNavigateSection('disassembly')}
            className="hover:text-cyan-300 transition-colors"
          >
            3D Disassembly
          </button>
          <button
            onClick={() => onNavigateSection('catalog')}
            className="hover:text-white transition-colors"
          >
            Aircraft Parts
          </button>
          <button
            onClick={() => onNavigateSection('models')}
            className="hover:text-white transition-colors"
          >
            Aircraft Models
          </button>
          <button
            onClick={() => onNavigateSection('about')}
            className="hover:text-white transition-colors"
          >
            Certifications
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSearch}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-md transition-colors"
            title="Search parts (Ctrl+K)"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenRFQModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 rounded-md hover:bg-neutral-800 hover:text-white transition-colors whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>RFQ Portal</span>
          </button>

          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-500 transition-colors whitespace-nowrap"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Procurement Cart</span>
            {cartCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-bold bg-neutral-950 text-cyan-300 rounded font-mono-numbers">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
