/* ============================================================
   路由分发模块
   统一管理主页/探索/返回等菜单路由，避免循环依赖
   ============================================================ */

import {
  getState,
  setPhase,
  setOptions,
} from './state.js';

import {
  showOutpostOptions,
} from './outpost/index.js';

import {
  MAP_ACTIONS,
} from './config.js';

import {
  refreshCastleInterior,
  refreshCastleOutpost,
} from './castle/index.js';

/**
 * 显示主页菜单选项
 */
export function showHomeOptions() {
  if (getState().gameOver) return;
  setPhase("choose");
  const state = getState();
  const opts = [
    { text: "睡觉", action: "sleep" },
    { text: "进食", action: "eat" },
    { text: "饮水", action: "drink" },
    { text: "医疗", action: "medicine" },
    { text: "装备", action: "equip" },
    { text: state.weather === "酸雨" ? "出门（酸雨无法出门）" : "出门", action: "goOut", disabled: state.weather === "酸雨" },
    { text: "丢弃", action: "discard" },
    { text: "存档", action: "save_game" },
    { text: "伙伴收获", action: "partner_harvest" },
    { text: "基地建设", action: "base_build" },
    { text: "生存笔记", action: "survival_notes" },
    { text: "返回菜单", action: "back_to_main_menu" },
  ];
  setOptions(opts);
}

/**
 * 显示探索状态下的菜单选项
 */
export function showExploreOptionsState() {
  if (getState().gameOver) return;
  const state = getState();
  if (state.currentMap && state.currentMap.id === "曙光阵地") {
    showOutpostOptions();
    return;
  }
  if (state.currentMap && state.currentMap.id === "末日城堡") {
    if (state.currentSubMap === "城堡内部") {
      refreshCastleInterior();
      return;
    }
    refreshCastleOutpost();
    return;
  }
  setPhase("explore");
  const opts = [
    { text: "探索", action: "explore" },
    { text: "进食", action: "eat" },
    { text: "饮水", action: "drink" },
    { text: "医疗", action: "medicine" },
    { text: "装备", action: "equip" },
    { text: "回家", action: "goHome" },
    { text: "丢弃", action: "discard" }
  ];
  if (state.currentMap) {
    const mapActions = MAP_ACTIONS[state.currentMap.id];
    if (mapActions) {
      for (const act of mapActions) {
        opts.push({ text: act.text, action: act.action });
      }
    }
  }
  setOptions(opts);
}

/**
 * 根据当前位置返回对应的菜单
 */
export function showBaseBuildOptions() {
  if (getState().gameOver) return;
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

export function returnToMenu() {
  const state = getState();
  if (state.gameOver) return;
  if (state.currentMap) {
    showExploreOptionsState();
  } else {
    showHomeOptions();
  }
}
