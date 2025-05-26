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

// This function processes the original volume map to match the requested number of bars (maxBars).
// It can both reduce (through averaging) or increase (through interpolation) the number of data points.
export function processVolumeMap(originalMap: VolumeMapEntry[], maxBars: number, minDb: number): VolumeMapEntry[] {
  if (!originalMap || originalMap.length === 0 || maxBars <= 0) {
    return [];
  }

  // Case 1: Original map already matches the requested size
  if (originalMap.length === maxBars) {
    return originalMap; // No processing needed
  }

  // Case 2: We need to reduce the number of data points
  if (originalMap.length > maxBars) {
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

  // Case 3: We need to increase the number of data points through interpolation
  const processedMap: VolumeMapEntry[] = [];

  // Calculate time range of the audio, using 0 as the starting point if needed
  const startPts = 0; // Always start from 0 seconds
  const endPts = originalMap[originalMap.length - 1].pts;

  // Generate evenly spaced timestamps
  for (let i = 0; i < maxBars; i++) {
    // Calculate the desired timestamp position
    const position = i / (maxBars - 1); // 0 to 1
    const targetPts = startPts + position * endPts;

    // Find the two closest points for interpolation
    let beforeIndex = 0;
    let afterIndex = 0;

    // Handle case where targetPts is before first data point
    if (targetPts < originalMap[0].pts) {
      // For points before the first data point, we'll use the first available point's level
      // but with the correct timestamp
      processedMap.push({
        pts: Math.round(targetPts),
        rms_level: minDb // Use minimum level (silence) for points before first data
      });
      continue;
    }

    // Find points to interpolate between for timestamps that exist in our data range
    for (let j = 0; j < originalMap.length - 1; j++) {
      if (originalMap[j].pts <= targetPts && originalMap[j + 1].pts >= targetPts) {
        beforeIndex = j;
        afterIndex = j + 1;
        break;
      }
    }

    // Handle edge case for the last point
    if (i === maxBars - 1) {
      processedMap.push({
        pts: endPts,
        rms_level: originalMap[originalMap.length - 1].rms_level
      });
      continue;
    }

    // Handle case where targetPts is beyond the last data point
    if (targetPts > originalMap[originalMap.length - 1].pts) {
      processedMap.push({
        pts: Math.round(targetPts),
        rms_level: minDb // Use minimum level for points after last data point
      });
      continue;
    }

    // Linear interpolation between the two points
    const beforePoint = originalMap[beforeIndex];
    const afterPoint = originalMap[afterIndex];

    // Avoid division by zero
    if (afterPoint.pts === beforePoint.pts) {
      processedMap.push({
        pts: Math.round(targetPts),
        rms_level: beforePoint.rms_level
      });
      continue;
    }

    // Calculate the weight for interpolation (0 to 1)
    const weight = (targetPts - beforePoint.pts) / (afterPoint.pts - beforePoint.pts);

    // Linear interpolation formula: value = start + weight * (end - start)
    const interpolatedRms = beforePoint.rms_level + weight * (afterPoint.rms_level - beforePoint.rms_level);

    processedMap.push({
      pts: Math.round(targetPts),
      rms_level: interpolatedRms
    });
  }

  return processedMap;
}
