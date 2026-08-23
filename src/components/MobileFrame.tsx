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
  FileText
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
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  activeTab,
  setActiveTab,
  onOpenInsurance,
  neglectedCount = 0,
  onJumpToNeglected,
  children,
}) => {
  const [isFramed, setIsFramed] = useState<boolean>(true);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('10:10:30');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      const s = String(d.getSeconds()).padStart(2, '0');
      setCurrentTimeStr(`${h}:${m}:${s}`);
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
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-start sm:py-6 sm:px-4 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Desktop Utility Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between px-4 py-3 mb-2 border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur rounded-2xl text-xs shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Watch className="w-4 h-4 text-neutral-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif-luxury text-sm font-bold tracking-widest text-amber-200">CHRONOVAULT</span>
              <span className="text-[10px] text-amber-400/80 font-mono-tech px-1.5 py-0.2 rounded bg-amber-950/60 border border-amber-800/40">
                HOROLOGY OS
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Neglected Alert Badge in Top Bar */}
          <button
            onClick={handleNeglectedClick}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono-tech transition-all ${
              neglectedCount > 0
                ? 'bg-amber-950/70 border-amber-500/60 text-amber-300 hover:bg-amber-900/80'
                : 'bg-neutral-800/60 border-neutral-700/60 text-neutral-400 hover:text-neutral-200'
            }`}
            title="View Idle Watches (>14 Days Without Wear)"
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${neglectedCount > 0 ? 'text-amber-400' : 'text-neutral-500'}`} />
            <span>{neglectedCount > 0 ? `${neglectedCount} Idle` : 'Rotation OK'}</span>
          </button>

          {/* Audio Escapement Simulator Button */}
          <button
            onClick={toggleSound}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all ${
              !isAudioMuted 
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 ring-1 ring-amber-400/40' 
                : 'bg-neutral-800/60 border-neutral-700/60 text-neutral-400 hover:text-neutral-200'
            }`}
            title="Acoustic 28,800 vph Escapement Synthesizer"
          >
            {!isAudioMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="font-mono-tech text-[10px] hidden md:inline">
              {!isAudioMuted ? '4Hz Audio ON' : 'Escapement'}
            </span>
          </button>

          {/* Insurance Appraisal Document */}
          <button
            onClick={onOpenInsurance}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 text-neutral-300 hover:text-amber-200 transition-colors text-xs font-mono-tech"
            title="Appraisal Certificate"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Appraisal</span>
          </button>

          {/* Device Frame View Toggle */}
          <button
            onClick={() => setIsFramed(!isFramed)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 text-neutral-300 transition-colors text-xs"
            title={isFramed ? "Switch to Full Screen View" : "Switch to Mobile Device Frame"}
          >
            {isFramed ? <Maximize2 className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFramed ? 'Full View' : 'Mobile Frame'}</span>
          </button>
        </div>
      </header>

      {/* Main Container: Mobile Frame vs Full Screen */}
      <div 
        className={`w-full transition-all duration-300 ${
          isFramed 
            ? 'max-w-[430px] h-[890px] max-h-[92vh] border-[8px] border-neutral-800/90 rounded-[48px] shadow-2xl shadow-black/90 relative flex flex-col overflow-hidden bg-neutral-950 ring-1 ring-neutral-700/50'
            : 'max-w-4xl min-h-[85vh] rounded-3xl border border-neutral-800 bg-neutral-950 flex flex-col shadow-2xl overflow-hidden'
        }`}
      >
        {/* Mobile Device Top Notch & Status Bar (When in framed mode) */}
        {isFramed && (
          <div className="w-full bg-neutral-950 px-7 pt-3 pb-2 flex items-center justify-between text-[11px] font-mono-tech text-neutral-400 select-none z-30 shrink-0 border-b border-neutral-900/60">
            <span>{currentTimeStr.slice(0, 5)}</span>

            {/* Subtle Phone Speaker & Notch */}
            <div className="w-20 h-3.5 bg-neutral-900 rounded-full flex items-center justify-center border border-neutral-800/80">
              <div className="w-8 h-1 rounded-full bg-neutral-800" />
            </div>

            <div className="flex items-center gap-1.5 text-[10px]">
              <span>5G</span>
              <div className="w-4 h-2.5 border border-neutral-500 rounded-xs p-0.5 flex items-center">
                <div className="w-full h-full bg-emerald-500 rounded-2xs" />
              </div>
            </div>
          </div>
        )}

        {/* Scrollable View Content (Clean, un-obscured with proper bottom padding) */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col pb-20">
          {children}
        </main>

        {/* Ergonomic 3-Tab Focused Mobile Bottom Nav Bar */}
        <nav className="absolute bottom-0 inset-x-0 bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-800/80 px-4 py-2 flex items-center justify-around z-40">
          {/* 1. Collection (Watches & Straps) */}
          <button
            onClick={() => setActiveTab('box')}
            className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-2xl transition-all ${
              activeTab === 'box' || activeTab === 'sotc'
                ? 'text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-mono-tech tracking-tight">Collection</span>
          </button>

          {/* 2. Watch Rotation */}
          <button
            onClick={() => setActiveTab('wotd')}
            className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-2xl transition-all ${
              activeTab === 'wotd'
                ? 'text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <PieChart className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-mono-tech tracking-tight">Watch Rotation</span>
          </button>

          {/* 3. Positional Rate & Sync Lab */}
          <button
            onClick={() => setActiveTab('lab')}
            className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-2xl transition-all ${
              activeTab === 'lab'
                ? 'text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Activity className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-mono-tech tracking-tight">Rate Lab</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
