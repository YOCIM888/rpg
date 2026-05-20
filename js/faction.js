/* ============================================================
   阵营身份工具模块
   ============================================================ */

import { getState, setStory } from './state.js';
import { SPECIAL_ITEMS, CASTLE_RANKS } from './config.js';

export function hasNobleId(state) {
  return state.other.some(i => i.id === SPECIAL_ITEMS.noble_id.id);
}

export function hasDawnBadge(state) {
  return state.other.some(i => i.id === SPECIAL_ITEMS.dawn_badge.id);
}

export function hasDawnCaptainBadge(state) {
  return state.other.some(i => i.id === SPECIAL_ITEMS.dawn_captain_badge.id);
}

export function hasAnyDawnIdentity(state) {
  return hasDawnBadge(state) || hasDawnCaptainBadge(state);
}

export function hasCastleIdentity(state) {
  return CASTLE_RANKS.some(r => state.other.some(i => i.id === SPECIAL_ITEMS[r.itemId].id));
}

export function hasAnyCastleIdForEntry(state) {
  return hasCastleIdentity(state);
}

export function getCastleRank(state) {
  for (const rank of CASTLE_RANKS) {
    if (state.other.some(i => i.id === SPECIAL_ITEMS[rank.itemId].id)) {
      return rank.rank;
    }
  }
  return 0;
}

export function getCastleRankName(state) {
  const rank = getCastleRank(state);
  const found = CASTLE_RANKS.find(r => r.rank === rank);
  return found ? found.name : null;
}

export function getIdentityDisplayName(state) {
  for (const rank of [...CASTLE_RANKS].reverse()) {
    if (state.other.some(i => i.id === SPECIAL_ITEMS[rank.itemId].id)) {
      return rank.displayName;
    }
  }
  if (state.other.some(i => i.id === SPECIAL_ITEMS.dawn_captain_badge.id)) return "曙光先锋队长";
  if (state.other.some(i => i.id === SPECIAL_ITEMS.dawn_badge.id)) return "曙光阵地队员";
  return "普通幸存者";
}

export function removeLowerCastleRanks(state, newRank) {
  const newRankValue = newRank;
  let removedCount = 0;
  for (const rank of CASTLE_RANKS) {
    if (rank.rank < newRankValue) {
      const idx = state.other.findIndex(i => i.id === SPECIAL_ITEMS[rank.itemId].id);
      if (idx !== -1) {
        state.other.splice(idx, 1);
        removedCount++;
      }
    }
  }
  if (removedCount > 0) {
    const newRankName = CASTLE_RANKS.find(r => r.rank === newRankValue)?.name || "";
    setStory(`你的旧身份牌已自动失效，新的${newRankName}身份牌取而代之。`);
  }
  return removedCount;
}

export function getHighestObtainedRank(state) {
  return state.highestCastleRank || 0;
}

export function cleanDualIdentity(state) {
  const hasNoble = state.other.some(i => i.id === SPECIAL_ITEMS.noble_id.id);
  const hasViscount = state.other.some(i => i.id === SPECIAL_ITEMS.viscount_id.id);
  const hasCount = state.other.some(i => i.id === SPECIAL_ITEMS.count_id.id);
  const hasMarquis = state.other.some(i => i.id === SPECIAL_ITEMS.marquis_id.id);
  const hasDuke = state.other.some(i => i.id === SPECIAL_ITEMS.duke_id.id);
  const hasCrownPrince = state.other.some(i => i.id === SPECIAL_ITEMS.crown_prince_id.id);
  const hasBadge = state.other.some(i => i.id === SPECIAL_ITEMS.dawn_badge.id);
  const hasCaptain = state.other.some(i => i.id === SPECIAL_ITEMS.dawn_captain_badge.id);
  const hasCastle = hasNoble || hasViscount || hasCount || hasMarquis || hasDuke || hasCrownPrince;
  const hasDawn = hasBadge || hasCaptain;
  if (hasCastle && hasDawn) {
    for (let i = state.other.length - 1; i >= 0; i--) {
      const id = state.other[i].id;
      if (id === SPECIAL_ITEMS.noble_id.id ||
          id === SPECIAL_ITEMS.viscount_id.id ||
          id === SPECIAL_ITEMS.count_id.id ||
          id === SPECIAL_ITEMS.marquis_id.id ||
          id === SPECIAL_ITEMS.duke_id.id ||
          id === SPECIAL_ITEMS.crown_prince_id.id) {
        state.other.splice(i, 1);
      }
    }
    setStory("你的城堡身份牌因与曙光阵营冲突而自动销毁了。你感到一阵恍惚——你只能效忠一方。");
    return true;
  }
  return false;
}
