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

import { MEDICINES, LILI_REWARD_MEDICINE_IDS, GAME_CONSTANTS, weightedRandom } from '../config.js';

import { handleNpcAction } from './index.js';

export function handleLiliTrade(input) {
  const state = getState();
  if (state.lastLiliTradeDay >= state.day) {
    setStory("莉莉丝摆了摆手：\"今天的交易已经完成了，明天再来吧。\"");
    handleNpcAction("chat");
    return;
  }
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;
  const option = state.options[optionIndex];
  if (option.action === "lili_back") { handleNpcAction("chat"); return; }

  const item = option.tradeItem;
  if (!item) { handleNpcAction("chat"); return; }

  const targetItem = state.medicine[item.idx];
  if (targetItem && (targetItem.count || 1) > 1) {
    targetItem.count = (targetItem.count || 1) - 1;
  } else {
    state.medicine.splice(item.idx, 1);
  }

  const rarityWeights = GAME_CONSTANTS.LOOT.RARITY_WEIGHTS;
  const tradeMeds = MEDICINES.filter(m => m.rarity === "common" || m.rarity === "uncommon" || m.rarity === "rare");
  const count = Math.floor(Math.random() * (GAME_CONSTANTS.NPC.LILI_TRADE_MED_COUNT_MAX - GAME_CONSTANTS.NPC.LILI_TRADE_MED_COUNT_MIN + 1)) + GAME_CONSTANTS.NPC.LILI_TRADE_MED_COUNT_MIN;
  const rewards = [];
  for (let i = 0; i < count; i++) {
    const med = weightedRandom(tradeMeds, m => rarityWeights[m.rarity] || 1);
    const added = addItem({ ...med });
    if (added) rewards.push(med.name);
  }
  if (rewards.length > 0) {
    setStory(`莉莉丝接过你的物品，熟练地调配了一番。她给了你：${rewards.join("、")}。`);
  } else {
    setStory("莉莉丝接过你的物品，但背包已满，无法接收更多药品。");
  }
  state.lastLiliTradeDay = state.day;
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    handleNpcAction("chat");
  }
}
