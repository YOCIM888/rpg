import {
  getState,
  setPhase,
  setStory,
  setOptions,
  addItem,
  advanceTime,
  updateStatusEffects,
  checkDeath,
  getBackpackCount,
} from '../state.js';

import {
  WAREHOUSE_GUARD_DIALOGUES,
  BUILDING_MATERIALS,
  GAME_CONSTANTS,
  RANGED_WEAPONS,
  MAP_NPC_INTROS,
} from '../config.js';

import {
  showExploreOptionsState,
} from '../routing.js';

export function handleWarehouseGuardInteract() {
  setPhase("explore");
  setStory(MAP_NPC_INTROS.warehouse_guard_intro);
  setOptions([
    { text: "对话", action: "warehouse_guard_chat" },
    { text: "交易", action: "warehouse_guard_trade" },
    { text: "离开", action: "warehouse_guard_leave" },
  ]);
}

export function handleWarehouseGuardChat() {
  const line = WAREHOUSE_GUARD_DIALOGUES[Math.floor(Math.random() * WAREHOUSE_GUARD_DIALOGUES.length)];
  setStory(line);
  setOptions([
    { text: "对话", action: "warehouse_guard_chat" },
    { text: "交易", action: "warehouse_guard_trade" },
    { text: "离开", action: "warehouse_guard_leave" },
  ]);
}

export function handleWarehouseGuardLeave() {
  setStory("你离开了仓库守卫，回到街道上。");
  showExploreOptionsState();
}

export function handleWarehouseGuardTrade() {
  const state = getState();
  const buildingIds = BUILDING_MATERIALS.map(b => b.id);
  const buildingCount = state.other.filter(i => buildingIds.includes(i.id)).reduce((sum, i) => sum + (i.count || 1), 0);
  if (buildingCount < GAME_CONSTANTS.MAP_EVENTS.WAREHOUSE_BUILDING_COST) {
    setStory(`老马摇了摇头：\"建筑材料不够啊，至少需要${GAME_CONSTANTS.MAP_EVENTS.WAREHOUSE_BUILDING_COST}件建材，你只有${buildingCount}件。去多搜刮点再来吧！\"`);
    handleWarehouseGuardInteract();
    return;
  }
  setStory(`老马看了看你的建材：\"不错不错，${buildingCount}件建材。${GAME_CONSTANTS.MAP_EVENTS.WAREHOUSE_BUILDING_COST}件换一把远程武器，干不干？\"`);
  setPhase("explore");
  setOptions([
    { text: `交易${GAME_CONSTANTS.MAP_EVENTS.WAREHOUSE_BUILDING_COST}件建材`, action: "warehouse_guard_trade_confirm" },
    { text: "再想想", action: "warehouse_guard_chat" },
  ]);
}

export function handleWarehouseGuardTradeConfirm() {
  const state = getState();
  const buildingIds = BUILDING_MATERIALS.map(b => b.id);
  const buildingCount = state.other.filter(i => buildingIds.includes(i.id)).reduce((sum, i) => sum + (i.count || 1), 0);
  if (buildingCount < GAME_CONSTANTS.MAP_EVENTS.WAREHOUSE_BUILDING_COST) {
    setStory("建材不够了。");
    handleWarehouseGuardInteract();
    return;
  }
  if (getBackpackCount() - GAME_CONSTANTS.MAP_EVENTS.WAREHOUSE_BUILDING_COST + 1 > state.backpack.capacity) {
    setStory("背包空间不足，无法完成交易。");
    handleWarehouseGuardInteract();
    return;
  }
  let remaining = GAME_CONSTANTS.MAP_EVENTS.WAREHOUSE_BUILDING_COST;
  for (let i = state.other.length - 1; i >= 0 && remaining > 0; i--) {
    if (buildingIds.includes(state.other[i].id)) {
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
  const laomaWeapons = RANGED_WEAPONS.filter(w => w.rarity === "common");
  const weapon = laomaWeapons[Math.floor(Math.random() * laomaWeapons.length)];
  const added = addItem({ ...weapon });
  if (added) {
    setStory(`老马接过${GAME_CONSTANTS.MAP_EVENTS.WAREHOUSE_BUILDING_COST}件建筑材料，仔细检查了一番，满意地点了点头。他从仓库深处拿出一把${weapon.name}递给你。\"物有所值！\"`);
  } else {
    setStory(`老马接过${GAME_CONSTANTS.MAP_EVENTS.WAREHOUSE_BUILDING_COST}件建筑材料，递给你一把${weapon.name}，但你的背包已满，无法携带。`);
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    showExploreOptionsState();
  }
}
