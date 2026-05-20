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
  addCigarettes,
  removeCigarettes,
  removeGasoline,
  getItemDisplayName,
} from '../state.js';

import {
  showExploreOptionsState,
} from '../routing.js';

import {
  SURVIVOR_NPC,
  GAME_CONSTANTS,
  AFFINITY_MAX,
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
  setStory(intro + `\n\n好感度：${affinity}/${AFFINITY_MAX[npcId]}`);
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
    state.food.forEach((item, i) => items.push({ cat: "food", idx: i, name: getItemDisplayName(item), label: `[食物] ${getItemDisplayName(item)}` }));
    state.drinks.forEach((item, i) => items.push({ cat: "drinks", idx: i, name: getItemDisplayName(item), label: `[饮品] ${getItemDisplayName(item)}` }));
    state.medicine.forEach((item, i) => items.push({ cat: "medicine", idx: i, name: getItemDisplayName(item), label: `[医疗] ${getItemDisplayName(item)}` }));
    if (state.cigarettes > 0) items.push({ cat: "cigarettes", idx: 0, name: "香烟", label: `[货物] (${state.cigarettes})香烟` });
    if (state.gasoline > 0) items.push({ cat: "gasoline", idx: 0, name: "汽油", label: `[货物] (${state.gasoline})汽油` });
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
    if (state.cigarettes <= 0 && state.gasoline <= 0) {
      setStory("你没有香烟或汽油可以赠送。");
      handleMapNpcs(npcId);
      return;
    }
    let giftItems = [];
    if (state.cigarettes > 0) giftItems.push({ cat: "cigarettes", name: "香烟" });
    if (state.gasoline > 0) giftItems.push({ cat: "gasoline", name: "汽油" });
    if (giftItems.length === 1) {
      const gift = giftItems[0];
      if (gift.cat === "cigarettes") removeCigarettes(1);
      else if (gift.cat === "gasoline") removeGasoline(1);
      addNpcAffinity(npcId, GAME_CONSTANTS.NPC.MAP_NPC_GIFT_AFFINITY);
      const affinity = getNpcAffinity(npcId);
      setStory(`你递上了一份${gift.name}。${SURVIVOR_NPC.find(n => n.id === npcId)?.name || "对方"}露出感激的神色，好感度 +${GAME_CONSTANTS.NPC.MAP_NPC_GIFT_AFFINITY}（当前 ${affinity}/${AFFINITY_MAX[npcId]}）。`);
      advanceTime(1);
      updateStatusEffects();
      checkDeath();
      if (!state.gameOver) {
        handleMapNpcs(npcId);
      }
      return;
    }
    setPhase("map_npc_gift_select");
    setStory("请选择要赠送的物品：");
    const opts = giftItems.map((item, i) => ({ text: `[货物] ${item.name}`, action: "map_npc_gift_confirm", index: i, giftItem: item }));
    opts.push({ text: "返回", action: "map_npc_gift_back", index: -1 });
    setOptions(opts);
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
  const catMap = { food: state.food, drinks: state.drinks, medicine: state.medicine, cigarettes: [], gasoline: [] };
  if (item.cat === "cigarettes") {
    removeCigarettes(1);
  } else if (item.cat === "gasoline") {
    removeGasoline(1);
  } else {
    const targetItem = catMap[item.cat][item.idx];
    if (targetItem && (targetItem.count || 1) > 1) {
      targetItem.count = (targetItem.count || 1) - 1;
    } else {
      catMap[item.cat].splice(item.idx, 1);
    }
  }
  addCigarettes(1);
  setStory(`你交易了${getItemDisplayName(item)}，获得了一根香烟。`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    showExploreOptionsState();
  }
}

export function handleMapNpcGiftConfirm(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;
  const option = state.options[optionIndex];

  if (option.action === "map_npc_gift_back") {
    handleMapNpcs(state._currentNpc);
    return;
  }

  const npcId = state._currentNpc;
  const gift = option.giftItem;
  if (!gift) { handleMapNpcs(npcId); return; }

  if (gift.cat === "cigarettes") removeCigarettes(1);
  else if (gift.cat === "gasoline") removeGasoline(1);

  addNpcAffinity(npcId, GAME_CONSTANTS.NPC.MAP_NPC_GIFT_AFFINITY);
  const affinity = getNpcAffinity(npcId);
  setStory(`你递上了一份${gift.name}。${SURVIVOR_NPC.find(n => n.id === npcId)?.name || "对方"}露出感激的神色，好感度 +${GAME_CONSTANTS.NPC.MAP_NPC_GIFT_AFFINITY}（当前 ${affinity}/${AFFINITY_MAX[npcId]}）。`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    handleMapNpcs(npcId);
  }
}


