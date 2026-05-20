import {
  getState, setPhase, setStory, setOptions,
  addItem, advanceTime, updateStatusEffects, checkDeath, isQuestDone,
} from '../state.js';

import { GAME_CONSTANTS } from '../config.js';

import { FISH, FISH_RARITY_WEIGHTS } from '../data/items/fish.js';

import { refreshIslandMenu } from './index.js';

const RARITY_LABELS = { common: "普通", uncommon: "优秀", rare: "稀有", epic: "史诗", legendary: "传说" };

function pickRandomFish() {
  const roll = Math.random() * 1000;
  let rarity;
  let cumulative = 0;
  for (const [r, w] of Object.entries(FISH_RARITY_WEIGHTS)) {
    cumulative += w;
    if (roll < cumulative) { rarity = r; break; }
  }
  const pool = FISH.filter(f => f.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function handleFishingArea() {
  if (!isQuestDone("yumoQuest5")) {
    setStory("这里是余墨公爵的专属钓场，你还没办法进入。");
    refreshIslandMenu();
    return;
  }
  setPhase("island_fishing");
  setStory("你来到了岛屿的钓鱼区域，海风轻拂，水面波光粼粼。");
  setOptions([
    { text: "钓鱼", action: "island_fish" },
    { text: "离开", action: "island_fishing_leave" },
  ]);
}

export function handleFishAction() {
  const state = getState();
  if (state.fishingCount >= GAME_CONSTANTS.FISHING.DAILY_FISH_LIMIT) {
    setStory("今天已经钓了太久了，明天再来吧。");
    setPhase("island_fishing");
    setOptions([
      { text: "离开", action: "island_fishing_leave" },
    ]);
    return;
  }
  advanceTime(1);
  const fish = pickRandomFish();
  const added = addItem({ ...fish });
  state.fishingCount++;
  const rarityLabel = RARITY_LABELS[fish.rarity] || fish.rarity;
  if (added) {
    setStory(`你甩出鱼线，耐心等待……\n钓到了一条【${rarityLabel}】${fish.name}！`);
  } else {
    setStory(`你甩出鱼线，耐心等待……\n钓到了一条【${rarityLabel}】${fish.name}，但背包已满，无法携带。`);
  }
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    setPhase("island_fishing");
    setOptions([
      { text: "钓鱼", action: "island_fish" },
      { text: "离开", action: "island_fishing_leave" },
    ]);
  }
}

export function handleFishingLeave() {
  refreshIslandMenu();
}

export function handleFishingAction(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;
  const action = state.options[optIdx].action;
  if (action === "island_fish") {
    handleFishAction();
  } else if (action === "island_fishing_leave") {
    handleFishingLeave();
  }
}
