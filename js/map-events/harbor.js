import {
  getState,
  setStory,
  advanceTime,
  updateStatusEffects,
  checkDeath,
  removeGasoline,
} from '../state.js';

import {
  GAME_CONSTANTS,
} from '../config.js';

import {
  showExploreOptionsState,
} from '../routing.js';

import { hasCastleIdentity } from '../faction.js';
import { handleEnterIsland } from '../island/index.js';

export function handleYacht() {
  const state = getState();
  const hasId = hasCastleIdentity(state);
  if (!hasId) {
    setStory("这是一个带有末日城堡标识的游艇，还是不要乱动吧。（需要城堡身份牌）");
    showExploreOptionsState();
    return;
  }
  if (state.gasoline < 1) {
    setStory("它需要1个汽油才能开动。（可以通过王铁柱用香烟兑换汽油）");
    showExploreOptionsState();
    return;
  }
  removeGasoline(1);
  setStory("你消耗了1个汽油，按照航线前往岛屿。");
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    handleEnterIsland();
  }
}

export function handleViewRiver() {
  const state = getState();
  if (state.lastViewRiverDay >= state.day) {
    setStory("今天已经欣赏过江景了，明天再来吧。");
    showExploreOptionsState();
    return;
  }
  state.lastViewRiverDay = state.day;
  state.crash = Math.max(0, state.crash - GAME_CONSTANTS.MAP_EVENTS.RIVER_CRASH_REDUCTION);
  setStory("秋水共长天一色～你的心情更好了，崩溃度降低了。");
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    showExploreOptionsState();
  }
}
