import React, { useState } from 'react';
import { ShieldCheck, Printer, Download, Lock, Unlock, Award } from 'lucide-react';
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
      title="Vault Portfolio Appraisal Certificate"
      subtitle="Insurance-Grade Horology Asset Valuation"
      icon={<ShieldCheck className="w-4 h-4" />}
      maxHeightClass="max-h-[90vh]"
      headerAction={
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setUnmaskSerials(!unmaskSerials)}
            className="px-2.5 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-mono-tech flex items-center gap-1 transition-colors"
          >
            {unmaskSerials ? <Unlock className="w-3 h-3 text-amber-400" /> : <Lock className="w-3 h-3" />}
            <span>{unmaskSerials ? 'Mask' : 'Reveal'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-[11px] font-mono-tech flex items-center gap-1 transition-colors shadow-sm"
          >
            <Printer className="w-3 h-3" />
            <span>Print PDF</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4 text-xs font-sans">
        {/* Certificate Header Banner */}
        <div className="border border-amber-500/30 bg-amber-950/15 rounded-3xl p-4 flex items-start justify-between">
          <div>
            <span className="font-mono-tech text-[10px] text-amber-400 uppercase tracking-widest block">
              Official Valuation Summary
            </span>
            <h2 className="font-serif-luxury text-base font-bold text-neutral-100 mt-0.5">
              ChronoVault Asset Appraisal Record
            </h2>
            <p className="text-neutral-400 text-[10px] mt-1 font-mono-tech">
              Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-neutral-400 font-mono-tech block uppercase">Total Appraised Value</span>
            <span className="font-serif-luxury text-lg font-bold text-amber-300 font-mono-tech">
              ${metrics.totalMarketValue.toLocaleString()} USD
            </span>
            <span className="text-[10px] text-emerald-400 block font-mono-tech">
              {watches.length} Verified Pieces
            </span>
          </div>
        </div>

        {/* Breakdown of Every Single Watch */}
        <div className="space-y-2.5">
          <h3 className="font-serif-luxury text-xs font-bold text-neutral-200 uppercase tracking-wider">
            Itemized Schedule of Insured Articles
          </h3>

          <div className="space-y-2">
            {watches.map((watch, idx) => (
              <div
                key={watch.id}
                className="p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <span className="font-mono-tech font-bold text-neutral-500 text-[11px] mt-0.5">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-serif-luxury font-bold text-neutral-100 text-xs">
                        {watch.brand}
                      </span>
                      <span className="text-neutral-300 font-medium">
                        {watch.nickname || watch.model}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[10px] font-mono-tech text-neutral-400">
                      <span>Ref: {watch.referenceNumber || 'N/A'}</span>
                      <span>•</span>
                      <span>Caliber: {watch.caliber.reference}</span>
                      <span>•</span>
                      <span>
                        Serial:{' '}
                        <span className="text-amber-300 font-semibold">
                          {unmaskSerials ? watch.serialNumber || 'SN-CHRONO-88219' : '••••••••••••'}
                        </span>
                      </span>
                    </div>

                    <div className="mt-1 text-[10px] font-mono-tech text-neutral-500">
                      Case: {watch.dimensions.caseDiameterMm}mm • {watch.dimensions.caseMaterial} • {watch.hasBoxAndPapers ? 'Full Set Box & Papers' : 'Watch Only'}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 font-mono-tech">
                  <span className="font-bold text-neutral-100 text-xs block">
                    ${(watch.marketEstimatedValueUsd || watch.purchasePriceUsd).toLocaleString()}
                  </span>
                  <span className="text-[9px] text-neutral-500">
                    Purchased: {watch.purchaseDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certificate Footer */}
        <div className="pt-3 border-t border-neutral-800 text-[10px] text-neutral-500 font-mono-tech flex items-center justify-between">
          <span>ChronoVault Cryptographic Verification: 0x88F2...C419</span>
          <span>Compliant with NAWCC Standards</span>
        </div>
      </div>
    </BottomSheet>
  );
};
