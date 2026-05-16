/* ============================================================
   游戏状态管理模块
   组织顺序：导入 → 常量 → 初始状态 → 状态访问器
   → 生存属性（时间/饥饿/水分）→ 背包/物品/货物
   → 装备（近战/远程/弹药）→ 状态检查 → NPC 好感度/任务
   ============================================================ */

import { TIME_PHASES } from './config.js';

// ---------- 初始状态 ----------

const INITIAL_STATE = {
  name: "",
  day: 1,
  phaseIndex: 0,
  location: "幸存者帐篷",
  health: 240,
  crash: 0,
  crashTurns: 0,
  infection: 0,
  hunger: 100,
  hydration: 100,
  status: "正常",
  currentMap: null,
  meleeWeapon: { id: "拳头", name: "拳头", damage: 10, durability: Infinity, currentDurability: Infinity },
  rangedWeapon: null,
  ammo: [],
  backpack: { type: "口袋", capacity: 15 },
  food: [{ id: "压缩饼干", name: "压缩饼干", hunger: 40 }],
  drinks: [{ id: "矿泉水", name: "矿泉水", hydration: 40 }],
  medicine: [],
  other: [],
  cargo: [],
  npcAffinity: { v: 0, xiaohan: 0, lili: 0, nurseZombie: 0 },
  npcQuestsDone: { v1: false, v2: false, v3: false, v4: false, v5: false, v6: false, xh0: false, xh1: false, xh2: false, xh4: false, xh5: false, xh6: false, llGift: false },
  lastBegDay: 0,
  lastClimbDay: 0,
  lastPickFruitDay: 0,
  lastCaveDay: 0,
  lastLootCorpseDay: 0,
  lastFactoryExploreDay: 0,
  lastViewRiverDay: 0,
  outlawKilled: false,
  liuruyanRescued: false,
  nurseZombieRescued: false,
  lastPartnerHarvestDay: 0,
  lastNurseHarvestDay: 0,
  zombieKingDefeated: false,
  doctorTradeDone: false,
  npcChatCount: { v: 0, xiaohan: 0, lili: 0, nurseZombie: 0 },
  lastChatDay: 0,
  story: "开场白：丧尸病毒爆发已经一周了，你蜷缩在幸存者帐篷里，听着外面隐约传来的丧尸低吼声。饥饿、口渴和恐惧同时袭来，你必须想办法活下去……",
  options: [{ text: "睡觉", action: "sleep" }, { text: "进食", action: "eat" }, { text: "饮水", action: "drink" }, { text: "医疗", action: "medicine" }, { text: "装备", action: "equip" }, { text: "外出", action: "goOut" }, { text: "丢弃", action: "discard" }],
  phase: "choose",
  gameOver: false,
  combatState: null,
};

let gameState = JSON.parse(JSON.stringify(INITIAL_STATE));

// 内部工具：将值限制在 [min, max] 范围内
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
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
  while (gameState.crashTurns >= 16) {
    gameState.crashTurns -= 16;
    if (gameState.crash < 100) {
      gameState.crash = Math.min(gameState.crash + 20, 100);
      messages.push("你已经太久没睡觉了，精神状态越来越差！崩溃+20%");
    }
  }

  while (gameState.phaseIndex >= TIME_PHASES.length) {
    gameState.day++;
    gameState.phaseIndex -= TIME_PHASES.length;
    messages.push(`新的一天开始了！第 ${gameState.day} 天`);
  }

  gameState.hunger = clamp(gameState.hunger - 4 * steps, 0, 100);
  gameState.hydration = clamp(gameState.hydration - 4 * steps, 0, 100);

  return messages;
}

/** 重置崩溃计时器（睡觉后调用） */
export function resetCrashTurns() {
  gameState.crashTurns = 0;
}

// ---------- 背包/物品 ----------

/** 向背包中添加物品，返回是否添加成功 */
export function addItem(item) {
  const totalItems =
    gameState.food.length +
    gameState.drinks.length +
    gameState.medicine.length +
    gameState.other.length +
    gameState.cargo.length;

  if (totalItems >= gameState.backpack.capacity) {
    return false;
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

  const typeMap = {
    food: gameState.food,
    fruit: gameState.food,
    drink: gameState.drinks,
    drinks: gameState.drinks,
    medicine: gameState.medicine,
    cigarette: gameState.cargo,
  };

  const target = typeMap[item.type] || gameState.other;
  target.push(item);
  return true;
}

/** 从背包中移除指定类型和索引的物品，返回被移除的物品 */
export function removeItem(type, index) {
  const typeMap = {
    food: gameState.food,
    fruit: gameState.food,
    drink: gameState.drinks,
    drinks: gameState.drinks,
    medicine: gameState.medicine,
    other: gameState.other,
    cargo: gameState.cargo,
    cigarette: gameState.cargo,
  };

  const target = typeMap[type];
  if (!target || index < 0 || index >= target.length) {
    return null;
  }

  return target.splice(index, 1)[0];
}

/** 消耗背包中指定物品并应用其效果 */
export function consumeItem(type, index) {
  const item = removeItem(type, index);
  if (!item) {
    return null;
  }

  if (item.hunger) {
    gameState.hunger = clamp(gameState.hunger + item.hunger, 0, 100);
  }

  if (item.hydration) {
    gameState.hydration = clamp(gameState.hydration + item.hydration, 0, 100);
  }

  if (item.health) {
    gameState.health = clamp(gameState.health + item.health, 0, 240);
  }

  if (item.effects) {
    if (item.effects.infection != null) {
      gameState.infection = clamp(gameState.infection + item.effects.infection, 0, 100);
    }
    if (item.effects.crash != null) {
      gameState.crash = clamp(gameState.crash + item.effects.crash, 0, 100);
    }
    if (item.effects.hunger != null) {
      gameState.hunger = clamp(gameState.hunger + item.effects.hunger, 0, 100);
    }
    if (item.effects.hydration != null) {
      gameState.hydration = clamp(gameState.hydration + item.effects.hydration, 0, 100);
    }
    if (item.effects.health != null) {
      gameState.health = clamp(gameState.health + item.effects.health, 0, 240);
    }
  }

  return item;
}

// ---------- 装备（近战/远程/弹药）----------

/** 装备近战武器，返回装备的武器信息 */
export function equipMelee(itemId) {
  if (itemId === "拳头") {
    if (gameState.meleeWeapon.id !== "拳头") {
      gameState.other.push(gameState.meleeWeapon);
    }
    gameState.meleeWeapon = { id: "拳头", name: "拳头", damage: 10, durability: Infinity, currentDurability: Infinity };
    return gameState.meleeWeapon;
  }

  const index = gameState.other.findIndex(
    (item) => item.id === itemId && item.type === "melee"
  );

  if (index === -1) {
    return null;
  }

  const newWeapon = gameState.other.splice(index, 1)[0];

  if (gameState.meleeWeapon.id !== "拳头") {
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
    gameState.ammo.push({ id: ammoId, name: ammoId, count });
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
    gameState.meleeWeapon = { id: "拳头", name: "拳头", damage: 10, durability: Infinity, currentDurability: Infinity };
    return `${brokenName} 已经损坏，你只能用拳头了。`;
  }

  return null;
}

/** 减少当前远程武器完整性，返回武器损坏提示或 null */
export function reduceRangedIntegrity() {
  if (!gameState.rangedWeapon) {
    return null;
  }

  gameState.rangedWeapon.integrity -= 5;

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
  if (gameState.health <= 0 || gameState.infection >= 100) {
    gameState.gameOver = true;
    gameState.phase = "game_over";
    gameState.options = [{ text: "重新开始", action: "restart" }];
    gameState.story += "\n\n你死了。在这个残酷的世界里，生命如此脆弱……";
    return true;
  }
  return false;
}

/** 根据当前饥饿/水分/感染/崩溃状态更新玩家状态并返回提示消息 */
export function updateStatusEffects() {
  const messages = [];

  if (gameState.hunger <= 0) {
    gameState.health = clamp(gameState.health - 10, 0, 240);
    messages.push("你极度饥饿，生命值下降！");
  }
  if (gameState.hydration <= 0) {
    gameState.health = clamp(gameState.health - 10, 0, 240);
    messages.push("你极度口渴，生命值下降！");
  }

  if (gameState.hunger <= 0) {
    gameState.status = "饥饿";
  } else if (gameState.hydration <= 0) {
    gameState.status = "口渴";
  } else if (gameState.infection > 50) {
    gameState.status = "感染";
    messages.push("你感到身体在被病毒侵蚀……");
  } else if (gameState.crash > 50) {
    gameState.status = "崩溃";
    messages.push("你的精神濒临崩溃……");
  } else if (gameState.health < 30) {
    gameState.status = "重伤";
    messages.push("你身受重伤，需要尽快治疗！");
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
    gameState.npcAffinity[npcId] = clamp(gameState.npcAffinity[npcId] + amount, 0, 150);
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
  if (affinity >= 150) return "生死之交";
  if (affinity >= 80) return "挚友";
  if (affinity >= 30) return "朋友";
  if (affinity >= 10) return "熟人";
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
export function canChatToday(npcId, maxChats = 4) {
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
  gameState.npcChatCount = { v: 0, xiaohan: 0, lili: 0, nurseZombie: 0 };
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
  if (affinity >= 150) return "soulmate";
  if (affinity >= 80) return "close";
  if (affinity >= 30) return "friend";
  if (affinity >= 10) return "acquaintance";
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
    gameState.food.length +
    gameState.drinks.length +
    gameState.medicine.length +
    gameState.other.length +
    gameState.cargo.length
  );
}

/**
 * 标准化游戏状态，确保所有必要字段都存在
 * @param {Object} state - 游戏状态对象
 */
export function normalizeState(state) {
  if (state.meleeWeapon && state.meleeWeapon.currentDurability === undefined) {
    state.meleeWeapon.currentDurability = state.meleeWeapon.durability === Infinity 
      ? Infinity 
      : (state.meleeWeapon.durability || 0);
  }

  // 标准化背包中其他物品栏里的近战武器
  if (state.other && Array.isArray(state.other)) {
    state.other.forEach(item => {
      if (item && item.type === "melee" && item.currentDurability === undefined) {
        item.currentDurability = item.durability === Infinity 
          ? Infinity 
          : (item.durability || 0);
      }
    });
  }

  // 确保其他必要字段存在
  if (state.npcChatCount === undefined) {
    state.npcChatCount = { v: 0, xiaohan: 0, lili: 0, nurseZombie: 0 };
  }
  if (state.lastChatDay === undefined) {
    state.lastChatDay = 0;
  }
  if (state.npcQuestsDone) {
    if (state.npcQuestsDone.v5 === undefined) state.npcQuestsDone.v5 = false;
    if (state.npcQuestsDone.v6 === undefined) state.npcQuestsDone.v6 = false;
    if (state.npcQuestsDone.xh0 === undefined) state.npcQuestsDone.xh0 = false;
    if (state.npcQuestsDone.xh4 === undefined) state.npcQuestsDone.xh4 = false;
    if (state.npcQuestsDone.xh5 === undefined) state.npcQuestsDone.xh5 = false;
    if (state.npcQuestsDone.xh6 === undefined) state.npcQuestsDone.xh6 = false;
  }
  if (state.lastClimbDay === undefined) state.lastClimbDay = 0;
  if (state.lastPickFruitDay === undefined) state.lastPickFruitDay = 0;
  if (state.lastCaveDay === undefined) state.lastCaveDay = 0;
  if (state.lastLootCorpseDay === undefined) state.lastLootCorpseDay = 0;
  if (state.outlawKilled === undefined) state.outlawKilled = false;
  if (state.liuruyanRescued === undefined) state.liuruyanRescued = false;
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
  if (state.npcAffinity && state.npcAffinity.nurseZombie === undefined) state.npcAffinity.nurseZombie = 0;
  if (state.crashTurns === undefined) state.crashTurns = 0;
  if (state.lastBegDay === undefined) state.lastBegDay = 0;
  if (!state.backpack) state.backpack = { id: "口袋", name: "口袋", type: "口袋", capacity: 15 };
  if (!Array.isArray(state.food)) state.food = [{ id: "压缩饼干", name: "压缩饼干", hunger: 40 }];
  if (!Array.isArray(state.drinks)) state.drinks = [{ id: "矿泉水", name: "矿泉水", hydration: 40 }];
  if (!Array.isArray(state.medicine)) state.medicine = [];
  if (!Array.isArray(state.other)) state.other = [];
  if (!Array.isArray(state.cargo)) state.cargo = [];
  if (!Array.isArray(state.ammo)) state.ammo = [];
}
