/* ============================================================
   阵营身份工具模块
   ============================================================ */

import { getState, setStory } from './state.js';
import { SPECIAL_ITEMS } from './config.js';

export function hasNobleId(state) {
  return state.other.some(i => i.id === SPECIAL_ITEMS.noble_id.id);
}

export function hasDawnBadge(state) {
  return state.other.some(i => i.id === SPECIAL_ITEMS.dawn_badge.id);
}

export function cleanDualIdentity(state) {
  const hasNoble = state.other.some(i => i.id === SPECIAL_ITEMS.noble_id.id);
  const hasBadge = state.other.some(i => i.id === SPECIAL_ITEMS.dawn_badge.id);
  if (hasNoble && hasBadge) {
    for (let i = state.other.length - 1; i >= 0; i--) {
      if (state.other[i].id === SPECIAL_ITEMS.noble_id.id) {
        state.other.splice(i, 1);
      }
    }
    setStory("你的贵族身份牌因与曙光徽章冲突而自动销毁了。你感到一阵恍惚——你只能效忠一方。");
    return true;
  }
  return false;
}
