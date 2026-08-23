import React, { useState, useEffect } from 'react';
import { ActiveTab, WatchItem, StrapItem, WearLogEntry, AccuracyLogEntry, WearOccasion } from './types';
import { SAMPLE_WATCHES, SAMPLE_STRAPS, SAMPLE_WEAR_LOGS } from './data/sampleData';
import { MobileFrame } from './components/MobileFrame';
import { WatchBoxView } from './components/WatchBoxView';
import { WatchDetailModal } from './components/WatchDetailModal';
import { AccuracyLab } from './components/AccuracyLab';
import { WotdLogger } from './components/WotdLogger';
import { AddWatchModal } from './components/AddWatchModal';
import { InsuranceExportModal } from './components/InsuranceExportModal';
import { PhotoRecognitionModal } from './components/PhotoRecognitionModal';
import { WatchGalleryModal } from './components/WatchGalleryModal';
import { getDaysSinceLastWorn } from './utils/calculations';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('box');
  const [watches, setWatches] = useState<WatchItem[]>(() => {
    const saved = localStorage.getItem('chronovault_watches');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved watches', e);
      }
    }
    return SAMPLE_WATCHES;
  });

  const [straps, setStraps] = useState<StrapItem[]>(() => {
    const saved = localStorage.getItem('chronovault_straps');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved straps', e);
      }
    }
    return SAMPLE_STRAPS;
  });

  const [wearLogs, setWearLogs] = useState<WearLogEntry[]>(() => {
    const saved = localStorage.getItem('chronovault_wear_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved wear logs', e);
      }
    }
    return SAMPLE_WEAR_LOGS;
  });

  const [todayWotdId, setTodayWotdId] = useState<string | null>(() => {
    return 'watch-3'; // Submariner default WOTD
  });

  const [selectedWatchForModal, setSelectedWatchForModal] = useState<WatchItem | null>(null);
  const [isAddWatchOpen, setIsAddWatchOpen] = useState<boolean>(false);
  const [isInsuranceOpen, setIsInsuranceOpen] = useState<boolean>(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState<boolean>(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [addWatchPrefill, setAddWatchPrefill] = useState<{
    photoUrl?: string;
    brand?: string;
    dial?: string;
  }>({});

  // Calculate neglected watches count (>14 days without wear)
  const neglectedCount = watches.filter((w) => getDaysSinceLastWorn(w.lastWornTimestamp) > 14).length;

  // Persistence to local storage
  useEffect(() => {
    localStorage.setItem('chronovault_watches', JSON.stringify(watches));
  }, [watches]);

  useEffect(() => {
    localStorage.setItem('chronovault_straps', JSON.stringify(straps));
  }, [straps]);

  useEffect(() => {
    localStorage.setItem('chronovault_wear_logs', JSON.stringify(wearLogs));
  }, [wearLogs]);

  // Update existing watch
  const handleUpdateWatch = (updatedWatch: WatchItem) => {
    setWatches((prev) => prev.map((w) => (w.id === updatedWatch.id ? updatedWatch : w)));
    if (selectedWatchForModal?.id === updatedWatch.id) {
      setSelectedWatchForModal(updatedWatch);
    }
  };

  // Delete watch
  const handleDeleteWatch = (watchId: string) => {
    setWatches((prev) => prev.filter((w) => w.id !== watchId));
    if (selectedWatchForModal?.id === watchId) {
      setSelectedWatchForModal(null);
    }
    if (todayWotdId === watchId) {
      setTodayWotdId(null);
    }
  };

  // Update existing strap
  const handleUpdateStrap = (updatedStrap: StrapItem) => {
    setStraps((prev) => prev.map((s) => (s.id === updatedStrap.id ? updatedStrap : s)));
  };

  // Delete strap
  const handleDeleteStrap = (strapId: string) => {
    setStraps((prev) => prev.filter((s) => s.id !== strapId));
  };

  // Set WOTD action
  const handleSetWotd = (watchId: string) => {
    setTodayWotdId(watchId);
    setWatches((prev) =>
      prev.map((w) =>
        w.id === watchId
          ? {
              ...w,
              totalDaysWorn: w.totalDaysWorn + 1,
              wearCount: w.wearCount + 1,
              lastWornTimestamp: Date.now(),
            }
          : w
      )
    );

    const watch = watches.find((w) => w.id === watchId);
    if (watch) {
      const newLog: WearLogEntry = {
        id: `wl-${Date.now()}`,
        timestamp: Date.now(),
        dateStr: 'Today',
        watchId: watch.id,
        strapId: watch.currentStrapId,
        occasion: 'Daily / Office',
        rating: 5,
        notes: `Logged as Watch of the Day`,
      };
      setWearLogs((prev) => [newLog, ...prev]);
    }
  };

  // Detailed Log Wear with occasion & photo
  const handleLogWearDetailed = (
    watchId: string,
    strapId: string,
    occasion: WearOccasion,
    note?: string
  ) => {
    setTodayWotdId(watchId);
    setWatches((prev) =>
      prev.map((w) =>
        w.id === watchId
          ? {
              ...w,
              totalDaysWorn: w.totalDaysWorn + 1,
              wearCount: w.wearCount + 1,
              lastWornTimestamp: Date.now(),
            }
          : w
      )
    );

    const newLog: WearLogEntry = {
      id: `wl-${Date.now()}`,
      timestamp: Date.now(),
      dateStr: 'Today',
      watchId,
      strapId,
      occasion,
      rating: 5,
      notes: note,
    };
    setWearLogs((prev) => [newLog, ...prev]);
  };

  // Log wear with photo from the recognition scanner
  const handleLogWearWithPhoto = (
    watchId: string,
    strapId: string,
    occasion: WearOccasion,
    photoUrl: string,
    note?: string
  ) => {
    handleLogWearDetailed(watchId, strapId, occasion, note);
  };

  // Add Accuracy Log to specific watch
  const handleAddAccuracyLog = (
    watchId: string,
    logData: Omit<AccuracyLogEntry, 'id' | 'timestamp'>
  ) => {
    const newEntry: AccuracyLogEntry = {
      ...logData,
      id: `acc-${Date.now()}`,
      timestamp: Date.now(),
    };

    setWatches((prev) =>
      prev.map((w) =>
        w.id === watchId
          ? {
              ...w,
              accuracyLogs: [newEntry, ...w.accuracyLogs],
            }
          : w
      )
    );

    if (selectedWatchForModal && selectedWatchForModal.id === watchId) {
      setSelectedWatchForModal((prev) =>
        prev ? { ...prev, accuracyLogs: [newEntry, ...prev.accuracyLogs] } : null
      );
    }
  };

  // Mount strap to watch
  const handleMountStrap = (watchId: string, strapId: string) => {
    setWatches((prev) =>
      prev.map((w) => (w.id === watchId ? { ...w, currentStrapId: strapId } : w))
    );
  };

  // Add new strap
  const handleAddStrap = (newStrapData: Omit<StrapItem, 'id'>) => {
    const newStrap: StrapItem = {
      ...newStrapData,
      id: `strap-${Date.now()}`,
    };
    setStraps((prev) => [...prev, newStrap]);
  };

  // Add new watch
  const handleAddWatch = (newWatch: WatchItem) => {
    setWatches((prev) => [newWatch, ...prev]);
  };

  // Handler to jump and scroll down to the neglected watches alert in Watch Rotation
  const handleJumpToNeglected = () => {
    setActiveTab('wotd');
    setTimeout(() => {
      const el = document.getElementById('neglected-watches-alert');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-amber-400', 'shadow-2xl');
        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-amber-400', 'shadow-2xl');
        }, 3000);
      }
    }, 120);
  };

  return (
    <MobileFrame
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onOpenAddWatch={() => {
        setAddWatchPrefill({});
        setIsAddWatchOpen(true);
      }}
      onOpenInsurance={() => setIsInsuranceOpen(true)}
      neglectedCount={neglectedCount}
      onJumpToNeglected={handleJumpToNeglected}
      onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
    >
      {/* 1. Collection Tab (Watches & Straps with 3-button Swipe/Scroll pattern) */}
      {(activeTab === 'box' || activeTab === 'sotc') && (
        <WatchBoxView
          watches={watches}
          straps={straps}
          onSelectWatch={(watch) => setSelectedWatchForModal(watch)}
          onSetWotd={handleSetWotd}
          todayWotdId={todayWotdId}
          onOpenAddWatch={() => {
            setAddWatchPrefill({});
            setIsAddWatchOpen(true);
          }}
          onOpenInsurance={() => setIsInsuranceOpen(true)}
          onMountStrap={handleMountStrap}
          onAddStrap={handleAddStrap}
          onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
          onOpenGallery={() => setIsGalleryOpen(true)}
        />
      )}

      {/* 2. Watch Rotation Hub */}
      {activeTab === 'wotd' && (
        <WotdLogger
          watches={watches}
          straps={straps}
          wearLogs={wearLogs}
          todayWotdId={todayWotdId}
          onSetWotd={handleSetWotd}
          onLogWear={handleLogWearDetailed}
          onSelectWatch={(watch) => setSelectedWatchForModal(watch)}
          onMountStrap={handleMountStrap}
          onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
        />
      )}

      {/* 3. Positional Rate & Accuracy Lab */}
      {activeTab === 'lab' && (
        <AccuracyLab
          watches={watches}
          onAddAccuracyLog={handleAddAccuracyLog}
        />
      )}

      {/* Watch Detail Dossier Modal (Accessible whenever opening any watch in Collection or Rotation) */}
      {selectedWatchForModal && (
        <WatchDetailModal
          watch={selectedWatchForModal}
          straps={straps}
          onClose={() => setSelectedWatchForModal(null)}
          onSetWotd={handleSetWotd}
          onAddAccuracyLog={handleAddAccuracyLog}
          isTodayWotd={todayWotdId === selectedWatchForModal.id}
          onUpdateWatch={handleUpdateWatch}
          onDeleteWatch={handleDeleteWatch}
        />
      )}

      {/* Watch Photo Gallery Modal */}
      {isGalleryOpen && (
        <WatchGalleryModal
          watches={watches}
          straps={straps}
          wearLogs={wearLogs}
          onClose={() => setIsGalleryOpen(false)}
          onSelectWatch={(watch) => {
            setIsGalleryOpen(false);
            setSelectedWatchForModal(watch);
          }}
          onOpenPhotoModal={() => {
            setIsGalleryOpen(false);
            setIsPhotoModalOpen(true);
          }}
        />
      )}

      {/* Add Watch Modal */}
      {isAddWatchOpen && (
        <AddWatchModal
          onClose={() => setIsAddWatchOpen(false)}
          onAddWatch={handleAddWatch}
          initialPhotoUrl={addWatchPrefill.photoUrl}
          initialBrand={addWatchPrefill.brand}
          initialDial={addWatchPrefill.dial}
        />
      )}

      {/* Insurance Appraisal Document Modal */}
      {isInsuranceOpen && (
        <InsuranceExportModal
          watches={watches}
          onClose={() => setIsInsuranceOpen(false)}
        />
      )}

      {/* Visual Wrist Photo & Recognition Modal */}
      {isPhotoModalOpen && (
        <PhotoRecognitionModal
          watches={watches}
          straps={straps}
          onClose={() => setIsPhotoModalOpen(false)}
          onLogWearWithPhoto={handleLogWearWithPhoto}
          onOpenAddNewWithPhoto={(photoUrl, detectedBrand, detectedDial) => {
            setAddWatchPrefill({ photoUrl, brand: detectedBrand, dial: detectedDial });
            setIsAddWatchOpen(true);
          }}
        />
      )}
    </MobileFrame>
  );
}
