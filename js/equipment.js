/* ============================================================
   装备系统模块
   组织顺序：装备选择 → 近战/远程/弹药管理 → 丢弃物品
   ============================================================ */

import {
  getState,
  setPhase,
  setStory,
  setOptions,
  removeItem,
  equipMelee,
  equipRanged,
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
}

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
    if (state.meleeWeapon.id !== DEFAULT_ITEM_IDS.melee) {
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
  state.food.forEach((item, i) => items.push({ category: "food", index: i, label: `[食物] ${item.name}` }));
  state.drinks.forEach((item, i) => items.push({ category: "drinks", index: i, label: `[饮品] ${item.name}` }));
  state.medicine.forEach((item, i) => items.push({ category: "medicine", index: i, label: `[药品] ${item.name}` }));
  state.other.forEach((item, i) => items.push({ category: "other", index: i, label: `[其他] ${item.name}` }));
  state.cargo.forEach((c, i) => items.push({ category: "cargo", index: i, label: `[货物] ${c.name}` }));
  items.push({ category: "back", index: -1, label: "返回" });
  const opts = items.map((item, i) => ({ text: item.label, action: "discard", index: i }));
  setOptions(opts);
}

export function handleDiscardAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const option = state.options[optionIndex];

  const items = [];
  state.food.forEach((item, i) => items.push({ category: "food", index: i, name: item.name }));
  state.drinks.forEach((item, i) => items.push({ category: "drinks", index: i, name: item.name }));
  state.medicine.forEach((item, i) => items.push({ category: "medicine", index: i, name: item.name }));
  state.other.forEach((item, i) => items.push({ category: "other", index: i, name: item.name }));
  state.cargo.forEach((c, i) => items.push({ category: "cargo", index: i, name: c.name }));
  items.push({ category: "back", index: -1, name: "返回" });

  const item = items[option.index];
  if (!item || item.category === "back") {
    returnToMenu();
    return;
  }

  const removed = removeItem(item.category, item.index);
  if (removed) {
    setStory(`你丢弃了${removed.name}。`);
  }
  returnToMenu();
}
