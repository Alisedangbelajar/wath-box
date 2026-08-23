import React, { useState } from 'react';
import { Watch, Wrench, Trash2 } from 'lucide-react';
import { WatchItem, CaliberType, BoxPapersStatus } from '../types';
import { BottomSheet } from './BottomSheet';

interface EditWatchModalProps {
  watch: WatchItem;
  onClose: () => void;
  onUpdateWatch: (updatedWatch: WatchItem) => void;
  onDeleteWatch?: (watchId: string) => void;
}

export const EditWatchModal: React.FC<EditWatchModalProps> = ({
  watch,
  onClose,
  onUpdateWatch,
  onDeleteWatch,
}) => {
  const [brand, setBrand] = useState(watch.brand);
  const [model, setModel] = useState(watch.model);
  const [nickname, setNickname] = useState(watch.nickname || '');
  const [referenceNumber, setReferenceNumber] = useState(watch.referenceNumber || '');
  const [yearOfProduction, setYearOfProduction] = useState<number>(watch.yearOfProduction);
  
  // Caliber
  const [caliberName, setCaliberName] = useState(watch.caliber.name);
  const [caliberType, setCaliberType] = useState<CaliberType>(watch.caliber.type);
  const [frequencyVph, setFrequencyVph] = useState<number>(watch.caliber.frequencyVph);
  const [powerReserveHours, setPowerReserveHours] = useState<number>(watch.caliber.powerReserveHours);
  const [jewels, setJewels] = useState<number>(watch.caliber.jewels);
  
  // Dimensions
  const [caseDiameter, setCaseDiameter] = useState<number>(watch.dimensions.caseDiameterMm);
  const [thickness, setThickness] = useState<number>(watch.dimensions.thicknessMm);
  const [lugToLug, setLugToLug] = useState<number>(watch.dimensions.lugToLugMm);
  const [lugWidth, setLugWidth] = useState<number>(watch.dimensions.lugWidthMm);
  
  // Valuation & Specs
  const [waterResistance, setWaterResistance] = useState<number>(watch.waterResistanceMeters);
  const [purchasePrice, setPurchasePrice] = useState<number>(watch.purchasePriceUsd);
  const [marketValue, setMarketValue] = useState<number>(watch.marketValueUsd);
  const [boxAndPapers, setBoxAndPapers] = useState<BoxPapersStatus>(watch.boxAndPapers);
  const [dialColor, setDialColor] = useState(watch.dialColor);
  const [imageUrl, setImageUrl] = useState(watch.imageUrl || '');

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model) return;

    const updated: WatchItem = {
      ...watch,
      brand,
      model,
      nickname: nickname.trim() || undefined,
      referenceNumber: referenceNumber.trim() || undefined,
      yearOfProduction: Number(yearOfProduction),
      dialColor,
      imageUrl: imageUrl.trim() || undefined,
      caliber: {
        ...watch.caliber,
        name: caliberName || 'Calibre',
        type: caliberType,
        frequencyVph: Number(frequencyVph),
        powerReserveHours: Number(powerReserveHours),
        jewels: Number(jewels),
      },
      dimensions: {
        caseDiameterMm: Number(caseDiameter),
        thicknessMm: Number(thickness),
        lugToLugMm: Number(lugToLug),
        lugWidthMm: Number(lugWidth),
      },
      waterResistanceMeters: Number(waterResistance),
      purchasePriceUsd: Number(purchasePrice),
      marketValueUsd: Number(marketValue),
      boxAndPapers,
    };

    onUpdateWatch(updated);
    onClose();
  };

  const handleDelete = () => {
    if (onDeleteWatch) {
      onDeleteWatch(watch.id);
      onClose();
    }
  };

  return (
    <BottomSheet
      isOpen={true}
      onClose={onClose}
      title={`Edit ${watch.brand} ${watch.nickname || watch.model}`}
      subtitle="Update Timepiece Specifications & Provenance"
      icon={<Watch className="w-4 h-4" />}
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        {/* Basic Brand & Model */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-mono-tech text-neutral-400 block mb-1">
              Brand / Manufacturer *
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-neutral-200 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-mono-tech text-neutral-400 block mb-1">
              Model / Line *
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-neutral-200 focus:outline-none focus:border-amber-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-mono-tech text-neutral-400 block mb-1">
              Collector Nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-neutral-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono-tech text-neutral-400 block mb-1">
              Reference Number
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-neutral-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Caliber & Movement Engine */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-amber-400 font-mono-tech text-[11px]">
            <Wrench className="w-3.5 h-3.5" />
            <span className="font-bold">Movement & Caliber Specifications</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-mono-tech text-neutral-400 block mb-1">Caliber Name</label>
              <input
                type="text"
                value={caliberName}
                onChange={(e) => setCaliberName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-1.5 text-neutral-200 text-xs"
              />
            </div>
            <div>
              <label className="text-[9px] font-mono-tech text-neutral-400 block mb-1">Movement Type</label>
              <select
                value={caliberType}
                onChange={(e) => {
                  const newType = e.target.value as CaliberType;
                  setCaliberType(newType);
                  if (newType === 'Quartz') {
                    setFrequencyVph(32768);
                  } else if (newType === 'Automatic' || newType === 'Manual Wind') {
                    if (frequencyVph === 32768 || frequencyVph === 0) setFrequencyVph(21600);
                  }
                }}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-1.5 text-neutral-200 text-xs"
              >
                <option value="Automatic">Automatic</option>
                <option value="Manual Wind">Manual Wind</option>
                <option value="Quartz">Quartz</option>
                <option value="Spring Drive">Spring Drive</option>
                <option value="Solar Quartz">Solar Quartz</option>
                <option value="Kinetic">Kinetic</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[9px] font-mono-tech text-neutral-500 block">Frequency (vph)</label>
              <input
                type="number"
                value={frequencyVph}
                onChange={(e) => setFrequencyVph(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-1.5 text-neutral-200 text-center font-mono-tech text-xs"
              />
            </div>
            <div>
              <label className="text-[9px] font-mono-tech text-neutral-500 block">Reserve (Hours)</label>
              <input
                type="number"
                value={powerReserveHours}
                onChange={(e) => setPowerReserveHours(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-1.5 text-neutral-200 text-center font-mono-tech text-xs"
              />
            </div>
            <div>
              <label className="text-[9px] font-mono-tech text-neutral-500 block">Jewels</label>
              <input
                type="number"
                value={jewels}
                onChange={(e) => setJewels(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-1.5 text-neutral-200 text-center font-mono-tech text-xs"
              />
            </div>
          </div>
        </div>

        {/* Case Dimensions */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-3 space-y-2">
          <span className="text-[10px] font-mono-tech text-amber-400 uppercase font-bold block">
            Case Dimensions (mm)
          </span>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="text-[9px] font-mono-tech text-neutral-500 block">Diameter</label>
              <input
                type="number"
                step="0.5"
                value={caseDiameter}
                onChange={(e) => setCaseDiameter(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-1.5 text-neutral-200 text-center font-mono-tech"
              />
            </div>
            <div>
              <label className="text-[9px] font-mono-tech text-neutral-500 block">Thickness</label>
              <input
                type="number"
                step="0.5"
                value={thickness}
                onChange={(e) => setThickness(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-1.5 text-neutral-200 text-center font-mono-tech"
              />
            </div>
            <div>
              <label className="text-[9px] font-mono-tech text-neutral-500 block">Lug-to-Lug</label>
              <input
                type="number"
                step="0.5"
                value={lugToLug}
                onChange={(e) => setLugToLug(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-1.5 text-neutral-200 text-center font-mono-tech"
              />
            </div>
            <div>
              <label className="text-[9px] font-mono-tech text-neutral-500 block">Lug Width</label>
              <input
                type="number"
                step="1"
                value={lugWidth}
                onChange={(e) => setLugWidth(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-1.5 text-amber-300 text-center font-mono-tech font-bold"
              />
            </div>
          </div>
        </div>

        {/* Valuation & Specs */}
        <div className="grid grid-cols-3 gap-2 font-mono-tech">
          <div>
            <label className="text-[9px] text-neutral-400 block mb-1">Purchase ($)</label>
            <input
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(Number(e.target.value))}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-neutral-200"
            />
          </div>
          <div>
            <label className="text-[9px] text-neutral-400 block mb-1">Valuation ($)</label>
            <input
              type="number"
              value={marketValue}
              onChange={(e) => setMarketValue(Number(e.target.value))}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-amber-300 font-bold"
            />
          </div>
          <div>
            <label className="text-[9px] text-neutral-400 block mb-1">WR (Meters)</label>
            <input
              type="number"
              value={waterResistance}
              onChange={(e) => setWaterResistance(Number(e.target.value))}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-neutral-200"
            />
          </div>
        </div>

        {/* Photo URL / Dial Description */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-mono-tech text-neutral-400 block mb-1">Dial Finish</label>
            <input
              type="text"
              value={dialColor}
              onChange={(e) => setDialColor(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-neutral-200"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono-tech text-neutral-400 block mb-1">Box & Papers</label>
            <select
              value={boxAndPapers}
              onChange={(e) => setBoxAndPapers(e.target.value as BoxPapersStatus)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-neutral-200"
            >
              <option value="Full Set (Box & Papers)">Full Set (Box & Papers)</option>
              <option value="Box Only">Box Only</option>
              <option value="Papers Only">Papers Only</option>
              <option value="Watch Only">Watch Only</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          {onDeleteWatch && !confirmDelete && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="px-3 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-800/60 text-red-300 font-mono-tech text-xs transition-colors flex items-center gap-1 shrink-0"
              title="Delete Watch"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {confirmDelete && (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono-tech text-xs font-bold transition-all shadow-md"
              >
                Confirm Delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs"
              >
                Cancel
              </button>
            </div>
          )}

          <button
            type="submit"
            className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold font-mono-tech text-xs tracking-wider transition-all shadow-lg"
          >
            Save Changes
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};
