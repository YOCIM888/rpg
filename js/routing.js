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
} from './outpost.js';

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
    { text: "基地建设", action: "base_build" }
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
    if (state.currentMap.id === "山顶废弃瞭望塔") {
      opts.push({ text: "登上塔顶", action: "climb_tower" });
    } else if (state.currentMap.id === "乡村废弃谷仓") {
      opts.push({ text: "采摘水果", action: "pick_fruit" });
    } else if (state.currentMap.id === "深山农家乐村落") {
      opts.push({ text: "探索山洞", action: "explore_cave" });
    } else if (state.currentMap.id === "河边露营地") {
      opts.push({ text: "搜刮尸体", action: "loot_corpse" });
    } else if (state.currentMap.id === "国道高速服务区") {
      opts.push({ text: "马三", action: "outlaw_interact" });
    } else if (state.currentMap.id === "高校大学城") {
      opts.push({ text: "翻找外卖柜", action: "search_food_locker" });
    } else if (state.currentMap.id === "城郊废弃加油站") {
      opts.push({ text: "幸存王铁柱", action: "mechanic_interact" });
    } else if (state.currentMap.id === "市中心综合商场") {
      opts.push({ text: "半感染的女人", action: "infected_woman" });
    } else if (state.currentMap.id === "老旧居民小区") {
      opts.push({ text: "幸存者老狼", action: "wolf_interact" });
    } else if (state.currentMap.id === "工业园区/加工厂") {
      opts.push({ text: "探索内部", action: "explore_factory" });
    } else if (state.currentMap.id === "江边港口码头") {
      opts.push({ text: "欣赏江景", action: "view_river" });
    } else if (state.currentMap.id === "连锁大型仓储超市") {
      opts.push({ text: "黑影（不友好）", action: "masked_man" });
    } else if (state.currentMap.id === "废弃工厂仓库") {
      opts.push({ text: "老马（仓库守护者）", action: "warehouse_guard_interact" });
    } else if (state.currentMap.id === "城郊大型医院") {
      opts.push({ text: "露露薇（护士丧尸）", action: "nurse_zombie_interact" });
    } else if (state.currentMap.id === "废弃警察局") {
      opts.push({ text: "翻找证物室", action: "police_raid" });
    } else if (state.currentMap.id === "军事检查站") {
      opts.push({ text: "老赵（神经质老兵）", action: "veteran_interact" });
    } else if (state.currentMap.id === "地下地铁隧道") {
      opts.push({ text: "深入隧道", action: "explore_tunnel" });
    } else if (state.currentMap.id === "生化研究所") {
      opts.push({ text: "博士（寻求帮助）", action: "doctor_interact" });
    } else if (state.currentMap.id === "丧尸巢穴") {
      opts.push({ text: "沉默的丧尸之王", action: "zombie_king_interact" });
    }
  }
  setOptions(opts);
}

/**
 * 根据当前位置返回对应的菜单
 */
export function returnToMenu() {
  const state = getState();
  if (state.gameOver) return;
  if (state.currentMap) {
    showExploreOptionsState();
  } else {
    showHomeOptions();
  }
}
