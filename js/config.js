export const TIME_PHASES = ["凌晨", "早上", "上午", "中午", "下午", "傍晚", "夜晚", "深夜"];

export const FOODS = [
  { id: "压缩饼干", name: "压缩饼干", type: "food", hunger: 40 },
  { id: "面包", name: "面包", type: "food", hunger: 30 },
  { id: "肉罐头", name: "肉罐头", type: "food", hunger: 50 },
  { id: "水果罐头", name: "水果罐头", type: "food", hunger: 35 },
  { id: "巧克力棒", name: "巧克力棒", type: "food", hunger: 25 },
  { id: "牛肉干", name: "牛肉干", type: "food", hunger: 30 },
  { id: "八宝粥", name: "八宝粥", type: "food", hunger: 45 },
  { id: "干脆面", name: "干脆面", type: "food", hunger: 20 }, 
  { id: "军粮口粮", name: "军粮口粮", type: "food", hunger: 60 },
  { id: "沙丁鱼罐头", name: "沙丁鱼罐头", type: "food", hunger: 35 },
  { id: "面包干", name: "面包干", type: "food", hunger: 25 },
];

export const DRINKS = [
  { id: "矿泉水", name: "矿泉水", type: "drink", hydration: 40, effects: null },
  { id: "能量饮料", name: "能量饮料", type: "drink", hydration: 45, effects: null },
  { id: "可口可乐", name: "可口可乐", type: "drink", hydration: 30, effects: null },
  { id: "瓶装橙汁", name: "瓶装橙汁", type: "drink", hydration: 35, effects: null },
  { id: "苹果汁", name: "苹果汁", type: "drink", hydration: 35, effects: null },
  { id: "椰汁", name: "椰汁", type: "drink", hydration: 40, effects: null },
  { id: "电解质饮料", name: "电解质饮料", type: "drink", hydration: 50, effects: null },
  { id: "威士忌", name: "威士忌", type: "drink", hydration: 25, effects: { crash: -10 } },
  { id: "纯净水", name: "纯净水", type: "drink", hydration: 45, effects: null },
  { id: "运动饮料", name: "运动饮料", type: "drink", hydration: 40, effects: null },
  { id: "热可可", name: "热可可", type: "drink", hydration: 35, effects: { crash: -5 } },
];

export const MEDICINES = [
  { id: "绷带", name: "绷带", type: "medicine", effects: { health: 20 } },
  { id: "消毒液", name: "消毒液", type: "medicine", effects: { infection: -15 } },
  { id: "抗生素", name: "抗生素", type: "medicine", effects: { health: 30, infection: -10 } },
  { id: "止痛片", name: "止痛片", type: "medicine", effects: { health: 15, crash: -10 } },
  { id: "葡萄糖注射液", name: "葡萄糖注射液", type: "medicine", effects: { health: 25, hydration: 10 } },
  { id: "抗感染血清", name: "抗感染血清", type: "medicine", effects: { infection: -50 }, rare: true },
];

export const MELEE_WEAPONS = [
  { id: "拳头", name: "拳头", type: "melee", damage: 5, durability: Infinity },
  { id: "匕首", name: "匕首", type: "melee", damage: 15, durability: 30 },
  { id: "指虎刀", name: "指虎刀", type: "melee", damage: 20, durability: 25 },
  { id: "消防斧", name: "消防斧", type: "melee", damage: 35, durability: 40 },
  { id: "钢管", name: "钢管", type: "melee", damage: 18, durability: 35 },
  { id: "棒球棍", name: "棒球棍", type: "melee", damage: 22, durability: 30 },
  { id: "武士刀", name: "武士刀", type: "melee", damage: 40, durability: 35 },
  { id: "大砍刀", name: "大砍刀", type: "melee", damage: 30, durability: 40 },
  { id: "平底锅", name: "平底锅", type: "melee", damage: 12, durability: 50 },
  { id: "撬棍", name: "撬棍", type: "melee", damage: 22, durability: 35 },
  { id: "砍肉刀", name: "砍肉刀", type: "melee", damage: 18, durability: 40 },
  { id: "扳手", name: "扳手", type: "melee", damage: 15, durability: 45 },
];

export const RANGED_WEAPONS = [
  { id: "鲁格GP100", name: "鲁格GP100", type: "ranged", damage: 40, integrity: 100, ammoType: ".357 Magnum弹", rarity: "common" },
  { id: "G17", name: "G17", type: "ranged", damage: 30, integrity: 100, ammoType: "9×19mm", rarity: "common" },
  { id: "AK47", name: "AK47", type: "ranged", damage: 55, integrity: 100, ammoType: "7.62×39mm", rarity: "uncommon" },
  { id: "M4", name: "M4", type: "ranged", damage: 50, integrity: 100, ammoType: "5.56×45mm NATO", rarity: "uncommon" },
  { id: "M700", name: "M700", type: "ranged", damage: 80, integrity: 100, ammoType: "7.62×51mm", rarity: "rare" },
  { id: "AWM", name: "AWM", type: "ranged", damage: 100, integrity: 100, ammoType: ".300 Winchester Magnum", rarity: "rare" },
  { id: "AA12", name: "AA12", type: "ranged", damage: 70, integrity: 100, ammoType: "12号霰弹", rarity: "uncommon" },
  { id: "M870", name: "M870", type: "ranged", damage: 60, integrity: 100, ammoType: "12号霰弹", rarity: "uncommon" },
];

export const AMMO = [
  { id: ".357 Magnum弹", name: ".357 Magnum弹", type: "ammo", compatibleWith: ["鲁格GP100"] },
  { id: "9×19mm", name: "9×19mm", type: "ammo", compatibleWith: ["G17"] },
  { id: "7.62×39mm", name: "7.62×39mm", type: "ammo", compatibleWith: ["AK47"] },
  { id: "5.56×45mm NATO", name: "5.56×45mm NATO", type: "ammo", compatibleWith: ["M4"] },
  { id: "7.62×51mm", name: "7.62×51mm", type: "ammo", compatibleWith: ["M700"] },
  { id: ".300 Winchester Magnum", name: ".300 Winchester Magnum", type: "ammo", compatibleWith: ["AWM"] },
  { id: "12号霰弹", name: "12号霰弹", type: "ammo", compatibleWith: ["AA12", "M870"] },
];

export const ZOMBIES = [
  { id: "普通游荡丧尸", name: "普通游荡丧尸", hp: 30, damage: 8, dodge: 0.05, ability: null },
  { id: "腐烂腐尸", name: "腐烂腐尸", hp: 25, damage: 12, dodge: 0, ability: "infect" },
  { id: "疾行丧尸", name: "疾行丧尸", hp: 20, damage: 15, dodge: 0.35, ability: null },
  { id: "肥胖臃肿尸", name: "肥胖臃肿尸", hp: 60, damage: 10, dodge: 0, ability: null },
  { id: "军警丧尸", name: "军警丧尸", hp: 40, damage: 18, dodge: 0.1, ability: null },
  { id: "群居尸母", name: "群居尸母", hp: 35, damage: 8, dodge: 0, ability: "summon" },
  { id: "撕裂狂暴尸", name: "撕裂狂暴尸", hp: 50, damage: 25, dodge: 0.05, ability: null },
];

export const NPCS = {
  survivor: {
    name: "幸存者",
    hpMin: 50, hpMax: 80,
    damageMin: 15, damageMax: 25,
    hasRanged: 0.3
  },
  bandit: {
    name: "悍匪",
    hpMin: 60, hpMax: 100,
    damageMin: 20, damageMax: 30,
    hasRanged: 0.4
  }
};

export const TRADE_TEMPLATES = [
  { ammoType: "9×19mm", ammoPerItem: 5 },
  { ammoType: ".357 Magnum弹", ammoPerItem: 3 },
  { ammoType: "9×19mm", ammoPerItem: 4 },
  { ammoType: ".357 Magnum弹", ammoPerItem: 4 },
];

export const MAPS = [
  {
    id: "市中心综合商场",
    name: "市中心综合商场",
    danger: "★★★中危",
    encounterRate: 0.35,
    lootTable: { food: 35, drink: 35, melee: 15, empty: 15 },
  },
  {
    id: "城郊大型医院",
    name: "城郊大型医院",
    danger: "★★★★高危",
    encounterRate: 0.6,
    lootTable: { medicine: 70, ammo: 10, empty: 20 },
  },
  {
    id: "国道高速服务区",
    name: "国道高速服务区",
    danger: "★★低危",
    encounterRate: 0.2,
    lootTable: { food: 40, drink: 40, empty: 20 },
  },
  {
    id: "老旧居民小区",
    name: "老旧居民小区",
    danger: "★★★中危",
    encounterRate: 0.35,
    lootTable: { food: 20, drink: 20, melee: 20, medicine: 10, backpack: 10, empty: 20 },
  },
  {
    id: "废弃警察局",
    name: "废弃警察局",
    danger: "★★★★高危",
    encounterRate: 0.55,
    lootTable: { melee: 20, ranged: 10, ammo: 25, medicine: 5, backpack: 10, empty: 30 },
  },
  {
    id: "深山农家乐村落",
    name: "深山农家乐村落",
    danger: "★安全~★★低危",
    encounterRate: 0.1,
    lootTable: { food: 40, drink: 40, empty: 20 },
  },
  {
    id: "工业园区/加工厂",
    name: "工业园区/加工厂",
    danger: "★★★中危",
    encounterRate: 0.35,
    lootTable: { melee: 30, food: 10, drink: 10, backpack: 20, empty: 30 },
  },
  {
    id: "地下地铁隧道",
    name: "地下地铁隧道",
    danger: "★★★★★绝境",
    encounterRate: 0.8,
    lootTable: { ammo: 20, ranged: 10, empty: 70 },
  },
  {
    id: "高校大学城",
    name: "高校大学城",
    danger: "★★低危",
    encounterRate: 0.15,
    lootTable: { food: 35, drink: 35, empty: 30 },
  },
  {
    id: "江边港口码头",
    name: "江边港口码头",
    danger: "★★★中危",
    encounterRate: 0.35,
    lootTable: { food: 20, drink: 20, ammo: 10, melee: 10, empty: 40 },
  },
  {
    id: "连锁大型仓储超市",
    name: "连锁大型仓储超市",
    danger: "★★★中危",
    encounterRate: 0.35,
    lootTable: { food: 30, drink: 30, medicine: 10, backpack: 10, empty: 20 },
  },
  {
    id: "山顶废弃瞭望塔",
    name: "山顶废弃瞭望塔",
    danger: "★安全",
    encounterRate: 0.01,
    lootTable: { empty: 50, ammo: 5, food: 15, drink: 15, backpack: 15 },
  },
  {
    id: "乡村废弃谷仓",
    name: "乡村废弃谷仓",
    danger: "★安全",
    encounterRate: 0.03,
    lootTable: { food: 40, drink: 40, melee: 10, empty: 10 },
  },
  {
    id: "河边露营地",
    name: "河边露营地",
    danger: "★安全~★★低危",
    encounterRate: 0.12,
    lootTable: { food: 30, drink: 30, melee: 5, medicine: 15, empty: 20 },
  },
  {
    id: "郊区废弃加油站",
    name: "郊区废弃加油站",
    danger: "★★低危",
    encounterRate: 0.2,
    lootTable: { food: 30, drink: 30, medicine: 5, ammo: 5, empty: 30 },
  },
];

export const BACKPACK_TYPES = {
  口袋: { name: "口袋", capacity: 10 },
  小腰包: { name: "小腰包", capacity: 18 },
  帆布背包: { name: "帆布背包", capacity: 22 },
  登山包: { name: "登山包", capacity: 28 },
  军用背包: { name: "军用背包", capacity: 35 },
  战术背包: { name: "战术背包", capacity: 42 },
  大型登山背包: { name: "大型登山背包", capacity: 50 },
};

export const LOOT_BACKPACKS = [
  { id: "小腰包", name: "小腰包", type: "backpack", capacity: 18 },
  { id: "帆布背包", name: "帆布背包", type: "backpack", capacity: 22 },
  { id: "登山包", name: "登山包", type: "backpack", capacity: 28 },
  { id: "军用背包", name: "军用背包", type: "backpack", capacity: 35 },
  { id: "战术背包", name: "战术背包", type: "backpack", capacity: 42 },
  { id: "大型登山背包", name: "大型登山背包", type: "backpack", capacity: 50 },
];

export function getMapById(id) {
  return MAPS.find((m) => m.id === id);
}

export function getFoodById(id) {
  return FOODS.find((f) => f.id === id);
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

export function getRandomZombie(mapDanger) {
  const dangerLevel = (mapDanger.match(/★/g) || []).length;

  const easyPool = ZOMBIES.filter((z) =>
    ["普通游荡丧尸", "腐烂腐尸", "肥胖臃肿尸"].includes(z.id)
  );
  const midPool = ZOMBIES.filter((z) =>
    ["普通游荡丧尸", "腐烂腐尸", "疾行丧尸", "肥胖臃肿尸", "群居尸母"].includes(z.id)
  );
  const hardPool = [...ZOMBIES];

  let pool;
  if (dangerLevel <= 2) {
    pool = easyPool;
  } else if (dangerLevel <= 3) {
    pool = midPool;
  } else {
    pool = hardPool;
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

export function pickRandomLoot(map) {
  const table = map.lootTable;
  const entries = Object.entries(table);
  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = Math.random() * totalWeight;

  for (const [type, weight] of entries) {
    roll -= weight;
    if (roll <= 0) {
      if (type === "empty") return null;

      if (type === "food") {
        const food = FOODS[Math.floor(Math.random() * FOODS.length)];
        return { ...food };
      }
      if (type === "drink") {
        const drink = DRINKS[Math.floor(Math.random() * DRINKS.length)];
        return { ...drink };
      }
      if (type === "melee") {
        const melee = MELEE_WEAPONS.filter((w) => w.id !== "拳头")[
          Math.floor(Math.random() * (MELEE_WEAPONS.length - 1))
        ];
        return { ...melee, currentDurability: melee.durability };
      }
      if (type === "ranged") {
        const weights = { common: 25, uncommon: 10, rare: 5 };
        const weighted = RANGED_WEAPONS.map((w) => ({
          weapon: w,
          weight: weights[w.rarity] || 1,
        }));
        const totalW = weighted.reduce((s, e) => s + e.weight, 0);
        let r = Math.random() * totalW;
        for (const { weapon, weight } of weighted) {
          r -= weight;
          if (r <= 0) return { ...weapon };
        }
        return { ...weighted[0].weapon };
      }
      if (type === "ammo") {
        const ammo = AMMO[Math.floor(Math.random() * AMMO.length)];
        return { ...ammo, count: Math.floor(Math.random() * 20) + 5 };
      }
      if (type === "medicine") {
        const medicine =
          MEDICINES[Math.floor(Math.random() * MEDICINES.length)];
        return { ...medicine };
      }
      if (type === "backpack") {
        const bp = LOOT_BACKPACKS[Math.floor(Math.random() * LOOT_BACKPACKS.length)];
        return { ...bp };
      }

      return null;
    }
  }

  return null;
}

export function getRandomTrade() {
  return TRADE_TEMPLATES[Math.floor(Math.random() * TRADE_TEMPLATES.length)];
}

export function createNpcInstance(type) {
  const def = NPCS[type];
  const hp = Math.floor(Math.random() * (def.hpMax - def.hpMin + 1)) + def.hpMin;
  const damage = Math.floor(Math.random() * (def.damageMax - def.damageMin + 1)) + def.damageMin;
  const hasRanged = Math.random() < def.hasRanged;
  return { type, name: def.name, hp, maxHp: hp, damage, hasRanged };
}

export function generateNpcLoot() {
  const count = Math.floor(Math.random() * 3) + 2;
  const loot = [];
  const pools = [
    () => { const f = FOODS[Math.floor(Math.random() * FOODS.length)]; return { ...f }; },
    () => { const d = DRINKS[Math.floor(Math.random() * DRINKS.length)]; return { ...d }; },
    () => { const a = AMMO[Math.floor(Math.random() * AMMO.length)]; return { ...a, count: Math.floor(Math.random() * 10) + 3 }; },
    () => { const m = MEDICINES[Math.floor(Math.random() * MEDICINES.length)]; return { ...m }; },
  ];
  for (let i = 0; i < count; i++) {
    const gen = pools[Math.floor(Math.random() * pools.length)];
    loot.push(gen());
  }
  return loot;
}