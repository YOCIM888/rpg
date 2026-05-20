import {
  getState,
  advanceTime,
  updateStatusEffects,
  checkDeath,
  setLocation,
  setCurrentMap,
  setPhase,
  setStory,
  setOptions,
} from '../state.js';

import {
  MAPS,
  GAME_CONSTANTS,
} from '../config.js';

import { showHomeOptions, showExploreOptionsState } from '../routing.js';

import { checkGoHomeEnding } from './endings.js';

import { handleCastleOutpost } from '../castle/index.js';

export function handleGoOut() {
  setPhase("map_select");
  setStory("请选择你要前往的地点：");
  const mapOptions = MAPS.filter(m => !m.hidden).map(m => ({
    text: `${m.name} [${m.danger}]`,
    action: "select_map",
    map: m
  }));
  mapOptions.push({ text: "返回", action: "back", map: null });
  setOptions(mapOptions);
}

export function handleGoHome() {
  const state = getState();

  if (checkGoHomeEnding()) return;

  setLocation("幸存者帐篷");
  setCurrentMap(null);
  state.currentSubMap = null;
  advanceTime(1);
  updateStatusEffects();
  setStory("你安全回到了幸存者帐篷。");
  checkDeath();
  showHomeOptions();
}

export function handleMapAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) {
    return;
  }

  const option = state.options[optionIndex];
  if (option.action === "back") {
    showHomeOptions();
    return;
  }

  const map = option.map;
  if (!map) {
    return;
  }

  setCurrentMap(map);
  setLocation(map.name);

  if (map.id === "末日城堡") {
    setStory("你来到了末日城堡的大门前。");
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    if (!state.gameOver) {
      handleCastleOutpost();
    }
    return;
  }

  let entryMsg = `你已进入${map.name}。`;
  for (const [key, msg] of Object.entries(GAME_CONSTANTS.MAP.DANGER_MESSAGES)) {
    if (map.danger.includes(key)) {
      entryMsg += msg;
      break;
    }
  }
  setStory(entryMsg);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  showExploreOptionsState();
}
