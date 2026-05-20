/* ============================================================
   装备系统模块
   组织顺序：装备选择 → 近战/远程/弹药/背包管理 → 丢弃物品
   ============================================================ */

import {
  getState,
  setPhase,
  setStory,
  setOptions,
  removeItem,
  equipMelee,
  equipRanged,
  getBackpackCount,
  getItemDisplayName,
  isStackableType,
  removeCigarettes,
  removeGasoline,
} from './state.js';

import { returnToMenu } from './routing.js';

import { MELEE_WEAPONS, DEFAULT_ITEM_IDS } from './config.js';

// ---------- 装备选择 ----------

export function handleEquipSelect() {
  const state = getState();
  setPhase("equip_select");
  setStory("装备管理 - 请选择要管理的装备类型：");
  setOptions([
    { text: `近战武器（当前: ${state.meleeWeapon.name}）`, action: "melee" },
    { text: `远程武器（当前: ${state.rangedWeapon ? state.rangedWeapon.name : "无"}）`, action: "ranged" },
    { text: "弹药管理", action: "ammo" },
    { text: `更换背包（当前: ${state.backpack.name} ${getBackpackCount()}/${state.backpack.capacity}）`, action: "backpack" },
    { text: "返回", action: "back" }
  ]);
}

export function handleEquipSubAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const action = state.options[optionIndex].action;

  if (action === "back") {
    returnToMenu();
    return;
  }

  if (action === "melee") {
    const meleeItems = state.other.filter(item => item.type === "melee");
    const options = meleeItems.map((item, i) => ({
      text: `${item.name}（伤害:${item.damage} 耐久:${item.durability}）`,
      action: "equip_melee",
      index: i
    }));
    options.push({ text: `卸下当前武器（切换为${MELEE_WEAPONS.find(w => w.id === DEFAULT_ITEM_IDS.melee).name}）`, action: "equip_fist", index: -1 });
    options.push({ text: "返回", action: "back", index: -2 });
    setPhase("melee_equip");
    setOptions(options);
    return;
  }

  if (action === "ranged") {
    const rangedItems = state.other.filter(item => item.type === "ranged");
    const options = rangedItems.map((item, i) => ({
      text: `${item.name}（伤害:${item.damage} 暴击:${Math.round(item.critRate * 100)}% 弹药:${item.ammoType}）`,
      action: "equip_ranged_item",
      index: i
    }));
    if (state.rangedWeapon) {
      options.push({ text: `卸下${state.rangedWeapon.name}`, action: "unequip_ranged", index: -1 });
    }
    options.push({ text: "返回", action: "back", index: -2 });
    setPhase("ranged_equip");
    setOptions(options);
    return;
  }

  if (action === "ammo") {
    const ammoOptions = state.ammo.map((a, i) => ({
      text: `${a.name}（数量:${a.count}）`,
      action: "load_ammo",
      index: i
    }));
    ammoOptions.push({ text: "返回", action: "back", index: -1 });
    setPhase("ammo_load");
    setOptions(ammoOptions);
    return;
  }

  if (action === "backpack") {
    showBackpackOptions();
    return;
  }
}

// ---------- 背包管理 ----------

function showBackpackOptions() {
  const state = getState();
  const backpacksInOther = state.other
    .map((item, i) => ({ item, originalIndex: i }))
    .filter(({ item }) => item.type === "backpack");

  if (backpacksInOther.length === 0) {
    setStory(`当前背包：${state.backpack.name}（容量 ${state.backpack.capacity}）\n物品数量：${getBackpackCount()}/${state.backpack.capacity}\n\n背包里没有其他可更换的背包。探索时拾取的背包会存放在这里。`);
    setPhase("backpack_equip");
    setOptions([{ text: "返回", action: "back" }]);
    return;
  }

  const currentCount = getBackpackCount();
  const options = backpacksInOther.map(({ item, originalIndex }) => {
    const canSwap = currentCount <= item.capacity;
    const statusTag = canSwap ? "" : " ⚠️物品超出容量";
    return {
      text: `${item.name}（容量 ${item.capacity}）${statusTag}`,
      action: "equip_backpack",
      originalIndex,
      targetCapacity: item.capacity,
      canSwap,
    };
  });
  options.push({ text: "返回", action: "back" });
  setPhase("backpack_equip");
  setStory(`当前背包：${state.backpack.name}（容量 ${state.backpack.capacity}）\n物品数量：${currentCount}/${state.backpack.capacity}\n\n选择要装备的背包：${currentCount > state.backpack.capacity ? "" : ""}`);
  setOptions(options);
}

export function handleBackpackEquipAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const option = state.options[optionIndex];

  if (option.action === "back") {
    handleEquipSelect();
    return;
  }

  if (option.action === "equip_backpack") {
    const currentCount = getBackpackCount();
    const targetCapacity = option.targetCapacity;

    if (currentCount > targetCapacity) {
      setStory(`无法更换！当前携带 ${currentCount} 件物品，超过${state.other[option.originalIndex].name}的容量（${targetCapacity}）。请先丢弃一些物品。`);
      showBackpackOptions();
      return;
    }

    const newBp = state.other[option.originalIndex];
    const oldBp = { id: state.backpack.id || state.backpack.name, name: state.backpack.name, type: "backpack", capacity: state.backpack.capacity };

    state.other.splice(option.originalIndex, 1);
    state.other.push(oldBp);
    state.backpack = { id: newBp.id, name: newBp.name, type: newBp.type, capacity: newBp.capacity };

    setStory(`背包已更换！\n${oldBp.name}（${oldBp.capacity}格）→ ${newBp.name}（${newBp.capacity}格）\n旧背包已放入物品栏。`);
    returnToMenu();
    return;
  }
}

// ---------- 近战装备 ----------

export function handleMeleeEquipAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const option = state.options[optionIndex];

  if (option.action === "back") {
    handleEquipSelect();
    return;
  }

  if (option.action === "equip_fist") {
    if (state.meleeWeapon && state.meleeWeapon.id !== DEFAULT_ITEM_IDS.melee) {
      state.other.push(state.meleeWeapon);
      state.meleeWeapon = { ...MELEE_WEAPONS.find(w => w.id === DEFAULT_ITEM_IDS.melee), currentDurability: MELEE_WEAPONS.find(w => w.id === DEFAULT_ITEM_IDS.melee).durability };
    }
    setStory(`你卸下了近战武器，现在使用${MELEE_WEAPONS.find(w => w.id === DEFAULT_ITEM_IDS.melee).name}作战。`);
    returnToMenu();
    return;
  }

  if (option.action === "equip_melee") {
    const meleeItems = state.other.filter(item => item.type === "melee");
    const item = meleeItems[option.index];
    if (!item) {
      setStory("无法装备该武器。");
      returnToMenu();
      return;
    }
    const result = equipMelee(item.id);
    if (result) {
      setStory(`你装备了${result.name}。`);
    } else {
      setStory("装备失败。");
    }
    returnToMenu();
    return;
  }
}

// ---------- 远程装备 ----------

export function handleRangedEquipAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) {
    return;
  }

  const option = state.options[optionIndex];

  if (option.action === "back") {
    handleEquipSelect();
    return;
  }

  if (option.action === "unequip_ranged") {
    if (state.rangedWeapon) {
      state.other.push(state.rangedWeapon);
      const weaponName = state.rangedWeapon.name;
      state.rangedWeapon = null;
      setStory(`你卸下了${weaponName}。`);
    }
    returnToMenu();
    return;
  }

  if (option.action === "equip_ranged_item") {
    const rangedItems = state.other.filter(item => item.type === "ranged");
    const item = rangedItems[option.index];
    if (!item) {
      setStory("无法装备该武器。");
      returnToMenu();
      return;
    }
    const result = equipRanged(item.id);
    if (result) {
      setStory(`你装备了${result.name}。`);
    } else {
      setStory("装备失败。");
    }
    returnToMenu();
    return;
  }
}

// ---------- 弹药管理 ----------

export function handleAmmoLoadAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) {
    return;
  }

  const option = state.options[optionIndex];

  if (option.action === "back") {
    handleEquipSelect();
    return;
  }

  if (option.action === "load_ammo") {
    const ammo = state.ammo[option.index];
    if (!ammo) return;

    if (!state.rangedWeapon) {
      setStory("你没有装备远程武器，无法装填弹药。");
      returnToMenu();
      return;
    }

    if (state.rangedWeapon.ammoType !== ammo.name) {
      setStory(`${ammo.name}不兼容你的${state.rangedWeapon.name}（需要${state.rangedWeapon.ammoType}）。`);
      returnToMenu();
      return;
    }

    setStory(`${state.rangedWeapon.name}已装填${ammo.name}（库存${ammo.count}发）。`);
    returnToMenu();
    return;
  }
}

// ---------- 丢弃 ----------

export function handleDiscardSelect() {
  const state = getState();
  setPhase("discard_select");
  setStory("请选择要丢弃的物品：");
  const items = [];
  if (state.cigarettes > 0) {
    items.push({ category: "cigarettes", index: 0, label: `[货物] (${state.cigarettes})香烟`, stackable: true, count: state.cigarettes });
  }
  if (state.gasoline > 0) {
    items.push({ category: "gasoline", index: 0, label: `[货物] (${state.gasoline})汽油`, stackable: true, count: state.gasoline });
  }
  state.food.forEach((item, i) => items.push({ category: "food", index: i, label: `[食物] ${getItemDisplayName(item)}`, stackable: isStackableType(item), count: item.count || 1 }));
  state.drinks.forEach((item, i) => items.push({ category: "drinks", index: i, label: `[饮品] ${getItemDisplayName(item)}`, stackable: isStackableType(item), count: item.count || 1 }));
  state.medicine.forEach((item, i) => items.push({ category: "medicine", index: i, label: `[医疗] ${getItemDisplayName(item)}`, stackable: isStackableType(item), count: item.count || 1 }));
  state.other.forEach((item, i) => items.push({ category: "other", index: i, label: `[其他] ${getItemDisplayName(item)}`, stackable: isStackableType(item), count: item.count || 1 }));
  if (state.seeds) state.seeds.forEach((item, i) => items.push({ category: "seed", index: i, label: `[种子] ${getItemDisplayName(item)}`, stackable: isStackableType(item), count: item.count || 1 }));
  items.push({ category: "back", index: -1, label: "返回" });
  const opts = items.map((item, i) => ({ text: item.label, action: "discard", index: i }));
  state._discardItems = items;
  setOptions(opts);
}

export function handleDiscardAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const option = state.options[optionIndex];
  const items = state._discardItems;
  if (!items) { returnToMenu(); return; }

  const item = items[option.index];
  if (!item || item.category === "back") {
    returnToMenu();
    return;
  }

  if (item.stackable && item.count > 1) {
    handleDiscardQuantitySelect(item);
    return;
  }

  executeDiscard(item, 1);
}

function handleDiscardQuantitySelect(discardItem) {
  const state = getState();
  setPhase("discard_quantity");
  const maxCount = discardItem.count;
  let storyText = `请选择要丢弃的${discardItem.category === "cigarettes" ? "香烟" : discardItem.category === "gasoline" ? "汽油" : discardItem.label.split('] ')[1]}数量：\n`;
  storyText += `当前数量：${maxCount}`;
  setStory(storyText);
  const opts = [];
  for (let i = 1; i <= maxCount; i++) {
    opts.push({ text: `丢弃${i}个`, action: "discard_quantity", count: i });
  }
  opts.push({ text: "返回", action: "discard_back" });
  state._pendingDiscardItem = discardItem;
  setOptions(opts);
}

export function handleDiscardQuantityAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const option = state.options[optionIndex];
  if (option.action === "discard_back") {
    handleDiscardSelect();
    return;
  }
  if (option.action === "discard_quantity") {
    const discardItem = state._pendingDiscardItem;
    if (!discardItem) { returnToMenu(); return; }
    executeDiscard(discardItem, option.count);
    return;
  }
}

function executeDiscard(discardItem, count) {
  const state = getState();
  if (discardItem.category === "cigarettes") {
    const actual = Math.min(count, state.cigarettes);
    removeCigarettes(actual);
    setStory(`你丢弃了${actual}根香烟。`);
  } else if (discardItem.category === "gasoline") {
    const actual = Math.min(count, state.gasoline);
    removeGasoline(actual);
    setStory(`你丢弃了${actual}个汽油。`);
  } else {
    const removed = removeItem(discardItem.category, discardItem.index, count);
    if (removed) {
      const displayName = discardItem.category === "cigarettes" ? "香烟" : discardItem.category === "gasoline" ? "汽油" : (typeof removed === 'object' ? (removed.name || discardItem.label.split('] ')[1]) : discardItem.label.split('] ')[1]);
      setStory(`你丢弃了${count > 1 ? count : ''}${displayName}。`);
    } else {
      setStory("无法丢弃该物品。");
    }
  }
  returnToMenu();
}
