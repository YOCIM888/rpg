import {
  getState,
  setPhase,
  setStory,
  setOptions,
  addItem,
  removeCigarettes,
  removeGasoline,
  getItemDisplayName,
  advanceTime,
  updateStatusEffects,
  checkDeath,
} from '../state.js';

import {
  showExploreOptionsState,
} from '../routing.js';

import { handleNpcAction } from './index.js';

import { FOODS, XIAOHAN_REWARD_FOOD_IDS } from '../config.js';

export function handleXiaohanTrade(input) {
  const state = getState();
  if (state.lastXiaohanTradeDay >= state.day) {
    setStory("苏小涵摇了摇头：\"今天已经交易过了，改天再来吧。\"");
    handleNpcAction("chat");
    return;
  }
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;
  const option = state.options[optionIndex];
  if (option.action === "xiaohan_back") { showExploreOptionsState(); return; }

  const item = option.tradeItem;
  if (!item) { showExploreOptionsState(); return; }

  if (item.cat === "cigarettes") {
    removeCigarettes(1);
  } else if (item.cat === "gasoline") {
    removeGasoline(1);
  } else {
    const catMap = { food: state.food, drinks: state.drinks, medicine: state.medicine, other: state.other };
    const targetItem = catMap[item.cat][item.idx];
    if (targetItem && (targetItem.count || 1) > 1) {
      targetItem.count = (targetItem.count || 1) - 1;
    } else {
      catMap[item.cat].splice(item.idx, 1);
    }
  }

  const rewardFoods = XIAOHAN_REWARD_FOOD_IDS.map(id => FOODS.find(f => f.id === id)).filter(Boolean);
  const reward = rewardFoods[Math.floor(Math.random() * rewardFoods.length)];
  addItem({ ...reward, type: "food" });
  setStory(`苏小涵开心地接过${getItemDisplayName(item)}，作为回报，她给了你一份${reward.name}。`);
  state.lastXiaohanTradeDay = state.day;
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    handleNpcAction("chat");
  }
}

export function handleXiaohanTradeConfirm(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;
  const option = state.options[optionIndex];
  if (option.action === "xiaohan_back") { showExploreOptionsState(); return; }

  const item = option.tradeItem;
  if (!item) { showExploreOptionsState(); return; }

  if (item.cat === "cigarettes") {
    removeCigarettes(1);
  } else if (item.cat === "gasoline") {
    removeGasoline(1);
  } else {
    const catMap = { food: state.food, drinks: state.drinks, medicine: state.medicine, other: state.other };
    const targetItem = catMap[item.cat][item.idx];
    if (targetItem && (targetItem.count || 1) > 1) {
      targetItem.count = (targetItem.count || 1) - 1;
    } else {
      catMap[item.cat].splice(item.idx, 1);
    }
  }

  const rewardFoods = XIAOHAN_REWARD_FOOD_IDS.map(id => FOODS.find(f => f.id === id)).filter(Boolean);
  const reward = rewardFoods[Math.floor(Math.random() * rewardFoods.length)];
  addItem({ ...reward, type: "food" });
  setStory(`苏小涵开心地接过${getItemDisplayName(item)}，作为回报，她给了你一份${reward.name}。`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    showExploreOptionsState();
  }
}
