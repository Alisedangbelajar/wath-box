import React, { useState } from 'react';
import { Watch, Sparkles, Check, Wrench } from 'lucide-react';
import { WatchItem, CaliberSpec, BoxPapersStatus } from '../types';
import { BottomSheet } from './BottomSheet';

interface AddWatchModalProps {
  onClose: () => void;
  onAddWatch: (watch: WatchItem) => void;
  initialPhotoUrl?: string;
  initialBrand?: string;
  initialDial?: string;
}

const CALIBER_TEMPLATES: Record<string, Partial<CaliberSpec>> = {
  'Seiko NH35A / 4R35 (Workhorse Automatic)': {
    name: 'Seiko NH35A',
    maker: 'Seiko Time Module',
    type: 'Automatic',
    isInHouse: true,
    frequencyVph: 21600,
    frequencyHz: 3,
    jewels: 24,
    powerReserveHours: 41,
    escapement: 'Diashock Shock System with Magic Lever',
    certification: 'Factory Regulated (-20/+40 s/d)',
    finishing: ['Brushed Industrial Rotor'],
  },
  'Casio Digital Quartz Module (F-91W / G-Shock)': {
    name: 'Casio Digital Quartz Module',
    maker: 'Casio Japan',
    type: 'Quartz',
    isInHouse: true,
    frequencyVph: 32768,
    frequencyHz: 32768,
    jewels: 0,
    powerReserveHours: 87600, // 10 years battery
    escapement: 'Tuning Fork Quartz Oscillator',
    certification: '±15 sec/month Accuracy',
    finishing: ['Integrated IC Circuitry'],
  },
  'Miyota 8215 / 9015 (Citizen / Microbrand)': {
    name: 'Miyota 9015 Hi-Beat',
    maker: 'Miyota (Citizen Group)',
    type: 'Automatic',
    isInHouse: false,
    frequencyVph: 28800,
    frequencyHz: 4,
    jewels: 24,
    powerReserveHours: 42,
    escapement: 'Swiss-style Lever Escapement',
    certification: '-10/+30 s/d',
    finishing: ['Unidirectional Winding Rotor'],
  },
  'Seagull ST1901 (Column Wheel Chrono)': {
    name: 'Seagull ST1901',
    maker: 'Tianjin Seagull',
    type: 'Manual Wind',
    isInHouse: true,
    frequencyVph: 21600,
    frequencyHz: 3,
    jewels: 21,
    powerReserveHours: 45,
    escapement: 'Column Wheel Lateral Clutch',
    certification: 'Chronograph Standard',
    finishing: ['Blued Screws', 'Geneva Striping'],
  },
  'Sellita SW200-1 / ETA 2824-2 (Swiss)': {
    name: 'Sellita SW200-1',
    maker: 'Sellita (Swiss)',
    type: 'Automatic',
    isInHouse: false,
    frequencyVph: 28800,
    frequencyHz: 4,
    jewels: 26,
    powerReserveHours: 38,
    escapement: 'Swiss Lever Escapement',
    certification: 'Elaboré Grade (±7 s/d)',
    finishing: ['Standard Nickel Finish'],
  },
  'Omega Calibre 3861 (Master Chrono)': {
    name: 'Calibre 3861',
    maker: 'Omega In-House',
    type: 'Manual Wind',
    isInHouse: true,
    frequencyVph: 21600,
    frequencyHz: 3,
    jewels: 26,
    powerReserveHours: 50,
    escapement: 'Co-Axial Master Chronometer Si14',
    certification: 'METAS Master Chronometer (0/+5 s/d)',
    finishing: ['Geneva Waves', 'Circular Graining', 'Rhodium Plating'],
  },
  'Rolex Calibre 3235 (Superlative)': {
    name: 'Calibre 3235',
    maker: 'Rolex Manufacture',
    type: 'Automatic',
    isInHouse: true,
    frequencyVph: 28800,
    frequencyHz: 4,
    jewels: 31,
    powerReserveHours: 70,
    escapement: 'Chronergy Escapement with Parachrom Hairspring',
    certification: 'Superlative Chronometer (-2/+2 s/d)',
    finishing: ['Perlage', 'Sunray Côtes de Genève'],
  },
  'Grand Seiko 9R65 (Spring Drive)': {
    name: 'Calibre 9R65 Spring Drive',
    maker: 'Shinshu Watch Studio',
    type: 'Spring Drive',
    isInHouse: true,
    frequencyVph: 0,
    frequencyHz: 0,
    jewels: 30,
    powerReserveHours: 72,
    escapement: 'Tri-Synchro Glide Regulator',
    certification: 'Grand Seiko Standard (±1 s/d)',
    finishing: ['Tokyo Stripes', 'Tempered Blue Screws'],
  },
};

export const AddWatchModal: React.FC<AddWatchModalProps> = ({
  onClose,
  onAddWatch,
  initialPhotoUrl,
  initialBrand,
  initialDial,
}) => {
  const [brand, setBrand] = useState(initialBrand || '');
  const [model, setModel] = useState('');
  const [nickname, setNickname] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [year, setYear] = useState<number>(2023);
  const [caseDiameter, setCaseDiameter] = useState<number>(40);
  const [thickness, setThickness] = useState<number>(12);
  const [lugToLug, setLugToLug] = useState<number>(47);
  const [lugWidth, setLugWidth] = useState<number>(20);
  const [purchasePrice, setPurchasePrice] = useState<number>(150);
  const [marketValue, setMarketValue] = useState<number>(150);
  const [boxAndPapers, setBoxAndPapers] = useState<BoxPapersStatus>('Watch Only');
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('Seiko NH35A / 4R35 (Workhorse Automatic)');
  const [customCaliberName, setCustomCaliberName] = useState('');
  const [waterResistance, setWaterResistance] = useState<number>(100);
  const [imageUrl, setImageUrl] = useState<string>(
    initialPhotoUrl || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80'
  );
  const [dialColor, setDialColor] = useState(initialDial || 'Classic Matte Dial');

  const handleTemplateChange = (key: string) => {
    setSelectedTemplateKey(key);
    if (key !== 'Custom Automatic' && key !== 'Custom Quartz') {
      const templ = CALIBER_TEMPLATES[key];
      if (templ && templ.name) {
        setCustomCaliberName(templ.name);
      }
    } else if (key === 'Custom Automatic') {
      setCustomCaliberName('Custom Automatic Caliber');
    } else if (key === 'Custom Quartz') {
      setCustomCaliberName('Custom Quartz Module');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model) return;

    let baseCaliberInfo: Partial<CaliberSpec>;
    if (selectedTemplateKey === 'Custom Quartz') {
      baseCaliberInfo = {
        name: customCaliberName || 'Custom Quartz Caliber',
        maker: brand || 'Independent / OEM',
        type: 'Quartz',
        isInHouse: true,
        frequencyVph: 32768,
        frequencyHz: 32768,
        jewels: 0,
        powerReserveHours: 26280, // 3 years
        finishing: ['Quartz Circuit Module'],
        escapement: 'Quartz Oscillator',
        certification: 'Factory Quartz Standard',
      };
    } else if (selectedTemplateKey === 'Custom Automatic') {
      baseCaliberInfo = {
        name: customCaliberName || 'Custom Automatic Caliber',
        maker: brand || 'Independent / OEM',
        type: 'Automatic',
        isInHouse: true,
        frequencyVph: 21600,
        frequencyHz: 3,
        jewels: 21,
        powerReserveHours: 40,
        finishing: ['Standard Brushed Rotor'],
        escapement: 'Lever Escapement',
        certification: 'Factory Regulated',
      };
    } else if (CALIBER_TEMPLATES[selectedTemplateKey]) {
      baseCaliberInfo = CALIBER_TEMPLATES[selectedTemplateKey];
    } else {
      baseCaliberInfo = {
        name: customCaliberName || 'Mechanical / Quartz Caliber',
        maker: brand,
        type: 'Automatic',
        isInHouse: true,
        frequencyVph: 21600,
        frequencyHz: 3,
        jewels: 21,
        powerReserveHours: 40,
        finishing: ['Standard Finish'],
        escapement: 'Lever Escapement',
        certification: 'Factory Standard',
      };
    }

    const newWatch: WatchItem = {
      id: `watch-${Date.now()}`,
      brand,
      model,
      nickname: nickname || undefined,
      referenceNumber: referenceNumber || 'REF-CUSTOM',
      yearOfProduction: Number(year),
      complications: ['Time Only'],
      caliber: {
        name: customCaliberName || baseCaliberInfo.name || 'Calibre In-House',
        maker: baseCaliberInfo.maker || brand,
        type: baseCaliberInfo.type || 'Automatic',
        isInHouse: baseCaliberInfo.isInHouse ?? true,
        frequencyVph: baseCaliberInfo.frequencyVph ?? 21600,
        frequencyHz: baseCaliberInfo.frequencyHz ?? 3,
        jewels: baseCaliberInfo.jewels ?? 21,
        powerReserveHours: baseCaliberInfo.powerReserveHours ?? 40,
        finishing: baseCaliberInfo.finishing ?? ['Brushed Finish'],
        escapement: baseCaliberInfo.escapement ?? 'Standard Lever',
        certification: baseCaliberInfo.certification,
      },
      dimensions: {
        caseDiameterMm: Number(caseDiameter),
        thicknessMm: Number(thickness),
        lugToLugMm: Number(lugToLug),
        lugWidthMm: Number(lugWidth),
      },
      waterResistanceMeters: Number(waterResistance),
      caseMaterial: 'Stainless Steel / Composite',
      crystalType: 'Scratch-Resistant Crystal',
      bezelType: 'Steel / Ceramic',
      dialColor: dialColor || 'Standard Dial',
      purchasePriceUsd: Number(purchasePrice),
      marketValueUsd: Number(marketValue),
      purchaseDate: new Date().toISOString().split('T')[0],
      boxAndPapers,
      serialNumberMasked: `${Math.floor(1000 + Math.random() * 9000)}****`,
      currentStrapId: 'strap-1',
      isFavorite: false,
      imageUrl,
      wearCount: 1,
      totalDaysWorn: 1,
      lastWornTimestamp: Date.now(),
      serviceHistory: [],
      accuracyLogs: [],
    };

    onAddWatch(newWatch);
    onClose();
  };

  return (
    <BottomSheet
      isOpen={true}
      onClose={onClose}
      title="Add Timepiece to Collection"
      subtitle="Input Specs, Caliber & Dimensions"
      icon={<Watch className="w-4 h-4" />}
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs text-slate-800">
        {/* Basic Brand & Model */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-mono-tech text-slate-500 font-bold block mb-1">
              Brand / Manufacturer *
            </label>
            <input
              type="text"
              placeholder="e.g. Seiko, Casio, Omega"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 focus:outline-indigo-500 shadow-2xs"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-mono-tech text-slate-500 font-bold block mb-1">
              Model / Line *
            </label>
            <input
              type="text"
              placeholder="e.g. SKX007, F-91W, Speedmaster"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 focus:outline-indigo-500 shadow-2xs"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-mono-tech text-slate-500 font-bold block mb-1">
              Collector Nickname
            </label>
            <input
              type="text"
              placeholder="e.g. Moonwatch, Captain Willard"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 focus:outline-indigo-500 shadow-2xs"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono-tech text-slate-500 font-bold block mb-1">
              Reference Number
            </label>
            <input
              type="text"
              placeholder="e.g. 310.30.42.50.01.002"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 focus:outline-indigo-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Caliber Engine Selection */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 space-y-2 shadow-2xs">
          <div className="flex items-center gap-1.5 text-indigo-600 font-mono-tech text-[11px]">
            <Wrench className="w-3.5 h-3.5" />
            <span className="font-bold">Movement & Caliber Architecture</span>
          </div>

          <div>
            <label className="text-[10px] font-mono-tech text-slate-500 font-bold block mb-1">
              Engine Preset / Architecture
            </label>
            <select
              value={selectedTemplateKey}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-800 text-xs focus:outline-indigo-500 shadow-2xs"
            >
              {Object.keys(CALIBER_TEMPLATES).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
              <option value="Custom Automatic">Custom Automatic (Mechanical)</option>
              <option value="Custom Quartz">Custom Quartz (Battery / Electronic)</option>
            </select>
          </div>
        </div>

        {/* Case Dimensions */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 space-y-2 shadow-2xs">
          <span className="text-[10px] font-mono-tech text-indigo-600 uppercase font-bold block">
            Case Dimensions (mm)
          </span>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="text-[9px] font-mono-tech text-slate-400 block font-semibold">Diameter</label>
              <input
                type="number"
                step="0.5"
                value={caseDiameter}
                onChange={(e) => setCaseDiameter(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl p-1.5 text-slate-800 text-center font-mono-tech shadow-2xs"
              />
            </div>
            <div>
              <label className="text-[9px] font-mono-tech text-slate-400 block font-semibold">Thickness</label>
              <input
                type="number"
                step="0.5"
                value={thickness}
                onChange={(e) => setThickness(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl p-1.5 text-slate-800 text-center font-mono-tech shadow-2xs"
              />
            </div>
            <div>
              <label className="text-[9px] font-mono-tech text-slate-400 block font-semibold">Lug-to-Lug</label>
              <input
                type="number"
                step="0.5"
                value={lugToLug}
                onChange={(e) => setLugToLug(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl p-1.5 text-slate-800 text-center font-mono-tech shadow-2xs"
              />
            </div>
            <div>
              <label className="text-[9px] font-mono-tech text-slate-400 block font-semibold">Lug Width</label>
              <input
                type="number"
                step="1"
                value={lugWidth}
                onChange={(e) => setLugWidth(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl p-1.5 text-indigo-600 text-center font-mono-tech font-bold shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Valuation & Provenance */}
        <div className="grid grid-cols-2 gap-2 font-mono-tech">
          <div>
            <label className="text-[10px] text-slate-500 font-bold block mb-1">Purchase Price ($)</label>
            <input
              type="number"
              value={purchasePrice}
              onChange={(e) => {
                const val = Number(e.target.value);
                setPurchasePrice(val);
                setMarketValue(val);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 shadow-2xs"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-bold block mb-1">Estimated Valuation ($)</label>
            <input
              type="number"
              value={marketValue}
              onChange={(e) => setMarketValue(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-indigo-600 font-bold shadow-2xs"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono-tech text-xs tracking-wider transition-all shadow-md mt-2"
        >
          Add Timepiece To Collection Box
        </button>
      </form>
    </BottomSheet>
  );
};
