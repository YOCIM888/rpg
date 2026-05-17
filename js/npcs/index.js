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
} from '../state.js';

import {
  SURVIVOR_NPC,
  MELEE_WEAPONS,
  RANGED_WEAPONS,
  AMMO,
  CIGARETTES,
  CROPS,
  BUILDING_MATERIALS,
  CANNED_FOOD_IDS,
  FRUITS,
  DRINKS,
  FOODS,
  MEDICINES,
  DEFAULT_ITEM_IDS,
} from '../config.js';

import {
  showExploreOptionsState,
  returnToMenu,
} from '../routing.js';

import {
  handleEquipSelect,
  handleDiscardSelect,
} from '../equipment.js';

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
  if (npcId === "lili") {
    description += `\n\n当前好感：${affinity}/150（${friendshipLabel}）`;
  } else {
    description += `\n\n当前好感：${affinity}/150（${friendshipLabel}）`;
  }
  if (npcId !== "v") {
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
    if (action === "trade") {
      const npcId = state._currentNpc;
      if (npcId === "v") {
        const offerings = [];
        state.food.forEach((item, i) => offerings.push({ cat: "food", idx: i, name: item.name, label: `[食物] ${item.name}` }));
        state.drinks.forEach((item, i) => offerings.push({ cat: "drinks", idx: i, name: item.name, label: `[饮品] ${item.name}` }));
        state.cargo.forEach((item, i) => offerings.push({ cat: "cargo", idx: i, name: item.name, label: `[货物] ${item.name}` }));
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
        state.food.forEach((item, i) => offerings.push({ cat: "food", idx: i, name: item.name }));
        state.drinks.forEach((item, i) => offerings.push({ cat: "drinks", idx: i, name: item.name }));
        state.medicine.forEach((item, i) => offerings.push({ cat: "medicine", idx: i, name: item.name }));
        state.other.forEach((item, i) => offerings.push({ cat: "other", idx: i, name: item.name }));
        state.cargo.forEach((item, i) => offerings.push({ cat: "cargo", idx: i, name: item.name }));
        if (offerings.length === 0) {
          setStory("苏小涵歪着头看了看你：\"你没有东西可以给我呢……\"");
          handleNpcAction("chat");
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
      } else if (npcId === "lili") {
        const offerings = [];
        state.medicine.forEach((item, i) => offerings.push({ cat: "medicine", idx: i, name: item.name, label: `[医疗] ${item.name}` }));
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

  const npcId = state._currentNpc;
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
    actions.push({ text: "回收武器", action: "recycle" });
    actions.push({ text: "回收远程武器", action: "recycle_ranged" });
  }

  if (config.canRepair) {
    actions.push({ text: "修理近战武器", action: "repair" });
    if (config.canRepairBow) {
      actions.push({ text: "修理远程武器", action: "repair_bow" });
    }
  }

  if (config.canCureInfection) {
    actions.push({ text: "治疗感染", action: "cure_infection" });
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

  if (npcId === "v") {
    const affinity = getNpcAffinity(npcId);
    const stage = getAffinityStage(affinity);
    const lines = config.dialogues[stage] || config.dialogues[0];
    const line = lines[Math.floor(Math.random() * lines.length)];
    setStory(line + `\n\n（好感度：${affinity}/150）`);
    handleNpcAction("chat");
    return;
  }

  if (!canChatToday(npcId)) {
    setStory("今天已经聊得够多了，明天再来吧。");
    handleNpcAction("chat");
    return;
  }

  const affinity = getNpcAffinity(npcId);
  const stage = getAffinityStage(affinity);
  const lines = config.dialogues[stage] || config.dialogues[0];
  const line = lines[Math.floor(Math.random() * lines.length)];
  incrementChatCount(npcId);
  addNpcAffinity(npcId, 1);
  setStory(line + `\n\n好感度 +1（当前 ${affinity + 1}/150）`);
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
  state.food.forEach((item, i) => items.push({ ...item, cat: "food", idx: i, label: `[食物] ${item.name}` }));
  state.drinks.forEach((item, i) => items.push({ ...item, cat: "drinks", idx: i, label: `[饮品] ${item.name}` }));
  state.medicine.forEach((item, i) => items.push({ ...item, cat: "medicine", idx: i, label: `[医疗] ${item.name}` }));
  state.other.forEach((item, i) => items.push({ ...item, cat: "other", idx: i, label: `[其他] ${item.name}` }));
  state.cargo.forEach((item, i) => items.push({ ...item, cat: "cargo", idx: i, label: `[货物] ${item.name}` }));
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
    cargo: state.cargo
  };
  catMap[item.cat].splice(item.idx, 1);

  let affinityGain = 1;
  if (item.cat === "food") affinityGain = 3;
  else if (item.cat === "drinks") affinityGain = 3;
  else if (item.cat === "medicine") affinityGain = 5;
  else if (item.cat === "cargo") affinityGain = 2;

  if (npcId === "lili") {
    if (item.cat === "food" || item.cat === "drinks") {
      affinityGain = 6;
    } else if (item.cat === "medicine") {
      affinityGain = 10;
    }
  }

  addNpcAffinity(npcId, affinityGain);
  let affinity = getNpcAffinity(npcId);
  if (npcId === "lili") {
    setStory(`你送出了${item.name}。${item.name}受到了莉莉丝的喜欢。好感度 +${affinityGain}（当前 ${affinity}/150）`);
  } else {
    setStory(`你送出了${item.name}。好感度 +${affinityGain}（当前 ${affinity}/150）`);
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
  if (req.food) {
    const have = state.food.length;
    return { met: have >= req.food, current: have, target: req.food };
  }
  if (req.drinks) {
    if (req.drinkId) {
      const have = state.drinks.filter(d => d.id === req.drinkId).length;
      return { met: have >= req.drinks, current: have, target: req.drinks };
    }
    const have = state.drinks.length;
    return { met: have >= req.drinks, current: have, target: req.drinks };
  }
  if (req.medicine) {
    if (req.medicineId) {
      const have = state.medicine.filter(m => m.id === req.medicineId).length;
      return { met: have >= req.medicine, current: have, target: req.medicine };
    }
    const have = state.medicine.length;
    return { met: have >= req.medicine, current: have, target: req.medicine };
  }
  if (req.items) {
    let allMet = true;
    let totalCurrent = 0;
    let totalTarget = 0;
    for (const itemReq of req.items) {
      const have = state[itemReq.type].filter(i => i.id === itemReq.id).length;
      if (have < itemReq.count) allMet = false;
      totalCurrent += Math.min(have, itemReq.count);
      totalTarget += itemReq.count;
    }
    return { met: allMet, current: totalCurrent, target: totalTarget };
  }
  if (req.allCanned) {
    const have = CANNED_FOOD_IDS.filter(id => state.food.some(f => f.id === id)).length;
    return { met: have >= CANNED_FOOD_IDS.length, current: have, target: CANNED_FOOD_IDS.length };
  }
  if (req.allFruits) {
    const fruitIds = FRUITS.map(f => f.id);
    const have = fruitIds.filter(id => state.food.some(f => f.id === id)).length;
    return { met: have >= fruitIds.length, current: have, target: fruitIds.length };
  }
  if (req.allDrinks) {
    const drinkIds = DRINKS.map(d => d.id);
    const have = drinkIds.filter(id => state.drinks.some(d => d.id === id)).length;
    if (req.allFoods) {
      const foodIds = FOODS.map(f => f.id);
      const foodHave = foodIds.filter(id => state.food.some(f => f.id === id)).length;
      return { met: have >= drinkIds.length && foodHave >= foodIds.length, current: have + foodHave, target: drinkIds.length + foodIds.length };
    }
    return { met: have >= drinkIds.length, current: have, target: drinkIds.length };
  }
  if (req.allMedicine) {
    const medIds = MEDICINES.map(m => m.id);
    const have = medIds.filter(id => state.medicine.some(m => m.id === id)).length;
    return { met: have >= medIds.length, current: have, target: medIds.length };
  }
  return { met: true, current: 0, target: 0 };
}

function removeQuestItems(state, quest) {
  const req = quest.require;
  if (!req) return;
  if (req.food) {
    for (let i = 0; i < req.food; i++) state.food.pop();
  }
  if (req.drinks) {
    if (req.drinkId) {
      let removed = 0;
      for (let i = state.drinks.length - 1; i >= 0 && removed < req.drinks; i--) {
        if (state.drinks[i].id === req.drinkId) { state.drinks.splice(i, 1); removed++; }
      }
    } else {
      for (let i = 0; i < req.drinks; i++) state.drinks.pop();
    }
  }
  if (req.medicine) {
    if (req.medicineId) {
      let removed = 0;
      for (let i = state.medicine.length - 1; i >= 0 && removed < req.medicine; i--) {
        if (state.medicine[i].id === req.medicineId) { state.medicine.splice(i, 1); removed++; }
      }
    } else {
      for (let i = 0; i < req.medicine; i++) state.medicine.pop();
    }
  }
  if (req.items) {
    for (const itemReq of req.items) {
      let removed = 0;
      for (let i = state[itemReq.type].length - 1; i >= 0 && removed < itemReq.count; i--) {
        if (state[itemReq.type][i].id === itemReq.id) { state[itemReq.type].splice(i, 1); removed++; }
      }
    }
  }
  if (req.allCanned) {
    for (const id of CANNED_FOOD_IDS) {
      const idx = state.food.findIndex(f => f.id === id);
      if (idx !== -1) state.food.splice(idx, 1);
    }
  }
  if (req.allFruits) {
    const fruitIds = FRUITS.map(f => f.id);
    for (const id of fruitIds) {
      const idx = state.food.findIndex(f => f.id === id);
      if (idx !== -1) state.food.splice(idx, 1);
    }
  }
  if (req.allDrinks) {
    const drinkIds = DRINKS.map(d => d.id);
    for (const id of drinkIds) {
      const idx = state.drinks.findIndex(d => d.id === id);
      if (idx !== -1) state.drinks.splice(idx, 1);
    }
  }
  if (req.allFoods) {
    const foodIds = FOODS.map(f => f.id);
    for (const id of foodIds) {
      const idx = state.food.findIndex(f => f.id === id);
      if (idx !== -1) state.food.splice(idx, 1);
    }
  }
  if (req.allMedicine) {
    const medIds = MEDICINES.map(m => m.id);
    for (const id of medIds) {
      const idx = state.medicine.findIndex(m => m.id === id);
      if (idx !== -1) state.medicine.splice(idx, 1);
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
    for (let i = 0; i < rw.cigarettes; i++) {
      const cig = CIGARETTES[Math.floor(Math.random() * CIGARETTES.length)];
      addItem({ ...cig });
    }
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
  addNpcAffinity(npcId, 5);
  markQuestDone(quest.id);
  const npcName = SURVIVOR_NPC.find(n => n.id === npcId)?.name || "NPC";
  setStory(`🎉 你完成了${npcName}的悬赏【${quest.name}】！\n\n🏆 获得奖励：${quest.reward?.desc || "无"}\n💝 好感度 +5（当前 ${affinity + 5}/150）`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    handleNpcAction("chat");
  }
}

export function handleNpcQuestReward(npcId, quest) {
  handleNpcQuestConfirm();
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
  detailLines.push(`💝 额外好感度：+5`);
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
  const meleeItems = state.other.filter(item => item.type === "melee" && item.id !== DEFAULT_ITEM_IDS.melee);
  if (meleeItems.length === 0) {
    setStory("你没有任何可回收的近战武器。");
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
  setStory(`选择要回收的近战武器（按伤害定价）：\n\n普通武器：${price} 香烟/件`);
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
  const price = Math.max(1, Math.floor(item.damage / 10));
  for (let i = 0; i < price; i++) {
    const cig = CIGARETTES[Math.floor(Math.random() * CIGARETTES.length)];
    addItem({ ...cig });
  }
  removeItem("other", state.other.indexOf(item));
  setStory(`你回收了${item.name}，获得${price}支香烟。`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    handleNpcAction("chat");
  }
}

export function handleNpcRecycleRanged() {
  const state = getState();
  const rangedItems = state.other.filter(item => item.type === "ranged");
  if (rangedItems.length === 0) {
    setStory("你没有任何可回收的远程武器。");
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
  setStory("选择要回收的远程武器：");
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
  const price = Math.max(1, Math.floor(item.damage / 15));
  for (let i = 0; i < price; i++) {
    const cig = CIGARETTES[Math.floor(Math.random() * CIGARETTES.length)];
    addItem({ ...cig });
  }
  removeItem("other", state.other.indexOf(item));
  setStory(`你回收了${item.name}，获得${price}支香烟。`);
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
  if (state.meleeWeapon.id === DEFAULT_ITEM_IDS.melee) {
    setStory("你目前没有可修理的武器。");
    handleNpcAction("chat");
    return;
  }
  const cost = Math.max(1, Math.floor((state.meleeWeapon.durability - state.meleeWeapon.currentDurability) / 20) + 1);
  const cigCount = state.cargo.length;
  setPhase("npc_repair");
  setStory(`修理${state.meleeWeapon.name}需要${cost}支香烟（耐久回复至满）。\n你有${cigCount}支香烟。`);
  setOptions([
    { text: cigCount >= cost ? "🔧 确认修理" : "🔧 确认修理（香烟不足）", action: "repair_confirm", disabled: cigCount < cost },
    { text: "返回", action: "repair_back" },
  ]);
}

export function handleRepairConfirm() {
  const state = getState();
  const cost = Math.max(1, Math.floor((state.meleeWeapon.durability - state.meleeWeapon.currentDurability) / 20) + 1);
  if (state.cargo.length < cost) {
    setStory("你没有足够的香烟来支付修理费用。");
    handleNpcAction("chat");
    return;
  }
  for (let i = 0; i < cost; i++) {
    state.cargo.pop();
  }
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
  if (!state.rangedWeapon) {
    setStory("你目前没有装备远程武器。");
    handleNpcAction("chat");
    return;
  }
  const cost = Math.max(1, Math.floor((100 - state.rangedWeapon.integrity) / 25) + 1);
  const cigCount = state.cargo.length;
  setPhase("npc_repair_bow");
  setStory(`修理${state.rangedWeapon.name}需要${cost}支香烟（完整度回复至100%）。\n你有${cigCount}支香烟。`);
  setOptions([
    { text: cigCount >= cost ? "🔧 确认修理" : "🔧 确认修理（香烟不足）", action: "repair_bow_confirm", disabled: cigCount < cost },
    { text: "返回", action: "repair_bow_back" },
  ]);
}

export function handleRepairBowConfirm() {
  const state = getState();
  const cost = Math.max(1, Math.floor((100 - state.rangedWeapon.integrity) / 25) + 1);
  if (state.cargo.length < cost) {
    setStory("你没有足够的香烟来支付修理费用。");
    handleNpcAction("chat");
    return;
  }
  for (let i = 0; i < cost; i++) {
    state.cargo.pop();
  }
  state.rangedWeapon.integrity = 100;
  setStory(`${state.rangedWeapon.name}修复完毕，完整度已回满。`);
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
  if (state.infection <= 0) {
    setStory("你没有感染，不需要治疗。");
    handleNpcAction("chat");
    return;
  }
  const cost = Math.max(1, Math.floor(state.infection / 20) + 1);
  const cigCount = state.cargo.length;
  setPhase("npc_cure");
  setStory(`治疗感染需要${cost}支香烟（当前感染值：${state.infection}%）。\n你有${cigCount}支香烟。`);
  setOptions([
    { text: cigCount >= cost ? "💊 确认治疗" : "💊 确认治疗（香烟不足）", action: "cure_confirm", disabled: cigCount < cost },
    { text: "返回", action: "cure_back" },
  ]);
}

export function handleCureConfirm() {
  const state = getState();
  const cost = Math.max(1, Math.floor(state.infection / 20) + 1);
  if (state.cargo.length < cost) {
    setStory("你没有足够的香烟来支付治疗费用。");
    handleNpcAction("chat");
    return;
  }
  for (let i = 0; i < cost; i++) {
    state.cargo.pop();
  }
  const cureAmount = 50;
  state.infection = Math.max(0, state.infection - cureAmount);
  setStory(`治疗完成！感染值降低了${cureAmount}%（当前感染值：${state.infection}%）。`);
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
};
