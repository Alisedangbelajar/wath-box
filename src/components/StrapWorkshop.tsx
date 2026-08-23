import React, { useState } from 'react';
import { 
  Disc, 
  Check, 
  Sparkles, 
  Sliders, 
  Layers, 
  ArrowRightLeft, 
  Droplets, 
  ShieldCheck, 
  Plus,
  AlertCircle
} from 'lucide-react';
import { StrapItem, WatchItem } from '../types';
import confetti from 'canvas-confetti';

interface StrapWorkshopProps {
  straps: StrapItem[];
  watches: WatchItem[];
  onMountStrap: (watchId: string, strapId: string) => void;
  onAddStrap: (strap: Omit<StrapItem, 'id'>) => void;
}

export const StrapWorkshop: React.FC<StrapWorkshopProps> = ({
  straps,
  watches,
  onMountStrap,
  onAddStrap,
}) => {
  const [selectedWatchId, setSelectedWatchId] = useState<string>(watches[0]?.id || '');
  const [selectedStrapId, setSelectedStrapId] = useState<string>(straps[0]?.id || '');
  const [filterLugWidth, setFilterLugWidth] = useState<string>('all');
  const [filterMaterial, setFilterMaterial] = useState<string>('all');
  const [showAddStrapModal, setShowAddStrapModal] = useState<boolean>(false);

  // New Strap Form State
  const [newName, setNewName] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newMaterial, setNewMaterial] = useState<StrapItem['material']>('Horween Leather');
  const [newColor, setNewColor] = useState('');
  const [newLugWidth, setNewLugWidth] = useState<number>(20);
  const [newBuckleWidth, setNewBuckleWidth] = useState<number>(18);
  const [newQuickRelease, setNewQuickRelease] = useState<boolean>(true);
  const [newWaterproof, setNewWaterproof] = useState<boolean>(false);
  const [newPrice, setNewPrice] = useState<number>(85);

  const selectedWatch = watches.find((w) => w.id === selectedWatchId) || watches[0];
  const selectedStrap = straps.find((s) => s.id === selectedStrapId) || straps[0];

  const isCompatible = selectedWatch && selectedStrap && Math.round(selectedWatch.dimensions.lugWidthMm) === selectedStrap.lugWidthMm;
  const isCurrentlyMounted = selectedWatch && selectedWatch.currentStrapId === selectedStrap?.id;

  const filteredStraps = straps.filter((s) => {
    const matchesLug = filterLugWidth === 'all' || String(s.lugWidthMm) === filterLugWidth;
    const matchesMat = filterMaterial === 'all' || s.material === filterMaterial;
    return matchesLug && matchesMat;
  });

  const handleMount = () => {
    if (!selectedWatch || !selectedStrap) return;
    onMountStrap(selectedWatch.id, selectedStrap.id);
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#3b82f6', '#f59e0b', '#10b981'],
    });
  };

  const handleCreateStrap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    onAddStrap({
      name: newName,
      brand: newBrand || 'Independent Atelier',
      material: newMaterial,
      color: newColor || 'Vintage Black',
      lugWidthMm: Number(newLugWidth),
      buckleWidthMm: Number(newBuckleWidth),
      quickRelease: newQuickRelease,
      waterproof: newWaterproof,
      imageUrl: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=400&q=80',
      priceUsd: Number(newPrice),
      acquiredDate: new Date().toISOString().split('T')[0],
    });

    setShowAddStrapModal(false);
    setNewName('');
  };

  return (
    <div className="p-4 space-y-4">
      {/* Top Fitting Studio Canvas */}
      <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 rounded-2xl border border-neutral-800 p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono-tech uppercase">
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Strap Fitting Stage</span>
          </div>
          {isCompatible ? (
            <span className="text-[10px] font-mono-tech text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Check className="w-3 h-3" /> Compatible ({selectedStrap?.lugWidthMm}mm Lug)
            </span>
          ) : (
            <span className="text-[10px] font-mono-tech text-amber-400 bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Lug Mismatch ({selectedWatch?.dimensions.lugWidthMm}mm vs {selectedStrap?.lugWidthMm}mm)
            </span>
          )}
        </div>

        {/* Live Fitting Visualizer */}
        <div className="bg-neutral-950 rounded-xl p-4 border border-neutral-800 flex flex-col items-center justify-center relative overflow-hidden min-h-[190px]">
          {/* Top Strap Segment Graphic */}
          <div 
            className="w-16 h-12 rounded-t-lg bg-neutral-800 border-x border-t border-neutral-700 shadow-inner flex items-center justify-center relative"
            style={{
              backgroundColor: selectedStrap?.color.includes('Brown') || selectedStrap?.color.includes('Cognac') ? '#78350f' : '#262626',
            }}
          >
            <div className="w-full h-full bg-black/20" />
            <div className="absolute top-1 text-[8px] font-mono-tech text-white/50">{selectedStrap?.lugWidthMm}mm</div>
          </div>

          {/* Watch Head */}
          <div className="relative z-10 my-1">
            <img
              src={selectedWatch?.imageUrl}
              alt={selectedWatch?.model}
              className="w-24 h-24 rounded-full object-cover border-2 border-neutral-600 shadow-2xl ring-4 ring-neutral-950"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Bottom Strap Segment Graphic */}
          <div 
            className="w-14 h-16 rounded-b-xl bg-neutral-800 border-x border-b border-neutral-700 shadow-inner flex flex-col items-center justify-between p-1"
            style={{
              backgroundColor: selectedStrap?.color.includes('Brown') || selectedStrap?.color.includes('Cognac') ? '#78350f' : '#262626',
            }}
          >
            <div className="w-1 h-3 rounded-full bg-black/40 mt-1" />
            <div className="w-6 h-3 rounded-xs border border-amber-400/80 bg-neutral-900 text-[7px] text-amber-300 font-mono-tech text-center">
              {selectedStrap?.buckleWidthMm}mm
            </div>
          </div>

          {/* Label Floating Tag */}
          <div className="mt-3 text-center">
            <h4 className="text-xs font-bold text-neutral-100 font-serif-luxury">
              {selectedWatch?.brand} {selectedWatch?.nickname || selectedWatch?.model}
            </h4>
            <p className="text-[10px] text-amber-400 font-mono-tech mt-0.5">
              + {selectedStrap?.brand} {selectedStrap?.name}
            </p>
          </div>
        </div>

        {/* Mount Action Button */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] font-mono-tech text-neutral-400">
            Current: <strong className="text-neutral-200">{isCurrentlyMounted ? 'Mounted on Watch' : 'Available in Wardrobe'}</strong>
          </div>

          <button
            onClick={handleMount}
            disabled={!isCompatible || isCurrentlyMounted}
            className={`px-4 py-2 rounded-xl text-xs font-mono-tech font-bold transition-all ${
              isCurrentlyMounted
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : isCompatible
                ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md active:scale-95'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
          >
            {isCurrentlyMounted ? 'Mounted' : 'Mount to Watch'}
          </button>
        </div>
      </div>

      {/* Select Watch Target */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-neutral-400 font-mono-tech uppercase block">
          1. Select Watch Target:
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {watches.map((w) => {
            const isSelected = w.id === selectedWatch?.id;
            return (
              <button
                key={w.id}
                onClick={() => setSelectedWatchId(w.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border shrink-0 transition-all text-xs ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-md font-semibold'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div>
                  <div className="text-[9px] uppercase font-mono-tech text-amber-400/80">{w.brand}</div>
                  <div className="truncate max-w-[100px]">{w.nickname || w.model}</div>
                  <div className="text-[9px] text-neutral-500 font-mono-tech">{w.dimensions.lugWidthMm}mm Lug</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Strap Wardrobe Header & Filters */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono-tech uppercase">
            <Disc className="w-3.5 h-3.5 text-amber-400" />
            <span>2. Strap Wardrobe ({straps.length})</span>
          </div>

          <button
            onClick={() => setShowAddStrapModal(true)}
            className="flex items-center gap-1 text-[10px] font-mono-tech text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md hover:bg-amber-500/20 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Add Strap</span>
          </button>
        </div>

        {/* Filter Lug & Material */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <select
            value={filterLugWidth}
            onChange={(e) => setFilterLugWidth(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Lug Widths</option>
            <option value="19">19mm</option>
            <option value="20">20mm</option>
            <option value="21">21mm</option>
            <option value="22">22mm</option>
          </select>

          <select
            value={filterMaterial}
            onChange={(e) => setFilterMaterial(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Materials</option>
            <option value="Horween Leather">Horween Leather</option>
            <option value="NATO Nylon">NATO Nylon</option>
            <option value="Tropic FKM Rubber">Tropic Rubber</option>
            <option value="Sailcloth">Sailcloth</option>
            <option value="Milanese Mesh">Mesh Bracelet</option>
            <option value="Oyster Steel">Steel Bracelet</option>
            <option value="Alligator">Alligator</option>
          </select>
        </div>
      </div>

      {/* Strap List Grid */}
      <div className="grid grid-cols-1 gap-2.5">
        {filteredStraps.map((strap) => {
          const isSelected = strap.id === selectedStrap?.id;
          const fitsCurrentWatch = selectedWatch && Math.round(selectedWatch.dimensions.lugWidthMm) === strap.lugWidthMm;

          return (
            <div
              key={strap.id}
              onClick={() => setSelectedStrapId(strap.id)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500/80 shadow-md ring-1 ring-amber-500/50'
                  : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={strap.imageUrl}
                  alt={strap.name}
                  className="w-12 h-12 rounded-xl object-cover border border-neutral-800 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono-tech text-amber-400 font-semibold uppercase">{strap.brand}</span>
                    {strap.waterproof && (
                      <span className="text-[9px] text-cyan-400 bg-cyan-950/60 px-1 rounded flex items-center gap-0.5">
                        <Droplets className="w-2.5 h-2.5" /> Waterproof
                      </span>
                    )}
                  </div>
                  <h4 className="font-medium text-xs text-neutral-100 mt-0.5">{strap.name}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono-tech mt-1">
                    <span>{strap.lugWidthMm}mm / {strap.buckleWidthMm}mm</span>
                    <span>•</span>
                    <span>{strap.material}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono-tech font-bold text-xs text-neutral-200 block">${strap.priceUsd}</span>
                {fitsCurrentWatch ? (
                  <span className="text-[9px] text-emerald-400 font-mono-tech">Fits {selectedWatch?.brand}</span>
                ) : (
                  <span className="text-[9px] text-neutral-500 font-mono-tech">{strap.lugWidthMm}mm</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Strap Modal */}
      {showAddStrapModal && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-4 w-full max-w-sm space-y-3">
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
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-neutral-400 font-mono-tech block mb-1">Brand / Maker</label>
                  <input
                    type="text"
                    placeholder="e.g. Artem Straps"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 font-mono-tech block mb-1">Material</label>
                  <select
                    value={newMaterial}
                    onChange={(e) => setNewMaterial(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200"
                  >
                    <option value="Horween Leather">Horween Leather</option>
                    <option value="NATO Nylon">NATO Nylon</option>
                    <option value="Tropic FKM Rubber">Tropic Rubber</option>
                    <option value="Sailcloth">Sailcloth</option>
                    <option value="Milanese Mesh">Mesh Bracelet</option>
                    <option value="Alligator">Alligator</option>
                    <option value="Suede">Suede</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-neutral-400 font-mono-tech block mb-1">Lug Width</label>
                  <select
                    value={newLugWidth}
                    onChange={(e) => setNewLugWidth(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200"
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
                    value={newBuckleWidth}
                    onChange={(e) => setNewBuckleWidth(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 font-mono-tech block mb-1">Price ($)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 text-[11px] text-neutral-300">
                  <input
                    type="checkbox"
                    checked={newQuickRelease}
                    onChange={(e) => setNewQuickRelease(e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span>Quick Release</span>
                </label>
                <label className="flex items-center gap-1.5 text-[11px] text-neutral-300">
                  <input
                    type="checkbox"
                    checked={newWaterproof}
                    onChange={(e) => setNewWaterproof(e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span>Waterproof</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-amber-500 text-neutral-950 font-bold rounded-xl font-mono-tech mt-2 hover:bg-amber-400"
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
