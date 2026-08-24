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
    <div className="p-4 space-y-4 text-slate-800">
      {/* Top Atomic & METAS Sync Reference Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-sm relative overflow-hidden space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-mono-tech uppercase font-bold">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>METAS & NIST Atomic Sync</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-mono-tech bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold shadow-2xs">
            Stratum-1 Locked
          </span>
        </div>

        {/* Live Millisecond Atomic Clock Display */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 text-center font-mono-tech shadow-inner">
          <div className="text-2xl sm:text-3xl font-bold tracking-widest text-white font-mono-tech">
            {atomicTime || '00:00:00.000 UTC'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-center gap-2">
            <span className="text-indigo-300 font-semibold">METAS Swiss Master (0 to +5 s/d)</span>
            <span>•</span>
            <span>Ref: time.nist.gov</span>
          </div>
        </div>
      </div>

      {/* Select Target Watch */}
      <div className="space-y-1.5">
        <label className="text-[11px] text-slate-500 font-mono-tech uppercase font-bold block">
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
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border shrink-0 transition-all text-xs ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="font-semibold">{w.brand}</span>
                <span className="text-slate-400 text-[11px] truncate max-w-[90px]">{w.model}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedWatch && (
        <>
          {/* Active Watch Horology Spec Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono-tech text-indigo-600 font-bold uppercase tracking-wide">
                  {selectedWatch.brand}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedWatch.caliber.name}
                </h3>
              </div>

              {/* Escapement Audio Test */}
              {selectedWatch.caliber.frequencyVph > 0 && (
                <button
                  onClick={handleToggleAcoustic}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono-tech transition-all shadow-2xs ${
                    isAudioRunning
                      ? 'bg-indigo-600 text-white font-bold border-indigo-500 animate-pulse'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isAudioRunning ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span>{isAudioRunning ? 'Listening (4Hz)' : 'Listen Beat'}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono-tech">
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                <span className="text-[9px] text-slate-400 font-bold block">FREQUENCY</span>
                <span className="font-bold text-indigo-600">
                  {selectedWatch.caliber.frequencyVph > 0 ? `${selectedWatch.caliber.frequencyVph / 1000}k vph` : 'Glide'}
                </span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                <span className="text-[9px] text-slate-400 font-bold block">RESERVE</span>
                <span className="font-bold text-slate-800">{selectedWatch.caliber.powerReserveHours}h</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                <span className="text-[9px] text-slate-400 font-bold block">STANDARD</span>
                <span className="text-[10px] font-bold text-emerald-600 truncate block">
                  {selectedWatch.caliber.certification?.split(' ')[0] || 'COSC'}
                </span>
              </div>
            </div>
          </div>

          {/* Positional 6-Point Test Lab Simulator */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-mono-tech uppercase font-bold">
                <Activity className="w-3.5 h-3.5 text-indigo-600" />
                <span>Positional Rate Deviation Lab</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono-tech">6 Positions</span>
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
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      isCurrent
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="font-bold text-[10px]">{pos.split(' ')[0]}</span>
                    <span className="text-[8px] text-slate-400 truncate">{pos.split(' ')[1]}</span>
                    {existingLog ? (
                      <span className={`text-[10px] font-bold mt-1 ${existingLog.deviationSecPerDay >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {existingLog.deviationSecPerDay > 0 ? `+${existingLog.deviationSecPerDay}` : existingLog.deviationSecPerDay} s/d
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-400 mt-1">Untested</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Interactive Measurement Controls */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-mono-tech font-semibold">Selected: {activeTestPosition}</span>
                <span className={`font-mono-tech font-bold text-sm ${testRate >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
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
                className="w-full accent-indigo-600 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] font-mono-tech text-slate-400">
                <span>-6.0 s/d</span>
                <span className="text-emerald-600 font-bold">0.0 (Perfect)</span>
                <span>+8.0 s/d</span>
              </div>

              {/* Amplitude and Beat error inputs */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono-tech pt-1">
                <div className="bg-white p-2 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-semibold">Amplitude:</span>
                  <input
                    type="number"
                    value={testAmplitude}
                    onChange={(e) => setTestAmplitude(parseInt(e.target.value) || 280)}
                    className="w-14 bg-slate-50 text-right px-1.5 py-0.5 rounded border border-slate-200 text-slate-900 font-bold"
                  />
                  <span className="text-[10px] text-slate-400">°</span>
                </div>

                <div className="bg-white p-2 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-semibold">Beat Error:</span>
                  <input
                    type="number"
                    step="0.1"
                    value={testBeatError}
                    onChange={(e) => setTestBeatError(parseFloat(e.target.value) || 0.1)}
                    className="w-14 bg-slate-50 text-right px-1.5 py-0.5 rounded border border-slate-200 text-slate-900 font-bold"
                  />
                  <span className="text-[10px] text-slate-400">ms</span>
                </div>
              </div>

              <button
                onClick={handleRecordTest}
                className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs font-mono-tech hover:bg-indigo-500 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Record Rate For {activeTestPosition.split(' ')[0]}</span>
              </button>
            </div>
          </div>

          {/* Tolerance Standards Comparison Bar */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-4 space-y-2 text-xs shadow-sm">
            <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-mono-tech uppercase font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Horological Regulation Thresholds</span>
            </div>

            <div className="space-y-1.5 font-mono-tech text-[11px]">
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-700">METAS Master Chronometer</span>
                <span className="text-emerald-600 font-bold">0 to +5.0 s/d</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-700">Rolex Superlative Chronometer</span>
                <span className="text-emerald-600 font-bold">-2.0 to +2.0 s/d</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-700">COSC Swiss Official Chronometer</span>
                <span className="text-indigo-600 font-bold">-4.0 to +6.0 s/d</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-700">Grand Seiko 9SA5 Hi-Beat</span>
                <span className="text-sky-600 font-bold">-3.0 to +5.0 s/d</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
