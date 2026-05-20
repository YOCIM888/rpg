/* ============================================================
   基地建设模块
   组织顺序：基地升级 → 种植系统 → 仓库系统
   ============================================================ */

import {
  getState,
  setPhase,
  setStory,
  setOptions,
  addItem,
  addCigarettes,
  removeCigarettes,
  advanceTime,
  updateStatusEffects,
  checkDeath,
  getItemDisplayName,
} from './state.js';

import {
  FOODS,
  BASE_LEVELS,
  WAREHOUSE_LEVELS,
  BUILDING_MATERIAL_NAMES,
  DEFAULT_ITEM_IDS,
  GAME_CONSTANTS,
} from './config.js';

import {
  showHomeOptions,
  showBaseBuildOptions,
} from './routing.js';

import {
  handleBaseBuild,
} from './game/index.js';

import {
  handlePlantCrop as farmingPlantCrop,
  handleViewCrops as farmingViewCrops,
  handleHarvestCrops as farmingHarvestCrops,
  handleSeedSelect,
} from './farming.js';

// ---------- 基地升级 ----------

export function getBaseName(level) {
  return BASE_LEVELS[level]?.name || BASE_LEVELS[0].name;
}

export function getBaseBonus(level) {
  return BASE_LEVELS[level]?.bonus ?? 0;
}

export function getBaseUpgradeCost(level) {
  return BASE_LEVELS[level]?.cost ?? null;
}

export function handleUpgradeBase() {
  const state = getState();
  if (state.baseLevel >= GAME_CONSTANTS.BASE.MAX_BASE_LEVEL) {
    setStory("【幸存者别墅】已经是最高等级的基地了，金碧辉煌，固若金汤。你站在落地窗前俯瞰这片末日废墟，心中感慨万千。");
    showHomeOptions();
    return;
  }
  const cost = getBaseUpgradeCost(state.baseLevel + 1);
  if (!cost) {
    showHomeOptions();
    return;
  }
  const nextLevel = state.baseLevel + 1;
  const bonus = getBaseBonus(nextLevel) - getBaseBonus(state.baseLevel);
  const lines = [`🏠 ${getBaseName(state.baseLevel)} → ${getBaseName(nextLevel)}`];
  lines.push(`睡眠恢复加成: ${getBaseBonus(state.baseLevel)} → ${getBaseBonus(nextLevel)}（+${bonus}HP）`);
  lines.push(`⏱ 耗时: ${GAME_CONSTANTS.BASE.UPGRADE_TIME_COST}回合（1天）`);
  lines.push(`━━━━━━━━━━━━━━━━━`);
  lines.push(`📦 所需材料：`);
  const costNames = BUILDING_MATERIAL_NAMES;
  let canAfford = true;
  for (const [id, count] of Object.entries(cost)) {
    const have = countBuildingMaterial(state, id);
    lines.push(`  ${costNames[id]}: ${have}/${count} ${have >= count ? "✅" : "❌"}`);
    if (have < count) canAfford = false;
  }
  if (canAfford) {
    setStory(lines.join("\n") + "\n\n确定要消耗这些材料进行升级吗？升级将持续整整一天。");
    setPhase("base_upgrade_confirm");
    setOptions([
      { text: "✅ 确认升级", action: "confirm_upgrade" },
      { text: "❌ 再想想", action: "back_to_base" },
    ]);
  } else {
    setStory(lines.join("\n") + "\n\n⚠️ 建筑材料不足，无法开工。去搜刮更多的材料吧！");
    showBaseBuildOptions();
  }
}

export function handleConfirmUpgrade() {
  const state = getState();
  const oldName = getBaseName(state.baseLevel);
  const cost = getBaseUpgradeCost(state.baseLevel + 1);
  if (!cost) { showHomeOptions(); return; }
  for (const [id, count] of Object.entries(cost)) {
    removeBuildingMaterials(state, id, count);
  }
  state.baseLevel++;
  const newName = getBaseName(state.baseLevel);
  advanceTime(GAME_CONSTANTS.BASE.UPGRADE_TIME_COST);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    const flavor = BASE_LEVELS[state.baseLevel]?.upgradeFlavor || "";
    setStory(`【${oldName} → ${newName}】\n\n${flavor}\n\n睡觉恢复效果提升了（+${getBaseBonus(state.baseLevel)}HP）！`);
    if (state.baseLevel >= GAME_CONSTANTS.BASE.MAX_BASE_LEVEL) {
      if (!state.unlockedAchievements) state.unlockedAchievements = [];
      if (!state.unlockedAchievements.includes("base_upgrade")) state.unlockedAchievements.push("base_upgrade");
    }
    showHomeOptions();
  }
}

// ---------- 种植系统 ----------

export function handlePlantCrop() {
  farmingPlantCrop();
}

export function handleViewCrops() {
  farmingViewCrops();
}

export function handleHarvestCrops() {
  farmingHarvestCrops();
}

// ---------- 仓库系统 ----------

export function getWarehouseCapacity(level) {
  return GAME_CONSTANTS.BASE.WAREHOUSE_BASE_CAP + level * GAME_CONSTANTS.BASE.WAREHOUSE_CAP_PER_LEVEL;
}

export function getWarehouseUpgradeCost(level) {
  return WAREHOUSE_LEVELS[level] || null;
}

export function countBuildingMaterial(state, id) {
  return state.other.filter(i => i.id === id).reduce((sum, i) => sum + (i.count || 1), 0);
}

export function removeBuildingMaterials(state, id, count) {
  let remaining = count;
  for (let i = state.other.length - 1; i >= 0 && remaining > 0; i--) {
    if (state.other[i].id === id) {
      const available = state.other[i].count || 1;
      if (available <= remaining) {
        state.other.splice(i, 1);
        remaining -= available;
      } else {
        state.other[i].count = available - remaining;
        remaining = 0;
      }
    }
  }
  return remaining === 0;
}

export function handleBuildWarehouse() {
  const state = getState();
  if (state.warehouseLevel >= GAME_CONSTANTS.BASE.MAX_WAREHOUSE_LEVEL) {
    const maxCap = getWarehouseCapacity(GAME_CONSTANTS.BASE.MAX_WAREHOUSE_LEVEL);
    setStory(`仓库已经最大容量（${maxCap}格），无需继续扩建。`);
    showBaseBuildOptions();
    return;
  }
  const nextLevel = state.warehouseLevel + 1;
  const cost = getWarehouseUpgradeCost(nextLevel);
  if (!cost) {
    showBaseBuildOptions();
    return;
  }
  const costNames = BUILDING_MATERIAL_NAMES;
  const currentCap = getWarehouseCapacity(state.warehouseLevel);
  const nextCap = getWarehouseCapacity(nextLevel);
  let lines = [`📦 【仓库扩建 Lv${state.warehouseLevel} → Lv${nextLevel}】`];
  lines.push(`容量: ${currentCap}格 → ${nextCap}格（+${nextCap - currentCap}格）`);
  lines.push(`━━━━━━━━━━━━━━━━━`);
  lines.push(`📋 所需材料：`);
  let canAfford = true;
  for (const [id, count] of Object.entries(cost)) {
    const have = countBuildingMaterial(state, id);
    lines.push(`${costNames[id]}: ${have}/${count} ${have >= count ? "✅" : "❌"}`);
    if (have < count) canAfford = false;
  }
  if (canAfford) {
    setStory(lines.join("\n") + "\n\n扩建后可以存放更多物资，确定建造吗？");
    setPhase("warehouse_upgrade_confirm");
    setOptions([
      { text: "✅ 确认建造", action: "confirm_warehouse" },
      { text: "❌ 再想想", action: "back_to_base" },
    ]);
  } else {
    setStory(lines.join("\n") + "\n\n⚠️ 材料不够，没法开工。多去搜刮一些建材吧。");
    showBaseBuildOptions();
  }
}

export function handleConfirmWarehouse() {
  const state = getState();
  const nextLevel = state.warehouseLevel + 1;
  const cost = getWarehouseUpgradeCost(nextLevel);
  const oldCap = getWarehouseCapacity(state.warehouseLevel);
  if (!cost) { showHomeOptions(); return; }
  for (const [id, count] of Object.entries(cost)) {
    removeBuildingMaterials(state, id, count);
  }
  state.warehouseLevel++;
  const newCap = getWarehouseCapacity(state.warehouseLevel);
  setStory(`📦 你花了一些时间，叮叮当当地在仓库里加装了一排新货架。\n\n仓库扩容完成！${oldCap}格 → ${newCap}格  |  当前使用：${state.warehouse.length}/${newCap}格`);
  advanceTime(GAME_CONSTANTS.BASE.WAREHOUSE_UPGRADE_TIME);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    showHomeOptions();
  }
}

export function handleOpenWarehouse() {
  const state = getState();
  const cap = getWarehouseCapacity(state.warehouseLevel);
  const usage = state.warehouse.length;
  const pct = Math.round((usage / cap) * 100);
  setStory(`📦 【仓库】使用情况：${usage}/${cap}格（${pct}%）\n\n存入物品：将背包中的物品转移到仓库\n取出物品：将仓库中的物品拿回背包`);
  setPhase("warehouse_menu");
  setOptions([
    { text: "存入物品", action: "warehouse_deposit" },
    { text: "取出物品", action: "warehouse_withdraw" },
    { text: "返回", action: "back_to_base" },
  ]);
}

export function handleWarehouseDeposit() {
  const state = getState();
  const cap = getWarehouseCapacity(state.warehouseLevel);
  if (state.warehouse.length >= cap) {
    setStory("📦 仓库已经塞满了！先取出一些物品腾出空间吧。");
    handleOpenWarehouse();
    return;
  }
  let items = [];
  state.food.forEach((item, i) => items.push({ ...item, cat: "food", idx: i, label: `[食物] ${getItemDisplayName(item)}` }));
  state.drinks.forEach((item, i) => items.push({ ...item, cat: "drinks", idx: i, label: `[饮品] ${getItemDisplayName(item)}` }));
  state.medicine.forEach((item, i) => items.push({ ...item, cat: "medicine", idx: i, label: `[医疗] ${getItemDisplayName(item)}` }));
  state.other.forEach((item, i) => items.push({ ...item, cat: "other", idx: i, label: `[其他] ${getItemDisplayName(item)}` }));
  if (state.seeds) state.seeds.forEach((item, i) => items.push({ ...item, cat: "seed", idx: i, label: `[种子] ${getItemDisplayName(item)}` }));
  if (state.cigarettes > 0) items.push({ cat: "cigarettes", idx: 0, name: "香烟", label: `[货物] (${state.cigarettes})香烟` });
  if (items.length === 0) {
    setStory("📦 背包里空空如也，没有东西可以存。");
    handleOpenWarehouse();
    return;
  }
  setPhase("warehouse_deposit_select");
  const opts = items.map((item, i) => ({ text: item.label, action: "do_deposit", index: i, depositItem: item }));
  opts.push({ text: "返回", action: "back_to_warehouse", index: -1 });
  setOptions(opts);
}

export function handleWarehouseWithdraw() {
  const state = getState();
  if (state.warehouse.length === 0) {
    setStory("📦 仓库里空空如也，什么也没有。");
    handleOpenWarehouse();
    return;
  }
  setPhase("warehouse_withdraw_select");
  const opts = state.warehouse.map((item, i) => ({ text: `${getItemDisplayName(item)}`, action: "do_withdraw", index: i }));
  opts.push({ text: "返回", action: "back_to_warehouse", index: -1 });
  setOptions(opts);
}

export function handleDoDeposit(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) { handleOpenWarehouse(); return; }
  const option = state.options[optIdx];
  if (option.action !== "do_deposit") { handleOpenWarehouse(); return; }
  const item = option.depositItem;
  if (item.cat === "cigarettes") {
    const depositCount = Math.min(item.count || state.cigarettes, state.cigarettes);
    removeCigarettes(depositCount);
    state.warehouse.push({ id: "香烟", name: "香烟", type: "cigarette", count: depositCount });
  } else {
    state.warehouse.push(item);
    const catMap = { food: state.food, drinks: state.drinks, medicine: state.medicine, other: state.other, seed: state.seeds };
    catMap[item.cat].splice(item.idx, 1);
  }
  const cap = getWarehouseCapacity(state.warehouseLevel);
  const usage = state.warehouse.length;
  setStory(`📦 你把${getItemDisplayName(item)}存入了仓库。（${usage}/${cap}格）`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    handleOpenWarehouse();
  }
}

export function handleDoWithdraw(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) { handleOpenWarehouse(); return; }
  const option = state.options[optIdx];
  if (option.action !== "do_withdraw") { handleOpenWarehouse(); return; }
  const item = state.warehouse[option.index];
  const added = addItem({ ...item });
  if (!added) {
    setStory("🎒 你的背包已满，拿不了更多东西了。先清理一下背包空间吧。");
    handleOpenWarehouse();
    return;
  }
  state.warehouse.splice(option.index, 1);
  const cap2 = getWarehouseCapacity(state.warehouseLevel);
  setStory(`📦 你从仓库中取出了${getItemDisplayName(item)}。（${state.warehouse.length}/${cap2}格）`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    handleOpenWarehouse();
  }
}

export function handleWarehouseMenuAction(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;
  const action = state.options[optIdx].action;
  if (action === "warehouse_deposit") handleWarehouseDeposit();
  else if (action === "warehouse_withdraw") handleWarehouseWithdraw();
  else showBaseBuildOptions();
}

export { handleSeedSelect };
