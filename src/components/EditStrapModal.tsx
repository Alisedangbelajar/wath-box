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
      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div>
          <label className="text-[10px] text-neutral-400 font-mono-tech block mb-1">Strap Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-neutral-200 focus:outline-none focus:border-amber-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-neutral-400 font-mono-tech block mb-1">Brand / Atelier</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-neutral-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[10px] text-neutral-400 font-mono-tech block mb-1">Material</label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value as any)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-neutral-200 focus:outline-none focus:border-amber-500"
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
            <label className="text-[10px] text-neutral-400 font-mono-tech block mb-1">Lug Width (mm)</label>
            <select
              value={lugWidthMm}
              onChange={(e) => setLugWidthMm(Number(e.target.value))}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-neutral-200 font-mono-tech"
            >
              <option value={18}>18mm</option>
              <option value={19}>19mm</option>
              <option value={20}>20mm</option>
              <option value={21}>21mm</option>
              <option value={22}>22mm</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-neutral-400 font-mono-tech block mb-1">Buckle (mm)</label>
            <input
              type="number"
              value={buckleWidthMm}
              onChange={(e) => setBuckleWidthMm(Number(e.target.value))}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-neutral-200 font-mono-tech text-center"
            />
          </div>

          <div>
            <label className="text-[10px] text-neutral-400 font-mono-tech block mb-1">Price ($)</label>
            <input
              type="number"
              value={priceUsd}
              onChange={(e) => setPriceUsd(Number(e.target.value))}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-amber-300 font-mono-tech font-bold text-center"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-neutral-400 font-mono-tech block mb-1">Color / Tone</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-neutral-200"
            />
          </div>

          <div>
            <label className="text-[10px] text-neutral-400 font-mono-tech block mb-1">Photo Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-neutral-200"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 py-1">
          <label className="flex items-center gap-1.5 text-[11px] text-neutral-300">
            <input
              type="checkbox"
              checked={quickRelease}
              onChange={(e) => setQuickRelease(e.target.checked)}
              className="accent-amber-500"
            />
            <span>Quick Release Spring Bars</span>
          </label>
          <label className="flex items-center gap-1.5 text-[11px] text-neutral-300">
            <input
              type="checkbox"
              checked={waterproof}
              onChange={(e) => setWaterproof(e.target.checked)}
              className="accent-amber-500"
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
              className="px-3 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-800/60 text-red-300 font-mono-tech text-xs transition-colors flex items-center gap-1 shrink-0"
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
            Save Strap Changes
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};
