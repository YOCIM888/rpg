/* ============================================================
   交易系统模块
   组织顺序：交易类型选择 → 交易数量确认
   ============================================================ */

import {
  getState,
  setPhase,
  setStory,
  setOptions,
  addItem,
  advanceTime,
  updateStatusEffects,
  checkDeath,
} from './state.js';

import { showExploreOptionsState } from './routing.js';

import { getRandomTrade } from './config.js';

export function handleTradeChoice(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const action = state.options[optionIndex].action;

  if (action === "trade_back") {
    state._trade = null;
    setStory("你放弃了交易。");
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    showExploreOptionsState();
    return;
  }

  const trade = state._trade;
  if (!trade) return;

  const type = action === "trade_food" ? "food" : "drink";
  const label = action === "trade_food" ? "食物" : "饮品";
  const inventory = state[type];

  const totalItems = inventory.reduce((sum, item) => sum + (item.count || 1), 0);
  if (totalItems === 0) {
    setStory(`你没有可交易的${label}。`);
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    showExploreOptionsState();
    return;
  }

  state._tradeType = type;

  setPhase("trade_input");
  setStory(`你有${totalItems}个${label}。请输入你要交易的${label}数量：`);

  const inputOptions = [];
  for (let i = 1; i <= totalItems; i++) {
    const ammoCount = i * trade.ammoPerItem;
    inputOptions.push({ text: `交易${i}个${label}（获得${ammoCount}发${trade.ammoType}）`, action: "confirm", count: i });
  }
  inputOptions.push({ text: "返回", action: "back" });
  setOptions(inputOptions);
}

export function handleTradeInput(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const option = state.options[optionIndex];

  if (option.action === "back") {
    setPhase("trade_choice");
    setStory("幸存者愿意用子弹交换你的物资。");
    setOptions([
      { text: "用食物换子弹", action: "trade_food" },
      { text: "用饮品换子弹", action: "trade_drink" },
      { text: "返回", action: "trade_back" },
    ]);
    return;
  }

  const trade = state._trade;
  const type = state._tradeType;
  const count = option.count;

  const ammoCount = count * trade.ammoPerItem;
  const added = addItem({ id: trade.ammoType, name: trade.ammoType, type: "ammo", count: ammoCount });
  if (!added) {
    setStory(`背包已满！你无法带走更多的弹药。`);
    showExploreOptionsState();
    return;
  }

  let remaining = count;
  for (let i = state[type].length - 1; i >= 0 && remaining > 0; i--) {
    const item = state[type][i];
    const available = item.count || 1;
    if (available <= remaining) {
      state[type].splice(i, 1);
      remaining -= available;
    } else {
      item.count = available - remaining;
      remaining = 0;
    }
  }

  setStory(`你用${count}个${type === "food" ? "食物" : "饮品"}换取了${ammoCount}发${trade.ammoType}。`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  showExploreOptionsState();
}
