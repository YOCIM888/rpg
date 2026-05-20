/* ============================================================
   NPC 核心逻辑模块
   组织顺序：NPC配置 → 交互/对话 → 任务投放 → 回收/修理/治疗
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
  removeItem,
  addNpcAffinity,
  getNpcAffinity,
  getAffinityLabel,
  canChatToday,
  incrementChatCount,
  getAffinityStage,
  isQuestDone,
  markQuestDone,
  addCigarettes,
  removeCigarettes,
  removeGasoline,
  getItemDisplayName,
  isStackableType,
} from '../state.js';

import {
  SURVIVOR_NPC,
  MELEE_WEAPONS,
  RANGED_WEAPONS,
  AMMO,
  CROPS,
  BUILDING_MATERIALS,
  CANNED_FOOD_IDS,
  FRUITS,
  DRINKS,
  FOODS,
  MEDICINES,
  DEFAULT_ITEM_IDS,
  GAME_CONSTANTS,
  CASTLE_REJECTION_DIALOGUES,
  AFFINITY_MAX,
} from '../config.js';

import {
  showExploreOptionsState,
  returnToMenu,
} from '../routing.js';

import {
  handleEquipSelect,
  handleDiscardSelect,
} from '../equipment.js';

import { hasCastleIdentity, hasDawnCaptainBadge } from '../faction.js';

import {
  showMumiaoOptions,
  handleMumiaoAction,
} from './mumiao.js';

function getCaptainDiscountCost(state, npcId, baseCost) {
  if (npcId === "lili" && hasDawnCaptainBadge(state)) {
    return Math.round(baseCost / 2);
  }
  return baseCost;
}

// ---------- NPC 配置 ----------

function getNpcConfig() {
  const state = getState();
  const npcId = state._currentNpc;
  return SURVIVOR_NPC.find(n => n.id === npcId);
}

// ---------- NPC 交互入口 ----------

function npcHeader(npcId) {
  const state = getState();
  state._currentNpc = npcId;
  const config = SURVIVOR_NPC.find(n => n.id === npcId);
  if (!config) {
    setStory("这个人已经不在了……");
    returnToMenu();
    return;
  }
  const affinity = getNpcAffinity(npcId);
  const stage = getAffinityStage(affinity);
  const friendshipLabel = getAffinityLabel(affinity);
  let description = config.desc;
  description += `\n\n当前好感：${affinity}/${AFFINITY_MAX[npcId]}（${friendshipLabel}）`;
  if (npcId === "lili") {
    description += `\n\n💡 莉莉丝可以帮你：回收武器换香烟 | 维修枪支 | 修复弓弩 | 治疗感染 | 医疗物资交易`;
    if (affinity >= AFFINITY_MAX[npcId] && !isQuestDone("llGift")) {
      description += `\n\n🎁 莉莉丝似乎有东西想给你……`;
    }
  } else if (npcId !== "v") {
    description += `\n\n你也把你的背包拿过去说：\"你看下我的装备，可以回收/交易等\"`;
  }
  return description;
}

export function handleNpcInteract(npcId) {
  const state = getState();
  const config = SURVIVOR_NPC.find(n => n.id === npcId);
  if (!config) {
    setStory("这个人已经不在这里了……");
    returnToMenu();
    return;
  }

  const hasCastle = hasCastleIdentity(state);
  if (hasCastle && (npcId === "v" || npcId === "xiaohan" || npcId === "lili")) {
    const npcNames = { v: "V小姐", xiaohan: "苏小涵", lili: "莉莉丝" };
    const name = npcNames[npcId] || "NPC";
    setStory(CASTLE_REJECTION_DIALOGUES[npcId] || `${name}看到你的城堡身份牌后，态度立刻变得冷淡：\"城堡的人来这里做什么？请离开。\"`);
    setPhase("npc_" + npcId);
    state._currentNpc = npcId;
    setOptions([{ text: "返回", action: "return" }]);
    return;
  }

  if (npcId === "mumiao") {
    showMumiaoOptions();
    return;
  }

  setPhase("npc_" + npcId);
  state._currentNpc = npcId;
  setStory(npcHeader(npcId));
  handleNpcAction("chat");
}

export function getAvailableQuest(npcId) {
  const state = getState();
  if (state._npcDailyQuests?.[npcId]) return state._npcDailyQuests[npcId];
  const npcConfig = SURVIVOR_NPC.find(n => n.id === npcId);
  if (!npcConfig || !npcConfig.quests) return null;
  const affinity = state.npcAffinity[npcId] || 0;
  const quests = npcConfig.quests;
  let bestQuest = null;
  let bestReq = -1;
  for (const [questId, quest] of Object.entries(quests)) {
    if (state.npcQuestsDone[questId]) continue;
    const req = quest.reqAffection || 0;
    if (affinity >= req && req > bestReq) {
      bestReq = req;
      bestQuest = { id: questId, ...quest, npcId };
    }
  }
  return bestQuest;
}

export function handleNpcAction(input) {
  const state = getState();

  const npcId = state._currentNpc;
  const hasCastle = hasCastleIdentity(state);
  if (hasCastle && npcId && (npcId === "v" || npcId === "xiaohan" || npcId === "lili")) {
    const npcNames = { v: "V小姐", xiaohan: "苏小涵", lili: "莉莉丝" };
    const name = npcNames[npcId] || "NPC";
    setStory(CASTLE_REJECTION_DIALOGUES[npcId] || `${name}看到你的城堡身份牌后，态度立刻变得冷淡：\"城堡的人来这里做什么？请离开。\"`);
    setPhase("npc_" + npcId);
    setOptions([{ text: "返回", action: "return" }]);
    return;
  }

  let action;
  let isInitial = typeof input === "string";
  if (isInitial) {
    action = input;
  } else {
    const optionIndex = input - 1;
    if (optionIndex < 0 || optionIndex >= state.options.length) return;
    action = state.options[optionIndex].action;
  }

  if (action === "return") {
    state._currentNpc = null;
    returnToMenu();
    return;
  }

  if (!isInitial) {
    if (action === "chat") { handleNpcChat(); return; }
    if (action === "gift") { handleNpcGift(); return; }
    if (action === "recycle") { handleNpcRecycle(); return; }
    if (action === "recycle_ranged") { handleNpcRecycleRanged(); return; }
    if (action === "repair") { handleNpcRepair(); return; }
    if (action === "repair_bow") { handleNpcRepairBow(); return; }
    if (action === "cure_infection") { handleNpcCureInfection(); return; }
    if (action === "quest") { handleNpcQuest(); return; }
    if (action === "lili_gift_claim") { handleLiliGiftClaim(); return; }
    if (action === "mumiao_buy_seeds" || action === "mumiao_tend_field" || action === "mumiao_secret" || action === "mumiao_secret_locked" || action === "mumiao_gift" || action === "mumiao_leave") {
      handleMumiaoAction(input);
      return;
    }
    if (action === "lili_repair_gun") { handleLiliRepairGun(); return; }
    if (action === "lili_repair_bow") { handleLiliRepairBow(); return; }
    if (action === "trade") {
      const npcId = state._currentNpc;
      if (npcId === "v") {
        const offerings = [];
        state.food.forEach((item, i) => offerings.push({ cat: "food", idx: i, name: getItemDisplayName(item), label: `[食物] ${getItemDisplayName(item)}` }));
        state.drinks.forEach((item, i) => offerings.push({ cat: "drinks", idx: i, name: getItemDisplayName(item), label: `[饮品] ${getItemDisplayName(item)}` }));
        if (state.cigarettes > 0) offerings.push({ cat: "cigarettes", idx: 0, name: "香烟", label: `[货物] (${state.cigarettes})香烟` });
        if (state.gasoline > 0) offerings.push({ cat: "gasoline", idx: 0, name: "汽油", label: `[货物] (${state.gasoline})汽油` });
        if (offerings.length === 0) {
          setStory("V小姐瞥了你一眼：\"你两手空空，拿什么交易？\"");
          handleNpcAction("chat");
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
      } else if (npcId === "xiaohan") {
        const offerings = [];
        state.food.forEach((item, i) => offerings.push({ cat: "food", idx: i, name: getItemDisplayName(item) }));
        state.drinks.forEach((item, i) => offerings.push({ cat: "drinks", idx: i, name: getItemDisplayName(item) }));
        state.medicine.forEach((item, i) => offerings.push({ cat: "medicine", idx: i, name: getItemDisplayName(item) }));
        state.other.forEach((item, i) => offerings.push({ cat: "other", idx: i, name: getItemDisplayName(item) }));
        if (state.cigarettes > 0) offerings.push({ cat: "cigarettes", idx: 0, name: "香烟" });
        if (state.gasoline > 0) offerings.push({ cat: "gasoline", idx: 0, name: "汽油" });
        if (offerings.length === 0) {
          setStory("苏小涵歪着头看了看你：\"你没有东西可以给我呢……\"");
          handleNpcAction("chat");
          return;
        }
        setPhase("xiaohan_trade");
        setStory("苏小涵好奇地翻看着你的背包，最后停在了一件物品上：\"这个！我可以拿东西跟你换吗？\"\n请选择要交易的物品：");
        const opts = offerings.map((item, i) => ({
          text: item.label || `[${item.cat}] ${item.name}`,
          action: "xiaohan_trade_confirm",
          index: i,
          tradeItem: item,
        }));
        opts.push({ text: "返回", action: "xiaohan_back", index: -1 });
        setOptions(opts);
      } else if (npcId === "lili") {
        const offerings = [];
        state.medicine.forEach((item, i) => offerings.push({ cat: "medicine", idx: i, name: getItemDisplayName(item), label: `[医疗] ${getItemDisplayName(item)}` }));
        if (offerings.length === 0) {
          setStory("莉莉丝摇了摇头：\"你没有医疗物资可以交易……\"");
          handleNpcAction("chat");
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
      }
      return;
    }
  }

  const config = SURVIVOR_NPC.find(n => n.id === npcId);
  if (!config) { returnToMenu(); return; }

  const actions = [
    { text: "对话", action: "chat" },
  ];

  if (config.canTrade !== false) {
    actions.push({ text: "交易", action: "trade" });
  }

  const availableQuest = getAvailableQuest(npcId);
  if (availableQuest) {
    actions.push({ text: "查看悬赏", action: "quest" });
  }

  if (config.canGift !== false) {
    actions.push({ text: "赠送物品", action: "gift" });
  }

  if (config.canRecycle) {
    actions.push({ text: config.recycleQuest?.name || "回收近战武器", action: "recycle" });
    actions.push({ text: config.recycleRangedQuest?.name || "回收远程武器", action: "recycle_ranged" });
  }

  if (config.canRepair) {
    actions.push({ text: "修理近战武器", action: "repair" });
    if (config.canRepairBow) {
      actions.push({ text: "修理远程武器", action: "repair_bow" });
    }
  }

  if (config.repairQuest) {
    actions.push({ text: config.repairQuest.name, action: "lili_repair_gun" });
  }
  if (config.repairBowQuest) {
    actions.push({ text: config.repairBowQuest.name, action: "lili_repair_bow" });
  }

  if (config.canCureInfection || config.cureInfectionQuest) {
    actions.push({ text: config.cureInfectionQuest?.name || "治疗感染", action: "cure_infection" });
  }

  if (npcId === "lili" && config.giftQuest) {
    const giftAffinity = getNpcAffinity(npcId);
    if (giftAffinity >= config.giftQuest.reqAffection && !isQuestDone("llGift")) {
      actions.push({ text: "领取神秘礼物", action: "lili_gift_claim" });
    }
  }

  actions.push({ text: "返回", action: "return" });

  setPhase("npc_" + npcId);
  setOptions(actions);
}

// ---------- 对话 ----------

export function handleNpcChat() {
  const state = getState();
  const npcId = state._currentNpc;
  const config = SURVIVOR_NPC.find(n => n.id === npcId);
  if (!config) { returnToMenu(); return; }

  if (!canChatToday(npcId)) {
    setStory("今天已经聊得够多了，明天再来吧。");
    handleNpcAction("chat");
    return;
  }

  const affinity = getNpcAffinity(npcId);
  const stage = getAffinityStage(affinity);
  const lines = config.dialogues[stage] || config.dialogues["stranger"];
  const line = lines[Math.floor(Math.random() * lines.length)];
  incrementChatCount(npcId);
  addNpcAffinity(npcId, GAME_CONSTANTS.NPC.CHAT_AFFINITY);
  setStory(line + `\n\n好感度 +${GAME_CONSTANTS.NPC.CHAT_AFFINITY}（当前 ${affinity + GAME_CONSTANTS.NPC.CHAT_AFFINITY}/${AFFINITY_MAX[npcId]}）`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    handleNpcAction("chat");
  }
}

// ---------- 赠送 ----------

export function handleNpcGift() {
  const state = getState();
  const npcId = state._currentNpc;
  let items = [];
  state.food.forEach((item, i) => items.push({ ...item, cat: "food", idx: i, label: `[食物] ${getItemDisplayName(item)}` }));
  state.drinks.forEach((item, i) => items.push({ ...item, cat: "drinks", idx: i, label: `[饮品] ${getItemDisplayName(item)}` }));
  state.medicine.forEach((item, i) => items.push({ ...item, cat: "medicine", idx: i, label: `[医疗] ${getItemDisplayName(item)}` }));
  state.other.forEach((item, i) => items.push({ ...item, cat: "other", idx: i, label: `[其他] ${getItemDisplayName(item)}` }));
  if (state.seeds) state.seeds.forEach((item, i) => items.push({ ...item, cat: "seed", idx: i, label: `[种子] ${getItemDisplayName(item)}` }));
  if (state.cigarettes > 0) items.push({ cat: "cigarettes", idx: 0, name: "香烟", label: `[货物] (${state.cigarettes})香烟` });
  if (state.gasoline > 0) items.push({ cat: "gasoline", idx: 0, name: "汽油", label: `[货物] (${state.gasoline})汽油` });
  if (items.length === 0) {
    setStory("你翻遍了背包，发现没什么能送人的东西……");
    handleNpcAction("chat");
    return;
  }
  setPhase("npc_gift");
  setStory("请选择要赠送的物品（不同物品好感提升不同）：");
  const opts = items.map((item, i) => ({ text: item.label, action: "gift_confirm", index: i, giftItem: item }));
  opts.push({ text: "返回", action: "gift_back", index: -1 });
  setOptions(opts);
}

export function handleNpcGiftConfirm(input) {
  const state = getState();
  const npcId = state._currentNpc;
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) {
    handleNpcAction("chat");
    return;
  }

  const option = state.options[optionIndex];
  if (option.action === "gift_back") {
    handleNpcAction("chat");
    return;
  }

  const item = option.giftItem;
  const catMap = {
    food: state.food,
    drinks: state.drinks,
    medicine: state.medicine,
    other: state.other,
    seed: state.seeds,
    cigarettes: [],
    gasoline: []
  };

  let affinityGain = 1;
  let giftName = item.name || "香烟";
  if (item.cat === "cigarettes") {
    removeCigarettes(1);
    affinityGain = GAME_CONSTANTS.NPC.GIFT_AFFINITY_CARGO;
    giftName = "香烟";
  } else if (item.cat === "gasoline") {
    removeGasoline(1);
    affinityGain = GAME_CONSTANTS.NPC.GIFT_AFFINITY_CARGO;
    giftName = "汽油";
  } else {
    const arr = catMap[item.cat];
    const targetItem = arr[item.idx];
    if (targetItem && (targetItem.count || 1) > 1) {
      targetItem.count = (targetItem.count || 1) - 1;
    } else {
      arr.splice(item.idx, 1);
    }
    if (item.cat === "food") affinityGain = GAME_CONSTANTS.NPC.GIFT_AFFINITY_FOOD;
    else if (item.cat === "drinks") affinityGain = GAME_CONSTANTS.NPC.GIFT_AFFINITY_DRINKS;
    else if (item.cat === "medicine") affinityGain = GAME_CONSTANTS.NPC.GIFT_AFFINITY_MEDICINE;
  }

  if (npcId === "lili") {
    if (item.cat === "food" || item.cat === "drinks") {
      affinityGain = GAME_CONSTANTS.NPC.LILI_GIFT_AFFINITY_FOOD;
    } else if (item.cat === "medicine") {
      affinityGain = GAME_CONSTANTS.NPC.LILI_GIFT_AFFINITY_MEDICINE;
    }
  }

  addNpcAffinity(npcId, affinityGain);
  let affinity = getNpcAffinity(npcId);
  if (npcId === "lili") {
    setStory(`你送出了${giftName}。${giftName}受到了莉莉丝的喜欢。好感度 +${affinityGain}（当前 ${affinity}/${AFFINITY_MAX.lili}）`);
  } else {
    setStory(`你送出了${giftName}。好感度 +${affinityGain}（当前 ${affinity}/${AFFINITY_MAX[npcId]}）`);
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    handleNpcAction("chat");
  }
}

// ---------- 悬赏任务 ----------

function checkQuestRequire(state, quest) {
  const req = quest.require;
  if (!req) return { met: true, current: 0, target: 0 };
  const results = [];

  if (req.food) {
    const have = state.food.reduce((sum, i) => sum + (i.count || 1), 0);
    results.push({ met: have >= req.food, current: have, target: req.food });
  }
  if (req.drinks) {
    if (req.drinkId) {
      const have = state.drinks.filter(d => d.id === req.drinkId).reduce((sum, d) => sum + (d.count || 1), 0);
      results.push({ met: have >= req.drinks, current: have, target: req.drinks });
    } else {
      const have = state.drinks.reduce((sum, d) => sum + (d.count || 1), 0);
      results.push({ met: have >= req.drinks, current: have, target: req.drinks });
    }
  }
  if (req.medicine) {
    if (req.medicineId) {
      const have = state.medicine.filter(m => m.id === req.medicineId).reduce((sum, m) => sum + (m.count || 1), 0);
      results.push({ met: have >= req.medicine, current: have, target: req.medicine });
    } else {
      const have = state.medicine.reduce((sum, m) => sum + (m.count || 1), 0);
      results.push({ met: have >= req.medicine, current: have, target: req.medicine });
    }
  }
  if (req.items) {
    let allMet = true;
    let totalCurrent = 0;
    let totalTarget = 0;
    for (const itemReq of req.items) {
      const have = state[itemReq.type].filter(i => i.id === itemReq.id).reduce((sum, i) => sum + (i.count || 1), 0);
      if (have < itemReq.count) allMet = false;
      totalCurrent += Math.min(have, itemReq.count);
      totalTarget += itemReq.count;
    }
    results.push({ met: allMet, current: totalCurrent, target: totalTarget });
  }
  if (req.allCanned) {
    const have = CANNED_FOOD_IDS.filter(id => state.food.some(f => f.id === id)).length;
    results.push({ met: have >= CANNED_FOOD_IDS.length, current: have, target: CANNED_FOOD_IDS.length });
  }
  if (req.allFruits) {
    const fruitIds = FRUITS.map(f => f.id);
    const have = fruitIds.filter(id => state.food.some(f => f.id === id)).length;
    results.push({ met: have >= fruitIds.length, current: have, target: fruitIds.length });
  }
  if (req.allDrinks) {
    const drinkIds = DRINKS.map(d => d.id);
    const have = drinkIds.filter(id => state.drinks.some(d => d.id === id)).length;
    if (req.allFoods) {
      const foodIds = FOODS.map(f => f.id);
      const foodHave = foodIds.filter(id => state.food.some(f => f.id === id)).length;
      results.push({ met: have >= drinkIds.length && foodHave >= foodIds.length, current: have + foodHave, target: drinkIds.length + foodIds.length });
    } else {
      results.push({ met: have >= drinkIds.length, current: have, target: drinkIds.length });
    }
  }
  if (req.allMedicine) {
    const medIds = MEDICINES.map(m => m.id);
    const have = medIds.filter(id => {
      const med = state.medicine.find(m => m.id === id);
      return med && (med.count || 1) >= 2;
    }).length;
    results.push({ met: have >= medIds.length, current: have, target: medIds.length });
  }

  if (results.length === 0) return { met: true, current: 0, target: 0 };
  const allMet = results.every(r => r.met);
  const totalCurrent = results.reduce((s, r) => s + r.current, 0);
  const totalTarget = results.reduce((s, r) => s + r.target, 0);
  return { met: allMet, current: totalCurrent, target: totalTarget };
}

function removeQuestItems(state, quest) {
  const req = quest.require;
  if (!req) return;

  function removeStackableItems(arr, count, filterFn) {
    let remaining = count;
    for (let i = arr.length - 1; i >= 0 && remaining > 0; i--) {
      if (!filterFn || filterFn(arr[i])) {
        const available = arr[i].count || 1;
        if (available <= remaining) {
          arr.splice(i, 1);
          remaining -= available;
        } else {
          arr[i].count = available - remaining;
          remaining = 0;
        }
      }
    }
  }

  if (req.food) {
    removeStackableItems(state.food, req.food);
  }
  if (req.drinks) {
    if (req.drinkId) {
      removeStackableItems(state.drinks, req.drinks, d => d.id === req.drinkId);
    } else {
      removeStackableItems(state.drinks, req.drinks);
    }
  }
  if (req.medicine) {
    if (req.medicineId) {
      removeStackableItems(state.medicine, req.medicine, m => m.id === req.medicineId);
    } else {
      removeStackableItems(state.medicine, req.medicine);
    }
  }
  if (req.items) {
    for (const itemReq of req.items) {
      removeStackableItems(state[itemReq.type], itemReq.count, i => i.id === itemReq.id);
    }
  }
  if (req.allCanned) {
    for (const id of CANNED_FOOD_IDS) {
      const idx = state.food.findIndex(f => f.id === id);
      if (idx !== -1) {
        const item = state.food[idx];
        if ((item.count || 1) > 1) {
          item.count = (item.count || 1) - 1;
        } else {
          state.food.splice(idx, 1);
        }
      }
    }
  }
  if (req.allFruits) {
    const fruitIds = FRUITS.map(f => f.id);
    for (const id of fruitIds) {
      const idx = state.food.findIndex(f => f.id === id);
      if (idx !== -1) {
        const item = state.food[idx];
        if ((item.count || 1) > 1) {
          item.count = (item.count || 1) - 1;
        } else {
          state.food.splice(idx, 1);
        }
      }
    }
  }
  if (req.allDrinks) {
    const drinkIds = DRINKS.map(d => d.id);
    for (const id of drinkIds) {
      const idx = state.drinks.findIndex(d => d.id === id);
      if (idx !== -1) {
        const item = state.drinks[idx];
        if ((item.count || 1) > 1) {
          item.count = (item.count || 1) - 1;
        } else {
          state.drinks.splice(idx, 1);
        }
      }
    }
  }
  if (req.allFoods) {
    const foodIds = FOODS.map(f => f.id);
    for (const id of foodIds) {
      const idx = state.food.findIndex(f => f.id === id);
      if (idx !== -1) {
        const item = state.food[idx];
        if ((item.count || 1) > 1) {
          item.count = (item.count || 1) - 1;
        } else {
          state.food.splice(idx, 1);
        }
      }
    }
  }
  if (req.allMedicine) {
    const medIds = MEDICINES.map(m => m.id);
    for (const id of medIds) {
      const idx = state.medicine.findIndex(m => m.id === id);
      if (idx !== -1) {
        const item = state.medicine[idx];
        if ((item.count || 1) > 2) {
          item.count = (item.count || 1) - 2;
        } else {
          state.medicine.splice(idx, 1);
        }
      }
    }
  }
}

function giveQuestReward(state, quest) {
  const rw = quest.reward;
  if (!rw) return;
  if (rw.item) {
    const meleeWeapon = MELEE_WEAPONS.find(w => w.name === rw.item);
    if (meleeWeapon) {
      addItem({ ...meleeWeapon, currentDurability: meleeWeapon.durability });
    }
    const rangedWeapon = RANGED_WEAPONS.find(w => w.id === rw.item);
    if (rangedWeapon) {
      addItem({ ...rangedWeapon });
    }
  }
  if (rw.ammo) {
    const ammoDef = AMMO.find(a => a.id === rw.ammo.type);
    if (ammoDef) {
      addItem({ id: ammoDef.id, name: ammoDef.name, type: "ammo", count: rw.ammo.count });
    }
  }
  if (rw.itemStack) {
    for (const stack of rw.itemStack) {
      const med = MEDICINES.find(m => m.id === stack.id);
      if (med) {
        for (let i = 0; i < stack.count; i++) addItem({ ...med });
      }
      const food = FOODS.find(f => f.id === stack.id);
      if (food) {
        for (let i = 0; i < stack.count; i++) addItem({ ...food });
      }
      const drink = DRINKS.find(d => d.id === stack.id);
      if (drink) {
        for (let i = 0; i < stack.count; i++) addItem({ ...drink });
      }
    }
  }
  if (rw.cigarettes) {
    addCigarettes(rw.cigarettes);
  }
}

export function getQuestProgress(state, quest) {
  const check = checkQuestRequire(state, quest);
  return check.current;
}

export function canSubmitQuest(state, quest) {
  const check = checkQuestRequire(state, quest);
  return check.met;
}

export function handleNpcQuest() {
  const state = getState();
  const npcId = state._currentNpc;
  const quest = getAvailableQuest(npcId);
  if (!quest) {
    setStory("目前没有可接取的悬赏任务。");
    handleNpcAction("chat");
    return;
  }
  const check = checkQuestRequire(state, quest);
  const npcName = SURVIVOR_NPC.find(n => n.id === npcId)?.name || "NPC";
  let desc = `📋 【${quest.name}】\n`;
  desc += `━━━━━━━━━━━━━━━━━\n`;
  desc += `📝 ${quest.desc}\n\n`;
  desc += `📊 进度：${check.current}/${check.target}\n`;
  desc += `🏆 奖励：${quest.reward?.desc || "无"}`;
  if (quest.story) {
    desc += `\n\n💬 ${quest.story}`;
  }
  setPhase("npc_quest");
  setStory(desc);
  const opts = [];
  if (check.met) {
    opts.push({ text: "✅ 提交任务", action: "quest_confirm" });
  }
  opts.push({ text: "📋 查看任务详解", action: "quest_preview" });
  opts.push({ text: "下次再来", action: "quest_back" });
  setOptions(opts);
}

export function handleNpcQuestConfirm() {
  const state = getState();
  const npcId = state._currentNpc;
  const quest = getAvailableQuest(npcId);
  if (!quest || !canSubmitQuest(state, quest)) {
    setStory("任务条件未达成。");
    handleNpcAction("chat");
    return;
  }
  removeQuestItems(state, quest);
  giveQuestReward(state, quest);
  const affinity = getNpcAffinity(npcId);
  addNpcAffinity(npcId, GAME_CONSTANTS.NPC.QUEST_AFFINITY_REWARD);
  markQuestDone(quest.id);
  const npcName = SURVIVOR_NPC.find(n => n.id === npcId)?.name || "NPC";
  setStory(`🎉 你完成了${npcName}的悬赏【${quest.name}】！\n\n🏆 获得奖励：${quest.reward?.desc || "无"}\n💝 好感度 +${GAME_CONSTANTS.NPC.QUEST_AFFINITY_REWARD}（当前 ${affinity + GAME_CONSTANTS.NPC.QUEST_AFFINITY_REWARD}/${AFFINITY_MAX[npcId]}）`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    handleNpcAction("chat");
  }
}

export function handleNpcQuestPreview() {
  const state = getState();
  const npcId = state._currentNpc;
  const quest = getAvailableQuest(npcId);
  if (!quest) {
    setStory("目前没有可接取的悬赏任务。");
    handleNpcAction("chat");
    return;
  }
  const check = checkQuestRequire(state, quest);
  const detailLines = [];
  detailLines.push(`📋 【${quest.name}】`);
  detailLines.push(`━━━━━━━━━━━━━━━━━`);
  detailLines.push(`📝 ${quest.desc}`);
  detailLines.push(``);
  detailLines.push(`📊 当前进度：${check.current}/${check.target}`);
  detailLines.push(``);
  detailLines.push(`🏆 任务奖励：${quest.reward?.desc || "无"}`);
  detailLines.push(`💝 额外好感度：+${GAME_CONSTANTS.NPC.QUEST_AFFINITY_REWARD}`);
  if (quest.story) {
    detailLines.push(``);
    detailLines.push(`💬 ${quest.story}`);
  }
  setPhase("npc_quest_preview");
  setStory(detailLines.join("\n"));
  const opts = [];
  if (check.met) {
    opts.push({ text: "✅ 提交任务", action: "quest_confirm" });
  }
  opts.push({ text: "返回", action: "quest_back" });
  setOptions(opts);
}

export function handleNpcRecycle() {
  const state = getState();
  const npcId = state._currentNpc;
  const meleeItems = state.other.filter(item => item.type === "melee" && item.id !== DEFAULT_ITEM_IDS.melee);
  if (meleeItems.length === 0) {
    if (npcId === "lili") {
      setStory("莉莉丝翻了翻你的背包：\"没有废旧武器呀……你去工厂找找看？\"");
    } else {
      setStory("你没有任何可回收的近战武器。");
    }
    handleNpcAction("chat");
    return;
  }
  setPhase("npc_recycle");
  const opts = meleeItems.map((item, i) => ({
    text: `${item.name}（伤害:${item.damage} 当前耐久:${item.currentDurability}/${item.durability}）`,
    action: "recycle_confirm",
    index: i
  }));
  opts.push({ text: "返回", action: "recycle_back", index: -1 });
  const price = meleeItems[0] ? Math.max(1, Math.floor(meleeItems[0].damage / 10)) : 1;
  if (npcId === "lili") {
    setStory(`莉莉丝眼睛一亮：\"让我看看你的武器！\" 她熟练地翻看着你的近战装备。\n\n选择要回收的近战武器（按伤害定价）：\n普通武器：${price} 香烟/件`);
  } else {
    setStory(`选择要回收的近战武器（按伤害定价）：\n\n普通武器：${price} 香烟/件`);
  }
  setOptions(opts);
}

export function handleRecycleConfirm(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) { handleNpcAction("chat"); return; }
  const option = state.options[optionIndex];
  if (option.action === "recycle_back") { handleNpcAction("chat"); return; }
  const meleeItems = state.other.filter(item => item.type === "melee" && item.id !== DEFAULT_ITEM_IDS.melee);
  const item = meleeItems[option.index];
  if (!item) { handleNpcAction("chat"); return; }
  const price = Math.max(1, Math.floor(item.damage / GAME_CONSTANTS.NPC.RECYCLE_MELEE_DIVISOR));
  addCigarettes(price);
  removeItem("other", state.other.indexOf(item));
  const npcId = state._currentNpc;
  if (npcId === "lili") {
    setStory(`莉莉丝接过${item.name}，爱不释手地端详了一番，然后从兜里掏出${price}根香烟递给你：\"好东西！这个归我了，烟给你~\"`);
  } else {
    setStory(`你回收了${item.name}，获得${price}根香烟。`);
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    handleNpcAction("chat");
  }
}

export function handleNpcRecycleRanged() {
  const state = getState();
  const npcId = state._currentNpc;
  const rangedItems = state.other.filter(item => item.type === "ranged");
  if (rangedItems.length === 0) {
    if (npcId === "lili") {
      setStory("莉莉丝翻了翻你的背包：\"没有远程武器可以回收呀……去警察局或军事检查站找找？\"");
    } else {
      setStory("你没有任何可回收的远程武器。");
    }
    handleNpcAction("chat");
    return;
  }
  setPhase("npc_recycle_ranged");
  const opts = rangedItems.map((item, i) => ({
    text: `${item.name}（伤害:${item.damage} 弹药:${item.ammoType}）`,
    action: "recycle_ranged_confirm",
    index: i
  }));
  opts.push({ text: "返回", action: "recycle_ranged_back", index: -1 });
  if (npcId === "lili") {
    setStory("莉莉丝兴奋地搓着手：\"远程武器的零件最值钱了！\" 她仔细检查着你的远程武器。\n\n选择要回收的远程武器：");
  } else {
    setStory("选择要回收的远程武器：");
  }
  setOptions(opts);
}

export function handleRecycleRangedConfirm(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) { handleNpcAction("chat"); return; }
  const option = state.options[optionIndex];
  if (option.action === "recycle_ranged_back") { handleNpcAction("chat"); return; }
  const rangedItems = state.other.filter(item => item.type === "ranged");
  const item = rangedItems[option.index];
  if (!item) { handleNpcAction("chat"); return; }
  const price = Math.max(1, Math.floor(item.damage / GAME_CONSTANTS.NPC.RECYCLE_RANGED_DIVISOR));
  addCigarettes(price);
  removeItem("other", state.other.indexOf(item));
  const npcId = state._currentNpc;
  if (npcId === "lili") {
    setStory(`莉莉丝小心翼翼地拆解了${item.name}，把零件收进仓库，然后递给你${price}根香烟：\"这些零件能做好多东西呢！烟你拿着~\"`);
  } else {
    setStory(`你回收了${item.name}，获得${price}根香烟。`);
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    handleNpcAction("chat");
  }
}

// ---------- 修理 ----------

export function handleNpcRepair() {
  const state = getState();
  const npcId = state._currentNpc;
  if (state.meleeWeapon.id === DEFAULT_ITEM_IDS.melee) {
    setStory("你目前没有可修理的武器。");
    handleNpcAction("chat");
    return;
  }
  const rawCost = Math.max(1, Math.floor((state.meleeWeapon.durability - state.meleeWeapon.currentDurability) / GAME_CONSTANTS.NPC.REPAIR_MELEE_DIVISOR) + 1);
  const cost = getCaptainDiscountCost(state, npcId, rawCost);
  const cigCount = state.cigarettes;
  setPhase("npc_repair");
  setStory(`修理${state.meleeWeapon.name}需要${cost}根香烟${npcId === "lili" && hasDawnCaptainBadge(state) ? "（曙光队长折扣50%）" : ""}（耐久回复至满）。\n你有${cigCount}根香烟。`);
  setOptions([
    { text: cigCount >= cost ? "🔧 确认修理" : "🔧 确认修理（香烟不足）", action: "repair_confirm", disabled: cigCount < cost },
    { text: "返回", action: "repair_back" },
  ]);
}

export function handleRepairConfirm() {
  const state = getState();
  const npcId = state._currentNpc;
  const rawCost = Math.max(1, Math.floor((state.meleeWeapon.durability - state.meleeWeapon.currentDurability) / GAME_CONSTANTS.NPC.REPAIR_MELEE_DIVISOR) + 1);
  const cost = getCaptainDiscountCost(state, npcId, rawCost);
  if (state.cigarettes < cost) {
    setStory("你没有足够的香烟来支付修理费用。");
    handleNpcAction("chat");
    return;
  }
  removeCigarettes(cost);
  state.meleeWeapon.currentDurability = state.meleeWeapon.durability;
  setStory(`${state.meleeWeapon.name}修复完毕，耐久已回满。`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    handleNpcAction("chat");
  }
}

export function handleNpcRepairBow() {
  const state = getState();
  const npcId = state._currentNpc;
  if (!state.rangedWeapon) {
    setStory("你目前没有装备远程武器。");
    handleNpcAction("chat");
    return;
  }
  const rawCost = Math.max(1, Math.floor((100 - state.rangedWeapon.integrity) / GAME_CONSTANTS.NPC.REPAIR_RANGED_DIVISOR) + 1);
  const cost = getCaptainDiscountCost(state, npcId, rawCost);
  const cigCount = state.cigarettes;
  setPhase("npc_repair_bow");
  setStory(`修理${state.rangedWeapon.name}需要${cost}根香烟${npcId === "lili" && hasDawnCaptainBadge(state) ? "（曙光队长折扣50%）" : ""}（完整度回复至100%）。\n你有${cigCount}根香烟。`);
  setOptions([
    { text: cigCount >= cost ? "🔧 确认修理" : "🔧 确认修理（香烟不足）", action: "repair_bow_confirm", disabled: cigCount < cost },
    { text: "返回", action: "repair_bow_back" },
  ]);
}

export function handleRepairBowConfirm() {
  const state = getState();
  const npcId = state._currentNpc;
  const rawCost = Math.max(1, Math.floor((100 - state.rangedWeapon.integrity) / GAME_CONSTANTS.NPC.REPAIR_RANGED_DIVISOR) + 1);
  const cost = getCaptainDiscountCost(state, npcId, rawCost);
  if (state.cigarettes < cost) {
    setStory("你没有足够的香烟来支付修理费用。");
    handleNpcAction("chat");
    return;
  }
  removeCigarettes(cost);
  state.rangedWeapon.integrity = 100;
  setStory(`${state.rangedWeapon.name}修复完毕，完整度已回满。`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    handleNpcAction("chat");
  }
}

// ---------- 莉莉丝维修枪支 ----------

function handleLiliRepairGun() {
  const state = getState();
  const config = getNpcConfig();
  if (!config?.repairQuest) { handleNpcAction("chat"); return; }

  if (!state.rangedWeapon) {
    setStory("莉莉丝看了看你的装备：\"你还没装备远程武器呢，怎么修？\"");
    handleNpcAction("chat");
    return;
  }
  if (state.rangedWeapon.ammoType === "箭矢") {
    setStory("莉莉丝摆了摆手：\"这是弓弩，不是枪！修弓弩选另一个选项啦~\"");
    handleNpcAction("chat");
    return;
  }

  const questCfg = config.repairQuest;
  const rawCost = questCfg.cost;
  const cost = getCaptainDiscountCost(state, "lili", rawCost);
  const repairAmount = questCfg.repair;
  const cigCount = state.cigarettes;
  setPhase("lili_repair_gun");
  setStory(`莉莉丝接过你的${state.rangedWeapon.name}仔细检查：\"嗯……完整度还剩${state.rangedWeapon.integrity}%。交给我吧！\"\n\n${questCfg.desc.replace(`消耗${rawCost}根香烟`, `消耗${cost}根香烟`)}${hasDawnCaptainBadge(state) ? "\n\n💡 曙光队长折扣：价格减半！" : ""}\n你有${cigCount}根香烟。`);
  setOptions([
    { text: cigCount >= cost ? "🔧 确认维修" : "🔧 确认维修（香烟不足）", action: "lili_repair_gun_confirm", disabled: cigCount < cost },
    { text: "返回", action: "lili_repair_gun_back" },
  ]);
}

export function handleLiliRepairGunConfirm(input) {
  const state = getState();
  const config = getNpcConfig();
  if (!config?.repairQuest) { handleNpcAction("chat"); return; }

  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) { handleNpcAction("chat"); return; }
  const opt = state.options[optIdx];
  if (opt.action === "lili_repair_gun_back") { handleNpcAction("chat"); return; }

  const questCfg = config.repairQuest;
  const rawCost = questCfg.cost;
  const cost = getCaptainDiscountCost(state, "lili", rawCost);
  const repairAmount = questCfg.repair;

  if (state.cigarettes < cost) {
    setStory("莉莉丝摊了摊手：\"香烟不够呀……去回收点武器换烟吧！\"");
    handleNpcAction("chat");
    return;
  }
  removeCigarettes(cost);
  state.rangedWeapon.integrity = Math.min(100, state.rangedWeapon.integrity + repairAmount);

  const storyText = (questCfg.story || "莉莉丝修好了你的武器。").replace("{weapon}", state.rangedWeapon.name);
  setStory(`${storyText}\n\n${state.rangedWeapon.name}完整度恢复至${state.rangedWeapon.integrity}%。`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    handleNpcAction("chat");
  }
}

// ---------- 莉莉丝修复弓弩 ----------

function handleLiliRepairBow() {
  const state = getState();
  const config = getNpcConfig();
  if (!config?.repairBowQuest) { handleNpcAction("chat"); return; }

  if (!state.rangedWeapon) {
    setStory("莉莉丝看了看你的装备：\"你还没装备远程武器呢，怎么修？\"");
    handleNpcAction("chat");
    return;
  }
  if (state.rangedWeapon.ammoType !== "箭矢") {
    setStory("莉莉丝歪着头：\"这是枪，不是弓弩！修枪选另一个选项啦~\"");
    handleNpcAction("chat");
    return;
  }

  const questCfg = config.repairBowQuest;
  const rawCost = questCfg.cost;
  const cost = getCaptainDiscountCost(state, "lili", rawCost);
  const repairAmount = questCfg.repair;
  const cigCount = state.cigarettes;
  setPhase("lili_repair_bow");
  setStory(`莉莉丝接过你的${state.rangedWeapon.name}仔细检查：\"弓弩我最拿手了！\"\n\n${questCfg.desc.replace(`消耗${rawCost}根香烟`, `消耗${cost}根香烟`)}${hasDawnCaptainBadge(state) ? "\n\n💡 曙光队长折扣：价格减半！" : ""}\n你有${cigCount}根香烟。`);
  setOptions([
    { text: cigCount >= cost ? "🔧 确认修复" : "🔧 确认修复（香烟不足）", action: "lili_repair_bow_confirm", disabled: cigCount < cost },
    { text: "返回", action: "lili_repair_bow_back" },
  ]);
}

export function handleLiliRepairBowConfirm(input) {
  const state = getState();
  const config = getNpcConfig();
  if (!config?.repairBowQuest) { handleNpcAction("chat"); return; }

  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) { handleNpcAction("chat"); return; }
  const opt = state.options[optIdx];
  if (opt.action === "lili_repair_bow_back") { handleNpcAction("chat"); return; }

  const questCfg = config.repairBowQuest;
  const rawCost = questCfg.cost;
  const cost = getCaptainDiscountCost(state, "lili", rawCost);
  const repairAmount = questCfg.repair;

  if (state.cigarettes < cost) {
    setStory("莉莉丝摊了摊手：\"香烟不够呀……去回收点武器换烟吧！\"");
    handleNpcAction("chat");
    return;
  }
  removeCigarettes(cost);
  state.rangedWeapon.integrity = Math.min(100, state.rangedWeapon.integrity + repairAmount);

  const storyText = (questCfg.story || "莉莉丝修好了你的弓弩。").replace("{weapon}", state.rangedWeapon.name);
  setStory(`${storyText}\n\n${state.rangedWeapon.name}完整度恢复至${state.rangedWeapon.integrity}%。`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    handleNpcAction("chat");
  }
}

// ---------- 治疗感染 ----------

export function handleNpcCureInfection() {
  const state = getState();
  const npcId = state._currentNpc;
  const config = SURVIVOR_NPC.find(n => n.id === npcId);
  const questCfg = config?.cureInfectionQuest;

  if (state.infection <= 0) {
    if (npcId === "lili") {
      setStory("莉莉丝看了看你的手臂：\"你没有感染呀，别吓自己啦~\"");
    } else {
      setStory("你没有感染，不需要治疗。");
    }
    handleNpcAction("chat");
    return;
  }

  let rawCost, cureAmount;
  if (questCfg) {
    rawCost = questCfg.cost;
    cureAmount = questCfg.cureAmount;
  } else {
    rawCost = Math.max(1, Math.floor(state.infection / GAME_CONSTANTS.NPC.DEFAULT_CURE_DIVISOR) + 1);
    cureAmount = GAME_CONSTANTS.NPC.DEFAULT_CURE_AMOUNT;
  }
  const cost = getCaptainDiscountCost(state, npcId, rawCost);
  const cigCount = state.cigarettes;
  setPhase("npc_cure");
  if (npcId === "lili" && questCfg) {
    setStory(`莉莉丝皱起眉头打量着你：\"感染可不是闹着玩的！\" 她从药箱里取出一支淡黄色的药剂。\n\n${questCfg.desc}${hasDawnCaptainBadge(state) ? "\n\n💡 曙光队长折扣：治疗价格减半！" : ""}\n你有${cigCount}根香烟。`);
  } else {
    setStory(`治疗感染需要${cost}根香烟${npcId === "lili" && hasDawnCaptainBadge(state) ? "（曙光队长折扣50%）" : ""}（当前感染值：${state.infection}%）。\n你有${cigCount}根香烟。`);
  }
  setOptions([
    { text: cigCount >= cost ? "💊 确认治疗" : "💊 确认治疗（香烟不足）", action: "cure_confirm", disabled: cigCount < cost },
    { text: "返回", action: "cure_back" },
  ]);
}

export function handleCureConfirm() {
  const state = getState();
  const npcId = state._currentNpc;
  const config = SURVIVOR_NPC.find(n => n.id === npcId);
  const questCfg = config?.cureInfectionQuest;

  let rawCost, cureAmount;
  if (questCfg) {
    rawCost = questCfg.cost;
    cureAmount = questCfg.cureAmount;
  } else {
    rawCost = Math.max(1, Math.floor(state.infection / GAME_CONSTANTS.NPC.DEFAULT_CURE_DIVISOR) + 1);
    cureAmount = GAME_CONSTANTS.NPC.DEFAULT_CURE_AMOUNT;
  }
  const cost = getCaptainDiscountCost(state, npcId, rawCost);

  if (state.cigarettes < cost) {
    if (npcId === "lili") {
      setStory("莉莉丝叹了口气：\"香烟不够……我需要的药材也得用烟去换呢。\"");
    } else {
      setStory("你没有足够的香烟来支付治疗费用。");
    }
    handleNpcAction("chat");
    return;
  }
  removeCigarettes(cost);
  state.infection = Math.max(0, state.infection - cureAmount);
  if (npcId === "lili" && questCfg) {
    setStory(`${questCfg.story}\n\n感染值降低了${cureAmount}%（当前感染值：${state.infection}%）。莉莉丝松了口气：\"吓死我了，以后小心点！\"`);
  } else {
    setStory(`治疗完成！感染值降低了${cureAmount}%（当前感染值：${state.infection}%）。`);
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    handleNpcAction("chat");
  }
}

// ---------- 莉莉丝神秘礼物 ----------

function handleLiliGiftClaim() {
  const state = getState();
  const npcId = "lili";
  const config = SURVIVOR_NPC.find(n => n.id === npcId);
  if (!config || !config.giftQuest) { handleNpcAction("chat"); return; }

  if (isQuestDone("llGift")) {
    setStory("莉莉丝摇了摇头：\"礼物你已经领过了，别贪心哦~\"");
    handleNpcAction("chat");
    return;
  }

  const affinity = getNpcAffinity(npcId);
  if (affinity < config.giftQuest.reqAffection) {
    setStory(`莉莉丝歪着头看你：\"嗯……我们的关系还不够好呢（好感度${affinity}/${config.giftQuest.reqAffection}），再陪我聊聊天吧~\"`);
    handleNpcAction("chat");
    return;
  }

  markQuestDone("llGift");

  const reward = config.giftQuest.reward;
  const rewardNames = [];

  if (reward.cigarettes) {
    addCigarettes(reward.cigarettes);
    rewardNames.push(`香烟×${reward.cigarettes}`);
  }

  if (reward.ammo) {
    const ammoDef = AMMO.find(a => a.id === reward.ammo.type);
    if (ammoDef) {
      addItem({ id: ammoDef.id, name: ammoDef.name, type: "ammo", count: reward.ammo.count });
      rewardNames.push(`${ammoDef.name}×${reward.ammo.count}`);
    }
  }

  const storyText = config.giftQuest.story || "莉莉丝递给你一份礼物。";
  setStory(`${storyText}\n\n🎁 获得奖励：${rewardNames.join("、")}`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    handleNpcAction("chat");
  }
}

export {
  getNpcConfig,
  npcHeader,
  handleLiliGiftClaim,
};
