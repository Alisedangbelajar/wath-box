import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Watch, 
  Activity, 
  PieChart, 
  Smartphone, 
  Maximize2, 
  Volume2, 
  VolumeX,
  AlertTriangle,
  FileText,
  Bell,
  Sparkles,
  Camera
} from 'lucide-react';
import { ActiveTab } from '../types';
import { watchAudioEngine } from '../utils/audioTick';

interface MobileFrameProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddWatch: () => void;
  onOpenInsurance: () => void;
  neglectedCount?: number;
  onJumpToNeglected?: () => void;
  onOpenPhotoModal?: () => void;
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  activeTab,
  setActiveTab,
  onOpenInsurance,
  neglectedCount = 0,
  onJumpToNeglected,
  onOpenPhotoModal,
  children,
}) => {
  const [isFramed, setIsFramed] = useState<boolean>(true);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('09:41');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      setCurrentTimeStr(`${h}:${m}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    if (isAudioMuted) {
      watchAudioEngine.startTicking(28800, 0.08);
      setIsAudioMuted(false);
    } else {
      watchAudioEngine.stop();
      setIsAudioMuted(true);
    }
  };

  const handleNeglectedClick = () => {
    if (onJumpToNeglected) {
      onJumpToNeglected();
    } else {
      setActiveTab('wotd');
      setTimeout(() => {
        const el = document.getElementById('neglected-watches-alert');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-2', 'ring-amber-400');
          setTimeout(() => el.classList.remove('ring-2', 'ring-amber-400'), 2500);
        }
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 flex flex-col items-center justify-start sm:py-6 sm:px-4 selection:bg-indigo-500/20 selection:text-indigo-900">
      {/* Top Desktop Utility Header */}
      <header className="w-full max-w-4xl flex items-center justify-between px-4 py-3 mb-2 border border-slate-200/80 bg-white/80 backdrop-blur rounded-2xl text-xs shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 flex items-center justify-center shadow-xs text-white">
            <Watch className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-slate-900">Watch Box</span>
              <span className="text-[10px] text-indigo-700 font-semibold font-mono-tech px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/60">
                HOROLOGY OS
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Neglected Alert Badge in Top Bar */}
          <button
            onClick={handleNeglectedClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono-tech transition-all shadow-2xs ${
              neglectedCount > 0
                ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100/80 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title="View Idle Watches (>14 Days Without Wear)"
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${neglectedCount > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
            <span>{neglectedCount > 0 ? `${neglectedCount} Idle` : 'Rotation OK'}</span>
          </button>

          {/* Audio Escapement Simulator Button */}
          <button
            onClick={toggleSound}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all shadow-2xs ${
              !isAudioMuted 
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold ring-1 ring-indigo-200' 
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title="Acoustic 28,800 vph Escapement Synthesizer"
          >
            {!isAudioMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="font-mono-tech text-[11px] hidden md:inline">
              {!isAudioMuted ? '4Hz Audio ON' : 'Escapement'}
            </span>
          </button>

          {/* Insurance Appraisal Document */}
          <button
            onClick={onOpenInsurance}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-colors text-xs font-mono-tech shadow-2xs"
            title="Appraisal Certificate"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Appraisal</span>
          </button>

          {/* Device Frame View Toggle */}
          <button
            onClick={() => setIsFramed(!isFramed)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-colors text-xs shadow-2xs"
            title={isFramed ? "Switch to Full Screen View" : "Switch to Mobile Device Frame"}
          >
            {isFramed ? <Maximize2 className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFramed ? 'Full View' : 'Mobile Frame'}</span>
          </button>
        </div>
      </header>

      {/* Main Container: Modern Mobile Device Frame vs Full Screen */}
      <div 
        className={`w-full transition-all duration-300 ${
          isFramed 
            ? 'max-w-[420px] h-[890px] max-h-[92vh] border-[9px] border-slate-800 rounded-[50px] shadow-2xl relative flex flex-col overflow-hidden bg-[#f8f9fc] ring-1 ring-slate-400/20'
            : 'max-w-4xl min-h-[85vh] rounded-3xl border border-slate-200 bg-[#f8f9fc] flex flex-col shadow-xl overflow-hidden'
        }`}
      >
        {/* Mobile Device Top Notch & Status Bar (When in framed mode) */}
        {isFramed && (
          <div className="w-full bg-[#f8f9fc]/90 backdrop-blur-md px-7 pt-3 pb-2 flex items-center justify-between text-[11px] font-semibold text-slate-800 select-none z-30 shrink-0">
            <span className="font-mono-tech tracking-tight">{currentTimeStr}</span>

            {/* Dynamic Island / Notch */}
            <div className="w-24 h-4 bg-slate-900 rounded-full flex items-center justify-between px-2.5 shadow-2xs">
              <div className="w-2 h-2 rounded-full bg-slate-800" />
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/60" />
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-700">
              <span className="font-mono-tech font-bold">5G</span>
              <div className="w-4 h-2.5 border border-slate-700 rounded-xs p-0.5 flex items-center">
                <div className="w-full h-full bg-slate-900 rounded-2xs" />
              </div>
            </div>
          </div>
        )}

        {/* Scrollable View Content (Clean, soft light mode) */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col pb-24">
          {children}
        </main>

        {/* Modern Floating Bottom Nav Bar */}
        <div className="absolute bottom-3 inset-x-0 px-4 z-40 pointer-events-none">
          <nav className="pointer-events-auto bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-full py-1.5 px-3 flex items-center justify-around shadow-lg shadow-slate-300/40">
            {/* 1. Collection (Watches & Straps) */}
            <button
              onClick={() => setActiveTab('box')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-full transition-all ${
                activeTab === 'box' || activeTab === 'sotc'
                  ? 'text-indigo-600 font-semibold bg-indigo-50/90 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="text-xs font-semibold">Box</span>
            </button>

            {/* Quick Wrist Scan Center Floating Trigger */}
            {onOpenPhotoModal && (
              <button
                onClick={onOpenPhotoModal}
                className="w-10 h-10 -my-2 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all"
                title="Scan Wrist / Take Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}

            {/* 2. Watch Rotation */}
            <button
              onClick={() => setActiveTab('wotd')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-full transition-all ${
                activeTab === 'wotd'
                  ? 'text-indigo-600 font-semibold bg-indigo-50/90 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span className="text-xs font-semibold">Rotation</span>
            </button>

            {/* 3. Positional Rate & Sync Lab */}
            <button
              onClick={() => setActiveTab('lab')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-full transition-all ${
                activeTab === 'lab'
                  ? 'text-indigo-600 font-semibold bg-indigo-50/90 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span className="text-xs font-semibold">Lab</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

