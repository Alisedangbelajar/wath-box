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
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-mono-tech font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
            title="Edit Strap Specifications"
          >
            <Pencil className="w-3 h-3 text-indigo-600" />
            <span>Edit</span>
          </button>
        }
      >
      {/* Strap Hero Preview */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-50 border border-slate-200/90 flex flex-col items-center justify-center p-4">
        <img
          src={strap.imageUrl}
          alt={strap.name}
          className="w-full max-h-48 object-cover rounded-2xl shadow-sm border border-slate-200"
          referrerPolicy="no-referrer"
        />
        
        {/* Status Pills */}
        <div className="absolute top-6 left-6 flex items-center gap-1.5">
          <span className="bg-slate-900/80 backdrop-blur border border-slate-700 text-white text-[10px] font-mono-tech px-2.5 py-1 rounded-full font-bold">
            {strap.lugWidthMm}mm Lug
          </span>
          {strap.waterproof && (
            <span className="bg-sky-950/80 backdrop-blur border border-sky-700 text-sky-200 text-[10px] font-mono-tech px-2.5 py-1 rounded-full flex items-center gap-1">
              <Droplets className="w-3 h-3" /> Waterproof
            </span>
          )}
        </div>

        <div className="absolute top-6 right-6">
          {mountedWatch ? (
            <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-mono-tech flex items-center gap-1 shadow-md font-bold">
              <Check className="w-3 h-3" /> Mounted on {mountedWatch.brand}
            </span>
          ) : (
            <span className="bg-slate-900/80 backdrop-blur text-slate-200 border border-slate-700 px-3 py-1 rounded-full text-[10px] font-mono-tech">
              In Wardrobe Tray
            </span>
          )}
        </div>
      </div>

      {/* Strap Specs Dossier */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 space-y-3 font-mono-tech text-xs shadow-sm">
        <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
          Strap Specifications & Craft
        </h4>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <span className="text-[10px] text-slate-400 block">Atelier / Maker</span>
            <span className="font-semibold text-slate-800">{strap.brand}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Material & Grain</span>
            <span className="font-semibold text-indigo-600">{strap.material}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Colorway</span>
            <span className="font-semibold text-slate-800">{strap.color}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Lug Width</span>
            <span className="font-bold text-indigo-600">{strap.lugWidthMm} mm</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Buckle Taper</span>
            <span className="font-semibold text-slate-800">{strap.buckleWidthMm} mm ({strap.lugWidthMm - strap.buckleWidthMm}mm taper)</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Quick Release</span>
            <span className="font-semibold text-slate-800">{strap.quickRelease ? 'Spring Bars Built-in' : 'Traditional Pin'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Retail Price</span>
            <span className="font-semibold text-slate-800">${strap.priceUsd} USD</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Acquired Date</span>
            <span className="font-semibold text-slate-800">{strap.acquiredDate}</span>
          </div>
        </div>
      </div>

      {/* QUICK MOUNT CONTROLLER (Mount on Timepiece) */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-4 space-y-3 font-mono-tech text-xs shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-indigo-600 font-bold">
            <ArrowRightLeft className="w-4 h-4" />
            <span>Mount On Timepiece</span>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold">Requires {strap.lugWidthMm}mm lug width</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 font-bold block">Select Target Watch From Vault</label>
          <select
            value={selectedTargetWatchId}
            onChange={(e) => setSelectedTargetWatchId(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-800 text-xs focus:outline-indigo-500 shadow-2xs"
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
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Lug width {strap.lugWidthMm}mm matches {targetWatch.brand}
                </span>
              ) : (
                <span className="text-rose-600 font-semibold">
                  ✕ Mismatch: {targetWatch.brand} is {targetWatch.dimensions.lugWidthMm}mm, strap is {strap.lugWidthMm}mm
                </span>
              )}
            </div>

            <button
              onClick={handleMount}
              disabled={!isCompatibleWithTarget || isCurrentlyMountedOnTarget}
              className={`px-4 py-2 rounded-xl font-bold transition-all text-xs shadow-2xs ${
                isCurrentlyMountedOnTarget
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : isCompatibleWithTarget
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
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
