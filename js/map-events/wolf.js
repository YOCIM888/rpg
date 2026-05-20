import {
  getState,
  setPhase,
  setStory,
  setOptions,
  addItem,
  advanceTime,
  updateStatusEffects,
  checkDeath,
  getBackpackCount,
} from '../state.js';

import {
  WOLF_DIALOGUES,
  GAME_CONSTANTS,
  MEDICINES,
  MAP_NPC_INTROS,
  weightedRandom,
} from '../config.js';

import {
  showExploreOptionsState,
} from '../routing.js';

export function handleWolfInteract() {
  setPhase("explore");
  setStory(MAP_NPC_INTROS.wolf_intro);
  setOptions([
    { text: "对话", action: "wolf_chat" },
    { text: "以物易物", action: "wolf_trade" },
    { text: "离开", action: "wolf_leave" },
  ]);
}

export function handleWolfChat() {
  const line = WOLF_DIALOGUES[Math.floor(Math.random() * WOLF_DIALOGUES.length)];
  setStory(line);
  setOptions([
    { text: "对话", action: "wolf_chat" },
    { text: "以物易物", action: "wolf_trade" },
    { text: "离开", action: "wolf_leave" },
  ]);
}

export function handleWolfLeave() {
  setStory("你和老狼告别，离开了居民区。");
  showExploreOptionsState();
}

export function handleWolfTrade() {
  const state = getState();
  const foodCount = state.food.reduce((sum, f) => sum + (f.count || 1), 0);
  if (foodCount < GAME_CONSTANTS.MAP_EVENTS.WOLF_TRADE_FOOD_COST) {
    setStory(`老狼瞥了你一眼：\"就这点吃的还想换东西？至少${GAME_CONSTANTS.MAP_EVENTS.WOLF_TRADE_FOOD_COST}份食物。\"你只有${foodCount}份。`);
    handleWolfInteract();
    return;
  }
  if (getBackpackCount() - GAME_CONSTANTS.MAP_EVENTS.WOLF_TRADE_FOOD_COST + 1 > state.backpack.capacity) {
    setStory("背包空间不足，无法完成交易。");
    handleWolfInteract();
    return;
  }
  const removedItems = [];
  let remaining = GAME_CONSTANTS.MAP_EVENTS.WOLF_TRADE_FOOD_COST;
  for (let i = state.food.length - 1; i >= 0 && remaining > 0; i--) {
    const available = state.food[i].count || 1;
    if (available <= remaining) {
      removedItems.push(state.food[i]);
      state.food.splice(i, 1);
      remaining -= available;
    } else {
      removedItems.push({ ...state.food[i], count: remaining });
      state.food[i].count = available - remaining;
      remaining = 0;
    }
  }
  const laolangMeds = MEDICINES.filter(m => m.rarity === "common" || m.rarity === "uncommon" || m.rarity === "rare");
  const rarityWeights = GAME_CONSTANTS.LOOT.RARITY_WEIGHTS;
  const med = weightedRandom(laolangMeds, m => rarityWeights[m.rarity] || 1);
  const added = addItem({ ...med, type: "medicine" });
  const foodNames = removedItems.map(f => f.name).join("、");
  if (added) {
    setStory(`你用${foodNames}与老狼交换了一盒${med.name}。老狼接过食物，迫不及待地啃了起来。`);
  } else {
    setStory(`你用${foodNames}与老狼交换了一盒${med.name}，但背包已满，药品掉在了地上！`);
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    showExploreOptionsState();
  }
}
