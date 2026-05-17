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

import { getRandomTrade, BACKPACK_TYPES, LOOT_BACKPACKS, V_TRADE_AMMO_TYPES } from '../config.js';

export function handleVAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const action = state.options[optionIndex].action;

  if (action === "v_back") {
    showExploreOptionsState();
    return;
  }

  if (action === "v_trade") {
    const offerings = [];
    state.food.forEach((item, i) => offerings.push({ cat: "food", idx: i, name: item.name, label: `[食物] ${item.name}` }));
    state.drinks.forEach((item, i) => offerings.push({ cat: "drinks", idx: i, name: item.name, label: `[饮品] ${item.name}` }));
    state.cargo.forEach((item, i) => offerings.push({ cat: "cargo", idx: i, name: item.name, label: `[货物] ${item.name}` }));
    if (offerings.length === 0) {
      setStory("V小姐瞥了你一眼：\"你两手空空，拿什么交易？\"");
      showExploreOptionsState();
      return;
    }
    setPhase("v_trade");
    setStory("V小姐把你的背包拿过去翻了翻，挑选她要的东西：");
    const opts = offerings.map((item, i) => ({
      text: item.label,
      action: "v_trade_confirm",
      index: i,
      vItem: item,
    }));
    opts.push({ text: "返回", action: "v_back", index: -1 });
    setOptions(opts);
    return;
  }

  if (action === "v_backpack") {
    setPhase("explore");
    const bpNames = LOOT_BACKPACKS.map(b => b.id);
    let cap = 0;
    let name = "无名背包";
    const tradeItem = state.options[optionIndex].vItem;
    if (tradeItem) {
      const catMap2 = { food: state.food, drinks: state.drinks, cargo: state.cargo };
      catMap2[tradeItem.cat].splice(tradeItem.idx, 1);
    }
    const bpItem = bpNames[Math.floor(Math.random() * bpNames.length)];
    const bpConfig = {};
    for (const bp of LOOT_BACKPACKS) { bpConfig[bp.id] = bp.capacity; }
    cap = bpConfig[bpItem];
    name = bpItem;
    const added = addItem({ name, type: "other", capacity: cap });
    if (added) {
      setStory(`V小姐清点了一下你的背包，然后从身后拿出一个${name}（容量${cap}）递给你："还行吧？"`);
    } else {
      setStory(`V小姐想给你一个${name}，但你的背包已满。`);
    }
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    if (!state.gameOver) {
      showExploreOptionsState();
    }
    return;
  }
}

export function handleVTrade(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;
  const option = state.options[optionIndex];
  if (option.action === "v_back") { showExploreOptionsState(); return; }

  const offerItem = option.vItem;
  if (!offerItem) { showExploreOptionsState(); return; }

  setPhase("v_trade_result");
  const catMap = { food: state.food, drinks: state.drinks, cargo: state.cargo };
  catMap[offerItem.cat].splice(offerItem.idx, 1);

  const trade = getRandomTrade();
  const ammoCount = Math.floor(Math.random() * 5) + 3;
  const ammoTypes = V_TRADE_AMMO_TYPES;
  const randomAmmo = ammoTypes[Math.floor(Math.random() * ammoTypes.length)];
  addItem({ id: randomAmmo, name: randomAmmo, type: "ammo", count: ammoCount });

  setStory(`V小姐收下了你的${offerItem.name}，丢给你${ammoCount}发${randomAmmo}。"公平交易。"`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    showExploreOptionsState();
  }
}

export function handleVTradeConfirm(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;
  const option = state.options[optionIndex];
  if (option.action === "v_back") { showExploreOptionsState(); return; }

  const item = option.vItem;
  if (!item) return;

  const catMap = { food: state.food, drinks: state.drinks, cargo: state.cargo };
  catMap[item.cat].splice(item.idx, 1);

  const ammoTypes = V_TRADE_AMMO_TYPES;
  const randomAmmo = ammoTypes[Math.floor(Math.random() * ammoTypes.length)];
  const ammoCount = Math.floor(Math.random() * 5) + 3;
  addItem({ id: randomAmmo, name: randomAmmo, type: "ammo", count: ammoCount });

  const bpNames = LOOT_BACKPACKS.map(b => b.id);
  const bpConfig = {};
  for (const bp of LOOT_BACKPACKS) { bpConfig[bp.id] = bp.capacity; }
  const randomBp = bpNames[Math.floor(Math.random() * bpNames.length)];
  const cap = bpConfig[randomBp];
  addItem({ name: randomBp, type: "other", capacity: cap });

  setStory(`V小姐收下了你的${item.name}，十分满意。她给了你${ammoCount}发${randomAmmo}和一个${randomBp}（容量${cap}）。`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    showExploreOptionsState();
  }
}
