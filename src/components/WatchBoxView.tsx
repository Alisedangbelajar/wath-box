import React, { useState } from 'react';
import { 
  Check, 
  Plus, 
  Disc, 
  Watch, 
  ChevronLeft, 
  ChevronRight, 
  Droplets, 
  Camera, 
  Images, 
  Layers, 
  List, 
  ArrowLeftRight,
  Sparkles,
  ShieldCheck,
  Compass,
  SlidersHorizontal
} from 'lucide-react';
import { WatchItem, StrapItem } from '../types';
import { calculateCollectionMetrics, calculateWatchCostPerWear, getDaysSinceLastWorn } from '../utils/calculations';
import { WatchDialCanvas } from './WatchDialCanvas';
import { StrapDetailModal } from './StrapDetailModal';
import confetti from 'canvas-confetti';

interface WatchBoxViewProps {
  watches: WatchItem[];
  straps: StrapItem[];
  onSelectWatch: (watch: WatchItem) => void;
  onSetWotd: (watchId: string) => void;
  todayWotdId: string | null;
  onOpenAddWatch: () => void;
  onOpenInsurance: () => void;
  onMountStrap: (watchId: string, strapId: string) => void;
  onAddStrap: (strap: Omit<StrapItem, 'id'>) => void;
  onOpenPhotoModal?: () => void;
  onOpenGallery?: () => void;
}

export const WatchBoxView: React.FC<WatchBoxViewProps> = ({
  watches,
  straps,
  onSelectWatch,
  onSetWotd,
  todayWotdId,
  onOpenAddWatch,
  onOpenInsurance,
  onMountStrap,
  onAddStrap,
  onOpenPhotoModal,
  onOpenGallery,
}) => {
  // Sub-section within Collection: 'watches' | 'straps'
  const [boxSection, setBoxSection] = useState<'watches' | 'straps'>('watches');

  // Watches view state: 'swipe' | 'scroll'
  const [watchViewMode, setWatchViewMode] = useState<'swipe' | 'scroll'>('swipe');
  const [watchSwipeIndex, setWatchSwipeIndex] = useState<number>(0);
  const [watchFilterMovement, setWatchFilterMovement] = useState<string>('all');
  const [watchSortBy, setWatchSortBy] = useState<string>('default');
  const [showWatchSortMenu, setShowWatchSortMenu] = useState<boolean>(false);

  // Strap Wardrobe state
  const [strapViewMode, setStrapViewMode] = useState<'swipe' | 'scroll'>('swipe');
  const [strapSwipeIndex, setStrapSwipeIndex] = useState<number>(0);
  const [selectedStrapForModal, setSelectedStrapForModal] = useState<StrapItem | null>(null);
  const [strapFilterLug, setStrapFilterLug] = useState<string>('all');
  const [strapFilterMaterial, setStrapFilterMaterial] = useState<string>('all');
  const [showStrapSortMenu, setShowStrapSortMenu] = useState<boolean>(false);
  const [showAddStrapModal, setShowAddStrapModal] = useState<boolean>(false);

  // New Strap Form State
  const [newStrapName, setNewStrapName] = useState('');
  const [newStrapBrand, setNewStrapBrand] = useState('');
  const [newStrapMaterial, setNewStrapMaterial] = useState<StrapItem['material']>('Horween Leather');
  const [newStrapColor, setNewStrapColor] = useState('');
  const [newStrapLugWidth, setNewStrapLugWidth] = useState<number>(20);
  const [newStrapBuckleWidth, setNewStrapBuckleWidth] = useState<number>(18);
  const [newStrapQuickRelease, setNewStrapQuickRelease] = useState<boolean>(true);
  const [newStrapWaterproof, setNewStrapWaterproof] = useState<boolean>(false);
  const [newStrapPrice, setNewStrapPrice] = useState<number>(85);

  const metrics = calculateCollectionMetrics(watches);

  const handleQuickWotd = (e: React.MouseEvent, watchId: string) => {
    e.stopPropagation();
    onSetWotd(watchId);
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#f59e0b', '#fbbf24', '#d97706'],
    });
  };

  // Filtered and sorted watches
  const filteredWatches = watches
    .filter((w) => {
      if (watchFilterMovement === 'all') return true;
      return w.caliber.type.toLowerCase().includes(watchFilterMovement.toLowerCase());
    })
    .sort((a, b) => {
      if (watchSortBy === 'value_high') {
        const valA = a.marketValueUsd || a.purchasePriceUsd;
        const valB = b.marketValueUsd || b.purchasePriceUsd;
        return valB - valA;
      }
      if (watchSortBy === 'value_low') {
        const valA = a.marketValueUsd || a.purchasePriceUsd;
        const valB = b.marketValueUsd || b.purchasePriceUsd;
        return valA - valB;
      }
      if (watchSortBy === 'wears') {
        return b.wearCount - a.wearCount;
      }
      if (watchSortBy === 'idle') {
        const daysA = getDaysSinceLastWorn(a.lastWornTimestamp);
        const daysB = getDaysSinceLastWorn(b.lastWornTimestamp);
        return daysB - daysA;
      }
      if (watchSortBy === 'brand') {
        return a.brand.localeCompare(b.brand);
      }
      return 0;
    });

  // Filtered straps
  const filteredStraps = straps.filter((s) => {
    const matchLug = strapFilterLug === 'all' || String(s.lugWidthMm) === strapFilterLug;
    const matchMat = strapFilterMaterial === 'all' || s.material === strapFilterMaterial;
    return matchLug && matchMat;
  });

  const handleCreateStrap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStrapName) return;

    onAddStrap({
      name: newStrapName,
      brand: newStrapBrand || 'Independent Atelier',
      material: newStrapMaterial,
      color: newStrapColor || 'Vintage Black',
      lugWidthMm: Number(newStrapLugWidth),
      buckleWidthMm: Number(newStrapBuckleWidth),
      quickRelease: newStrapQuickRelease,
      waterproof: newStrapWaterproof,
      imageUrl: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=400&q=80',
      priceUsd: Number(newStrapPrice),
      acquiredDate: new Date().toISOString().split('T')[0],
    });

    setShowAddStrapModal(false);
    setNewStrapName('');
  };

  const handlePrevWatchSwipe = () => {
    setWatchSwipeIndex((prev) => (prev > 0 ? prev - 1 : filteredWatches.length - 1));
  };

  const handleNextWatchSwipe = () => {
    setWatchSwipeIndex((prev) => (prev < filteredWatches.length - 1 ? prev + 1 : 0));
  };

  const handlePrevStrapSwipe = () => {
    setStrapSwipeIndex((prev) => (prev > 0 ? prev - 1 : filteredStraps.length - 1));
  };

  const handleNextStrapSwipe = () => {
    setStrapSwipeIndex((prev) => (prev < filteredStraps.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="p-4 space-y-4 relative">
      {/* Master Box Header & Summary */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 p-4 rounded-3xl border border-neutral-800/90 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono-tech tracking-wider uppercase">
              <Watch className="w-3.5 h-3.5 text-amber-400" />
              <span>Horology Portfolio</span>
            </div>
            <h1 className="font-serif-luxury text-xl text-neutral-100 font-bold tracking-wide mt-0.5">
              Collection
            </h1>
          </div>

          {/* Action: Single Wrist Scanner Button */}
          {onOpenPhotoModal && (
            <button
              onClick={onOpenPhotoModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 transition-colors text-xs font-mono-tech font-semibold shadow-xs"
              title="Open Wrist Scanner"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Wrist Scanner</span>
            </button>
          )}
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800/60 text-center sm:text-left">
          <div className="bg-neutral-950/60 p-2.5 rounded-2xl border border-neutral-800/40">
            <span className="text-[9px] text-neutral-400 block font-mono-tech uppercase">Appraised Vault</span>
            <span className="text-sm font-bold text-neutral-100 font-mono-tech">
              ${metrics.totalMarketValue.toLocaleString()}
            </span>
            <span className="text-[9px] text-emerald-400 block font-mono-tech mt-0.5">
              {watches.length} Pieces
            </span>
          </div>

          <div className="bg-neutral-950/60 p-2.5 rounded-2xl border border-neutral-800/40">
            <span className="text-[9px] text-neutral-400 block font-mono-tech uppercase">Strap Wardrobe</span>
            <span className="text-sm font-bold text-amber-300 font-mono-tech">
              {straps.length} Straps
            </span>
            <span className="text-[9px] text-neutral-400 block font-mono-tech mt-0.5">
              Ready to mount
            </span>
          </div>

          <div className="bg-neutral-950/60 p-2.5 rounded-2xl border border-neutral-800/40">
            <span className="text-[9px] text-neutral-400 block font-mono-tech uppercase">Avg Cost / Wear</span>
            <span className="text-sm font-bold text-neutral-100 font-mono-tech">
              ${Math.round(metrics.averageCostPerWear)}
            </span>
            <span className="text-[9px] text-amber-400 block font-mono-tech mt-0.5">
              {metrics.totalWears} Total Wears
            </span>
          </div>
        </div>
      </div>

      {/* Inside Collection Segment Selector: Watches vs Straps */}
      <div className="flex items-center justify-between p-1 bg-neutral-900/90 border border-neutral-800 rounded-2xl">
        <button
          onClick={() => setBoxSection('watches')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-mono-tech font-semibold transition-all ${
            boxSection === 'watches'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Watch className="w-3.5 h-3.5" />
          <span>Watches ({watches.length})</span>
        </button>

        <button
          onClick={() => setBoxSection('straps')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-mono-tech font-semibold transition-all ${
            boxSection === 'straps'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Disc className="w-3.5 h-3.5" />
          <span>Straps ({straps.length})</span>
        </button>
      </div>

      {/* SECTION 1: WATCHES SUBSECTION */}
      {boxSection === 'watches' && (
        <div className="space-y-3">
          {/* Header Controls: Left (View Toggles + Single Sort Button) vs Right (+ Add Watch Alone) */}
          <div className="flex items-center justify-between gap-2">
            {/* Left Group: View Mode (Swipe/Scroll) & Single Sort Button */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-2xl border border-neutral-800 shrink-0">
                <button
                  onClick={() => setWatchViewMode('swipe')}
                  className={`p-1.5 rounded-xl transition-all ${
                    watchViewMode === 'swipe'
                      ? 'bg-amber-500 text-neutral-950 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                  title="Swipe View"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setWatchViewMode('scroll')}
                  className={`p-1.5 rounded-xl transition-all ${
                    watchViewMode === 'scroll'
                      ? 'bg-amber-500 text-neutral-950 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                  title="Scroll View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Single Clean Sort Button */}
              <button
                onClick={() => setShowWatchSortMenu(!showWatchSortMenu)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-mono-tech border transition-all ${
                  showWatchSortMenu || watchFilterMovement !== 'all' || watchSortBy !== 'default'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-semibold'
                    : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
                }`}
                title="Open Sorting & Filters"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                <span>Sort</span>
                {(watchFilterMovement !== 'all' || watchSortBy !== 'default') && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </button>
            </div>

            {/* Right Group: Primary Creation Action Alone */}
            <button
              onClick={onOpenAddWatch}
              className="flex items-center gap-1 text-[11px] font-mono-tech text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-xl hover:bg-amber-500/20 transition-colors font-semibold shrink-0 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Watch</span>
            </button>
          </div>

          {/* Expandable Sort & Filter Menu for Watches */}
          {showWatchSortMenu && (
            <div className="bg-neutral-900/95 border border-neutral-800 rounded-2xl p-3.5 space-y-3 shadow-xl text-xs font-mono-tech animate-in fade-in zoom-in-95 duration-150">
              {/* Movement Type Filter */}
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1.5 font-semibold">
                  Movement Filter
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'automatic', label: 'Automatic' },
                    { id: 'manual', label: 'Manual' },
                    { id: 'quartz', label: 'Quartz' },
                    { id: 'spring', label: 'Spring Drive' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setWatchFilterMovement(item.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
                        watchFilterMovement === item.id
                          ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs'
                          : 'bg-neutral-800/90 text-neutral-400 hover:text-neutral-200 border border-neutral-700/60'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Order */}
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1.5 font-semibold">
                  Sort Order
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'default', label: 'Default' },
                    { id: 'value_high', label: 'Value (High → Low)' },
                    { id: 'value_low', label: 'Value (Low → High)' },
                    { id: 'wears', label: 'Most Worn' },
                    { id: 'idle', label: 'Most Idle' },
                    { id: 'brand', label: 'Brand (A-Z)' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setWatchSortBy(item.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
                        watchSortBy === item.id
                          ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs'
                          : 'bg-neutral-800/90 text-neutral-400 hover:text-neutral-200 border border-neutral-700/60'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* WATCH VIEW A: SWIPE CAROUSEL VIEW */}
          {watchViewMode === 'swipe' && filteredWatches.length > 0 && (
            <div className="space-y-3">
              {(() => {
                const currentWatch = filteredWatches[watchSwipeIndex] || filteredWatches[0];
                const isWotd = todayWotdId === currentWatch.id;
                const daysSince = getDaysSinceLastWorn(currentWatch.lastWornTimestamp);
                const costPerWear = calculateWatchCostPerWear(currentWatch);
                const mountedStrap = straps.find((s) => s.id === currentWatch.currentStrapId);

                return (
                  <div
                    onClick={() => onSelectWatch(currentWatch)}
                    className="bg-gradient-to-b from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800 hover:border-amber-500/60 rounded-3xl p-4 shadow-xl cursor-pointer group transition-all relative overflow-hidden"
                  >
                    {/* Big Showcase Dial / Image Card */}
                    <div className="relative rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800/80 h-56 flex items-center justify-center p-2">
                      {/* Sweeping Live Dial Canvas */}
                      <div className="transform group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                        <WatchDialCanvas
                          brand={currentWatch.brand}
                          model={currentWatch.nickname || currentWatch.model}
                          caliberType={currentWatch.caliber.type}
                          vph={currentWatch.caliber.frequencyVph}
                          size={150}
                        />
                      </div>

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="bg-neutral-950/85 backdrop-blur border border-neutral-800 text-amber-300 text-[10px] font-mono-tech px-2.5 py-1 rounded-full font-bold">
                          {currentWatch.dimensions.caseDiameterMm}mm • {currentWatch.dimensions.lugWidthMm}mm Lug
                        </span>
                        <span className="bg-neutral-900/85 backdrop-blur border border-neutral-800 text-neutral-300 text-[10px] font-mono-tech px-2 py-1 rounded-full">
                          {currentWatch.waterResistanceMeters}m WR
                        </span>
                      </div>

                      {/* WOTD Status Badge */}
                      <div className="absolute top-3 right-3">
                        {isWotd ? (
                          <span className="bg-amber-400 text-neutral-950 font-bold px-2.5 py-1 rounded-full text-[10px] font-mono-tech flex items-center gap-1 shadow-lg">
                            <Check className="w-3 h-3 stroke-[3]" /> Wearing Today
                          </span>
                        ) : daysSince > 14 ? (
                          <span className="bg-amber-950/90 text-amber-300 border border-amber-700/80 px-2.5 py-1 rounded-full text-[10px] font-mono-tech">
                            Idle {daysSince}d
                          </span>
                        ) : (
                          <button
                            onClick={(e) => handleQuickWotd(e, currentWatch.id)}
                            className="bg-neutral-900/90 hover:bg-amber-500/20 text-neutral-300 hover:text-amber-200 border border-neutral-700 px-2.5 py-1 rounded-full text-[10px] font-mono-tech transition-colors"
                          >
                            + Wear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Watch Info Details */}
                    <div className="mt-3.5 flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono-tech text-amber-400 uppercase tracking-wider font-semibold">
                          {currentWatch.brand}
                        </span>
                        <h3 className="font-serif-luxury text-base font-bold text-neutral-100 mt-0.5">
                          {currentWatch.nickname || currentWatch.model}
                        </h3>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {currentWatch.caliber.name} • {currentWatch.caliber.type}
                          {mountedStrap && ` • on ${mountedStrap.name}`}
                        </p>
                      </div>

                      <div className="text-right font-mono-tech">
                        <span className="text-sm font-bold text-neutral-100">
                          ${(currentWatch.marketValueUsd || currentWatch.purchasePriceUsd).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-amber-300/90 block">
                          ${Math.round(costPerWear)}/wear
                        </span>
                      </div>
                    </div>

                    {/* Carousel Navigation Controller */}
                    <div
                      className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={handlePrevWatchSwipe}
                        className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
                        title="Previous Timepiece"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1.5">
                        {filteredWatches.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setWatchSwipeIndex(i)}
                            className={`h-2 rounded-full transition-all ${
                              i === watchSwipeIndex ? 'w-6 bg-amber-400' : 'w-2 bg-neutral-700'
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={handleNextWatchSwipe}
                        className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
                        title="Next Timepiece"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* WATCH VIEW B: SCROLL DOWN LIST */}
          {watchViewMode === 'scroll' && (
            <div className="grid grid-cols-1 gap-2.5">
              {filteredWatches.map((watch) => {
                const isWotd = todayWotdId === watch.id;
                const costPerWear = calculateWatchCostPerWear(watch);
                const mountedStrap = straps.find((s) => s.id === watch.currentStrapId);

                return (
                  <div
                    key={watch.id}
                    onClick={() => onSelectWatch(watch)}
                    className="p-3 rounded-2xl bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-800 hover:border-amber-500/60 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-md group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                        <WatchDialCanvas
                          brand={watch.brand}
                          model={watch.nickname || watch.model}
                          caliberType={watch.caliber.type}
                          vph={watch.caliber.frequencyVph}
                          size={48}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono-tech text-amber-400 font-semibold uppercase">
                            {watch.brand}
                          </span>
                          {isWotd && (
                            <span className="text-[9px] text-neutral-950 bg-amber-400 px-1.5 py-0.2 rounded font-bold font-mono-tech">
                              ON WRIST
                            </span>
                          )}
                        </div>
                        <h4 className="font-medium text-xs text-neutral-100 mt-0.5 truncate max-w-[170px]">
                          {watch.nickname || watch.model}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono-tech mt-1">
                          <span className="text-amber-300 font-semibold">{watch.dimensions.caseDiameterMm}mm</span>
                          <span>•</span>
                          <span>{watch.caliber.type}</span>
                          {mountedStrap && (
                            <>
                              <span>•</span>
                              <span className="text-neutral-500 truncate max-w-[90px]">{mountedStrap.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono-tech">
                      <span className="font-bold text-xs text-neutral-200 block">
                        ${(watch.marketValueUsd || watch.purchasePriceUsd).toLocaleString()}
                      </span>
                      <span className="text-[9px] text-amber-400 block mt-0.5">
                        ${Math.round(costPerWear)}/wear
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: STRAPS WARDROBE (Inside Collection) */}
      {boxSection === 'straps' && (
        <div className="space-y-3">
          {/* Straps Header Controls: Left (View Toggles + Single Filter Button) vs Right (+ Add Strap Alone) */}
          <div className="flex items-center justify-between gap-2">
            {/* Left Group: View Mode (Swipe/Scroll) & Single Filter Button */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-2xl border border-neutral-800 shrink-0">
                <button
                  onClick={() => setStrapViewMode('swipe')}
                  className={`p-1.5 rounded-xl transition-all ${
                    strapViewMode === 'swipe'
                      ? 'bg-amber-500 text-neutral-950 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                  title="Swipe View"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setStrapViewMode('scroll')}
                  className={`p-1.5 rounded-xl transition-all ${
                    strapViewMode === 'scroll'
                      ? 'bg-amber-500 text-neutral-950 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                  title="Scroll View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Single Clean Filter Button */}
              <button
                onClick={() => setShowStrapSortMenu(!showStrapSortMenu)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-mono-tech border transition-all ${
                  showStrapSortMenu || strapFilterLug !== 'all' || strapFilterMaterial !== 'all'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-semibold'
                    : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
                }`}
                title="Open Strap Filters"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                <span>Filter</span>
                {(strapFilterLug !== 'all' || strapFilterMaterial !== 'all') && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </button>
            </div>

            {/* Right Group: Primary Creation Action Alone */}
            <button
              onClick={() => setShowAddStrapModal(true)}
              className="flex items-center gap-1 text-[11px] font-mono-tech text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-xl hover:bg-amber-500/20 transition-colors font-semibold shrink-0 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Strap</span>
            </button>
          </div>

          {/* Expandable Filter Menu for Straps */}
          {showStrapSortMenu && (
            <div className="bg-neutral-900/95 border border-neutral-800 rounded-2xl p-3.5 space-y-3 shadow-xl text-xs font-mono-tech animate-in fade-in zoom-in-95 duration-150">
              {/* Lug Width */}
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1.5 font-semibold">
                  Lug Width
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['all', '18', '19', '20', '21', '22'].map((lug) => (
                    <button
                      key={lug}
                      onClick={() => setStrapFilterLug(lug)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
                        strapFilterLug === lug
                          ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs'
                          : 'bg-neutral-800/90 text-neutral-400 hover:text-neutral-200 border border-neutral-700/60'
                      }`}
                    >
                      {lug === 'all' ? 'All Lugs' : `${lug}mm`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Material */}
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1.5 font-semibold">
                  Strap Material
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'Horween Leather', label: 'Horween Leather' },
                    { id: 'Italian Calfskin', label: 'Calfskin' },
                    { id: 'FKM Rubber', label: 'FKM Rubber' },
                    { id: 'Seatbelt NATO', label: 'NATO' },
                    { id: 'Steel Milanese', label: 'Milanese' },
                    { id: 'Jubilee Bracelet', label: 'Jubilee' },
                    { id: 'Oyster Bracelet', label: 'Oyster' },
                    { id: 'Sailcloth', label: 'Sailcloth' },
                  ].map((mat) => (
                    <button
                      key={mat.id}
                      onClick={() => setStrapFilterMaterial(mat.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
                        strapFilterMaterial === mat.id
                          ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs'
                          : 'bg-neutral-800/90 text-neutral-400 hover:text-neutral-200 border border-neutral-700/60'
                      }`}
                    >
                      {mat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW TYPE A: SWIPE CAROUSEL VIEW */}
          {strapViewMode === 'swipe' && filteredStraps.length > 0 && (
            <div className="space-y-3">
              {(() => {
                const currentStrap = filteredStraps[strapSwipeIndex] || filteredStraps[0];
                const mountedWatch = watches.find((w) => w.currentStrapId === currentStrap.id);

                return (
                  <div 
                    onClick={() => setSelectedStrapForModal(currentStrap)}
                    className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl p-4 shadow-xl cursor-pointer group hover:border-amber-500/60 transition-all relative overflow-hidden"
                  >
                    {/* Big Strap Preview Image */}
                    <div className="relative rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 h-52 flex items-center justify-center">
                      <img
                        src={currentStrap.imageUrl}
                        alt={currentStrap.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="bg-neutral-950/80 backdrop-blur border border-neutral-800 text-amber-400 text-[10px] font-mono-tech px-2.5 py-1 rounded-full font-bold">
                          {currentStrap.lugWidthMm}mm Lug
                        </span>
                        {currentStrap.waterproof && (
                          <span className="bg-cyan-950/80 backdrop-blur border border-cyan-800 text-cyan-300 text-[10px] font-mono-tech px-2 py-1 rounded-full flex items-center gap-1">
                            <Droplets className="w-3 h-3" /> Waterproof
                          </span>
                        )}
                      </div>

                      {/* Mounted Status Badge */}
                      <div className="absolute top-3 right-3">
                        {mountedWatch ? (
                          <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-700/80 px-2.5 py-1 rounded-full text-[10px] font-mono-tech flex items-center gap-1 shadow-lg">
                            <Check className="w-3 h-3" /> Mounted on {mountedWatch.brand}
                          </span>
                        ) : (
                          <span className="bg-neutral-900/90 text-neutral-300 border border-neutral-700 px-2.5 py-1 rounded-full text-[10px] font-mono-tech">
                            In Wardrobe
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Strap Info Details */}
                    <div className="mt-3.5 flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono-tech text-amber-400 uppercase tracking-wider font-semibold">
                          {currentStrap.brand}
                        </span>
                        <h3 className="font-serif-luxury text-base font-bold text-neutral-100 mt-0.5">
                          {currentStrap.name}
                        </h3>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {currentStrap.material} • {currentStrap.color}
                        </p>
                      </div>

                      <div className="text-right font-mono-tech">
                        <span className="text-sm font-bold text-neutral-100">${currentStrap.priceUsd}</span>
                        <span className="text-[10px] text-neutral-500 block">
                          Taper: {currentStrap.buckleWidthMm}mm
                        </span>
                      </div>
                    </div>

                    {/* Carousel Navigation Controller */}
                    <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={handlePrevStrapSwipe}
                        className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
                        title="Previous Strap"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1.5">
                        {filteredStraps.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setStrapSwipeIndex(i)}
                            className={`h-2 rounded-full transition-all ${
                              i === strapSwipeIndex ? 'w-6 bg-amber-400' : 'w-2 bg-neutral-700'
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={handleNextStrapSwipe}
                        className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
                        title="Next Strap"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* VIEW TYPE B: SCROLL DOWN LIST */}
          {strapViewMode === 'scroll' && (
            <div className="grid grid-cols-1 gap-2.5">
              {filteredStraps.map((strap) => {
                const mountedWatch = watches.find((w) => w.currentStrapId === strap.id);

                return (
                  <div
                    key={strap.id}
                    onClick={() => setSelectedStrapForModal(strap)}
                    className="p-3 rounded-2xl bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-800 hover:border-amber-500/60 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-md group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={strap.imageUrl}
                        alt={strap.name}
                        className="w-14 h-14 rounded-xl object-cover border border-neutral-800 shrink-0 group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono-tech text-amber-400 font-semibold uppercase">{strap.brand}</span>
                          {strap.waterproof && (
                            <span className="text-[9px] text-cyan-400 bg-cyan-950/60 px-1 rounded flex items-center gap-0.5 font-mono-tech">
                              <Droplets className="w-2.5 h-2.5" /> Waterproof
                            </span>
                          )}
                        </div>
                        <h4 className="font-medium text-xs text-neutral-100 mt-0.5">{strap.name}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono-tech mt-1">
                          <span className="text-amber-300 font-semibold">{strap.lugWidthMm}mm Lug</span>
                          <span>•</span>
                          <span>{strap.material}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono-tech">
                      <span className="font-bold text-xs text-neutral-200 block">${strap.priceUsd}</span>
                      {mountedWatch ? (
                        <span className="text-[9px] text-emerald-400 block mt-0.5">Mounted: {mountedWatch.brand}</span>
                      ) : (
                        <span className="text-[9px] text-neutral-500 block mt-0.5">In Wardrobe</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Strap Spec BottomSheet Modal */}
      {selectedStrapForModal && (
        <StrapDetailModal
          strap={selectedStrapForModal}
          watches={watches}
          onClose={() => setSelectedStrapForModal(null)}
          onMountStrap={(wId, sId) => {
            onMountStrap(wId, sId);
            setSelectedStrapForModal(null);
          }}
        />
      )}

      {/* Add Strap Modal */}
      {showAddStrapModal && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-3xl p-4 w-full max-w-sm space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <h4 className="text-xs font-bold font-serif-luxury text-amber-300">Add Strap to Wardrobe</h4>
              <button onClick={() => setShowAddStrapModal(false)} className="text-neutral-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStrap} className="space-y-2.5 text-xs">
              <div>
                <label className="text-[10px] text-neutral-400 font-mono-tech block mb-1">Strap Name</label>
                <input
                  type="text"
                  placeholder="e.g. Delugs Cognac Crazy Horse"
                  value={newStrapName}
                  onChange={(e) => setNewStrapName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-neutral-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-neutral-400 font-mono-tech block mb-1">Brand / Atelier</label>
                  <input
                    type="text"
                    placeholder="e.g. Artem Straps"
                    value={newStrapBrand}
                    onChange={(e) => setNewStrapBrand(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-neutral-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 font-mono-tech block mb-1">Material</label>
                  <select
                    value={newStrapMaterial}
                    onChange={(e) => setNewStrapMaterial(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-neutral-200"
                  >
                    <option value="Horween Leather">Horween Leather</option>
                    <option value="NATO Nylon">NATO Nylon</option>
                    <option value="Tropic FKM Rubber">Tropic Rubber</option>
                    <option value="Sailcloth">Sailcloth</option>
                    <option value="Milanese Mesh">Mesh Bracelet</option>
                    <option value="Alligator">Alligator</option>
                    <option value="Suede">Suede</option>
                    <option value="Oyster Steel">Steel Bracelet</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-neutral-400 font-mono-tech block mb-1">Lug Width</label>
                  <select
                    value={newStrapLugWidth}
                    onChange={(e) => setNewStrapLugWidth(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-neutral-200"
                  >
                    <option value={18}>18mm</option>
                    <option value={19}>19mm</option>
                    <option value={20}>20mm</option>
                    <option value={21}>21mm</option>
                    <option value={22}>22mm</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 font-mono-tech block mb-1">Buckle (mm)</label>
                  <input
                    type="number"
                    value={newStrapBuckleWidth}
                    onChange={(e) => setNewStrapBuckleWidth(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-neutral-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 font-mono-tech block mb-1">Price ($)</label>
                  <input
                    type="number"
                    value={newStrapPrice}
                    onChange={(e) => setNewStrapPrice(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-neutral-200"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 text-[11px] text-neutral-300">
                  <input
                    type="checkbox"
                    checked={newStrapQuickRelease}
                    onChange={(e) => setNewStrapQuickRelease(e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span>Quick Release</span>
                </label>
                <label className="flex items-center gap-1.5 text-[11px] text-neutral-300">
                  <input
                    type="checkbox"
                    checked={newStrapWaterproof}
                    onChange={(e) => setNewStrapWaterproof(e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span>Waterproof</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 text-neutral-950 font-bold rounded-xl font-mono-tech mt-2 hover:bg-amber-400"
              >
                Add To Wardrobe
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
