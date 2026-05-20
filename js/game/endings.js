import {
  getState,
  setPhase,
  setStory,
  setOptions,
  addItem,
  resetState,
  checkDeath,
} from '../state.js';

import {
  ENDING_STORIES,
  GAME_CONSTANTS,
  LOOT_BACKPACKS,
  MELEE_WEAPONS,
} from '../config.js';

import {
  saveGame,
  loadGame,
  deleteSlot,
  updateBestRecord as updateRecord,
  getAllSlots
} from '../save.js';

import { showHomeOptions, showExploreOptionsState } from '../routing.js';

import { tryUnlockAchievement } from './achievements.js';

export function triggerEnding(endingId) {
  const state = getState();
  if (state.unlockedEndings && state.unlockedEndings.includes(endingId)) return;
  if (!state.unlockedEndings) state.unlockedEndings = [];
  state.unlockedEndings.push(endingId);

  state._lastTriggeredEnding = endingId;

  const story = ENDING_STORIES[endingId] || `结局：${endingId}`;
  let finalStory = story;
  if (endingId === "ending_999") {
    const state2 = getState();
    if (state2.backpack && state2.backpack.capacity >= 68) {
      finalStory = story.replace(/获得【次元收纳背包】（68格）！/, "");
    }
  }

  if (GAME_CONSTANTS.ENDINGS.ALL_IDS.includes(endingId)) {
    tryUnlockAchievement(endingId);
  }

  if (endingId === "ending_999") {
    const dimensionalBag = LOOT_BACKPACKS.find(b => b.id === GAME_CONSTANTS.ENDINGS.ENDING_999_BACKPACK_ID);
    if (dimensionalBag && state.backpack.capacity < dimensionalBag.capacity) {
      state.backpack = { id: dimensionalBag.id, name: dimensionalBag.name, type: dimensionalBag.name, capacity: dimensionalBag.capacity };
    }
  }

  if (endingId === "ending_newforce") {
    const fearless = MELEE_WEAPONS.find(w => w.id === GAME_CONSTANTS.ENDINGS.NEWFORCE_WEAPON_ID);
    if (fearless) {
      const weapon = { ...fearless, currentDurability: fearless.durability };
      if (!addItem(weapon)) {
        state.meleeWeapon = weapon;
      }
    }
  }

  setPhase("ending");
  setStory(finalStory);

  if (endingId === "ending_death" || endingId === "ending_space" || endingId === "ending_hope" || endingId === "ending_food" || endingId === "ending_elopement") {
    state.gameOver = true;
    setOptions([
      { text: "重新开始", action: "ending_restart" },
    ]);
  } else {
    setOptions([
      { text: "重新开始", action: "ending_restart" },
      { text: "继续生存", action: "ending_continue" },
    ]);
  }
}

export function checkEndingTriggerAfterAction() {
  const state = getState();
  if (state.phase === "ending") return;

  if (state.day >= GAME_CONSTANTS.ENDINGS.DAY_999_THRESHOLD && (!state.unlockedEndings || !state.unlockedEndings.includes("ending_999"))) {
    triggerEnding("ending_999");
    return true;
  }

  if (state.gameOver) return;

  if (!state.unlockedEndings || !state.unlockedEndings.includes("ending_newforce")) {
    const allDone = state.nurseZombieRescued &&
      state.liuruyanRescued &&
      state.outlawKilled &&
      state.stats && state.stats.bossesDefeated && state.stats.bossesDefeated.includes("黑影") &&
      state.zombieKingDefeated &&
      state.doctorQuest3Done;
    if (allDone) {
      triggerEnding("ending_newforce");
      return true;
    }
  }

  return false;
}

export function checkGoHomeEnding() {
  const state = getState();
  if (state.gameOver) return false;
  if (state.phase === "ending") return false;

  if (!state.unlockedEndings || !state.unlockedEndings.includes("ending_prince")) {
    const hasCrownPrince = state.other.some(i => i.id === "crown_prince_id");
    if (hasCrownPrince) {
      triggerEnding("ending_prince");
      return true;
    }
  }

  if (!state.unlockedEndings || !state.unlockedEndings.includes("ending_captain")) {
    const hasCaptain = state.other.some(i => i.id === "dawn_captain_badge");
    if (hasCaptain) {
      triggerEnding("ending_captain");
      return true;
    }
  }

  if (!state.unlockedEndings || !state.unlockedEndings.includes("ending_farming")) {
    if (state.npcQuestsDone && state.npcQuestsDone.mumiaoQuest3) {
      triggerEnding("ending_farming");
      return true;
    }
  }

  if (!state.unlockedEndings || !state.unlockedEndings.includes("ending_love_hate")) {
    if (state.npcQuestsDone && state.npcQuestsDone.queenQuest4) {
      triggerEnding("ending_love_hate");
      return true;
    }
  }

  return false;
}

export function handleEndingAction(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;
  const action = state.options[optIdx].action;

  if (action === "ending_restart") {
    updateRecord(state);
    resetState();
    setPhase("main_menu");
    return;
  }
  if (action === "ending_continue") {
    state.gameOver = false;
    if (state.health <= 0) state.health = 1;
    if (state.infection >= 100) state.infection = 99;
    setPhase("choose");
    checkDeath();
    if (state.currentMap) {
      showExploreOptionsState();
    } else {
      showHomeOptions();
    }
    return;
  }
}
