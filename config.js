export * from './data/index.js';

import {
  FOODS, FRUITS, DRINKS, MEDICINES, CIGARETTES,
  BUILDING_MATERIALS, CROPS, SEEDS, BACKPACK_TYPES, LOOT_BACKPACKS,
  MELEE_WEAPONS, RANGED_WEAPONS, AMMO,
  ZOMBIES, NPCS, SURVIVOR_NPC, NAMED_NPCS,
  ZOMBIE_POOLS, MAP_ZOMBIE_POOL_MAP,
  MAPS, MAP_ACTIONS,
  OUTLAW_DIALOGUES, MECHANIC_DIALOGUES, WOLF_DIALOGUES,
  WAREHOUSE_GUARD_DIALOGUES, NERVOUS_VETERAN_DIALOGUES,
  CASTLE_GUARD_DIALOGUES, CASTLE_KING_DIALOGUES,
  CASTLE_QUEEN_DIALOGUES, CASTLE_BANKER_DIALOGUES,
  CASTLE_GUARD_HIGH_DIALOGUES, CASTLE_KING_HIGH_DIALOGUES,
  CASTLE_QUEEN_HIGH_DIALOGUES, CASTLE_BANKER_HIGH_DIALOGUES,
  CASTLE_REJECTION_DIALOGUES,
  CASTLE_DIALOGUES_BY_RANK, getDialogueByRank,
  DOCTOR_INTRO, DOCTOR_DIALOGUES, ZOMBIE_KING_INTRO, NURSE_ZOMBIE_INTRO, GAME_INTRO,
  GIANT_PUPPET_INTRO, ROCKET_PREP_STORY, ROCKET_LAUNCH_PREP,
  DOCTOR_QUEST1_STORY, DOCTOR_QUEST1_COMPLETE, DOCTOR_QUEST2_COMPLETE, DOCTOR_QUEST3_COMPLETE, DOCTOR_QUEST1_REJECT,
  ENERGY_WELL_STORY, UNDERGROUND_STORY, KING_UNDERGROUND_STORY, DOCTOR_ENDING8_GONE,
  TIME_PHASES, GAME_CONSTANTS, DEFAULT_ITEM_IDS,
  AFFINITY_THRESHOLDS, AFFINITY_MAX,
  BASE_LEVELS, WAREHOUSE_LEVELS,
  CASTLE_RANKS, KING_QUESTS, SPECIAL_ITEMS,
  TRADER_WEAPON_SHOP, FIXED_LOOT_DROPS, TRADE_TEMPLATES,
  ACHIEVEMENTS, ENDING_STORIES, SURVIVAL_NOTES,
  CANNED_FOOD_IDS, TOOL_WEAPON_IDS, V_TRADE_AMMO_TYPES,
  LILI_REWARD_MEDICINE_IDS, XIAOHAN_REWARD_FOOD_IDS,
  BUILDING_MATERIAL_NAMES, NURSE_MEDICINE_POOL,
} from './data/index.js';

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const weightedRandom = (arr, weightFn) => {
  const weighted = arr.map(item => ({ item, weight: weightFn(item) }));
  const total = weighted.reduce((sum, e) => sum + e.weight, 0);
  let r = Math.random() * total;
  for (const { item, weight } of weighted) {
    r -= weight;
    if (r <= 0) return item;
  }
  return weighted[0].item;
};

const rollWeightedKey = (table) => {
  const entries = Object.entries(table);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * total;
  for (const [key, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return key;
  }
  return null;
};

export const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export function getMapById(id) {
  return MAPS.find((m) => m.id === id);
}
export function getFoodById(id) {
  return FOODS.find((f) => f.id === id);
}
export function getFruitById(id) {
  return FRUITS.find((f) => f.id === id);
}
export function getDrinkById(id) {
  return DRINKS.find((d) => d.id === id);
}
export function getMedicineById(id) {
  return MEDICINES.find((m) => m.id === id);
}
export function getMeleeById(id) {
  return MELEE_WEAPONS.find((w) => w.id === id);
}
export function getRangedById(id) {
  return RANGED_WEAPONS.find((w) => w.id === id);
}
export function getAmmoById(id) {
  return AMMO.find((a) => a.id === id);
}
export function getCigaretteById(id) {
  return CIGARETTES.find((c) => c.id === id);
}

export function getRandomZombie(map) {
  const poolName = MAP_ZOMBIE_POOL_MAP[map.id];
  if (!poolName) return null;
  const poolIds = ZOMBIE_POOLS[poolName];
  if (!poolIds || poolIds.length === 0) return null;
  const pool = ZOMBIES.filter((z) => poolIds.includes(z.id));
  if (pool.length === 0) return null;
  return randomItem(pool);
}

export function pickRandomLoot(map) {
  const type = rollWeightedKey(map.lootTable);
  if (!type || type === "empty") return null;

  switch (type) {
    case "food":
      return { ...randomItem(FOODS) };
    case "drink":
      return { ...randomItem(DRINKS) };
    case "fruit":
      return { ...randomItem(FRUITS) };
    case "cigarette":
      return { id: "香烟", name: "香烟", type: "cigarette", count: 1 };
    case "medicine": {
      const rarityWeights = GAME_CONSTANTS.LOOT.RARITY_WEIGHTS;
      const medicine = weightedRandom(MEDICINES.filter(m => m.id !== "improved_serum" && m.id !== "zombie_gel"), m => rarityWeights[m.rarity] || 1);
      return { ...medicine };
    }
    case "backpack": {
      const rarityWeights = GAME_CONSTANTS.LOOT.RARITY_WEIGHTS;
      const backpack = weightedRandom(LOOT_BACKPACKS, b => rarityWeights[b.rarity] || 1);
      return { ...backpack };
    }
    case "melee": {
      const rarityWeights = GAME_CONSTANTS.LOOT.RARITY_WEIGHTS;
      const melee = weightedRandom(MELEE_WEAPONS.filter(w => w.id !== DEFAULT_ITEM_IDS.melee && w.id !== "无畏之刃" && w.id !== "皇家银剑"), w => rarityWeights[w.rarity] || 1);
      return { ...melee, currentDurability: melee.durability };
    }
    case "ranged": {
      const rarityWeights = GAME_CONSTANTS.LOOT.RARITY_WEIGHTS;
      const weapon = weightedRandom(RANGED_WEAPONS.filter(w => w.id !== "原野之弓" && w.id !== "皇家短枪"), w => rarityWeights[w.rarity] || 1);
      return { ...weapon };
    }
    case "ammo": {
      const isLowDanger = map && (map.danger.includes("★轻松") || map.danger.includes("★★低危"));
      const isMidDanger = map && map.danger.includes("★★★中危");
      const arrowChance = isLowDanger ? GAME_CONSTANTS.LOOT.ARROW_CHANCE_LOW : (isMidDanger ? GAME_CONSTANTS.LOOT.ARROW_CHANCE_MID : GAME_CONSTANTS.LOOT.ARROW_CHANCE_HIGH);
      if (Math.random() < arrowChance) {
        return { id: "箭矢", name: "箭矢", type: "ammo", count: randInt(GAME_CONSTANTS.LOOT.ARROW_COUNT_MIN, GAME_CONSTANTS.LOOT.ARROW_COUNT_MAX) };
      }
      const ammo = randomItem(AMMO.filter(a => a.id !== "箭矢"));
      return { ...ammo, count: randInt(GAME_CONSTANTS.LOOT.AMMO_COUNT_MIN, GAME_CONSTANTS.LOOT.AMMO_COUNT_MAX) };
    }
    case "seed":
      return { ...randomItem(SEEDS) };
    case "building": {
      const lootableMaterials = BUILDING_MATERIALS.filter(b => b.id !== "pure_energy" && b.id !== "small_nuclear_generator");
      const buildingItem = randomItem(lootableMaterials);
      return { ...buildingItem };
    }
    default:
      return null;
  }
}

export function getRandomTrade() {
  return randomItem(TRADE_TEMPLATES);
}

export function createNpcInstance(type) {
  const def = NPCS[type];
  const hp = randInt(def.hpMin, def.hpMax);
  const damage = randInt(def.damageMin, def.damageMax);
  const hasRanged = Math.random() < def.hasRanged;
  return { type, name: def.name, hp, maxHp: hp, damage, hasRanged };
}

export function generateNpcLoot() {
  const count = randInt(GAME_CONSTANTS.COMBAT.NPC_LOOT_COUNT_MIN, GAME_CONSTANTS.COMBAT.NPC_LOOT_COUNT_MAX);
  const loot = [];
  const pools = [
    () => ({ ...randomItem(FOODS) }),
    () => ({ ...randomItem(DRINKS) }),
    () => {
      const a = randomItem(AMMO);
      return { ...a, count: randInt(GAME_CONSTANTS.COMBAT.NPC_LOOT_AMMO_MIN, GAME_CONSTANTS.COMBAT.NPC_LOOT_AMMO_MAX) };
    },
    () => ({ ...randomItem(MEDICINES.filter(m => m.id !== "improved_serum")) }),
  ];

  for (let i = 0; i < count; i++) {
    loot.push(randomItem(pools)());
  }
  return loot;
}
