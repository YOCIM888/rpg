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
  advanceTime,
  updateStatusEffects,
  checkDeath,
} from './state.js';

import {
  FOODS,
  CROPS,
  BASE_LEVELS,
  WAREHOUSE_LEVELS,
  BUILDING_MATERIAL_NAMES,
  DEFAULT_ITEM_IDS,
} from './config.js';

import {
  showHomeOptions,
} from './routing.js';

import {
  handleBaseBuild,
} from './game.js';

function showBaseBuildOptions() {
  setPhase("base_build");
  setOptions([
    { text: "改造基地", action: "upgrade_base" },
    { text: "种植作物", action: "plant_crop" },
    { text: "查看耕地", action: "view_crops" },
    { text: "收获作物", action: "harvest_crops" },
    { text: "建造仓库", action: "build_warehouse" },
    { text: "打开仓库", action: "open_warehouse" },
    { text: "返回", action: "back_to_home" },
  ]);
}

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
  if (state.baseLevel >= 4) {
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
  lines.push(`⏱ 耗时: 8回合（1天）`);
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
  advanceTime(8);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    const levelUpFlavors = [
      "你挥汗如雨地搬运木材、敲打铁钉。简陋的帐篷在你手中一点一点地变了模样——墙壁立起来了，屋顶盖上了。当最后一块木板钉牢时，一座结实的小木屋矗立在你面前！",
      "你拆掉木屋的旧墙，用石头和水泥重新砌筑。锤声叮当响了一整天，灰尘弥漫中，一座厚重的石屋拔地而起。墙壁厚实得连丧尸都撞不塌！",
      "你在石屋的基础上加盖二层，安装玻璃窗，铺设木地板。钢筋水泥间，一座像样的乡间小楼落成了！推开窗，微风吹进来，你恍惚觉得回到了文明世界。",
      "你一砖一瓦地扩建、装修、造花园。当最后一块琉璃瓦铺上屋顶时，这座气派的别墅终于完工了！在末日废墟中，你拥有了一片属于自己的豪华避风港。"
    ];
    setStory(`【${oldName} → ${newName}】\n\n${levelUpFlavors[state.baseLevel - 1]}\n\n睡觉恢复效果提升了（+${getBaseBonus(state.baseLevel)}HP）！`);
    showHomeOptions();
  }
}

// ---------- 种植系统 ----------

export function handlePlantCrop() {
  const state = getState();
  const emptySlot = state.crops.findIndex(c => c === null);
  if (emptySlot === -1) {
    setStory("🌱 你的五块耕地都种满了！等作物成熟收获后，空出位置再来吧。");
    showBaseBuildOptions();
    return;
  }
  const seedIdx = state.other.findIndex(i => i.id === DEFAULT_ITEM_IDS.seed);
  if (seedIdx === -1) {
    setStory("🌱 你翻遍了背包，一颗种子都没有。\n\n去黑市商人那里买（1支香烟换1包），或者在谷仓、农家乐、露营地搜刮碰碰运气吧。");
    showBaseBuildOptions();
    return;
  }
  state.other.splice(seedIdx, 1);
  const crop = CROPS[Math.floor(Math.random() * CROPS.length)];
  state.crops[emptySlot] = { name: crop.name, matureTurns: crop.matureTurns, totalTurns: crop.matureTurns, reward: crop.reward };
  setStory(`🌱 你蹲在耕地[${emptySlot + 1}]前，小心翼翼地将${crop.name}种子埋进土里，轻轻覆土、浇水。\n\n预计 ${crop.matureTurns} 回合后就能收获了（大约${Math.ceil(crop.matureTurns / 8)}天）。`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    showBaseBuildOptions();
  }
}

export function handleViewCrops() {
  const state = getState();
  let lines = [`🌾 【${getBaseName(state.baseLevel)}·耕地状态】`];
  lines.push(`━━━━━━━━━━━━━━━━━`);
  let hasAny = false;
  for (let i = 0; i < 5; i++) {
    const crop = state.crops[i];
    if (crop === null) {
      lines.push(`[${i + 1}] ⬜ 空位`);
    } else if (crop.matureTurns <= 0) {
      lines.push(`[${i + 1}] ✅ ${crop.name} —— 已成熟，快来收获吧！`);
      hasAny = true;
    } else {
      const turnsLeft = crop.matureTurns;
      const daysLeft = Math.ceil(turnsLeft / 8);
      const progress = Math.round((1 - turnsLeft / crop.totalTurns) * 100);
      lines.push(`[${i + 1}] 🌱 ${crop.name} —— 还需 ${turnsLeft} 回合（约${daysLeft}天）[${progress}%]`);
      hasAny = true;
    }
  }
  lines.push(`━━━━━━━━━━━━━━━━━`);
  if (!hasAny) {
    lines.push(`💡 所有耕地都空着，种点东西吧！去搞些种子来。`);
  }
  lines.push(`💡 耕地最多同时种5块，收获后自动空出位置。`);
  setStory(lines.join("\n"));
  showBaseBuildOptions();
}

export function handleHarvestCrops() {
  const state = getState();
  let harvested = [];
  let foodNames = [];
  for (let i = 0; i < 5; i++) {
    const crop = state.crops[i];
    if (crop !== null && crop.matureTurns <= 0) {
      const foodCount = crop.reward.food || 0;
      for (let j = 0; j < foodCount; j++) {
        const foodItem = FOODS[Math.floor(Math.random() * FOODS.length)];
        const added = addItem({ ...foodItem });
        if (!added) {
          setStory(`⚠️ 背包已满！只收获了一部分作物。\n\n已收获：${foodNames.join("、")}\n请先清理背包空间再来收获剩余作物。`);
          showBaseBuildOptions();
          return;
        }
        foodNames.push(foodItem.name);
      }
      harvested.push(`${crop.name}×${foodCount}`);
      state.crops[i] = null;
    }
  }
  if (harvested.length === 0) {
    setStory("🌾 地里没有可以收获的作物。要么还没成熟，要么根本没种。去【查看耕地】看看吧。");
  } else {
    setStory(`🌾 你挎着篮子走进田地，小心翼翼地摘下成熟的果实。\n\n收获清单：${harvested.join("、")}\n共计 ${foodNames.length} 份食物已存入背包。\n\n具体食物：${foodNames.join("、")}`);
  }
  showBaseBuildOptions();
}

// ---------- 仓库系统 ----------

export function getWarehouseCapacity(level) {
  return 30 + level * 10;
}

export function getWarehouseUpgradeCost(level) {
  return WAREHOUSE_LEVELS[level] || null;
}

export function countBuildingMaterial(state, id) {
  return state.other.filter(i => i.id === id).length;
}

export function removeBuildingMaterials(state, id, count) {
  let removed = 0;
  for (let i = state.other.length - 1; i >= 0 && removed < count; i--) {
    if (state.other[i].id === id) {
      state.other.splice(i, 1);
      removed++;
    }
  }
  return removed === count;
}

export function handleBuildWarehouse() {
  const state = getState();
  if (state.warehouseLevel >= 7) {
    setStory("仓库已经最大容量（100格），无需继续扩建。");
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
  advanceTime(2);
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
  state.food.forEach((item, i) => items.push({ ...item, cat: "food", idx: i, label: `[食物] ${item.name}` }));
  state.drinks.forEach((item, i) => items.push({ ...item, cat: "drinks", idx: i, label: `[饮品] ${item.name}` }));
  state.medicine.forEach((item, i) => items.push({ ...item, cat: "medicine", idx: i, label: `[医疗] ${item.name}` }));
  state.other.forEach((item, i) => items.push({ ...item, cat: "other", idx: i, label: `[其他] ${item.name}` }));
  state.cargo.forEach((item, i) => items.push({ ...item, cat: "cargo", idx: i, label: `[货物] ${item.name}` }));
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
  const opts = state.warehouse.map((item, i) => ({ text: `${item.name}`, action: "do_withdraw", index: i }));
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
  state.warehouse.push(item);
  const catMap = { food: state.food, drinks: state.drinks, medicine: state.medicine, other: state.other, cargo: state.cargo };
  catMap[item.cat].splice(item.idx, 1);
  const cap = getWarehouseCapacity(state.warehouseLevel);
  const usage = state.warehouse.length;
  setStory(`📦 你把${item.name}存入了仓库。（${usage}/${cap}格）`);
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
  setStory(`📦 你从仓库中取出了${item.name}。（${state.warehouse.length}/${cap2}格）`);
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
