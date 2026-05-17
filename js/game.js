/* ============================================================
   游戏逻辑模块（精简版：仅保留菜单+睡眠饮食+路由分发）
   由 spec-driven 重构拆分，具体业务逻辑分布到各子模块：
     maps.js       — 地图事件
     combat.js     — 战斗/遭遇
     base.js       — 基地建设
     outpost.js    — 曙光阵地
     equipment.js  — 装备管理
     trading.js    — 以物易物
     faction.js    — 阵营工具
     castle/       — 末日城堡全套
     npcs/         — NPC 交互
   ============================================================ */

// ---------- 导入 ----------
import {
  getState,
  advanceTime,
  updateStatusEffects,
  checkDeath,
  setLocation,
  setCurrentMap,
  setPhase,
  setStory,
  setOptions,
  addItem,
  consumeItem,
  removeItem,
  equipMelee,
  equipRanged,
  addAmmo,
  getBackpackCount,
  resetState,
  resetCrashTurns,
  addNpcAffinity,
  getNpcAffinity,
  getAffinityLabel,
  getAffinityStage,
  canBegToday,
  markBegDone,
  isQuestDone,
  markQuestDone,
  canChatToday,
  incrementChatCount,
} from './state.js';

import {
  FOODS,
  DRINKS,
  FRUITS,
  CIGARETTES,
  AMMO,
  GAME_CONSTANTS,
  MELEE_WEAPONS,
  RANGED_WEAPONS,
  CROPS,
  MAPS,
  NPCS,
  SURVIVOR_NPC,
  LOOT_BACKPACKS,
  OUTLAW_DIALOGUES,
  MECHANIC_DIALOGUES,
  WOLF_DIALOGUES,
  WAREHOUSE_GUARD_DIALOGUES,
  NURSE_ZOMBIE_INTRO,
  CANNED_FOOD_IDS,
  NURSE_MEDICINE_POOL,
  NERVOUS_VETERAN_DIALOGUES,
  DOCTOR_INTRO,
  DOCTOR_DIALOGUES,
  ZOMBIE_KING_INTRO,
  CASTLE_GUARD_DIALOGUES,
  CASTLE_KING_DIALOGUES,
  CASTLE_QUEEN_DIALOGUES,
  CASTLE_BANKER_DIALOGUES,
  getRandomZombie,
  pickRandomLoot,
  getRandomTrade,
  createNpcInstance,
  generateNpcLoot,
  FIXED_LOOT_DROPS,
} from './config.js';

import { saveGame, loadGame, deleteSlot, updateBestRecord, getAllSlots } from './save.js';

import { showHomeOptions, showExploreOptionsState, returnToMenu } from './routing.js';

// ══════════════════════════════════════════════════════════════
// 模块函数导入（各子模块导出的业务函数）
// ══════════════════════════════════════════════════════════════

import {
  handleCastleOutpost,
  refreshCastleOutpost,
  handleCastleExploreBlocked,
  handleCastleGuard,
  showCastleInterior,
  refreshCastleInterior,
  handleCastleInteriorExplore,
  handleCastleInteriorAction,
  handleCastleKing,
  handleCastleQueen,
  handleCastleBanquet,
  handleCastleBall,
  handleCastleRoom,
  handleLeaveCastleInterior,
  handleLeaveCastle,
  handleCastleIdentity,
  handleIdentityApply,
  handleIdentityCancel,
  refreshCastleIdentity,
  handleCastleWork,
  handleCastleBank,
  handleBankLoan,
  handleLoanSubmit,
  handleBankRepay,
  handleBankBanker,
  handleBankerMercy,
  refreshCastleBank,
  handleBankerFight,
  handleCastleGuardAction,
  handleCastleBankAction,
  handleCastleIdentityAction,
  handleCastleBankerAction,
  handleGuardChat,
  handleGuardEnter,
  handleGuardBribe,
  handleGuardLeave,
} from './castle/index.js';

import {
  hasNobleId,
  hasDawnBadge,
  cleanDualIdentity,
} from './faction.js';

import {
  showOutpostOptions,
  handleOutpostExplore,
  handleBegSupplies,
  handleWork,
  handleNpcLeader,
  showLeaderOptions,
  handleLeaderChat,
  handleLeaderGift,
  handleLeaderJoin,
  handleLeaderQuit,
  handleLeaderClaim,
  handleLeaderDoGift,
} from './outpost.js';

import {
  getRangedAmmoInfo,
  canRangedCombat,
  handlePreCombatChoice,
  handleCombat,
  handleSurvivorEncounter,
  handleBanditEncounter,
  handlePreCombatNpcChoice,
  handleSurvivorAction,
  handleNpcCombat,
  handleWanderingTraderEncounter,
  handleWanderingTraderAction,
  handleTraderBuyAmmo,
  handleTraderBuyWeapon,
  handleDoctorEncounter,
  handleDoctorAction,
} from './combat.js';

import {
  handleClimbTower,
  handlePickFruit,
  handleExploreCave,
  handleLootCorpse,
  handleOutlawInteract,
  handleOutlawChat,
  handleOutlawFight,
  handleOutlawLeave,
  handleSearchFoodLocker,
  handleMechanicInteract,
  handleMechanicChat,
  handleMechanicTrade,
  handleMechanicTradeConfirm,
  handleMechanicLeave,
  handleWolfInteract,
  handleWolfChat,
  handleWolfLeave,
  handleWolfTrade,
  handleExploreFactory,
  handleViewRiver,
  handleMaskedManInteract,
  handleMaskedManFight,
  handleMaskedManLeave,
  handleWarehouseGuardInteract,
  handleWarehouseGuardChat,
  handleWarehouseGuardLeave,
  handleWarehouseGuardTrade,
  handleWarehouseGuardTradeConfirm,
  handleNurseZombieInteract,
  handleNurseZombieFeedSelect,
  handleNurseZombieFeedConfirm,
  handleNurseZombieBringHome,
  handleNurseZombieLeave,
  handlePoliceRaid,
  handleVeteranInteract,
  handleVeteranChat,
  handleVeteranLeave,
  handleVeteranAmmo,
  handleExploreTunnel,
  handleDoctorInteract,
  handleDoctorTrade,
  handleDoctorChat,
  handleDoctorLeave,
  handleZombieKingInteract,
  handleInfectedWoman,
  handleInjectWoman,
  handleIgnoreWoman,
  handleKillZombieWoman,
  handlePartnerHarvest,
} from './maps.js';

import {
  handleUpgradeBase,
  handleConfirmUpgrade,
  handlePlantCrop,
  handleViewCrops,
  handleHarvestCrops,
  handleBuildWarehouse,
  handleConfirmWarehouse,
  handleOpenWarehouse,
  handleWarehouseDeposit,
  handleWarehouseWithdraw,
  handleDoDeposit,
  handleDoWithdraw,
  handleWarehouseMenuAction,
  getBaseName,
  getBaseBonus,
  getBaseUpgradeCost,
  getWarehouseCapacity,
  getWarehouseUpgradeCost,
  countBuildingMaterial,
  removeBuildingMaterials,
} from './base.js';

import {
  handleEquipSelect,
  handleEquipSubAction,
  handleMeleeEquipAction,
  handleRangedEquipAction,
  handleAmmoLoadAction,
  handleDiscardSelect,
  handleDiscardAction,
} from './equipment.js';

import {
  handleTradeChoice,
  handleTradeInput,
} from './trading.js';

import {
  handleNpcInteract,
  handleNpcAction,
  handleNpcChat,
  handleNpcGift,
  handleNpcGiftConfirm,
  handleNpcQuest,
  handleNpcQuestConfirm,
  handleNpcQuestReward,
  handleNpcRecycle,
  handleRecycleConfirm,
  handleNpcRecycleRanged,
  handleRecycleRangedConfirm,
  handleNpcRepair,
  handleRepairConfirm,
  handleNpcRepairBow,
  handleRepairBowConfirm,
  handleNpcCureInfection,
  handleCureConfirm,
  handleNpcQuestPreview,
  getNpcConfig,
  npcHeader,
  getAvailableQuest,
  getQuestProgress,
  canSubmitQuest,
} from './npcs/index.js';

import {
  handleVAction,
  handleVTrade,
  handleVTradeConfirm,
} from './npcs/v.js';

import {
  handleXiaohanAction,
  handleXiaohanTrade,
  handleXiaohanTradeConfirm,
} from './npcs/xiaohan.js';

import {
  handleLiliAction,
  handleLiliTrade,
  handleLiliTradeConfirm,
} from './npcs/lili.js';

import {
  handleMapNpcs,
  handleMapNpcsAction,
  handleMapNpcTrade,
  handleMapNpcGift,
} from './npcs/map-npcs.js';

// ---------- 菜单函数（主页/探索）----------

function handleBaseBuild() {
  setPhase("base_build");
  const state = getState();
  setStory(`[${getBaseName(state.baseLevel)}] 你开始规划基地的建设方案……`);
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

function handleBaseBuildAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;
  const action = state.options[optionIndex].action;
  if (action === "upgrade_base") { handleUpgradeBase(); return; }
  if (action === "plant_crop") { handlePlantCrop(); return; }
  if (action === "view_crops") { handleViewCrops(); return; }
  if (action === "harvest_crops") { handleHarvestCrops(); return; }
  if (action === "build_warehouse") { handleBuildWarehouse(); return; }
  if (action === "open_warehouse") { handleOpenWarehouse(); return; }
  if (action === "back_to_home") { showHomeOptions(); return; }
  if (action === "back_to_base") { handleBaseBuild(); return; }
  if (action === "back_to_warehouse") { handleOpenWarehouse(); return; }
}

// ---------- 睡觉/进食/饮水/医疗 ----------

/**
 * 处理睡觉操作：恢复生命值并减轻崩溃值
 */
function handleSleep() {
  const state = getState();
  if (state.crash >= 100) {
    setStory("你精神已经完全崩溃了，根本无法入睡。你的大脑一片混乱，无法安静下来。");
    showHomeOptions();
    return;
  }
  if (state.hunger <= 0) {
    setStory("你太饿了，根本无法入睡。先吃点东西吧。");
    showHomeOptions();
    return;
  }
  if (state.hydration <= 0) {
    setStory("你太渴了，根本无法入睡。先喝点东西吧。");
    showHomeOptions();
    return;
  }
  resetCrashTurns();
  const reduction = Math.floor(Math.random() * 16) + 10;
  state.crash = Math.max(0, state.crash - reduction);
  const healthRecovery = Math.floor(Math.random() * 21) + 20 + getBaseBonus(state.baseLevel);
  state.health = Math.min(GAME_CONSTANTS.MAX_HEALTH, state.health + healthRecovery);
  advanceTime(4);
  updateStatusEffects();
  setStory(`你沉沉睡去，醒来后感觉精神好了一些。崩溃减轻了${reduction}%，健康恢复了${healthRecovery}点。`);
  checkDeath();
  showHomeOptions();
}

/**
 * 进入食物选择界面
 */
function handleEatSelect() {
  const state = getState();
  if (state.crash >= 100) {
    setStory("你精神已经完全崩溃了，根本不想吃任何东西。你对一切都失去了兴趣。");
    returnToMenu();
    return;
  }
  if (state.food.length === 0) {
    setStory("你没有食物可以吃。");
    returnToMenu();
    return;
  }
  setPhase("eat_select");
  setStory("请选择要食用的食物：");
  const foodOptions = state.food.map((f, i) => {
    let info = `（饱腹+${f.hunger || 0}`;
    if (f.hydration) info += ` 水分+${f.hydration}`;
    info += "）";
    return { text: f.name + info, action: "eat_food", index: i };
  });
  foodOptions.push({ text: "返回", action: "back", index: -1 });
  setOptions(foodOptions);
}

/**
 * 进入饮品选择界面
 */
function handleDrinkSelect() {
  const state = getState();
  if (state.crash >= 100) {
    setStory("你精神已经完全崩溃了，根本不想喝任何东西。你对一切都失去了兴趣。");
    returnToMenu();
    return;
  }
  if (state.drinks.length === 0) {
    setStory("你没有饮品可以喝。");
    returnToMenu();
    return;
  }
  setPhase("drink_select");
  setStory("请选择要饮用的饮品：");
  const drinkOptions = state.drinks.map((d, i) => {
    let info = `（水分+${d.hydration}`;
    if (d.effects && d.effects.crash) info += ` 崩溃${d.effects.crash > 0 ? "+" : ""}${d.effects.crash}`;
    info += "）";
    return { text: d.name + info, action: "drink_item", index: i };
  });
  drinkOptions.push({ text: "返回", action: "back", index: -1 });
  setOptions(drinkOptions);
}

/**
 * 进入医疗物品选择界面
 */
function handleMedicineSelect() {
  const state = getState();
  if (state.medicine.length === 0) {
    setStory("你没有医疗物品可用。");
    returnToMenu();
    return;
  }
  setPhase("medicine_select");
  setStory("请选择要使用的医疗物品：");
  const medOptions = state.medicine.map((m, i) => {
    const effects = [];
    if (m.effects) {
      if (m.effects.health) effects.push(`生命+${m.effects.health}`);
      if (m.effects.infection) effects.push(`感染${m.effects.infection > 0 ? "+" : ""}${m.effects.infection}`);
      if (m.effects.crash) effects.push(`崩溃${m.effects.crash > 0 ? "+" : ""}${m.effects.crash}`);
      if (m.effects.hydration) effects.push(`水分+${m.effects.hydration}`);
    }
    return { text: m.name + (effects.length > 0 ? `（${effects.join(" ")}）` : ""), action: "use_med", index: i };
  });
  medOptions.push({ text: "返回", action: "back", index: -1 });
  setOptions(medOptions);
}

// ---------- 出门/探索 ----------

/**
 * 进入地图选择界面
 */
function handleGoOut() {
  setPhase("map_select");
  setStory("请选择你要前往的地点：");
  const mapOptions = MAPS.map((m, i) => ({
    text: `${m.name} [${m.danger}]`,
    action: "select_map",
    index: i
  }));
  mapOptions.push({ text: "返回", action: "back", index: -1 });
  setOptions(mapOptions);
}

/**
 * 返回幸存者帐篷（家）
 */
function handleGoHome() {
  const state = getState();
  setLocation("幸存者帐篷");
  setCurrentMap(null);
  advanceTime(1);
  updateStatusEffects();
  setStory("你安全回到了幸存者帐篷。");
  checkDeath();
  showHomeOptions();
}

/**
 * 在当前地图中进行探索
 */
function handleExplore() {
  const state = getState();
  const map = state.currentMap;
  if (!map) {
    setStory("你不在任何地图中，无法探索。");
    showHomeOptions();
    return;
  }

  if (Math.random() < GAME_CONSTANTS.ENCOUNTER.NPC_RATE) {
    const npcRoll = Math.random();
    const dist = GAME_CONSTANTS.ENCOUNTER.NPC_DISTRIBUTION;
    let npcType;
    let cumulative = 0;
    for (const [type, prob] of Object.entries(dist)) {
      cumulative += prob;
      if (npcRoll < cumulative) {
        npcType = type;
        break;
      }
    }
    if (!npcType) npcType = 'bandit';
    switch (npcType) {
      case 'survivor':
        handleSurvivorEncounter();
        break;
      case 'wanderingTrader':
        handleWanderingTraderEncounter();
        break;
      case 'doctor':
        handleDoctorEncounter();
        break;
      case 'bandit':
        handleBanditEncounter();
        break;
    }
    advanceTime(1);
    const wasFoggy1 = getState().weather === "大雾";
    if (wasFoggy1) advanceTime(1);
    updateStatusEffects();
    checkDeath();
    return;
  }

  if (Math.random() < map.encounterRate) {
    const zombieDef = getRandomZombie(map);
    setPhase("pre_combat");
    state._pendingZombie = zombieDef;
    const meleeName = state.meleeWeapon.name;
    const rangedName = state.rangedWeapon ? state.rangedWeapon.name : "无";
    const ammoInfo = getRangedAmmoInfo(state);
    setStory(`你遭遇了${zombieDef.name}（HP:${zombieDef.hp} 伤害:${zombieDef.damage}）！\n\n【近战】${meleeName}\n【远程】${rangedName} ${ammoInfo}`);
    const options = [
      { text: "近战作战", action: "combat_melee" }
    ];
    if (canRangedCombat(state)) {
      options.push({ text: "远程作战", action: "combat_ranged" });
    } else {
      options.push({ text: "远程作战（不可用：无弹药）", action: "combat_ranged", disabled: true });
    }
    options.push({ text: "逃跑（25%）", action: "combat_flee" });
    setOptions(options);
    return;
  }

  if (map.id === "绝密航天基地" && !state._spaceCrateLooted && Math.random() < 0.05) {
    state._spaceCrateLooted = true;
    const spaceDrop = FIXED_LOOT_DROPS.space_crate;
    const spaceWeapon = RANGED_WEAPONS.find(w => w.id === spaceDrop.weaponId);
    const addedWeapon = addItem({ ...spaceWeapon });
    const spaceAmmo = AMMO.find(a => a.id === spaceDrop.ammoId);
    const addedAmmo = addItem({ id: spaceAmmo.id, name: spaceAmmo.name, type: "ammo", count: spaceDrop.ammoCount });
    let msg = `你在航天基地深处探索时，发现了一艘坠毁的太空舱！舱体已经严重变形，但你从残骸中找到了惊人的发现——一把${spaceWeapon.name}和${spaceDrop.ammoCount}发${spaceAmmo.name}弹药！`;
    if (!addedWeapon || !addedAmmo) msg += "\n但背包已满，部分物品无法携带。";
    setStory(msg);
    advanceTime(1);
    const wasFoggy2 = getState().weather === "大雾";
    if (wasFoggy2) advanceTime(1);
    updateStatusEffects();
    checkDeath();
    if (!state.gameOver) showExploreOptionsState();
    return;
  }

  {
    const loot = pickRandomLoot(map);
    if (!loot) {
      setStory("你仔细搜索了一番，什么也没找到。");
    } else if (loot.type === "backpack") {
      if (loot.capacity > state.backpack.capacity) {
        const oldName = state.backpack.name;
        const oldCapacity = state.backpack.capacity;
        state.backpack = { id: loot.id, name: loot.name, type: loot.name, capacity: loot.capacity };
        setStory(`你发现了一个${loot.name}（${loot.capacity}格）！自动替换了旧的${oldName}（${oldCapacity}格）。`);
      } else {
        setStory(`你发现了一个${loot.name}（${loot.capacity}格），但不如你当前的${state.backpack.name}（${state.backpack.capacity}格），你放弃了它。`);
      }
    } else {
      const added = addItem(loot);
      if (!added) {
        setStory(`你发现了${loot.name}，但背包已满，无法携带。`);
      } else {
        setStory(`你发现了${loot.name}！`);
      }
    }
  }

  advanceTime(1);
  const wasFoggy2 = getState().weather === "大雾";
  if (wasFoggy2) advanceTime(1);
  updateStatusEffects();
  checkDeath();

  if (!state.gameOver) {
    showExploreOptionsState();
  }
}

// ---------- 路由分发 ----------

/**
 * 通用选择阶段处理器 - 处理菜单中的物品选择
 * @param {number} input - 玩家输入的选项编号
 * @param {string} key - 背包分类键名
 * @param {string} label - 物品类型标签
 * @param {boolean} consume - 是否消耗（true: 使用, false: 仅选择）
 */
function handleSelectionPhase(input, key, label, consume) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const option = state.options[optionIndex];

  if (option.action === "back") {
    returnToMenu();
    return;
  }

  if (consume && state[key] && state[key][optionIndex]) {
    const item = state[key][optionIndex];
    const result = consumeItem(key, optionIndex);
    if (result) {
      let msg = `你使用了${item.name}。`;
      if (result.hunger) msg += ` 饱腹+${result.hunger}`;
      if (result.hydration) msg += ` 水分+${result.hydration}`;
      if (result.effects?.health) msg += ` 生命+${result.effects.health}`;
      if (result.effects?.infection) msg += ` 感染${result.effects.infection > 0 ? '+' : ''}${result.effects.infection}`;
      if (result.effects?.crash) msg += ` 崩溃${result.effects.crash > 0 ? '+' : ''}${result.effects.crash}`;
      setStory(msg);
      updateStatusEffects();
      checkDeath();
      returnToMenu();
    }
  }
}

/**
 * 处理主页和探索界面的操作选择
 * @param {number} input - 玩家输入的选项编号
 */
function handleChooseAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const action = state.options[optionIndex].action;

  switch (action) {
    case "sleep":
      handleSleep();
      break;
    case "eat":
      handleEatSelect();
      break;
    case "drink":
      handleDrinkSelect();
      break;
    case "medicine":
      handleMedicineSelect();
      break;
    case "equip":
      handleEquipSelect();
      break;
    case "goOut":
      if (getState().weather === "酸雨") {
        setStory("外面下着腐蚀性的酸雨，根本无法出门。");
        break;
      }
      handleGoOut();
      break;
    case "discard":
      handleDiscardSelect();
      break;
    case "save_game":
      handleSavePage();
      break;
    case "partner_harvest":
      handlePartnerHarvest();
      break;
    case "base_build":
      handleBaseBuild();
      break;
    case "upgrade_base":
      handleUpgradeBase();
      return;
    case "plant_crop":
      handlePlantCrop();
      return;
    case "view_crops":
      handleViewCrops();
      return;
    case "harvest_crops":
      handleHarvestCrops();
      return;
    case "build_warehouse":
      handleBuildWarehouse();
      return;
    case "open_warehouse":
      handleOpenWarehouse();
      return;
    case "back_to_home":
      showHomeOptions();
      return;
    case "back_to_base":
      handleBaseBuild();
      return;
    case "back_to_warehouse":
      handleOpenWarehouse();
      return;
    default:
      break;
  }
}

/**
 * 进入存档页面
 */
function handleSavePage() {
  if (getState().gameOver) return;
  setPhase("save_page");
  setStory("存档管理 - 选择一个存档槽位进行操作：\n输入对应编号选择槽位，输入 11 返回。");
  renderSaveSlotsAsOptions();
}

/**
 * 将存档槽位渲染为操作选项
 */
function renderSaveSlotsAsOptions() {
  const slots = getAllSlots();
  const opts = slots.map((slot, i) => {
    if (slot) {
      return { text: `槽位 ${i + 1}. ${slot.nickname} | 第${slot.day}天 | ${slot.timestamp}`, action: "save_slot", index: i };
    } else {
      return { text: `槽位 ${i + 1}. ——空——`, action: "save_slot", index: i };
    }
  });
  opts.push({ text: "返回", action: "back", index: -1 });
  setOptions(opts);
}

/**
 * 处理存档页面的槽位选择
 * @param {number} input - 玩家输入的选项编号
 */
function handleSavePageAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const option = state.options[optionIndex];

  if (option.action === "back") {
    returnToMenu();
    return;
  }

  const slotId = option.index;
  state._saveSlotId = slotId;
  state._saveSlotData = loadGame(slotId);

  setPhase("save_confirm");

  if (state._saveSlotData) {
    setStory(`槽位 ${slotId + 1}：${state._saveSlotData.nickname} | 第${state._saveSlotData.day}天 | ${state._saveSlotData.timestamp}\n⚠ 选择"保存覆盖"将永久覆盖此存档！`);
    setOptions([
      { text: "读取存档", action: "load" },
      { text: "保存覆盖", action: "overwrite" },
      { text: "删除存档", action: "delete" },
      { text: "返回", action: "back" }
    ]);
  } else {
    setStory(`槽位 ${slotId + 1}：空`);
    setOptions([
      { text: "保存存档到此", action: "save" },
      { text: "返回", action: "back" }
    ]);
  }
}

/**
 * 处理存档确认操作
 * @param {number} input - 玩家输入的选项编号
 */
function handleSaveConfirm(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const action = state.options[optionIndex].action;
  const slotId = state._saveSlotId;

  if (action === "back") {
    handleSavePage();
    return;
  }

  if (action === "save" || action === "overwrite") {
    const ok = saveGame(slotId, state, state.name);
    if (ok) {
      setStory(`存档已保存到槽位 ${slotId + 1}。`);
    } else {
      setStory("保存失败！");
    }
    handleSavePage();
    return;
  }

  if (action === "load") {
    const saveData = loadGame(slotId);
    if (!saveData || !saveData.gameState) {
      setStory("读取存档失败，存档数据损坏！");
      handleSavePage();
      return;
    }
    Object.assign(state, saveData.gameState);
    setStory(`存档读取成功！欢迎回来，${state.name}。`);
    setPhase("choose");
    if (state.currentMap) {
      showExploreOptionsState();
    } else {
      showHomeOptions();
    }
    return;
  }

  if (action === "delete") {
    const ok = deleteSlot(slotId);
    if (ok) {
      setStory(`槽位 ${slotId + 1} 的存档已删除。`);
    } else {
      setStory("删除失败！");
    }
    handleSavePage();
    return;
  }
}


/**
 * 处理食物消耗操作
 * @param {number} input - 玩家输入的选项编号
 */
function handleFoodAction(input) {
  handleSelectionPhase(input, "food", "食物", true);
}

/**
 * 处理饮品消耗操作
 * @param {number} input - 玩家输入的选项编号
 */
function handleDrinkAction(input) {
  handleSelectionPhase(input, "drinks", "饮品", true);
}

/**
 * 处理医疗物品使用操作
 * @param {number} input - 玩家输入的选项编号
 */
function handleMedicineAction(input) {
  handleSelectionPhase(input, "medicine", "医疗物品", true);
}

/**
 * 处理地图选择
 * @param {number} input - 玩家输入的选项编号
 */
function handleMapAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) {
    return;
  }

  const option = state.options[optionIndex];
  if (option.action === "back") {
    showHomeOptions();
    return;
  }

  const map = MAPS[option.index];
  if (!map) {
    return;
  }

  setCurrentMap(map);
  setLocation(map.name);

  // Special routing for 末日城堡
  if (map.id === "末日城堡") {
    setStory("你来到了末日城堡的大门前。");
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    if (!state.gameOver) {
      handleCastleOutpost();
    }
    return;
  }

  let entryMsg = `你已进入${map.name}。`;
  if (map.danger.includes("炼狱") || map.danger.includes("绝境")) {
    entryMsg += "\n\n⚠️ 这里的危险程度超乎你的想象……";
  } else if (map.danger.includes("高危")) {
    entryMsg += "\n\n这里看起来很危险，空气中弥漫着死亡的气息。";
  }
  setStory(entryMsg);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  showExploreOptionsState();
}

/**
 * 处理探索界面的操作选择
 * @param {number} input - 玩家输入的选项编号
 */
function handleExploreAction(input) {
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= getState().options.length) {
    return;
  }

  const action = getState().options[optionIndex].action;

  switch (action) {
    case "explore":
      handleExplore();
      break;
    case "outpost_explore":
      handleOutpostExplore();
      break;
    case "eat":
      handleEatSelect();
      break;
    case "drink":
      handleDrinkSelect();
      break;
    case "medicine":
      handleMedicineSelect();
      break;
    case "equip":
      handleEquipSelect();
      break;
    case "goHome":
      handleGoHome();
      break;
    case "discard":
      handleDiscardSelect();
      break;
    case "npc_v":
      handleNpcInteract("v");
      break;
    case "npc_xiaohan":
      handleNpcInteract("xiaohan");
      break;
    case "npc_lili":
      handleNpcInteract("lili");
      break;
    case "beg_supplies":
      handleBegSupplies();
      break;
    case "work":
      handleWork();
      break;
    case "climb_tower":
      handleClimbTower();
      break;
    case "pick_fruit":
      handlePickFruit();
      break;
    case "explore_cave":
      handleExploreCave();
      break;
    case "loot_corpse":
      handleLootCorpse();
      break;
    case "outlaw_interact":
      handleOutlawInteract();
      break;
    case "outlaw_chat":
      handleOutlawChat();
      break;
    case "outlaw_fight":
      handleOutlawFight();
      break;
    case "outlaw_leave":
      handleOutlawLeave();
      break;
    case "search_food_locker":
      handleSearchFoodLocker();
      break;
    case "mechanic_interact":
      handleMechanicInteract();
      break;
    case "mechanic_chat":
      handleMechanicChat();
      break;
    case "mechanic_trade":
      handleMechanicTrade();
      break;
    case "mechanic_trade_confirm":
      handleMechanicTradeConfirm();
      break;
    case "mechanic_leave":
      handleMechanicLeave();
      break;
    case "infected_woman":
      handleInfectedWoman();
      break;
    case "inject_woman":
      handleInjectWoman();
      break;
    case "ignore_woman":
      handleIgnoreWoman();
      break;
    case "kill_zombie_woman":
      handleKillZombieWoman();
      break;
    case "wolf_interact":
      handleWolfInteract();
      break;
    case "wolf_chat":
      handleWolfChat();
      break;
    case "wolf_leave":
      handleWolfLeave();
      break;
    case "wolf_trade":
      handleWolfTrade();
      break;
    case "explore_factory":
      handleExploreFactory();
      break;
    case "view_river":
      handleViewRiver();
      break;
    case "masked_man":
      handleMaskedManInteract();
      break;
    case "masked_man_fight":
      handleMaskedManFight();
      break;
    case "masked_man_leave":
      handleMaskedManLeave();
      break;
    case "warehouse_guard_interact":
      handleWarehouseGuardInteract();
      break;
    case "warehouse_guard_chat":
      handleWarehouseGuardChat();
      break;
    case "warehouse_guard_leave":
      handleWarehouseGuardLeave();
      break;
    case "warehouse_guard_trade":
      handleWarehouseGuardTrade();
      break;
    case "warehouse_guard_trade_confirm":
      handleWarehouseGuardTradeConfirm();
      break;
    case "nurse_zombie_interact":
      handleNurseZombieInteract();
      break;
    case "nurse_zombie_feed":
      handleNurseZombieFeedSelect();
      break;
    case "nurse_zombie_bring_home":
      handleNurseZombieBringHome();
      break;
    case "nurse_zombie_leave":
      handleNurseZombieLeave();
      break;
    case "police_raid":
      handlePoliceRaid();
      break;
    case "veteran_interact":
      handleVeteranInteract();
      break;
    case "veteran_chat":
      handleVeteranChat();
      break;
    case "veteran_ammo":
      handleVeteranAmmo();
      break;
    case "veteran_leave":
      handleVeteranLeave();
      break;
    case "explore_tunnel":
      handleExploreTunnel();
      break;
    case "doctor_interact":
      handleDoctorInteract();
      break;
    case "doctor_trade":
      handleDoctorTrade();
      break;
    case "doctor_chat":
      handleDoctorChat();
      break;
    case "doctor_leave":
      handleDoctorLeave();
      break;
    case "zombie_king_interact":
      handleZombieKingInteract();
      break;
    case "castle_explore_blocked":
      handleCastleExploreBlocked();
      break;
    case "castle_guard":
      handleCastleGuard();
      break;
    case "castle_bank":
      handleCastleBank();
      break;
    case "castle_identity":
      handleCastleIdentity();
      break;
    case "castle_work":
      handleCastleWork();
      break;
    case "leave_castle":
      handleLeaveCastle();
      break;
    case "guard_chat":
      handleGuardChat();
      break;
    case "guard_enter":
      handleGuardEnter();
      break;
    case "guard_bribe":
      handleGuardBribe();
      break;
    case "guard_leave":
      handleGuardLeave();
      break;
    case "castle_interior_explore":
      handleCastleInteriorExplore();
      break;
    case "leave_castle_interior":
      handleLeaveCastleInterior();
      break;
    case "castle_king":
      handleCastleKing();
      break;
    case "castle_queen":
      handleCastleQueen();
      break;
    case "castle_banquet":
      handleCastleBanquet();
      break;
    case "castle_ball":
      handleCastleBall();
      break;
    case "castle_room":
      handleCastleRoom();
      break;
    case "identity_apply":
      handleIdentityApply();
      break;
    case "identity_cancel":
      handleIdentityCancel();
      break;
    case "identity_leave":
      handleCastleOutpost();
      break;
    case "bank_loan":
      handleBankLoan();
      break;
    case "bank_repay":
      handleBankRepay();
      break;
    case "bank_banker":
      handleBankBanker();
      break;
    case "bank_leave":
      handleCastleOutpost();
      break;
    case "banker_mercy":
      handleBankerMercy();
      break;
    case "banker_fight":
      handleBankerFight();
      break;
    case "banker_leave":
      handleCastleOutpost();
      break;
    case "npc_leader":
      handleNpcLeader();
      break;
    case "leader_chat":
      handleLeaderChat();
      break;
    case "leader_gift":
      handleLeaderGift();
      break;
    case "leader_join":
      handleLeaderJoin();
      break;
    case "leader_quit":
      handleLeaderQuit();
      break;
    case "leader_claim":
      handleLeaderClaim();
      break;
    case "leader_leave":
      showOutpostOptions();
      break;
    case "leader_do_gift":
      handleLeaderDoGift(input);
      break;
    case "back_to_leader":
      showLeaderOptions();
      break;
    default:
      break;
  }
}

export { handleSavePage, handleBaseBuild, handleGoHome, handleEatSelect, handleDrinkSelect, handleMedicineSelect };
export function handleAction(input) {
  const state = getState();

  if (input < 1) {
    return;
  }

  const phase = state.phase;

  switch (phase) {
    case "choose":
      handleChooseAction(input);
      break;
    case "save_page":
      handleSavePageAction(input);
      break;
    case "save_confirm":
      handleSaveConfirm(input);
      break;
    case "base_build":
      handleBaseBuildAction(input);
      break;
    case "eat_select":
      handleFoodAction(input);
      break;
    case "drink_select":
      handleDrinkAction(input);
      break;
    case "medicine_select":
      handleMedicineAction(input);
      break;
    case "map_select":
      handleMapAction(input);
      break;
    case "explore":
      handleExploreAction(input);
      break;
    case "pre_combat":
      handlePreCombatChoice(input);
      break;
    case "pre_combat_npc":
      handlePreCombatNpcChoice(input);
      break;
    case "survivor_interact":
      handleSurvivorAction(input);
      break;
    case "trader_interact":
      handleWanderingTraderAction(input);
      break;
    case "trader_buy_ammo":
      handleTraderBuyAmmo(input);
      break;
    case "trader_buy_weapon":
      handleTraderBuyWeapon(input);
      break;
    case "doctor_interact":
      handleDoctorAction(input);
      break;
    case "npc_interact":
      handleNpcAction(input);
      break;
    case "repair_select":
      handleRepairConfirm(input);
      break;
    case "repair_bow_select":
      handleRepairBowConfirm(input);
      break;
    case "npc_chat":
      if (input === 1) {
        const npcId = getState()._currentNpc;
        handleNpcInteract(npcId);
      }
      break;
    case "npc_gift": {
      const s = getState();
      const checkItem = s.options[input - 1];
      if (checkItem && checkItem.giftItem && checkItem.giftItem.isRecycle) {
        handleRecycleConfirm(input);
      } else if (checkItem && checkItem.giftItem && checkItem.giftItem.isRecycleRanged) {
        handleRecycleRangedConfirm(input);
      } else {
        handleNpcGiftConfirm(input);
      }
      break;
    }
    case "npc_quest_confirm":
      handleNpcQuestConfirm(input);
      break;
    case "equip_select":
      handleEquipSubAction(input);
      break;
    case "melee_equip":
      handleMeleeEquipAction(input);
      break;
    case "ranged_equip":
      handleRangedEquipAction(input);
      break;
    case "ammo_load":
      handleAmmoLoadAction(input);
      break;
    case "discard_select":
      handleDiscardAction(input);
      break;
    case "trade_choice":
      handleTradeChoice(input);
      break;
    case "trade_input":
      handleTradeInput(input);
      break;
    case "nurse_feed":
      handleNurseZombieFeedConfirm(input);
      break;
    case "base_upgrade_confirm":
      if (input === 1) handleConfirmUpgrade();
      else handleBaseBuild();
      break;
    case "warehouse_upgrade_confirm":
      if (input === 1) handleConfirmWarehouse();
      else handleBaseBuild();
      break;
    case "warehouse_menu":
      handleWarehouseMenuAction(input);
      break;
    case "warehouse_deposit_select":
      handleDoDeposit(input);
      break;
    case "warehouse_withdraw_select":
      handleDoWithdraw(input);
      break;
    case "game_over":
      if (input === 1) {
        updateBestRecord(state);
        resetState();
        showHomeOptions();
      }
      break;
    case "castle_guard":
      handleCastleGuardAction(input);
      break;
    case "castle_bank":
      handleCastleBankAction(input);
      break;
    case "castle_identity":
      handleCastleIdentityAction(input);
      break;
    case "castle_interior":
      handleCastleInteriorAction(input);
      break;
    case "castle_loan_input":
      handleLoanSubmit(input);
      break;
    case "castle_banker":
      handleCastleBankerAction(input);
      break;
    case "npc_leader":
      handleExploreAction(input);
      break;
    case "leader_gift_select":
      handleLeaderDoGift(input);
      break;
    case "npc_v":
    case "npc_xiaohan":
    case "npc_lili":
      handleNpcAction(input);
      break;
    case "npc_recycle":
      handleRecycleConfirm(input);
      break;
    case "npc_recycle_ranged":
      handleRecycleRangedConfirm(input);
      break;
    case "npc_repair":
      handleRepairConfirm(input);
      break;
    case "npc_repair_bow":
      handleRepairBowConfirm(input);
      break;
    case "npc_cure": {
      const optIdx = input - 1;
      const s = getState();
      if (optIdx >= 0 && optIdx < s.options.length) {
        const opt = s.options[optIdx];
        if (opt.action === "cure_confirm") {
          handleCureConfirm();
        } else {
          handleNpcAction("chat");
        }
      }
      break;
    }
    case "npc_quest": {
      const qIdx = input - 1;
      const qs = getState();
      if (qIdx >= 0 && qIdx < qs.options.length) {
        const qAction = qs.options[qIdx].action;
        if (qAction === "quest_confirm") {
          handleNpcQuestConfirm(input);
        } else if (qAction === "quest_preview") {
          handleNpcQuestPreview();
        } else {
          handleNpcAction("chat");
        }
      }
      break;
    }
    case "npc_quest_preview": {
      const qpIdx = input - 1;
      const qps = getState();
      if (qpIdx >= 0 && qpIdx < qps.options.length) {
        const qpAction = qps.options[qpIdx].action;
        if (qpAction === "quest_confirm") {
          handleNpcQuestConfirm(input);
        } else {
          handleNpcQuest();
        }
      }
      break;
    }
    case "map_npc":
      handleMapNpcsAction(input);
      break;
    case "map_npc_trade":
      handleMapNpcTrade(input);
      break;
    case "v_trade":
      handleVTrade(input);
      break;
    case "v_trade_result":
      handleVTradeConfirm(input);
      break;
    case "xiaohan_trade":
      handleXiaohanTrade(input);
      break;
    case "lili_trade":
      handleLiliTrade(input);
      break;
    default:
      break;
  }
}