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

import { getMedicineById, MEDICINES, LILI_REWARD_MEDICINE_IDS } from '../config.js';

export function handleLiliAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const action = state.options[optionIndex].action;

  if (action === "lili_back") {
    showExploreOptionsState();
    return;
  }

  if (action === "lili_trade") {
    const offerings = [];
    state.medicine.forEach((item, i) => offerings.push({ cat: "medicine", idx: i, name: item.name, label: `[医疗] ${item.name}` }));
    if (offerings.length === 0) {
      setStory("莉莉丝摇了摇头：\"你没有医疗物资可以交易……\"");
      showExploreOptionsState();
      return;
    }
    setPhase("lili_trade");
    setStory("莉莉丝翻了翻你的医疗包：\"嗯……这些我可以帮你换成药品。\"\n请选择要交易的物品：");
    const opts = offerings.map((item, i) => ({
      text: item.label,
      action: "lili_trade_confirm",
      index: i,
      tradeItem: item,
    }));
    opts.push({ text: "返回", action: "lili_back", index: -1 });
    setOptions(opts);
    return;
  }
}

export function handleLiliTrade(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;
  const option = state.options[optionIndex];
  if (option.action === "lili_back") { showExploreOptionsState(); return; }

  const item = option.tradeItem;
  if (!item) { showExploreOptionsState(); return; }

  state.medicine.splice(item.idx, 1);

  const rewardMeds = LILI_REWARD_MEDICINE_IDS.map(id => MEDICINES.find(m => m.id === id)).filter(Boolean);
  const count = Math.floor(Math.random() * 3) + 2;
  const rewards = [];
  for (let i = 0; i < count; i++) {
    const med = rewardMeds[Math.floor(Math.random() * rewardMeds.length)];
    const added = addItem({ ...med });
    if (added) rewards.push(med.name);
  }
  if (rewards.length > 0) {
    setStory(`莉莉丝接过你的物品，熟练地调配了一番。她给了你：${rewards.join("、")}。`);
  } else {
    setStory("莉莉丝接过你的物品，但背包已满，无法接收更多药品。");
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    showExploreOptionsState();
  }
}

export function handleLiliTradeConfirm(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;
  const option = state.options[optionIndex];
  if (option.action === "lili_back") { showExploreOptionsState(); return; }

  const item = option.tradeItem;
  if (!item) { showExploreOptionsState(); return; }

  state.medicine.splice(item.idx, 1);

  const rewardMeds2 = LILI_REWARD_MEDICINE_IDS.map(id => MEDICINES.find(m => m.id === id)).filter(Boolean);
  const count = Math.floor(Math.random() * 3) + 2;
  const rewards = [];
  for (let i = 0; i < count; i++) {
    const med = rewardMeds[Math.floor(Math.random() * rewardMeds.length)];
    const added = addItem({ ...med });
    if (added) rewards.push(med.name);
  }
  if (rewards.length > 0) {
    setStory(`莉莉丝接过你的物品，熟练地调配了一番。她给了你：${rewards.join("、")}。`);
  } else {
    setStory("莉莉丝接过你的物品，但背包已满，无法接收更多药品。");
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    showExploreOptionsState();
  }
}
