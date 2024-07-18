import {IconDto} from '@playkit-js/ui-managers';

export type AudioPluginDto = Omit<IconDto, 'ariaLabel' | 'order' | 'component' | 'presets'>;