import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  Plus, 
  Image as ImageIcon, 
  Star, 
  Droplets, 
  Camera, 
  Compass, 
  Award,
  ChevronRight,
  Maximize2,
  X,
  Shuffle
} from 'lucide-react';
import { WatchItem, StrapItem, WearLogEntry, WearOccasion } from '../types';
import { calculateWatchCostPerWear, getDaysSinceLastWorn } from '../utils/calculations';
import { WatchDialCanvas } from './WatchDialCanvas';
import confetti from 'canvas-confetti';

interface WotdLoggerProps {
  watches: WatchItem[];
  straps: StrapItem[];
  wearLogs: WearLogEntry[];
  todayWotdId: string | null;
  onSetWotd: (watchId: string) => void;
  onLogWear: (entry: Omit<WearLogEntry, 'id' | 'timestamp'>) => void;
  onSelectWatch: (watch: WatchItem) => void;
  onMountStrap: (watchId: string, strapId: string) => void;
  onOpenPhotoModal?: () => void;
}

export const WotdLogger: React.FC<WotdLoggerProps> = ({
  watches,
  straps,
  wearLogs,
  todayWotdId,
  onSetWotd,
  onLogWear,
  onSelectWatch,
  onMountStrap,
  onOpenPhotoModal,
}) => {
  // Active WOTD Watch
  const currentWotdWatch = watches.find((w) => w.id === todayWotdId) || watches[0];
  const currentMountedStrap = straps.find((s) => s.id === currentWotdWatch?.currentStrapId);

  // Form State for Logging Wear
  const [selectedWatchId, setSelectedWatchId] = useState<string>(todayWotdId || watches[0]?.id || '');
  const [selectedStrapId, setSelectedStrapId] = useState<string>(
    watches.find((w) => w.id === selectedWatchId)?.currentStrapId || straps[0]?.id || ''
  );
  const [selectedOccasion, setSelectedOccasion] = useState<WearOccasion>('Daily / Office');
  const [rating, setRating] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const [showLogForm, setShowLogForm] = useState<boolean>(false);

  // Image Zoom Modal State
  const [zoomedPhoto, setZoomedPhoto] = useState<{ url: string; title: string; subtitle: string } | null>(null);

  // Smart Rotation Recommender State
  const [recommendOccasion, setRecommendOccasion] = useState<WearOccasion | 'neglect'>('neglect');
  const [recommendationResult, setRecommendationResult] = useState<{
    watch: WatchItem;
    strap?: StrapItem;
    reason: string;
    scoreExplanation: string;
  } | null>(null);

  // Neglected Watches calculation
  const neglectedWatches = watches
    .map((w) => ({
      watch: w,
      days: getDaysSinceLastWorn(w.lastWornTimestamp),
      costPerWear: calculateWatchCostPerWear(w),
    }))
    .filter((item) => item.days > 14)
    .sort((a, b) => b.days - a.days);

  // Cost-per-wear ranked watches
  const cpwRanked = [...watches].sort((a, b) => {
    return calculateWatchCostPerWear(b) - calculateWatchCostPerWear(a);
  });

  // Calculate Smart Recommendation
  const generateRecommendation = (occasion: WearOccasion | 'neglect') => {
    if (watches.length === 0) return;

    let candidateWatches = [...watches];
    let chosenWatch: WatchItem;
    let chosenStrap: StrapItem | undefined;
    let reasonText = '';
    let scoreText = '';

    if (occasion === 'neglect') {
      // Find watch with the longest idle time
      candidateWatches.sort((a, b) => {
        const daysA = getDaysSinceLastWorn(a.lastWornTimestamp);
        const daysB = getDaysSinceLastWorn(b.lastWornTimestamp);
        return daysB - daysA;
      });
      chosenWatch = candidateWatches[0];
      const days = getDaysSinceLastWorn(chosenWatch.lastWornTimestamp);
      reasonText = `Neglect Priority: Idle for ${days} days without wrist time.`;
      scoreText = `Brings down its $${Math.round(calculateWatchCostPerWear(chosenWatch))}/wear amortization and exercises the mainspring.`;
    } else if (occasion === 'Dress / Formal') {
      // Prioritize slim profile, dress style, or longest idle among dressier pieces
      const dressy = candidateWatches.filter((w) => 
        w.dimensions.thicknessMm < 12 || w.brand.includes('Cartier') || w.brand.includes('Grand Seiko') || w.model.includes('Dress')
      );
      chosenWatch = dressy.length > 0 ? dressy[0] : candidateWatches[0];
      reasonText = `Formal Profile: ${chosenWatch.dimensions.thicknessMm}mm slim profile slips under French cuffs effortlessly.`;
      scoreText = `Refined dial finish matching bespoke evening attire.`;
    } else if (occasion === 'Sport / Outdoor' || occasion === 'Travel') {
      // Prioritize higher water resistance (>100m)
      const tough = candidateWatches.filter((w) => w.waterResistanceMeters >= 100);
      chosenWatch = tough.length > 0 ? tough[0] : candidateWatches[0];
      reasonText = `High Durability: ${chosenWatch.waterResistanceMeters}m water resistance rated for exposure.`;
      scoreText = `Robust case construction engineered for shock & ambient humidity.`;
    } else {
      // Daily / Weekend
      candidateWatches.sort((a, b) => getDaysSinceLastWorn(b.lastWornTimestamp) - getDaysSinceLastWorn(a.lastWornTimestamp));
      chosenWatch = candidateWatches[0];
      const days = getDaysSinceLastWorn(chosenWatch.lastWornTimestamp);
      reasonText = `Rotation Harmony: ${days} days since last worn. Versatile for all-day comfort.`;
      scoreText = `Balanced ${chosenWatch.dimensions.caseDiameterMm}mm case diameter.`;
    }

    // Find compatible strap from wardrobe (matching lug width)
    const matchingStraps = straps.filter(
      (s) => Math.round(s.lugWidthMm) === Math.round(chosenWatch.dimensions.lugWidthMm)
    );
    if (matchingStraps.length > 0) {
      if (occasion === 'Sport / Outdoor') {
        const rubberOrNato = matchingStraps.find((s) => s.waterproof || s.material.includes('Rubber') || s.material.includes('NATO'));
        chosenStrap = rubberOrNato || matchingStraps[0];
      } else if (occasion === 'Dress / Formal') {
        const leather = matchingStraps.find((s) => s.material.includes('Leather') || s.material.includes('Alligator'));
        chosenStrap = leather || matchingStraps[0];
      } else {
        chosenStrap = matchingStraps.find((s) => s.id === chosenWatch.currentStrapId) || matchingStraps[0];
      }
    }

    setRecommendationResult({
      watch: chosenWatch,
      strap: chosenStrap,
      reason: reasonText,
      scoreExplanation: scoreText,
    });
  };

  const handleApplyRecommendation = () => {
    if (!recommendationResult) return;
    onSetWotd(recommendationResult.watch.id);
    if (recommendationResult.strap && recommendationResult.watch.currentStrapId !== recommendationResult.strap.id) {
      onMountStrap(recommendationResult.watch.id, recommendationResult.strap.id);
    }
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#f59e0b', '#fbbf24', '#10b981'],
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAttachedPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWatchId) return;

    onLogWear({
      dateStr: 'Today',
      watchId: selectedWatchId,
      strapId: selectedStrapId || undefined,
      occasion: selectedOccasion,
      rating,
      notes: notes || undefined,
      photoUrl: attachedPhoto || undefined,
    });

    onSetWotd(selectedWatchId);

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.75 },
      colors: ['#f59e0b', '#d97706', '#fbbf24'],
    });

    setNotes('');
    setAttachedPhoto(null);
    setShowLogForm(false);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header & Quick Action */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono-tech tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Wrist Time & Journal</span>
          </div>
          <h1 className="font-serif-luxury text-xl text-neutral-100 font-bold tracking-wide mt-0.5">
            Watch Rotation
          </h1>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowLogForm(!showLogForm)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 transition-colors text-xs font-mono-tech font-semibold"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>{showLogForm ? 'Close Log' : 'Log Wear'}</span>
          </button>
        </div>
      </div>

      {/* TODAY'S CURRENT PIECE ON WRIST */}
      {currentWotdWatch && (
        <div className="bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800 rounded-3xl p-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="font-mono-tech text-xs text-amber-400 font-bold uppercase tracking-wider">
                Wearing today
              </span>
            </div>
            <span className="font-mono-tech text-[10px] text-neutral-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="flex items-center gap-3.5 mt-1">
            {/* Live Sweeping Dial Canvas */}
            <div 
              onClick={() => onSelectWatch(currentWotdWatch)}
              className="cursor-pointer hover:scale-105 transition-transform shrink-0"
              title="Tap to inspect watch dossier"
            >
              <WatchDialCanvas
                brand={currentWotdWatch.brand}
                model={currentWotdWatch.nickname || currentWotdWatch.model}
                caliberType={currentWotdWatch.caliber.type}
                vph={currentWotdWatch.caliber.frequencyVph}
                size={88}
              />
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-mono-tech text-amber-400 uppercase tracking-widest block font-semibold truncate">
                {currentWotdWatch.brand}
              </span>
              <h2 
                onClick={() => onSelectWatch(currentWotdWatch)}
                className="font-serif-luxury text-base font-bold text-neutral-100 truncate cursor-pointer hover:text-amber-300 transition-colors"
              >
                {currentWotdWatch.nickname || currentWotdWatch.model}
              </h2>
              
              <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-mono-tech text-neutral-400">
                <span className="text-neutral-300">{currentWotdWatch.dimensions.caseDiameterMm}mm</span>
                <span>•</span>
                <span className="text-amber-300">${Math.round(calculateWatchCostPerWear(currentWotdWatch))}/wear</span>
                {currentMountedStrap && (
                  <>
                    <span>•</span>
                    <span className="text-neutral-400 truncate max-w-[140px]">{currentMountedStrap.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SMART ROTATION RECOMMENDER ("What Should I Wear Today?") */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-serif-luxury text-xs font-bold text-neutral-100">
                Horology Concierge
              </h3>
              <p className="text-[10px] text-neutral-400 font-mono-tech">
                rotation recommendation
              </p>
            </div>
          </div>

          <button
            onClick={() => generateRecommendation(recommendOccasion)}
            className="flex items-center gap-1 text-[11px] font-mono-tech text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-xl transition-all"
          >
            <Shuffle className="w-3 h-3 text-amber-400" />
            <span>Generate Pick</span>
          </button>
        </div>

        {/* Occasion Filter Chips - One Word Only */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-mono-tech no-scrollbar">
          <button
            onClick={() => {
              setRecommendOccasion('neglect');
              generateRecommendation('neglect');
            }}
            className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all ${
              recommendOccasion === 'neglect'
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Neglect
          </button>

          <button
            onClick={() => {
              setRecommendOccasion('Daily / Office');
              generateRecommendation('Daily / Office');
            }}
            className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all ${
              recommendOccasion === 'Daily / Office'
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Office
          </button>

          <button
            onClick={() => {
              setRecommendOccasion('Casual / Weekend');
              generateRecommendation('Casual / Weekend');
            }}
            className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all ${
              recommendOccasion === 'Casual / Weekend'
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Weekend
          </button>

          <button
            onClick={() => {
              setRecommendOccasion('Dress / Formal');
              generateRecommendation('Dress / Formal');
            }}
            className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all ${
              recommendOccasion === 'Dress / Formal'
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Formal
          </button>

          <button
            onClick={() => {
              setRecommendOccasion('Sport / Outdoor');
              generateRecommendation('Sport / Outdoor');
            }}
            className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all ${
              recommendOccasion === 'Sport / Outdoor'
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Sport
          </button>

          <button
            onClick={() => {
              setRecommendOccasion('Travel');
              generateRecommendation('Travel');
            }}
            className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all ${
              recommendOccasion === 'Travel'
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Travel
          </button>
        </div>

        {/* Recommender Result Display */}
        {recommendationResult && (
          <div className="bg-neutral-950/80 border border-amber-500/30 rounded-2xl p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div 
                  onClick={() => onSelectWatch(recommendationResult.watch)}
                  className="cursor-pointer hover:scale-105 transition-transform"
                >
                  <WatchDialCanvas
                    brand={recommendationResult.watch.brand}
                    model={recommendationResult.watch.nickname || recommendationResult.watch.model}
                    caliberType={recommendationResult.watch.caliber.type}
                    vph={recommendationResult.watch.caliber.frequencyVph}
                    size={64}
                  />
                </div>
                <div>
                  <span className="text-[9px] text-amber-400 font-mono-tech uppercase block">
                    Recommended Match
                  </span>
                  <h4 className="font-serif-luxury text-sm font-bold text-neutral-100">
                    {recommendationResult.watch.brand} {recommendationResult.watch.nickname || recommendationResult.watch.model}
                  </h4>
                  {recommendationResult.strap && (
                    <p className="text-[10px] text-neutral-400 font-mono-tech mt-0.5">
                      Paired with: <span className="text-amber-300">{recommendationResult.strap.name}</span>
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={handleApplyRecommendation}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-mono-tech text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Wear Today</span>
              </button>
            </div>

            <div className="pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-300 font-sans space-y-0.5">
              <p className="text-amber-200/90 font-medium">✦ {recommendationResult.reason}</p>
              <p className="text-[10px] text-neutral-400 font-mono-tech">{recommendationResult.scoreExplanation}</p>
            </div>
          </div>
        )}
      </div>

      {/* LOG WEAR FORM (Expandable) */}
      {showLogForm && (
        <form onSubmit={handleLogSubmit} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <h3 className="font-serif-luxury text-xs font-bold text-amber-300">
              Log Wrist Check Entry
            </h3>
            <button
              type="button"
              onClick={() => setShowLogForm(false)}
              className="text-neutral-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] font-mono-tech text-neutral-400 block mb-1">Timepiece</label>
              <select
                value={selectedWatchId}
                onChange={(e) => {
                  setSelectedWatchId(e.target.value);
                  const w = watches.find((watch) => watch.id === e.target.value);
                  if (w && w.currentStrapId) setSelectedStrapId(w.currentStrapId);
                }}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-neutral-200 text-[11px] font-mono-tech focus:outline-none focus:border-amber-500"
              >
                {watches.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.brand} - {w.nickname || w.model}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono-tech text-neutral-400 block mb-1">Strap / Bracelet</label>
              <select
                value={selectedStrapId}
                onChange={(e) => setSelectedStrapId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-neutral-200 text-[11px] font-mono-tech focus:outline-none focus:border-amber-500"
              >
                {straps.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.lugWidthMm}mm)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] font-mono-tech text-neutral-400 block mb-1">Occasion</label>
              <select
                value={selectedOccasion}
                onChange={(e) => setSelectedOccasion(e.target.value as WearOccasion)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-neutral-200 text-[11px] font-mono-tech focus:outline-none focus:border-amber-500"
              >
                <option value="Daily / Office">Daily / Office</option>
                <option value="Casual / Weekend">Casual / Weekend</option>
                <option value="Dress / Formal">Dress / Formal</option>
                <option value="Sport / Outdoor">Sport / Outdoor</option>
                <option value="Travel / Active">Travel / Active</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono-tech text-neutral-400 block mb-1">Satisfaction Rating</label>
              <div className="flex items-center gap-1 bg-neutral-950 border border-neutral-800 rounded-xl p-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        star <= rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono-tech text-neutral-400 block mb-1">Collector Notes</label>
            <input
              type="text"
              placeholder="e.g. Adjusted glidelock 2mm for warm afternoon..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Photo Attachment Row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 cursor-pointer text-[11px] font-mono-tech text-neutral-300">
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>{attachedPhoto ? 'Change Photo' : 'Attach Wrist Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              {attachedPhoto && (
                <div className="flex items-center gap-1.5">
                  <img
                    src={attachedPhoto}
                    alt="Uploaded wrist preview"
                    className="w-8 h-8 rounded-lg object-cover border border-amber-400/50"
                  />
                  <button
                    type="button"
                    onClick={() => setAttachedPhoto(null)}
                    className="text-neutral-500 hover:text-neutral-300 text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold font-mono-tech text-xs transition-all shadow-md"
            >
              Save Wear Entry
            </button>
          </div>
        </form>
      )}

      {/* NEGLECTED WATCHES ALERT */}
      {neglectedWatches.length > 0 && (
        <div id="neglected-watches-alert" className="bg-amber-950/20 border border-amber-500/40 rounded-3xl p-4 space-y-2.5 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-mono-tech text-xs font-bold uppercase">
                Idle & Neglected Timepieces ({neglectedWatches.length})
              </span>
            </div>
            <span className="text-[10px] text-amber-300/80 font-mono-tech">
              &gt; 14 days without wear
            </span>
          </div>

          <div className="space-y-2">
            {neglectedWatches.map(({ watch, days, costPerWear }) => (
              <div
                key={watch.id}
                className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-2.5 flex items-center justify-between gap-2"
              >
                <div 
                  onClick={() => onSelectWatch(watch)}
                  className="flex items-center gap-2.5 cursor-pointer min-w-0"
                >
                  <WatchDialCanvas
                    brand={watch.brand}
                    model={watch.nickname || watch.model}
                    caliberType={watch.caliber.type}
                    vph={watch.caliber.frequencyVph}
                    size={42}
                  />
                  <div className="min-w-0">
                    <h4 className="font-medium text-xs text-neutral-100 truncate">
                      {watch.brand} {watch.nickname || watch.model}
                    </h4>
                    <span className="text-[10px] text-amber-400 font-mono-tech block">
                      Not worn in {days} days • ${Math.round(costPerWear)}/wear
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSetWotd(watch.id);
                    confetti({
                      particleCount: 30,
                      spread: 50,
                      origin: { y: 0.8 },
                      colors: ['#f59e0b', '#10b981'],
                    });
                  }}
                  className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-mono-tech text-[10px] font-semibold shrink-0"
                >
                  + Rotate Today
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WRIST CHECK DAILY JOURNAL (Photo-First Feed) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <h3 className="font-serif-luxury text-sm font-bold text-neutral-100">
              Wrist Check Daily Journal
            </h3>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono-tech">
            {wearLogs.length} Total Logs
          </span>
        </div>

        <div className="space-y-3">
          {wearLogs.map((log) => {
            const watch = watches.find((w) => w.id === log.watchId);
            const strap = straps.find((s) => s.id === log.strapId);
            if (!watch) return null;

            return (
              <div
                key={log.id}
                className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden shadow-lg hover:border-neutral-700 transition-all"
              >
                {/* Large Wrist Photo Preview if Present */}
                {log.photoUrl && (
                  <div 
                    onClick={() => setZoomedPhoto({
                      url: log.photoUrl!,
                      title: `${watch.brand} - ${watch.nickname || watch.model}`,
                      subtitle: `${log.dateStr} • ${log.occasion} • ${strap?.name || 'Standard Strap'}`
                    })}
                    className="relative h-44 w-full bg-neutral-950 cursor-pointer group overflow-hidden"
                  >
                    <img
                      src={log.photoUrl}
                      alt={`${watch.brand} on wrist`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/30 pointer-events-none" />
                    <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white p-1.5 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
                    </div>
                    <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5">
                      <span className="bg-neutral-950/80 backdrop-blur text-amber-300 text-[10px] font-mono-tech px-2.5 py-0.5 rounded-full border border-neutral-800">
                        {log.occasion}
                      </span>
                      {strap && (
                        <span className="bg-neutral-900/80 backdrop-blur text-neutral-300 text-[10px] font-mono-tech px-2 py-0.5 rounded-full border border-neutral-800 truncate max-w-[140px]">
                          {strap.name}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Log Entry Details */}
                <div className="p-3.5 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {!log.photoUrl && (
                      <div 
                        onClick={() => onSelectWatch(watch)}
                        className="cursor-pointer shrink-0"
                      >
                        <WatchDialCanvas
                          brand={watch.brand}
                          model={watch.nickname || watch.model}
                          caliberType={watch.caliber.type}
                          vph={watch.caliber.frequencyVph}
                          size={46}
                        />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono-tech text-amber-400 font-semibold uppercase">
                          {watch.brand}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono-tech">
                          {log.dateStr}
                        </span>
                      </div>

                      <h4 
                        onClick={() => onSelectWatch(watch)}
                        className="font-medium text-xs text-neutral-100 cursor-pointer hover:text-amber-300 transition-colors mt-0.5"
                      >
                        {watch.nickname || watch.model}
                      </h4>

                      {log.notes && (
                        <p className="text-[11px] text-neutral-400 font-sans mt-1 italic">
                          "{log.notes}"
                        </p>
                      )}

                      {!log.photoUrl && strap && (
                        <span className="text-[10px] text-neutral-500 font-mono-tech block mt-1">
                          Mounted on: {strap.name} ({strap.material})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-0.5">
                      {Array.from({ length: log.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[9px] text-neutral-500 font-mono-tech block mt-1">
                      {log.occasion}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* REAL COST-PER-WEAR LEADERBOARD */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-amber-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <h3 className="font-serif-luxury text-xs font-bold uppercase tracking-wider text-neutral-200">
              Cost-Per-Wear Optimization
            </h3>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono-tech">Purchase Price / Total Days Worn</span>
        </div>

        <div className="space-y-2">
          {cpwRanked.map((watch, idx) => {
            const cpw = calculateWatchCostPerWear(watch);
            const totalWears = watch.wearCount || 1;

            return (
              <div
                key={watch.id}
                onClick={() => onSelectWatch(watch)}
                className="bg-neutral-950/70 border border-neutral-800/80 rounded-2xl p-2.5 flex items-center justify-between cursor-pointer hover:border-amber-500/50 transition-all text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 font-mono-tech font-bold text-neutral-500 text-[11px]">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="font-medium text-neutral-200 truncate max-w-[170px]">
                      {watch.brand} {watch.nickname || watch.model}
                    </h4>
                    <span className="text-[10px] text-neutral-500 font-mono-tech">
                      {totalWears} logged wears • ${watch.purchasePriceUsd.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono-tech">
                  <span className="font-bold text-amber-300 text-xs">${Math.round(cpw)}</span>
                  <span className="text-[9px] text-neutral-500 block">per wear</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FULL WRIST PHOTO EXPAND MODAL */}
      {zoomedPhoto && (
        <div 
          onClick={() => setZoomedPhoto(null)}
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden max-w-md w-full shadow-2xl space-y-3"
          >
            <div className="relative">
              <img
                src={zoomedPhoto.url}
                alt="Zoomed wrist check"
                className="w-full max-h-[60vh] object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setZoomedPhoto(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 pt-1">
              <h4 className="font-serif-luxury text-base font-bold text-neutral-100">
                {zoomedPhoto.title}
              </h4>
              <p className="text-xs text-neutral-400 font-mono-tech mt-1">
                {zoomedPhoto.subtitle}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
