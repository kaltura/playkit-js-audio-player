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
