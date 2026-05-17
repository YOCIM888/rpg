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
import { FOODS, DRINKS, MEDICINES, FRUITS, CIGARETTES, AMMO, MELEE_WEAPONS, RANGED_WEAPONS, LOOT_BACKPACKS, BUILDING_MATERIALS } from './config.js';

const FOOD_NAMES = ['小坚果', '棒棒糖', '能量棒', '巧克力', '干脆面', '银耳羹', '海苔脆', '压缩饼干', '小麦面包', '黄桃罐头', '豆类罐头', '牛肉罐头', '军粮罐头', '沙丁鱼罐头', '金枪鱼罐头', '秋刀鱼罐头', '青花鱼罐头'];
const DRINK_NAMES = ['矿泉水', '椰子汁', '果粒橙', '纯牛奶', '优酸乳', '苹果醋', '魔爪饮料', '电解质水', '运动饮料', '百味啤酒', '动力啤酒', '高度白酒'];
const MEDICINE_NAMES = ['创可贴', '止痛片', '肾上腺素', '手术包', '葡萄糖服液', '止血带', '清创药', '抗生素', '抗感染血清', '医用急救包', '战地医疗箱'];
const FRUIT_NAMES = ['苹果', '香蕉', '橙子', '雪梨', '葡萄', '西瓜', '草莓', '蓝莓', '桃子', '芒果'];
const CIGARETTE_NAMES = ['万宝露香烟', '奇星香烟', '兰星香烟', '芸斯顿香烟', '白乐香烟'];
const AMMO_NAMES = {
  'arrow': '箭矢',
  '9mm': '9×19mm',
  'magnum': '.357 Magnum',
  '556': '5.56×45mm NATO',
  '762': '7.62×39mm',
  '76251': '7.62×51mm',
  '300': '.300 Winchester Magnum',
  'shotgun': '12号霰弹'
};
const MELEE_NAMES = ['平底锅', '大扳手', '棒球棍', '铁管', '铁铲', '小匕首', '屠刀', '警棍', '撬棍', '羊角锤', '消防斧', '军工刀', '指虎刀', '大砍刀', '西洋剑', '龙抄剑', '长骑枪', '武士刀', '唐横刀', '电锯', '寰宇之剑'];
const RANGED_NAMES = ['木弓', '反曲弓', '复合弓', '十字弩', '折叠弩', '狙击弩', 'G17', 'P226', 'GP100', 'USP9', 'UZI', 'MP5', 'MP7', 'Vector', 'M870', 'AA12', 'M16A4', 'M4A1', 'HK416', 'SG552', 'AUG', 'AK47', 'AKM', '81式', 'SKS', 'FAL', 'EBR14', 'SR25', 'M700', 'AWM'];

const BUILDING_NAMES = {
  'wood': '木材',
  'building_mat': '建筑材料',
  'stone': '石头',
  'nails': '铁钉',
  'glass': '玻璃',
  'seed': '种子',
};

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
  const ammoName = AMMO_NAMES[name] || name;
  return AMMO.find(a => a.name === ammoName);
}

function getMeleeByName(name) {
  return MELEE_WEAPONS.find(w => w.name === name && w.id !== '拳头');
}

function getRangedByName(name) {
  return RANGED_WEAPONS.find(w => w.id === name);
}

function getBackpackByName(name) {
  return LOOT_BACKPACKS.find(b => b.name === name);
}

function getBuildingByName(name) {
  const buildingName = BUILDING_NAMES[name] || name;
  return BUILDING_MATERIALS.find(b => b.name === buildingName);
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

    case 'health':
      state.health = Math.min(240, state.health + count);
      return { success: true, message: `生命值 +${count}` };

    case 'full':
      state.health = 240;
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
