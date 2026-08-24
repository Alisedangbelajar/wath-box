import React, { useState } from 'react';
import { 
  Images, 
  Watch, 
  Calendar, 
  Camera, 
  Maximize2, 
  X, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { WatchItem, StrapItem, WearLogEntry } from '../types';
import { BottomSheet } from './BottomSheet';

interface WatchGalleryModalProps {
  watches: WatchItem[];
  straps: StrapItem[];
  wearLogs: WearLogEntry[];
  onClose: () => void;
  onSelectWatch: (watch: WatchItem) => void;
  onOpenPhotoModal?: () => void;
}

export const WatchGalleryModal: React.FC<WatchGalleryModalProps> = ({
  watches,
  straps,
  wearLogs,
  onClose,
  onSelectWatch,
  onOpenPhotoModal,
}) => {
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'watches' | 'wristChecks'>('all');
  const [activePhoto, setActivePhoto] = useState<{
    url: string;
    title: string;
    subtitle: string;
    watchId?: string;
    date?: string;
  } | null>(null);

  // Compile items
  const watchPhotos = watches
    .filter((w) => !!w.imageUrl)
    .map((w) => ({
      id: `w-${w.id}`,
      type: 'watch' as const,
      url: w.imageUrl!,
      title: `${w.brand} ${w.nickname || w.model}`,
      subtitle: `${w.dimensions.caseDiameterMm}mm • ${w.caliber.type} • ${w.dialColor}`,
      watchId: w.id,
      date: `Acquired ${w.purchaseDate || '2023'}`,
    }));

  const wristCheckPhotos = wearLogs
    .filter((l) => !!l.photoUrl)
    .map((l) => {
      const w = watches.find((watch) => watch.id === l.watchId);
      const s = straps.find((strap) => strap.id === l.strapId);
      return {
        id: `log-${l.id}`,
        type: 'wristCheck' as const,
        url: l.photoUrl!,
        title: w ? `${w.brand} - ${w.nickname || w.model}` : 'Timepiece on Wrist',
        subtitle: `${l.occasion} ${s ? `• ${s.name}` : ''}`,
        watchId: l.watchId,
        date: l.dateStr || 'Recent',
      };
    });

  const allItems = [...wristCheckPhotos, ...watchPhotos];

  const filteredItems = galleryFilter === 'all'
    ? allItems
    : galleryFilter === 'watches'
    ? watchPhotos
    : wristCheckPhotos;

  return (
    <BottomSheet
      isOpen={true}
      onClose={onClose}
      title="Horology Photo Gallery"
      subtitle="Visual Archive of Timepieces & Wrist Checks"
      icon={<Images className="w-4 h-4" />}
      headerAction={
        onOpenPhotoModal && (
          <button
            onClick={() => {
              onClose();
              onOpenPhotoModal();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-600 text-xs font-mono-tech font-bold transition-all shadow-2xs"
          >
            <Camera className="w-3.5 h-3.5 text-indigo-600" />
            <span>+ Snap</span>
          </button>
        )
      }
    >
      <div className="space-y-3.5 text-slate-800">
        {/* Category Filters */}
        <div className="flex items-center justify-between bg-slate-100 p-1 rounded-2xl border border-slate-200/80 text-[11px] font-mono-tech">
          <button
            onClick={() => setGalleryFilter('all')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              galleryFilter === 'all'
                ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All Photos ({allItems.length})
          </button>
          <button
            onClick={() => setGalleryFilter('watches')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              galleryFilter === 'watches'
                ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Timepieces ({watchPhotos.length})
          </button>
          <button
            onClick={() => setGalleryFilter('wristChecks')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              galleryFilter === 'wristChecks'
                ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Wrist Checks ({wristCheckPhotos.length})
          </button>
        </div>

        {/* Gallery Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5">
            {filteredItems.map((item) => {
              const matchedWatch = item.watchId ? watches.find((w) => w.id === item.watchId) : undefined;

              return (
                <div
                  key={item.id}
                  onClick={() => setActivePhoto(item)}
                  className="group relative rounded-2xl overflow-hidden bg-white border border-slate-200 hover:border-indigo-500/60 cursor-pointer shadow-2xs transition-all flex flex-col"
                >
                  <div className="relative h-36 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

                    {/* Tag badge */}
                    <div className="absolute top-2 left-2">
                      <span className="bg-white/90 backdrop-blur-xs text-[9px] font-mono-tech font-bold px-2 py-0.5 rounded-full text-indigo-700 border border-slate-200 shadow-2xs">
                        {item.type === 'watch' ? 'Piece Dossier' : 'Wrist Check'}
                      </span>
                    </div>

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg bg-black/60 text-white">
                      <Maximize2 className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  <div className="p-2.5 bg-white flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif-luxury text-xs font-bold text-slate-800 truncate">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono-tech truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[9px] font-mono-tech text-slate-400">
                      <span>{item.date}</span>
                      {matchedWatch && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                            onSelectWatch(matchedWatch);
                          }}
                          className="text-indigo-600 font-bold hover:underline flex items-center gap-0.5"
                        >
                          Specs <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-2">
            <Camera className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-700 font-medium">No gallery photos yet</p>
            <p className="text-[10px] text-slate-400 font-mono-tech">
              Upload wrist shots or snap watch photos with the + Snap button.
            </p>
          </div>
        )}
      </div>

      {/* Fullscreen Photo Modal */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-70 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl space-y-3"
          >
            <div className="relative">
              <img
                src={activePhoto.url}
                alt={activePhoto.title}
                className="w-full max-h-[60vh] object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setActivePhoto(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 pt-1 space-y-2">
              <div>
                <h4 className="font-serif-luxury text-base font-bold text-slate-800">
                  {activePhoto.title}
                </h4>
                <p className="text-xs text-indigo-600 font-mono-tech font-semibold mt-0.5">
                  {activePhoto.subtitle}
                </p>
                <p className="text-[10px] text-slate-400 font-mono-tech mt-0.5">
                  {activePhoto.date}
                </p>
              </div>

              {activePhoto.watchId && (
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => {
                      const w = watches.find((watch) => watch.id === activePhoto.watchId);
                      setActivePhoto(null);
                      onClose();
                      if (w) onSelectWatch(w);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono-tech text-xs transition-all flex items-center gap-1 shadow-2xs"
                  >
                    <Watch className="w-3 h-3" />
                    <span>Open Watch Specs</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </BottomSheet>
  );
};
