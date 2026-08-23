import React, { useState, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Compass, 
  Layers, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { WatchItem, ComplicationType, CaliberType } from '../types';
import { calculateWatchCostPerWear, getDaysSinceLastWorn } from '../utils/calculations';

interface WatchListViewProps {
  watches: WatchItem[];
  onSelectWatch: (watch: WatchItem) => void;
}

export const WatchListView: React.FC<WatchListViewProps> = ({
  watches,
  onSelectWatch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplication, setSelectedComplication] = useState<string>('all');
  const [selectedMovement, setSelectedMovement] = useState<string>('all');
  const [selectedLugWidth, setSelectedLugWidth] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'wearCount' | 'costPerWear' | 'marketValue' | 'diameter' | 'thickness'>('wearCount');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredWatches = useMemo(() => {
    return watches
      .filter((w) => {
        const matchesSearch = 
          w.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.caliber.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (w.nickname && w.nickname.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesComp = selectedComplication === 'all' || w.complications.includes(selectedComplication as ComplicationType);
        const matchesMovement = selectedMovement === 'all' || w.caliber.type === selectedMovement;
        const matchesLug = selectedLugWidth === 'all' || String(Math.round(w.dimensions.lugWidthMm)) === selectedLugWidth;

        return matchesSearch && matchesComp && matchesMovement && matchesLug;
      })
      .sort((a, b) => {
        let valA = 0;
        let valB = 0;

        if (sortBy === 'wearCount') {
          valA = a.totalDaysWorn;
          valB = b.totalDaysWorn;
        } else if (sortBy === 'costPerWear') {
          valA = calculateWatchCostPerWear(a);
          valB = calculateWatchCostPerWear(b);
        } else if (sortBy === 'marketValue') {
          valA = a.marketValueUsd;
          valB = b.marketValueUsd;
        } else if (sortBy === 'diameter') {
          valA = a.dimensions.caseDiameterMm;
          valB = b.dimensions.caseDiameterMm;
        } else if (sortBy === 'thickness') {
          valA = a.dimensions.thicknessMm;
          valB = b.dimensions.thicknessMm;
        }

        return sortOrder === 'desc' ? valB - valA : valA - valB;
      });
  }, [watches, searchQuery, selectedComplication, selectedMovement, selectedLugWidth, sortBy, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <div className="p-4 space-y-3.5">
      {/* Search and Sort Header */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search brand, ref#, caliber 3861, 3235..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/80 transition-colors"
          />
        </div>

        {/* Filters Scroll Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
          {/* Complication Filter */}
          <select
            value={selectedComplication}
            onChange={(e) => setSelectedComplication(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-300 focus:outline-none focus:border-amber-500 shrink-0"
          >
            <option value="all">All Complications</option>
            <option value="Chronograph">Chronograph</option>
            <option value="Diver (Rotating Bezel)">Diver</option>
            <option value="GMT / Dual Time">GMT</option>
            <option value="Date / Day-Date">Date</option>
            <option value="Micro-Rotor">Micro-Rotor</option>
            <option value="Time Only">Time Only</option>
          </select>

          {/* Movement Type Filter */}
          <select
            value={selectedMovement}
            onChange={(e) => setSelectedMovement(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-300 focus:outline-none focus:border-amber-500 shrink-0"
          >
            <option value="all">All Movements</option>
            <option value="Automatic">Automatic</option>
            <option value="Manual Wind">Manual Wind</option>
            <option value="Spring Drive">Spring Drive</option>
          </select>

          {/* Lug Width Filter */}
          <select
            value={selectedLugWidth}
            onChange={(e) => setSelectedLugWidth(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-300 focus:outline-none focus:border-amber-500 shrink-0"
          >
            <option value="all">Lug Width</option>
            <option value="19">19mm</option>
            <option value="20">20mm</option>
            <option value="21">21mm</option>
            <option value="22">22mm</option>
          </select>

          {/* Sort Key */}
          <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1 shrink-0">
            <ArrowUpDown className="w-3 h-3 text-neutral-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-neutral-300 text-[11px] focus:outline-none"
            >
              <option value="wearCount">Most Worn</option>
              <option value="costPerWear">Cost / Wear</option>
              <option value="marketValue">Market Value</option>
              <option value="diameter">Case Diameter</option>
              <option value="thickness">Case Thickness</option>
            </select>
            <button
              onClick={toggleSortOrder}
              className="text-[10px] font-mono-tech text-amber-400 hover:text-amber-300 ml-1 px-1 rounded bg-neutral-800"
            >
              {sortOrder.toUpperCase()}
            </button>
          </div>
        </div>
      </div>

      {/* Catalog Spec Cards List */}
      <div className="space-y-3">
        {filteredWatches.length === 0 ? (
          <div className="bg-neutral-900/50 rounded-2xl p-8 text-center border border-neutral-800">
            <Clock className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-xs text-neutral-400">No timepieces matched your active filter criteria.</p>
          </div>
        ) : (
          filteredWatches.map((watch) => {
            const costPerWear = calculateWatchCostPerWear(watch);
            const daysSince = getDaysSinceLastWorn(watch.lastWornTimestamp);

            return (
              <div
                key={watch.id}
                onClick={() => onSelectWatch(watch)}
                className="bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-800/90 hover:border-neutral-700 rounded-2xl p-3.5 transition-all cursor-pointer shadow-lg group relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left Watch Thumbnail / Macro Dial */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 shrink-0 relative">
                    <img
                      src={watch.imageUrl}
                      alt={watch.model}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] font-mono-tech text-center py-0.5 text-amber-300">
                      {watch.dimensions.caseDiameterMm}mm
                    </span>
                  </div>

                  {/* Center Core Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono-tech text-amber-400 font-semibold tracking-wider uppercase">
                        {watch.brand}
                      </span>
                      {watch.boxAndPapers === 'Full Set' && (
                        <span className="bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-[8px] font-mono-tech px-1.5 py-0.2 rounded">
                          FULL SET
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif-luxury text-sm font-bold text-neutral-100 truncate mt-0.5">
                      {watch.model}
                    </h3>
                    <p className="text-[11px] text-neutral-400 font-mono-tech truncate">
                      Ref. {watch.referenceNumber} • {watch.yearOfProduction}
                    </p>

                    {/* Movement Specification Pill */}
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-neutral-300 font-mono-tech">
                      <span className="bg-neutral-950 px-2 py-0.5 rounded-md border border-neutral-800 text-amber-200">
                        {watch.caliber.name}
                      </span>
                      <span className="text-neutral-500">•</span>
                      <span>{watch.caliber.powerReserveHours}h Res</span>
                      <span className="text-neutral-500">•</span>
                      <span>{watch.caliber.jewels}J</span>
                    </div>
                  </div>

                  {/* Right Cost-Per-Wear & Value */}
                  <div className="text-right shrink-0 flex flex-col items-end justify-between self-stretch">
                    <div>
                      <div className="text-xs font-bold text-amber-300 font-mono-tech">
                        ${Math.round(costPerWear)}
                        <span className="text-[9px] text-neutral-400 font-normal">/day</span>
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono-tech">
                        {watch.totalDaysWorn} wears
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                      <span className="text-[9px] text-neutral-500">Mkt:</span>
                      <span className="font-mono-tech font-semibold text-neutral-200">
                        ${watch.marketValueUsd.toLocaleString()}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </div>

                {/* Bottom Dimensions & Geometry Strip */}
                <div className="mt-3 pt-2.5 border-t border-neutral-800/60 flex items-center justify-between text-[10px] text-neutral-400 font-mono-tech">
                  <div className="flex items-center gap-2">
                    <span>Lug: <strong className="text-neutral-200">{watch.dimensions.lugWidthMm}mm</strong></span>
                    <span>L2L: <strong className="text-neutral-200">{watch.dimensions.lugToLugMm}mm</strong></span>
                    <span>Thick: <strong className="text-neutral-200">{watch.dimensions.thicknessMm}mm</strong></span>
                  </div>

                  <div className="text-[9px]">
                    {daysSince === 0 ? (
                      <span className="text-emerald-400 font-semibold">Worn Today</span>
                    ) : daysSince === 1 ? (
                      <span className="text-neutral-400">Worn Yesterday</span>
                    ) : (
                      <span className={daysSince > 14 ? 'text-amber-400' : 'text-neutral-500'}>
                        Last worn {daysSince}d ago
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
