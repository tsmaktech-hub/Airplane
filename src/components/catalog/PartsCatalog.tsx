import React, { useState, useMemo } from 'react';
import { PARTS_CATALOG, AIRCRAFT_COMPONENTS } from '../../data/partsData';
import { AircraftCategory, AircraftCondition, AircraftPart, AirframeFamily } from '../../types/aviation';
import { ProductCard } from './ProductCard';
import { Search, Filter, X, RotateCcw, SlidersHorizontal } from 'lucide-react';

interface PartsCatalogProps {
  selectedComponentFilter: string | null;
  onClearComponentFilter: () => void;
  onSelectPart: (part: AircraftPart) => void;
  onAddToCart: (part: AircraftPart) => void;
  onRequestQuote: (part: AircraftPart) => void;
}

const CATEGORIES: AircraftCategory[] = [
  'Engines & Propulsion',
  'Landing Gear & Brakes',
  'Flight Controls',
  'Hydraulic Systems',
  'Avionics & Radar',
  'Fuel Systems',
];

const AIRFRAMES: AirframeFamily[] = [
  'Boeing 737 Series',
  'Boeing 777 Series',
  'Airbus A320 Family',
  'Airbus A330 Family',
  'ATR 72 Series',
];

export const PartsCatalog: React.FC<PartsCatalogProps> = ({
  selectedComponentFilter,
  onClearComponentFilter,
  onSelectPart,
  onAddToCart,
  onRequestQuote,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAirframe, setSelectedAirframe] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'priceAsc' | 'priceDesc' | 'partNumber'>('recommended');

  // Filtered Parts
  const filteredParts = useMemo(() => {
    return PARTS_CATALOG.filter((part) => {
      // 3D Component Filter
      if (selectedComponentFilter && part.componentId !== selectedComponentFilter) {
        return false;
      }

      // Search Query (name, partNumber, altPartNumber, manufacturer, ATA chapter)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          part.name.toLowerCase().includes(q) ||
          part.partNumber.toLowerCase().includes(q) ||
          (part.altPartNumber && part.altPartNumber.toLowerCase().includes(q)) ||
          part.manufacturer.toLowerCase().includes(q) ||
          part.ataChapter.toLowerCase().includes(q) ||
          part.airframeCompatibility.some((af) => af.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Category Filter
      if (selectedCategory !== 'all' && part.category !== selectedCategory) {
        return false;
      }

      // Airframe Filter
      if (selectedAirframe !== 'all' && !part.airframeCompatibility.includes(selectedAirframe as AirframeFamily)) {
        return false;
      }

      // Condition Filter
      if (selectedCondition !== 'all' && !part.condition.includes(selectedCondition)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'priceAsc') {
        return (a.priceUSD || 9999999) - (b.priceUSD || 9999999);
      }
      if (sortBy === 'priceDesc') {
        return (b.priceUSD || 0) - (a.priceUSD || 0);
      }
      if (sortBy === 'partNumber') {
        return a.partNumber.localeCompare(b.partNumber);
      }
      return 0;
    });
  }, [searchQuery, selectedCategory, selectedAirframe, selectedCondition, selectedComponentFilter, sortBy]);

  const activeCompInfo = selectedComponentFilter
    ? AIRCRAFT_COMPONENTS.find((c) => c.id === selectedComponentFilter)
    : null;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedAirframe('all');
    setSelectedCondition('all');
    onClearComponentFilter();
  };

  return (
    <section id="catalog" className="max-w-7xl mx-auto px-6 py-20 relative">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-neutral-800">
        <div>
          <div className="text-xs font-mono-numbers text-cyan-400 tracking-wider uppercase mb-1">
            CERTIFIED ROTABLE & EXPENDABLE INVENTORY
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight font-tech">
            AIRCRAFT COMPONENTS CATALOG
          </h2>
          <p className="mt-2 text-sm text-neutral-400 max-w-xl">
            Direct procurement access to dual-release FAA 8130-3 / EASA Form 1 certified flight hardware, LRUs, and assemblies.
          </p>
        </div>

        {/* Search Bar Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search part #, CFM56, ATA chapter..."
            className="w-full pl-10 pr-9 py-2 bg-neutral-900/90 border border-neutral-800 rounded-md text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Active 3D Component Filter Notice */}
      {activeCompInfo && (
        <div className="mt-4 p-3 bg-cyan-950/40 border border-cyan-800/60 rounded-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs text-neutral-300">
              Filtered by 3D Aircraft Assembly: <strong className="text-white font-medium">{activeCompInfo.name}</strong> ({activeCompInfo.ataChapter})
            </span>
          </div>
          <button
            onClick={onClearComponentFilter}
            className="text-xs text-cyan-400 hover:text-cyan-200 flex items-center gap-1 font-mono-numbers"
          >
            <span>Show All Components</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter Controls Row */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900/80 border border-neutral-800/80 rounded-lg overflow-x-auto max-w-full">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Dropdown Filters */}
        <div className="flex items-center gap-3">
          {/* Airframe Dropdown */}
          <select
            value={selectedAirframe}
            onChange={(e) => setSelectedAirframe(e.target.value)}
            className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Airframes</option>
            {AIRFRAMES.map((af) => (
              <option key={af} value={af}>{af}</option>
            ))}
          </select>

          {/* Condition Dropdown */}
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Conditions</option>
            <option value="Factory New">Factory New (FN)</option>
            <option value="Overhauled">Overhauled (OH)</option>
            <option value="Serviceable">Serviceable (SV)</option>
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-cyan-500 font-mono-numbers"
          >
            <option value="recommended">Sort: Recommended</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="partNumber">Part Number (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Results Count & Metric */}
      <div className="mt-4 flex items-center justify-between text-xs text-neutral-500 font-mono-numbers">
        <span>Showing {filteredParts.length} verified aeronautical parts</span>
        {(searchQuery || selectedCategory !== 'all' || selectedAirframe !== 'all' || selectedCondition !== 'all' || selectedComponentFilter) && (
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Parts Grid */}
      {filteredParts.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredParts.map((part) => (
            <ProductCard
              key={part.id}
              part={part}
              onSelectPart={onSelectPart}
              onAddToCart={onAddToCart}
              onRequestQuote={onRequestQuote}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="mt-12 py-16 text-center border border-dashed border-neutral-800 rounded-lg">
          <Filter className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-neutral-200">No aircraft parts matched your criteria</h3>
          <p className="mt-1 text-xs text-neutral-400 max-w-sm mx-auto">
            Try adjusting your search terms, removing category filters, or request an offline rotable inventory search.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs font-medium transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </section>
  );
};
