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
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-mono-tech font-bold transition-all"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Snap</span>
          </button>
        )
      }
    >
      <div className="space-y-3.5">
        {/* Category Filters */}
        <div className="flex items-center justify-between bg-neutral-900 p-1 rounded-2xl border border-neutral-800 text-[11px] font-mono-tech">
          <button
            onClick={() => setGalleryFilter('all')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              galleryFilter === 'all'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            All Photos ({allItems.length})
          </button>
          <button
            onClick={() => setGalleryFilter('watches')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              galleryFilter === 'watches'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Timepieces ({watchPhotos.length})
          </button>
          <button
            onClick={() => setGalleryFilter('wristChecks')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              galleryFilter === 'wristChecks'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
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
                  className="group relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-amber-500/60 cursor-pointer shadow-md transition-all flex flex-col"
                >
                  <div className="relative h-36 w-full bg-neutral-950 overflow-hidden">
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/20 pointer-events-none" />

                    {/* Tag badge */}
                    <div className="absolute top-2 left-2">
                      <span className="bg-black/80 backdrop-blur text-[9px] font-mono-tech px-2 py-0.5 rounded-full text-amber-300 border border-neutral-700">
                        {item.type === 'watch' ? 'Piece Dossier' : 'Wrist Check'}
                      </span>
                    </div>

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg bg-black/70 text-white">
                      <Maximize2 className="w-3 h-3 text-amber-300" />
                    </div>
                  </div>

                  <div className="p-2.5 bg-neutral-900/90 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif-luxury text-xs font-bold text-neutral-100 truncate">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-mono-tech truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-neutral-800 text-[9px] font-mono-tech text-neutral-500">
                      <span>{item.date}</span>
                      {matchedWatch && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                            onSelectWatch(matchedWatch);
                          }}
                          className="text-amber-400 hover:underline flex items-center gap-0.5"
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
          <div className="text-center py-10 bg-neutral-900/50 rounded-2xl border border-neutral-800 p-6 space-y-2">
            <Camera className="w-8 h-8 text-neutral-600 mx-auto" />
            <p className="text-xs text-neutral-300 font-medium">No gallery photos yet</p>
            <p className="text-[10px] text-neutral-500 font-mono-tech">
              Upload wrist shots or snap watch photos with the + Photo button.
            </p>
          </div>
        )}
      </div>

      {/* Fullscreen Photo Modal */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-70 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl space-y-3"
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
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 pt-1 space-y-2">
              <div>
                <h4 className="font-serif-luxury text-base font-bold text-neutral-100">
                  {activePhoto.title}
                </h4>
                <p className="text-xs text-amber-300/90 font-mono-tech mt-0.5">
                  {activePhoto.subtitle}
                </p>
                <p className="text-[10px] text-neutral-500 font-mono-tech mt-0.5">
                  {activePhoto.date}
                </p>
              </div>

              {activePhoto.watchId && (
                <div className="pt-2 border-t border-neutral-800 flex justify-end">
                  <button
                    onClick={() => {
                      const w = watches.find((watch) => watch.id === activePhoto.watchId);
                      setActivePhoto(null);
                      onClose();
                      if (w) onSelectWatch(w);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold font-mono-tech text-xs transition-all flex items-center gap-1"
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
