import React, { useState } from 'react';
import { 
  Disc, 
  Check, 
  Droplets, 
  ShieldCheck, 
  Watch, 
  ArrowRightLeft,
  Sparkles,
  Pencil
} from 'lucide-react';
import { StrapItem, WatchItem } from '../types';
import confetti from 'canvas-confetti';
import { BottomSheet } from './BottomSheet';
import { EditStrapModal } from './EditStrapModal';

interface StrapDetailModalProps {
  strap: StrapItem | null;
  watches: WatchItem[];
  onClose: () => void;
  onMountStrap: (watchId: string, strapId: string) => void;
  onUpdateStrap?: (updatedStrap: StrapItem) => void;
  onDeleteStrap?: (strapId: string) => void;
}

export const StrapDetailModal: React.FC<StrapDetailModalProps> = ({
  strap,
  watches,
  onClose,
  onMountStrap,
  onUpdateStrap,
  onDeleteStrap,
}) => {
  if (!strap) return null;

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTargetWatchId, setSelectedTargetWatchId] = useState<string>(
    watches.find((w) => w.currentStrapId === strap.id)?.id || watches[0]?.id || ''
  );

  const mountedWatch = watches.find((w) => w.currentStrapId === strap.id);
  const targetWatch = watches.find((w) => w.id === selectedTargetWatchId) || watches[0];
  const isCompatibleWithTarget = targetWatch && Math.round(targetWatch.dimensions.lugWidthMm) === strap.lugWidthMm;
  const isCurrentlyMountedOnTarget = targetWatch && targetWatch.currentStrapId === strap.id;

  const handleMount = () => {
    if (!targetWatch || !isCompatibleWithTarget) return;
    onMountStrap(targetWatch.id, strap.id);
    confetti({
      particleCount: 35,
      spread: 55,
      origin: { y: 0.8 },
      colors: ['#f59e0b', '#10b981', '#3b82f6'],
    });
  };

  return (
    <>
      <BottomSheet
        isOpen={!!strap}
        onClose={onClose}
        title={strap.name}
        subtitle={`${strap.brand} • ${strap.lugWidthMm}mm Lug`}
        icon={<Disc className="w-4 h-4" />}
        headerAction={
          <button
            onClick={() => setIsEditOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono-tech font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors"
            title="Edit Strap Specifications"
          >
            <Pencil className="w-3 h-3 text-amber-400" />
            <span>Edit</span>
          </button>
        }
      >
      {/* Strap Hero Preview */}
      <div className="relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center p-4">
        <img
          src={strap.imageUrl}
          alt={strap.name}
          className="w-full max-h-48 object-cover rounded-2xl shadow-lg border border-neutral-800/80"
          referrerPolicy="no-referrer"
        />
        
        {/* Status Pills */}
        <div className="absolute top-6 left-6 flex items-center gap-1.5">
          <span className="bg-black/80 backdrop-blur border border-neutral-700 text-amber-300 text-[10px] font-mono-tech px-2.5 py-1 rounded-full font-bold">
            {strap.lugWidthMm}mm Lug
          </span>
          {strap.waterproof && (
            <span className="bg-cyan-950/80 backdrop-blur border border-cyan-700 text-cyan-300 text-[10px] font-mono-tech px-2.5 py-1 rounded-full flex items-center gap-1">
              <Droplets className="w-3 h-3" /> Waterproof
            </span>
          )}
        </div>

        <div className="absolute top-6 right-6">
          {mountedWatch ? (
            <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-700 px-3 py-1 rounded-full text-[10px] font-mono-tech flex items-center gap-1 shadow-lg">
              <Check className="w-3 h-3" /> Mounted on {mountedWatch.brand}
            </span>
          ) : (
            <span className="bg-neutral-900/90 text-neutral-400 border border-neutral-700 px-3 py-1 rounded-full text-[10px] font-mono-tech">
              In Wardrobe Tray
            </span>
          )}
        </div>
      </div>

      {/* Strap Specs Dossier */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-4 space-y-3 font-mono-tech text-xs">
        <h4 className="font-serif-luxury text-xs font-bold text-neutral-100 border-b border-neutral-800 pb-2">
          Strap Specifications & Craft
        </h4>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <span className="text-[10px] text-neutral-500 block">Atelier / Maker</span>
            <span className="font-semibold text-neutral-200">{strap.brand}</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 block">Material & Grain</span>
            <span className="font-semibold text-amber-300">{strap.material}</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 block">Colorway</span>
            <span className="font-semibold text-neutral-200">{strap.color}</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 block">Lug Width</span>
            <span className="font-bold text-amber-400">{strap.lugWidthMm} mm</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 block">Buckle Taper</span>
            <span className="font-semibold text-neutral-200">{strap.buckleWidthMm} mm ({strap.lugWidthMm - strap.buckleWidthMm}mm taper)</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 block">Quick Release</span>
            <span className="font-semibold text-neutral-200">{strap.quickRelease ? 'Spring Bars Built-in' : 'Traditional Pin'}</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 block">Retail Price</span>
            <span className="font-semibold text-neutral-200">${strap.priceUsd} USD</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 block">Acquired Date</span>
            <span className="font-semibold text-neutral-200">{strap.acquiredDate}</span>
          </div>
        </div>
      </div>

      {/* QUICK MOUNT CONTROLLER (Mount on Timepiece) */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl p-4 space-y-3 font-mono-tech text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <ArrowRightLeft className="w-4 h-4" />
            <span>Mount On Timepiece</span>
          </div>
          <span className="text-[10px] text-neutral-500">Requires {strap.lugWidthMm}mm lug width</span>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] text-neutral-400 block">Select Target Watch From Vault</label>
          <select
            value={selectedTargetWatchId}
            onChange={(e) => setSelectedTargetWatchId(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-neutral-200 text-xs focus:outline-none focus:border-amber-500"
          >
            {watches.map((w) => {
              const matches = Math.round(w.dimensions.lugWidthMm) === strap.lugWidthMm;
              return (
                <option key={w.id} value={w.id}>
                  {w.brand} - {w.nickname || w.model} ({w.dimensions.lugWidthMm}mm lug){matches ? ' ✓ Compatible' : ' ✕ Lug Mismatch'}
                </option>
              );
            })}
          </select>
        </div>

        {targetWatch && (
          <div className="pt-2 flex items-center justify-between">
            <div className="text-[11px]">
              {isCompatibleWithTarget ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Lug width {strap.lugWidthMm}mm matches {targetWatch.brand}
                </span>
              ) : (
                <span className="text-red-400">
                  ✕ Mismatch: {targetWatch.brand} is {targetWatch.dimensions.lugWidthMm}mm, strap is {strap.lugWidthMm}mm
                </span>
              )}
            </div>

            <button
              onClick={handleMount}
              disabled={!isCompatibleWithTarget || isCurrentlyMountedOnTarget}
              className={`px-4 py-2 rounded-xl font-bold transition-all text-xs ${
                isCurrentlyMountedOnTarget
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  : isCompatibleWithTarget
                  ? 'bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-md'
                  : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
              }`}
            >
              {isCurrentlyMountedOnTarget ? 'Already Mounted' : 'Mount to Watch'}
            </button>
          </div>
        )}
      </div>
    </BottomSheet>

    {isEditOpen && onUpdateStrap && (
      <EditStrapModal
        strap={strap}
        onClose={() => setIsEditOpen(false)}
        onUpdateStrap={(updated) => {
          onUpdateStrap(updated);
          setIsEditOpen(false);
        }}
        onDeleteStrap={onDeleteStrap ? (id) => {
          onDeleteStrap(id);
          setIsEditOpen(false);
          onClose();
        } : undefined}
      />
    )}
  </>
  );
};
