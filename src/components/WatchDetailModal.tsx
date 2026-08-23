import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Calendar, 
  Volume2, 
  VolumeX, 
  Lock, 
  Unlock, 
  Check, 
  Wrench, 
  Layers, 
  Share2, 
  Award,
  Plus,
  Watch,
  Pencil
} from 'lucide-react';
import { WatchItem, StrapItem, AccuracyLogEntry } from '../types';
import { calculateWatchCostPerWear, getDaysSinceLastWorn, getPositionalStats } from '../utils/calculations';
import { WatchDialCanvas } from './WatchDialCanvas';
import { watchAudioEngine } from '../utils/audioTick';
import { BottomSheet } from './BottomSheet';
import { EditWatchModal } from './EditWatchModal';

interface WatchDetailModalProps {
  watch: WatchItem | null;
  straps: StrapItem[];
  onClose: () => void;
  onSetWotd: (watchId: string) => void;
  onAddAccuracyLog: (watchId: string, log: Omit<AccuracyLogEntry, 'id' | 'timestamp'>) => void;
  isTodayWotd: boolean;
  onUpdateWatch?: (updatedWatch: WatchItem) => void;
  onDeleteWatch?: (watchId: string) => void;
}

export const WatchDetailModal: React.FC<WatchDetailModalProps> = ({
  watch,
  straps,
  onClose,
  onSetWotd,
  onAddAccuracyLog,
  isTodayWotd,
  onUpdateWatch,
  onDeleteWatch,
}) => {
  if (!watch) return null;

  const [activePhotoTab, setActivePhotoTab] = useState<'live' | 'dial' | 'caseback' | 'lume'>('live');
  const [showSerial, setShowSerial] = useState<boolean>(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);

  const costPerWear = calculateWatchCostPerWear(watch);
  const daysSince = getDaysSinceLastWorn(watch.lastWornTimestamp);
  const accuracyStats = getPositionalStats(watch.accuracyLogs);
  const currentStrap = straps.find((s) => s.id === watch.currentStrapId);

  const toggleCaliberAudio = () => {
    if (isAudioPlaying) {
      watchAudioEngine.stop();
      setIsAudioPlaying(false);
    } else {
      const vph = watch.caliber.frequencyVph;
      if (vph > 0) {
        watchAudioEngine.startTicking(vph, 0.15);
        setIsAudioPlaying(true);
      }
    }
  };

  return (
    <>
      <BottomSheet
        isOpen={!!watch}
        onClose={onClose}
        title={`${watch.brand} ${watch.nickname || watch.model}`}
        subtitle={`Ref. ${watch.referenceNumber || 'N/A'} • ${watch.caliber.type}`}
        icon={<Watch className="w-4 h-4" />}
        headerAction={
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsEditOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono-tech font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors"
              title="Edit Watch Specifications"
            >
              <Pencil className="w-3 h-3 text-amber-400" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => onSetWotd(watch.id)}
              className={`px-3 py-1 rounded-xl text-xs font-mono-tech font-bold transition-all ${
                isTodayWotd
                  ? 'bg-amber-400 text-neutral-950 shadow-md'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
              }`}
            >
              {isTodayWotd ? '✓ On Wrist' : '+ Wear Today'}
            </button>
          </div>
        }
      >
      {/* Visual Showcase (Tabs: Live Dial Canvas / Dial / Caseback / Lume) */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
        {/* Visual Switcher */}
        <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-2xl border border-neutral-800 mb-3 text-[11px] font-mono-tech z-10">
          <button
            onClick={() => setActivePhotoTab('live')}
            className={`px-3 py-1 rounded-xl transition-all ${
              activePhotoTab === 'live'
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Live Dial
          </button>
          <button
            onClick={() => setActivePhotoTab('dial')}
            className={`px-3 py-1 rounded-xl transition-all ${
              activePhotoTab === 'dial'
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Dial Macro
          </button>
          <button
            onClick={() => setActivePhotoTab('caseback')}
            className={`px-3 py-1 rounded-xl transition-all ${
              activePhotoTab === 'caseback'
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Caseback
          </button>
          <button
            onClick={() => setActivePhotoTab('lume')}
            className={`px-3 py-1 rounded-xl transition-all ${
              activePhotoTab === 'lume'
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Lume
          </button>
        </div>

        {/* Display Container */}
        <div className="h-52 w-full flex items-center justify-center relative">
          {activePhotoTab === 'live' && (
            <div className="transform hover:scale-105 transition-transform duration-300">
              <WatchDialCanvas
                brand={watch.brand}
                model={watch.nickname || watch.model}
                caliberType={watch.caliber.type}
                vph={watch.caliber.frequencyVph}
                size={160}
              />
            </div>
          )}

          {activePhotoTab === 'dial' && (
            <img
              src={watch.dialMacroImageUrl || watch.imageUrl}
              alt="Dial Macro"
              className="h-full max-w-full object-contain rounded-2xl shadow-xl"
              referrerPolicy="no-referrer"
            />
          )}

          {activePhotoTab === 'caseback' && (
            <img
              src={watch.casebackImageUrl || watch.imageUrl}
              alt="Caseback Display"
              className="h-full max-w-full object-contain rounded-2xl shadow-xl"
              referrerPolicy="no-referrer"
            />
          )}

          {activePhotoTab === 'lume' && (
            <div className="relative h-full flex items-center justify-center">
              <img
                src={watch.lumeImageUrl || watch.imageUrl}
                alt="Lume Glow Shot"
                className="h-full max-w-full object-contain rounded-2xl shadow-xl filter brightness-90"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-emerald-950/20 rounded-2xl pointer-events-none mix-blend-color-dodge" />
            </div>
          )}
        </div>

        {/* Live Audio Escapement Button */}
        {watch.caliber.frequencyVph > 0 && (
          <button
            onClick={toggleCaliberAudio}
            className={`mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono-tech transition-all ${
              isAudioPlaying
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 ring-1 ring-amber-400'
                : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-neutral-200'
            }`}
          >
            {isAudioPlaying ? <Volume2 className="w-3.5 h-3.5 animate-bounce" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>
              {isAudioPlaying
                ? `Synthesizing ${watch.caliber.frequencyVph.toLocaleString()} vph Escapement`
                : `Listen to Caliber (${watch.caliber.frequencyVph / 1000}k vph)`}
            </span>
          </button>
        )}
      </div>

      {/* Quick Wear & Financial Stats */}
      <div className="grid grid-cols-3 gap-2 text-xs font-mono-tech">
        <div className="bg-neutral-900/80 border border-neutral-800 p-2.5 rounded-2xl">
          <span className="text-[9px] text-neutral-400 block uppercase">Cost / Wear</span>
          <span className="text-base font-bold text-amber-300">${Math.round(costPerWear)}</span>
          <span className="text-[9px] text-neutral-500 block">{watch.totalDaysWorn || 1} wears</span>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 p-2.5 rounded-2xl">
          <span className="text-[9px] text-neutral-400 block uppercase">Last Worn</span>
          <span className="text-base font-bold text-neutral-100">{daysSince}d ago</span>
          <span className="text-[9px] text-neutral-500 block">
            {daysSince > 14 ? '⚠️ Idle piece' : 'In rotation'}
          </span>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 p-2.5 rounded-2xl">
          <span className="text-[9px] text-neutral-400 block uppercase">Daily Drift</span>
          <span className={`text-base font-bold ${accuracyStats.avgRate >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {accuracyStats.avgRate > 0 ? `+${accuracyStats.avgRate.toFixed(1)}` : accuracyStats.avgRate.toFixed(1)}s
          </span>
          <span className="text-[9px] text-neutral-500 block">per day</span>
        </div>
      </div>

      {/* HOROLOGY CALIBER ARCHITECTURE DOSSIER */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <h4 className="font-serif-luxury text-xs font-bold text-neutral-100">
              Caliber & Escapement Engineering
            </h4>
          </div>
          <span className="text-[10px] text-amber-400 font-mono-tech">
            {watch.caliber.powerReserveHours}h Reserve
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono-tech">
          <div>
            <span className="text-[10px] text-neutral-500 block">Caliber Name</span>
            <span className="font-semibold text-neutral-200">{watch.caliber.name}</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 block">Escapement Beat Rate</span>
            <span className="font-semibold text-neutral-200">
              {watch.caliber.frequencyVph.toLocaleString()} vph ({watch.caliber.frequencyHz} Hz)
            </span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 block">Jewel Count</span>
            <span className="font-semibold text-neutral-200">{watch.caliber.jewels} Synthetic Rubies</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 block">Escapement Architecture</span>
            <span className="font-semibold text-neutral-200 truncate">{watch.caliber.escapement}</span>
          </div>
          {watch.caliber.certification && (
            <div className="col-span-2">
              <span className="text-[10px] text-neutral-500 block">Chronometer Certification</span>
              <span className="font-semibold text-amber-300">{watch.caliber.certification}</span>
            </div>
          )}
        </div>
      </div>

      {/* CASE DIMENSIONS & FIT DOSSIER */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h4 className="font-serif-luxury text-xs font-bold text-neutral-100">
              Geometry & Case Architecture
            </h4>
          </div>
          <span className="text-[10px] text-neutral-400 font-mono-tech">
            {watch.caseMaterial}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs font-mono-tech">
          <div className="bg-neutral-950/60 p-2 rounded-xl border border-neutral-800/60">
            <span className="text-[9px] text-neutral-500 block">Case Diameter</span>
            <span className="font-bold text-neutral-200">{watch.dimensions.caseDiameterMm} mm</span>
          </div>
          <div className="bg-neutral-950/60 p-2 rounded-xl border border-neutral-800/60">
            <span className="text-[9px] text-neutral-500 block">Lug-to-Lug</span>
            <span className="font-bold text-neutral-200">{watch.dimensions.lugToLugMm} mm</span>
          </div>
          <div className="bg-neutral-950/60 p-2 rounded-xl border border-neutral-800/60">
            <span className="text-[9px] text-neutral-500 block">Thickness</span>
            <span className="font-bold text-neutral-200">{watch.dimensions.thicknessMm} mm</span>
          </div>
          <div className="bg-neutral-950/60 p-2 rounded-xl border border-neutral-800/60">
            <span className="text-[9px] text-neutral-500 block">Lug Width</span>
            <span className="font-bold text-amber-300">{watch.dimensions.lugWidthMm} mm</span>
          </div>
          <div className="bg-neutral-950/60 p-2 rounded-xl border border-neutral-800/60">
            <span className="text-[9px] text-neutral-500 block">Water Resistance</span>
            <span className="font-bold text-neutral-200">{watch.waterResistanceMeters} m</span>
          </div>
          <div className="bg-neutral-950/60 p-2 rounded-xl border border-neutral-800/60">
            <span className="text-[9px] text-neutral-500 block">Crystal</span>
            <span className="font-bold text-neutral-200 truncate">{watch.crystalType}</span>
          </div>
        </div>
      </div>

      {/* CURRENT MOUNTED STRAP */}
      {currentStrap && (
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={currentStrap.imageUrl}
              alt={currentStrap.name}
              className="w-12 h-12 rounded-xl object-cover border border-neutral-800 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="text-[10px] text-amber-400 font-mono-tech uppercase block">
                Currently Mounted Strap
              </span>
              <h4 className="font-medium text-xs text-neutral-100 mt-0.5">{currentStrap.name}</h4>
              <p className="text-[10px] text-neutral-400 font-mono-tech mt-0.5">
                {currentStrap.material} • {currentStrap.lugWidthMm}mm
              </p>
            </div>
          </div>

          <span className="text-xs font-mono-tech text-amber-300 font-semibold">${currentStrap.priceUsd}</span>
        </div>
      )}

      {/* VAULT SECURITY & SERVICE */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-4 space-y-2.5 text-xs font-mono-tech">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h4 className="font-serif-luxury text-xs font-bold text-neutral-100">
              Vault Asset & Provenance Record
            </h4>
          </div>
          <button
            onClick={() => setShowSerial(!showSerial)}
            className="text-[10px] text-neutral-400 hover:text-amber-300 flex items-center gap-1"
          >
            {showSerial ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            <span>{showSerial ? 'Mask Serial' : 'Reveal Serial'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-neutral-500 block">Serial Number</span>
            <span className="font-semibold text-neutral-200">
              {showSerial ? watch.serialNumberMasked || 'SN-CHRONO-88219' : '••••••••••••'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 block">Appraised Valuation</span>
            <span className="font-semibold text-amber-300">
              ${(watch.marketValueUsd || watch.purchasePriceUsd).toLocaleString()} USD
            </span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 block">Purchase Date</span>
            <span className="font-semibold text-neutral-200">{watch.purchaseDate || '2023-05-14'}</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 block">Box & Papers</span>
            <span className="font-semibold text-emerald-400">
              {watch.boxAndPapers}
            </span>
          </div>
        </div>
      </div>
    </BottomSheet>

      {isEditOpen && onUpdateWatch && (
        <EditWatchModal
          watch={watch}
          onClose={() => setIsEditOpen(false)}
          onUpdateWatch={(updated) => {
            onUpdateWatch(updated);
            setIsEditOpen(false);
          }}
          onDeleteWatch={onDeleteWatch ? (id) => {
            onDeleteWatch(id);
            setIsEditOpen(false);
            onClose();
          } : undefined}
        />
      )}
    </>
  );
};
