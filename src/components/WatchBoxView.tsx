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
  SlidersHorizontal,
  FileText,
  Clock
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
      colors: ['#6366f1', '#8b5cf6', '#f59e0b'],
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
    <div className="p-4 space-y-4 relative text-slate-800">
      {/* 1. Header & Personalized Greeting Inspired by Reference */}
      <div className="pt-1 px-1">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 font-mono-tech tracking-wide uppercase">
              Horology OS
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
              Hello, Collector
            </h1>
            <p className="text-sm text-slate-500 font-medium">What would you like to explore today?</p>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-xs">
            <Watch className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Quick Action Grid (Matching Reference Design: 4 Square Cards) */}
      <div className="bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-700">Quick Actions</span>
          <span className="text-[10px] text-slate-400 font-mono-tech">Instant Studio</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {/* Action 1: Wrist Scan */}
          <button
            onClick={onOpenPhotoModal}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/80 border border-slate-100 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 transition-all shadow-2xs group"
          >
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-2xs group-hover:scale-105 transition-transform mb-1.5">
              <Camera className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold">Scan Wrist</span>
          </button>

          {/* Action 2: Add Watch */}
          <button
            onClick={onOpenAddWatch}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/80 border border-slate-100 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 transition-all shadow-2xs group"
          >
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-2xs group-hover:scale-105 transition-transform mb-1.5">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold">Add Watch</span>
          </button>

          {/* Action 3: Photo Gallery */}
          <button
            onClick={onOpenGallery}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/80 border border-slate-100 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 transition-all shadow-2xs group"
          >
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-2xs group-hover:scale-105 transition-transform mb-1.5">
              <Images className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold">Gallery</span>
          </button>

          {/* Action 4: Appraisal */}
          <button
            onClick={onOpenInsurance}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/80 border border-slate-100 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 transition-all shadow-2xs group"
          >
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-2xs group-hover:scale-105 transition-transform mb-1.5">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold">Appraisal</span>
          </button>
        </div>
      </div>

      {/* 3. Portfolio Key Metrics Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-tight">Appraised Value</span>
          <span className="text-sm font-bold text-slate-900 font-mono-tech mt-0.5 block">
            ${metrics.totalMarketValue.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
            {watches.length} Timepieces
          </span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-tight">Strap Wardrobe</span>
          <span className="text-sm font-bold text-indigo-600 font-mono-tech mt-0.5 block">
            {straps.length} Straps
          </span>
          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
            Ready to mount
          </span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-tight">Cost / Wear</span>
          <span className="text-sm font-bold text-slate-900 font-mono-tech mt-0.5 block">
            ${Math.round(metrics.averageCostPerWear)}
          </span>
          <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">
            {metrics.totalWears} Total Wears
          </span>
        </div>
      </div>

      {/* 4. Inside Collection Segment Switcher: Watches vs Straps */}
      <div className="flex items-center justify-between p-1 bg-slate-200/70 border border-slate-200 rounded-2xl">
        <button
          onClick={() => setBoxSection('watches')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            boxSection === 'watches'
              ? 'bg-white text-indigo-600 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Watch className="w-3.5 h-3.5" />
          <span>Watches ({watches.length})</span>
        </button>

        <button
          onClick={() => setBoxSection('straps')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            boxSection === 'straps'
              ? 'bg-white text-indigo-600 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Disc className="w-3.5 h-3.5" />
          <span>Straps ({straps.length})</span>
        </button>
      </div>

      {/* SECTION 1: WATCHES SUBSECTION */}
      {boxSection === 'watches' && (
        <div className="space-y-3">
          {/* Header Controls: Left (View Toggles + Single Sort Button) vs Right (+ Add Watch) */}
          <div className="flex items-center justify-between gap-2">
            {/* Left Group: View Mode (Swipe/Scroll) & Single Sort Button */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200/90 shrink-0 shadow-2xs">
                <button
                  onClick={() => setWatchViewMode('swipe')}
                  className={`p-1.5 rounded-xl transition-all ${
                    watchViewMode === 'swipe'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Swipe View"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setWatchViewMode('scroll')}
                  className={`p-1.5 rounded-xl transition-all ${
                    watchViewMode === 'scroll'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Scroll View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Single Clean Sort Button */}
              <button
                onClick={() => setShowWatchSortMenu(!showWatchSortMenu)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shadow-2xs ${
                  showWatchSortMenu || watchFilterMovement !== 'all' || watchSortBy !== 'default'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
                title="Open Sorting & Filters"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                <span>Filter & Sort</span>
                {(watchFilterMovement !== 'all' || watchSortBy !== 'default') && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                )}
              </button>
            </div>

            {/* Right Group: Add Watch Button */}
            <button
              onClick={onOpenAddWatch}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 rounded-xl hover:bg-indigo-100 transition-colors shrink-0 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Watch</span>
            </button>
          </div>

          {/* Expandable Sort & Filter Menu for Watches */}
          {showWatchSortMenu && (
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-3 shadow-md text-xs animate-in fade-in zoom-in-95 duration-150">
              {/* Movement Type Filter */}
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5 font-bold font-mono-tech">
                  Movement Filter
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'All Calibers' },
                    { id: 'automatic', label: 'Automatic' },
                    { id: 'manual', label: 'Manual' },
                    { id: 'quartz', label: 'Quartz' },
                    { id: 'spring', label: 'Spring Drive' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setWatchFilterMovement(item.id)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors ${
                        watchFilterMovement === item.id
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/80'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Order */}
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5 font-bold font-mono-tech">
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
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors ${
                        watchSortBy === item.id
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/80'
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
                    className="bg-white border border-slate-200/90 hover:border-indigo-300 rounded-3xl p-4 shadow-sm cursor-pointer group transition-all relative overflow-hidden"
                  >
                    {/* Big Showcase Dial / Image Card */}
                    <div className="relative rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/80 h-56 flex items-center justify-center p-2">
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
                        <span className="bg-white/90 backdrop-blur border border-slate-200 text-slate-800 text-[10px] font-mono-tech px-2.5 py-1 rounded-full font-bold shadow-2xs">
                          {currentWatch.dimensions.caseDiameterMm}mm • {currentWatch.dimensions.lugWidthMm}mm Lug
                        </span>
                        <span className="bg-white/90 backdrop-blur border border-slate-200 text-slate-600 text-[10px] font-mono-tech px-2 py-1 rounded-full shadow-2xs">
                          {currentWatch.waterResistanceMeters}m WR
                        </span>
                      </div>

                      {/* WOTD Status Badge */}
                      <div className="absolute top-3 right-3">
                        {isWotd ? (
                          <span className="bg-indigo-600 text-white font-bold px-2.5 py-1 rounded-full text-[10px] font-mono-tech flex items-center gap-1 shadow-sm">
                            <Check className="w-3 h-3 stroke-[3]" /> Wearing Today
                          </span>
                        ) : daysSince > 14 ? (
                          <span className="bg-amber-50 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-full text-[10px] font-mono-tech font-semibold">
                            Idle {daysSince}d
                          </span>
                        ) : (
                          <button
                            onClick={(e) => handleQuickWotd(e, currentWatch.id)}
                            className="bg-white hover:bg-indigo-50 text-indigo-600 border border-slate-200 px-2.5 py-1 rounded-full text-[10px] font-mono-tech font-semibold transition-colors shadow-2xs"
                          >
                            + Wear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Watch Info Details */}
                    <div className="mt-3.5 flex items-start justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider font-mono-tech">
                          {currentWatch.brand}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-0.5">
                          {currentWatch.nickname || currentWatch.model}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                          {currentWatch.caliber.name} • {currentWatch.caliber.type}
                          {mountedStrap && ` • on ${mountedStrap.name}`}
                        </p>
                      </div>

                      <div className="text-right font-mono-tech">
                        <span className="text-sm font-bold text-slate-900 block">
                          ${(currentWatch.marketValueUsd || currentWatch.purchasePriceUsd).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-indigo-600 font-semibold block">
                          ${Math.round(costPerWear)}/wear
                        </span>
                      </div>
                    </div>

                    {/* Carousel Navigation Controller */}
                    <div
                      className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={handlePrevWatchSwipe}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
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
                              i === watchSwipeIndex ? 'w-6 bg-indigo-600' : 'w-2 bg-slate-300'
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={handleNextWatchSwipe}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
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
                    className="p-3 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden shadow-2xs">
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
                          <span className="text-[10px] font-bold text-indigo-600 uppercase font-mono-tech">
                            {watch.brand}
                          </span>
                          {isWotd && (
                            <span className="text-[9px] text-white bg-indigo-600 px-1.5 py-0.2 rounded font-bold font-mono-tech">
                              ON WRIST
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-xs text-slate-900 mt-0.5 truncate max-w-[170px]">
                          {watch.nickname || watch.model}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono-tech mt-1">
                          <span className="text-slate-800 font-semibold">{watch.dimensions.caseDiameterMm}mm</span>
                          <span>•</span>
                          <span>{watch.caliber.type}</span>
                          {mountedStrap && (
                            <>
                              <span>•</span>
                              <span className="text-slate-400 truncate max-w-[90px]">{mountedStrap.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono-tech">
                      <span className="font-bold text-xs text-slate-900 block">
                        ${(watch.marketValueUsd || watch.purchasePriceUsd).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-indigo-600 font-semibold block mt-0.5">
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

      {/* SECTION 2: STRAPS WARDROBE */}
      {boxSection === 'straps' && (
        <div className="space-y-3">
          {/* Straps Header Controls */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shrink-0 shadow-2xs">
                <button
                  onClick={() => setStrapViewMode('swipe')}
                  className={`p-1.5 rounded-xl transition-all ${
                    strapViewMode === 'swipe'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Swipe View"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setStrapViewMode('scroll')}
                  className={`p-1.5 rounded-xl transition-all ${
                    strapViewMode === 'scroll'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Scroll View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => setShowStrapSortMenu(!showStrapSortMenu)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shadow-2xs ${
                  showStrapSortMenu || strapFilterLug !== 'all' || strapFilterMaterial !== 'all'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
                title="Open Strap Filters"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                <span>Filter Straps</span>
                {(strapFilterLug !== 'all' || strapFilterMaterial !== 'all') && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                )}
              </button>
            </div>

            <button
              onClick={() => setShowAddStrapModal(true)}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 rounded-xl hover:bg-indigo-100 transition-colors shrink-0 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Strap</span>
            </button>
          </div>

          {/* Expandable Filter Menu for Straps */}
          {showStrapSortMenu && (
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-3 shadow-md text-xs animate-in fade-in zoom-in-95 duration-150">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5 font-bold font-mono-tech">
                  Lug Width
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['all', '18', '19', '20', '21', '22'].map((lug) => (
                    <button
                      key={lug}
                      onClick={() => setStrapFilterLug(lug)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors ${
                        strapFilterLug === lug
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/80'
                      }`}
                    >
                      {lug === 'all' ? 'All Lugs' : `${lug}mm`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5 font-bold font-mono-tech">
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
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors ${
                        strapFilterMaterial === mat.id
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/80'
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
                    className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-sm cursor-pointer group hover:border-indigo-300 transition-all relative overflow-hidden"
                  >
                    {/* Big Strap Preview Image */}
                    <div className="relative rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 h-52 flex items-center justify-center">
                      <img
                        src={currentStrap.imageUrl}
                        alt={currentStrap.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="bg-white/90 backdrop-blur border border-slate-200 text-slate-800 text-[10px] font-mono-tech px-2.5 py-1 rounded-full font-bold shadow-2xs">
                          {currentStrap.lugWidthMm}mm Lug
                        </span>
                        {currentStrap.waterproof && (
                          <span className="bg-cyan-50 border border-cyan-200 text-cyan-800 text-[10px] font-mono-tech px-2 py-1 rounded-full flex items-center gap-1 font-semibold">
                            <Droplets className="w-3 h-3 text-cyan-600" /> Waterproof
                          </span>
                        )}
                      </div>

                      {/* Mounted Status Badge */}
                      <div className="absolute top-3 right-3">
                        {mountedWatch ? (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full text-[10px] font-mono-tech flex items-center gap-1 shadow-2xs font-semibold">
                            <Check className="w-3 h-3 text-emerald-600" /> Mounted: {mountedWatch.brand}
                          </span>
                        ) : (
                          <span className="bg-white/90 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full text-[10px] font-mono-tech shadow-2xs">
                            In Wardrobe
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Strap Info Details */}
                    <div className="mt-3.5 flex items-start justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider font-mono-tech">
                          {currentStrap.brand}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-0.5">
                          {currentStrap.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                          {currentStrap.material} • {currentStrap.color}
                        </p>
                      </div>

                      <div className="text-right font-mono-tech">
                        <span className="text-sm font-bold text-slate-900">${currentStrap.priceUsd}</span>
                        <span className="text-[10px] text-slate-400 block">
                          Taper: {currentStrap.buckleWidthMm}mm
                        </span>
                      </div>
                    </div>

                    {/* Carousel Navigation Controller */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={handlePrevStrapSwipe}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
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
                              i === strapSwipeIndex ? 'w-6 bg-indigo-600' : 'w-2 bg-slate-300'
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={handleNextStrapSwipe}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
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
                    className="p-3 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={strap.imageUrl}
                        alt={strap.name}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 group-hover:scale-105 transition-transform shadow-2xs"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-indigo-600 uppercase font-mono-tech">{strap.brand}</span>
                          {strap.waterproof && (
                            <span className="text-[9px] text-cyan-800 bg-cyan-50 px-1 rounded flex items-center gap-0.5 font-mono-tech font-semibold">
                              <Droplets className="w-2.5 h-2.5 text-cyan-600" /> Waterproof
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-xs text-slate-900 mt-0.5">{strap.name}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono-tech mt-1">
                          <span className="text-slate-800 font-semibold">{strap.lugWidthMm}mm Lug</span>
                          <span>•</span>
                          <span>{strap.material}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono-tech">
                      <span className="font-bold text-xs text-slate-900 block">${strap.priceUsd}</span>
                      {mountedWatch ? (
                        <span className="text-[9px] text-emerald-600 font-semibold block mt-0.5">Mounted: {mountedWatch.brand}</span>
                      ) : (
                        <span className="text-[9px] text-slate-400 block mt-0.5">In Wardrobe</span>
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
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 w-full max-w-sm space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h4 className="text-sm font-bold text-slate-900">Add Strap to Wardrobe</h4>
              <button onClick={() => setShowAddStrapModal(false)} className="text-slate-400 hover:text-slate-700 text-base font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStrap} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 font-mono-tech font-bold block mb-1">Strap Name</label>
                <input
                  type="text"
                  placeholder="e.g. Delugs Cognac Crazy Horse"
                  value={newStrapName}
                  onChange={(e) => setNewStrapName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-mono-tech font-bold block mb-1">Brand / Atelier</label>
                  <input
                    type="text"
                    placeholder="e.g. Artem Straps"
                    value={newStrapBrand}
                    onChange={(e) => setNewStrapBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-mono-tech font-bold block mb-1">Material</label>
                  <select
                    value={newStrapMaterial}
                    onChange={(e) => setNewStrapMaterial(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-indigo-500"
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
                  <label className="text-[10px] text-slate-500 font-mono-tech font-bold block mb-1">Lug Width</label>
                  <select
                    value={newStrapLugWidth}
                    onChange={(e) => setNewStrapLugWidth(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-indigo-500"
                  >
                    <option value={18}>18mm</option>
                    <option value={19}>19mm</option>
                    <option value={20}>20mm</option>
                    <option value={21}>21mm</option>
                    <option value={22}>22mm</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-mono-tech font-bold block mb-1">Buckle (mm)</label>
                  <input
                    type="number"
                    value={newStrapBuckleWidth}
                    onChange={(e) => setNewStrapBuckleWidth(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-mono-tech font-bold block mb-1">Price ($)</label>
                  <input
                    type="number"
                    value={newStrapPrice}
                    onChange={(e) => setNewStrapPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 text-[11px] text-slate-700">
                  <input
                    type="checkbox"
                    checked={newStrapQuickRelease}
                    onChange={(e) => setNewStrapQuickRelease(e.target.checked)}
                    className="accent-indigo-600"
                  />
                  <span>Quick Release</span>
                </label>
                <label className="flex items-center gap-1.5 text-[11px] text-slate-700">
                  <input
                    type="checkbox"
                    checked={newStrapWaterproof}
                    onChange={(e) => setNewStrapWaterproof(e.target.checked)}
                    className="accent-indigo-600"
                  />
                  <span>Waterproof</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl mt-2 hover:bg-indigo-500 transition-colors shadow-sm"
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

