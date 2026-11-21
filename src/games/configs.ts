// Config-only list (no JSON imports), shared by the data generator and the runtime registry.
import type { GameConfig } from '../core/types';
import { svConfig } from './sv/config';
import { zaConfig } from './za/config';

export const games: GameConfig[] = [svConfig, zaConfig];
