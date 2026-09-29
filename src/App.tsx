import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AircraftScene } from './components/3d/AircraftScene';
import { HeroOverlay } from './components/hero/HeroOverlay';
import { DisassemblyOverlay } from './components/disassembly/DisassemblyOverlay';
import { PartsCatalog } from './components/catalog/PartsCatalog';
import { AircraftModelExplorer } from './components/models/AircraftModelExplorer';
import { ProductDetailModal } from './components/catalog/ProductDetailModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { SearchModal } from './components/search/SearchModal';
import { QuoteModal } from './components/rfq/QuoteModal';
import { AircraftPart, CartItem, AirframeFamily } from './types/aviation';
import { PARTS_CATALOG, AIRCRAFT_COMPONENTS, ASSET_IMAGES } from './data/partsData';
import { Sliders, Eye, PlaneTakeoff, ShieldCheck, ChevronDown, MapPin } from 'lucide-react';

export default function App() {
  // Scroll progress for 3D experience (0 to 1)
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 3D Scene Interactive State
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [screenPositions, setScreenPositions] = useState<Record<string, { x: number; y: number; visible: boolean }>>({});
  const [isOrbitMode, setIsOrbitMode] = useState(false);
  const [bgImageSrc, setBgImageSrc] = useState(ASSET_IMAGES.londonAirportSunset);
  const [bgLoaded, setBgLoaded] = useState(false);

  // E-Commerce State
  const [catalogComponentFilter, setCatalogComponentFilter] = useState<string | null>(null);
  const [selectedPartForDetail, setSelectedPartForDetail] = useState<AircraftPart | null>(null);
  const [quotePart, setQuotePart] = useState<AircraftPart | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      part: PARTS_CATALOG[0], // CFM56 Fan Blade Set initial demo item
      quantity: 1,
    },
  ]);

  // Track window scroll progress through the 3D runway/flight track
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      const el = scrollContainerRef.current;
      const rect = el.getBoundingClientRect();
      const totalScrollable = el.offsetHeight - window.innerHeight;
      
      if (totalScrollable > 0) {
        const scrolled = -rect.top;
        const progress = Math.max(0, Math.min(1, scrolled / totalScrollable));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut Ctrl/Cmd + K for Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cart Management
  const handleAddToCart = useCallback((part: AircraftPart) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.part.id === part.id);
      if (existing) {
        return prev.map((item) =>
          item.part.id === part.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { part, quantity: 1 }];
    });
    setIsCartOpen(true);
  }, []);

  const handleUpdateCartQuantity = useCallback((partId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.part.id === partId ? { ...item, quantity } : item))
    );
  }, []);

  const handleRemoveCartItem = useCallback((partId: string) => {
    setCartItems((prev) => prev.filter((item) => item.part.id !== partId));
  }, []);

  const handleClearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Request Quote trigger
  const handleOpenQuoteModal = useCallback((part?: AircraftPart) => {
    setQuotePart(part || null);
    setIsQuoteModalOpen(true);
  }, []);

  // Smooth scroll navigation to sections
  const handleNavigateSection = (sectionId: string) => {
    if (sectionId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sectionId === 'disassembly') {
      if (scrollContainerRef.current) {
        const target = scrollContainerRef.current.offsetTop + scrollContainerRef.current.offsetHeight * 0.72;
        window.scrollTo({ top: target, behavior: 'smooth' });
      }
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Jump from Disassembly to Catalog filtered by component
  const handleViewPartsInCatalog = (componentId: string) => {
    setCatalogComponentFilter(componentId);
    setSelectedComponentId(null);
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Airframe Model filter trigger
  const handleSelectAirframe = (airframe: AirframeFamily) => {
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Manual scrubber jump
  const handleScrubPhase = (targetProgress: number) => {
    if (scrollContainerRef.current) {
      const totalScrollable = scrollContainerRef.current.offsetHeight - window.innerHeight;
      window.scrollTo({
        top: scrollContainerRef.current.offsetTop + totalScrollable * targetProgress,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Navigation Bar */}
      <Navbar
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenRFQModal={() => handleOpenQuoteModal()}
        onNavigateSection={handleNavigateSection}
      />

      {/* ============================================================== */}
      {/* 3D SCROLL-DRIVEN EXPERIENCE CONTAINER (Sticky Viewport)        */}
      {/* ============================================================== */}
      <div
        id="top"
        ref={scrollContainerRef}
        className="relative w-full h-[340vh] bg-neutral-950"
      >
        {/* Sticky 3D Viewport Frame */}
        <div className="sticky top-0 w-full h-screen overflow-hidden bg-neutral-950">
          {/* Real Photographic Background Layers (User-Specified London City Airport Sunset) */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-neutral-950">
            {/* Primary Requested Real Airport Background: Aircraft Landing at London City Airport at sunset */}
            <img
              src={bgImageSrc}
              alt="Real Aircraft Landing at London City Airport at sunset with Canary Wharf and O2 Arena in background"
              className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ${
                bgLoaded ? 'opacity-100' : 'opacity-95'
              }`}
              style={{
                filter: 'brightness(1.05) contrast(1.04)',
                transform: `scale(${1 + scrollProgress * 0.08})`,
              }}
              onError={() => {
                // Multi-tier fallback if path or environment differs
                if (bgImageSrc !== ASSET_IMAGES.londonAirportSunsetFallback) {
                  setBgImageSrc(ASSET_IMAGES.londonAirportSunsetFallback);
                } else if (bgImageSrc !== ASSET_IMAGES.londonAirportSunsetRemote) {
                  setBgImageSrc(ASSET_IMAGES.londonAirportSunsetRemote);
                }
              }}
              onLoad={() => setBgLoaded(true)}
              loading="eager"
              decoding="sync"
            />

            {/* Subtle atmospheric vignette and smooth fade into runway on descent */}
            <div
              className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
              style={{
                background: `linear-gradient(to top, rgba(10, 10, 10, ${Math.min(0.9, scrollProgress * 1.2)}), transparent 45%, rgba(10, 10, 10, 0.35))`,
              }}
            />
            <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/25 pointer-events-none" />
          </div>

          {/* Three.js 3D WebGL Canvas */}
          <div className="relative z-10 w-full h-full">
            <AircraftScene
              scrollProgress={scrollProgress}
              selectedComponentId={selectedComponentId}
              onSelectComponent={(id) => setSelectedComponentId(id)}
              onUpdateScreenPositions={(pos) => setScreenPositions(pos)}
              isOrbitMode={isOrbitMode}
            />
          </div>

          {/* Cinematic Hero Overlay (Visible during initial flight phase) */}
          <HeroOverlay
            scrollProgress={scrollProgress}
            onExploreParts={() => handleNavigateSection('disassembly')}
            onViewCatalog={() => handleNavigateSection('catalog')}
            isOrbitMode={isOrbitMode}
            onToggleOrbitMode={() => setIsOrbitMode(!isOrbitMode)}
          />

          {/* Interactive Disassembly Callout Overlay (Visible in hangar exploded phase) */}
          <DisassemblyOverlay
            screenPositions={screenPositions}
            selectedComponentId={selectedComponentId}
            onSelectComponent={(id) => setSelectedComponentId(id)}
            onViewPartsInCatalog={handleViewPartsInCatalog}
            scrollProgress={scrollProgress}
          />

          {/* Bottom Left Quick Flight Phase Scrubber */}
          <div className="absolute bottom-6 left-6 z-20 hidden md:flex items-center gap-2 p-1.5 bg-neutral-950/85 backdrop-blur-md border border-neutral-800 rounded-lg text-xs font-mono-numbers shadow-xl">
            <span className="text-neutral-500 text-[10px] uppercase px-1.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>Phase:</span>
            </span>
            <button
              onClick={() => handleScrubPhase(0.0)}
              className={`px-2.5 py-1 rounded transition-colors ${
                scrollProgress < 0.35 ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              01 Sunset Flight
            </button>
            <span className="text-neutral-700">/</span>
            <button
              onClick={() => handleScrubPhase(0.52)}
              className={`px-2.5 py-1 rounded transition-colors ${
                scrollProgress >= 0.35 && scrollProgress < 0.68 ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              02 Runway Approach
            </button>
            <span className="text-neutral-700">/</span>
            <button
              onClick={() => handleScrubPhase(0.85)}
              className={`px-2.5 py-1 rounded transition-colors ${
                scrollProgress >= 0.68 ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              03 Exploded Assembly
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TRANSITION BANNER: Disassembly to Parts Store                 */}
      {/* ============================================================== */}
      <div className="w-full bg-neutral-900 border-y border-neutral-800 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono-numbers text-neutral-400">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>AEROSPACE ROTABLE EXCHANGE POOL ACTIVE</span>
          </div>
          <div className="flex items-center gap-6">
            <span>READY DISPATCH FROM KMIA / EDDF</span>
            <span className="hidden md:inline">·</span>
            <span className="text-cyan-400">AOG 24/7 HOTLINE: +1 (800) 555-AERO</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MAIN AIRCRAFT PARTS CATALOG                                    */}
      {/* ============================================================== */}
      <PartsCatalog
        selectedComponentFilter={catalogComponentFilter}
        onClearComponentFilter={() => setCatalogComponentFilter(null)}
        onSelectPart={(part) => setSelectedPartForDetail(part)}
        onAddToCart={handleAddToCart}
        onRequestQuote={(part) => handleOpenQuoteModal(part)}
      />

      {/* ============================================================== */}
      {/* AIRCRAFT MODEL EXPLORER                                        */}
      {/* ============================================================== */}
      <AircraftModelExplorer onSelectAirframe={handleSelectAirframe} />

      {/* ============================================================== */}
      {/* FOOTER                                                         */}
      {/* ============================================================== */}
      <Footer onNavigateSection={handleNavigateSection} />

      {/* ============================================================== */}
      {/* MODALS & DRAWERS                                               */}
      {/* ============================================================== */}
      {/* Product Detail Modal */}
      <ProductDetailModal
        part={selectedPartForDetail}
        onClose={() => setSelectedPartForDetail(null)}
        onAddToCart={handleAddToCart}
        onRequestQuote={(part) => handleOpenQuoteModal(part)}
        onSelectPart={(part) => setSelectedPartForDetail(part)}
      />

      {/* Cart & RFQ Procurement Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPart={(part) => {
          setSelectedPartForDetail(part);
          setIsSearchOpen(false);
        }}
      />

      {/* Quick RFQ Quote Modal */}
      <QuoteModal
        part={quotePart}
        isOpen={isQuoteModalOpen}
        onClose={() => {
          setIsQuoteModalOpen(false);
          setQuotePart(null);
        }}
      />
    </div>
  );
}
