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
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-mono-tech font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
              title="Edit Watch Specifications"
            >
              <Pencil className="w-3 h-3 text-indigo-600" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => onSetWotd(watch.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono-tech font-bold transition-all shadow-2xs ${
                isTodayWotd
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {isTodayWotd ? '✓ On Wrist' : '+ Wear Today'}
            </button>
          </div>
        }
      >
      {/* Visual Showcase (Tabs: Live Dial Canvas / Dial / Caseback / Lume) */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
        {/* Visual Switcher */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 mb-3 text-xs font-mono-tech z-10 shadow-2xs">
          <button
            onClick={() => setActivePhotoTab('live')}
            className={`px-3 py-1 rounded-xl transition-all font-semibold ${
              activePhotoTab === 'live'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Live Dial
          </button>
          <button
            onClick={() => setActivePhotoTab('dial')}
            className={`px-3 py-1 rounded-xl transition-all font-semibold ${
              activePhotoTab === 'dial'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Dial Macro
          </button>
          <button
            onClick={() => setActivePhotoTab('caseback')}
            className={`px-3 py-1 rounded-xl transition-all font-semibold ${
              activePhotoTab === 'caseback'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Caseback
          </button>
          <button
            onClick={() => setActivePhotoTab('lume')}
            className={`px-3 py-1 rounded-xl transition-all font-semibold ${
              activePhotoTab === 'lume'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
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
              className="h-full max-w-full object-contain rounded-2xl shadow-sm border border-slate-200"
              referrerPolicy="no-referrer"
            />
          )}

          {activePhotoTab === 'caseback' && (
            <img
              src={watch.casebackImageUrl || watch.imageUrl}
              alt="Caseback Display"
              className="h-full max-w-full object-contain rounded-2xl shadow-sm border border-slate-200"
              referrerPolicy="no-referrer"
            />
          )}

          {activePhotoTab === 'lume' && (
            <div className="relative h-full flex items-center justify-center">
              <img
                src={watch.lumeImageUrl || watch.imageUrl}
                alt="Lume Glow Shot"
                className="h-full max-w-full object-contain rounded-2xl shadow-sm filter brightness-90 border border-slate-200"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-emerald-950/10 rounded-2xl pointer-events-none mix-blend-color-dodge" />
            </div>
          )}
        </div>

        {/* Live Audio Escapement Button */}
        {watch.caliber.frequencyVph > 0 && (
          <button
            onClick={toggleCaliberAudio}
            className={`mt-3 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-mono-tech transition-all shadow-2xs ${
              isAudioPlaying
                ? 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-1 ring-indigo-400 font-bold'
                : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
            }`}
          >
            {isAudioPlaying ? <Volume2 className="w-3.5 h-3.5 animate-bounce text-indigo-600" /> : <VolumeX className="w-3.5 h-3.5" />}
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
        <div className="bg-white border border-slate-200/90 p-3 rounded-2xl shadow-2xs">
          <span className="text-[9px] text-slate-400 block uppercase font-bold">Cost / Wear</span>
          <span className="text-base font-bold text-indigo-600">${Math.round(costPerWear)}</span>
          <span className="text-[9px] text-slate-400 block">{watch.totalDaysWorn || 1} wears</span>
        </div>

        <div className="bg-white border border-slate-200/90 p-3 rounded-2xl shadow-2xs">
          <span className="text-[9px] text-slate-400 block uppercase font-bold">Last Worn</span>
          <span className="text-base font-bold text-slate-800">{daysSince}d ago</span>
          <span className="text-[9px] text-slate-400 block">
            {daysSince > 14 ? '⚠️ Idle piece' : 'In rotation'}
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 p-3 rounded-2xl shadow-2xs">
          <span className="text-[9px] text-slate-400 block uppercase font-bold">Daily Drift</span>
          <span className={`text-base font-bold ${accuracyStats.avgRate >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {accuracyStats.avgRate > 0 ? `+${accuracyStats.avgRate.toFixed(1)}` : accuracyStats.avgRate.toFixed(1)}s
          </span>
          <span className="text-[9px] text-slate-400 block">per day</span>
        </div>
      </div>

      {/* HOROLOGY CALIBER ARCHITECTURE DOSSIER */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-900">
              Caliber & Escapement Engineering
            </h4>
          </div>
          <span className="text-[10px] text-indigo-600 font-mono-tech font-bold">
            {watch.caliber.powerReserveHours}h Reserve
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono-tech">
          <div>
            <span className="text-[10px] text-slate-400 block">Caliber Name</span>
            <span className="font-semibold text-slate-800">{watch.caliber.name}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Escapement Beat Rate</span>
            <span className="font-semibold text-slate-800">
              {watch.caliber.frequencyVph.toLocaleString()} vph ({watch.caliber.frequencyHz} Hz)
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Jewel Count</span>
            <span className="font-semibold text-slate-800">{watch.caliber.jewels} Synthetic Rubies</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Escapement Architecture</span>
            <span className="font-semibold text-slate-800 truncate">{watch.caliber.escapement}</span>
          </div>
          {watch.caliber.certification && (
            <div className="col-span-2">
              <span className="text-[10px] text-slate-400 block">Chronometer Certification</span>
              <span className="font-semibold text-indigo-600">{watch.caliber.certification}</span>
            </div>
          )}
        </div>
      </div>

      {/* CASE DIMENSIONS & FIT DOSSIER */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-900">
              Geometry & Case Architecture
            </h4>
          </div>
          <span className="text-[10px] text-slate-500 font-mono-tech font-semibold">
            {watch.caseMaterial}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs font-mono-tech">
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60">
            <span className="text-[9px] text-slate-400 font-bold block">Case Diameter</span>
            <span className="font-bold text-slate-800">{watch.dimensions.caseDiameterMm} mm</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60">
            <span className="text-[9px] text-slate-400 font-bold block">Lug-to-Lug</span>
            <span className="font-bold text-slate-800">{watch.dimensions.lugToLugMm} mm</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60">
            <span className="text-[9px] text-slate-400 font-bold block">Thickness</span>
            <span className="font-bold text-slate-800">{watch.dimensions.thicknessMm} mm</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60">
            <span className="text-[9px] text-slate-400 font-bold block">Lug Width</span>
            <span className="font-bold text-indigo-600">{watch.dimensions.lugWidthMm} mm</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60">
            <span className="text-[9px] text-slate-400 font-bold block">Water Resistance</span>
            <span className="font-bold text-slate-800">{watch.waterResistanceMeters} m</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60">
            <span className="text-[9px] text-slate-400 font-bold block">Crystal</span>
            <span className="font-bold text-slate-800 truncate">{watch.crystalType}</span>
          </div>
        </div>
      </div>

      {/* CURRENT MOUNTED STRAP */}
      {currentStrap && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <img
              src={currentStrap.imageUrl}
              alt={currentStrap.name}
              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="text-[10px] text-indigo-600 font-mono-tech font-bold uppercase block">
                Currently Mounted Strap
              </span>
              <h4 className="font-bold text-xs text-slate-900 mt-0.5">{currentStrap.name}</h4>
              <p className="text-[10px] text-slate-500 font-mono-tech mt-0.5">
                {currentStrap.material} • {currentStrap.lugWidthMm}mm
              </p>
            </div>
          </div>

          <span className="text-xs font-mono-tech text-indigo-600 font-bold">${currentStrap.priceUsd}</span>
        </div>
      )}

      {/* VAULT SECURITY & SERVICE */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 space-y-2.5 text-xs font-mono-tech shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-900">
              Box Asset & Provenance Record
            </h4>
          </div>
          <button
            onClick={() => setShowSerial(!showSerial)}
            className="text-[10px] text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-semibold"
          >
            {showSerial ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            <span>{showSerial ? 'Mask Serial' : 'Reveal Serial'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-400 block">Serial Number</span>
            <span className="font-semibold text-slate-800">
              {showSerial ? watch.serialNumberMasked || 'SN-CHRONO-88219' : '••••••••••••'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Appraised Valuation</span>
            <span className="font-semibold text-indigo-600">
              ${(watch.marketValueUsd || watch.purchasePriceUsd).toLocaleString()} USD
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Purchase Date</span>
            <span className="font-semibold text-slate-800">{watch.purchaseDate || '2023-05-14'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Box & Papers</span>
            <span className="font-semibold text-emerald-600">
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
