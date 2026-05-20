import {
  getState,
  setStory,
  addItem,
  advanceTime,
  updateStatusEffects,
  checkDeath,
} from '../state.js';

import {
  AMMO,
  FOODS,
  FIXED_LOOT_DROPS,
  GAME_CONSTANTS,
} from '../config.js';

import {
  showExploreOptionsState,
} from '../routing.js';

export function handleExploreTunnel() {
  const state = getState();
  const roll = Math.random();
  if (roll < GAME_CONSTANTS.MAP_EVENTS.TUNNEL_CACHE_RATE) {
    const tunnelDrop = FIXED_LOOT_DROPS.tunnel_cache;
    const ammo9mm = AMMO.find(a => a.id === tunnelDrop.ammoId);
    const ammo = addItem({ id: ammo9mm.id, name: ammo9mm.name, type: "ammo", count: tunnelDrop.ammoCount });
    const biscuit = FOODS.find(f => f.id === tunnelDrop.foodId);
    const food = addItem({ ...biscuit });
    setStory("你冒着风险深入隧道，在断裂的铁轨旁竟然发现了一个被遗落的物资箱！里面有一些弹药和食物。" + (ammo && food ? "" : "\n不过你的背包空间不足，部分物品无法携带。"));
  } else if (roll < GAME_CONSTANTS.MAP_EVENTS.TUNNEL_COLLAPSE_RATE) {
    state.health = Math.max(0, state.health - GAME_CONSTANTS.MAP_EVENTS.TUNNEL_COLLAPSE_DAMAGE);
    setStory(`隧道深处传来一声巨响，顶部的水泥板一块块砸了下来！你被塌方的石块砸中，生命值 -${GAME_CONSTANTS.MAP_EVENTS.TUNNEL_COLLAPSE_DAMAGE}。`);
  } else if (roll < GAME_CONSTANTS.MAP_EVENTS.TUNNEL_GAS_RATE) {
    state.health = Math.max(0, state.health - GAME_CONSTANTS.MAP_EVENTS.TUNNEL_GAS_DAMAGE);
    state.infection = Math.min(100, state.infection + GAME_CONSTANTS.MAP_EVENTS.TUNNEL_GAS_INFECTION);
    setStory(`你深入隧道，空气中弥漫着刺鼻的化学气味。有毒气体泄漏了！你剧烈咳嗽，生命值 -${GAME_CONSTANTS.MAP_EVENTS.TUNNEL_GAS_DAMAGE}，感染值 +${GAME_CONSTANTS.MAP_EVENTS.TUNNEL_GAS_INFECTION}。`);
  } else {
    state.health = Math.max(0, state.health - GAME_CONSTANTS.MAP_EVENTS.TUNNEL_ZOMBIE_SWARM_DAMAGE);
    setStory(`隧道中传来密密麻麻的脚步声——一群丧尸突然从暗处冲了出来！你被围攻，生命值 -${GAME_CONSTANTS.MAP_EVENTS.TUNNEL_ZOMBIE_SWARM_DAMAGE}。`);
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    const maps = state.stats?.mapsExplored || [];
    if (!state.unlockedAchievements) state.unlockedAchievements = [];
    for (const entry of GAME_CONSTANTS.ACHIEVEMENTS.EXPLORATION_MAPS) {
      if (maps.length >= entry.threshold && !state.unlockedAchievements.includes(entry.id)) state.unlockedAchievements.push(entry.id);
    }
    showExploreOptionsState();
  }
}
