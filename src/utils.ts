import type {VolumeMapEntry} from './types';

export function parseVolumeMapResponse(response: string): VolumeMapEntry[] {
  const lines = response.trim().split('\n');
  // Skip header line
  const dataLines = lines.slice(1);

  return dataLines.map(line => {
    const [ptsStr, rmsLevelStr] = line.split(',');
    return {
      pts: parseInt(ptsStr, 10),
      rms_level: parseFloat(rmsLevelStr)
    };
  });
}

// Normalize dBFS level to a 0-1 range for bar height
export function normalizeDbLevel(dbLevel: number, minDb: number, maxDb: number): number {
  const level = (dbLevel - minDb) / (maxDb - minDb);
  return Math.max(0, Math.min(1, level)); // Clamp between 0 and 1
}

// Function to downsample volume map data
export function processVolumeMap(originalMap: VolumeMapEntry[], maxBars: number): VolumeMapEntry[] {
  if (!originalMap || originalMap.length === 0 || maxBars <= 0) {
    return [];
  }

  if (originalMap.length <= maxBars) {
    return originalMap; // No processing needed
  }

  const processedMap: VolumeMapEntry[] = [];
  const groupSize = Math.ceil(originalMap.length / maxBars);

  for (let i = 0; i < originalMap.length; i += groupSize) {
    const group = originalMap.slice(i, i + groupSize);
    if (group.length > 0) {
      const sumRms = group.reduce((acc, entry) => acc + entry.rms_level, 0);
      const avgRms = sumRms / group.length;
      processedMap.push({
        pts: group[0].pts, // Use the timestamp of the first entry in the group
        rms_level: avgRms
      });
    }
  }
  // Ensure we don't exceed maxBars due to rounding
  return processedMap.slice(0, maxBars);
}
