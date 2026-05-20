import {
  getState,
} from '../state.js';

import {
  GAME_CONSTANTS,
} from '../config.js';

export function tryUnlockAchievement(id) {
  const state = getState();
  if (!state.unlockedAchievements) state.unlockedAchievements = [];
  if (state.unlockedAchievements.includes(id)) return;
  state.unlockedAchievements.push(id);
}

export function checkSurvivalAchievements() {
  const state = getState();
  for (const entry of GAME_CONSTANTS.ACHIEVEMENTS.SURVIVAL_DAYS) {
    if (state.day >= entry.threshold) tryUnlockAchievement(entry.id);
  }
}

export function checkExplorationAchievements() {
  const state = getState();
  const maps = state.stats?.mapsExplored || [];
  for (const entry of GAME_CONSTANTS.ACHIEVEMENTS.EXPLORATION_MAPS) {
    if (maps.length >= entry.threshold) tryUnlockAchievement(entry.id);
  }
}
