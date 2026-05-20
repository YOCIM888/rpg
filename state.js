/* ============================================================
   游戏状态管理模块
   组织顺序：导入 → 常量 → 初始状态 → 状态访问器
   → 生存属性（时间/饥饿/水分）→ 背包/物品/货物
   → 装备（近战/远程/弹药）→ 状态检查 → NPC 好感度/任务
   ============================================================ */
 
import { TIME_PHASES, MELEE_WEAPONS, FOODS, DRINKS, BACKPACK_TYPES, AFFINITY_THRESHOLDS, AFFINITY_MAX, GAME_CONSTANTS, DEFAULT_ITEM_IDS, GAME_INTRO, SEEDS, AMMO } from './config.js';

// ---------- 初始状态 ----------

const INITIAL_STATE = {
  name: "",
  day: 1,
  phaseIndex: 0,
  location: "幸存者帐篷",
  health: GAME_CONSTANTS.MAX_HEALTH,
  crash: 0,
  crashTurns: 0,
  infection: 0,
  hunger: 100,
  hydration: 100,
  status: "正常",
  currentMap: null,
  meleeWeapon: { ...MELEE_WEAPONS.find(w => w.id === DEFAULT_ITEM_IDS.melee), currentDurability: MELEE_WEAPONS.find(w => w.id === DEFAULT_ITEM_IDS.melee).durability },
  rangedWeapon: null,
  ammo: [],
  backpack: { ...BACKPACK_TYPES.口袋 },
  food: [{ ...FOODS.find(f => f.id === DEFAULT_ITEM_IDS.food) }],
  drinks: [{ ...DRINKS.find(d => d.id === DEFAULT_ITEM_IDS.drink) }],
  medicine: [],
  other: [],
  cigarettes: 0,
  royalCoins: 0,
  seeds: [],
  npcAffinity: { v: 0, xiaohan: 0, lili: 0, nurseZombie: 0, leader: 0, mumiao: 0, yumo: 0, guyue: 0, linhan: 0 },
  npcQuestsDone: { v1: false, v2: false, v3: false, v4: false, v5: false, v6: false, xh0: false, xh1: false, xh2: false, xh3: false, xh4: false, xh5: false, llGift: false, mumiaoSecret: false, mumiaoQuest1: false, mumiaoQuest2: false, mumiaoQuest3: false, leaderQuest1: false, leaderQuest2: false, leaderQuest3: false, queenQuest1: false, queenQuest2: false, queenQuest3: false, queenQuest4: false, yumoQuest1: false, yumoQuest2: false, yumoQuest3: false, yumoQuest4: false, yumoQuest5: false },
  lastBegDay: 0,
  lastClimbDay: 0,
  lastPickFruitDay: 0,
  lastCaveDay: 0,
  lastMoldySeedsDay: 0,
  lastAbandonedFieldDay: 0,
  lastLootCorpseDay: 0,
  lastFactoryExploreDay: 0,
  lastViewRiverDay: 0,
  outlawKilled: false,
  hasEatenStrangeMeat: false,
  maSanQuest1Done: false,
  maSanQuest2Done: false,
  maSanQuest3Done: false,
  maSanQuest4Done: false,
  liuruyanRescued: false,
  liuruyanDiscovered: false,
  liuruyanQuest1Done: false,
  liuruyanQuest2Done: false,
  liuruyanQuest3Done: false,
  liuruyanQuest4Done: false,
  gasoline: 0,
  nurseZombieRescued: false,
  lastPartnerHarvestDay: 0,
  lastNurseHarvestDay: 0,
  lastMumiaoTendDay: 0,
  tombstoneDug: false,
  tentSearched: false,
  lastVTradeDay: 0,
  lastLiliTradeDay: 0,
  lastXiaohanTradeDay: 0,
  zombieKingDefeated: false,
  doctorTradeDone: false,
  baseLevel: 0,
  warehouseLevel: 0,
  warehouse: [],
  crops: Array(GAME_CONSTANTS.BASE.FARMING_CROP_SLOTS).fill(null),
  weather: "晴天",
  castleDebt: null,
  islandDebt: null,
  islandDebtTriggered: false,
  castleDebtTriggered: false,
  investment: null,
  bankerKilled: false,
  currentSubMap: null,
  lastBanquetDay: 0,
  lastBallDay: 0,
  highestCastleRank: 0,
  kingQuestsDone: { king_1: false, king_2: false, king_3: false, king_4: false, king_5: false },
  castleRankObtained: { viscount: false, count: false, marquis: false, duke: false, crown_prince: false },
  lastSalaryDay: 0,
  lastTreatmentDay: 0,
  lastMeetingDay: 0,
  lastGardenDay: 0,
  lastCastleWorkDay: 0,
  leaderAlive: true,
  giantPuppetDefeated: false,
  doctorQuest1Accepted: false,
  doctorQuest1Done: false,
  doctorQuest2Done: false,
  doctorQuest3Done: false,
  undergroundKeyObtained: false,
  generatorObtained: false,
  rocketRepaired: false,
  doctorLeftInEnding8: false,
  yumoDivingKills: 0,
  fishingCount: 0,
  lastEnergyWellDay: 0,
  lastImprovedSerumDay: 0,
  lastLeaderChatDay: 0,
  lastLeaderGiftDay: 0,
  leaderGiftClaimed: false,
  stats: {
    zombieKills: 0,
    mapsExplored: [],
    bossesDefeated: [],
    maxBaseLevel: 0,
    companionsRecruited: 0,
    totalTrades: 0,
    totalCigarettesEarned: 0,
  },
  unlockedAchievements: [],
  unlockedEndings: [],
  _playerDied: false,
  npcChatCount: { v: 0, xiaohan: 0, lili: 0, nurseZombie: 0, leader: 0, mumiao: 0, yumo: 0, guyue: 0, linhan: 0 },
  lastChatDay: 0,
  story: GAME_INTRO,
  options: [
    { text: "睡觉", action: "sleep" },
    { text: "进食", action: "eat" },
    { text: "饮水", action: "drink" },
    { text: "医疗", action: "medicine" },
    { text: "装备", action: "equip" },
    { text: "出门", action: "goOut" },
    { text: "丢弃", action: "discard" },
    { text: "存档", action: "save_game" },
    { text: "伙伴收获", action: "partner_harvest" },
    { text: "基地建设", action: "base_build" },
    { text: "生存笔记", action: "survival_notes" },
    { text: "返回菜单", action: "back_to_main_menu" },],
  phase: "choose",
  gameOver: false,
  combatState: null,
};

let gameState = JSON.parse(JSON.stringify(INITIAL_STATE));

// 内部工具：将值限制在 [min, max] 范围内
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function isStackableType(item) {
  const stackableTypes = new Set(["food", "fruit", "drink", "drinks", "medicine", "building", "seed", "fish"]);
  return stackableTypes.has(item.type);
}

export function getStackableCount(arr) {
  return arr.reduce((sum, item) => sum + (item.count || 1), 0);
}

export function getItemDisplayName(item) {
  if (isStackableType(item) && (item.count || 1) > 1) {
    return `${item.count}${item.name}`;
  }
  return item.name;
}

// ---------- 状态访问器 ----------

/** 获取当前游戏状态对象的引用 */
export function getState() {
  return gameState;
}

/** 将游戏状态重置为初始值 */
export function resetState() {
  gameState = JSON.parse(JSON.stringify(INITIAL_STATE));
}

/** 设置玩家角色名称 */
export function setName(name) {
  gameState.name = name;
}

// ---------- 生存属性（时间/饥饿/水分）----------

/** 时间推进指定步数，同时更新饥饿、水分和崩溃值 */
export function advanceTime(steps = 1) {
  const messages = [];

  gameState.phaseIndex += steps;

  gameState.crashTurns += steps;
  while (gameState.crashTurns >= GAME_CONSTANTS.SURVIVAL.CRASH_THRESHOLD_TURNS) {
    gameState.crashTurns -= GAME_CONSTANTS.SURVIVAL.CRASH_THRESHOLD_TURNS;
    if (gameState.crash < GAME_CONSTANTS.CRASH_MAX) {
      gameState.crash = Math.min(gameState.crash + GAME_CONSTANTS.SURVIVAL.CRASH_PER_CYCLE, GAME_CONSTANTS.CRASH_MAX);
      messages.push(`你已经太久没睡觉了，精神状态越来越差！崩溃+${GAME_CONSTANTS.SURVIVAL.CRASH_PER_CYCLE}%`);
    }
  }

  while (gameState.phaseIndex >= TIME_PHASES.length) {
    gameState.day++;
    gameState.phaseIndex -= TIME_PHASES.length;
    generateWeather();
    messages.push(`新的一天开始了！第 ${gameState.day} 天`);
    for (const entry of GAME_CONSTANTS.ACHIEVEMENTS.SURVIVAL_DAYS) {
      if (gameState.day === entry.threshold) {
        if (!gameState.unlockedAchievements) gameState.unlockedAchievements = [];
        if (!gameState.unlockedAchievements.includes(entry.id)) gameState.unlockedAchievements.push(entry.id);
      }
    }
  }

  gameState.hunger = clamp(gameState.hunger - GAME_CONSTANTS.SURVIVAL.HUNGER_DECAY * steps, 0, 100);
  gameState.hydration = clamp(gameState.hydration - GAME_CONSTANTS.SURVIVAL.HYDRATION_DECAY * steps, 0, 100);

  applyWeatherEffects(steps);

  for (let i = 0; i < gameState.crops.length; i++) {
    if (gameState.crops[i] !== null && gameState.crops[i].matureTurns > 0) {
      gameState.crops[i].matureTurns--;
    }
  }

  return messages;
}

/** 重置崩溃计时器（睡觉后调用） */
export function resetCrashTurns() {
  gameState.crashTurns = 0;
}

// ---------- 背包/物品 ----------

/** 向背包中添加物品，返回是否添加成功 */
export function addItem(item) {
  if (item.type === "cigarette") {
    gameState.cigarettes += (item.count || 1);
    return true;
  }

  if (item.type === "royal_coin") {
    gameState.royalCoins += (item.count || 1);
    return true;
  }

  if (item.type === "gasoline") {
    gameState.gasoline += (item.count || 1);
    return true;
  }

  if (item.type === "ammo") {
    const existing = gameState.ammo.find((a) => a.id === item.id);
    const count = item.count ?? 1;
    if (existing) {
      existing.count += count;
    } else {
      gameState.ammo.push({ id: item.id, name: item.name, count });
    }
    return true;
  }

  const totalItems =
    getStackableCount(gameState.food) +
    getStackableCount(gameState.drinks) +
    getStackableCount(gameState.medicine) +
    getStackableCount(gameState.other) +
    getStackableCount(gameState.seeds);

  if (totalItems >= gameState.backpack.capacity) {
    return false;
  }

  const typeMap = {
    food: gameState.food,
    fruit: gameState.food,
    drink: gameState.drinks,
    drinks: gameState.drinks,
    medicine: gameState.medicine,
    seed: gameState.seeds,
  };

  const target = typeMap[item.type] || gameState.other;

  if (isStackableType(item)) {
    const existing = target.find((i) => i.id === item.id);
    if (existing) {
      existing.count = (existing.count || 1) + (item.count || 1);
    } else {
      target.push({ ...item, count: item.count || 1 });
    }
  } else {
    target.push(item);
  }

  return true;
}

/** 从背包中移除指定类型和索引的物品，返回被移除的物品 */
export function removeItem(type, index, count = 1) {
  if (type === "cigarette") {
    const removed = Math.min(count, gameState.cigarettes);
    gameState.cigarettes -= removed;
    return { type: "cigarette", name: "香烟", count: removed };
  }

  if (type === "gasoline") {
    const removed = Math.min(count, gameState.gasoline);
    gameState.gasoline -= removed;
    return { type: "gasoline", name: "汽油", count: removed };
  }

  const typeMap = {
    food: gameState.food,
    fruit: gameState.food,
    drink: gameState.drinks,
    drinks: gameState.drinks,
    medicine: gameState.medicine,
    seed: gameState.seeds,
    other: gameState.other,
  };

  const target = typeMap[type];
  if (!target || index < 0 || index >= target.length) {
    return null;
  }

  const item = target[index];

  if (isStackableType(item) && (item.count || 1) > count) {
    item.count = (item.count || 1) - count;
    return { ...item, count };
  }

  return target.splice(index, 1)[0];
}

export function removeItemById(type, itemId, count = 1) {
  const typeMap = {
    food: gameState.food,
    fruit: gameState.food,
    drink: gameState.drinks,
    drinks: gameState.drinks,
    medicine: gameState.medicine,
    seed: gameState.seeds,
    other: gameState.other,
  };

  const target = typeMap[type];
  if (!target) return null;

  let remaining = count;
  for (let i = target.length - 1; i >= 0 && remaining > 0; i--) {
    if (target[i].id === itemId) {
      const item = target[i];
      const available = item.count || 1;
      if (isStackableType(item) && available > remaining) {
        item.count = available - remaining;
        remaining = 0;
      } else {
        remaining -= available;
        target.splice(i, 1);
      }
    }
  }
  return remaining <= 0;
}

/** 消耗背包中指定物品并应用其效果 */
export function consumeItem(type, index) {
  const typeMap = {
    food: gameState.food,
    fruit: gameState.food,
    drink: gameState.drinks,
    drinks: gameState.drinks,
    medicine: gameState.medicine,
    seed: gameState.seeds,
    other: gameState.other,
  };

  const target = typeMap[type];
  if (!target || index < 0 || index >= target.length) {
    return null;
  }

  const item = target[index];
  let consumed;

  if (isStackableType(item) && (item.count || 1) > 1) {
    item.count = (item.count || 1) - 1;
    consumed = { ...item, count: 1 };
  } else {
    consumed = target.splice(index, 1)[0];
  }

  if (consumed.hunger) {
    gameState.hunger = clamp(gameState.hunger + consumed.hunger, 0, 100);
  }

  if (consumed.hydration) {
    gameState.hydration = clamp(gameState.hydration + consumed.hydration, 0, 100);
  }

  if (consumed.health) {
    gameState.health = clamp(gameState.health + consumed.health, 0, GAME_CONSTANTS.MAX_HEALTH);
  }

  if (consumed.effects) {
    if (consumed.effects.infection != null) {
      gameState.infection = clamp(gameState.infection + consumed.effects.infection, 0, 100);
    }
    if (consumed.effects.crash != null) {
      gameState.crash = clamp(gameState.crash + consumed.effects.crash, 0, 100);
    }
    if (consumed.effects.hunger != null) {
      gameState.hunger = clamp(gameState.hunger + consumed.effects.hunger, 0, 100);
    }
    if (consumed.effects.hydration != null) {
      gameState.hydration = clamp(gameState.hydration + consumed.effects.hydration, 0, 100);
    }
    if (consumed.effects.health != null) {
      gameState.health = clamp(gameState.health + consumed.effects.health, 0, GAME_CONSTANTS.MAX_HEALTH);
    }
  }

  return consumed;
}

// ---------- 装备（近战/远程/弹药）----------

/** 装备近战武器，返回装备的武器信息 */
export function equipMelee(itemId) {
  if (itemId === DEFAULT_ITEM_IDS.melee) {
    if (gameState.meleeWeapon.id !== DEFAULT_ITEM_IDS.melee) {
      gameState.other.push(gameState.meleeWeapon);
    }
    gameState.meleeWeapon = { ...MELEE_WEAPONS.find(w => w.id === DEFAULT_ITEM_IDS.melee), currentDurability: MELEE_WEAPONS.find(w => w.id === DEFAULT_ITEM_IDS.melee).durability };
    return gameState.meleeWeapon;
  }

  const index = gameState.other.findIndex(
    (item) => item.id === itemId && item.type === "melee"
  );

  if (index === -1) {
    return null;
  }

  const newWeapon = gameState.other.splice(index, 1)[0];

  if (gameState.meleeWeapon.id !== DEFAULT_ITEM_IDS.melee) {
    gameState.other.push(gameState.meleeWeapon);
  }

  gameState.meleeWeapon = newWeapon;
  return gameState.meleeWeapon;
}

/** 装备远程武器，返回装备的武器信息 */
export function equipRanged(itemId) {
  const index = gameState.other.findIndex(
    (item) => item.id === itemId && item.type === "ranged"
  );

  if (index === -1) {
    return null;
  }

  const newWeapon = gameState.other.splice(index, 1)[0];

  if (gameState.rangedWeapon) {
    gameState.other.push(gameState.rangedWeapon);
  }

  gameState.rangedWeapon = newWeapon;
  return gameState.rangedWeapon;
}

/** 向弹药槽中添加指定类型和数量的弹药 */
export function addAmmo(ammoId, count) {
  if (!count || count <= 0) return;
  const existing = gameState.ammo.find((a) => a.id === ammoId);
  if (existing) {
    existing.count += count;
  } else {
    const ammoDef = AMMO.find(a => a.id === ammoId);
    const name = ammoDef ? ammoDef.name : ammoId;
    gameState.ammo.push({ id: ammoId, name, count });
  }
}

/** 消耗一枚指定类型的弹药，返回是否消耗成功 */
export function useAmmo(ammoId) {
  const existing = gameState.ammo.find((a) => a.id === ammoId);
  if (!existing || existing.count <= 0) {
    return false;
  }

  existing.count--;
  if (existing.count <= 0) {
    gameState.ammo = gameState.ammo.filter((a) => a.id !== ammoId);
  }
  return true;
}

/** 减少当前近战武器耐久度，返回武器损坏提示或 null */
export function reduceMeleeDurability() {
  if (gameState.meleeWeapon.currentDurability === Infinity) {
    return null;
  }

  gameState.meleeWeapon.currentDurability -= 1;

  if (gameState.meleeWeapon.currentDurability <= 0) {
    const brokenName = gameState.meleeWeapon.name;
    gameState.meleeWeapon = { ...MELEE_WEAPONS.find(w => w.id === DEFAULT_ITEM_IDS.melee), currentDurability: MELEE_WEAPONS.find(w => w.id === DEFAULT_ITEM_IDS.melee).durability };
    return `${brokenName} 已经损坏，你只能用${MELEE_WEAPONS.find(w => w.id === DEFAULT_ITEM_IDS.melee).name}了。`;
  }

  return null;
}

/** 减少当前远程武器完整性，返回武器损坏提示或 null */
export function reduceRangedIntegrity() {
  if (!gameState.rangedWeapon) {
    return null;
  }

  gameState.rangedWeapon.integrity -= GAME_CONSTANTS.COMBAT.RANGED_INTEGRITY_LOSS;

  if (gameState.rangedWeapon.integrity <= 0) {
    const brokenName = gameState.rangedWeapon.name;
    gameState.rangedWeapon = null;
    return `${brokenName} 已经损坏，无法再使用。`;
  }

  return null;
}

// ---------- 状态检查 ----------

/** 检查玩家是否死亡，返回是否已死亡 */
export function checkDeath() {
  if (gameState.health <= 0 || gameState.infection >= GAME_CONSTANTS.INFECTION_MAX) {
    gameState._playerDied = true;
    gameState.gameOver = true;
    return true;
  }
  return false;
}

/** 根据当前饥饿/水分/感染/崩溃状态更新玩家状态并返回提示消息 */
export function updateStatusEffects() {
  const messages = [];

  if (gameState.hunger <= 0) {
    gameState.health = clamp(gameState.health - GAME_CONSTANTS.SURVIVAL.STARVATION_DAMAGE, 0, GAME_CONSTANTS.MAX_HEALTH);
    messages.push("你极度饥饿，生命值下降！");
  }
  if (gameState.hydration <= 0) {
    gameState.health = clamp(gameState.health - GAME_CONSTANTS.SURVIVAL.STARVATION_DAMAGE, 0, GAME_CONSTANTS.MAX_HEALTH);
    messages.push("你极度口渴，生命值下降！");
  }

  const statusList = [];

  if (gameState.hunger <= 0) {
    statusList.push("饥饿");
  }
  if (gameState.hydration <= 0) {
    statusList.push("口渴");
  }
  if (gameState.infection > GAME_CONSTANTS.SURVIVAL.INFECTION_THRESHOLD) {
    statusList.push("感染");
    messages.push("你感到身体在被病毒侵蚀……");
  }
  if (gameState.crash > GAME_CONSTANTS.SURVIVAL.CRASH_STATUS_THRESHOLD) {
    statusList.push("崩溃");
    messages.push("你的精神濒临崩溃……");
  }
  if (gameState.health < GAME_CONSTANTS.SURVIVAL.SEVERE_INJURY_THRESHOLD) {
    statusList.push("重伤");
    messages.push("你身受重伤，需要尽快治疗！");
  }

  if (statusList.length > 0) {
    gameState.status = statusList.join("·");
  } else {
    gameState.status = "正常";
  }

  return messages;
}

// ---------- NPC 好感度/任务 ----------

/**
 * 增加指定 NPC 的好感度（最大 150）
 * @param {string} npcId - NPC 标识：v/xiaohan/lili
 * @param {number} amount - 增加的好感度数值
 * @returns {number} 新的好感度值
 */
export function addNpcAffinity(npcId, amount) {
  if (gameState.npcAffinity[npcId] !== undefined) {
    gameState.npcAffinity[npcId] = clamp(gameState.npcAffinity[npcId] + amount, 0, AFFINITY_MAX[npcId] ?? 200);
  }
  return gameState.npcAffinity[npcId] || 0;
}

/**
 * 获取指定 NPC 的当前好感度
 * @param {string} npcId - NPC 标识
 * @returns {number} 好感度值
 */
export function getNpcAffinity(npcId) {
  return gameState.npcAffinity[npcId] || 0;
}

/**
 * 根据好感度数值返回对应的关系称谓
 * @param {number} affinity - 好感度（0-150）
 * @returns {string} 关系称谓
 */
export function getAffinityLabel(affinity) {
  for (const t of AFFINITY_THRESHOLDS) {
    if (affinity >= t.min) return t.label;
  }
  return "陌生人";
}

/**
 * 判断今天是否还可以乞讨物资
 * @returns {boolean}
 */
export function canBegToday() {
  return gameState.lastBegDay < gameState.day;
}

/**
 * 标记当天已乞讨过物资
 */
export function markBegDone() {
  gameState.lastBegDay = gameState.day;
}

/**
 * 检查今天是否还可以与指定NPC对话
 * @param {string} npcId - NPC 标识
 * @param {number} maxChats - 每日最大对话次数，默认为4
 * @returns {boolean}
 */
export function canChatToday(npcId, maxChats = GAME_CONSTANTS.NPC.DAILY_CHAT_LIMIT) {
  if (gameState.lastChatDay < gameState.day) {
    resetChatCounts();
  }
  return gameState.npcChatCount[npcId] < maxChats;
}

/**
 * 增加与指定NPC的对话次数
 * @param {string} npcId - NPC 标识
 */
export function incrementChatCount(npcId) {
  if (gameState.lastChatDay < gameState.day) {
    resetChatCounts();
  }
  if (gameState.npcChatCount[npcId] !== undefined) {
    gameState.npcChatCount[npcId]++;
  }
}

/**
 * 重置所有NPC的对话计数（新的一天）
 */
export function resetChatCounts() {
  gameState.lastChatDay = gameState.day;
  gameState.npcChatCount = { v: 0, xiaohan: 0, lili: 0, nurseZombie: 0, leader: 0, mumiao: 0, yumo: 0, guyue: 0, linhan: 0 };
  gameState.fishingCount = 0;
}

/**
 * 获取今天与指定NPC的对话次数
 * @param {string} npcId - NPC 标识
 * @returns {number}
 */
export function getChatCount(npcId) {
  if (gameState.lastChatDay < gameState.day) {
    resetChatCounts();
  }
  return gameState.npcChatCount[npcId] || 0;
}

/**
 * 获取好感度阶段
 * @param {number} affinity - 好感度
 * @returns {string} 阶段名称
 */
export function getAffinityStage(affinity) {
  for (const t of AFFINITY_THRESHOLDS) {
    if (affinity >= t.min) return t.stage;
  }
  return "stranger";
}

/**
 * 检查指定任务是否已完成
 * @param {string} questId - 任务 ID（v1/v2/v3/v4/xh1/xh2/llGift）
 * @returns {boolean}
 */
export function isQuestDone(questId) {
  return !!gameState.npcQuestsDone[questId];
}

/**
 * 标记指定任务为已完成
 * @param {string} questId - 任务 ID
 */
export function markQuestDone(questId) {
  if (gameState.npcQuestsDone[questId] !== undefined) {
    gameState.npcQuestsDone[questId] = true;
  }
}

// ---------- 界面辅助 ----------

/** 设置当前位置描述 */
export function setLocation(location) {
  gameState.location = location;
}

/** 设置当前探索地图 */
export function setCurrentMap(map) {
  gameState.currentMap = map;
}

/** 设置当前游戏阶段 */
export function setPhase(phase) {
  gameState.phase = phase;
}

/** 设置当前剧情文本 */
export function setStory(text) {
  gameState.story = text;
}

/** 设置当前可选操作列表 */
export function setOptions(options) {
  gameState.options = options;
}

/** 获取当前背包已占用格数 */
export function getBackpackCount() {
  return (
    getStackableCount(gameState.food) +
    getStackableCount(gameState.drinks) +
    getStackableCount(gameState.medicine) +
    getStackableCount(gameState.other) +
    getStackableCount(gameState.seeds)
  );
}

export function addCigarettes(count) {
  gameState.cigarettes += count;
}

export function addRoyalCoins(count) {
  gameState.royalCoins += count;
}

export function removeCigarettes(count) {
  const removed = Math.min(count, gameState.cigarettes);
  gameState.cigarettes -= removed;
  return removed;
}

export function removeRoyalCoins(count) {
  const removed = Math.min(count, gameState.royalCoins);
  gameState.royalCoins -= removed;
  return removed;
}

export function addGasoline(count) {
  gameState.gasoline += count;
}

export function removeGasoline(count) {
  const removed = Math.min(count, gameState.gasoline);
  gameState.gasoline -= removed;
  return removed;
}

/**
 * 标准化游戏状态，确保所有必要字段都存在
 * @param {Object} state - 游戏状态对象
 */
export function normalizeState(state) {
  if (state.meleeWeapon && state.meleeWeapon.currentDurability == null) {
    state.meleeWeapon.currentDurability = state.meleeWeapon.durability === Infinity 
      ? Infinity 
      : (state.meleeWeapon.durability || 0);
  }

  // 标准化背包中其他物品栏里的近战武器
  if (state.other && Array.isArray(state.other)) {
    state.other.forEach(item => {
      if (item && item.type === "melee" && item.currentDurability == null) {
        item.currentDurability = item.durability === Infinity 
          ? Infinity 
          : (item.durability || 0);
      }
    });
  }

  // 确保其他必要字段存在
  if (state.npcChatCount === undefined) {
    state.npcChatCount = { v: 0, xiaohan: 0, lili: 0, nurseZombie: 0, leader: 0 };
  }
  if (state.lastChatDay === undefined) {
    state.lastChatDay = 0;
  }
  if (state.npcQuestsDone) {
    if (state.npcQuestsDone.v5 === undefined) state.npcQuestsDone.v5 = false;
    if (state.npcQuestsDone.v6 === undefined) state.npcQuestsDone.v6 = false;
    if (state.npcQuestsDone.xh0 === undefined) state.npcQuestsDone.xh0 = false;
    if (state.npcQuestsDone.xh3 === undefined) state.npcQuestsDone.xh3 = false;
    if (state.npcQuestsDone.xh4 === undefined) state.npcQuestsDone.xh4 = false;
    if (state.npcQuestsDone.xh5 === undefined) state.npcQuestsDone.xh5 = false;
    if (state.npcQuestsDone.llGift === undefined) state.npcQuestsDone.llGift = false;
  }
  if (state.lastClimbDay === undefined) state.lastClimbDay = 0;
  if (state.lastPickFruitDay === undefined) state.lastPickFruitDay = 0;
  if (state.lastCaveDay === undefined) state.lastCaveDay = 0;
  if (state.lastMoldySeedsDay === undefined) state.lastMoldySeedsDay = 0;
  if (state.lastAbandonedFieldDay === undefined) state.lastAbandonedFieldDay = 0;
  if (state.lastLootCorpseDay === undefined) state.lastLootCorpseDay = 0;
  if (state.outlawKilled === undefined) state.outlawKilled = false;
  if (state.hasEatenStrangeMeat === undefined) state.hasEatenStrangeMeat = false;
  if (state.maSanQuest1Done === undefined) state.maSanQuest1Done = false;
  if (state.maSanQuest2Done === undefined) state.maSanQuest2Done = false;
  if (state.maSanQuest3Done === undefined) state.maSanQuest3Done = false;
  if (state.maSanQuest4Done === undefined) state.maSanQuest4Done = false;
  if (state.liuruyanRescued === undefined) state.liuruyanRescued = false;
  if (state.liuruyanDiscovered === undefined) state.liuruyanDiscovered = false;
  if (state.liuruyanQuest1Done === undefined) state.liuruyanQuest1Done = false;
  if (state.liuruyanQuest2Done === undefined) state.liuruyanQuest2Done = false;
  if (state.liuruyanQuest3Done === undefined) state.liuruyanQuest3Done = false;
  if (state.liuruyanQuest4Done === undefined) state.liuruyanQuest4Done = false;
  if (state.gasoline === undefined) state.gasoline = 0;
  if (state.lastPartnerHarvestDay === undefined) state.lastPartnerHarvestDay = 0;
  if (state.lastFactoryExploreDay === undefined) state.lastFactoryExploreDay = 0;
  if (state.lastViewRiverDay === undefined) state.lastViewRiverDay = 0;
  if (state.nurseZombieAffinity !== undefined) {
    state.npcAffinity.nurseZombie = state.nurseZombieAffinity;
    delete state.nurseZombieAffinity;
  }
  if (state.nurseZombieRescued === undefined) state.nurseZombieRescued = false;
  if (state.lastNurseHarvestDay === undefined) state.lastNurseHarvestDay = 0;
  if (state.zombieKingDefeated === undefined) state.zombieKingDefeated = false;
  if (state.doctorTradeDone === undefined) state.doctorTradeDone = false;
  if (state.baseLevel === undefined) state.baseLevel = 0;
  if (state.warehouseLevel === undefined) state.warehouseLevel = 0;
  if (!Array.isArray(state.warehouse)) state.warehouse = [];
  if (!Array.isArray(state.crops)) state.crops = [null, null, null, null, null];
  if (state.weather === undefined) state.weather = "晴天";
  if (state.npcAffinity && state.npcAffinity.nurseZombie === undefined) state.npcAffinity.nurseZombie = 0;
  if (state.crashTurns === undefined) state.crashTurns = 0;
  if (state.lastBegDay === undefined) state.lastBegDay = 0;
  if (!state.backpack) state.backpack = { ...BACKPACK_TYPES.口袋 };
  if (!Array.isArray(state.food)) state.food = [{ ...FOODS.find(f => f.id === DEFAULT_ITEM_IDS.food) }];
  if (!Array.isArray(state.drinks)) state.drinks = [{ ...DRINKS.find(d => d.id === DEFAULT_ITEM_IDS.drink) }];
  if (!Array.isArray(state.medicine)) state.medicine = [];
  if (!Array.isArray(state.other)) state.other = [];
  if (!Array.isArray(state.cargo)) state.cargo = [];
  if (Array.isArray(state.cargo) && state.cargo.length > 0) {
    let migratedCigarettes = 0;
    state.cargo.forEach(item => {
      if (item && item.type === "cigarette") {
        migratedCigarettes += (item.count || 1);
      }
    });
    if (migratedCigarettes > 0) {
      state.cigarettes = (state.cigarettes || 0) + migratedCigarettes;
    }
    state.cargo = [];
  }
  if (state.cigarettes === undefined) state.cigarettes = 0;

  const mergeStackable = (arr) => {
    const stackableMap = new Map();
    const nonStackable = [];
    for (const item of arr) {
      if (isStackableType(item)) {
        const existing = stackableMap.get(item.id);
        if (existing) {
          existing.count = (existing.count || 1) + (item.count || 1);
        } else {
          stackableMap.set(item.id, { ...item, count: item.count || 1 });
        }
      } else {
        nonStackable.push(item);
      }
    }
    return [...stackableMap.values(), ...nonStackable];
  };

  if (Array.isArray(state.food)) state.food = mergeStackable(state.food);
  if (Array.isArray(state.drinks)) state.drinks = mergeStackable(state.drinks);
  if (Array.isArray(state.medicine)) state.medicine = mergeStackable(state.medicine);
  if (Array.isArray(state.other)) {
    const fruits = state.other.filter(i => i && i.type === "fruit");
    if (fruits.length > 0) {
      for (const fruit of fruits) {
        const existing = state.food.find(f => f.id === fruit.id);
        if (existing) {
          existing.count = (existing.count || 1) + (fruit.count || 1);
        } else {
          state.food.push({ ...fruit });
        }
      }
      state.other = state.other.filter(i => !i || i.type !== "fruit");
    }
    state.other = mergeStackable(state.other);
  }

  if (!Array.isArray(state.ammo)) state.ammo = [];
  if (state.castleDebt === undefined) state.castleDebt = null;
  if (state.castleDebt && state.castleDebt.mercyCount === undefined) state.castleDebt.mercyCount = 0;
  if (state.castleDebtTriggered === undefined) state.castleDebtTriggered = false;
  if (state.islandDebt === undefined) state.islandDebt = null;
  if (state.islandDebtTriggered === undefined) state.islandDebtTriggered = false;
  if (state.investment === undefined) state.investment = null;
  if (state.bankerKilled === undefined) state.bankerKilled = false;
  if (state.currentSubMap === undefined) state.currentSubMap = null;
  if (state.lastLeaderChatDay === undefined) state.lastLeaderChatDay = 0;
  if (state.lastLeaderGiftDay === undefined) state.lastLeaderGiftDay = 0;
  if (state.leaderGiftClaimed === undefined) state.leaderGiftClaimed = false;
  if (state.npcAffinity && state.npcAffinity.leader === undefined) state.npcAffinity.leader = 0;
  if (state.lastBanquetDay === undefined) state.lastBanquetDay = 0;
  if (state.lastBallDay === undefined) state.lastBallDay = 0;
  if (state.highestCastleRank === undefined) state.highestCastleRank = 0;
  if (state.kingQuestsDone === undefined) state.kingQuestsDone = { king_1: false, king_2: false, king_3: false, king_4: false, king_5: false };
  if (state.castleRankObtained === undefined) state.castleRankObtained = { viscount: false, count: false, marquis: false, duke: false, crown_prince: false };
  if (state.lastSalaryDay === undefined) state.lastSalaryDay = 0;
  if (state.lastTreatmentDay === undefined) state.lastTreatmentDay = 0;
  if (state.lastMeetingDay === undefined) state.lastMeetingDay = 0;
  if (state.lastGardenDay === undefined) state.lastGardenDay = 0;
  if (state.lastCastleWorkDay === undefined) state.lastCastleWorkDay = 0;
  if (state.leaderAlive === undefined) state.leaderAlive = true;
  if (!state.stats) {
    state.stats = {
      zombieKills: 0,
      mapsExplored: [],
      bossesDefeated: [],
      maxBaseLevel: 0,
      companionsRecruited: 0,
      totalTrades: 0,
      totalCigarettesEarned: 0,
    };
  }
  if (!Array.isArray(state.unlockedAchievements)) state.unlockedAchievements = [];
  if (!Array.isArray(state.unlockedEndings)) state.unlockedEndings = [];
  if (state._spaceCrateLooted === undefined) state._spaceCrateLooted = false;
  if (state.giantPuppetDefeated === undefined) state.giantPuppetDefeated = false;
  if (state.doctorQuest1Accepted === undefined) state.doctorQuest1Accepted = false;
  if (state.doctorQuest1Done === undefined) state.doctorQuest1Done = false;
  if (state.doctorQuest2Done === undefined) state.doctorQuest2Done = false;
  if (state.doctorQuest3Done === undefined) state.doctorQuest3Done = false;
  if (state.undergroundKeyObtained === undefined) state.undergroundKeyObtained = false;
  if (state.generatorObtained === undefined) state.generatorObtained = false;
  if (state.rocketRepaired === undefined) state.rocketRepaired = false;
  if (state.doctorLeftInEnding8 === undefined) state.doctorLeftInEnding8 = false;
  if (state.lastEnergyWellDay === undefined) state.lastEnergyWellDay = 0;
  if (state.lastImprovedSerumDay === undefined) state.lastImprovedSerumDay = 0;
  if (!Array.isArray(state.seeds)) state.seeds = [];
  if (state.npcAffinity && state.npcAffinity.mumiao === undefined) state.npcAffinity.mumiao = 0;
  if (state.npcChatCount && state.npcChatCount.mumiao === undefined) state.npcChatCount.mumiao = 0;
  if (state.npcQuestsDone && state.npcQuestsDone.mumiaoSecret === undefined) state.npcQuestsDone.mumiaoSecret = false;
  if (state.npcQuestsDone && state.npcQuestsDone.mumiaoQuest1 === undefined) state.npcQuestsDone.mumiaoQuest1 = false;
  if (state.npcQuestsDone && state.npcQuestsDone.mumiaoQuest2 === undefined) state.npcQuestsDone.mumiaoQuest2 = false;
  if (state.npcQuestsDone && state.npcQuestsDone.mumiaoQuest3 === undefined) state.npcQuestsDone.mumiaoQuest3 = false;
  if (state.tombstoneDug === undefined) state.tombstoneDug = false;
  if (state.npcQuestsDone && state.npcQuestsDone.leaderQuest1 === undefined) state.npcQuestsDone.leaderQuest1 = false;
  if (state.npcQuestsDone && state.npcQuestsDone.leaderQuest2 === undefined) state.npcQuestsDone.leaderQuest2 = false;
  if (state.npcQuestsDone && state.npcQuestsDone.leaderQuest3 === undefined) state.npcQuestsDone.leaderQuest3 = false;
  if (state.tentSearched === undefined) state.tentSearched = false;
  if (state.royalCoins === undefined) state.royalCoins = 0;
  if (state.npcQuestsDone && state.npcQuestsDone.queenQuest1 === undefined) state.npcQuestsDone.queenQuest1 = false;
  if (state.npcQuestsDone && state.npcQuestsDone.queenQuest2 === undefined) state.npcQuestsDone.queenQuest2 = false;
  if (state.npcQuestsDone && state.npcQuestsDone.queenQuest3 === undefined) state.npcQuestsDone.queenQuest3 = false;
  if (state.npcQuestsDone && state.npcQuestsDone.queenQuest4 === undefined) state.npcQuestsDone.queenQuest4 = false;
  if (state.lastMumiaoTendDay === undefined) state.lastMumiaoTendDay = 0;
  if (state.lastVTradeDay === undefined) state.lastVTradeDay = 0;
  if (state.lastLiliTradeDay === undefined) state.lastLiliTradeDay = 0;
  if (state.lastXiaohanTradeDay === undefined) state.lastXiaohanTradeDay = 0;
  if (Array.isArray(state.other)) {
    const oldSeeds = state.other.filter(i => i && i.id === "seed" && i.type === "building");
    if (oldSeeds.length > 0) {
      state.other = state.other.filter(i => !i || i.id !== "seed" || i.type !== "building");
      for (const oldSeed of oldSeeds) {
        const count = oldSeed.count || 1;
        for (let j = 0; j < count; j++) {
          const randomSeed = SEEDS[Math.floor(Math.random() * SEEDS.length)];
          const existing = state.seeds.find(s => s.id === randomSeed.id);
          if (existing) {
            existing.count = (existing.count || 1) + 1;
          } else {
            state.seeds.push({ ...randomSeed, count: 1 });
          }
        }
      }
    }
  }
  if (Array.isArray(state.crops)) {
    for (let i = 0; i < state.crops.length; i++) {
      if (state.crops[i] && state.crops[i].reward !== undefined) {
        state.crops[i] = null;
      }
    }
  }
  if (state.npcQuestsDone && state.npcQuestsDone.yumoQuest1 === undefined) state.npcQuestsDone.yumoQuest1 = false;
  if (state.npcQuestsDone && state.npcQuestsDone.yumoQuest2 === undefined) state.npcQuestsDone.yumoQuest2 = false;
  if (state.npcQuestsDone && state.npcQuestsDone.yumoQuest3 === undefined) state.npcQuestsDone.yumoQuest3 = false;
  if (state.npcQuestsDone && state.npcQuestsDone.yumoQuest4 === undefined) state.npcQuestsDone.yumoQuest4 = false;
  if (state.npcQuestsDone && state.npcQuestsDone.yumoQuest5 === undefined) state.npcQuestsDone.yumoQuest5 = false;
  if (state.npcAffinity && state.npcAffinity.yumo === undefined) state.npcAffinity.yumo = 0;
  if (state.npcChatCount && state.npcChatCount.yumo === undefined) state.npcChatCount.yumo = 0;
  if (state.yumoDivingKills === undefined) state.yumoDivingKills = 0;
  if (state.npcAffinity && state.npcAffinity.guyue === undefined) state.npcAffinity.guyue = 0;
  if (state.npcAffinity && state.npcAffinity.linhan === undefined) state.npcAffinity.linhan = 0;
  if (state.npcChatCount && state.npcChatCount.guyue === undefined) state.npcChatCount.guyue = 0;
  if (state.npcChatCount && state.npcChatCount.linhan === undefined) state.npcChatCount.linhan = 0;
  if (state.fishingCount === undefined) state.fishingCount = 0;
}

/**
 * 每天开始时随机生成天气
 */
export function generateWeather() {
  const probs = GAME_CONSTANTS.WEATHER.PROBABILITIES;
  const roll = Math.random();
  let cumulative = 0;
  for (const [weather, prob] of Object.entries(probs)) {
    cumulative += prob;
    if (roll < cumulative) {
      gameState.weather = weather;
      return;
    }
  }
  gameState.weather = "晴天";
}

/**
 * 应用天气每回合效果（在 advanceTime 中调用）
 * @param {number} steps - 前进的回合数
 */
export function applyWeatherEffects(steps) {
  const effects = GAME_CONSTANTS.WEATHER.EFFECTS[gameState.weather];
  if (!effects) return;
  for (let i = 0; i < steps; i++) {
    if (effects.crash) gameState.crash = Math.min(100, (gameState.crash || 0) + effects.crash);
    if (effects.hydration) gameState.hydration = Math.max(0, gameState.hydration + effects.hydration);
    if (effects.health) gameState.health = Math.max(0, Math.min(GAME_CONSTANTS.MAX_HEALTH, gameState.health + effects.health));
  }
}
