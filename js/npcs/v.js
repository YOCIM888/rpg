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

import { getRandomTrade, BACKPACK_TYPES, LOOT_BACKPACKS, V_TRADE_AMMO_TYPES, GAME_CONSTANTS } from '../config.js';

export function handleVTrade(input) {
  const state = getState();
  if (state.lastVTradeDay >= state.day) {
    setStory("V小姐吐了口烟圈：\"今天已经交易过了，明天再来吧。\"");
    handleNpcAction("chat");
    return;
  }
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;
  const option = state.options[optionIndex];
  if (option.action === "v_back") { showExploreOptionsState(); return; }

  const offerItem = option.vItem;
  if (!offerItem) { showExploreOptionsState(); return; }

  setPhase("v_trade_result");

  const trade = getRandomTrade();
  const added = addItem({ id: trade.ammoType, name: trade.ammoType, type: "ammo", count: trade.ammoPerItem });
  if (!added) {
    setStory(`背包已满！V小姐皱了皱眉："下次带够空间再来吧。"`);
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    if (!state.gameOver) showExploreOptionsState();
    return;
  }

  if (offerItem.cat === "cigarettes") {
    removeCigarettes(1);
  } else if (offerItem.cat === "gasoline") {
    removeGasoline(1);
  } else {
    const catMap = { food: state.food, drinks: state.drinks };
    const targetItem = catMap[offerItem.cat][offerItem.idx];
    if (targetItem && (targetItem.count || 1) > 1) {
      targetItem.count = (targetItem.count || 1) - 1;
    } else {
      catMap[offerItem.cat].splice(offerItem.idx, 1);
    }
  }

  setStory(`V小姐收下了你的${getItemDisplayName(offerItem)}，丢给你${trade.ammoPerItem}发${trade.ammoType}。"公平交易。"`);
  state.lastVTradeDay = state.day;
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    handleNpcAction("chat");
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

  const ammoTypes = V_TRADE_AMMO_TYPES;
  const randomAmmo = ammoTypes[Math.floor(Math.random() * ammoTypes.length)];
  const ammoCount = Math.floor(Math.random() * (GAME_CONSTANTS.NPC.V_TRADE_AMMO_MAX - GAME_CONSTANTS.NPC.V_TRADE_AMMO_MIN + 1)) + GAME_CONSTANTS.NPC.V_TRADE_AMMO_MIN;
  const addedAmmo = addItem({ id: randomAmmo, name: randomAmmo, type: "ammo", count: ammoCount });

  const bpNames = LOOT_BACKPACKS.map(b => b.id);
  const randomBp = bpNames[Math.floor(Math.random() * bpNames.length)];
  const bpConfig = LOOT_BACKPACKS.find(b => b.id === randomBp);
  const cap = bpConfig.capacity;
  const addedBp = addItem({ id: bpConfig.id, name: bpConfig.name, type: "backpack", capacity: cap, rarity: bpConfig.rarity });

  if (!addedAmmo || !addedBp) {
    setStory(`背包已满！V小姐看了看你的背包，摇了摇头："先把你的东西清理一下吧。"`);
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    if (!state.gameOver) showExploreOptionsState();
    return;
  }

  if (item.cat === "cigarettes") {
    removeCigarettes(1);
  } else if (item.cat === "gasoline") {
    removeGasoline(1);
  } else {
    const catMap = { food: state.food, drinks: state.drinks };
    const targetItem = catMap[item.cat][item.idx];
    if (targetItem && (targetItem.count || 1) > 1) {
      targetItem.count = (targetItem.count || 1) - 1;
    } else {
      catMap[item.cat].splice(item.idx, 1);
    }
  }

  setStory(`V小姐收下了你的${getItemDisplayName(item)}，十分满意。她给了你${ammoCount}发${randomAmmo}和一个${randomBp}（容量${cap}）。`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    showExploreOptionsState();
  }
}
