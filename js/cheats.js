/* ============================================================
   作弊系统模块（开发者测试用）
   支持格式：/get_{物品名}_{数量}
   物品名支持：
   - 食物：food_xxx 或直接食物名
   - 饮品：drink_xxx
   - 药品：medicine_xxx
   - 水果：fruit_xxx
   - 香烟：cigarette_xxx
   - 弹药：ammo_xxx (如 ammo_9mm, ammo_magnum)
   - 近战武器：melee_xxx (如 melee_平底锅, melee_武士刀)
   - 远程武器：ranged_xxx (如 ranged_G17, ranged_AWM)
   - 背包：backpack_xxx (如 backpack_战术背包, backpack_超大旅行背包)
   ============================================================ */

import { getState, addItem } from './state.js';
import { FOODS, DRINKS, MEDICINES, FRUITS, CIGARETTES, AMMO, MELEE_WEAPONS, RANGED_WEAPONS, LOOT_BACKPACKS, BUILDING_MATERIALS, GAME_CONSTANTS, SPECIAL_ITEMS, DEFAULT_ITEM_IDS } from './config.js';

const AMMO_ALIASES = {
  'arrow': '箭矢',
  '9mm': '9×19mm',
  'magnum': '.357 Magnum',
  '556': '5.56×45mm NATO',
  '762': '7.62×39mm',
  '76251': '7.62×51mm',
  '300': '.300 Winchester Magnum',
  'shotgun': '12号霰弹'
};

const BUILDING_ALIASES = {};
for (const m of BUILDING_MATERIALS) {
  BUILDING_ALIASES[m.id] = m.name;
}

const SPECIAL_ALIASES = {};
for (const [key, item] of Object.entries(SPECIAL_ITEMS)) {
  SPECIAL_ALIASES[key] = item.name;
}

function getFoodByName(name) {
  return FOODS.find(f => f.name === name);
}

function getDrinkByName(name) {
  return DRINKS.find(d => d.name === name);
}

function getMedicineByName(name) {
  return MEDICINES.find(m => m.name === name);
}

function getFruitByName(name) {
  return FRUITS.find(f => f.name === name);
}

function getCigaretteByName(name) {
  return CIGARETTES.find(c => c.name === name);
}

function getAmmoByName(name) {
  const ammoId = AMMO_ALIASES[name] || name;
  return AMMO.find(a => a.id === ammoId) || AMMO.find(a => a.name === name);
}

function getMeleeByName(name) {
  return MELEE_WEAPONS.find(w => w.name === name && w.id !== DEFAULT_ITEM_IDS.melee);
}

function getRangedByName(name) {
  return RANGED_WEAPONS.find(w => w.id === name);
}

function getBackpackByName(name) {
  return LOOT_BACKPACKS.find(b => b.name === name);
}

function getBuildingByName(name) {
  const buildingName = BUILDING_ALIASES[name] || name;
  return BUILDING_MATERIALS.find(b => b.name === buildingName);
}

function handleSpecialItem(name, count) {
  const item = SPECIAL_ITEMS[name];
  if (item) {
    const state = getState();
    for (let i = 0; i < count; i++) {
      state.other.push({ ...item });
    }
    return count;
  }
  return 0;
}

export function processCheatCommand(input) {
  const trimmed = input.trim();
  if (!trimmed.startsWith('/')) {
    return null;
  }

  const parts = trimmed.slice(1).split('_');
  if (parts.length < 3 || parts[0] !== 'get') {
    return null;
  }

  const type = parts[1];
  const count = parseInt(parts[parts.length - 1]);
  if (isNaN(count) || count < 1 || count > 999) {
    return null;
  }

  const nameParts = parts.slice(2, parts.length - 1);
  const itemName = nameParts.join('_');

  const state = getState();
  let added = 0;
  let item = null;

  switch (type) {
    case 'food':
      item = getFoodByName(itemName);
      if (item) {
        for (let i = 0; i < count; i++) {
          if (addItem({ ...item })) added++;
        }
      }
      break;

    case 'drink':
      item = getDrinkByName(itemName);
      if (item) {
        for (let i = 0; i < count; i++) {
          if (addItem({ ...item })) added++;
        }
      }
      break;

    case 'medicine':
      item = getMedicineByName(itemName);
      if (item) {
        for (let i = 0; i < count; i++) {
          if (addItem({ ...item })) added++;
        }
      }
      break;

    case 'fruit':
      item = getFruitByName(itemName);
      if (item) {
        for (let i = 0; i < count; i++) {
          if (addItem({ ...item })) added++;
        }
      }
      break;

    case 'cigarette':
      item = getCigaretteByName(itemName);
      if (item) {
        for (let i = 0; i < count; i++) {
          if (addItem({ ...item })) added++;
        }
      }
      break;

    case 'ammo':
      item = getAmmoByName(itemName);
      if (item) {
        for (let i = 0; i < count; i++) {
          if (addItem({ id: item.id, name: item.name, type: 'ammo', count: 1 })) added++;
        }
      }
      break;

    case 'melee':
      item = getMeleeByName(itemName);
      if (item) {
        for (let i = 0; i < count; i++) {
          if (addItem({ ...item, currentDurability: item.durability })) added++;
        }
      }
      break;

    case 'ranged':
      item = getRangedByName(itemName);
      if (item) {
        for (let i = 0; i < count; i++) {
          if (addItem({ ...item })) added++;
        }
      }
      break;

    case 'backpack':
      item = getBackpackByName(itemName);
      if (item) {
        for (let i = 0; i < count; i++) {
          if (addItem({ ...item })) added++;
        }
      }
      break;

    case 'building':
      item = getBuildingByName(itemName);
      if (item) {
        for (let i = 0; i < count; i++) {
          if (addItem({ ...item })) added++;
        }
      }
      break;

    case 'special':
      added = handleSpecialItem(itemName, count);
      break;

    case 'health':
      state.health = Math.min(GAME_CONSTANTS.MAX_HEALTH, state.health + count);
      return { success: true, message: `生命值 +${count}` };

    case 'full':
      state.health = GAME_CONSTANTS.MAX_HEALTH;
      state.hunger = 100;
      state.hydration = 100;
      state.infection = 0;
      state.crash = 0;
      return { success: true, message: '已恢复全部属性' };

    case 'day':
      state.day += count;
      return { success: true, message: `天数 +${count}` };
  }

  if (item && added > 0) {
    return { success: true, message: `已添加 ${added} 个 ${item.name}` };
  }

  return { success: false, message: null };
}
