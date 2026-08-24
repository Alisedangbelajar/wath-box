import React, { useState } from 'react';
import { Disc, Trash2 } from 'lucide-react';
import { StrapItem } from '../types';
import { BottomSheet } from './BottomSheet';

interface EditStrapModalProps {
  strap: StrapItem;
  onClose: () => void;
  onUpdateStrap: (updatedStrap: StrapItem) => void;
  onDeleteStrap?: (strapId: string) => void;
}

export const EditStrapModal: React.FC<EditStrapModalProps> = ({
  strap,
  onClose,
  onUpdateStrap,
  onDeleteStrap,
}) => {
  const [name, setName] = useState(strap.name);
  const [brand, setBrand] = useState(strap.brand);
  const [material, setMaterial] = useState<StrapItem['material']>(strap.material);
  const [color, setColor] = useState(strap.color);
  const [lugWidthMm, setLugWidthMm] = useState<number>(strap.lugWidthMm);
  const [buckleWidthMm, setBuckleWidthMm] = useState<number>(strap.buckleWidthMm);
  const [quickRelease, setQuickRelease] = useState<boolean>(strap.quickRelease);
  const [waterproof, setWaterproof] = useState<boolean>(strap.waterproof);
  const [priceUsd, setPriceUsd] = useState<number>(strap.priceUsd);
  const [imageUrl, setImageUrl] = useState<string>(strap.imageUrl);

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const updated: StrapItem = {
      ...strap,
      name,
      brand: brand || 'Independent Atelier',
      material,
      color: color || 'Classic Tone',
      lugWidthMm: Number(lugWidthMm),
      buckleWidthMm: Number(buckleWidthMm),
      quickRelease,
      waterproof,
      priceUsd: Number(priceUsd),
      imageUrl: imageUrl.trim() || strap.imageUrl,
    };

    onUpdateStrap(updated);
    onClose();
  };

  const handleDelete = () => {
    if (onDeleteStrap) {
      onDeleteStrap(strap.id);
      onClose();
    }
  };

  return (
    <BottomSheet
      isOpen={true}
      onClose={onClose}
      title={`Edit ${strap.name}`}
      subtitle="Update Strap Specifications & Wardrobe Info"
      icon={<Disc className="w-4 h-4" />}
    >
      <form onSubmit={handleSubmit} className="space-y-3 text-xs text-slate-800">
        <div>
          <label className="text-[10px] text-slate-500 font-mono-tech font-bold block mb-1">Strap Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 focus:outline-indigo-500 shadow-2xs"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-500 font-mono-tech font-bold block mb-1">Brand / Atelier</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 focus:outline-indigo-500 shadow-2xs"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-mono-tech font-bold block mb-1">Material</label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 focus:outline-indigo-500 shadow-2xs"
            >
              <option value="Horween Leather">Horween Leather</option>
              <option value="NATO Nylon">NATO Nylon</option>
              <option value="Tropic FKM Rubber">Tropic Rubber</option>
              <option value="Sailcloth">Sailcloth</option>
              <option value="Milanese Mesh">Mesh Bracelet</option>
              <option value="Alligator">Alligator</option>
              <option value="Suede">Suede</option>
              <option value="Oyster Steel">Steel Bracelet</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[10px] text-slate-500 font-mono-tech font-bold block mb-1">Lug Width (mm)</label>
            <select
              value={lugWidthMm}
              onChange={(e) => setLugWidthMm(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-indigo-600 font-mono-tech font-bold shadow-2xs"
            >
              <option value={18}>18mm</option>
              <option value={19}>19mm</option>
              <option value={20}>20mm</option>
              <option value={21}>21mm</option>
              <option value={22}>22mm</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-mono-tech font-bold block mb-1">Buckle (mm)</label>
            <input
              type="number"
              value={buckleWidthMm}
              onChange={(e) => setBuckleWidthMm(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 font-mono-tech text-center shadow-2xs"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-mono-tech font-bold block mb-1">Price ($)</label>
            <input
              type="number"
              value={priceUsd}
              onChange={(e) => setPriceUsd(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-indigo-600 font-mono-tech font-bold text-center shadow-2xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-500 font-mono-tech font-bold block mb-1">Color / Tone</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 shadow-2xs"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-mono-tech font-bold block mb-1">Photo Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 shadow-2xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 py-1">
          <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={quickRelease}
              onChange={(e) => setQuickRelease(e.target.checked)}
              className="accent-indigo-600 w-4 h-4 rounded cursor-pointer"
            />
            <span>Quick Release Spring Bars</span>
          </label>
          <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={waterproof}
              onChange={(e) => setWaterproof(e.target.checked)}
              className="accent-indigo-600 w-4 h-4 rounded cursor-pointer"
            />
            <span>Waterproof</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          {onDeleteStrap && !confirmDelete && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-mono-tech text-xs transition-colors flex items-center gap-1 shrink-0 shadow-2xs"
              title="Delete Strap"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {confirmDelete && (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleDelete}
                className="px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono-tech text-xs font-bold transition-all shadow-md"
              >
                Confirm Delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-2.5 py-2.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          )}

          <button
            type="submit"
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono-tech text-xs tracking-wider transition-all shadow-md"
          >
            Save Strap Changes
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};
