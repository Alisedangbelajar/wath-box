import { WatchItem, WearLogEntry } from '../types';

export function calculateCollectionMetrics(watches: WatchItem[]) {
  const totalPurchaseValue = watches.reduce((sum, w) => sum + w.purchasePriceUsd, 0);
  const totalMarketValue = watches.reduce((sum, w) => sum + w.marketValueUsd, 0);
  const totalWears = watches.reduce((sum, w) => sum + w.totalDaysWorn, 0);
  const valueDelta = totalMarketValue - totalPurchaseValue;
  const valueDeltaPercent = totalPurchaseValue > 0 ? (valueDelta / totalPurchaseValue) * 100 : 0;

  return {
    totalWatches: watches.length,
    totalPurchaseValue,
    totalMarketValue,
    totalWears,
    valueDelta,
    valueDeltaPercent,
    averageCostPerWear: totalWears > 0 ? totalPurchaseValue / totalWears : 0,
  };
}

export function calculateWatchCostPerWear(watch: WatchItem): number {
  if (!watch.totalDaysWorn || watch.totalDaysWorn <= 0) {
    return watch.purchasePriceUsd;
  }
  return watch.purchasePriceUsd / watch.totalDaysWorn;
}

export function getDaysSinceLastWorn(lastWornTimestamp: number): number {
  if (!lastWornTimestamp) return 999;
  const diffMs = Date.now() - lastWornTimestamp;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function getWristSharePercentage(watch: WatchItem, allWatches: WatchItem[]): number {
  const totalCollectionWears = allWatches.reduce((sum, w) => sum + w.totalDaysWorn, 0);
  if (totalCollectionWears === 0) return 0;
  return (watch.totalDaysWorn / totalCollectionWears) * 100;
}

export function getPositionalStats(accuracyLogs: WatchItem['accuracyLogs']) {
  if (!accuracyLogs || accuracyLogs.length === 0) {
    return { avgRate: 0, delta: 0, count: 0, compliance: 'No Data' };
  }

  const rates = accuracyLogs.map((l) => l.deviationSecPerDay);
  const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length;
  const maxRate = Math.max(...rates);
  const minRate = Math.min(...rates);
  const delta = Math.abs(maxRate - minRate);

  let compliance = 'COSC Compliant (-4/+6)';
  if (rates.every((r) => r >= -2 && r <= 2)) {
    compliance = 'Superlative (-2/+2)';
  } else if (rates.every((r) => r >= 0 && r <= 5)) {
    compliance = 'METAS Master (0/+5)';
  } else if (rates.some((r) => r < -4 || r > 6)) {
    compliance = 'Requires Regulation';
  }

  return {
    avgRate: Number(avgRate.toFixed(1)),
    delta: Number(delta.toFixed(1)),
    count: accuracyLogs.length,
    compliance,
  };
}
