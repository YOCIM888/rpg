import { getState, setPhase, setStory, setOptions, removeCigarettes, advanceTime, updateStatusEffects, checkDeath } from '../state.js';
import { GAME_CONSTANTS, SPECIAL_ITEMS } from '../config.js';
import { hasNobleId, hasAnyDawnIdentity, cleanDualIdentity } from '../faction.js';
import { handleCastleOutpost, refreshCastleOutpost } from './outpost.js';

export function handleCastleIdentity() {
  setPhase("castle_identity");
  const state = getState();
  const hasId = state.other.some(i => i.id === SPECIAL_ITEMS.noble_id.id);
  setStory(`🏛️ 【城堡身份办理处】\n\n${hasId ? "你目前持有贵族身份牌。" : "你目前没有贵族身份牌。"}\n\n办理贵族身份牌需要 ${GAME_CONSTANTS.CASTLE.NOBLE_ID_COST} 根香烟。注意：身份牌一旦丢失需要重新办理，注销身份牌不会退还香烟。`);
  setOptions([
    { text: `办理身份（${GAME_CONSTANTS.CASTLE.NOBLE_ID_COST}根香烟）`, action: "identity_apply" },
    { text: hasId ? "注销身份" : "注销身份（未办理）", action: "identity_cancel", disabled: !hasId },
    { text: "离开", action: "identity_leave" },
  ]);
}

export function handleIdentityApply() {
  const state = getState();
  cleanDualIdentity(state);
  if (hasAnyDawnIdentity(state)) {
    setStory("办事员狐疑地打量着你：\"曙光阵地的人来办贵族身份？你是在逗我吗？\" 两个卫兵走了过来，你只好离开。");
    refreshCastleIdentity();
    return;
  }
  if (state.cigarettes < GAME_CONSTANTS.CASTLE.NOBLE_ID_COST) {
      setStory(`❌ 你需要 ${GAME_CONSTANTS.CASTLE.NOBLE_ID_COST} 根香烟才能办理贵族身份牌。你只有 ${state.cigarettes} 根。还是去攒点钱再来吧。`);
    refreshCastleIdentity();
    return;
  }
  removeCigarettes(GAME_CONSTANTS.CASTLE.NOBLE_ID_COST);
  state.other.push({ ...SPECIAL_ITEMS.noble_id });
  if (!state.unlockedAchievements) state.unlockedAchievements = [];
  if (!state.unlockedAchievements.includes("noble_status")) state.unlockedAchievements.push("noble_status");
  setStory(`✅ 你缴纳了 ${GAME_CONSTANTS.CASTLE.NOBLE_ID_COST} 根香烟，办事员在一张烫金卡片上刻下了你的名字，郑重地交到你手中。\n\n获得【贵族身份牌】！现在你可以自由出入末日城堡的贵族区域了。`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) refreshCastleIdentity();
}

export function handleIdentityCancel() {
  const state = getState();
  const idx = state.other.findIndex(i => i.id === SPECIAL_ITEMS.noble_id.id);
  if (idx !== -1) {
    state.other.splice(idx, 1);
  }
  setStory(`你交回了贵族身份牌，办事员面无表情地收下，一句话没说。${GAME_CONSTANTS.CASTLE.NOBLE_ID_COST}根香烟打了水漂……`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) refreshCastleIdentity();
}

export function refreshCastleIdentity() {
  setPhase("castle_identity");
  const state = getState();
  const hasId = hasNobleId(state);
  setOptions([
    { text: `办理身份（${GAME_CONSTANTS.CASTLE.NOBLE_ID_COST}根香烟）`, action: "identity_apply" },
    { text: hasId ? "注销身份" : "注销身份（未办理）", action: "identity_cancel", disabled: !hasId },
    { text: "离开", action: "identity_leave" },
  ]);
}

export function handleCastleIdentityAction(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;
  const action = state.options[optIdx].action;
  if (action === "identity_apply") { handleIdentityApply(); return; }
  if (action === "identity_cancel") { handleIdentityCancel(); return; }
  if (action === "identity_leave") { handleCastleOutpost(); return; }
}
