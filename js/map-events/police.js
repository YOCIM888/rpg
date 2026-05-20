import {
  getState,
  setStory,
  addItem,
  advanceTime,
  updateStatusEffects,
  checkDeath,
} from '../state.js';

import {
  AMMO,
  GAME_CONSTANTS,
} from '../config.js';

import {
  showExploreOptionsState,
} from '../routing.js';

export function handlePoliceRaid() {
  const state = getState();
  if (Math.random() < GAME_CONSTANTS.MAP_EVENTS.POLICE_TRAP_RATE) {
    state.health = Math.max(0, state.health - GAME_CONSTANTS.MAP_EVENTS.POLICE_TRAP_DAMAGE);
    setStory(`你小心翼翼地翻找证物室，却不慎触发了警局遗留的陷阱！一阵爆炸将你掀翻在地，你被炸伤了，生命值 -${GAME_CONSTANTS.MAP_EVENTS.POLICE_TRAP_DAMAGE}。`);
  } else {
    const ammo = AMMO[Math.floor(Math.random() * AMMO.length)];
    const count = Math.floor(Math.random() * (GAME_CONSTANTS.MAP_EVENTS.POLICE_AMMO_MAX - GAME_CONSTANTS.MAP_EVENTS.POLICE_AMMO_MIN + 1)) + GAME_CONSTANTS.MAP_EVENTS.POLICE_AMMO_MIN;
    const added = addItem({ id: ammo.id, name: ammo.name, type: "ammo", count });
    if (added) {
      setStory(`你在一堆陈旧的档案后面发现了一些遗留弹药：${ammo.name}×${count}。这趟冒险总算没白来。`);
    } else {
      setStory(`你发现了一些弹药：${ammo.name}×${count}，但背包已满，无法携带。`);
    }
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    showExploreOptionsState();
  }
}
