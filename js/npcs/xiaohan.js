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
  showExploreOptionsState,
} from '../routing.js';

import { getFoodById, FOODS, XIAOHAN_REWARD_FOOD_IDS } from '../config.js';

export function handleXiaohanAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const action = state.options[optionIndex].action;

  if (action === "xiaohan_back") {
    showExploreOptionsState();
    return;
  }

  if (action === "xiaohan_trade") {
    const offerings = [];
    state.food.forEach((item, i) => offerings.push({ cat: "food", idx: i, name: item.name }));
    state.drinks.forEach((item, i) => offerings.push({ cat: "drinks", idx: i, name: item.name }));
    state.medicine.forEach((item, i) => offerings.push({ cat: "medicine", idx: i, name: item.name }));
    state.other.forEach((item, i) => offerings.push({ cat: "other", idx: i, name: item.name }));
    state.cargo.forEach((item, i) => offerings.push({ cat: "cargo", idx: i, name: item.name }));
    if (offerings.length === 0) {
      setStory("苏小涵歪着头看了看你：\"你没有东西可以给我呢……\"");
      showExploreOptionsState();
      return;
    }
    setPhase("xiaohan_trade");
    setStory("苏小涵好奇地翻看着你的背包，最后停在了一件物品上：\"这个！我可以拿东西跟你换吗？\"\n请选择要交易的物品：");
    const opts = offerings.map((item, i) => ({
      text: `[${item.cat}] ${item.name}`,
      action: "xiaohan_trade_confirm",
      index: i,
      tradeItem: item,
    }));
    opts.push({ text: "返回", action: "xiaohan_back", index: -1 });
    setOptions(opts);
    return;
  }
}

export function handleXiaohanTrade(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;
  const option = state.options[optionIndex];
  if (option.action === "xiaohan_back") { showExploreOptionsState(); return; }

  const item = option.tradeItem;
  if (!item) { showExploreOptionsState(); return; }

  const catMap = { food: state.food, drinks: state.drinks, medicine: state.medicine, other: state.other, cargo: state.cargo };
  catMap[item.cat].splice(item.idx, 1);

  const rewardFoods = XIAOHAN_REWARD_FOOD_IDS.map(id => FOODS.find(f => f.id === id)).filter(Boolean);
  const reward = rewardFoods[Math.floor(Math.random() * rewardFoods.length)];
  addItem({ ...reward, type: "food" });
  setStory(`苏小涵开心地接过${item.name}，作为回报，她给了你一份${reward.name}。`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    showExploreOptionsState();
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

  const catMap = { food: state.food, drinks: state.drinks, medicine: state.medicine, other: state.other, cargo: state.cargo };
  catMap[item.cat].splice(item.idx, 1);

  const rewardFoods = XIAOHAN_REWARD_FOOD_IDS.map(id => FOODS.find(f => f.id === id)).filter(Boolean);
  const reward = rewardFoods[Math.floor(Math.random() * rewardFoods.length)];
  addItem({ ...reward, type: "food" });
  setStory(`苏小涵开心地接过${item.name}，作为回报，她给了你一份${reward.name}。`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    showExploreOptionsState();
  }
}
