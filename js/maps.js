/* ============================================================
   地图互动模块
   组织顺序：地图探索 → 特殊地点NPC → 伙伴互动
   ============================================================ */

import {
  getState,
  setPhase,
  setStory,
  setOptions,
  addItem,
  advanceTime,
  updateStatusEffects,
  checkDeath,
  removeItem,
} from './state.js';

import {
  FOODS,
  DRINKS,
  FRUITS,
  AMMO,
  CIGARETTES,
  LOOT_BACKPACKS,
  RANGED_WEAPONS,
  OUTLAW_DIALOGUES,
  MECHANIC_DIALOGUES,
  WOLF_DIALOGUES,
  WAREHOUSE_GUARD_DIALOGUES,
  NURSE_ZOMBIE_INTRO,
  NERVOUS_VETERAN_DIALOGUES,
  NURSE_MEDICINE_POOL,
  ZOMBIE_KING_INTRO,
  DOCTOR_INTRO,
  DOCTOR_DIALOGUES,
  BUILDING_MATERIALS,
  CANNED_FOOD_IDS,
  GAME_CONSTANTS,
  NAMED_NPCS,
  TOOL_WEAPON_IDS,
  SPECIAL_ITEMS,
  MEDICINES,
  FIXED_LOOT_DROPS,
  DEFAULT_ITEM_IDS,
  getRandomZombie,
  getAmmoById,
  getFoodById,
} from './config.js';

import {
  showExploreOptionsState,
  showHomeOptions,
} from './routing.js';

import {
  handleGoHome,
} from './game.js';

// ---------- 地图探索 ----------

export function handleClimbTower() {
  const state = getState();
  if (state.lastClimbDay >= state.day) {
    setStory("你今天已经上过塔顶了，明天再来吧");
    showExploreOptionsState();
    return;
  }
  state.crash = Math.max(0, state.crash - 10);
  state.lastClimbDay = state.day;
  setStory("你登上塔顶之后，会当凌绝顶，一览众山小，崩溃度降低了。");
  advanceTime(2);
  updateStatusEffects();
  checkDeath();
  showExploreOptionsState();
}

export function handlePickFruit() {
  const state = getState();
  if (state.lastPickFruitDay > 0 && state.day - state.lastPickFruitDay < 3) {
    const remaining = 3 - (state.day - state.lastPickFruitDay);
    setStory(`果园空荡荡的，等待长出水果后再来吧，还剩 ${remaining} 天`);
    showExploreOptionsState();
    return;
  }
  const fruits = [];
  for (let i = 0; i < 3; i++) {
    fruits.push(FRUITS[Math.floor(Math.random() * FRUITS.length)]);
  }
  let added = 0;
  fruits.forEach(f => { if (addItem({ ...f })) added++; });
  setStory(`你在果园里采摘了3个水果，获得了：${fruits.map(f => f.name).join("、")}。`);
  state.lastPickFruitDay = state.day;
  advanceTime(2);
  updateStatusEffects();
  checkDeath();
  showExploreOptionsState();
}

export function handleExploreCave() {
  const state = getState();
  if (state.lastCaveDay >= state.day) {
    setStory("今天已经探索过山洞了，明天再来吧。");
    showExploreOptionsState();
    return;
  }
  state.lastCaveDay = state.day;
  if (Math.random() < 0.1) {
    const cig = CIGARETTES[Math.floor(Math.random() * CIGARETTES.length)];
    addItem({ ...cig });
    setStory(`你在山洞深处发现了一包${cig.name}！`);
  } else {
    const ammo = AMMO[Math.floor(Math.random() * AMMO.length)];
    addItem({ id: ammo.id, name: ammo.name, type: "ammo", count: 1 });
    setStory(`你在山洞角落里捡到了一颗${ammo.name}子弹。`);
  }
  advanceTime(3);
  updateStatusEffects();
  checkDeath();
  showExploreOptionsState();
}

export function handleLootCorpse() {
  const state = getState();
  if (state.lastLootCorpseDay > 0 && state.day - state.lastLootCorpseDay < 3) {
    const remaining = 3 - (state.day - state.lastLootCorpseDay);
    setStory(`已经翻找得差不多了，再过 ${remaining} 天再来吧`);
    showExploreOptionsState();
    return;
  }
  const backpackIds = LOOT_BACKPACKS.filter(b => b.rarity === "common" || b.rarity === "uncommon").map(b => b.id);
  const pickId = backpackIds[Math.floor(Math.random() * backpackIds.length)];
  const bp = LOOT_BACKPACKS.find(b => b.id === pickId);
  if (!bp) {
    setStory("搜刮尸体时出现了问题。");
    showExploreOptionsState();
    return;
  }
  state.lastLootCorpseDay = state.day;
  if (bp.capacity > state.backpack.capacity) {
    const oldBp = { id: state.backpack.id || state.backpack.name, name: state.backpack.name, type: state.backpack.type || state.backpack.name, capacity: state.backpack.capacity };
    state.other.push(oldBp);
    state.backpack = { id: bp.id, name: bp.name, type: bp.name, capacity: bp.capacity };
    setStory(`你从尸体上搜刮到了一个${bp.name}（容量${bp.capacity}），自动换上了更大的背包。`);
  } else {
    setStory(`你从尸体上搜刮到了一个${bp.name}（容量${bp.capacity}），但不如你当前的背包（${state.backpack.name}，容量${state.backpack.capacity}），你选择放弃。`);
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  showExploreOptionsState();
}

// ---------- 亡命之徒（国道高速服务区）----------

export function handleOutlawInteract() {
  const state = getState();
  if (state.outlawKilled) {
    setStory("马三已经被你亲手杀死了，这里只留下血迹和冰冷的尸体，你不敢看他，虽然是末世，但你还是做了这样的事情。");
    showExploreOptionsState();
    return;
  }
  setPhase("explore");
  setStory("一个满身纹身的壮汉——马三——靠在墙边，眼神凶狠地盯着你。他手里握着一把枪，看起来非常不好惹。");
  showOutlawMenu();
}

function showOutlawMenu() {
  setOptions([
    { text: "对话", action: "outlaw_chat" },
    { text: "挑战", action: "outlaw_fight" },
    { text: "离开", action: "outlaw_leave" },
  ]);
}

export function handleOutlawChat() {
  const line = OUTLAW_DIALOGUES[Math.floor(Math.random() * OUTLAW_DIALOGUES.length)];
  setStory(line);
  showOutlawMenu();
}

export function handleOutlawFight() {
  const state = getState();
  const maSan = NAMED_NPCS.ma_san;
  state._pendingNpc = {
    name: maSan.name,
    hp: maSan.hp,
    damage: Math.floor(Math.random() * (maSan.damageMax - maSan.damageMin + 1)) + maSan.damageMin,
    hasRanged: maSan.hasRanged,
    dodgeRate: maSan.dodgeRate,
  };
  setPhase("pre_combat_npc");
  setStory("马三冷笑一声，拔出了武器。\"来啊，让我看看你有什么本事！\"");
  setOptions([
    { text: "近战作战", action: "combat_npc_melee" },
    { text: "远程射击", action: "combat_npc_ranged" },
    { text: "逃跑（25%）", action: "combat_npc_flee" },
  ]);
}

export function handleOutlawLeave() {
  setStory("你不敢招惹马三，悄悄地离开了。");
  showExploreOptionsState();
}

export function handleSearchFoodLocker() {
  const state = getState();
  if (Math.random() < 0.3) {
    state.hunger = Math.min(100, state.hunger + GAME_CONSTANTS.MAP_EVENTS.FOOD_LOCKER_HUNGER_RESTORE);
    state.hydration = Math.min(100, state.hydration + GAME_CONSTANTS.MAP_EVENTS.FOOD_LOCKER_HYDRATION_RESTORE);
    setStory("你翻找到了国潮外卖并饱餐了一顿。");
  } else {
    state.crash = Math.min(100, state.crash + GAME_CONSTANTS.MAP_EVENTS.FOOD_LOCKER_BAD_FOOD_CRASH);
    setStory("你吃到了过期外卖，肚子特别痛，崩溃度+44%");
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  showExploreOptionsState();
}

// ---------- 加工厂（王铁柱）----------

export function handleMechanicInteract() {
  setPhase("explore");
  setStory("一个满身油污的中年男人——王铁柱——正在摆弄一堆零件，看到你后放下了手中的扳手。");
  showMechanicMenu();
}

function showMechanicMenu() {
  setOptions([
    { text: "对话", action: "mechanic_chat" },
    { text: "交易", action: "mechanic_trade" },
    { text: "离开", action: "mechanic_leave" },
  ]);
}

export function handleMechanicChat() {
  const line = MECHANIC_DIALOGUES[Math.floor(Math.random() * MECHANIC_DIALOGUES.length)];
  setStory(line);
  showMechanicMenu();
}

export function handleMechanicTrade() {
  const state = getState();
  const toolIds = TOOL_WEAPON_IDS;
  let foundIdx = -1;
  for (const id of toolIds) {
    foundIdx = state.other.findIndex(i => i.id === id);
    if (foundIdx !== -1) break;
  }
  if (foundIdx === -1) {
    setStory("王铁柱翻了翻你的背包：\"没有工具？那咱没啥好聊的。去搞点扳手铁管啥的再来吧！\"");
    showMechanicMenu();
    return;
  }
  const toolName = state.other[foundIdx].name;
  setStory(`王铁柱眼睛一亮：\"哟，${toolName}！这玩意儿我正好用得上！给我，我给你换点弹药、吃喝，咋样？\"`);
  setPhase("explore");
  setOptions([
    { text: `交易${toolName}`, action: "mechanic_trade_confirm" },
    { text: "再想想", action: "mechanic_chat" },
  ]);
}

export function handleMechanicTradeConfirm() {
  const state = getState();
  const toolIds = TOOL_WEAPON_IDS;
  let foundIdx = -1;
  for (const id of toolIds) {
    foundIdx = state.other.findIndex(i => i.id === id);
    if (foundIdx !== -1) break;
  }
  if (foundIdx === -1) {
    setStory("工具已经不在了。");
    showMechanicMenu();
    return;
  }
  const toolName = state.other[foundIdx].name;
  removeItem("other", foundIdx);
  const ammo = AMMO[Math.floor(Math.random() * AMMO.length)];
  addItem({ id: ammo.id, name: ammo.name, type: "ammo", count: 5 });
  const drink = DRINKS[Math.floor(Math.random() * DRINKS.length)];
  addItem({ ...drink, type: "drink" });
  const food = FOODS[Math.floor(Math.random() * FOODS.length)];
  addItem({ ...food });
  setStory(`你把${toolName}递给了王铁柱。他满意地接过去，从工具箱里翻出了一些东西：\n\n• ${ammo.name}×5\n• ${drink.name}×1\n• ${food.name}×1\n\n\"物有所值！下次有工具还来找我啊！\"`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!getState().gameOver) {
    showMechanicMenu();
  }
}

export function handleMechanicLeave() {
  setStory("你和王铁柱道别，离开了加工厂。");
  showExploreOptionsState();
}

// ---------- 居民区（老狼）----------

export function handleWolfInteract() {
  setPhase("explore");
  setStory("一个瘦骨嶙峋的老头蹲在墙角，看到你后眼神中充满了警惕和厌恶。");
  setOptions([
    { text: "对话", action: "wolf_chat" },
    { text: "以物易物", action: "wolf_trade" },
    { text: "离开", action: "wolf_leave" },
  ]);
}

export function handleWolfChat() {
  const line = WOLF_DIALOGUES[Math.floor(Math.random() * WOLF_DIALOGUES.length)];
  setStory(line);
  setOptions([
    { text: "对话", action: "wolf_chat" },
    { text: "以物易物", action: "wolf_trade" },
    { text: "离开", action: "wolf_leave" },
  ]);
}

export function handleWolfLeave() {
  setStory("你和老狼告别，离开了居民区。");
  showExploreOptionsState();
}

export function handleWolfTrade() {
  const state = getState();
  if (state.food.length < 3) {
    setStory(`老狼瞥了你一眼：\"就这点吃的还想换东西？至少3份食物。\"你只有${state.food.length}份。`);
    handleWolfInteract();
    return;
  }
  const removedItems = [];
  for (let i = 0; i < 3; i++) {
    removedItems.push(state.food.shift());
  }
  const med = MEDICINES[Math.floor(Math.random() * MEDICINES.length)];
  const added = addItem({ ...med, type: "medicine" });
  const foodNames = removedItems.map(f => f.name).join("、");
  if (added) {
    setStory(`你用${foodNames}与老狼交换了一盒${med.name}。老狼接过食物，迫不及待地啃了起来。`);
  } else {
    setStory(`你用${foodNames}与老狼交换了一盒${med.name}，但背包已满，药品掉在了地上！`);
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    showExploreOptionsState();
  }
}

// ---------- 工厂（探索）----------

export function handleExploreFactory() {
  const state = getState();
  if (state.lastFactoryExploreDay >= state.day) {
    setStory("今天已经探索过工厂内部了，明天再来吧。");
    showExploreOptionsState();
    return;
  }
  state.lastFactoryExploreDay = state.day;
  if (Math.random() < 0.3) {
    state.health -= GAME_CONSTANTS.MAP_EVENTS.FACTORY_EXPLOSION_DAMAGE;
    setStory(`你意外碰到了爆炸物被炸伤了，扣${GAME_CONSTANTS.MAP_EVENTS.FACTORY_EXPLOSION_DAMAGE}健康。`);
  } else {
    const canned = FOODS.filter(f => CANNED_FOOD_IDS.includes(f.id));
    const can = canned[Math.floor(Math.random() * canned.length)];
    const added = addItem({ ...can });
    if (!added) {
      setStory(`你在工厂内部找到了${can.name}，但背包已满，无法携带。`);
    } else {
      setStory(`你在工厂内部找到了${can.name}！`);
    }
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    showExploreOptionsState();
  }
}

// ---------- 江景 ----------

export function handleViewRiver() {
  const state = getState();
  if (state.lastViewRiverDay >= state.day) {
    setStory("今天已经欣赏过江景了，明天再来吧。");
    showExploreOptionsState();
    return;
  }
  state.lastViewRiverDay = state.day;
  state.crash = Math.max(0, state.crash - 10);
  setStory("秋水共长天一色～你的心情更好了，崩溃度降低了。");
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    showExploreOptionsState();
  }
}

// ---------- 超市（蒙面人）----------

export function handleMaskedManInteract() {
  setPhase("explore");
  setStory("一个黑衣蒙面人——黑影——站在超市的阴影里，手里握着枪。他恶狠狠地盯着你，似乎随时准备扣动扳机。");
  setOptions([
    { text: "对抗", action: "masked_man_fight" },
    { text: "离开", action: "masked_man_leave" },
  ]);
}

export function handleMaskedManFight() {
  const state = getState();
  const shadow = NAMED_NPCS.shadow;
  state._pendingNpc = {
    name: shadow.name,
    hp: shadow.hp,
    damage: Math.floor(Math.random() * (shadow.damageMax - shadow.damageMin + 1)) + shadow.damageMin,
    hasRanged: shadow.hasRanged,
    dodgeRate: shadow.dodgeRate,
  };
  setPhase("pre_combat_npc");
  setStory("黑影冷哼一声：\"找死！\"他迅速拔枪瞄准了你！");
  setOptions([
    { text: "近战作战", action: "combat_npc_melee" },
    { text: "远程射击", action: "combat_npc_ranged" },
    { text: "逃跑（25%）", action: "combat_npc_flee" },
  ]);
}

export function handleMaskedManLeave() {
  setStory("你不想招惹黑影，悄悄退出了超市。");
  showExploreOptionsState();
}

// ---------- 工厂仓库（老马）----------

export function handleWarehouseGuardInteract() {
  setPhase("explore");
  setStory("一个穿着工装的大汉——老马——挡在工厂仓库门口，手里拿着一根铁棍。\"此路是我开，此树是我栽……不对，这仓库归我管，谁也不准进！\"");
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
  showExploreOptionsState();
}

export function handleWarehouseGuardTrade() {
  const state = getState();
  const buildingIds = BUILDING_MATERIALS.map(b => b.id);
  const buildingItems = state.other.filter(i => buildingIds.includes(i.id));
  if (buildingItems.length < 10) {
    setStory(`老马摇了摇头：\"建筑材料不够啊，至少需要10件建材，你只有${buildingItems.length}件。去多搜刮点再来吧！\"`);
    handleWarehouseGuardInteract();
    return;
  }
  setStory(`老马看了看你的建材：\"不错不错，${buildingItems.length}件建材。10件换一把远程武器，干不干？\"`);
  setPhase("explore");
  setOptions([
    { text: "交易10件建材", action: "warehouse_guard_trade_confirm" },
    { text: "再想想", action: "warehouse_guard_chat" },
  ]);
}

export function handleWarehouseGuardTradeConfirm() {
  const state = getState();
  const buildingIds = BUILDING_MATERIALS.map(b => b.id);
  const buildingItems = state.other.filter(i => buildingIds.includes(i.id));
  if (buildingItems.length < 10) {
    setStory("建材不够了。");
    handleWarehouseGuardInteract();
    return;
  }
  let removed = 0;
  const indicesToRemove = [];
  for (let i = state.other.length - 1; i >= 0 && removed < 10; i--) {
    if (buildingIds.includes(state.other[i].id)) {
      indicesToRemove.push(i);
      removed++;
    }
  }
  indicesToRemove.sort((a, b) => b - a);
  for (const idx of indicesToRemove) {
    state.other.splice(idx, 1);
  }
  const weapon = RANGED_WEAPONS[Math.floor(Math.random() * RANGED_WEAPONS.length)];
  const added = addItem({ ...weapon });
  if (added) {
    setStory(`老马接过10件建筑材料，仔细检查了一番，满意地点了点头。他从仓库深处拿出一把${weapon.name}递给你。\"物有所值！\"`);
  } else {
    setStory(`老马接过10件建筑材料，递给你一把${weapon.name}，但你的背包已满，无法携带。`);
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    showExploreOptionsState();
  }
}

// ---------- 护士丧尸（露露薇）----------

export function handleNurseZombieInteract() {
  const state = getState();
  if (state.nurseZombieRescued) {
    setStory("这里已经什么都没有了，露露薇已经跟你回家了。");
    showExploreOptionsState();
    return;
  }
  setPhase("explore");
  const affinity = state.npcAffinity.nurseZombie || 0;
  const affinityText = `[好感度：${affinity}/150]`;
  const intro = NURSE_ZOMBIE_INTRO;
  const feedResult = state._lastFeedResult;
  delete state._lastFeedResult;
  setStory((feedResult ? feedResult + "\n\n" : "") + `${intro}\n\n${affinityText}`);
  const opts = [
    { text: "投喂", action: "nurse_zombie_feed" },
  ];
  if (affinity >= 150) {
    opts.push({ text: "带回家", action: "nurse_zombie_bring_home" });
  }
  opts.push({ text: "离开", action: "nurse_zombie_leave" });
  setOptions(opts);
}

export function handleNurseZombieFeedSelect() {
  const state = getState();
  if (state.food.length === 0) {
    setStory("你没有任何食物可以投喂给她。");
    handleNurseZombieInteract();
    return;
  }
  setPhase("nurse_feed");
  const foodList = state.food.map((f, i) =>
    `${i + 1}. ${f.name}`
  ).join("\n");
  setStory(`请选择一种食物投喂给她：\n\n${foodList}`);
  const opts = state.food.map((f, i) => ({
    text: f.name,
    action: "nurse_feed_confirm",
    index: i,
  }));
  opts.push({ text: "返回", action: "nurse_zombie_leave" });
  setOptions(opts);
}

export function handleNurseZombieFeedConfirm(input) {
  const state = getState();
  const optionIndex = input - 1;
  const option = state.options[optionIndex];
  if (!option || option.action === "nurse_zombie_leave") {
    handleNurseZombieInteract();
    return;
  }
  const foodItem = state.food[option.index];
  const isCanned = CANNED_FOOD_IDS.includes(foodItem.id);
  state.food.splice(optionIndex, 1);
  if (isCanned) {
    const gain = Math.floor(Math.random() * 2) + 2;
    state.npcAffinity.nurseZombie = Math.min(150, (state.npcAffinity.nurseZombie || 0) + gain);
    state._lastFeedResult = `她看起来很喜欢吃罐头！好感度 +${gain}。[好感度：${state.npcAffinity.nurseZombie}/150]`;
  } else {
    state._lastFeedResult = `她好像不喜欢吃这个……也许应该试试罐头食品？[好感度：${state.npcAffinity.nurseZombie || 0}/150]`;
  }
  handleNurseZombieInteract();
}

export function handleNurseZombieBringHome() {
  const state = getState();
  state.nurseZombieRescued = true;
  setStory("露露薇跟着你回到了幸存者帐篷，她现在是你忠实的伙伴了。");
  advanceTime(1);
  updateStatusEffects();
  showHomeOptions();
}

export function handleNurseZombieLeave() {
  setStory("你决定不带走露露薇，独自离开了。");
  showExploreOptionsState();
}

// ---------- 警局（武器弹药）----------

export function handlePoliceRaid() {
  const state = getState();
  if (Math.random() < 0.7) {
    state.health = Math.max(0, state.health - GAME_CONSTANTS.MAP_EVENTS.POLICE_TRAP_DAMAGE);
    setStory(`你小心翼翼地翻找证物室，却不慎触发了警局遗留的陷阱！一阵爆炸将你掀翻在地，你被炸伤了，生命值 -${GAME_CONSTANTS.MAP_EVENTS.POLICE_TRAP_DAMAGE}。`);
  } else {
    const ammo = AMMO[Math.floor(Math.random() * AMMO.length)];
    const count = Math.floor(Math.random() * 6) + 3;
    const added = addItem({ id: ammo.id, name: ammo.name, type: "ammo", count });
    if (added) {
      setStory(`你在一堆陈旧的档案后面发现了一些遗留弹药：${ammo.name}×${count}。这趟冒险总算没白来。`);
    } else {
      setStory(`你发现了一些弹药：${ammo.name}×${count}，但背包已满，无法携带。`);
    }
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    showExploreOptionsState();
  }
}

// ---------- 军事检查站（老兵老赵）----------

export function handleVeteranInteract() {
  setPhase("explore");
  setStory("一个穿着破烂军装的老兵蹲在检查站的角落里，手里紧握着一把步枪，嘴里不停地嘟囔着什么——你隐约听到他说他叫老赵。");
  setOptions([
    { text: "对话", action: "veteran_chat" },
    { text: "讨要子弹", action: "veteran_ammo" },
    { text: "离开", action: "veteran_leave" },
  ]);
}

export function handleVeteranChat() {
  const state = getState();
  const line = NERVOUS_VETERAN_DIALOGUES[Math.floor(Math.random() * NERVOUS_VETERAN_DIALOGUES.length)];
  let result = line;
  advanceTime(1);
  if (Math.random() < 0.5) {
    state.health = Math.max(0, state.health - GAME_CONSTANTS.MAP_EVENTS.VETERAN_MISFIRE_DAMAGE);
    result += `\n\n老兵突然狂躁起来，手中的步枪走火了！你被击中，生命值 -${GAME_CONSTANTS.MAP_EVENTS.VETERAN_MISFIRE_DAMAGE}。`;
  }
  setStory(result);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    setOptions([
      { text: "对话", action: "veteran_chat" },
      { text: "讨要子弹", action: "veteran_ammo" },
      { text: "离开", action: "veteran_leave" },
    ]);
  }
}

export function handleVeteranLeave() {
  setStory("你离开了军事检查站。");
  showExploreOptionsState();
}

export function handleVeteranAmmo() {
  const state = getState();
  advanceTime(1);
  if (Math.random() < 0.5) {
    const ammo = AMMO[Math.floor(Math.random() * AMMO.length)];
    const count = Math.floor(Math.random() * 5) + 3;
    const added = addItem({ id: ammo.id, name: ammo.name, type: "ammo", count });
    if (added) {
      setStory(`老赵打量了你一番，眼神中露出一丝熟悉。\"小子，拿着！当年我在部队的时候……唉，不说了。\"他丢给你${count}发${ammo.name}。`);
    } else {
      setStory("老赵打量了你一番，正想给你些子弹，但你的背包已经满了。");
    }
  } else {
    state.health = Math.max(0, state.health - GAME_CONSTANTS.MAP_EVENTS.VETERAN_MISFIRE_DAMAGE);
    setStory(`老赵突然眼神一变，举起枪对准你：\"你是他们派来的奸细！滚！\"他扣动扳机，你被击中，生命值 -${GAME_CONSTANTS.MAP_EVENTS.VETERAN_MISFIRE_DAMAGE}。`);
  }
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    handleVeteranInteract();
  }
}

// ---------- 隧道（高风险探索）----------

export function handleExploreTunnel() {
  const state = getState();
  const roll = Math.random();
  if (roll < 0.15) {
    const tunnelDrop = FIXED_LOOT_DROPS.tunnel_cache;
    const ammo9mm = AMMO.find(a => a.id === tunnelDrop.ammoId);
    const ammo = addItem({ id: ammo9mm.id, name: ammo9mm.name, type: "ammo", count: tunnelDrop.ammoCount });
    const biscuit = FOODS.find(f => f.id === tunnelDrop.foodId);
    const food = addItem({ ...biscuit });
    setStory("你冒着风险深入隧道，在断裂的铁轨旁竟然发现了一个被遗落的物资箱！里面有一些弹药和食物。" + (ammo && food ? "" : "\n不过你的背包空间不足，部分物品无法携带。"));
  } else if (roll < 0.5) {
    state.health = Math.max(0, state.health - GAME_CONSTANTS.MAP_EVENTS.TUNNEL_COLLAPSE_DAMAGE);
    setStory("隧道深处传来一声巨响，顶部的水泥板一块块砸了下来！你被塌方的石块砸中，生命值 -80。");
  } else if (roll < 0.8) {
    state.health = Math.max(0, state.health - GAME_CONSTANTS.MAP_EVENTS.TUNNEL_GAS_DAMAGE);
    state.infection = Math.min(100, state.infection + GAME_CONSTANTS.MAP_EVENTS.TUNNEL_GAS_INFECTION);
    setStory("你深入隧道，空气中弥漫着刺鼻的化学气味。有毒气体泄漏了！你剧烈咳嗽，生命值 -40，感染值 +10。");
  } else {
    state.health = Math.max(0, state.health - GAME_CONSTANTS.MAP_EVENTS.TUNNEL_ZOMBIE_SWARM_DAMAGE);
    setStory("隧道中传来密密麻麻的脚步声——一群丧尸突然从暗处冲了出来！你被围攻，生命值 -60。");
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    showExploreOptionsState();
  }
}

// ---------- 研究所（陈博士）----------

export function handleDoctorInteract() {
  const state = getState();
  if (state.doctorTradeDone) {
    setStory("博士正忙着用你给他的血清做实验，似乎没空理会你了。");
    showExploreOptionsState();
    return;
  }
  setPhase("explore");
  setStory(DOCTOR_INTRO);
  const serumCount = state.medicine.filter(m => m.id === DEFAULT_ITEM_IDS.serum).length;
  const opts = [];
  if (serumCount >= 50) {
    opts.push({ text: `上交50支${MEDICINES.find(m => m.id === DEFAULT_ITEM_IDS.serum).name}`, action: "doctor_trade" });
  } else {
    opts.push({ text: `上交50支${MEDICINES.find(m => m.id === DEFAULT_ITEM_IDS.serum).name}（你仅有${serumCount}支）`, action: "doctor_trade", disabled: true });
  }
  opts.push({ text: "对话", action: "doctor_chat" });
  opts.push({ text: "离开", action: "doctor_leave" });
  setOptions(opts);
}

export function handleDoctorTrade() {
  const state = getState();
  const serumIndices = [];
  let removed = 0;
  for (let i = state.medicine.length - 1; i >= 0; i--) {
    if (state.medicine[i].id === DEFAULT_ITEM_IDS.serum && removed < 50) {
      serumIndices.push(i);
      removed++;
    }
  }
  if (removed < 50) {
    handleDoctorInteract();
    return;
  }
  serumIndices.sort((a, b) => b - a);
  for (const idx of serumIndices) {
    state.medicine.splice(idx, 1);
  }
  const doctorDrop = FIXED_LOOT_DROPS.doctor_trade;
  const doctorWeapon = RANGED_WEAPONS.find(w => w.id === doctorDrop.weaponId);
  const addedGun = addItem({ ...doctorWeapon });
  const doctorAmmo = AMMO.find(a => a.id === doctorDrop.ammoId);
  const addedAmmo = addItem({ id: doctorAmmo.id, name: doctorAmmo.name, type: "ammo", count: doctorDrop.ammoCount });
  state.doctorTradeDone = true;
  if (addedGun && addedAmmo) {
    setStory(`博士接过50支血清，双手微微颤抖。"太感谢了……这足以让我完成研究了！"他递给你一把${doctorWeapon.name}和${doctorDrop.ammoCount}发${doctorAmmo.name}子弹。"这是我最后的私人物品，希望能帮到你。"`);
  } else {
    setStory(`博士接过50支血清，递给你${doctorWeapon.name}和子弹。但你的背包空间不足，部分物品无法携带！`);
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    showExploreOptionsState();
  }
}

export function handleDoctorChat() {
  const line = DOCTOR_DIALOGUES[Math.floor(Math.random() * DOCTOR_DIALOGUES.length)];
  setStory(line);
  const state = getState();
  const serumCount = state.medicine.filter(m => m.id === DEFAULT_ITEM_IDS.serum).length;
  const opts = [];
  if (serumCount >= 50) {
    opts.push({ text: `上交50支${MEDICINES.find(m => m.id === DEFAULT_ITEM_IDS.serum).name}`, action: "doctor_trade" });
  } else {
    opts.push({ text: `上交50支${MEDICINES.find(m => m.id === DEFAULT_ITEM_IDS.serum).name}（你仅有${serumCount}支）`, action: "doctor_trade", disabled: true });
  }
  opts.push({ text: "对话", action: "doctor_chat" });
  opts.push({ text: "离开", action: "doctor_leave" });
  setOptions(opts);
}

export function handleDoctorLeave() {
  setStory("你告别了博士，离开了研究所。");
  showExploreOptionsState();
}

// ---------- 丧尸巢穴（丧尸之王）----------

export function handleZombieKingInteract() {
  const state = getState();
  if (state.zombieKingDefeated) {
    setStory("丧尸之王的尸体倒在地上，巢穴里恢复了死寂。这里已经没有什么值得挑战的了。");
    showExploreOptionsState();
    return;
  }
  const zk = NAMED_NPCS.zombie_king;
  state._pendingNpc = {
    name: zk.name,
    hp: zk.hp,
    damage: zk.damage,
    hasRanged: zk.hasRanged,
    dodgeRate: zk.dodgeRate,
  };
  setPhase("pre_combat_npc");
  setStory(ZOMBIE_KING_INTRO);
  setOptions([
    { text: "近战作战", action: "combat_npc_melee" },
    { text: "远程射击", action: "combat_npc_ranged" },
    { text: "逃跑", action: "combat_npc_flee" },
  ]);
}

// ---------- 感染女人（柳如烟）----------

export function handleInfectedWoman() {
  const state = getState();
  if (state.liuruyanRescued) {
    setStory("这里已经什么都没有了，柳如烟已经跟你回家了。");
    showExploreOptionsState();
    return;
  }
  if (state.day <= 30) {
    const remaining = 30 - state.day;
    setPhase("explore");
    setStory(`你发现角落躺着一个半感染的女人，她还有一丝意识。她的皮肤已经开始溃烂，但眼神中还保留着人性的光芒。\n\n生命倒计时：还剩 ${remaining} 天`);
    setOptions([
      { text: "给她注射抗感染药剂×3", action: "inject_woman" },
      { text: "先不管她吧。", action: "ignore_woman" },
    ]);
  } else {
    setPhase("explore");
    setStory("角落里的女人已经完全失去了意识，皮肤灰白，嘴里发出低沉的嘶吼——她已经变成丧尸了。");
    setOptions([
      { text: "消灭她（她已变成丧尸）", action: "kill_zombie_woman" },
    ]);
  }
}

export function handleInjectWoman() {
  const state = getState();
  const serumIndices = [];
  state.medicine.forEach((m, i) => {
    if (m.id === DEFAULT_ITEM_IDS.serum) serumIndices.push(i);
  });
  if (serumIndices.length < 3) {
    setStory(`你的${MEDICINES.find(m => m.id === DEFAULT_ITEM_IDS.serum).name}不够，需要 3 支。`);
    handleInfectedWoman();
    return;
  }
  for (let i = serumIndices.length - 1; i >= serumIndices.length - 3; i--) {
    removeItem("medicine", serumIndices[i]);
  }
  state.liuruyanRescued = true;
  handleGoHome();
  const serumName = MEDICINES.find(m => m.id === DEFAULT_ITEM_IDS.serum).name;
  setStory(`你颤抖着双手，将三支${serumName}依次注入她的体内。血清的效果几乎是立竿见影的——她剧烈地咳嗽了几声，皮肤上的溃烂开始肉眼可见地愈合。\n\n她缓缓睁开了眼睛，那是一双棕色的眼眸，清澈而迷茫。\n\n"我……我这是在哪儿？"她虚弱地问道。\n\n你向她说明了情况。她沉默了很久，泪水无声地滑落。\n\n"谢……谢谢。我叫柳如烟。"她的声音很轻，像是用尽了全身的力气。"如果你不嫌弃的话……我想跟着你。虽然我可能帮不上什么大忙，但我可以帮你搜集一些物资……"\n\n你点了点头。\n\n就这样，柳如烟成为了你的伙伴。从今以后，她每天都会出门为你搜集一些物资。\n\n你带着柳如烟安全回到了幸存者帐篷。`);
}

export function handleIgnoreWoman() {
  setStory("你咬了咬牙，转身离开。身后传来她微弱的呻吟声，但你告诉自己——在这个末世，先活下去才是最重要的。");
  showExploreOptionsState();
}

export function handleKillZombieWoman() {
  const state = getState();
  const zombieDef = getRandomZombie(state.currentMap);
  setPhase("pre_combat");
  state._pendingZombie = zombieDef;
  setStory("曾经的女人已经完全变成了丧尸，她嘶吼着朝你扑了过来！");
  setOptions([
    { text: "近战作战", action: "combat_melee" },
    { text: "远程射击", action: "combat_ranged" },
    { text: "逃跑（25%）", action: "combat_flee" },
  ]);
}

// ---------- 伙伴收获 ----------

export function handlePartnerHarvest() {
  const state = getState();
  const hasLiuruyan = state.liuruyanRescued;
  const hasNurse = state.nurseZombieRescued;

  if (!hasLiuruyan && !hasNurse) {
    setStory("你还没有伙伴加入你。");
    showHomeOptions();
    return;
  }

  const liuruyanReady = hasLiuruyan && state.lastPartnerHarvestDay < state.day;
  const nurseReady = hasNurse && state.lastNurseHarvestDay < state.day;

  if (!liuruyanReady && !nurseReady) {
    setStory("你的伙伴们今天已经都出去过了，明天再来吧。");
    showHomeOptions();
    return;
  }

  let storyLines = [];

  if (liuruyanReady) {
    const allItems = [...FOODS, ...DRINKS, ...FRUITS, ...AMMO.map(a => ({ ...a, type: "ammo" }))];
    const item1 = allItems[Math.floor(Math.random() * allItems.length)];
    const item2 = allItems[Math.floor(Math.random() * allItems.length)];
    [item1, item2].forEach(item => {
      if (item.type === "ammo") {
        addItem({ id: item.id, name: item.name, type: "ammo", count: 1 });
      } else if (item.type === "fruit") {
        addItem({ ...item, type: "fruit" });
      } else if (item.type === "drink") {
        addItem({ ...item, type: "drink" });
      } else {
        addItem({ ...item });
      }
    });
    state.lastPartnerHarvestDay = state.day;
    storyLines.push(`柳如烟今天给你带来了${item1.name}和${item2.name}。`);
  }

  if (nurseReady) {
    const med = NURSE_MEDICINE_POOL[Math.floor(Math.random() * NURSE_MEDICINE_POOL.length)];
    addItem({ ...med, type: "medicine" });
    state.lastNurseHarvestDay = state.day;
    storyLines.push(`露露薇今天给你带来了${med.name}。`);
  }

  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  setStory(storyLines.join("\n"));
  showHomeOptions();
}
