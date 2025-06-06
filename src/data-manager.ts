import {KalturaPlayer} from '@playkit-js/kaltura-player-js';
import {VolumeMapEntry} from './types';
import {parseVolumeMapResponse} from './utils';

const DESIRED_LINES = 150;

export class DataManager {
  private delayHandler: ReturnType<typeof setTimeout> | null = null;
  private cachedVolumeMap: VolumeMapEntry[] | null = null;

  constructor(
    private readonly player: KalturaPlayer,
    private readonly logger: KalturaPlayerTypes.Logger
  ) {}

  public async getVolumeMap(): Promise<VolumeMapEntry[]> {
    // Return cached data if available
    if (this.cachedVolumeMap) {
      return this.cachedVolumeMap;
    }

    try {
      const entryId = this.player.sources.id;
      if (!entryId) {
        this.logger.warn('No entry ID found, cannot fetch volume map.');
        return [];
      }
      const ksQuery = this.player.config?.session?.ks ? `&ks=${this.player.config?.session?.ks}` : '';
      const baseUrl = `${this.player.provider.env.serviceUrl}/service/media/action/getVolumeMap`;
      const urlWithParams = `${baseUrl}?desiredLines=${DESIRED_LINES}&entryId=${entryId}${ksQuery}`;
      const response = await this.fetchWithRetries(urlWithParams, {method: 'POST'});
      const responseText = await response.text();
      const volumeMap = parseVolumeMapResponse(responseText);

      // Cache the fetched data
      this.cachedVolumeMap = volumeMap;

      return volumeMap;
    } catch (e) {
      this.logger.error('Failed to get volume map:', e);
      return [];
    }
  }

  private async fetchWithRetries(url: string, options: RequestInit = {}, retries: number = 3, delay: number = 1000): Promise<Response> {
    let lastError: Error | Response | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, options);
        if (response.ok) {
          return response; // Success
        }
        lastError = response;
        this.logger.warn(`Fetch attempt ${attempt + 1} for ${url} failed with status ${response.status}.`);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(`Fetch attempt ${attempt + 1} for ${url} failed with error: ${lastError.message}.`);
      }

      if (attempt < retries) {
        this.logger.info(`Retrying fetch for ${url} after ${delay}ms...`);
        await new Promise<void>(resolve => {
          if (this.delayHandler) {
            clearTimeout(this.delayHandler);
          }
          this.delayHandler = setTimeout(() => {
            this.delayHandler = null;
            resolve();
          }, delay);
        });
      }
    }

    // If all retries failed, throw the last encountered error or response
    this.logger.error(`Failed to fetch ${url} after ${retries + 1} attempts.`);
    if (lastError instanceof Response) {
      // Throwing the response itself might be more informative than just the status
      throw lastError;
    } else if (lastError instanceof Error) {
      throw lastError; // Throw the last caught error
    } else {
      // Fallback for unexpected cases
      throw new Error(`Failed to fetch ${url} after ${retries + 1} attempts, but no specific error was recorded.`);
    }
  }

  public reset(): void {
    if (this.delayHandler) {
      clearTimeout(this.delayHandler);
      this.delayHandler = null;
    }

    // Clear the cached volume map
    this.cachedVolumeMap = null;
  }
}
