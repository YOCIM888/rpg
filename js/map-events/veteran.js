import {
  getState,
  setPhase,
  setStory,
  setOptions,
  addItem,
  advanceTime,
  updateStatusEffects,
  checkDeath,
} from '../state.js';

import {
  NERVOUS_VETERAN_DIALOGUES,
  AMMO,
  GAME_CONSTANTS,
  MAP_NPC_INTROS,
} from '../config.js';

import {
  showExploreOptionsState,
} from '../routing.js';

export function handleVeteranInteract() {
  setPhase("explore");
  setStory(MAP_NPC_INTROS.veteran_intro);
  setOptions([
    { text: "对话", action: "veteran_chat" },
    { text: "讨要子弹", action: "veteran_ammo" },
    { text: "离开", action: "veteran_leave" },
  ]);
}

export function handleVeteranChat() {
  const state = getState();
  const line = NERVOUS_VETERAN_DIALOGUES[Math.floor(Math.random() * NERVOUS_VETERAN_DIALOGUES.length)];
  let result = line;
  advanceTime(1);
  if (Math.random() < GAME_CONSTANTS.MAP_EVENTS.VETERAN_MISFIRE_RATE) {
    state.health = Math.max(0, state.health - GAME_CONSTANTS.MAP_EVENTS.VETERAN_MISFIRE_DAMAGE);
    result += `\n\n老兵突然狂躁起来，手中的步枪走火了！你被击中，生命值 -${GAME_CONSTANTS.MAP_EVENTS.VETERAN_MISFIRE_DAMAGE}。`;
  }
  setStory(result);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    setOptions([
      { text: "对话", action: "veteran_chat" },
      { text: "讨要子弹", action: "veteran_ammo" },
      { text: "离开", action: "veteran_leave" },
    ]);
  }
}

export function handleVeteranLeave() {
  setStory("你离开了军事检查站。");
  showExploreOptionsState();
}

export function handleVeteranAmmo() {
  const state = getState();
  advanceTime(1);
  if (Math.random() < GAME_CONSTANTS.MAP_EVENTS.VETERAN_AMMO_GIVE_RATE) {
    const ammo = AMMO[Math.floor(Math.random() * AMMO.length)];
    const count = Math.floor(Math.random() * (GAME_CONSTANTS.MAP_EVENTS.VETERAN_AMMO_MAX - GAME_CONSTANTS.MAP_EVENTS.VETERAN_AMMO_MIN + 1)) + GAME_CONSTANTS.MAP_EVENTS.VETERAN_AMMO_MIN;
    const added = addItem({ id: ammo.id, name: ammo.name, type: "ammo", count });
    if (added) {
      setStory(`老赵打量了你一番，眼神中露出一丝熟悉。\"小子，拿着！当年我在部队的时候……唉，不说了。\"他丢给你${count}发${ammo.name}。`);
    } else {
      setStory("老赵打量了你一番，正想给你些子弹，但你的背包已经满了。");
    }
  } else {
    state.health = Math.max(0, state.health - GAME_CONSTANTS.MAP_EVENTS.VETERAN_MISFIRE_DAMAGE);
    setStory(`老赵突然眼神一变，举起枪对准你：\"你是他们派来的奸细！滚！\"他扣动扳机，你被击中，生命值 -${GAME_CONSTANTS.MAP_EVENTS.VETERAN_MISFIRE_DAMAGE}。`);
  }
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    handleVeteranInteract();
  }
}
