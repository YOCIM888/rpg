import {
  getState, setPhase, setStory, setOptions,
  addItem, addRoyalCoins, advanceTime, updateStatusEffects, checkDeath,
  addNpcAffinity, getNpcAffinity, getAffinityLabel, getAffinityStage,
  canChatToday, incrementChatCount, isQuestDone, markQuestDone,
  removeItemById,
} from '../state.js';

import { GAME_CONSTANTS, AFFINITY_MAX } from '../config.js';

import { YUMO_DIALOGUES } from '../data/dialogues/map-dialogues.js';
import { YUMO_QUEST_STORIES } from '../data/dialogues/yumo-dialogues.js';

import { refreshIslandMenu } from './index.js';

function randomDialogue(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

export function handleNpcYumo() {
  const state = getState();
  const affinity = getNpcAffinity("yumo");
  const friendshipLabel = getAffinityLabel(affinity);
  const stage = getAffinityStage(affinity);
  const pool = YUMO_DIALOGUES[stage] || YUMO_DIALOGUES.stranger;
  const dialogue = randomDialogue(pool);

  let desc = `【余墨公爵】\n一位身着华服的贵族，举手投足间透着与生俱来的威仪。他的目光中既有上位者的从容，也藏着一丝不易察觉的忧虑。`;
  desc += `\n\n当前好感：${affinity}/${AFFINITY_MAX.yumo}（${friendshipLabel}）`;
  desc += `\n\n${dialogue}`;

  setPhase("island_yumo");
  setStory(desc);

  const opts = [
    { text: "对话", action: "yumo_chat" },
    { text: "送礼", action: "yumo_gift" },
  ];

  if (!isQuestDone("yumoQuest1")) {
    opts.push({ text: "公爵的烦恼", action: "yumo_quest1" });
  } else if (!isQuestDone("yumoQuest2")) {
    opts.push({ text: "公爵的烦恼（已完成）", action: "yumo_quest_done", disabled: true });
    opts.push({ text: "王国实验", action: "yumo_quest2" });
  } else if (!isQuestDone("yumoQuest3")) {
    opts.push({ text: "公爵的烦恼（已完成）", action: "yumo_quest_done", disabled: true });
    opts.push({ text: "王国实验（已完成）", action: "yumo_quest_done", disabled: true });
    opts.push({ text: "海怪登陆", action: "yumo_quest3" });
  } else if (!isQuestDone("yumoQuest4")) {
    opts.push({ text: "公爵的烦恼（已完成）", action: "yumo_quest_done", disabled: true });
    opts.push({ text: "王国实验（已完成）", action: "yumo_quest_done", disabled: true });
    opts.push({ text: "海怪登陆（已完成）", action: "yumo_quest_done", disabled: true });
    opts.push({ text: "海岛建设", action: "yumo_quest4" });
  } else if (!isQuestDone("yumoQuest5")) {
    opts.push({ text: "公爵的烦恼（已完成）", action: "yumo_quest_done", disabled: true });
    opts.push({ text: "王国实验（已完成）", action: "yumo_quest_done", disabled: true });
    opts.push({ text: "海怪登陆（已完成）", action: "yumo_quest_done", disabled: true });
    opts.push({ text: "海岛建设（已完成）", action: "yumo_quest_done", disabled: true });
    opts.push({ text: "庆功宴", action: "yumo_quest5" });
  } else {
    opts.push({ text: "庆功宴（已完成）", action: "yumo_quest5_done", disabled: true });
  }

  opts.push({ text: "离开", action: "yumo_leave" });

  setOptions(opts);
}

export function handleYumoAction(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;
  const action = state.options[optIdx].action;

  switch (action) {
    case "yumo_chat":
      handleYumoChat();
      break;
    case "yumo_gift":
      handleYumoGift();
      break;
    case "yumo_quest1":
      handleYumoQuest1();
      break;
    case "yumo_quest2":
      handleYumoQuest2();
      break;
    case "yumo_quest3":
      handleYumoQuest3();
      break;
    case "yumo_quest4":
      handleYumoQuest4();
      break;
    case "yumo_quest5":
      handleYumoQuest5();
      break;
    case "yumo_quest5_done":
      setStory("余墨公爵微笑着举起酒杯：'那天的庆功宴真是令人难忘……谢谢你，我的朋友。'");
      handleNpcYumo();
      break;
    case "yumo_gift_food":
      handleYumoGiftConfirm("food", 3);
      break;
    case "yumo_gift_drinks":
      handleYumoGiftConfirm("drinks", 3);
      break;
    case "yumo_gift_medicine":
      handleYumoGiftConfirm("medicine", 5);
      break;
    case "yumo_gift_cigs":
      handleYumoGiftCigs();
      break;
    case "yumo_gift_back":
      handleNpcYumo();
      break;
    case "yumo_leave":
      refreshIslandMenu();
      break;
    default:
      handleNpcYumo();
      break;
  }
}

export function handleYumoChat() {
  const state = getState();
  if (!canChatToday("yumo")) {
    setStory("余墨公爵摆了摆手：'今天已经聊了很多了，改日再叙吧。'");
    handleNpcYumo();
    return;
  }
  incrementChatCount("yumo");
  addNpcAffinity("yumo", 1);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) handleNpcYumo();
}

export function handleYumoGift() {
  const state = getState();
  const opts = [];
  const hasFood = state.food && state.food.length > 0;
  const hasDrinks = state.drinks && state.drinks.length > 0;
  const hasMedicine = state.medicine && state.medicine.length > 0;
  const hasCigs = state.cigarettes > 0;

  if (hasFood) opts.push({ text: "赠送食物（+3好感）", action: "yumo_gift_food" });
  if (hasDrinks) opts.push({ text: "赠送饮品（+3好感）", action: "yumo_gift_drinks" });
  if (hasMedicine) opts.push({ text: "赠送医疗品（+5好感）", action: "yumo_gift_medicine" });
  if (hasCigs) opts.push({ text: "赠送香烟（+2好感）", action: "yumo_gift_cigs" });
  opts.push({ text: "返回", action: "yumo_gift_back" });

  if (opts.length === 1) {
    setStory("你翻遍了背包，发现没什么能送人的东西……");
    handleNpcYumo();
    return;
  }

  setPhase("island_yumo");
  setStory("你想送余墨公爵什么？");
  setOptions(opts);
}

function handleYumoGiftConfirm(type, affinityGain) {
  const state = getState();
  const arr = type === "food" ? state.food : type === "drinks" ? state.drinks : state.medicine;
  if (!arr || arr.length === 0) {
    setStory("你没有可以赠送的物品。");
    handleNpcYumo();
    return;
  }
  const item = arr[arr.length - 1];
  const itemName = item.name;
  if (item.count && item.count > 1) {
    item.count--;
  } else {
    arr.pop();
  }
  addNpcAffinity("yumo", affinityGain);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  setStory(`你把${itemName}送给了余墨公爵。他微微点头：'多谢你的心意。'\n\n余墨公爵好感度 +${affinityGain}（当前 ${getNpcAffinity("yumo")}/${AFFINITY_MAX.yumo}）`);
  if (!state.gameOver) handleNpcYumo();
}

function handleYumoGiftCigs() {
  const state = getState();
  if (state.cigarettes <= 0) {
    setStory("你没有香烟可以赠送。");
    handleNpcYumo();
    return;
  }
  state.cigarettes--;
  addNpcAffinity("yumo", 2);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  setStory(`你递给余墨公爵一根香烟。他接过，轻轻嗅了嗅：'不错的品质。'\n\n余墨公爵好感度 +2（当前 ${getNpcAffinity("yumo")}/${AFFINITY_MAX.yumo}）`);
  if (!state.gameOver) handleNpcYumo();
}

export function handleYumoQuest1() {
  const state = getState();
  const gelCount = state.medicine.filter(i => i.id === "zombie_gel").reduce((sum, i) => sum + (i.count || 1), 0);
  const need = GAME_CONSTANTS.YUMO.QUEST1_GEL_COST;

  if (gelCount < need) {
    setStory(YUMO_QUEST_STORIES.quest1_intro + `\n\n所需物品：丧尸凝胶 ${gelCount}/${need}`);
    setPhase("island_yumo");
    setOptions([
      { text: "去收集凝胶", action: "yumo_leave" },
    ]);
    return;
  }

  removeItemById("medicine", "zombie_gel", need);
  markQuestDone("yumoQuest1");
  addRoyalCoins(GAME_CONSTANTS.YUMO.QUEST1_REWARD);
  setStory(YUMO_QUEST_STORIES.quest1_accept + `\n\n获得 ${GAME_CONSTANTS.YUMO.QUEST1_REWARD} 皇家币`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) handleNpcYumo();
}

export function handleYumoQuest2() {
  const state = getState();
  const gelCount = state.medicine.filter(i => i.id === "zombie_gel").reduce((sum, i) => sum + (i.count || 1), 0);
  const need = GAME_CONSTANTS.YUMO.QUEST2_GEL_COST;

  if (gelCount < need) {
    setStory(YUMO_QUEST_STORIES.quest2_intro + `\n\n所需物品：丧尸凝胶 ${gelCount}/${need}`);
    setPhase("island_yumo");
    setOptions([
      { text: "去收集凝胶", action: "yumo_leave" },
    ]);
    return;
  }

  removeItemById("medicine", "zombie_gel", need);
  markQuestDone("yumoQuest2");
  addRoyalCoins(GAME_CONSTANTS.YUMO.QUEST2_REWARD);
  setStory(YUMO_QUEST_STORIES.quest2_accept + `\n\n获得 ${GAME_CONSTANTS.YUMO.QUEST2_REWARD} 皇家币`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) handleNpcYumo();
}

export function handleYumoQuest3() {
  const state = getState();
  const kills = state.yumoDivingKills || 0;
  const need = GAME_CONSTANTS.YUMO.QUEST3_DIVING_KILLS;

  if (kills < need) {
    setStory(YUMO_QUEST_STORIES.quest3_intro + `\n\n当前进度：已击杀 ${kills}/${need} 只潜水丧尸`);
    setPhase("island_yumo");
    setOptions([
      { text: "去清理丧尸", action: "yumo_leave" },
    ]);
    return;
  }

  markQuestDone("yumoQuest3");
  addRoyalCoins(GAME_CONSTANTS.YUMO.QUEST3_REWARD);
  setStory(YUMO_QUEST_STORIES.quest3_complete + `\n\n获得 ${GAME_CONSTANTS.YUMO.QUEST3_REWARD} 皇家币`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) handleNpcYumo();
}

export function handleYumoQuest4() {
  const state = getState();
  const matCount = state.other.filter(i => i.id === "building_mat").reduce((sum, i) => sum + (i.count || 1), 0);
  const woodCount = state.other.filter(i => i.id === "wood").reduce((sum, i) => sum + (i.count || 1), 0);
  const stoneCount = state.other.filter(i => i.id === "stone").reduce((sum, i) => sum + (i.count || 1), 0);
  const need = GAME_CONSTANTS.YUMO.QUEST4_MATERIAL_COST;

  if (matCount < need || woodCount < need || stoneCount < need) {
    let msg = YUMO_QUEST_STORIES.quest4_intro + "\n\n所需物品：";
    if (matCount < need) msg += `\n  建筑材料 ${matCount}/${need}`;
    else msg += `\n  建筑材料 ${matCount}/${need} ✓`;
    if (woodCount < need) msg += `\n  木材 ${woodCount}/${need}`;
    else msg += `\n  木材 ${woodCount}/${need} ✓`;
    if (stoneCount < need) msg += `\n  石头 ${stoneCount}/${need}`;
    else msg += `\n  石头 ${stoneCount}/${need} ✓`;
    setStory(msg);
    setPhase("island_yumo");
    setOptions([
      { text: "去收集建材", action: "yumo_leave" },
    ]);
    return;
  }

  removeItemById("other", "building_mat", need);
  removeItemById("other", "wood", need);
  removeItemById("other", "stone", need);
  markQuestDone("yumoQuest4");
  addRoyalCoins(GAME_CONSTANTS.YUMO.QUEST4_REWARD);
  setStory(YUMO_QUEST_STORIES.quest4_accept + `\n\n获得 ${GAME_CONSTANTS.YUMO.QUEST4_REWARD} 皇家币`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) handleNpcYumo();
}

export function handleYumoQuest5() {
  const state = getState();
  const baijiuCount = state.drinks.filter(i => i.id === "高度白酒").reduce((sum, i) => sum + (i.count || 1), 0);

  if (baijiuCount < 1) {
    setStory(YUMO_QUEST_STORIES.quest5_intro + "\n\n所需物品：高度白酒 0/1");
    setPhase("island_yumo");
    setOptions([
      { text: "去找酒", action: "yumo_leave" },
    ]);
    return;
  }

  removeItemById("drinks", "高度白酒", 1);
  markQuestDone("yumoQuest5");
  setStory(YUMO_QUEST_STORIES.quest5_accept);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) handleNpcYumo();
}
