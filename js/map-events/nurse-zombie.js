import {
  getState,
  setPhase,
  setStory,
  setOptions,
  advanceTime,
  updateStatusEffects,
  getItemDisplayName,
} from '../state.js';

import {
  NURSE_ZOMBIE_INTRO,
  CANNED_FOOD_IDS,
  GAME_CONSTANTS,
} from '../config.js';

import {
  showExploreOptionsState,
  showHomeOptions,
} from '../routing.js';

export function handleNurseZombieInteract() {
  const state = getState();
  if (state.nurseZombieRescued) {
    setStory("这里已经什么都没有了，露露薇已经跟你回家了。");
    showExploreOptionsState();
    return;
  }
  setPhase("explore");
  const affinity = state.npcAffinity.nurseZombie || 0;
  const affinityText = `[好感度：${affinity}/${GAME_CONSTANTS.NURSE_ZOMBIE.MAX_AFFINITY}]`;
  const intro = NURSE_ZOMBIE_INTRO;
  const feedResult = state._lastFeedResult;
  delete state._lastFeedResult;
  setStory((feedResult ? feedResult + "\n\n" : "") + `${intro}\n\n${affinityText}`);
  const opts = [
    { text: "投喂", action: "nurse_zombie_feed" },
  ];
  if (affinity >= GAME_CONSTANTS.NURSE_ZOMBIE.BRING_HOME_AFFINITY) {
    opts.push({ text: "带回家", action: "nurse_zombie_bring_home" });
  }
  opts.push({ text: "离开", action: "nurse_zombie_leave" });
  setOptions(opts);
}

export function handleNurseZombieFeedSelect() {
  const state = getState();
  if (state.food.length === 0) {
    setStory("你没有任何食物可以投喂给她。");
    handleNurseZombieInteract();
    return;
  }
  setPhase("nurse_feed");
  const foodList = state.food.map((f, i) =>
    `${i + 1}. ${getItemDisplayName(f)}`
  ).join("\n");
  setStory(`请选择一种食物投喂给她：\n\n${foodList}`);
  const opts = state.food.map((f, i) => ({
    text: getItemDisplayName(f),
    action: "nurse_feed_confirm",
    index: i,
  }));
  opts.push({ text: "返回", action: "nurse_zombie_leave" });
  setOptions(opts);
}

export function handleNurseZombieFeedConfirm(input) {
  const state = getState();
  const optionIndex = input - 1;
  const option = state.options[optionIndex];
  if (!option || option.action === "nurse_zombie_leave") {
    handleNurseZombieInteract();
    return;
  }
  const foodItem = state.food[option.index];
  const isCanned = CANNED_FOOD_IDS.includes(foodItem.id);
  if ((foodItem.count || 1) > 1) {
    foodItem.count = (foodItem.count || 1) - 1;
  } else {
    state.food.splice(option.index, 1);
  }
  if (isCanned) {
    const gain = Math.floor(Math.random() * (GAME_CONSTANTS.NURSE_ZOMBIE.CANNED_AFFINITY_MAX - GAME_CONSTANTS.NURSE_ZOMBIE.CANNED_AFFINITY_MIN + 1)) + GAME_CONSTANTS.NURSE_ZOMBIE.CANNED_AFFINITY_MIN;
    state.npcAffinity.nurseZombie = Math.min(GAME_CONSTANTS.NURSE_ZOMBIE.MAX_AFFINITY, (state.npcAffinity.nurseZombie || 0) + gain);
    state._lastFeedResult = `她看起来很喜欢吃罐头！好感度 +${gain}。[好感度：${state.npcAffinity.nurseZombie}/${GAME_CONSTANTS.NURSE_ZOMBIE.MAX_AFFINITY}]`;
  } else {
    state._lastFeedResult = `她好像不喜欢吃这个……也许应该试试罐头食品？[好感度：${state.npcAffinity.nurseZombie || 0}/${GAME_CONSTANTS.NURSE_ZOMBIE.MAX_AFFINITY}]`;
  }
  handleNurseZombieInteract();
}

export function handleNurseZombieBringHome() {
  const state = getState();
  state.nurseZombieRescued = true;
  if (!state.unlockedAchievements) state.unlockedAchievements = [];
  if (!state.unlockedAchievements.includes("companion_recruit")) state.unlockedAchievements.push("companion_recruit");
  setStory("露露薇跟着你回到了幸存者帐篷，她现在是你忠实的伙伴了。");
  advanceTime(1);
  updateStatusEffects();
  showHomeOptions();
}

export function handleNurseZombieLeave() {
  setStory("你决定不带走露露薇，独自离开了。");
  showExploreOptionsState();
}
