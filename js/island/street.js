import {
  getState, setPhase, setStory, setOptions,
  removeRoyalCoins, addRoyalCoins, addItem, advanceTime, updateStatusEffects, checkDeath,
} from '../state.js';

import { SPECIAL_ITEMS, MELEE_WEAPONS, AMMO, FOODS, DRINKS } from '../config.js';

import { hasCastleIdentity, getCastleRankName } from '../faction.js';

import { STREET_OPEN_PHASES, MELEE_SHOP_ITEMS, AMMO_SHOP_ITEMS, AMMO_RECYCLE_RATE, FOOD_SHOP_ITEMS } from '../data/island/street-shop.js';

import { refreshIslandMenu } from './index.js';

function hasAnyCastleRelatedIdentity(state) {
  if (hasCastleIdentity(state)) return true;
  if (state.other.some(i => i.id === SPECIAL_ITEMS.castle_pass.id)) return true;
  return false;
}

export function handleStreet() {
  const state = getState();
  if (!hasAnyCastleRelatedIdentity(state)) {
    setStory("商业街的守卫拦住了你：\"这里只对城堡相关势力开放，请出示城堡通行证或城堡身份牌。\"");
    refreshIslandMenu();
    return;
  }
  if (!STREET_OPEN_PHASES.includes(state.phaseIndex)) {
    setStory("商业街的店铺都关门了，铁门紧锁，只有明天再来。");
    refreshIslandMenu();
    return;
  }
  setPhase("island_street");
  setStory("艾莉娜皇后在岛屿上开辟的商业街，鳞次栉比的店铺沿着石板路排开。商人们热情地招呼着来往的贵族，货架上摆满了大陆上难得一见的商品。这里是岛上最繁华的地段，也是皇家币流通最活跃的地方。");
  setOptions([
    { text: "近战武具店", action: "street_melee" },
    { text: "弹药店", action: "street_ammo" },
    { text: "食品店", action: "street_food" },
    { text: "离开", action: "street_leave" },
  ]);
}

export function handleStreetAction(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;
  const action = state.options[optIdx].action;

  switch (action) {
    case "street_melee":
      handleStreetMelee();
      break;
    case "street_ammo":
      handleStreetAmmo();
      break;
    case "street_food":
      handleStreetFood();
      break;
    case "street_leave":
      refreshIslandMenu();
      break;
    case "street_melee_buy":
      handleStreetMeleeBuy(input);
      break;
    case "street_ammo_buy":
      handleStreetAmmoBuy(input);
      break;
    case "street_ammo_recycle":
      handleStreetAmmoRecycle();
      break;
    case "street_ammo_recycle_type":
      handleStreetAmmoRecycleType(input);
      break;
    case "street_food_buy":
      handleStreetFoodBuy(input);
      break;
    case "street_back":
      handleStreet();
      break;
    default:
      handleStreet();
      break;
  }
}

function handleStreetMelee() {
  const state = getState();
  setPhase("island_street_melee");
  let desc = "武具店的老板是个沉默寡言的铁匠，墙上挂满了各式近战武器。他看了你一眼，\"看上哪把？\"\n\n";
  desc += `当前皇家币：${state.royalCoins}\n\n`;
  MELEE_SHOP_ITEMS.forEach((item, i) => {
    const weapon = MELEE_WEAPONS.find(w => w.id === item.weaponId);
    if (weapon) {
      desc += `${weapon.name} - 伤害:${weapon.damage} 耐久:${weapon.durability} - ${item.price}币\n`;
    }
  });
  setStory(desc);
  const opts = MELEE_SHOP_ITEMS.map((item, i) => {
    const weapon = MELEE_WEAPONS.find(w => w.id === item.weaponId);
    return { text: `${weapon.name}（${item.price}币）`, action: "street_melee_buy", shopIndex: i };
  });
  opts.push({ text: "返回", action: "street_back" });
  setOptions(opts);
}

function handleStreetMeleeBuy(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;
  const option = state.options[optIdx];
  if (option.action !== "street_melee_buy") return;
  const shopIndex = option.shopIndex;
  const shopItem = MELEE_SHOP_ITEMS[shopIndex];
  if (!shopItem) { handleStreetMelee(); return; }
  const weapon = MELEE_WEAPONS.find(w => w.id === shopItem.weaponId);
  if (!weapon) { handleStreetMelee(); return; }
  if (state.royalCoins < shopItem.price) {
    setStory(`你的皇家币不够。这把${weapon.name}需要${shopItem.price}币，你只有${state.royalCoins}币。`);
    handleStreetMelee();
    return;
  }
  removeRoyalCoins(shopItem.price);
  const weaponCopy = { ...weapon, currentDurability: weapon.durability };
  addItem(weaponCopy);
  setStory(`铁匠从墙上取下${weapon.name}递给你：\"好眼光，这把不会让你失望的。\"\n\n花费 ${shopItem.price} 皇家币，获得 ${weapon.name}\n当前皇家币：${state.royalCoins}`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) handleStreetMelee();
}

function handleStreetAmmo() {
  const state = getState();
  setPhase("island_street_ammo");
  let desc = "弹药店老板是个退伍老兵，货架上整整齐齐地码放着各种口径的弹药。\"要什么？都是好货。\"\n\n";
  desc += `当前皇家币：${state.royalCoins}\n\n`;
  AMMO_SHOP_ITEMS.forEach((item, i) => {
    desc += `${item.ammoId} - ${item.count}发 - ${item.price}币\n`;
  });
  setStory(desc);
  const opts = AMMO_SHOP_ITEMS.map((item, i) => {
    return { text: `${item.ammoId}（${item.price}币/${item.count}发）`, action: "street_ammo_buy", shopIndex: i };
  });
  opts.push({ text: "回收子弹", action: "street_ammo_recycle" });
  opts.push({ text: "返回", action: "street_back" });
  setOptions(opts);
}

function handleStreetAmmoBuy(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;
  const option = state.options[optIdx];
  if (option.action !== "street_ammo_buy") return;
  const shopIndex = option.shopIndex;
  const shopItem = AMMO_SHOP_ITEMS[shopIndex];
  if (!shopItem) { handleStreetAmmo(); return; }
  const ammoData = AMMO.find(a => a.name === shopItem.ammoId);
  if (!ammoData) { handleStreetAmmo(); return; }
  if (state.royalCoins < shopItem.price) {
    setStory(`你的皇家币不够。这批弹药需要${shopItem.price}币，你只有${state.royalCoins}币。`);
    handleStreetAmmo();
    return;
  }
  removeRoyalCoins(shopItem.price);
  const existing = state.ammo.find(a => a.id === ammoData.id);
  if (existing) {
    existing.count += shopItem.count;
  } else {
    state.ammo.push({ id: ammoData.id, name: ammoData.name, count: shopItem.count });
  }
  setStory(`老兵从货架上取下一盒${shopItem.ammoId}推到你面前：\"够你打一阵子了。\"\n\n花费 ${shopItem.price} 皇家币，获得 ${shopItem.ammoId} ×${shopItem.count}\n当前皇家币：${state.royalCoins}`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) handleStreetAmmo();
}

function handleStreetAmmoRecycle() {
  const state = getState();
  setPhase("island_street_ammo_recycle");
  let desc = "老兵瞥了一眼你的弹药袋：\"不用的子弹可以回收换币，10发换1币。\"\n\n";
  const recyclable = state.ammo.filter(a => a.count >= AMMO_RECYCLE_RATE);
  if (recyclable.length === 0) {
    desc += "你没有足够数量的弹药可以回收。";
    setStory(desc);
    setOptions([{ text: "返回", action: "street_ammo" }]);
    return;
  }
  recyclable.forEach(a => {
    desc += `${a.name}：${a.count}发 → ${Math.floor(a.count / AMMO_RECYCLE_RATE)}币\n`;
  });
  setStory(desc);
  const opts = [];
  state.ammo.forEach((a, i) => {
    if (a.count >= AMMO_RECYCLE_RATE) {
      opts.push({
        text: `回收${a.name}（${a.count}发→${Math.floor(a.count / AMMO_RECYCLE_RATE)}币）`,
        action: "street_ammo_recycle_type",
        ammoIndex: i,
      });
    }
  });
  opts.push({ text: "返回", action: "street_ammo" });
  setOptions(opts);
}

function handleStreetAmmoRecycleType(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;
  const option = state.options[optIdx];
  if (option.action !== "street_ammo_recycle_type") return;
  const ammoIndex = option.ammoIndex;
  const ammoItem = state.ammo[ammoIndex];
  if (!ammoItem) { handleStreetAmmoRecycle(); return; }
  const groups = Math.floor(ammoItem.count / AMMO_RECYCLE_RATE);
  const coins = groups;
  const usedCount = groups * AMMO_RECYCLE_RATE;
  addRoyalCoins(coins);
  ammoItem.count -= usedCount;
  if (ammoItem.count <= 0) {
    state.ammo = state.ammo.filter((_, i) => i !== ammoIndex);
  }
  setStory(`老兵收走了${usedCount}发${ammoItem.name}，数了数，递给你${coins}皇家币：\"下次再来。\"\n\n回收 ${ammoItem.name} ×${usedCount}，获得 ${coins} 皇家币\n当前皇家币：${state.royalCoins}`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) handleStreetAmmo();
}

function handleStreetFood() {
  const state = getState();
  setPhase("island_street_food");
  let desc = "食品店的货架上摆满了各种罐头和饮品，店员微笑着说：\"都是新鲜货，保证品质。\"\n\n";
  desc += `当前皇家币：${state.royalCoins}\n\n`;
  FOOD_SHOP_ITEMS.forEach((shopItem, i) => {
    const source = shopItem.type === "food" ? FOODS : DRINKS;
    const item = source.find(it => it.id === shopItem.itemId);
    if (item) {
      desc += `${item.name} - ${shopItem.price}币\n`;
    }
  });
  setStory(desc);
  const opts = FOOD_SHOP_ITEMS.map((shopItem, i) => {
    const source = shopItem.type === "food" ? FOODS : DRINKS;
    const item = source.find(it => it.id === shopItem.itemId);
    return { text: `${item.name}（${shopItem.price}币）`, action: "street_food_buy", shopIndex: i };
  });
  opts.push({ text: "返回", action: "street_back" });
  setOptions(opts);
}

function handleStreetFoodBuy(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;
  const option = state.options[optIdx];
  if (option.action !== "street_food_buy") return;
  const shopIndex = option.shopIndex;
  const shopItem = FOOD_SHOP_ITEMS[shopIndex];
  if (!shopItem) { handleStreetFood(); return; }
  const source = shopItem.type === "food" ? FOODS : DRINKS;
  const item = source.find(it => it.id === shopItem.itemId);
  if (!item) { handleStreetFood(); return; }
  if (state.royalCoins < shopItem.price) {
    setStory(`你的皇家币不够。${item.name}需要${shopItem.price}币，你只有${state.royalCoins}币。`);
    handleStreetFood();
    return;
  }
  removeRoyalCoins(shopItem.price);
  const itemCopy = { ...item };
  addItem(itemCopy);
  setStory(`店员从货架上取下${item.name}递给你：\"欢迎下次光临！\"\n\n花费 ${shopItem.price} 皇家币，获得 ${item.name}\n当前皇家币：${state.royalCoins}`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) handleStreetFood();
}
