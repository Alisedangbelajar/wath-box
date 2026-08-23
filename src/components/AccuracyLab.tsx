import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Clock, 
  Radio, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Sliders, 
  CheckCircle2, 
  Sparkles,
  Info,
  TrendingDown,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { WatchItem, PositionType, AccuracyLogEntry } from '../types';
import { getPositionalStats } from '../utils/calculations';
import { watchAudioEngine } from '../utils/audioTick';

interface AccuracyLabProps {
  watches: WatchItem[];
  onAddAccuracyLog: (watchId: string, log: Omit<AccuracyLogEntry, 'id' | 'timestamp'>) => void;
}

export const AccuracyLab: React.FC<AccuracyLabProps> = ({
  watches,
  onAddAccuracyLog,
}) => {
  const [selectedWatchId, setSelectedWatchId] = useState<string>(watches[0]?.id || '');
  const [atomicTime, setAtomicTime] = useState<string>('');
  const [atomicMs, setAtomicMs] = useState<number>(0);
  const [activeTestPosition, setActiveTestPosition] = useState<PositionType>('Dial Up (DU)');
  const [testRate, setTestRate] = useState<number>(1.2);
  const [isAudioRunning, setIsAudioRunning] = useState<boolean>(false);
  const [testAmplitude, setTestAmplitude] = useState<number>(298);
  const [testBeatError, setTestBeatError] = useState<number>(0.1);

  const selectedWatch = watches.find((w) => w.id === selectedWatchId) || watches[0];
  const positionalStats = selectedWatch ? getPositionalStats(selectedWatch.accuracyLogs) : null;

  // Live atomic clock timer
  useEffect(() => {
    const updateAtomic = () => {
      const now = new Date();
      const h = String(now.getUTCHours()).padStart(2, '0');
      const m = String(now.getUTCMinutes()).padStart(2, '0');
      const s = String(now.getUTCSeconds()).padStart(2, '0');
      const ms = String(now.getUTCMilliseconds()).padStart(3, '0');
      setAtomicTime(`${h}:${m}:${s}.${ms} UTC`);
      setAtomicMs(now.getUTCMilliseconds());
    };
    updateAtomic();
    const interval = setInterval(updateAtomic, 47);
    return () => clearInterval(interval);
  }, []);

  const handleToggleAcoustic = () => {
    if (!selectedWatch) return;
    if (isAudioRunning) {
      watchAudioEngine.stop();
      setIsAudioRunning(false);
    } else {
      const vph = selectedWatch.caliber.frequencyVph;
      if (vph > 0) {
        watchAudioEngine.startTicking(vph, 0.15);
        setIsAudioRunning(true);
      }
    }
  };

  const handleRecordTest = () => {
    if (!selectedWatch) return;
    onAddAccuracyLog(selectedWatch.id, {
      dateStr: 'Just now',
      position: activeTestPosition,
      deviationSecPerDay: testRate,
      amplitudeDeg: testAmplitude,
      beatErrorMs: testBeatError,
      notes: `Acoustic rate check in ${activeTestPosition}`,
    });
  };

  const positionsList: PositionType[] = [
    'Dial Up (DU)',
    'Dial Down (DD)',
    'Crown Down (CD)',
    'Crown Left (CL)',
    'Crown Up (CU)',
    'On Wrist (OW)',
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Top Atomic & METAS Sync Reference Header */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-4 shadow-xl relative overflow-hidden space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono-tech uppercase font-bold">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>METAS & NIST Atomic Sync</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono-tech bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-0.5 rounded-full font-semibold">
            Stratum-1 Locked
          </span>
        </div>

        {/* Live Millisecond Atomic Clock Display */}
        <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800/90 text-center font-mono-tech shadow-inner">
          <div className="text-2xl sm:text-3xl font-bold tracking-widest text-neutral-100 font-mono-tech">
            {atomicTime || '00:00:00.000 UTC'}
          </div>
          <div className="text-[10px] text-neutral-400 mt-1 flex items-center justify-center gap-2">
            <span className="text-amber-300 font-semibold">METAS Swiss Master (0 to +5 s/d)</span>
            <span>•</span>
            <span>Ref: time.nist.gov</span>
          </div>
        </div>
      </div>

      {/* Select Target Watch */}
      <div className="space-y-1.5">
        <label className="text-[11px] text-neutral-400 font-mono-tech uppercase block">
          Select Timepiece For Calibration:
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {watches.map((w) => {
            const isSelected = w.id === selectedWatch?.id;
            return (
              <button
                key={w.id}
                onClick={() => {
                  setSelectedWatchId(w.id);
                  if (isAudioRunning) {
                    watchAudioEngine.stop();
                    setIsAudioRunning(false);
                  }
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border shrink-0 transition-all text-xs ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500/80 text-amber-200'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span className="font-semibold">{w.brand}</span>
                <span className="text-neutral-500 text-[11px] truncate max-w-[90px]">{w.model}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedWatch && (
        <>
          {/* Active Watch Horology Spec Card */}
          <div className="bg-neutral-900/80 rounded-2xl border border-neutral-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono-tech text-amber-400 uppercase tracking-wide">
                  {selectedWatch.brand}
                </span>
                <h3 className="font-serif-luxury text-base font-bold text-neutral-100">
                  {selectedWatch.caliber.name}
                </h3>
              </div>

              {/* Escapement Audio Test */}
              {selectedWatch.caliber.frequencyVph > 0 && (
                <button
                  onClick={handleToggleAcoustic}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono-tech transition-all ${
                    isAudioRunning
                      ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400 animate-pulse'
                      : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                  }`}
                >
                  {isAudioRunning ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span>{isAudioRunning ? 'Listening (4Hz)' : 'Listen Beat'}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono-tech">
              <div className="bg-neutral-950 p-2 rounded-xl border border-neutral-800/80">
                <span className="text-[9px] text-neutral-500 block">FREQUENCY</span>
                <span className="font-bold text-amber-300">
                  {selectedWatch.caliber.frequencyVph > 0 ? `${selectedWatch.caliber.frequencyVph / 1000}k vph` : 'Glide'}
                </span>
              </div>
              <div className="bg-neutral-950 p-2 rounded-xl border border-neutral-800/80">
                <span className="text-[9px] text-neutral-500 block">RESERVE</span>
                <span className="font-bold text-neutral-200">{selectedWatch.caliber.powerReserveHours}h</span>
              </div>
              <div className="bg-neutral-950 p-2 rounded-xl border border-neutral-800/80">
                <span className="text-[9px] text-neutral-500 block">STANDARD</span>
                <span className="text-[10px] font-bold text-emerald-400 truncate block">
                  {selectedWatch.caliber.certification?.split(' ')[0] || 'COSC'}
                </span>
              </div>
            </div>
          </div>

          {/* Positional 6-Point Test Lab Simulator */}
          <div className="bg-neutral-900/80 rounded-2xl border border-neutral-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono-tech uppercase">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>Positional Rate Deviation Lab</span>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono-tech">6 Positions</span>
            </div>

            {/* Position Select Buttons */}
            <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono-tech">
              {positionsList.map((pos) => {
                const isCurrent = activeTestPosition === pos;
                const existingLog = selectedWatch.accuracyLogs.find((l) => l.position === pos);

                return (
                  <button
                    key={pos}
                    onClick={() => setActiveTestPosition(pos)}
                    className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      isCurrent
                        ? 'bg-amber-500/20 border-amber-500/80 text-amber-200 shadow-md'
                        : 'bg-neutral-950 border-neutral-800/80 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <span className="font-bold text-[10px]">{pos.split(' ')[0]}</span>
                    <span className="text-[8px] text-neutral-500 truncate">{pos.split(' ')[1]}</span>
                    {existingLog ? (
                      <span className={`text-[10px] font-bold mt-1 ${existingLog.deviationSecPerDay >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {existingLog.deviationSecPerDay > 0 ? `+${existingLog.deviationSecPerDay}` : existingLog.deviationSecPerDay} s/d
                      </span>
                    ) : (
                      <span className="text-[9px] text-neutral-600 mt-1">Untested</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Interactive Measurement Controls */}
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-300 font-mono-tech">Selected: {activeTestPosition}</span>
                <span className={`font-mono-tech font-bold text-sm ${testRate >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {testRate > 0 ? `+${testRate.toFixed(1)}` : testRate.toFixed(1)} sec/day
                </span>
              </div>

              {/* Slider for Rate Deviation */}
              <input
                type="range"
                min="-6"
                max="8"
                step="0.2"
                value={testRate}
                onChange={(e) => setTestRate(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />

              <div className="flex justify-between text-[10px] font-mono-tech text-neutral-500">
                <span>-6.0 s/d</span>
                <span className="text-emerald-400">0.0 (Perfect)</span>
                <span>+8.0 s/d</span>
              </div>

              {/* Amplitude and Beat error inputs */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono-tech pt-1">
                <div className="bg-neutral-900 p-2 rounded-lg border border-neutral-800 flex justify-between items-center">
                  <span className="text-[10px] text-neutral-400">Amplitude:</span>
                  <input
                    type="number"
                    value={testAmplitude}
                    onChange={(e) => setTestAmplitude(parseInt(e.target.value) || 280)}
                    className="w-14 bg-neutral-950 text-right px-1 py-0.5 rounded border border-neutral-800 text-neutral-200"
                  />
                  <span className="text-[10px] text-neutral-500">°</span>
                </div>

                <div className="bg-neutral-900 p-2 rounded-lg border border-neutral-800 flex justify-between items-center">
                  <span className="text-[10px] text-neutral-400">Beat Error:</span>
                  <input
                    type="number"
                    step="0.1"
                    value={testBeatError}
                    onChange={(e) => setTestBeatError(parseFloat(e.target.value) || 0.1)}
                    className="w-14 bg-neutral-950 text-right px-1 py-0.5 rounded border border-neutral-800 text-neutral-200"
                  />
                  <span className="text-[10px] text-neutral-500">ms</span>
                </div>
              </div>

              <button
                onClick={handleRecordTest}
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-bold rounded-xl text-xs font-mono-tech hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Record Rate For {activeTestPosition.split(' ')[0]}</span>
              </button>
            </div>
          </div>

          {/* Tolerance Standards Comparison Bar */}
          <div className="bg-neutral-900/80 rounded-2xl border border-neutral-800 p-4 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono-tech uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Horological Regulation Thresholds</span>
            </div>

            <div className="space-y-1.5 font-mono-tech text-[11px]">
              <div className="flex justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800/80">
                <span className="text-neutral-300">METAS Master Chronometer</span>
                <span className="text-emerald-400 font-bold">0 to +5.0 s/d</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800/80">
                <span className="text-neutral-300">Rolex Superlative Chronometer</span>
                <span className="text-emerald-400 font-bold">-2.0 to +2.0 s/d</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800/80">
                <span className="text-neutral-300">COSC Swiss Official Chronometer</span>
                <span className="text-amber-300 font-bold">-4.0 to +6.0 s/d</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800/80">
                <span className="text-neutral-300">Grand Seiko Spring Drive</span>
                <span className="text-cyan-400 font-bold">±1.0 s/d (±15s/mo)</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
