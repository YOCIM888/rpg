import {
  getState,
  setPhase,
  setStory,
  setOptions,
} from '../state.js';

import {
  NAMED_NPCS,
  ZOMBIE_KING_INTRO,
} from '../config.js';

import {
  showExploreOptionsState,
} from '../routing.js';

export function handleZombieKingInteract() {
  const state = getState();
  if (state.zombieKingDefeated) {
    setStory("丧尸之王的尸体倒在地上，巢穴里恢复了死寂。这里已经没有什么值得挑战的了。");
    showExploreOptionsState();
    return;
  }
  const zk = NAMED_NPCS.zombie_king;
  state._pendingNpc = {
    name: zk.name,
    hp: zk.hp,
    damage: zk.damage,
    hasRanged: zk.hasRanged,
    dodgeRate: zk.dodgeRate,
  };
  setPhase("pre_combat_npc");
  setStory(ZOMBIE_KING_INTRO);
  setOptions([
    { text: "近战作战", action: "combat_npc_melee" },
    { text: "远程射击", action: "combat_npc_ranged" },
    { text: "逃跑", action: "combat_npc_flee" },
  ]);
}
