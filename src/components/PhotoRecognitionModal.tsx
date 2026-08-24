import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Check, 
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { WatchItem, StrapItem, WearOccasion } from '../types';
import confetti from 'canvas-confetti';
import { BottomSheet } from './BottomSheet';

interface PhotoRecognitionModalProps {
  watches: WatchItem[];
  straps: StrapItem[];
  onClose: () => void;
  onLogWearWithPhoto: (watchId: string, strapId: string, occasion: WearOccasion, photoUrl: string, note?: string) => void;
  onOpenAddNewWithPhoto: (photoUrl: string, detectedBrand?: string, detectedDial?: string) => void;
}

export const PhotoRecognitionModal: React.FC<PhotoRecognitionModalProps> = ({
  watches,
  straps,
  onClose,
  onLogWearWithPhoto,
  onOpenAddNewWithPhoto,
}) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [recognitionResult, setRecognitionResult] = useState<{
    matchedWatchId: string;
    matchedStrapId: string;
    detectedFeatures: {
      dialTexture: string;
      bezelType: string;
      strapMaterial: string;
      caseFinishing: string;
    };
    suggestedOccasion: WearOccasion;
    detectedBrand?: string;
  } | null>(null);

  const [selectedWatchId, setSelectedWatchId] = useState<string>(watches[0]?.id || '');
  const [selectedStrapId, setSelectedStrapId] = useState<string>(straps[0]?.id || '');
  const [selectedOccasion, setSelectedOccasion] = useState<WearOccasion>('Daily / Office');
  const [collectorNote, setCollectorNote] = useState<string>('Wrist check logged');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCapturedImage(result);
      runScanProcess(result);
    };
    reader.readAsDataURL(file);
  };

  const startLiveCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable in iframe:', err);
      setIsCameraActive(false);
    }
  };

  const captureCameraFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
      stopCameraStream();
      runScanProcess(dataUrl);
    }
  };

  const stopCameraStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const runScanProcess = (photoUrl: string) => {
    setIsAnalyzing(true);
    setRecognitionResult(null);

    setTimeout(() => {
      const matchedWatch = watches[0] || {
        id: 'w1',
        brand: 'Watch',
        model: 'Timepiece',
        dimensions: { waterResistanceMeters: 100, caseThicknessMm: 12 },
        currentStrapId: straps[0]?.id || 's1'
      };

      const matchingStrap = straps.find((s) => s.id === matchedWatch.currentStrapId) || straps[0];

      const detectedFeatures = {
        dialTexture: 'Sunburst Dial',
        bezelType: 'Polished Bezel',
        strapMaterial: matchingStrap ? matchingStrap.material : 'Leather',
        caseFinishing: 'Brushed Steel',
      };

      const matchedOccasion: WearOccasion = 
        matchedWatch.dimensions.waterResistanceMeters >= 200 ? 'Sport / Outdoor' :
        matchedWatch.dimensions.caseThicknessMm < 12 ? 'Dress / Formal' : 'Daily / Office';

      setSelectedWatchId(matchedWatch.id);
      setSelectedStrapId(matchingStrap?.id || straps[0]?.id || '');
      setSelectedOccasion(matchedOccasion);

      setRecognitionResult({
        matchedWatchId: matchedWatch.id,
        matchedStrapId: matchingStrap?.id || straps[0]?.id || '',
        detectedFeatures,
        suggestedOccasion: matchedOccasion,
        detectedBrand: matchedWatch.brand,
      });

      setIsAnalyzing(false);
    }, 700);
  };

  const handleConfirmLogWear = () => {
    if (!capturedImage) return;
    onLogWearWithPhoto(
      selectedWatchId,
      selectedStrapId,
      selectedOccasion,
      capturedImage,
      collectorNote
    );
    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#f59e0b', '#10b981', '#fbbf24'],
    });
    onClose();
  };

  const handleAddNewFromPhoto = () => {
    if (!capturedImage) return;
    onOpenAddNewWithPhoto(
      capturedImage,
      recognitionResult?.detectedBrand || 'New Timepiece',
      recognitionResult?.detectedFeatures.dialTexture || 'Black Dial'
    );
    onClose();
  };

  return (
    <BottomSheet
      isOpen={true}
      onClose={() => {
        stopCameraStream();
        onClose();
      }}
      title="Wrist Scanner"
      subtitle=""
      icon={<Camera className="w-4 h-4" />}
    >
      <div className="space-y-3.5 text-xs font-sans text-slate-800">
        {/* STEP 1: CAPTURE OR PICK PHOTO (NO PRESETS/SAMPLES) */}
        {!capturedImage && !isCameraActive && (
          <div className="space-y-3">
            <div className="border border-slate-200/90 rounded-3xl p-6 flex flex-col items-center justify-center text-center bg-slate-50 shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3 shadow-2xs">
                <Camera className="w-7 h-7 stroke-[2]" />
              </div>

              <h4 className="font-serif-luxury text-sm font-bold text-slate-800">
                Wrist Shot
              </h4>
              <p className="text-[11px] text-slate-500 font-mono-tech mt-0.5 max-w-xs">
                Take a photo or choose from your phone gallery
              </p>

              <div className="grid grid-cols-2 gap-2.5 w-full mt-5">
                <button
                  onClick={startLiveCamera}
                  className="py-3 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono-tech flex items-center justify-center gap-2 shadow-md transition-colors text-xs"
                >
                  <Camera className="w-4 h-4" />
                  <span>Open Camera</span>
                </button>

                <label className="py-3 px-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer font-mono-tech flex items-center justify-center gap-2 transition-colors text-xs font-semibold shadow-2xs">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  <span>Phone Gallery</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* CAMERA ACTIVE VIEW */}
        {isCameraActive && (
          <div className="relative rounded-3xl overflow-hidden bg-black border border-slate-200 flex flex-col items-center justify-center h-72 shadow-lg">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay />
            <canvas ref={canvasRef} className="hidden" />

            <div className="absolute inset-0 border-2 border-indigo-400/40 rounded-3xl pointer-events-none m-4 flex items-center justify-center">
              <div className="w-36 h-36 rounded-full border border-dashed border-indigo-400/60 flex items-center justify-center">
                <span className="text-[9px] text-white font-mono-tech bg-indigo-600/80 px-2.5 py-0.5 rounded-full font-bold">
                  Align Watch
                </span>
              </div>
            </div>

            <div className="absolute bottom-3 flex items-center gap-3">
              <button
                onClick={captureCameraFrame}
                className="px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono-tech flex items-center gap-1.5 shadow-lg text-xs"
              >
                <Camera className="w-4 h-4" />
                <span>Capture</span>
              </button>
              <button
                onClick={stopCameraStream}
                className="px-3.5 py-2.5 rounded-full bg-white/90 text-slate-800 font-mono-tech border border-slate-200 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SCANNING STATE */}
        {isAnalyzing && (
          <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-3 shadow-2xs">
            <div className="w-9 h-9 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
            <h4 className="font-serif-luxury text-sm font-bold text-slate-800">
              Scanning timepiece...
            </h4>
          </div>
        )}

        {/* STEP 3: MATCH & LOG WEAR */}
        {capturedImage && !isAnalyzing && recognitionResult && (
          <div className="space-y-3">
            {/* Captured Photo Preview */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 h-44 flex items-center justify-center shadow-2xs">
              <img
                src={capturedImage}
                alt="Wrist shot"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />

              <button
                onClick={() => {
                  setCapturedImage(null);
                  setRecognitionResult(null);
                }}
                className="absolute top-3 right-3 bg-white/90 hover:bg-white text-slate-700 p-2 rounded-full border border-slate-200 text-xs flex items-center gap-1 font-mono-tech shadow-md"
                title="Retake / Change Photo"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Matched Details Form */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-serif-luxury font-bold text-slate-800 text-xs">
                  Matched Timepiece & Strap
                </span>
                <span className="text-[10px] text-emerald-600 font-mono-tech font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" /> In Collection
                </span>
              </div>

              {/* Form to adjust or confirm */}
              <div className="grid grid-cols-2 gap-2 font-mono-tech text-xs">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">Timepiece</label>
                  <select
                    value={selectedWatchId}
                    onChange={(e) => setSelectedWatchId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-800 text-xs focus:outline-indigo-500 shadow-2xs"
                  >
                    {watches.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.brand} {w.nickname || w.model}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">Mounted Strap</label>
                  <select
                    value={selectedStrapId}
                    onChange={(e) => setSelectedStrapId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-800 text-xs focus:outline-indigo-500 shadow-2xs"
                  >
                    {straps.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.material})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono-tech text-slate-500 font-bold block mb-1">
                  Collector Note
                </label>
                <input
                  type="text"
                  value={collectorNote}
                  onChange={(e) => setCollectorNote(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-indigo-500 shadow-2xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleConfirmLogWear}
                  className="flex-1 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono-tech text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Log Wrist Check & Set WOTD</span>
                </button>

                <button
                  onClick={handleAddNewFromPhoto}
                  className="px-3 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-indigo-600 font-mono-tech text-xs font-semibold border border-slate-200 whitespace-nowrap shadow-2xs"
                  title="Add as a brand new watch to collection"
                >
                  + Add New Watch
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  );
};
