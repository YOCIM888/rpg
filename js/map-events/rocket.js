import {
  getState,
  setPhase,
  setStory,
  setOptions,
} from '../state.js';

import {
  NAMED_NPCS,
  GIANT_PUPPET_INTRO,
  ROCKET_PREP_STORY,
  ROCKET_LAUNCH_PREP,
  GAME_CONSTANTS,
} from '../config.js';

import {
  showExploreOptionsState,
} from '../routing.js';

import { triggerEnding } from '../game/endings.js';

export function handleLaunchCenter() {
  const state = getState();
  if (!state.giantPuppetDefeated) {
    handleGiantPuppetInteract();
    return;
  }
  if (state.rocketRepaired) {
    handleRocketEndingChoices();
    return;
  }
  setPhase("explore");
  setStory(ROCKET_PREP_STORY);
  const opts = [];
  if (state.doctorQuest1Done && state.doctorQuest2Done && state.doctorQuest3Done) {
    opts.push({ text: "维修火箭", action: "repair_rocket" });
  } else {
    let hint = "火箭还需要更多准备才能发射：";
    if (!state.doctorQuest1Done) hint += " 缺少小核能发电机";
    if (!state.doctorQuest2Done) hint += " 缺少纯净能源";
    if (!state.doctorQuest3Done) hint += " 缺少生存物资";
    opts.push({ text: "维修火箭（条件未满足）", action: "repair_rocket", disabled: true });
    setStory(ROCKET_PREP_STORY + "\n\n" + hint);
  }
  opts.push({ text: "离开", action: "launch_center_leave" });
  setOptions(opts);
}

export function handleGiantPuppetInteract() {
  const state = getState();
  const gp = NAMED_NPCS.giant_puppet;
  state._pendingNpc = {
    name: gp.name,
    hp: gp.hp,
    damage: gp.damage,
    hasRanged: gp.hasRanged,
    dodgeRate: gp.dodgeRate,
  };
  setPhase("pre_combat_npc");
  setStory(GIANT_PUPPET_INTRO);
  setOptions([
    { text: "近战作战", action: "combat_npc_melee" },
    { text: "远程射击", action: "combat_npc_ranged" },
    { text: "逃跑", action: "combat_npc_flee" },
  ]);
}

export function handleLaunchCenterLeave() {
  setStory("你离开了发射中心。");
  showExploreOptionsState();
}

export function handleRepairRocket() {
  const state = getState();
  if (!state.doctorQuest1Done || !state.doctorQuest2Done || !state.doctorQuest3Done) {
    handleLaunchCenter();
    return;
  }
  state.rocketRepaired = true;
  handleRocketEndingChoices();
}

export function handleRocketEndingChoices() {
  const state = getState();
  setPhase("explore");
  setStory(ROCKET_LAUNCH_PREP);
  const opts = [];
  opts.push({ text: "自己登上火箭", action: "rocket_ending_space" });
  const allMaxAffinity = state.npcAffinity.v >= GAME_CONSTANTS.ROCKET.HOPE_AFFINITY_REQUIRED && state.npcAffinity.xiaohan >= GAME_CONSTANTS.ROCKET.HOPE_AFFINITY_REQUIRED && state.npcAffinity.lili >= GAME_CONSTANTS.ROCKET.HOPE_AFFINITY_REQUIRED;
  if (allMaxAffinity) {
    opts.push({ text: "带上重要的人", action: "rocket_ending_hope" });
  } else {
    const req = GAME_CONSTANTS.ROCKET.HOPE_AFFINITY_REQUIRED;
    opts.push({ text: `带上重要的人（V:${state.npcAffinity.v}/${req} 小涵:${state.npcAffinity.xiaohan}/${req} 莉莉:${state.npcAffinity.lili}/${req}）`, action: "rocket_ending_hope", disabled: true });
  }
  opts.push({ text: "我不走，博士走吧", action: "rocket_ending_stay" });
  setOptions(opts);
}

export function handleRocketEndingSpace() {
  triggerEnding("ending_space");
}

export function handleRocketEndingHope() {
  const state = getState();
  const allMaxAffinity = state.npcAffinity.v >= GAME_CONSTANTS.ROCKET.HOPE_AFFINITY_REQUIRED && state.npcAffinity.xiaohan >= GAME_CONSTANTS.ROCKET.HOPE_AFFINITY_REQUIRED && state.npcAffinity.lili >= GAME_CONSTANTS.ROCKET.HOPE_AFFINITY_REQUIRED;
  if (!allMaxAffinity) {
    handleRocketEndingChoices();
    return;
  }
  triggerEnding("ending_hope");
}

export function handleRocketEndingStay() {
  const state = getState();
  state.doctorLeftInEnding8 = true;
  triggerEnding("ending_stay");
}
