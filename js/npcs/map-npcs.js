/* ============================================================
   地图 NPC 模块
   组织顺序：地图NPC入口 → 交易/赠送
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
  addNpcAffinity,
  getNpcAffinity,
  getAffinityLabel,
  getAffinityStage,
} from '../state.js';

import {
  showExploreOptionsState,
} from '../routing.js';

import {
  SURVIVOR_NPC,
  CIGARETTES,
} from '../config.js';

export function handleMapNpcs(npcId) {
  const state = getState();
  const npcData = SURVIVOR_NPC.find(n => n.id === npcId);
  if (!npcData) {
    setStory("这里空无一人。");
    showExploreOptionsState();
    return;
  }
  state._currentNpc = npcId;
  const affinity = getNpcAffinity(npcId);
  const stage = getAffinityStage(affinity);
  const intro = npcData.desc;
  setStory(intro + `\n\n好感度：${affinity}/200`);
  setPhase("map_npc");
  setOptions([
    { text: "交易", action: "map_npc_trade" },
    { text: "赠送", action: "map_npc_gift" },
    { text: "离开", action: "map_npc_leave" },
  ]);
}

export function handleMapNpcsAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const action = state.options[optionIndex].action;

  if (action === "map_npc_leave") {
    setStory("你离开了这里。");
    showExploreOptionsState();
    return;
  }

  if (action === "map_npc_trade") {
    const npcId = state._currentNpc;
    const npcData = SURVIVOR_NPC.find(n => n.id === npcId);
    if (!npcData) return;
    let items = [];
    state.food.forEach((item, i) => items.push({ cat: "food", idx: i, name: item.name, label: `[食物] ${item.name}` }));
    state.drinks.forEach((item, i) => items.push({ cat: "drinks", idx: i, name: item.name, label: `[饮品] ${item.name}` }));
    state.medicine.forEach((item, i) => items.push({ cat: "medicine", idx: i, name: item.name, label: `[医疗] ${item.name}` }));
    state.cargo.forEach((item, i) => items.push({ cat: "cargo", idx: i, name: item.name, label: `[货物] ${item.name}` }));
    if (items.length === 0) {
      setStory("你没有什么可以交易的。");
      handleMapNpcs(npcId);
      return;
    }
    setPhase("map_npc_trade");
    setStory("选择你要交易的物品：");
    const opts = items.map((item, i) => ({ text: item.label, action: "map_npc_trade_confirm", index: i, tradeItem: item }));
    opts.push({ text: "返回", action: "map_npc_trade_back", index: -1 });
    setOptions(opts);
    return;
  }

  if (action === "map_npc_gift") {
    const npcId = state._currentNpc;
    const cigs = state.cargo;
    if (cigs.length === 0) {
      setStory("你没有香烟可以赠送。");
      handleMapNpcs(npcId);
      return;
    }
    const cig = cigs.pop();
    addNpcAffinity(npcId, 2);
    const affinity = getNpcAffinity(npcId);
    setStory(`你递上一支${cig.name}。${SURVIVOR_NPC.find(n => n.id === npcId)?.name || "对方"}露出感激的神色，好感度 +2（当前 ${affinity}/200）。`);
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    if (!state.gameOver) {
      handleMapNpcs(npcId);
    }
    return;
  }
}

export function handleMapNpcTrade(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;
  const option = state.options[optionIndex];
  if (option.action === "map_npc_trade_back") {
    handleMapNpcs(state._currentNpc);
    return;
  }
  const item = option.tradeItem;
  if (!item) { showExploreOptionsState(); return; }
  const catMap = { food: state.food, drinks: state.drinks, medicine: state.medicine, cargo: state.cargo };
  catMap[item.cat].splice(item.idx, 1);
  const cig = CIGARETTES[Math.floor(Math.random() * CIGARETTES.length)];
  addItem({ ...cig });
  setStory(`你交易了${item.name}，获得了一支${cig.name}。`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    showExploreOptionsState();
  }
}

export function handleMapNpcGift(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;
  const npcId = state._currentNpc;
  const cigs = state.cargo;
  if (cigs.length === 0) {
    setStory("你没有香烟可以赠送。");
    handleMapNpcs(npcId);
    return;
  }
  const cig = cigs.pop();
  addNpcAffinity(npcId, 2);
  setStory(`你递上一支${cig.name}。${SURVIVOR_NPC.find(n => n.id === npcId)?.name || "对方"}露出感激的神色，好感度 +2。`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    handleMapNpcs(npcId);
  }
}


