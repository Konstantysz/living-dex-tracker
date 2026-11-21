import type { GameConfig, GameLayout } from '../core/types';
import { games as configs } from './configs';
import svLayout from './sv/generated/layout.json';
import './sv/theme.css';
import zaLayout from './za/generated/layout.json';
import './za/theme.css';

export interface Game {
  config: GameConfig;
  layout: GameLayout;
}

const layouts: Record<string, GameLayout> = {
  sv: svLayout as GameLayout,
  za: zaLayout as GameLayout,
};

/** Registry: add a game by adding its config to configs.ts and its layout here. */
export const registry: Game[] = configs.map((config) => ({
  config,
  layout: layouts[config.id] as GameLayout,
}));

export const findGame = (id: string): Game =>
  registry.find((g) => g.config.id === id) ?? registry[0]!;
