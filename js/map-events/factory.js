import {
  getState,
  setStory,
  addItem,
  advanceTime,
  updateStatusEffects,
  checkDeath,
} from '../state.js';

import {
  GAME_CONSTANTS,
  FOODS,
  CANNED_FOOD_IDS,
} from '../config.js';

import {
  showExploreOptionsState,
} from '../routing.js';

export function handleExploreFactory() {
  const state = getState();
  if (state.lastFactoryExploreDay >= state.day) {
    setStory("今天已经探索过工厂内部了，明天再来吧。");
    showExploreOptionsState();
    return;
  }
  state.lastFactoryExploreDay = state.day;
  if (Math.random() < GAME_CONSTANTS.MAP_EVENTS.FACTORY_EXPLOSION_RATE) {
    state.health -= GAME_CONSTANTS.MAP_EVENTS.FACTORY_EXPLOSION_DAMAGE;
    setStory(`你意外碰到了爆炸物被炸伤了，扣${GAME_CONSTANTS.MAP_EVENTS.FACTORY_EXPLOSION_DAMAGE}健康。`);
  } else {
    const canned = FOODS.filter(f => CANNED_FOOD_IDS.includes(f.id));
    const can = canned[Math.floor(Math.random() * canned.length)];
    const added = addItem({ ...can });
    if (!added) {
      setStory(`你在工厂内部找到了${can.name}，但背包已满，无法携带。`);
    } else {
      setStory(`你在工厂内部找到了${can.name}！`);
    }
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    const maps = state.stats?.mapsExplored || [];
    if (!state.unlockedAchievements) state.unlockedAchievements = [];
    for (const entry of GAME_CONSTANTS.ACHIEVEMENTS.EXPLORATION_MAPS) {
      if (maps.length >= entry.threshold && !state.unlockedAchievements.includes(entry.id)) state.unlockedAchievements.push(entry.id);
    }
    showExploreOptionsState();
  }
}
