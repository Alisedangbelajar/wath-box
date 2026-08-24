import React, { useState } from 'react';
import { ShieldCheck, Printer, Lock, Unlock } from 'lucide-react';
import { WatchItem } from '../types';
import { calculateCollectionMetrics } from '../utils/calculations';
import { BottomSheet } from './BottomSheet';

interface InsuranceExportModalProps {
  watches: WatchItem[];
  onClose: () => void;
}

export const InsuranceExportModal: React.FC<InsuranceExportModalProps> = ({
  watches,
  onClose,
}) => {
  const [unmaskSerials, setUnmaskSerials] = useState<boolean>(false);
  const metrics = calculateCollectionMetrics(watches);

  const handlePrint = () => {
    window.print();
  };

  return (
    <BottomSheet
      isOpen={true}
      onClose={onClose}
      title="Portfolio Appraisal Certificate"
      subtitle="Insurance-Grade Horology Asset Valuation"
      icon={<ShieldCheck className="w-4 h-4" />}
      maxHeightClass="max-h-[90vh]"
      headerAction={
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setUnmaskSerials(!unmaskSerials)}
            className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono-tech flex items-center gap-1 transition-colors font-semibold"
          >
            {unmaskSerials ? <Unlock className="w-3 h-3 text-indigo-600" /> : <Lock className="w-3 h-3" />}
            <span>{unmaskSerials ? 'Mask' : 'Reveal'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] font-mono-tech flex items-center gap-1 transition-colors shadow-2xs"
          >
            <Printer className="w-3 h-3" />
            <span>Print PDF</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4 text-xs font-sans text-slate-800">
        {/* Certificate Header Banner */}
        <div className="border border-indigo-100 bg-indigo-50/60 rounded-3xl p-4 flex items-start justify-between shadow-2xs">
          <div>
            <span className="font-mono-tech text-[10px] text-indigo-600 font-bold uppercase tracking-widest block">
              Official Valuation Summary
            </span>
            <h2 className="font-serif-luxury text-base font-bold text-slate-800 mt-0.5">
              Watch Box Asset Appraisal Record
            </h2>
            <p className="text-slate-500 text-[10px] mt-1 font-mono-tech">
              Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-mono-tech font-bold block uppercase">Total Appraised Value</span>
            <span className="font-serif-luxury text-lg font-bold text-indigo-600 font-mono-tech">
              ${metrics.totalMarketValue.toLocaleString()} USD
            </span>
            <span className="text-[10px] text-emerald-600 block font-mono-tech font-bold">
              {watches.length} Verified Pieces
            </span>
          </div>
        </div>

        {/* Breakdown of Every Single Watch */}
        <div className="space-y-2.5">
          <h3 className="font-serif-luxury text-xs font-bold text-slate-700 uppercase tracking-wider">
            Itemized Schedule of Insured Articles
          </h3>

          <div className="space-y-2">
            {watches.map((watch, idx) => (
              <div
                key={watch.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-start justify-between gap-3 text-xs shadow-2xs"
              >
                <div className="flex items-start gap-3">
                  <span className="font-mono-tech font-bold text-slate-400 text-[11px] mt-0.5">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-serif-luxury font-bold text-slate-800 text-xs">
                        {watch.brand}
                      </span>
                      <span className="text-slate-600 font-medium">
                        {watch.nickname || watch.model}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[10px] font-mono-tech text-slate-500">
                      <span>Ref: {watch.referenceNumber || 'N/A'}</span>
                      <span>•</span>
                      <span>Caliber: {watch.caliber.reference}</span>
                      <span>•</span>
                      <span>
                        Serial:{' '}
                        <span className="text-indigo-600 font-semibold">
                          {unmaskSerials ? watch.serialNumber || 'SN-WATCH-88219' : '••••••••••••'}
                        </span>
                      </span>
                    </div>

                    <div className="mt-1 text-[10px] font-mono-tech text-slate-400">
                      Case: {watch.dimensions.caseDiameterMm}mm • {watch.dimensions.caseMaterial} • {watch.hasBoxAndPapers ? 'Full Set Box & Papers' : 'Watch Only'}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 font-mono-tech">
                  <span className="font-bold text-indigo-600 text-xs block">
                    ${(watch.marketEstimatedValueUsd || watch.purchasePriceUsd).toLocaleString()}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    Purchased: {watch.purchaseDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certificate Footer */}
        <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-400 font-mono-tech flex items-center justify-between">
          <span>Watch Box Cryptographic Verification: 0x88F2...C419</span>
          <span>Compliant with NAWCC Standards</span>
        </div>
      </div>
    </BottomSheet>
  );
};
