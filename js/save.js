/* ============================================================
   存档系统模块
   组织顺序：导入 → 常量 → localStorage 键名 → 存档槽位操作
   → 最佳记录 → 时间格式化
   使用 localStorage 持久化 10 个存档位和最佳生存记录
   ============================================================ */

import { normalizeState } from './state.js';

const SAVE_KEY_PREFIX = "zombie_save_";
const BEST_RECORD_KEY = "zombie_best_record";
const MAX_SLOTS = 10;

// ---------- 存档槽位操作 ----------

/**
 * 获取指定存档槽位的 localStorage 键名
 * @param {number} slotId - 槽位编号（0~9）
 * @returns {string} localStorage 键名
 */
function getSlotKey(slotId) {
  return SAVE_KEY_PREFIX + slotId;
}

/**
 * 格式化时间戳为可读字符串
 * @param {Date} date - 日期对象
 * @returns {string} YYYY-MM-DD HH:MM:SS 格式的时间字符串
 */
function formatTimestamp(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${d} ${h}:${min}:${s}`;
}

/**
 * 获取全部 10 个存档位的数据
 * 空位返回 null，已占用位返回元数据（不含完整 gameState）
 * @returns {Array<Object|null>} 长度为 10 的数组
 */
export function getAllSlots() {
  const slots = [];
  for (let i = 0; i < MAX_SLOTS; i++) {
    const raw = localStorage.getItem(getSlotKey(i));
    if (!raw) {
      slots.push(null);
      continue;
    }
    try {
      const parsed = JSON.parse(raw);
      slots.push({
        slotId: parsed.slotId,
        nickname: parsed.nickname,
        day: parsed.day,
        timestamp: parsed.timestamp
      });
    } catch (e) {
      slots.push(null);
    }
  }
  return slots;
}

/**
 * 将当前游戏状态保存到指定槽位
 * @param {number} slotId - 槽位编号（0~9）
 * @param {Object} gameState - 当前完整游戏状态
 * @param {string} nickname - 玩家昵称
 * @returns {boolean} 是否保存成功
 */
export function saveGame(slotId, gameState, nickname) {
  if (slotId < 0 || slotId >= MAX_SLOTS) return false;
  try {
    const now = new Date();
    const cleanState = JSON.parse(JSON.stringify(gameState));
    delete cleanState._trade;
    delete cleanState._npcId;
    delete cleanState._currentQuest;
    const saveData = {
      slotId,
      nickname,
      day: gameState.day,
      timestamp: formatTimestamp(now),
      gameState: cleanState
    };
    localStorage.setItem(getSlotKey(slotId), JSON.stringify(saveData));
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 从指定槽位加载完整存档数据
 * @param {number} slotId - 槽位编号（0~9）
 * @returns {Object|null} 存档数据（含 gameState），或 null
 */
export function loadGame(slotId) {
  if (slotId < 0 || slotId >= MAX_SLOTS) return null;
  const raw = localStorage.getItem(getSlotKey(slotId));
  if (!raw) return null;
  try {
    const saveData = JSON.parse(raw);
    if (saveData.gameState) {
      normalizeState(saveData.gameState);
    }
    return saveData;
  } catch (e) {
    return null;
  }
}

/**
 * 删除指定槽位的存档
 * @param {number} slotId - 槽位编号（0~9）
 * @returns {boolean} 是否删除成功
 */
export function deleteSlot(slotId) {
  if (slotId < 0 || slotId >= MAX_SLOTS) return false;
  localStorage.removeItem(getSlotKey(slotId));
  return true;
}

// ---------- 最佳记录 ----------

/**
 * 获取历史最佳生存记录
 * @returns {Object|null} 最佳记录数据，或 null（尚无记录）
 */
export function getBestRecord() {
  const raw = localStorage.getItem(BEST_RECORD_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/**
 * 更新最佳生存记录（仅在当前天数更大时更新）
 * @param {Object} gameState - 当前游戏状态
 * @returns {boolean} 是否刷新了记录
 */
export function updateBestRecord(gameState) {
  const best = getBestRecord();
  if (best && gameState.day <= best.day) {
    return false;
  }

  const record = {
    day: gameState.day,
    nickname: gameState.name,
    snapshot: {
      food: gameState.food.map(f => ({ ...f })),
      drinks: gameState.drinks.map(d => ({ ...d })),
      medicine: gameState.medicine.map(m => ({ ...m })),
      other: gameState.other.map(o => ({ ...o })),
      cargo: gameState.cargo.map(c => ({ ...c })),
      ammo: gameState.ammo.map(a => ({ ...a })),
      backpack: { ...gameState.backpack },
      meleeWeapon: { ...gameState.meleeWeapon },
      rangedWeapon: gameState.rangedWeapon ? { ...gameState.rangedWeapon } : null,
      health: gameState.health,
      crash: gameState.crash,
      infection: gameState.infection,
      location: gameState.location
    }
  };

  localStorage.setItem(BEST_RECORD_KEY, JSON.stringify(record));
  return true;
}
