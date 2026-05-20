import {
  getState,
  setStory,
  addItem,
  advanceTime,
  updateStatusEffects,
  checkDeath,
} from '../state.js';

import {
  FRUITS,
  GAME_CONSTANTS,
} from '../config.js';

import {
  hasDawnCaptainBadge,
  hasCastleIdentity,
  cleanDualIdentity,
} from '../faction.js';

import { showOutpostOptions } from './menu.js';

export function handleWork() {
  const state = getState();
  cleanDualIdentity(state);
  if (hasCastleIdentity(state)) {
    setStory("阵地主管皱了皱眉：\"你都是城堡的人了，还来抢我们穷人的活干？去去去！\" 你被赶走了。");
    showOutpostOptions();
    return;
  }
  if (state.phaseIndex < 1 || state.phaseIndex > 4) {
    setStory("现在不是打工的时间，白天再来吧。");
    showOutpostOptions();
    return;
  }
  state.hunger = Math.max(0, state.hunger - GAME_CONSTANTS.OUTPOST.WORK_HUNGER_COST);
  state.hydration = Math.max(0, state.hydration - GAME_CONSTANTS.OUTPOST.WORK_HYDRATION_COST);
  state.crash = Math.min(100, state.crash + GAME_CONSTANTS.OUTPOST.WORK_CRASH_GAIN);
  const fruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
  const added1 = addItem({ ...fruit });
  let story = `你干了一天的活，获得了${fruit.name}。`;

  const hasCaptain = hasDawnCaptainBadge(state);
  if (hasCaptain) {
    const fruit2 = FRUITS[Math.floor(Math.random() * FRUITS.length)];
    const added2 = addItem({ ...fruit2 });
    story = `曙光先锋队长的身份让你获得了双倍报酬！你干了一天活，获得了${fruit.name}和${fruit2.name}。`;
    if (!added2) story += " 但背包已满，部分物品掉落在地上了。";
  }

  if (!added1) story += " 但背包已满，物品掉落在地上了。";
  setStory(story);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  showOutpostOptions();
}
