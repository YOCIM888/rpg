import {
  getState,
  setStory,
  addItem,
  addCigarettes,
  advanceTime,
  updateStatusEffects,
  checkDeath,
} from '../state.js';

import {
  AMMO,
  GAME_CONSTANTS,
  SEEDS,
  CROP_FOOD_MAP,
  randInt,
} from '../config.js';

import {
  showExploreOptionsState,
} from '../routing.js';

export function handleExploreCave() {
  const state = getState();
  if (state.lastCaveDay >= state.day) {
    setStory("今天已经探索过山洞了，明天再来吧。");
    showExploreOptionsState();
    return;
  }
  state.lastCaveDay = state.day;
  if (Math.random() < GAME_CONSTANTS.MAP_EVENTS.CAVE_CIG_RATE) {
    addCigarettes(1);
    setStory(`你在山洞深处发现了一包香烟！`);
  } else {
    const ammo = AMMO[Math.floor(Math.random() * AMMO.length)];
    addItem({ id: ammo.id, name: ammo.name, type: "ammo", count: 1 });
    setStory(`你在山洞角落里捡到了一颗${ammo.name}子弹。`);
  }
  advanceTime(3);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    const maps = state.stats?.mapsExplored || [];
    if (!state.unlockedAchievements) state.unlockedAchievements = [];
    for (const entry of GAME_CONSTANTS.ACHIEVEMENTS.EXPLORATION_MAPS) {
      if (maps.length >= entry.threshold && !state.unlockedAchievements.includes(entry.id)) state.unlockedAchievements.push(entry.id);
    }
    showExploreOptionsState();
  }
}

export function handleMoldySeeds() {
  const state = getState();
  const hasBadge = state.other.some(i => i.id === "farming_master_badge");
  if (!hasBadge) {
    setStory("你看着这些发霉的种子，它们已经完全不能用了，你放弃了它们。（需要沐苗苗的农业大师徽章）");
    showExploreOptionsState();
    return;
  }
  if (state.lastMoldySeedsDay >= state.day) {
    setStory("今天已经处理过这些发霉的种子了，明天再来吧。");
    showExploreOptionsState();
    return;
  }
  state.lastMoldySeedsDay = state.day;
  const seedCount = randInt(1, 3);
  const addedSeeds = [];
  for (let i = 0; i < seedCount; i++) {
    const seed = SEEDS[Math.floor(Math.random() * SEEDS.length)];
    const added = addItem({ ...seed });
    if (added) {
      addedSeeds.push(seed.name);
    }
  }
  let msg = "这些天在实验田的工作，跟着苗苗学习，已经让你掌握了重新利用坏种的能力。";
  if (addedSeeds.length > 0) {
    msg += `\n\n你获得了：${addedSeeds.join("、")}`;
  } else {
    msg += "\n\n但是你的背包已经满了，种子没能放进去。";
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  setStory(msg);
  if (!state.gameOver) {
    showExploreOptionsState();
  }
}

export function handleAbandonedField() {
  const state = getState();
  const hasBadge = state.other.some(i => i.id === "farming_master_badge");
  if (!hasBadge) {
    setStory("你看着荒废的菜田，好像什么也做不了，你完全不懂行。（需要沐苗苗的农业大师徽章）");
    showExploreOptionsState();
    return;
  }
  if (state.lastAbandonedFieldDay >= state.day) {
    setStory("今天已经打理过这片菜田了，明天再来吧。");
    showExploreOptionsState();
    return;
  }
  state.lastAbandonedFieldDay = state.day;
  const jiucai = CROP_FOOD_MAP["jiucai"];
  let added = 0;
  for (let i = 0; i < 2; i++) {
    if (addItem({ ...jiucai })) added++;
  }
  let msg = "你清理了杂草并简单用河水浇灌了他们，按照沐苗苗教你的方法，你收获了2韭菜。";
  if (added < 2) {
    msg += "\n\n⚠️ 部分韭菜因背包已满未能放入。";
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  setStory(msg);
  if (!state.gameOver) {
    showExploreOptionsState();
  }
}
