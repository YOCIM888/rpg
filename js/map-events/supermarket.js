import {
  getState,
  setPhase,
  setStory,
  setOptions,
} from '../state.js';

import {
  MAP_NPC_INTROS,
  NAMED_NPCS,
  GAME_CONSTANTS,
} from '../config.js';

import {
  showExploreOptionsState,
} from '../routing.js';

export function handleMaskedManInteract() {
  setPhase("explore");
  setStory(MAP_NPC_INTROS.shadow_intro);
  setOptions([
    { text: "对抗", action: "masked_man_fight" },
    { text: "离开", action: "masked_man_leave" },
  ]);
}

export function handleMaskedManFight() {
  const state = getState();
  const shadow = NAMED_NPCS.shadow;
  state._pendingNpc = {
    name: shadow.name,
    hp: shadow.hp,
    damage: Math.floor(Math.random() * (shadow.damageMax - shadow.damageMin + 1)) + shadow.damageMin,
    hasRanged: shadow.hasRanged,
    dodgeRate: shadow.dodgeRate,
  };
  setPhase("pre_combat_npc");
  setStory(MAP_NPC_INTROS.shadow_fight);
  setOptions([
    { text: "近战作战", action: "combat_npc_melee" },
    { text: "远程射击", action: "combat_npc_ranged" },
    { text: GAME_CONSTANTS.COMBAT.FLEE_RATE_TEXT, action: "combat_npc_flee" },
  ]);
}

export function handleMaskedManLeave() {
  setStory(MAP_NPC_INTROS.shadow_leave);
  showExploreOptionsState();
}
