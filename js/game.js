/* ============================================================
   游戏逻辑模块
   组织顺序：导入 → 菜单函数（主页/探索） → 睡觉/进食/饮水/医疗
   → 外出/探索 → 战斗（丧尸/NPC） → NPC 交互（幸存者/流浪商人/末日医生/悍匪）
   → 曙光阵地 → 阵地 NPC（V/小涵/莉莉）→ 交易 → 装备 → 丢弃 → 路由分发
   ============================================================ */

// ---------- 导入 ----------
import {
  getState,
  advanceTime,
  updateStatusEffects,
  checkDeath,
  setLocation,
  setCurrentMap,
  setPhase,
  setStory,
  setOptions,
  addItem,
  consumeItem,
  removeItem,
  equipMelee,
  equipRanged,
  addAmmo,
  getBackpackCount,
  resetState,
  resetCrashTurns,
  addNpcAffinity,
  getNpcAffinity,
  getAffinityLabel,
  getAffinityStage,
  canBegToday,
  markBegDone,
  isQuestDone,
  markQuestDone,
  canChatToday,
  incrementChatCount,
} from './state.js';

import {
  FOODS,
  DRINKS,
  FRUITS,
  CIGARETTES,
  AMMO,
  MELEE_WEAPONS,
  RANGED_WEAPONS,
  CROPS,
  MAPS,
  NPCS,
  SURVIVOR_NPC,
  LOOT_BACKPACKS,
  OUTLAW_DIALOGUES,
  MECHANIC_DIALOGUES,
  WOLF_DIALOGUES,
  WAREHOUSE_GUARD_DIALOGUES,
  NURSE_ZOMBIE_INTRO,
  CANNED_FOOD_IDS,
  NURSE_MEDICINE_POOL,
  NERVOUS_VETERAN_DIALOGUES,
  DOCTOR_INTRO,
  DOCTOR_DIALOGUES,
  ZOMBIE_KING_INTRO,
  getRandomZombie,
  pickRandomLoot,
  getRandomTrade,
  createNpcInstance,
  generateNpcLoot,
} from './config.js';

import { saveGame, loadGame, deleteSlot, updateBestRecord, getAllSlots } from './save.js';

// ---------- 菜单函数（主页/探索）----------

/**
 * 显示主页菜单选项
 */
function showHomeOptions() {
  if (getState().gameOver) return;
  setPhase("choose");
  const opts = [
    { text: "睡觉", action: "sleep" },
    { text: "进食", action: "eat" },
    { text: "饮水", action: "drink" },
    { text: "医疗", action: "medicine" },
    { text: "装备", action: "equip" },
    { text: getState().weather === "酸雨" ? "外出（酸雨无法外出）" : "外出", action: "goOut", disabled: getState().weather === "酸雨" },
    { text: "丢弃", action: "discard" },
    { text: "存档", action: "save_game" },
    { text: "伙伴收获", action: "partner_harvest" }
  ];
  setOptions(opts);
}

function handleBaseBuild() {
  setPhase("base_build");
  const state = getState();
  setStory(`[${getBaseName(state.baseLevel)}] 你开始规划基地的建设方案……`);
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

function handleBaseBuildAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;
  const action = state.options[optionIndex].action;
  if (action === "upgrade_base") { handleUpgradeBase(); return; }
  if (action === "plant_crop") { handlePlantCrop(); return; }
  if (action === "view_crops") { handleViewCrops(); return; }
  if (action === "harvest_crops") { handleHarvestCrops(); return; }
  if (action === "build_warehouse") { handleBuildWarehouse(); return; }
  if (action === "open_warehouse") { handleOpenWarehouse(); return; }
  if (action === "back_to_home") { showHomeOptions(); return; }
  if (action === "back_to_base") { handleBaseBuild(); return; }
  if (action === "back_to_warehouse") { handleOpenWarehouse(); return; }
}

/**
 * 显示探索状态下的菜单选项
 */
function showExploreOptionsState() {
  if (getState().gameOver) return;
  const state = getState();
  if (state.currentMap && state.currentMap.id === "曙光阵地") {
    showOutpostOptions();
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
function returnToMenu() {
  const state = getState();
  if (state.gameOver) return;
  if (state.currentMap) {
    showExploreOptionsState();
  } else {
    showHomeOptions();
  }
}

// ---------- 睡觉/进食/饮水/医疗 ----------

/**
 * 处理睡觉操作：恢复生命值并减轻崩溃值
 */
function handleSleep() {
  const state = getState();
  if (state.crash >= 100) {
    setStory("你精神已经完全崩溃了，根本无法入睡。你的大脑一片混乱，无法安静下来。");
    showHomeOptions();
    return;
  }
  if (state.hunger <= 0) {
    setStory("你太饿了，根本无法入睡。先吃点东西吧。");
    showHomeOptions();
    return;
  }
  if (state.hydration <= 0) {
    setStory("你太渴了，根本无法入睡。先喝点东西吧。");
    showHomeOptions();
    return;
  }
  resetCrashTurns();
  const reduction = Math.floor(Math.random() * 16) + 10;
  state.crash = Math.max(0, state.crash - reduction);
  const healthRecovery = Math.floor(Math.random() * 21) + 20 + getBaseBonus(state.baseLevel);
  state.health = Math.min(240, state.health + healthRecovery);
  advanceTime(4);
  updateStatusEffects();
  setStory(`你沉沉睡去，醒来后感觉精神好了一些。崩溃减轻了${reduction}%，健康恢复了${healthRecovery}点。`);
  checkDeath();
  showHomeOptions();
}

/**
 * 进入食物选择界面
 */
function handleEatSelect() {
  const state = getState();
  if (state.crash >= 100) {
    setStory("你精神已经完全崩溃了，根本不想吃任何东西。你对一切都失去了兴趣。");
    returnToMenu();
    return;
  }
  if (state.food.length === 0) {
    setStory("你没有食物可以吃。");
    returnToMenu();
    return;
  }
  setPhase("eat_select");
  setStory("请选择要食用的食物：");
  const foodOptions = state.food.map((f, i) => {
    let info = `（饱腹+${f.hunger || 0}`;
    if (f.hydration) info += ` 水分+${f.hydration}`;
    info += "）";
    return { text: f.name + info, action: "eat_food", index: i };
  });
  foodOptions.push({ text: "返回", action: "back", index: -1 });
  setOptions(foodOptions);
}

/**
 * 进入饮品选择界面
 */
function handleDrinkSelect() {
  const state = getState();
  if (state.crash >= 100) {
    setStory("你精神已经完全崩溃了，根本不想喝任何东西。你对一切都失去了兴趣。");
    returnToMenu();
    return;
  }
  if (state.drinks.length === 0) {
    setStory("你没有饮品可以喝。");
    returnToMenu();
    return;
  }
  setPhase("drink_select");
  setStory("请选择要饮用的饮品：");
  const drinkOptions = state.drinks.map((d, i) => {
    let info = `（水分+${d.hydration}`;
    if (d.effects && d.effects.crash) info += ` 崩溃${d.effects.crash > 0 ? "+" : ""}${d.effects.crash}`;
    info += "）";
    return { text: d.name + info, action: "drink_item", index: i };
  });
  drinkOptions.push({ text: "返回", action: "back", index: -1 });
  setOptions(drinkOptions);
}

/**
 * 进入医疗物品选择界面
 */
function handleMedicineSelect() {
  const state = getState();
  if (state.medicine.length === 0) {
    setStory("你没有医疗物品可用。");
    returnToMenu();
    return;
  }
  setPhase("medicine_select");
  setStory("请选择要使用的医疗物品：");
  const medOptions = state.medicine.map((m, i) => {
    const effects = [];
    if (m.effects) {
      if (m.effects.health) effects.push(`生命+${m.effects.health}`);
      if (m.effects.infection) effects.push(`感染${m.effects.infection > 0 ? "+" : ""}${m.effects.infection}`);
      if (m.effects.crash) effects.push(`崩溃${m.effects.crash > 0 ? "+" : ""}${m.effects.crash}`);
      if (m.effects.hydration) effects.push(`水分+${m.effects.hydration}`);
    }
    return { text: m.name + (effects.length > 0 ? `（${effects.join(" ")}）` : ""), action: "use_med", index: i };
  });
  medOptions.push({ text: "返回", action: "back", index: -1 });
  setOptions(medOptions);
}

/**
 * 获取远程武器弹药和完整性信息
 * @param {Object} state - 游戏状态
 * @returns {string} 弹药和完整性信息
 */
function getRangedAmmoInfo(state) {
  if (!state.rangedWeapon) return "(未装备)";
  const ammoId = state.rangedWeapon.ammoType;
  const ammo = state.ammo.find(a => a.id === ammoId);
  const ammoCount = ammo ? ammo.count : 0;
  return `(弹药:${ammoCount}发 完整:${state.rangedWeapon.integrity}%)`;
}

/**
 * 检查是否可以使用远程武器进行战斗
 * @param {Object} state - 游戏状态
 * @returns {boolean} 是否有弹药和武器
 */
function canRangedCombat(state) {
  if (!state.rangedWeapon) return false;
  const ammoId = state.rangedWeapon.ammoType;
  const ammo = state.ammo.find(a => a.id === ammoId && a.count > 0);
  return !!ammo;
}

/**
 * 处理战斗前选择（近战/远程/逃跑）
 * @param {number} input - 玩家选择的选项编号
 */
function handlePreCombatChoice(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const action = state.options[optionIndex].action;

  if (action === "combat_flee") {
    if (Math.random() < 0.25) {
      setStory(`你成功从${state._pendingZombie?.name || "丧尸"}的追击中逃脱了！`);
      advanceTime(1);
      updateStatusEffects();
      checkDeath();
      if (!state.gameOver) {
        showExploreOptionsState();
      }
    } else {
      setStory("逃跑失败！你被丧尸缠住了！被迫进入战斗！");
      setPhase("combat");
      setOptions([{ text: "战斗进行中...", action: "none" }]);
      const zombieDef = state._pendingZombie;
      const died = handleCombat(zombieDef, "melee");
      if (died) return;
      advanceTime(1);
      updateStatusEffects();
      checkDeath();
      if (!state.gameOver) {
        showExploreOptionsState();
      }
    }
    return;
  }

  if (action === "combat_melee") {
    setPhase("combat");
    setOptions([{ text: "战斗进行中...", action: "none" }]);
    const zombieDef = state._pendingZombie;
    const died = handleCombat(zombieDef, "melee");
    if (died) return;
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    if (!state.gameOver) {
      showExploreOptionsState();
    }
    return;
  }

  if (action === "combat_ranged") {
    if (!canRangedCombat(state)) {
      setStory("你没有可用的远程武器或弹药！只能近战了！");
      setPhase("combat");
      setOptions([{ text: "战斗进行中...", action: "none" }]);
      const zombieDef = state._pendingZombie;
      const died = handleCombat(zombieDef, "melee");
      if (died) return;
      advanceTime(1);
      updateStatusEffects();
      checkDeath();
      if (!state.gameOver) {
        showExploreOptionsState();
      }
      return;
    }
    setPhase("combat");
    setOptions([{ text: "战斗进行中...", action: "none" }]);
    const zombieDef = state._pendingZombie;
    const died = handleCombat(zombieDef, "ranged");
    if (died) return;
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    if (!state.gameOver) {
      showExploreOptionsState();
    }
    return;
  }
}

// ---------- 外出/探索 ----------

/**
 * 进入地图选择界面
 */
function handleGoOut() {
  setPhase("map_select");
  setStory("请选择你要前往的地点：");
  const mapOptions = MAPS.map((m, i) => ({
    text: `${m.name} [${m.danger}]`,
    action: "select_map",
    index: i
  }));
  mapOptions.push({ text: "返回", action: "back", index: -1 });
  setOptions(mapOptions);
}

/**
 * 返回幸存者帐篷（家）
 */
function handleGoHome() {
  const state = getState();
  setLocation("幸存者帐篷");
  setCurrentMap(null);
  advanceTime(1);
  updateStatusEffects();
  setStory("你安全回到了幸存者帐篷。");
  checkDeath();
  showHomeOptions();
}

/**
 * 在当前地图中进行探索
 */
function handleExplore() {
  const state = getState();
  const map = state.currentMap;
  if (!map) {
    setStory("你不在任何地图中，无法探索。");
    showHomeOptions();
    return;
  }

  if (Math.random() < 0.1) {
    const npcRoll = Math.random();
    let npcType;
    if (npcRoll < 0.6) {
      npcType = 'survivor';
    } else if (npcRoll < 0.8) {
      npcType = 'wanderingTrader';
    } else if (npcRoll < 0.9) {
      npcType = 'doctor';
    } else {
      npcType = 'bandit';
    }
    switch (npcType) {
      case 'survivor':
        handleSurvivorEncounter();
        break;
      case 'wanderingTrader':
        handleWanderingTraderEncounter();
        break;
      case 'doctor':
        handleDoctorEncounter();
        break;
      case 'bandit':
        handleBanditEncounter();
        break;
    }
    advanceTime(1);
    const wasFoggy1 = getState().weather === "大雾";
    if (wasFoggy1) advanceTime(1);
    updateStatusEffects();
    checkDeath();
    return;
  }

  if (Math.random() < map.encounterRate) {
    const zombieDef = getRandomZombie(map);
    setPhase("pre_combat");
    state._pendingZombie = zombieDef;
    const meleeName = state.meleeWeapon.name;
    const rangedName = state.rangedWeapon ? state.rangedWeapon.name : "无";
    const ammoInfo = getRangedAmmoInfo(state);
    setStory(`你遭遇了${zombieDef.name}（HP:${zombieDef.hp} 伤害:${zombieDef.damage}）！\n\n【近战】${meleeName}\n【远程】${rangedName} ${ammoInfo}`);
    const options = [
      { text: "近战作战", action: "combat_melee" }
    ];
    if (canRangedCombat(state)) {
      options.push({ text: "远程作战", action: "combat_ranged" });
    } else {
      options.push({ text: "远程作战（不可用：无弹药）", action: "combat_ranged", disabled: true });
    }
    options.push({ text: "逃跑（10%）", action: "combat_flee" });
    setOptions(options);
    return;
  } else {
    const loot = pickRandomLoot(map);
    if (!loot) {
      setStory("你仔细搜索了一番，什么也没找到。");
    } else if (loot.type === "backpack") {
      if (loot.capacity > state.backpack.capacity) {
        const oldName = state.backpack.name;
        const oldCapacity = state.backpack.capacity;
        state.backpack = { id: loot.id, name: loot.name, type: loot.name, capacity: loot.capacity };
        setStory(`你发现了一个${loot.name}（${loot.capacity}格）！自动替换了旧的${oldName}（${oldCapacity}格）。`);
      } else {
        setStory(`你发现了一个${loot.name}（${loot.capacity}格），但不如你当前的${state.backpack.name}（${state.backpack.capacity}格），你放弃了它。`);
      }
    } else {
      const added = addItem(loot);
      if (!added) {
        setStory(`你发现了${loot.name}，但背包已满，无法携带。`);
      } else {
        setStory(`你发现了${loot.name}！`);
      }
    }
  }

  advanceTime(1);
  const wasFoggy2 = getState().weather === "大雾";
  if (wasFoggy2) advanceTime(1);
  updateStatusEffects();
  checkDeath();

  if (!state.gameOver) {
    showExploreOptionsState();
  }
}

// ---------- 战斗（丧尸）----------

/**
 * 处理与丧尸的战斗
 * @param {Object} zombieDef - 丧尸的定义数据
 * @param {string} combatMode - 战斗模式：'melee' 或 'ranged'
 */
function handleCombat(zombieDef, combatMode = "melee") {
  const state = getState();
  const zombie = { ...zombieDef, currentHp: zombieDef.hp, summoned: false };
  const combatLog = [];
  let round = 0;
  let currentMode = combatMode;

  const isCrippled = state.crash >= 100;
  if (isCrippled) {
    combatLog.push({ round: 0, text: "你过于崩溃导致无法战斗，只能挨打！" });
  }

  if (!isCrippled && currentMode === "ranged" && state.rangedWeapon) {
    const ammoId = state.rangedWeapon.ammoType;
    const ammo = state.ammo.find(a => a.id === ammoId);
    if (ammo && ammo.count > 0) {
      ammo.count--;
      if (ammo.count <= 0) {
        state.ammo = state.ammo.filter(a => a.id !== ammoId);
      }
      const critRate = state.rangedWeapon.critRate || 0;
      const isCrit = Math.random() < critRate;
      let damage = state.rangedWeapon.damage;
      if (isCrit) {
        damage *= 2;
        combatLog.push({ round: 0, text: `💀爆头！你用${state.rangedWeapon.name}命中${zombie.name}头部，造成${damage}点伤害！` });
      } else {
        combatLog.push({ round: 0, text: `你用${state.rangedWeapon.name}射击，造成${damage}点伤害。` });
      }
      zombie.currentHp -= damage;
      if (state.liuruyanRescued && Math.random() < 0.3 && zombie.currentHp > 0) {
        zombie.currentHp -= 20;
        combatLog.push({ round: 0, text: "柳如烟从暗处出手相助，造成20点伤害！" });
      }
      if (state.rangedWeapon.ammoType !== "箭矢") {
        state.rangedWeapon.integrity = Math.max(0, state.rangedWeapon.integrity - 1);
        if (state.rangedWeapon.integrity <= 0) {
          combatLog.push({ round: 0, text: `${state.rangedWeapon.name}耐久耗尽，彻底损坏了！` });
          state.rangedWeapon = null;
        }
      }
    } else {
      combatLog.push({ round: 0, text: "你已没有子弹，只能近战了。" });
      currentMode = "melee";
    }
  }

  while (zombie.currentHp > 0 && state.health > 0) {
    round++;

    if (Array.isArray(zombie.ability) && zombie.ability.includes("screech") && round % 2 === 0) {
      state.crash = Math.min(100, (state.crash || 0) + 5);
      combatLog.push({ round, text: `${zombie.name}发出尖啸，你的精神受到冲击！崩溃+5` });
    }

    if (currentMode === "ranged") {
      if (!canRangedCombat(state)) {
        combatLog.push({ round, text: "你已没有子弹，只能近战了。" });
        currentMode = "melee";
      } else if (state.rangedWeapon && state.rangedWeapon.integrity <= 0) {
        combatLog.push({ round, text: "你的枪已经坏了，只能近战了。" });
        state.rangedWeapon = null;
        currentMode = "melee";
      }
    }

    if (!isCrippled) {
      if (state._blindTurns > 0 && Math.random() < 0.5) {
        combatLog.push({ round, text: "你因为致盲效果打偏了！" });
        state._blindTurns = 0;
      } else {
        if (Math.random() < zombie.dodge) {
          combatLog.push({ round, text: "丧尸闪避了你的攻击！" });
        } else if (currentMode === "ranged" && state.rangedWeapon) {
          const ammoId = state.rangedWeapon.ammoType;
          const ammo = state.ammo.find(a => a.id === ammoId);
          if (ammo && ammo.count > 0) {
            ammo.count--;
            if (ammo.count <= 0) {
              state.ammo = state.ammo.filter(a => a.id !== ammoId);
            }
            const critRate = state.rangedWeapon.critRate || 0;
            const isCrit = Math.random() < critRate;
            let damage = state.rangedWeapon.damage;
            if (isCrit) {
              damage *= 2;
              combatLog.push({ round, text: `💀爆头！命中${zombie.name}头部，伤害翻倍！造成${damage}点伤害！` });
            } else {
              combatLog.push({ round, text: `你用${state.rangedWeapon.name}射击，造成${damage}点伤害。` });
            }
            zombie.currentHp -= damage;
            if (state.liuruyanRescued && Math.random() < 0.3 && zombie.currentHp > 0) {
              zombie.currentHp -= 20;
              combatLog.push({ round, text: "柳如烟从暗处出手相助，造成20点伤害！" });
            }
            if (state.rangedWeapon.ammoType !== "箭矢") {
              state.rangedWeapon.integrity = Math.max(0, state.rangedWeapon.integrity - 1);
              if (state.rangedWeapon.integrity <= 0) {
                combatLog.push({ round, text: `${state.rangedWeapon.name}耐久耗尽，彻底损坏了！` });
                state.rangedWeapon = null;
              }
            }
          }
        } else {
          let comboHits = 0;
          do {
            zombie.currentHp -= state.meleeWeapon.damage;
            if (state.liuruyanRescued && Math.random() < 0.3 && zombie.currentHp > 0) {
              zombie.currentHp -= 20;
              combatLog.push({ round, text: "柳如烟从暗处出手相助，造成20点伤害！" });
            }
            state.meleeWeapon.currentDurability = Math.max(0, state.meleeWeapon.currentDurability - 1);
            if (comboHits === 0) {
              combatLog.push({ round, text: `你用${state.meleeWeapon.name}攻击，造成${state.meleeWeapon.damage}点伤害。` });
            } else {
              combatLog.push({ round, text: `连击！追加攻击！造成${state.meleeWeapon.damage}点伤害！（${comboHits}连击）` });
            }
            if (state.meleeWeapon.currentDurability <= 0 && state.meleeWeapon.id !== "拳头") {
              combatLog.push({ round, text: `${state.meleeWeapon.name}耐久耗尽，彻底损坏了！` });
              state.meleeWeapon = { id: "拳头", name: "拳头", damage: 10, durability: Infinity, currentDurability: Infinity, comboRate: 0 };
            break;
          }
          comboHits++;
        } while (zombie.currentHp > 0 && Math.random() < (state.meleeWeapon.comboRate || 0));
        }
        state._blindTurns = 0;
      }
    } else {
      combatLog.push({ round, text: "你精神崩溃，无力还手……" });
    }

    if (zombie.currentHp <= 0) {
      break;
    }

    let playerDodged = false;
    if (currentMode === "ranged" && Math.random() < 0.6) {
      playerDodged = true;
      combatLog.push({ round, text: "你拿着枪保持距离，闪避了丧尸的攻击！" });
    }

    if (!playerDodged) {
      state.health -= zombie.damage;
      state.health = Math.max(0, state.health);

      if (Array.isArray(zombie.ability) && zombie.ability.includes("infect")) {
        state.infection = Math.min(100, state.infection + 5);
        combatLog.push({ round, text: `${zombie.name}的感染让你感到不适！感染值+5` });
      }

      if (Array.isArray(zombie.ability) && zombie.ability.includes("blind")) {
        state._blindTurns = 1;
        combatLog.push({ round, text: "你被致盲了，下一回合命中率降低！" });
      }

      if (Array.isArray(zombie.ability) && zombie.ability.includes("corrode")) {
        if (currentMode === "melee" && state.meleeWeapon.id !== "拳头") {
          state.meleeWeapon.currentDurability = Math.max(0, state.meleeWeapon.currentDurability - 5);
          combatLog.push({ round, text: "你的武器被腐蚀了！" });
        } else if (currentMode === "ranged" && state.rangedWeapon) {
          state.rangedWeapon.integrity = Math.max(0, state.rangedWeapon.integrity - 5);
          combatLog.push({ round, text: "你的武器被腐蚀了！" });
        }
      }

      if (Array.isArray(zombie.ability) && zombie.ability.includes("acid")) {
        const acidDamage = Math.floor(Math.random() * 10) + 15;
        state.health -= acidDamage;
        state.health = Math.max(0, state.health);
        combatLog.push({ round, text: `酸液喷射尸的酸液腐蚀了你！额外受到${acidDamage}点伤害！` });
      }

      if (Array.isArray(zombie.ability) && zombie.ability.includes("summon") && !zombie.summoned) {
        zombie.summoned = true;
        combatLog.push({ round, text: "群居尸母召唤了2只普通游荡丧尸！" });
        state.health -= 8;
        state.health = Math.max(0, state.health);
        combatLog.push({ round, text: "召唤丧尸对你造成了8点伤害。" });
        state.health -= 8;
        state.health = Math.max(0, state.health);
        combatLog.push({ round, text: "召唤丧尸对你造成了8点伤害。" });
      }

      combatLog.push({ round, text: `丧尸对你造成了${zombie.damage}点伤害。` });
    }
  }

  if (zombie.currentHp <= 0) {
    combatLog.push({ round: "胜利", text: `你击败了${zombie.name}！` });

    if (Array.isArray(zombie.ability) && zombie.ability.includes("selfDestruct")) {
      state.health -= zombie.damage;
      state.health = Math.max(0, state.health);
      combatLog.push({ round: "胜利", text: `${zombie.name}爆炸了！造成${zombie.damage}点伤害！` });
    }

    if (state.nurseZombieRescued) {
      state.health = Math.min(240, state.health + 20);
      combatLog.push({ round: "胜利", text: "露露薇为你简单进行了伤口清理，健康恢复了20。" });
    }

    if (Math.random() < 0.5) {
      const isFood = Math.random() < 0.5;
      let lootItem;
      if (isFood) {
        const food = FOODS[Math.floor(Math.random() * FOODS.length)];
        lootItem = { ...food };
      } else {
        const drink = DRINKS[Math.floor(Math.random() * DRINKS.length)];
        lootItem = { ...drink };
      }
      const added = addItem(lootItem);
      if (added) {
        combatLog.push({ round: "胜利", text: `丧尸身上掉落了一些${isFood ? '食物' : '饮品'}：${lootItem.name}。` });
      } else {
        combatLog.push({ round: "胜利", text: `丧尸身上掉落了一些${isFood ? '食物' : '饮品'}，但背包已满。` });
      }
    }
  }

  if (state.health <= 0) {
    combatLog.push({ round: "败北", text: "你被丧尸击倒了……" });
    checkDeath();
  }

  const logText = combatLog.map(entry => {
    if (typeof entry.round === "number") {
      return `[第${entry.round}回合] ${entry.text}`;
    }
    return entry.text;
  }).join("\n");

  const currentStory = state.story || "";
  setStory(currentStory + "\n\n--- 战斗记录 ---\n" + logText);

  return state.health <= 0;
}

// ---------- NPC 战斗与交互 ----------

/**
 * 触发幸存者遭遇事件
 */
function handleSurvivorEncounter() {
  setStory("你在探索时遇到了一个幸存者。他警惕地看着你，但似乎没有立即动手的打算。");
  setPhase("survivor_interact");
  setOptions([
    { text: "交易（用食物换子弹）", action: "survivor_trade" },
    { text: "背刺（偷袭幸存者）", action: "survivor_backstab" },
    { text: "离开", action: "survivor_leave" }
  ]);
}

/**
 * 触发悍匪遭遇事件
 */
function handleBanditEncounter() {
  const state = getState();
  const bandit = createNpcInstance('bandit');
  state._pendingNpc = bandit;
  setPhase("pre_combat_npc");
  const meleeName = state.meleeWeapon.name;
  const rangedName = state.rangedWeapon ? state.rangedWeapon.name : "无";
  const ammoInfo = getRangedAmmoInfo(state);
  setStory(`你遇到了${bandit.name}！他二话不说就朝你冲了过来！\n\n【近战】${meleeName}\n【远程】${rangedName} ${ammoInfo}`);
  const options = [
    { text: "近战作战", action: "combat_npc_melee" }
  ];
  if (canRangedCombat(state)) {
    options.push({ text: "远程作战", action: "combat_npc_ranged" });
  } else {
    options.push({ text: "远程作战（不可用：无弹药）", action: "combat_npc_ranged", disabled: true });
  }
  options.push({ text: "逃跑（10%）", action: "combat_npc_flee" });
  setOptions(options);
  return;
}

/**
 * 处理悍匪战斗前选择
 * @param {number} input - 玩家选择的选项编号
 */
function handlePreCombatNpcChoice(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const action = state.options[optionIndex].action;

  if (action === "combat_npc_flee") {
    if (Math.random() < 0.25) {
      setStory(`你成功从${state._pendingNpc?.name || "敌人"}的追击中逃脱了！`);
      advanceTime(1);
      updateStatusEffects();
      checkDeath();
      if (!state.gameOver) {
        showExploreOptionsState();
      }
    } else {
      setStory("逃跑失败！你被悍匪缠住了！被迫进入战斗！");
      setPhase("combat");
      setOptions([{ text: "战斗进行中...", action: "none" }]);
      const npc = state._pendingNpc;
      handleNpcCombat(npc, "melee");
    }
    return;
  }

  if (action === "combat_npc_melee") {
    setPhase("combat");
    setOptions([{ text: "战斗进行中...", action: "none" }]);
    const npc = state._pendingNpc;
    handleNpcCombat(npc, "melee");
    return;
  }

  if (action === "combat_npc_ranged") {
    if (!canRangedCombat(state)) {
      setStory("你没有可用的远程武器或弹药！只能近战了！");
      setPhase("combat");
      setOptions([{ text: "战斗进行中...", action: "none" }]);
      const npc = state._pendingNpc;
      handleNpcCombat(npc, "melee");
      return;
    }
    setPhase("combat");
    setOptions([{ text: "战斗进行中...", action: "none" }]);
    const npc = state._pendingNpc;
    handleNpcCombat(npc, "ranged");
    return;
  }
}

/**
 * 处理幸存者交互界面的选择
 * @param {number} input - 玩家输入的选项编号
 */
function handleSurvivorAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const action = state.options[optionIndex].action;

  if (action === "survivor_leave") {
    setStory("你选择不招惹幸存者，默默离开了。");
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    showExploreOptionsState();
    return;
  }

  if (action === "survivor_trade") {
    const trade = getRandomTrade();
    state._trade = trade;
    setPhase("trade_choice");
    setStory("幸存者愿意用子弹交换你的物资。");
    setOptions([
      { text: "用食物换子弹", action: "trade_food" },
      { text: "用饮品换子弹", action: "trade_drink" },
      { text: "返回", action: "trade_back" },
    ]);
    return;
  }

  if (action === "survivor_backstab") {
    const survivor = createNpcInstance('survivor');
    getState()._pendingNpc = survivor;
    setPhase("pre_combat_npc");
    setStory("你决定铤而走险，偷袭这个幸存者！\n\n【近战】" + getState().meleeWeapon.name + "\n【远程】" + (getState().rangedWeapon ? getState().rangedWeapon.name : "无") + " " + getRangedAmmoInfo(getState()));
    const meleeName = getState().meleeWeapon.name;
    const rangedName = getState().rangedWeapon ? getState().rangedWeapon.name : "无";
    const ammoInfo = getRangedAmmoInfo(getState());
    setStory(`你决定铤而走险，偷袭这个幸存者！\n\n【近战】${meleeName}\n【远程】${rangedName} ${ammoInfo}`);
    const options = [
      { text: "近战作战", action: "combat_npc_melee" }
    ];
    if (canRangedCombat(getState())) {
      options.push({ text: "远程作战", action: "combat_npc_ranged" });
    } else {
      options.push({ text: "远程作战（不可用：无弹药）", action: "combat_npc_ranged", disabled: true });
    }
    options.push({ text: "逃跑（10%）", action: "combat_npc_flee" });
    setOptions(options);
    return;
  }
}

/**
 * 处理与 NPC 的战斗
 * @param {Object} npc - NPC 实例数据
 * @param {string} combatMode - 战斗模式：'melee' 或 'ranged'
 */
function handleNpcCombat(npc, combatMode = "melee") {
  const state = getState();
  const combatLog = [];
  let round = 0;
  let currentMode = combatMode;

  const isCrippled = state.crash >= 100;
  if (isCrippled) {
    combatLog.push({ round: 0, text: "你过于崩溃导致无法战斗，只能挨打！" });
  }

  if (npc.hasRanged && Math.random() < 0.4) {
    const npcRangedDamage = Math.floor(Math.random() * 15) + 10;
    state.health -= npcRangedDamage;
    state.health = Math.max(0, state.health);
    combatLog.push({ round: 0, text: `${npc.name}拔出了远程武器朝你射击，造成${npcRangedDamage}点伤害！` });
  }

  if (!isCrippled && currentMode === "ranged" && state.rangedWeapon) {
    const ammoId = state.rangedWeapon.ammoType;
    const ammo = state.ammo.find(a => a.id === ammoId);
    if (ammo && ammo.count > 0) {
      ammo.count--;
      if (ammo.count <= 0) {
        state.ammo = state.ammo.filter(a => a.id !== ammoId);
      }
      const critRate = state.rangedWeapon.critRate || 0;
      const isCrit = Math.random() < critRate;
      let damage = state.rangedWeapon.damage;
      if (isCrit) {
        damage *= 2;
        combatLog.push({ round: 0, text: `💀爆头！你用${state.rangedWeapon.name}命中${npc.name}头部，造成${damage}点伤害！` });
      } else {
        combatLog.push({ round: 0, text: `你用${state.rangedWeapon.name}射击，造成${damage}点伤害。` });
      }
      npc.hp -= damage;
      if (state.liuruyanRescued && Math.random() < 0.3 && npc.hp > 0) {
        npc.hp -= 20;
        combatLog.push({ round: 0, text: "柳如烟从暗处出手相助，造成20点伤害！" });
      }
      if (state.rangedWeapon.ammoType !== "箭矢") {
        state.rangedWeapon.integrity = Math.max(0, state.rangedWeapon.integrity - 1);
        if (state.rangedWeapon.integrity <= 0) {
          combatLog.push({ round: 0, text: `${state.rangedWeapon.name}耐久耗尽，彻底损坏了！` });
          state.rangedWeapon = null;
        }
      }
    } else {
      combatLog.push({ round: 0, text: "你已没有子弹，只能近战了。" });
      currentMode = "melee";
    }
  }

  while (npc.hp > 0 && state.health > 0) {
    round++;

    if (currentMode === "ranged") {
      if (!canRangedCombat(state)) {
        combatLog.push({ round, text: "你已没有子弹，只能近战了。" });
        currentMode = "melee";
      } else if (state.rangedWeapon && state.rangedWeapon.integrity <= 0) {
        combatLog.push({ round, text: "你的枪已经坏了，只能近战了。" });
        state.rangedWeapon = null;
        currentMode = "melee";
      }
    }

    if (!isCrippled) {
      const playerDamage = state.meleeWeapon.damage;

      if (Math.random() < (npc.dodgeRate || 0.2)) {
        combatLog.push({ round, text: `${npc.name}闪避了你的攻击！` });
      } else if (currentMode === "ranged" && state.rangedWeapon) {
        const ammoId = state.rangedWeapon.ammoType;
        const ammo = state.ammo.find(a => a.id === ammoId);
        if (ammo && ammo.count > 0) {
          ammo.count--;
          if (ammo.count <= 0) {
            state.ammo = state.ammo.filter(a => a.id !== ammoId);
          }
          const critRate = state.rangedWeapon.critRate || 0;
          const isCrit = Math.random() < critRate;
          let damage = state.rangedWeapon.damage;
          if (isCrit) {
            damage *= 2;
            combatLog.push({ round, text: `💀爆头！命中${npc.name}头部，伤害翻倍！造成${damage}点伤害！` });
          } else {
            combatLog.push({ round, text: `你用${state.rangedWeapon.name}射击，造成${damage}点伤害。` });
          }
          npc.hp -= damage;
          if (state.liuruyanRescued && Math.random() < 0.3 && npc.hp > 0) {
            npc.hp -= 20;
            combatLog.push({ round, text: "柳如烟从暗处出手相助，造成20点伤害！" });
          }
          if (state.rangedWeapon.ammoType !== "箭矢") {
            state.rangedWeapon.integrity = Math.max(0, state.rangedWeapon.integrity - 1);
            if (state.rangedWeapon.integrity <= 0) {
              combatLog.push({ round, text: `${state.rangedWeapon.name}耐久耗尽，彻底损坏了！` });
              state.rangedWeapon = null;
            }
          }
        }
      } else {
        let comboHits = 0;
        do {
          npc.hp -= playerDamage;
          if (state.liuruyanRescued && Math.random() < 0.3 && npc.hp > 0) {
            npc.hp -= 20;
            combatLog.push({ round, text: "柳如烟从暗处出手相助，造成20点伤害！" });
          }
          state.meleeWeapon.currentDurability = Math.max(0, state.meleeWeapon.currentDurability - 1);
          if (comboHits === 0) {
            combatLog.push({ round, text: `你用${state.meleeWeapon.name}攻击，造成${playerDamage}点伤害。` });
          } else {
            combatLog.push({ round, text: `连击！追加攻击！造成${playerDamage}点伤害！（${comboHits}连击）` });
          }
          if (state.meleeWeapon.currentDurability <= 0 && state.meleeWeapon.id !== "拳头") {
            combatLog.push({ round, text: `${state.meleeWeapon.name}耐久耗尽，彻底损坏了！` });
            state.meleeWeapon = { id: "拳头", name: "拳头", damage: 10, durability: Infinity, currentDurability: Infinity, comboRate: 0 };
            break;
          }
          comboHits++;
        } while (npc.hp > 0 && Math.random() < (state.meleeWeapon.comboRate || 0));
      }
    } else {
      combatLog.push({ round, text: "你精神崩溃，无力还手……" });
    }

    if (npc.hp <= 0) break;

    let playerDodged = false;
    if (currentMode === "ranged" && Math.random() < 0.6) {
      playerDodged = true;
      combatLog.push({ round, text: "你拿着枪保持距离，闪避了攻击！" });
    }

    if (!playerDodged) {
      const npcDamage = npc.damage;
      state.health -= npcDamage;
      state.health = Math.max(0, state.health);
      combatLog.push({ round, text: `${npc.name}对你造成了${npcDamage}点伤害。` });
    }
  }

  if (npc.hp <= 0) {
    combatLog.push({ round: "胜利", text: `你击败了${npc.name}！` });

    if (npc.name === "马三") {
      const state = getState();
      state.outlawKilled = true;
      const ak47 = RANGED_WEAPONS.find(w => w.id === "AK47");
      const addedAk = addItem({ ...ak47 });
      const addedAmmo = addItem({ id: "7.62×39mm", name: "7.62×39mm", type: "ammo", count: 30 });
      if (addedAk && addedAmmo) {
        combatLog.push({ round: "胜利", text: "马三身上掉落：AK47×1、7.62×39mm×30" });
      } else {
        combatLog.push({ round: "胜利", text: "马三身上掉落了一些装备，但你的背包空间不足，部分物品无法携带。" });
      }
    } else if (npc.name === "黑影") {
      const gp100 = RANGED_WEAPONS.find(w => w.id === "GP100");
      const addedGun = addItem({ ...gp100 });
      const addedAmmo2 = addItem({ id: ".357 Magnum", name: ".357 Magnum", type: "ammo", count: 20 });
      if (addedGun && addedAmmo2) {
        combatLog.push({ round: "胜利", text: "黑影身上掉落：GP100×1、.357 Magnum×20" });
      } else {
        combatLog.push({ round: "胜利", text: "黑影身上掉落了一些装备，但你的背包空间不足，部分物品无法携带。" });
      }
    } else if (npc.name === "沉默的丧尸之王") {
      const s = getState();
      s.zombieKingDefeated = true;
      combatLog.push({ round: "胜利", text: "你击败了丧尸巢穴的真正主人！它的身躯轰然倒地，整个巢穴都为之震动。你在这场史无前例的战斗中活了下来，这将是末日后值得铭记的一刻。" });
    } else if (Math.random() < 0.8) {
      const loot = generateNpcLoot();
      const droppedItems = [];
      for (const item of loot) {
        const added = addItem(item);
        if (added) droppedItems.push(item.name);
      }
      if (droppedItems.length > 0) {
        combatLog.push({ round: "胜利", text: `${npc.name}身上掉落：${droppedItems.join("、")}` });
      }
      if (droppedItems.length < loot.length) {
        combatLog.push({ round: "胜利", text: "背包已满，部分物品无法携带。" });
      }
    }

    if (state.nurseZombieRescued) {
      state.health = Math.min(240, state.health + 20);
      combatLog.push({ round: "胜利", text: "露露薇为你简单进行了伤口清理，健康恢复了20。" });
    }

    if (npc.type === "wanderingTrader") {
      const cigCount = Math.floor(Math.random() * 4) + 2;
      const droppedCigs = [];
      for (let i = 0; i < cigCount; i++) {
        const cig = CIGARETTES[Math.floor(Math.random() * CIGARETTES.length)];
        const added = addItem({ ...cig });
        if (added) droppedCigs.push(cig.name);
      }
      if (droppedCigs.length > 0) {
        combatLog.push({ round: "胜利", text: `${npc.name}身上掉落香烟：${droppedCigs.join("、")}（${droppedCigs.length}支）` });
      }
      if (droppedCigs.length < cigCount) {
        combatLog.push({ round: "胜利", text: "背包已满，部分香烟无法携带。" });
      }
    }
  }

  if (state.health <= 0) {
    combatLog.push({ round: "败北", text: `你被${npc.name}杀死了……` });
  }

  const logText = combatLog.map(entry => {
    if (typeof entry.round === "number") {
      return `[第${entry.round}回合] ${entry.text}`;
    }
    return entry.text;
  }).join("\n");

  setStory((state.story || "") + "\n\n--- 战斗记录 ---\n" + logText);

  advanceTime(1);
  updateStatusEffects();
  checkDeath();

  if (!state.gameOver) {
    if (state.currentMap) {
      showExploreOptionsState();
    } else {
      showHomeOptions();
    }
  }
}

/**
 * 触发黑市商人遭遇事件
 */
function handleWanderingTraderEncounter() {
  setStory("一个背着大包小包的黑市商人出现在你面前。他咧嘴一笑：\"嘿，想不想做点买卖？我这儿什么都有！\"");
  setPhase("trader_interact");
  setOptions([
    { text: "香烟换子弹", action: "trader_ammo" },
    { text: "购买武器", action: "trader_weapon" },
    { text: "换随机食物（1支香烟）", action: "trader_food" },
    { text: "换随机饮品（1支香烟）", action: "trader_drink" },
    { text: "换随机水果（1支香烟）", action: "trader_fruit" },
    { text: "换种子（1支香烟）", action: "trader_seed" },
    { text: "背刺（偷袭黑市商人）", action: "trader_backstab" },
    { text: "离开", action: "trader_leave" }
  ]);
}

/**
 * 处理黑市商人交互界面的选择
 * @param {number} input - 玩家输入的选项编号
 */
function handleWanderingTraderAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const action = state.options[optionIndex].action;

  if (action === "trader_leave") {
    setStory("你告别了黑市商人，继续你的旅途。");
    showExploreOptionsState();
    return;
  }

  if (action === "trader_backstab") {
    const trader = createNpcInstance('wanderingTrader');
    state._pendingNpc = trader;
    setPhase("pre_combat_npc");
    const meleeName = state.meleeWeapon.name;
    const rangedName = state.rangedWeapon ? state.rangedWeapon.name : "无";
    const ammoInfo = getRangedAmmoInfo(state);
    setStory(`你决定铤而走险，偷袭这个黑市商人！但他显然早有防备……\n\n【近战】${meleeName}\n【远程】${rangedName} ${ammoInfo}`);
    const options = [
      { text: "近战作战", action: "combat_npc_melee" }
    ];
    if (canRangedCombat(state)) {
      options.push({ text: "远程作战", action: "combat_npc_ranged" });
    } else {
      options.push({ text: "远程作战（不可用：无弹药）", action: "combat_npc_ranged", disabled: true });
    }
    options.push({ text: "逃跑（10%）", action: "combat_npc_flee" });
    setOptions(options);
    return;
  }

  if (action === "trader_ammo") {
    if (state.cargo.length === 0) {
      setStory("黑市商人瞥了你一眼：\"你没香烟还想换子弹？去去去！\"");
      showExploreOptionsState();
      return;
    }
    setPhase("trader_buy_ammo");
    setStory(`黑市商人掏出一个弹药箱：\"说吧，要什么子弹？每支香烟换3~6发。\"\n你有${state.cargo.length}支香烟。`);
    const ammoOptions = AMMO.map((a, i) => ({
      text: `${a.name}（每支香烟换3~6发）`,
      action: "buy_ammo",
      index: i
    }));
    ammoOptions.push({ text: "返回", action: "trader_back", index: -1 });
    setOptions(ammoOptions);
    return;
  }

  if (action === "trader_weapon") {
    if (state.cargo.length === 0) {
      setStory("黑市商人摇摇头：\"一支香烟都没有，我可不会白送武器。\"");
      showExploreOptionsState();
      return;
    }
    setPhase("trader_buy_weapon");
    setStory(`黑市商人拍了拍他的货箱：\"武器可不便宜，远程更贵！\"\n你有${state.cargo.length}支香烟。`);
    setOptions([
      { text: "G17 手枪（远程 10~15支香烟）", action: "buy_g17", index: 0 },
      { text: "GP100 手枪（远程 10~15支香烟）", action: "buy_rugergp100", index: 1 },
      { text: "USP9 手枪（远程 10~15支香烟）", action: "buy_usp9", index: 2 },
      { text: "消防斧（近战 5~7支香烟）", action: "buy_fireaxe", index: 3 },
      { text: "警棍（近战 3~5支香烟）", action: "buy_police_baton", index: 4 },
      { text: "棒球棍（近战 2~3支香烟）", action: "buy_baseballbat", index: 5 },
      { text: "返回", action: "trader_back", index: -1 },
    ]);
    return;
  }

  if (action === "trader_seed") {
    if (state.cargo.length === 0) {
      setStory("黑市商人瞥了你一眼：\"没香烟还想买种子？\"");
      showExploreOptionsState();
      return;
    }
    const cig = state.cargo.pop();
    const added = addItem({ id: "seed", name: "种子", type: "building" });
    if (added) {
      setStory("黑市商用一包种子换走了你一支香烟。");
    } else {
      state.cargo.push(cig);
      setStory("背包已满，交易失败。黑市商把香烟还给了你。");
    }
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    showExploreOptionsState();
    return;
  }

  if (action === "trader_food" || action === "trader_drink" || action === "trader_fruit") {
    if (state.cargo.length === 0) {
      setStory("黑市商人摆摆手：\"没香烟？那就别浪费我时间。\"");
      showExploreOptionsState();
      return;
    }
    const pool = action === "trader_food" ? FOODS : (action === "trader_drink" ? DRINKS : FRUITS);
    const label = action === "trader_food" ? "食物" : (action === "trader_drink" ? "饮品" : "水果");
    const randomItemData = pool[Math.floor(Math.random() * pool.length)];
    const lootItem = { ...randomItemData };
    const cig = state.cargo.pop();
    const added = addItem(lootItem);
    if (added) {
      setStory(`黑市商人用${lootItem.name}换走了你一支香烟。`);
    } else {
      state.cargo.push(cig);
      setStory(`背包已满，交易失败。黑市商人把香烟还给了你。`);
    }
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    showExploreOptionsState();
    return;
  }
}

/**
 * 处理黑市商人购买弹药的选择
 * @param {number} input - 玩家输入的选项编号
 */
function handleTraderBuyAmmo(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const option = state.options[optionIndex];

  if (option.action === "trader_back") {
    handleWanderingTraderEncounter();
    return;
  }

  if (option.action === "buy_ammo") {
    const ammo = AMMO[option.index];
    if (!ammo || state.cargo.length === 0) {
      setStory("你没有任何香烟，无法兑换弹药。");
      showExploreOptionsState();
      return;
    }
    const perCig = Math.floor(Math.random() * 4) + 3;
    const totalAmmo = state.cargo.length * perCig;
    const count = state.cargo.length;
    const savedCargo = [...state.cargo];
    state.cargo = [];
    const added = addItem({ id: ammo.id, name: ammo.name, type: "ammo", count: totalAmmo });
    if (!added) {
      state.cargo = savedCargo;
      setStory("你的背包已满，无法装下更多弹药。");
      showExploreOptionsState();
      return;
    }
    setStory(`交易成功！你用${count}支香烟换来了${totalAmmo}发${ammo.name}（每支${perCig}发）。`);
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    showExploreOptionsState();
  }
}

/**
 * 处理黑市商人购买武器的选择
 * @param {number} input - 玩家输入的选项编号
 */
function handleTraderBuyWeapon(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const option = state.options[optionIndex];

  if (option.action === "trader_back") {
    handleWanderingTraderEncounter();
    return;
  }

  if (state.cargo.length === 0) {
    setStory("黑市商人瞪了你一眼：\"没香烟凑什么热闹？\"");
    showExploreOptionsState();
    return;
  }

  let weaponDef, costMin, costMax, costLabel;

  switch (option.action) {
    case "buy_g17":
      weaponDef = RANGED_WEAPONS.find(w => w.id === "G17");
      costMin = 10; costMax = 15; costLabel = "远程";
      break;
    case "buy_rugergp100":
      weaponDef = RANGED_WEAPONS.find(w => w.id === "GP100");
      costMin = 10; costMax = 15; costLabel = "远程";
      break;
    case "buy_usp9":
      weaponDef = RANGED_WEAPONS.find(w => w.id === "USP9");
      costMin = 10; costMax = 15; costLabel = "远程";
      break;
    case "buy_fireaxe":
      weaponDef = MELEE_WEAPONS.find(w => w.id === "消防斧");
      costMin = 5; costMax = 7; costLabel = "近战";
      break;
    case "buy_police_baton":
      weaponDef = MELEE_WEAPONS.find(w => w.id === "警棍");
      costMin = 3; costMax = 5; costLabel = "近战";
      break;
    case "buy_baseballbat":
      weaponDef = MELEE_WEAPONS.find(w => w.id === "棒球棍");
      costMin = 2; costMax = 3; costLabel = "近战";
      break;
    default:
      return;
  }

  if (!weaponDef) return;

  const cost = Math.floor(Math.random() * (costMax - costMin + 1)) + costMin;

  if (state.cargo.length < cost) {
    setStory(`黑市商人摇摇头：\"这${costLabel}武器要${cost}支香烟，你只有${state.cargo.length}支，不够啊。\"`);
    showExploreOptionsState();
    return;
  }

  const tempCigarettes = [];
  for (let i = 0; i < cost; i++) {
    tempCigarettes.push(state.cargo.pop());
  }

  const weaponItem = weaponDef.type === "melee"
    ? { ...weaponDef, currentDurability: weaponDef.durability }
    : { ...weaponDef };

  const added = addItem(weaponItem);
  if (!added) {
    for (const cig of tempCigarettes) {
      state.cargo.push(cig);
    }
    setStory("背包已满，交易失败。黑市商人把香烟还给了你。");
  } else {
    setStory(`交易成功！你用${cost}支香烟买下了一把${weaponDef.name}。黑市商人吹了个口哨。`);
  }

  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  showExploreOptionsState();
}

/**
 * 触发末日医生遭遇事件
 */
function handleDoctorEncounter() {
  setStory("一个穿着白大褂、戴着口罩的中年人正在角落里整理医药箱。看到你走近，他平静地说：\"我是末日医生。给我5份物资，我可以治疗你。\"");
  setPhase("doctor_interact");
  setOptions([
    { text: "用5份食物治疗", action: "doctor_food" },
    { text: "用5份饮品治疗", action: "doctor_drink" },
    { text: "用5份水果治疗", action: "doctor_fruit" },
    { text: "心理治疗（3食物，崩溃-30）", action: "doctor_psychology" },
    { text: "背刺（偷袭医生）", action: "doctor_backstab" },
    { text: "离开", action: "doctor_leave" }
  ]);
}

/**
 * 处理末日医生交互界面的选择
 * @param {number} input - 玩家输入的选项编号
 */
function handleDoctorAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const action = state.options[optionIndex].action;

  if (action === "doctor_leave") {
    setStory("你谢过医生，继续上路了。");
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    showExploreOptionsState();
    return;
  }

  if (action === "doctor_psychology") {
    const foodItems1 = state.food;
    if (foodItems1.length < 3) {
      setStory("你的食物不够，心理治疗需要3份食物。");
      handleDoctorEncounter();
      return;
    }
    for (let i = 0; i < 3; i++) {
      state.food.pop();
    }
    state.crash = Math.max(0, (state.crash || 0) - 30);
    setStory("末世游医给你进行了一段简短的心理疏导……你感觉心里好受了一些。崩溃-30。");
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    showExploreOptionsState();
    return;
  }

  if (action === "doctor_backstab") {
    setStory("你握紧了武器，但转念一想——在这个末世，医生太宝贵了。医生对你有用，所以你收起了心思。");
    setPhase("doctor_interact");
    setOptions([
      { text: "用5份食物治疗", action: "doctor_food" },
      { text: "用5份饮品治疗", action: "doctor_drink" },
      { text: "用5份水果治疗", action: "doctor_fruit" },
      { text: "离开", action: "doctor_leave" }
    ]);
    return;
  }

  const typeMap = {
    doctor_food: { type: "food", label: "食物", arr: state.food },
    doctor_drink: { type: "drinks", label: "饮品", arr: state.drinks },
    doctor_fruit: { type: "fruit", label: "水果", arr: state.other.filter(i => i.type === "fruit") },
  };

  const info = typeMap[action];
  if (!info) return;

  if (action === "doctor_fruit") {
    const fruits = state.other.filter(i => i.type === "fruit");
    if (fruits.length < 5) {
      setStory(`医生摇摇头：\"你只有${fruits.length}份水果，我需要5份。去多找些水果再来。\"`);
      advanceTime(1);
      updateStatusEffects();
      checkDeath();
      showExploreOptionsState();
      return;
    }
    let removed = 0;
    for (let i = state.other.length - 1; i >= 0 && removed < 5; i--) {
      if (state.other[i].type === "fruit") {
        state.other.splice(i, 1);
        removed++;
      }
    }
  } else {
    if (info.arr.length < 5) {
      setStory(`医生摇摇头：\"你只有${info.arr.length}份${info.label}，我需要5份。\"`);
      advanceTime(1);
      updateStatusEffects();
      checkDeath();
      showExploreOptionsState();
      return;
    }
    for (let i = 0; i < 5; i++) {
      info.arr.pop();
    }
  }

  state.health = Math.min(240, state.health + 120);
  setStory(`医生仔细地处理了你的伤口。你感觉好多了！（恢复了120点生命值）`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  showExploreOptionsState();
}

// ---------- 曙光阵地 ----------

/**
 * 显示曙光阵地专属菜单
 */
function showOutpostOptions() {
  if (getState().gameOver) return;
  setPhase("explore");
  const state = getState();
  const opts = [
    { text: "探索", action: "outpost_explore" },
    { text: "进食", action: "eat" },
    { text: "饮水", action: "drink" },
    { text: "医疗", action: "medicine" },
    { text: "装备", action: "equip" },
    { text: "回家", action: "goHome" },
    { text: "丢弃", action: "discard" },
    { text: "幸存者V", action: "npc_v" },
    { text: "幸存者小涵", action: "npc_xiaohan" },
    { text: "幸存者莉莉", action: "npc_lili" }
  ];
  if (state.phaseIndex >= 1 && state.phaseIndex <= 4) {
    opts.push({ text: "打工", action: "work" });
  }
  opts.push({ text: "乞讨物资", action: "beg_supplies" });
  setOptions(opts);
}

/**
 * 阵地探索 - 别人的地盘不能偷东西
 */
function handleOutpostExplore() {
  setStory("你四处张望了一下——这里是别人的地盘，偷东西不好吧。");
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  showOutpostOptions();
}

/**
 * 乞讨物资 - 每日限领1次
 */
function handleBegSupplies() {
  if (!canBegToday()) {
    setStory("今天已经领取了救济，明天再来吧。");
    showOutpostOptions();
    return;
  }
  const fruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
  const added = addItem({ ...fruit });
  if (added) {
    markBegDone();
    setStory(`阵地管理员递给你一份${fruit.name}。"省着点吃，明天再来。"`);
  } else {
    setStory("你的背包已满，无法领取救济物资。");
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  showOutpostOptions();
}
function handleWork() {
  const state = getState();
  if (state.phaseIndex < 1 || state.phaseIndex > 4) {
    setStory("现在不是打工的时间，白天再来吧。");
    showOutpostOptions();
    return;
  }
  state.hunger = Math.max(0, state.hunger - 6);
  state.hydration = Math.max(0, state.hydration - 6);
  state.crash = Math.min(100, state.crash + 5);
  const fruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
  const added = addItem({ ...fruit });
  let story = `你干了一天的活，获得了${fruit.name}。`;
  if (!added) story += " 但背包已满，物品掉落在地上了。";
  setStory(story);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  showOutpostOptions();
}
function handleClimbTower() {
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
function handlePickFruit() {
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
function handleExploreCave() {
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
function handleLootCorpse() {
  const state = getState();
  if (state.lastLootCorpseDay > 0 && state.day - state.lastLootCorpseDay < 3) {
    const remaining = 3 - (state.day - state.lastLootCorpseDay);
    setStory(`已经翻找得差不多了，再过 ${remaining} 天再来吧`);
    showExploreOptionsState();
    return;
  }
  const backpackIds = ["小腰包", "帆布背包", "运动背包"];
  const pickId = backpackIds[Math.floor(Math.random() * backpackIds.length)];
  const bp = LOOT_BACKPACKS.find(b => b.id === pickId);
  if (!bp) {
    setStory("搜刮尸体时出现了问题。");
    showExploreOptionsState();
    return;
  }
  state.lastLootCorpseDay = state.day;
  if (bp.capacity > state.backpack.capacity) {
    const oldBp = { type: state.backpack.type, capacity: state.backpack.capacity };
    state.other.push(oldBp);
    state.backpack = { id: bp.id, name: bp.name, type: bp.name, capacity: bp.capacity };
    setStory(`你从尸体上搜刮到了一个${bp.name}（容量${bp.capacity}），自动换上了更大的背包。`);
  } else {
    const added = addItem({ ...bp, type: "other" });
    if (added) {
      setStory(`你从尸体上搜刮到了一个${bp.name}（容量${bp.capacity}），放入了背包。`);
    } else {
      setStory(`你从尸体上搜刮到了一个${bp.name}（容量${bp.capacity}），但背包已满，无法携带。`);
    }
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  showExploreOptionsState();
}

// ---------- 亡命之徒（国道高速服务区）----------

function handleOutlawInteract() {
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

function handleOutlawChat() {
  const line = OUTLAW_DIALOGUES[Math.floor(Math.random() * OUTLAW_DIALOGUES.length)];
  setStory(line);
  showOutlawMenu();
}

function handleOutlawFight() {
  const state = getState();
  state._pendingNpc = {
    name: "马三",
    hp: 300,
    damage: Math.floor(Math.random() * 21) + 40,
    hasRanged: true,
    dodgeRate: 0.4,
  };
  setPhase("pre_combat_npc");
  setStory("马三冷笑一声，拔出了武器。\"来啊，让我看看你有什么本事！\"");
  setOptions([
    { text: "近战作战", action: "combat_npc_melee" },
    { text: "远程射击", action: "combat_npc_ranged" },
    { text: "逃跑（10%）", action: "combat_npc_flee" },
  ]);
}

function handleOutlawLeave() {
  setStory("你不敢招惹马三，悄悄地离开了。");
  showExploreOptionsState();
}

function handleSearchFoodLocker() {
  const state = getState();
  if (Math.random() < 0.3) {
    state.hunger = Math.min(100, state.hunger + 30);
    state.hydration = Math.min(100, state.hydration + 30);
    setStory("你翻找到了国潮外卖并饱餐了一顿。");
  } else {
    state.crash = Math.min(100, state.crash + 44);
    setStory("你吃到了过期外卖，肚子特别痛，崩溃度+44%");
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  showExploreOptionsState();
}

function handleMechanicInteract() {
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

function handleMechanicChat() {
  const line = MECHANIC_DIALOGUES[Math.floor(Math.random() * MECHANIC_DIALOGUES.length)];
  setStory(line);
  showMechanicMenu();
}

function handleMechanicTrade() {
  const state = getState();
  const toolIds = ["大扳手", "铁管", "铁铲", "撬棍"];
  let foundIdx = -1;
  for (const id of toolIds) {
    foundIdx = state.other.findIndex(i => i.id === id);
    if (foundIdx !== -1) break;
  }
  if (foundIdx === -1) {
    setStory("你没有什么可以拿来交易的东西。");
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
  setStory(`你用${toolName}与王铁柱交换了5颗${ammo.name}、${drink.name}和${food.name}。`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!getState().gameOver) {
    showMechanicMenu();
  }
}

function handleMechanicLeave() {
  setStory("你和王铁柱道别，离开了加工厂。");
  showExploreOptionsState();
}

function handleWolfInteract() {
  setPhase("explore");
  setStory("一个瘦骨嶙峋的老头蹲在墙角，看到你后眼神中充满了警惕和厌恶。");
  setOptions([
    { text: "对话", action: "wolf_chat" },
    { text: "离开", action: "wolf_leave" },
  ]);
}

function handleWolfChat() {
  const line = WOLF_DIALOGUES[Math.floor(Math.random() * WOLF_DIALOGUES.length)];
  setStory(line);
  setOptions([
    { text: "对话", action: "wolf_chat" },
    { text: "离开", action: "wolf_leave" },
  ]);
}

function handleWolfLeave() {
  setStory("你和老狼告别，离开了居民区。");
  showExploreOptionsState();
}

function handleExploreFactory() {
  const state = getState();
  if (state.lastFactoryExploreDay >= state.day) {
    setStory("今天已经探索过工厂内部了，明天再来吧。");
    showExploreOptionsState();
    return;
  }
  state.lastFactoryExploreDay = state.day;
  if (Math.random() < 0.3) {
    state.health -= 120;
    setStory("你意外碰到了爆炸物被炸伤了，扣120健康。");
  } else {
    const canned = FOODS.filter(f => f.id.includes("罐头"));
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

function handleViewRiver() {
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

function handleMaskedManInteract() {
  setPhase("explore");
  setStory("一个黑衣蒙面人——黑影——站在超市的阴影里，手里握着枪。他恶狠狠地盯着你，似乎随时准备扣动扳机。");
  setOptions([
    { text: "对抗", action: "masked_man_fight" },
    { text: "离开", action: "masked_man_leave" },
  ]);
}

function handleMaskedManFight() {
  const state = getState();
  state._pendingNpc = {
    name: "黑影",
    hp: 400,
    damage: Math.floor(Math.random() * 31) + 50,
    hasRanged: true,
    dodgeRate: 0.5,
  };
  setPhase("pre_combat_npc");
  setStory("黑影冷哼一声：\"找死！\"他迅速拔枪瞄准了你！");
  setOptions([
    { text: "近战作战", action: "combat_npc_melee" },
    { text: "远程射击", action: "combat_npc_ranged" },
    { text: "逃跑（25%）", action: "combat_npc_flee" },
  ]);
}

function handleMaskedManLeave() {
  setStory("你不想招惹黑影，悄悄退出了超市。");
  showExploreOptionsState();
}

function handleWarehouseGuardInteract() {
  setPhase("explore");
  setStory("一个穿着工装的大汉——老马——挡在工厂仓库门口，手里拿着一根铁棍。\"此路是我开，此树是我栽……不对，这仓库归我管，谁也不准进！\"");
  setOptions([
    { text: "对话", action: "warehouse_guard_chat" },
    { text: "离开", action: "warehouse_guard_leave" },
  ]);
}

function handleWarehouseGuardChat() {
  const line = WAREHOUSE_GUARD_DIALOGUES[Math.floor(Math.random() * WAREHOUSE_GUARD_DIALOGUES.length)];
  setStory(line);
  setOptions([
    { text: "对话", action: "warehouse_guard_chat" },
    { text: "离开", action: "warehouse_guard_leave" },
  ]);
}

function handleWarehouseGuardLeave() {
  showExploreOptionsState();
}

function handleNurseZombieInteract() {
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

function handleNurseZombieFeedSelect() {
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
  setOptions(opts);
}

function handleNurseZombieFeedConfirm(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.food.length) {
    handleNurseZombieInteract();
    return;
  }
  const foodItem = state.food[optionIndex];
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

function handleNurseZombieBringHome() {
  const state = getState();
  state.nurseZombieRescued = true;
  setStory("露露薇跟着你回到了幸存者帐篷，她现在是你忠实的伙伴了。");
  advanceTime(1);
  updateStatusEffects();
  showHomeOptions();
}

function handleNurseZombieLeave() {
  setStory("你决定不带走露露薇，独自离开了。");
  showExploreOptionsState();
}

function handlePoliceRaid() {
  const state = getState();
  if (Math.random() < 0.7) {
    state.health = Math.max(0, state.health - 50);
    setStory("你小心翼翼地翻找证物室，却不慎触发了警局遗留的陷阱！一阵爆炸将你掀翻在地，你被炸伤了，生命值 -50。");
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

function handleVeteranInteract() {
  setPhase("explore");
  setStory("一个穿着破烂军装的老兵蹲在检查站的角落里，手里紧握着一把步枪，嘴里不停地嘟囔着什么——你隐约听到他说他叫老赵。");
  setOptions([
    { text: "对话", action: "veteran_chat" },
    { text: "讨要子弹", action: "veteran_ammo" },
    { text: "离开", action: "veteran_leave" },
  ]);
}

function handleVeteranChat() {
  const state = getState();
  const line = NERVOUS_VETERAN_DIALOGUES[Math.floor(Math.random() * NERVOUS_VETERAN_DIALOGUES.length)];
  let result = line;
  advanceTime(1);
  if (Math.random() < 0.5) {
    state.health = Math.max(0, state.health - 40);
    result += "\n\n老兵突然狂躁起来，手中的步枪走火了！你被击中，生命值 -40。";
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

function handleVeteranLeave() {
  setStory("你离开了军事检查站。");
  showExploreOptionsState();
}

function handleVeteranAmmo() {
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
    state.health = Math.max(0, state.health - 40);
    setStory("老赵突然眼神一变，举起枪对准你：\"你是他们派来的奸细！滚！\"他扣动扳机，你被击中，生命值 -40。");
  }
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    handleVeteranInteract();
  }
}

function handleExploreTunnel() {
  const state = getState();
  const roll = Math.random();
  if (roll < 0.15) {
    const ammo = addItem({ id: "9mm", name: "9mm", type: "ammo", count: 20 });
    const food = addItem({ id: "压缩饼干", name: "压缩饼干", hunger: 40, type: "food" });
    setStory("你冒着风险深入隧道，在断裂的铁轨旁竟然发现了一个被遗落的物资箱！里面有一些弹药和食物。" + (ammo && food ? "" : "\n不过你的背包空间不足，部分物品无法携带。"));
  } else if (roll < 0.5) {
    state.health = Math.max(0, state.health - 80);
    setStory("隧道深处传来一声巨响，顶部的水泥板一块块砸了下来！你被塌方的石块砸中，生命值 -80。");
  } else if (roll < 0.8) {
    state.health = Math.max(0, state.health - 40);
    state.infection = Math.min(100, state.infection + 10);
    setStory("你深入隧道，空气中弥漫着刺鼻的化学气味。有毒气体泄漏了！你剧烈咳嗽，生命值 -40，感染值 +10。");
  } else {
    state.health = Math.max(0, state.health - 60);
    setStory("隧道中传来密密麻麻的脚步声——一群丧尸突然从暗处冲了出来！你被围攻，生命值 -60。");
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    showExploreOptionsState();
  }
}

function handleDoctorInteract() {
  const state = getState();
  if (state.doctorTradeDone) {
    setStory("博士正忙着用你给他的血清做实验，似乎没空理会你了。");
    showExploreOptionsState();
    return;
  }
  setPhase("explore");
  setStory(DOCTOR_INTRO);
  const serumCount = state.medicine.filter(m => m.id === "抗感染血清").length;
  const opts = [];
  if (serumCount >= 50) {
    opts.push({ text: "上交50支抗感染血清", action: "doctor_trade" });
  } else {
    opts.push({ text: `上交50支抗感染血清（你仅有${serumCount}支）`, action: "doctor_trade", disabled: true });
  }
  opts.push({ text: "对话", action: "doctor_chat" });
  opts.push({ text: "离开", action: "doctor_leave" });
  setOptions(opts);
}

function handleDoctorTrade() {
  const state = getState();
  const serumIndices = [];
  let removed = 0;
  for (let i = state.medicine.length - 1; i >= 0; i--) {
    if (state.medicine[i].id === "抗感染血清" && removed < 50) {
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
  const m700 = RANGED_WEAPONS.find(w => w.id === "M700");
  const addedGun = addItem({ ...m700 });
  const addedAmmo = addItem({ id: "7.62×51mm", name: "7.62×51mm", type: "ammo", count: 30 });
  state.doctorTradeDone = true;
  if (addedGun && addedAmmo) {
    setStory("博士接过50支血清，双手微微颤抖。\"太感谢了……这足以让我完成研究了！\"他递给你一把M700狙击步枪和三十发7.62×51mm子弹。\"这是我最后的私人物品，希望能帮到你。\"");
  } else {
    setStory("博士接过50支血清，递给你M700和子弹。但你的背包空间不足，部分物品无法携带！");
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    showExploreOptionsState();
  }
}

function handleDoctorChat() {
  const line = DOCTOR_DIALOGUES[Math.floor(Math.random() * DOCTOR_DIALOGUES.length)];
  setStory(line);
  const state = getState();
  const serumCount = state.medicine.filter(m => m.id === "抗感染血清").length;
  const opts = [];
  if (serumCount >= 50) {
    opts.push({ text: "上交50支抗感染血清", action: "doctor_trade" });
  } else {
    opts.push({ text: `上交50支抗感染血清（你仅有${serumCount}支）`, action: "doctor_trade", disabled: true });
  }
  opts.push({ text: "对话", action: "doctor_chat" });
  opts.push({ text: "离开", action: "doctor_leave" });
  setOptions(opts);
}

function handleDoctorLeave() {
  setStory("你告别了博士，离开了研究所。");
  showExploreOptionsState();
}

function handleZombieKingInteract() {
  const state = getState();
  if (state.zombieKingDefeated) {
    setStory("丧尸之王的尸体倒在地上，巢穴里恢复了死寂。这里已经没有什么值得挑战的了。");
    showExploreOptionsState();
    return;
  }
  state._pendingNpc = {
    name: "沉默的丧尸之王",
    hp: 420,
    damage: 115,
    hasRanged: false,
    dodgeRate: 0.25,
  };
  setPhase("pre_combat_npc");
  setStory(ZOMBIE_KING_INTRO);
  const options = [
    { text: "近战作战", action: "combat_npc_melee" }
  ];
  if (canRangedCombat(state)) {
    options.push({ text: "远程作战", action: "combat_npc_ranged" });
  } else {
    options.push({ text: "远程作战（不可用：无弹药）", action: "combat_npc_ranged", disabled: true });
  }
  options.push({ text: "逃跑（10%）", action: "combat_npc_flee" });
  setOptions(options);
}

function handleInfectedWoman() {
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

function handleInjectWoman() {
  const state = getState();
  const serumIndices = [];
  state.medicine.forEach((m, i) => {
    if (m.id === "抗感染血清") serumIndices.push(i);
  });
  if (serumIndices.length < 3) {
    setStory("你的抗感染血清不够，需要 3 支。");
    handleInfectedWoman();
    return;
  }
  for (let i = serumIndices.length - 1; i >= serumIndices.length - 3; i--) {
    removeItem("medicine", serumIndices[i]);
  }
  state.liuruyanRescued = true;
  setStory("你颤抖着双手，将三支抗感染血清依次注入她的体内。血清的效果几乎是立竿见影的——她剧烈地咳嗽了几声，皮肤上的溃烂开始肉眼可见地愈合。\n\n她缓缓睁开了眼睛，那是一双棕色的眼眸，清澈而迷茫。\n\n\"我……我这是在哪儿？\"她虚弱地问道。\n\n你向她说明了情况。她沉默了很久，泪水无声地滑落。\n\n\"谢……谢谢。我叫柳如烟。\"她的声音很轻，像是用尽了全身的力气。\"如果你不嫌弃的话……我想跟着你。虽然我可能帮不上什么大忙，但我可以帮你搜集一些物资……\"\n\n你点了点头。\n\n就这样，柳如烟成为了你的伙伴。从今以后，她每天都会外出为你搜集一些物资。");
  handleGoHome();
}

function handleIgnoreWoman() {
  setStory("你咬了咬牙，转身离开。身后传来她微弱的呻吟声，但你告诉自己——在这个末世，先活下去才是最重要的。");
  showExploreOptionsState();
}

function handleKillZombieWoman() {
  const state = getState();
  const zombieDef = getRandomZombie(state.currentMap);
  setPhase("pre_combat");
  state._pendingZombie = zombieDef;
  setStory("曾经的女人已经完全变成了丧尸，她嘶吼着朝你扑了过来！");
  setOptions([
    { text: "近战作战", action: "combat_melee" },
    { text: "远程射击", action: "combat_ranged" },
    { text: "逃跑（10%）", action: "combat_flee" },
  ]);
}

function handlePartnerHarvest() {
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

// ---------- 阵地 NPC（V/小涵/莉莉）----------

/**
 * 获取当前 npcId 的 NPC 配置
 * @param {string} npcId - NPC 标识
 */
function getNpcConfig(npcId) {
  return SURVIVOR_NPC.find(n => n.id === npcId);
}

/**
 * 生成 NPC header 文本（好感度+关系）
 * @param {string} npcId - NPC 标识
 */
function npcHeader(npcId) {
  const cfg = getNpcConfig(npcId);
  const aff = getNpcAffinity(npcId);
  return `${cfg.name} | 好感度：${aff} | 关系：${getAffinityLabel(aff)}`;
}

/**
 * 进入 NPC 交互界面
 * @param {string} npcId - v/xiaohan/lili
 */
function handleNpcInteract(npcId) {
  const cfg = getNpcConfig(npcId);
  if (!cfg) return;
  setPhase("npc_interact");
  getState()._npcId = npcId;
  const opts = [
    { text: "对话", action: "npc_chat" },
    { text: "送礼", action: "npc_gift" },
  ];
  const quest = getAvailableQuest(npcId);
  if (quest) {
    opts.push({ text: `做任务：${quest.name}`, action: "npc_quest" });
  }
  if (npcId === "lili") {
    opts.push({ text: "清除感染（永久）", action: "npc_cure_infection" });
    opts.push({ text: "回收远程武器（永久）", action: "npc_recycle_ranged" });
    opts.push({ text: "回收近战武器（永久）", action: "npc_recycle" });
    opts.push({ text: "修复弓弩（永久）", action: "npc_repair_bow" });
    opts.push({ text: "维修枪支（永久）", action: "npc_repair" });
  }
  if (npcId === "v" || npcId === "xiaohan") {
    opts.push({ text: "任务预览", action: "npc_preview" });
  }
  opts.push({ text: "离开", action: "npc_leave" });
  const header = npcHeader(npcId);
  setStory(`${header}\n${cfg.desc}`);
  setOptions(opts);
}

/**
 * 获取 NPC 当前可接的任务（null 表示无任务）
 * @param {string} npcId - NPC 标识
 */
function getAvailableQuest(npcId) {
  if (npcId === "v") {
    const aff = getNpcAffinity("v");
    if (!isQuestDone("v1") && aff >= 0) return { id: "v1", ...getNpcConfig("v").quests.v1 };
    if (isQuestDone("v1") && !isQuestDone("v2") && aff >= 30) return { id: "v2", ...getNpcConfig("v").quests.v2 };
    if (isQuestDone("v2") && !isQuestDone("v3") && aff >= 60) return { id: "v3", ...getNpcConfig("v").quests.v3 };
    if (isQuestDone("v3") && !isQuestDone("v5") && aff >= 120) return { id: "v5", ...getNpcConfig("v").quests.v5 };
    if (isQuestDone("v5") && !isQuestDone("v4") && aff >= 90) return { id: "v4", ...getNpcConfig("v").quests.v4 };
    if (isQuestDone("v4") && !isQuestDone("v6") && aff >= 150) return { id: "v6", ...getNpcConfig("v").quests.v6 };
    return null;
  }
  if (npcId === "xiaohan") {
    const aff = getNpcAffinity("xiaohan");
    if (!isQuestDone("xh0") && aff >= 0) return { id: "xh0", ...getNpcConfig("xiaohan").quests.xh0 };
    if (isQuestDone("xh0") && !isQuestDone("xh1") && aff >= 50) return { id: "xh1", ...getNpcConfig("xiaohan").quests.xh1 };
    if (isQuestDone("xh1") && !isQuestDone("xh4") && aff >= 90) return { id: "xh4", ...getNpcConfig("xiaohan").quests.xh4 };
    if (isQuestDone("xh4") && !isQuestDone("xh2") && aff >= 100) return { id: "xh2", ...getNpcConfig("xiaohan").quests.xh2 };
    if (isQuestDone("xh2") && !isQuestDone("xh5") && aff >= 120) return { id: "xh5", ...getNpcConfig("xiaohan").quests.xh5 };
    if (isQuestDone("xh5") && !isQuestDone("xh6") && aff >= 150) return { id: "xh6", ...getNpcConfig("xiaohan").quests.xh6 };
    return null;
  }
  if (npcId === "lili") {
    const aff = getNpcAffinity("lili");
    if (!isQuestDone("llGift") && aff >= 150) return { id: "llGift", ...getNpcConfig("lili").giftQuest };
    return null;
  }
  return null;
}

/**
 * 处理 NPC 交互界面的菜单选择
 * @param {number} input - 玩家输入
 */
function handleNpcAction(input) {
  const state = getState();
  const npcId = state._npcId;
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;
  const action = state.options[optionIndex].action;

  if (action === "npc_leave") {
    setStory(`你离开了${getNpcConfig(npcId).name}。`);
    showOutpostOptions();
    return;
  }
  if (action === "npc_chat") {
    handleNpcChat(npcId);
    return;
  }
  if (action === "npc_gift") {
    handleNpcGift(npcId);
    return;
  }
  if (action === "npc_quest") {
    handleNpcQuest(npcId);
    return;
  }
  if (action === "npc_recycle") {
    handleNpcRecycle(npcId);
    return;
  }
  if (action === "npc_repair") {
    handleNpcRepair(npcId);
    return;
  }
  if (action === "npc_cure_infection") {
    handleNpcCureInfection(npcId);
    return;
  }
  if (action === "npc_recycle_ranged") {
    handleNpcRecycleRanged(npcId);
    return;
  }
  if (action === "npc_repair_bow") {
    handleNpcRepairBow(npcId);
    return;
  }
  if (action === "npc_preview") {
    handleNpcQuestPreview(npcId);
    return;
  }
  if (action === "npc_preview_back") {
    handleNpcInteract(npcId);
    return;
  }
}

/**
 * 与 NPC 对话，随机增加 1~3 好感度
 * @param {string} npcId - NPC 标识
 */
function handleNpcChat(npcId) {
  const cfg = getNpcConfig(npcId);
  const aff = getNpcAffinity(npcId);
  
  let story;
  
  if (!canChatToday(npcId)) {
    const responses = [
      "\"抱歉，我今天有点忙，改天再聊吧。\"",
      "\"我还有事情要处理，先这样。\"",
      "\"今天太累了，不想说话……\"",
      "\"你已经聊了很多了，让我休息一下吧。\""
    ];
    const response = responses[Math.floor(Math.random() * responses.length)];
    story = `${npcHeader(npcId)}\n\n${cfg.name}${response}`;
  } else {
    const stage = getAffinityStage(aff);
    const dialogues = cfg.dialogues[stage] || cfg.dialogues.stranger || [];
    const line = dialogues[Math.floor(Math.random() * dialogues.length)];
    
    const gain = Math.floor(Math.random() * 3) + 1;
    addNpcAffinity(npcId, gain);
    incrementChatCount(npcId);
    
    story = `${npcHeader(npcId)}\n\n${line}\n\n（好感度 +${gain}）`;
    
    if (Math.random() < 0.3 && cfg.tips && cfg.tips.length > 0) {
      const tip = cfg.tips[Math.floor(Math.random() * cfg.tips.length)];
      story += `\n\n${tip}`;
    }
  }
  
  setPhase("npc_chat");
  getState()._npcId = npcId;
  setStory(story);
  setOptions([{ text: "返回", action: "npc_chat_back" }]);
  updateStatusEffects();
  checkDeath();
}

/**
 * 给 NPC 送礼 - 显示背包可选物品
 * @param {string} npcId - NPC 标识
 */
function handleNpcGift(npcId) {
  const state = getState();
  setPhase("npc_gift");
  const items = [];
  state.food.forEach((item, i) => items.push({ label: `[食物] ${item.name}`, category: "food", index: i }));
  state.drinks.forEach((item, i) => items.push({ label: `[饮品] ${item.name}`, category: "drinks", index: i }));
  state.medicine.forEach((item, i) => items.push({ label: `[药品] ${item.name}`, category: "medicine", index: i }));
  state.other.forEach((item, i) => items.push({ label: `[其他] ${item.name}`, category: "other", index: i }));
  state.cargo.forEach((item, i) => items.push({ label: `[货物] ${item.name}`, category: "cargo", index: i }));
  if (items.length === 0) {
    setStory("你的背包里没有任何可以送的东西。");
    handleNpcInteract(npcId);
    return;
  }
  items.push({ label: "返回", category: "back", index: -1 });
  const opts = items.map((item, i) => ({ text: item.label, action: "gift_select", index: i, giftItem: item }));
  setOptions(opts);
  setStory("选择要送给" + getNpcConfig(npcId).name + "的物品：");
}

/**
 * 确认送礼 - 移除物品，增加好感度
 * @param {number} input - 玩家输入
 */
function handleNpcGiftConfirm(input) {
  const state = getState();
  const npcId = state._npcId;
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;
  const option = state.options[optionIndex];
  const item = option.giftItem;
  
  if (!item || item.category === "back") {
    handleNpcInteract(npcId);
    return;
  }

  const removed = removeItem(item.category, item.index);
  if (!removed) {
    setStory("送礼物失败。");
    handleNpcInteract(npcId);
    return;
  }

  const gain = Math.floor(Math.random() * 4) + 2;
  addNpcAffinity(npcId, gain);
  const cfg = getNpcConfig(npcId);
  const header = npcHeader(npcId);
  setStory(`${header}\n\n你送出了${removed.name}。${cfg.name}似乎很高兴。\n\n（好感度 +${gain}）`);
  handleNpcInteract(npcId);
}

/**
 * 获取任务进度描述
 */
function getQuestProgress(quest) {
  const state = getState();
  const req = quest.require;
  
  if (quest.id === "v1") {
    return `当前进度：食物(${state.food.length}/1)，饮品(${state.drinks.length}/1)`;
  } else if (quest.id === "v2" || quest.id === "v3" || quest.id === "v4") {
    const count = state.medicine.filter(m => m.id === req.medicineId).length;
    return `当前进度：${req.medicineId}(${count}/${req.medicine})`;
  } else if (quest.id === "xh1" || quest.id === "xh2") {
    const count = state.drinks.filter(d => d.id === req.drinkId).length;
    return `当前进度：${req.drinkId}(${count}/${req.drinks})`;
  } else if (quest.id === "v5") {
    const c1 = state.medicine.filter(m => m.id === "医用急救包").length;
    const c2 = state.medicine.filter(m => m.id === "抗感染血清").length;
    return `当前进度：医用急救包(${c1}/6) 抗感染血清(${c2}/6)`;
  } else if (quest.id === "v6") {
    const allMeds = ["创可贴","葡萄糖服液","止痛片","肾上腺素","止血带","清创药","手术包","抗生素","抗感染血清","医用急救包","战地医疗箱"];
    const parts = allMeds.map(mid => {
      const c = state.medicine.filter(m => m.id === mid).length;
      return `${mid}(${Math.min(c,2)}/2)`;
    });
    return `当前进度：${parts.join(" ")}`;
  } else if (quest.id === "xh0") {
    return `当前进度：饮品(${state.drinks.length}/1)`;
  } else if (quest.id === "xh4") {
    const canned = ["黄桃罐头","豆类罐头","牛肉罐头","军粮罐头","沙丁鱼罐头","金枪鱼罐头","秋刀鱼罐头","青花鱼罐头"];
    const parts = canned.map(cid => {
      const c = state.food.filter(f => f.id === cid).length;
      return `${cid}(${Math.min(c,1)}/1)`;
    });
    return `当前进度：${parts.join(" ")}`;
  } else if (quest.id === "xh5") {
    const fruits = state.other.filter(i => i.type === "fruit");
    const allFruitIds = ["苹果","香蕉","橙子","雪梨","葡萄","西瓜","草莓","蓝莓","桃子","芒果"];
    const parts = allFruitIds.map(fid => {
      const c = fruits.filter(f => f.id === fid).length;
      return `${fid}(${Math.min(c,1)}/1)`;
    });
    return `当前进度：${parts.join(" ")}`;
  } else if (quest.id === "xh6") {
    const allDrinkIds = ["矿泉水","椰子汁","果粒橙","纯牛奶","优酸乳","苹果醋","魔爪饮料","电解质水","运动饮料","百味啤酒","动力啤酒","高度白酒"];
    const allFoodIds = ["小坚果","棒棒糖","能量棒","巧克力","干脆面","银耳羹","海苔脆","压缩饼干","小麦面包","黄桃罐头","豆类罐头","牛肉罐头","军粮罐头","沙丁鱼罐头","金枪鱼罐头","秋刀鱼罐头","青花鱼罐头"];
    const dparts = allDrinkIds.map(did => {
      const c = state.drinks.filter(d => d.id === did).length;
      return `${did}(${Math.min(c,1)}/1)`;
    });
    const fparts = allFoodIds.map(fid => {
      const c = state.food.filter(f => f.id === fid).length;
      return `${fid}(${Math.min(c,1)}/1)`;
    });
    return `当前进度：\n饮品：${dparts.join(" ")}\n食物：${fparts.join(" ")}`;
  }
  return "";
}

/**
 * 检查是否可以提交任务
 */
function canSubmitQuest(quest) {
  const state = getState();
  const req = quest.require;
  
  if (quest.id === "v1") {
    return state.food.length >= 1 && state.drinks.length >= 1;
  } else if (quest.id === "v2" || quest.id === "v3" || quest.id === "v4") {
    const count = state.medicine.filter(m => m.id === req.medicineId).length;
    return count >= req.medicine;
  } else if (quest.id === "xh1" || quest.id === "xh2") {
    const count = state.drinks.filter(d => d.id === req.drinkId).length;
    return count >= req.drinks;
  } else if (quest.id === "v5") {
    const count1 = state.medicine.filter(m => m.id === "医用急救包").length;
    const count2 = state.medicine.filter(m => m.id === "抗感染血清").length;
    return count1 >= 6 && count2 >= 6;
  } else if (quest.id === "v6") {
    const allMeds = ["创可贴","葡萄糖服液","止痛片","肾上腺素","止血带","清创药","手术包","抗生素","抗感染血清","医用急救包","战地医疗箱"];
    return allMeds.every(mid => state.medicine.filter(m => m.id === mid).length >= 2);
  } else if (quest.id === "xh0") {
    return state.drinks.length >= 1;
  } else if (quest.id === "xh4") {
    const canned = ["黄桃罐头","豆类罐头","牛肉罐头","军粮罐头","沙丁鱼罐头","金枪鱼罐头","秋刀鱼罐头","青花鱼罐头"];
    return canned.every(cid => state.food.filter(f => f.id === cid).length >= 1);
  } else if (quest.id === "xh5") {
    const fruits = state.other.filter(i => i.type === "fruit");
    const allFruitIds = ["苹果","香蕉","橙子","雪梨","葡萄","西瓜","草莓","蓝莓","桃子","芒果"];
    return allFruitIds.every(fid => fruits.filter(f => f.id === fid).length >= 1);
  } else if (quest.id === "xh6") {
    const allDrinkIds = ["矿泉水","椰子汁","果粒橙","纯牛奶","优酸乳","苹果醋","魔爪饮料","电解质水","运动饮料","百味啤酒","动力啤酒","高度白酒"];
    const allFoodIds = ["小坚果","棒棒糖","能量棒","巧克力","干脆面","银耳羹","海苔脆","压缩饼干","小麦面包","黄桃罐头","豆类罐头","牛肉罐头","军粮罐头","沙丁鱼罐头","金枪鱼罐头","秋刀鱼罐头","青花鱼罐头"];
    return allDrinkIds.every(did => state.drinks.filter(d => d.id === did).length >= 1) &&
           allFoodIds.every(fid => state.food.filter(f => f.id === fid).length >= 1);
  }
  return false;
}

/**
 * 处理 NPC 任务提交
 * @param {string} npcId - NPC 标识
 */
function handleNpcQuest(npcId) {
  const quest = getAvailableQuest(npcId);
  if (!quest) {
    setStory("当前没有可接的任务。");
    handleNpcInteract(npcId);
    return;
  }

  if (npcId === "lili" && quest.id === "llGift") {
    handleNpcQuestReward(npcId, quest);
    markQuestDone("llGift");
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    handleNpcInteract(npcId);
    return;
  }

  const canSubmit = canSubmitQuest(quest);
  const progress = getQuestProgress(quest);
  
  setPhase("npc_quest_confirm");
  getState()._npcId = npcId;
  getState()._currentQuest = quest;
  
  const cfg = getNpcConfig(npcId);
  const header = npcHeader(npcId);
  
  let questHint = "";
  if (quest.id === "v1") {
    questHint = `${cfg.name}盯着你："${quest.story}"\n\n【任务目标】${quest.desc}\n${progress}`;
  } else if (quest.id === "v2") {
    questHint = `${cfg.name}扔给你几个止血带："${quest.story}"\n\n【任务目标】${quest.desc}\n${progress}`;
  } else if (quest.id === "v3") {
    questHint = `${cfg.name}表情严肃："${quest.story}"\n\n【任务目标】${quest.desc}\n${progress}`;
  } else if (quest.id === "v4") {
    questHint = `${cfg.name}眼中闪过一丝赞赏："${quest.story}"\n\n【任务目标】${quest.desc}\n${progress}`;
  } else if (quest.id === "xh1") {
    questHint = `${cfg.name}双手合十："${quest.story}"\n\n【任务目标】${quest.desc}\n${progress}`;
  } else if (quest.id === "xh2") {
    questHint = `${cfg.name}眼睛亮晶晶的："${quest.story}"\n\n【任务目标】${quest.desc}\n${progress}`;
  } else if (quest.id === "v5") {
    questHint = `${cfg.name}眼中闪过期待："${quest.story}"\n\n【任务目标】${quest.desc}\n${progress}`;
  } else if (quest.id === "v6") {
    questHint = `${cfg.name}郑重地伸出双手："${quest.story}"\n\n【任务目标】${quest.desc}\n${progress}`;
  } else if (quest.id === "xh0") {
    questHint = `${cfg.name}热情地招呼你："${quest.story}"\n\n【任务目标】${quest.desc}\n${progress}`;
  } else if (quest.id === "xh4") {
    questHint = `${cfg.name}兴奋地拍手："${quest.story}"\n\n【任务目标】${quest.desc}\n${progress}`;
  } else if (quest.id === "xh5") {
    questHint = `${cfg.name}快要跳起来了："${quest.story}"\n\n【任务目标】${quest.desc}\n${progress}`;
  } else if (quest.id === "xh6") {
    questHint = `${cfg.name}几乎要哭了："${quest.story}"\n\n【任务目标】${quest.desc}\n${progress}`;
  }
  
  setStory(`${header}\n\n${questHint}\n\n奖励：${quest.reward.desc || "无"}`);
  
  if (canSubmit) {
    setOptions([
      { text: "收集好了，交给你", action: "quest_submit" },
      { text: "还没有，我再去收集", action: "quest_back" },
      { text: "询问任务详情", action: "quest_details" }
    ]);
  } else {
    setOptions([
      { text: "还没有，我再去收集", action: "quest_back" },
      { text: "询问任务详情", action: "quest_details" }
    ]);
  }
}

/**
 * 处理任务确认界面的选择
 */
function handleNpcQuestConfirm(input) {
  const state = getState();
  const npcId = state._npcId;
  const quest = state._currentQuest;
  const optionIndex = input - 1;
  
  if (optionIndex < 0 || optionIndex >= state.options.length) return;
  
  const action = state.options[optionIndex].action;
  
  if (action === "quest_back") {
    handleNpcInteract(npcId);
    return;
  }
  
  if (action === "quest_details") {
    const cfg = getNpcConfig(npcId);
    const header = npcHeader(npcId);
    
    let details = "";
    if (quest.id === "v1") {
      details = `${cfg.name}解释道："在这末世，食物和水是最基本的生存物资。给我各一份，我就教你怎么用匕首。"`;
    } else if (quest.id === "v2") {
      details = `${cfg.name}演示着："止血带能在战斗中救你一命。收集5个，我教你高级战斗技巧。"`;
    } else if (quest.id === "v3") {
      details = `${cfg.name}压低声音："抗感染血清是对付感染丧尸的关键。8个血清，换我最强的武器。"`;
    } else if (quest.id === "v4") {
      details = `${cfg.name}难得露出笑容："战地医疗箱是军方物资，非常稀有。10个……我把压箱底的P226给你。"`;
    } else if (quest.id === "xh1") {
      details = `${cfg.name}笑着说："牛奶对孩子们的成长很重要！10盒纯牛奶，我给你手术包作为谢礼~"`;
    } else if (quest.id === "xh2") {
      details = `${cfg.name}兴奋地说："优酸乳是我的最爱！15盒的话……我把私藏的抗生素都给你！"`;
    } else if (quest.id === "v5") {
      details = `${cfg.name}测试着你："医用急救包和抗感染血清，各6个。这能救不少人的命。准备好了吗？"`;
    } else if (quest.id === "v6") {
      details = `${cfg.name}深吸一口气："这是最后的试炼。每一种药品都有它的用途——给我每种2个，证明你对末世生存的理解。"`;
    } else if (quest.id === "xh0") {
      details = `${cfg.name}微笑道："新来的吗？不用紧张！给我随便一个饮品就好，我送你一些创可贴！"`;
    } else if (quest.id === "xh4") {
      details = `${cfg.name}掰着手指："黄豆罐头、牛肉罐头、黄桃罐头……所有罐头的营养都很重要！每样来一罐吧！"`;
    } else if (quest.id === "xh5") {
      details = `${cfg.name}流着口水："苹果、香蕉、西瓜……好久没吃新鲜水果了！每种水果都给我带一个好吗？"`;
    } else if (quest.id === "xh6") {
      details = `${cfg.name}拿出一个大清单："我要开一个派对！所有饮品种类和所有食物种类，每样一份！你能帮我采购吗？"`;
    }
    
    setStory(`${header}\n\n${details}\n\n${getQuestProgress(quest)}`);
    setOptions([
      { text: "返回", action: "quest_back" }
    ]);
    return;
  }
  
  if (action === "quest_submit") {
    const canSubmit = canSubmitQuest(quest);
    if (!canSubmit) {
      setStory(`${getNpcConfig(npcId).name}摇摇头："你的物资还不够完成这个任务。"`);
      handleNpcInteract(npcId);
      return;
    }
    
    if (!handleNpcQuestReward(npcId, quest)) {
      return;
    }
    
    const req = quest.require;
    if (quest.id === "v1") {
      state.food.pop();
      state.drinks.pop();
    } else if (quest.id === "v2" || quest.id === "v3" || quest.id === "v4") {
      let remain = req.medicine;
      for (let i = state.medicine.length - 1; i >= 0 && remain > 0; i--) {
        if (state.medicine[i].id === req.medicineId) {
          state.medicine.splice(i, 1);
          remain--;
        }
      }
    } else if (quest.id === "xh1" || quest.id === "xh2") {
      let remain = req.drinks;
      for (let i = state.drinks.length - 1; i >= 0 && remain > 0; i--) {
        if (state.drinks[i].id === req.drinkId) {
          state.drinks.splice(i, 1);
          remain--;
        }
      }
    } else if (quest.id === "v5") {
      for (const ri of quest.require.items) {
        let remain = ri.count;
        for (let i = state.medicine.length - 1; i >= 0 && remain > 0; i--) {
          if (state.medicine[i].id === ri.id) {
            state.medicine.splice(i, 1);
            remain--;
          }
        }
      }
    } else if (quest.id === "v6") {
      const allMeds = ["创可贴","葡萄糖服液","止痛片","肾上腺素","止血带","清创药","手术包","抗生素","抗感染血清","医用急救包","战地医疗箱"];
      for (const mid of allMeds) {
        let remain = 2;
        for (let i = state.medicine.length - 1; i >= 0 && remain > 0; i--) {
          if (state.medicine[i].id === mid) {
            state.medicine.splice(i, 1);
            remain--;
          }
        }
      }
    } else if (quest.id === "xh0") {
      state.drinks.pop();
    } else if (quest.id === "xh4") {
      const canned = ["黄桃罐头","豆类罐头","牛肉罐头","军粮罐头","沙丁鱼罐头","金枪鱼罐头","秋刀鱼罐头","青花鱼罐头"];
      for (const cid of canned) {
        for (let i = state.food.length - 1; i >= 0; i--) {
          if (state.food[i].id === cid) {
            state.food.splice(i, 1);
            break;
          }
        }
      }
    } else if (quest.id === "xh5") {
      const allFruitIds = ["苹果","香蕉","橙子","雪梨","葡萄","西瓜","草莓","蓝莓","桃子","芒果"];
      for (const fid of allFruitIds) {
        for (let i = state.other.length - 1; i >= 0; i--) {
          if (state.other[i].type === "fruit" && state.other[i].id === fid) {
            state.other.splice(i, 1);
            break;
          }
        }
      }
    } else if (quest.id === "xh6") {
      const allDrinkIds = ["矿泉水","椰子汁","果粒橙","纯牛奶","优酸乳","苹果醋","魔爪饮料","电解质水","运动饮料","百味啤酒","动力啤酒","高度白酒"];
      const allFoodIds = ["小坚果","棒棒糖","能量棒","巧克力","干脆面","银耳羹","海苔脆","压缩饼干","小麦面包","黄桃罐头","豆类罐头","牛肉罐头","军粮罐头","沙丁鱼罐头","金枪鱼罐头","秋刀鱼罐头","青花鱼罐头"];
      for (const did of allDrinkIds) {
        for (let i = state.drinks.length - 1; i >= 0; i--) {
          if (state.drinks[i].id === did) {
            state.drinks.splice(i, 1);
            break;
          }
        }
      }
      for (const fid of allFoodIds) {
        for (let i = state.food.length - 1; i >= 0; i--) {
          if (state.food[i].id === fid) {
            state.food.splice(i, 1);
            break;
          }
        }
      }
    }
    
    markQuestDone(quest.id);
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    handleNpcInteract(npcId);
  }
}

/**
 * 发放任务奖励
 * @returns {boolean} 是否发放成功
 */
function handleNpcQuestReward(npcId, quest) {
  const reward = quest.reward;
  const currentCount = getBackpackCount();
  const capacity = getState().backpack.capacity;

  if (reward.item) {
    if (currentCount >= capacity) {
      setStory("你的背包满了，清理后再来交任务吧。");
      handleNpcInteract(npcId);
      return false;
    }
  }
  if (reward.itemStack) {
    if (currentCount + reward.itemStack.length > capacity) {
      setStory("你的背包满了，清理后再来交任务吧。");
      handleNpcInteract(npcId);
      return false;
    }
  }

  let rewardDesc = reward.desc || "";

  if (reward.item) {
    if (reward.item === "小匕首") {
      const weapon = MELEE_WEAPONS.find(w => w.id === "小匕首");
      addItem({ ...weapon, currentDurability: weapon.durability });
    } else if (reward.item === "武士刀") {
      const weapon = MELEE_WEAPONS.find(w => w.id === "武士刀");
      addItem({ ...weapon, currentDurability: weapon.durability });
    } else if (reward.item === "电锯") {
      const weapon = MELEE_WEAPONS.find(w => w.id === "电锯");
      addItem({ ...weapon, currentDurability: weapon.durability });
    } else if (reward.item === "P226") {
      const weapon = RANGED_WEAPONS.find(w => w.id === "P226");
      addItem({ ...weapon });
      if (reward.ammo) {
        addItem({ id: reward.ammo.type, name: reward.ammo.type, type: "ammo", count: reward.ammo.count });
      }
      rewardDesc = "P226×1 + 9×19mm×50";
    } else if (reward.item === "UZI") {
      const weapon = RANGED_WEAPONS.find(w => w.id === "UZI");
      addItem({ ...weapon });
      if (reward.ammo) {
        addItem({ id: reward.ammo.type, name: reward.ammo.type, type: "ammo", count: reward.ammo.count });
      }
    } else if (reward.item === "M4A1") {
      const weapon = RANGED_WEAPONS.find(w => w.id === "M4A1");
      addItem({ ...weapon });
      if (reward.ammo) {
        addItem({ id: reward.ammo.type, name: reward.ammo.type, type: "ammo", count: reward.ammo.count });
      }
    } else if (reward.item === "指虎刀") {
      const weapon = MELEE_WEAPONS.find(w => w.id === "指虎刀");
      addItem({ ...weapon, currentDurability: weapon.durability });
    } else if (reward.item === "龙抄剑") {
      const weapon = MELEE_WEAPONS.find(w => w.id === "龙抄剑");
      addItem({ ...weapon, currentDurability: weapon.durability });
    }
  }
  if (reward.itemStack) {
    reward.itemStack.forEach(s => {
      if (s.id === "手术包") {
        for (let i = 0; i < s.count; i++) {
          addItem({ id: "手术包", name: "手术包", type: "medicine", effects: { health: 25, crash: -10 } });
        }
      } else if (s.id === "抗生素") {
        for (let i = 0; i < s.count; i++) {
          addItem({ id: "抗生素", name: "抗生素", type: "medicine", effects: { health: 35, infection: -25 } });
        }
      } else if (s.id === "创可贴") {
        for (let i = 0; i < s.count; i++) {
          addItem({ id: "创可贴", name: "创可贴", type: "medicine", effects: { health: 10 } });
        }
      } else if (s.id === "抗感染血清") {
        for (let i = 0; i < s.count; i++) {
          addItem({ id: "抗感染血清", name: "抗感染血清", type: "medicine", effects: { infection: -60 } });
        }
      } else if (s.id === "医用急救包") {
        for (let i = 0; i < s.count; i++) {
          addItem({ id: "医用急救包", name: "医用急救包", type: "medicine", effects: { health: 50, infection: -20 } });
        }
      } else if (s.id === "战地医疗箱") {
        for (let i = 0; i < s.count; i++) {
          addItem({ id: "战地医疗箱", name: "战地医疗箱", type: "medicine", effects: { health: 100, infection: -40, crash: -20 } });
        }
      }
    });
  }
  if (reward.cigarettes) {
    CIGARETTES.forEach(c => addItem({ ...c }));
    CIGARETTES.forEach(c => addItem({ ...c }));
    CIGARETTES.forEach(c => addItem({ ...c }));
    CIGARETTES.forEach(c => addItem({ ...c }));
    if (reward.ammo) {
      addItem({ id: reward.ammo.type, name: reward.ammo.type, type: "ammo", count: reward.ammo.count });
    }
    rewardDesc = "随机香烟×20 + 9×19mm×10";
  }

  setStory(`${npcHeader(npcId)}\n\n${quest.story}\n\n获得奖励：${rewardDesc}`);
  return true;
}

/**
 * 莉莉武器回收 - 自选近战武器换香烟
 * @param {string} npcId - NPC 标识
 */
function handleNpcRecycle(npcId) {
  const state = getState();
  const meleeItems = state.other.filter(i => i.type === "melee");
  if (meleeItems.length === 0) {
    setStory("你没有近战武器可回收。");
    handleNpcInteract(npcId);
    return;
  }
  setPhase("npc_gift");
  const items = meleeItems.map((item) => {
    const realIdx = state.other.indexOf(item);
    return { label: `${item.name}`, category: "other", index: realIdx, isRecycle: true };
  });
  items.push({ label: "返回", category: "back", index: -1 });
  setOptions(items.map((item, i) => ({ text: item.label, action: "gift_select", index: i, giftItem: item })));
  setStory("选择要回收的近战武器：");
  getState()._npcId = npcId;
}

/**
 * 莉莉回收确认
 * @param {number} input - 玩家输入
 */
function handleRecycleConfirm(input) {
  const state = getState();
  const npcId = state._npcId;
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;
  const option = state.options[optionIndex];
  const item = option.giftItem;
  
  if (!item || item.category === "back") {
    handleNpcInteract(npcId);
    return;
  }

  const removed = removeItem(item.category, item.index);
  if (!removed) {
    setStory("回收失败。");
    handleNpcInteract(npcId);
    return;
  }

  const cig = CIGARETTES[Math.floor(Math.random() * CIGARETTES.length)];
  const cigAdded = addItem({ ...cig });
  if (!cigAdded) {
    const typeMap = { food: state.food, drinks: state.drinks, medicine: state.medicine, other: state.other, cargo: state.cargo };
    typeMap[item.category].push(removed);
    setStory("背包已满，回收失败。");
    handleNpcInteract(npcId);
    return;
  }
  const cfg = getNpcConfig(npcId);
  setStory(`${npcHeader(npcId)}\n\n${cfg.recycleQuest.story}`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  handleNpcInteract(npcId);
}

/**
 * 莉莉远程武器回收 - 选择要回收的远程武器
 * @param {string} npcId - NPC 标识
 */
function handleNpcRecycleRanged(npcId) {
  const state = getState();
  const rangedItems = state.other.filter(i => i.type === "ranged");
  if (rangedItems.length === 0) {
    setStory("你没有远程武器可回收。");
    handleNpcInteract(npcId);
    return;
  }
  setPhase("npc_gift");
  const items = rangedItems.map((item) => {
    const realIdx = state.other.indexOf(item);
    return { label: `${item.name}`, category: "other", index: realIdx, isRecycleRanged: true };
  });
  items.push({ label: "返回", category: "back", index: -1 });
  setOptions(items.map((item, i) => ({ text: item.label, action: "gift_select", index: i, giftItem: item })));
  setStory("选择要回收的远程武器：");
  getState()._npcId = npcId;
}

/**
 * 莉莉远程武器回收确认
 * @param {number} input - 玩家输入的选项编号
 */
function handleRecycleRangedConfirm(input) {
  const state = getState();
  const npcId = state._npcId;
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;
  const option = state.options[optionIndex];
  const item = option.giftItem;

  if (!item || item.category === "back") {
    handleNpcInteract(npcId);
    return;
  }

  const removed = removeItem(item.category, item.index);
  if (!removed) {
    setStory("回收失败。");
    handleNpcInteract(npcId);
    return;
  }

  const cig1 = CIGARETTES[Math.floor(Math.random() * CIGARETTES.length)];
  const cig2 = CIGARETTES[Math.floor(Math.random() * CIGARETTES.length)];
  const added1 = addItem({ ...cig1 });
  const added2 = addItem({ ...cig2 });
  if (!added1 || !added2) {
    const typeMap = { food: state.food, drinks: state.drinks, medicine: state.medicine, other: state.other, cargo: state.cargo };
    typeMap[item.category].push(removed);
    setStory("背包已满，回收失败。");
    handleNpcInteract(npcId);
    return;
  }
  setStory(`你用${removed.name}换到了${cig1.name}和${cig2.name}。`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    handleNpcInteract(npcId);
  }
}

/**
 * 莉莉维修枪支 - 选择要维修的远程武器
 * @param {string} npcId - NPC 标识
 */
function handleNpcRepair(npcId) {
  const state = getState();
  const cigaretteCount = state.cargo.filter(c => c.type === "cigarette").length;
  if (cigaretteCount < 10) {
    setStory(`${getNpcConfig(npcId).name}撇撇嘴："你才${cigaretteCount}支香烟，不够哦！维修一把枪要10支香烟，再去收集一些吧。"`);
    handleNpcInteract(npcId);
    return;
  }

  const rangedItems = [];
  if (state.rangedWeapon) {
    rangedItems.push({ category: "equipped", index: -1, weapon: state.rangedWeapon, label: `[装备中] ${state.rangedWeapon.name}（完整度:${state.rangedWeapon.integrity}%）` });
  }
  state.other.forEach((item, i) => {
    if (item.type === "ranged") {
      rangedItems.push({ category: "other", index: i, weapon: item, label: `${item.name}（完整度:${item.integrity}%）` });
    }
  });

  const needRepair = rangedItems.filter(item => item.weapon.integrity < 100);

  if (rangedItems.length > 0 && needRepair.length === 0) {
    setStory("你的枪械无需维修。");
    handleNpcInteract(npcId);
    return;
  }

  if (needRepair.length === 0) {
    setStory("你没有枪械可维修。");
    handleNpcInteract(npcId);
    return;
  }

  setPhase("repair_select");
  const opts = needRepair.map((item, i) => ({ text: item.label, action: "repair_confirm", index: i, repairItem: item }));
  opts.push({ text: "返回", action: "repair_back", index: -1 });
  setOptions(opts);
  setStory(`你有${cigaretteCount}支香烟，请选择要维修的远程武器（消耗10支香烟）：`);
  getState()._npcId = npcId;
}

/**
 * 莉莉维修确认 - 扣除香烟，修复武器完整度
 * @param {number} input - 玩家输入
 */
function handleRepairConfirm(input) {
  const state = getState();
  const npcId = state._npcId;
  const cfg = getNpcConfig(npcId);
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;
  const option = state.options[optionIndex];
  const item = option.repairItem;

  if (!item || option.action === "repair_back") {
    handleNpcInteract(npcId);
    return;
  }

  let removed = 0;
  for (let i = state.cargo.length - 1; i >= 0 && removed < 10; i--) {
    if (state.cargo[i].type === "cigarette") {
      const cig = state.cargo.splice(i, 1)[0];
      removed++;
    }
  }

  let weaponName;
  if (item.category === "equipped") {
    state.rangedWeapon.integrity = Math.min(100, state.rangedWeapon.integrity + cfg.repairQuest.repair);
    weaponName = state.rangedWeapon.name;
  } else {
    state.other[item.index].integrity = Math.min(100, state.other[item.index].integrity + cfg.repairQuest.repair);
    weaponName = state.other[item.index].name;
  }

  const story = cfg.repairQuest.story.replace("{weapon}", weaponName);
  setStory(`${npcHeader(npcId)}\n\n${story}\n\n消耗了10支香烟，${weaponName}的完整度恢复了${cfg.repairQuest.repair}%。`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  handleNpcInteract(npcId);
}

/**
 * 莉莉修复弓弩 - 选择要修复的弓/弩
 * @param {string} npcId - NPC 标识
 */
function handleNpcRepairBow(npcId) {
  const state = getState();
  const cigaretteCount = state.cargo.filter(c => c.type === "cigarette").length;
  if (cigaretteCount < 5) {
    setStory("你只有" + cigaretteCount + "支香烟，修复弓弩需要5支。");
    handleNpcInteract(npcId);
    return;
  }

  const bowItems = [];
  if (state.rangedWeapon && state.rangedWeapon.ammoType === "箭矢") {
    bowItems.push({ category: "equipped", index: -1, weapon: state.rangedWeapon, label: `[装备中] ${state.rangedWeapon.name}（完整度:${state.rangedWeapon.integrity}%）` });
  }
  state.other.forEach((item, i) => {
    if (item.type === "ranged" && item.ammoType === "箭矢") {
      bowItems.push({ category: "other", index: i, weapon: item, label: `${item.name}（完整度:${item.integrity}%）` });
    }
  });

  const needRepair = bowItems.filter(item => item.weapon.integrity < 100);

  if (bowItems.length > 0 && needRepair.length === 0) {
    setStory("你的弓弩无需维修。");
    handleNpcInteract(npcId);
    return;
  }

  if (needRepair.length === 0) {
    setStory("你没有弓弩可维修。");
    handleNpcInteract(npcId);
    return;
  }

  setPhase("repair_bow_select");
  const opts = needRepair.map((item, i) => ({ text: item.label, action: "repair_bow_confirm", index: i, repairItem: item }));
  opts.push({ text: "返回", action: "repair_bow_back", index: -1 });
  setOptions(opts);
  setStory(`你有${cigaretteCount}支香烟，请选择要修复的弓/弩（消耗5支香烟）：`);
  getState()._npcId = npcId;
}

/**
 * 莉莉修复弓弩确认 - 扣除香烟，修复弓/弩完整度
 * @param {number} input - 玩家输入的选项编号
 */
function handleRepairBowConfirm(input) {
  const state = getState();
  const npcId = state._npcId;
  const cfg = getNpcConfig(npcId);
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;
  const option = state.options[optionIndex];
  const item = option.repairItem;

  if (!item || option.action === "repair_bow_back") {
    handleNpcInteract(npcId);
    return;
  }

  let removed = 0;
  for (let i = state.cargo.length - 1; i >= 0 && removed < 5; i--) {
    if (state.cargo[i].type === "cigarette") {
      state.cargo.splice(i, 1);
      removed++;
    }
  }

  let weaponName;
  if (item.category === "equipped") {
    state.rangedWeapon.integrity = Math.min(100, state.rangedWeapon.integrity + 50);
    weaponName = state.rangedWeapon.name;
  } else {
    state.other[item.index].integrity = Math.min(100, state.other[item.index].integrity + 50);
    weaponName = state.other[item.index].name;
  }

  setStory(`${npcHeader(npcId)}\n\n${cfg.repairBowQuest.story.replace("{weapon}", weaponName)}\n\n消耗了5支香烟，${weaponName}的完整度恢复了50%。`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    handleNpcInteract(npcId);
  }
}

/**
 * 莉莉清除感染 - 消耗10香烟清除50%感染
 * @param {string} npcId - NPC 标识
 */
function handleNpcCureInfection(npcId) {
  const state = getState();
  const cigaretteCount = state.cargo.filter(c => c.type === "cigarette").length;
  if (cigaretteCount < 10) {
    setStory("你没有足够的香烟，清除感染需要10支。");
    handleNpcInteract(npcId);
    return;
  }
  let removed = 0;
  for (let i = state.cargo.length - 1; i >= 0 && removed < 10; i--) {
    if (state.cargo[i].type === "cigarette") {
      state.cargo.splice(i, 1);
      removed++;
    }
  }
  state.infection = Math.max(0, state.infection - 50);
  setStory("她给你注射了一针淡黄色的药剂，感觉身体轻松了不少。感染值 -50。");
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    handleNpcInteract(npcId);
  }
}

/**
 * NPC任务预览 - 显示下一个未解锁任务的信息
 * @param {string} npcId - NPC 标识
 */
function handleNpcQuestPreview(npcId) {
  const state = getState();
  const aff = getNpcAffinity(npcId);
  const cfg = getNpcConfig(npcId);

  let questChains;
  if (npcId === "v") {
    questChains = [
      { id: "v1", aff: 0, q: cfg.quests.v1 },
      { id: "v2", aff: 30, q: cfg.quests.v2 },
      { id: "v3", aff: 80, q: cfg.quests.v3 },
      { id: "v5", aff: 120, q: cfg.quests.v5 },
      { id: "v4", aff: 150, q: cfg.quests.v4 },
      { id: "v6", aff: 150, q: cfg.quests.v6 },
    ];
  } else if (npcId === "xiaohan") {
    questChains = [
      { id: "xh0", aff: 0, q: cfg.quests.xh0 },
      { id: "xh1", aff: 50, q: cfg.quests.xh1 },
      { id: "xh4", aff: 90, q: cfg.quests.xh4 },
      { id: "xh2", aff: 100, q: cfg.quests.xh2 },
      { id: "xh5", aff: 120, q: cfg.quests.xh5 },
      { id: "xh6", aff: 150, q: cfg.quests.xh6 },
    ];
  } else {
    handleNpcInteract(npcId);
    return;
  }

  let foundNext = null;
  for (const chain of questChains) {
    if (!isQuestDone(chain.id) && aff < chain.aff) {
      foundNext = chain;
      break;
    }
    if (isQuestDone(chain.id)) continue;
    foundNext = chain;
    break;
  }

  const header = npcHeader(npcId);

  if (!foundNext || (foundNext && isQuestDone(foundNext.id))) {
    setStory(`${header}\n\n你已经完成了${cfg.name}的所有任务！`);
  } else {
    const needAff = foundNext.aff - aff;
    const quest = foundNext.q;
    let reqDesc = "";
    if (quest.require.items) {
      reqDesc = quest.require.items.map(ri => `${ri.id}×${ri.count}`).join(" + ");
    } else if (quest.require.allMedicine) {
      reqDesc = `所有药品各${quest.require.allMedicine}个`;
    } else if (quest.require.allCanned) {
      reqDesc = `所有罐头各${quest.require.allCanned}个`;
    } else if (quest.require.allFruits) {
      reqDesc = `所有水果各${quest.require.allFruits}个`;
    } else if (quest.require.allDrinks && quest.require.allFoods) {
      reqDesc = `所有饮品各${quest.require.allDrinks}个 + 所有食物各${quest.require.allFoods}个`;
    } else if (quest.require.drinks) {
      reqDesc = `任意饮品×${quest.require.drinks}`;
    }

    setStory(`${header}\n\n📋 下一任务预览：【${quest.name}】\n\n描述：${quest.desc}\n需求：${reqDesc}\n奖励：${quest.reward.desc || "未知"}\n\n当前好感度：${aff}\n所需好感度：${foundNext.aff}\n${needAff > 0 ? `还差 ${needAff} 点好感度才能解锁此任务。` : "好感度已满足，但前置任务未完成。"}`);
  }
  setOptions([{ text: "返回", action: "npc_preview_back" }]);
  getState()._npcId = npcId;
}

// ---------- 交易 ----------

/**
 * 处理交易类型选择
 * @param {number} input - 玩家输入的选项编号
 */
function handleTradeChoice(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const action = state.options[optionIndex].action;

  if (action === "trade_back") {
    state._trade = null;
    setStory("你放弃了交易。");
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    showExploreOptionsState();
    return;
  }

  const trade = state._trade;
  if (!trade) return;

  const type = action === "trade_food" ? "food" : "drink";
  const label = action === "trade_food" ? "食物" : "饮品";
  const inventory = state[type];

  if (inventory.length === 0) {
    setStory(`你没有可交易的${label}。`);
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    showExploreOptionsState();
    return;
  }

  state._tradeType = type;

  setPhase("trade_input");
  setStory(`你有${inventory.length}个${label}。请输入你要交易的${label}数量：`);

  const inputOptions = [];
  for (let i = 1; i <= inventory.length; i++) {
    const ammoCount = i * trade.ammoPerItem;
    inputOptions.push({ text: `交易${i}个${label}（获得${ammoCount}发${trade.ammoType}）`, action: "confirm", count: i });
  }
  inputOptions.push({ text: "返回", action: "back" });
  setOptions(inputOptions);
}

/**
 * 处理交易数量确认
 * @param {number} input - 玩家输入的选项编号
 */
function handleTradeInput(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const option = state.options[optionIndex];

  if (option.action === "back") {
    const trade = getRandomTrade();
    state._trade = trade;
    setPhase("trade_choice");
    setStory("幸存者愿意用子弹交换你的物资。");
    setOptions([
      { text: "用食物换子弹", action: "trade_food" },
      { text: "用饮品换子弹", action: "trade_drink" },
      { text: "返回", action: "trade_back" },
    ]);
    return;
  }

  const trade = state._trade;
  const type = state._tradeType;
  const count = option.count;

  for (let i = 0; i < count; i++) {
    state[type].pop();
  }

  const ammoCount = count * trade.ammoPerItem;
  addItem({ id: trade.ammoType, name: trade.ammoType, type: "ammo", count: ammoCount });

  setStory(`你用${count}个${type === "food" ? "食物" : "饮品"}换取了${ammoCount}发${trade.ammoType}。`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  showExploreOptionsState();
}

// ---------- 装备 ----------

/**
 * 进入装备选择界面
 */
function handleEquipSelect() {
  const state = getState();
  setPhase("equip_select");
  setStory("装备管理 - 请选择要管理的装备类型：");
  setOptions([
    { text: `近战武器（当前: ${state.meleeWeapon.name}）`, action: "melee" },
    { text: `远程武器（当前: ${state.rangedWeapon ? state.rangedWeapon.name : "无"}）`, action: "ranged" },
    { text: "弹药管理", action: "ammo" },
    { text: "返回", action: "back" }
  ]);
}

/**
 * 处理装备子菜单选择
 * @param {number} input - 玩家输入的选项编号
 */
function handleEquipSubAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const action = state.options[optionIndex].action;

  if (action === "back") {
    returnToMenu();
    return;
  }

  if (action === "melee") {
    const meleeItems = state.other.filter(item => item.type === "melee");
    const options = meleeItems.map((item, i) => ({
      text: `${item.name}（伤害:${item.damage} 耐久:${item.durability}）`,
      action: "equip_melee",
      index: i
    }));
    options.push({ text: "卸下当前武器（切换为拳头）", action: "equip_fist", index: -1 });
    options.push({ text: "返回", action: "back", index: -2 });
    setPhase("melee_equip");
    setOptions(options);
    return;
  }

  if (action === "ranged") {
    const rangedItems = state.other.filter(item => item.type === "ranged");
    const options = rangedItems.map((item, i) => ({
      text: `${item.name}（伤害:${item.damage} 暴击:${Math.round(item.critRate * 100)}% 弹药:${item.ammoType}）`,
      action: "equip_ranged_item",
      index: i
    }));
    if (state.rangedWeapon) {
      options.push({ text: `卸下${state.rangedWeapon.name}`, action: "unequip_ranged", index: -1 });
    }
    options.push({ text: "返回", action: "back", index: -2 });
    setPhase("ranged_equip");
    setOptions(options);
    return;
  }

  if (action === "ammo") {
    const ammoOptions = state.ammo.map((a, i) => ({
      text: `${a.name}（数量:${a.count}）`,
      action: "load_ammo",
      index: i
    }));
    ammoOptions.push({ text: "返回", action: "back", index: -1 });
    setPhase("ammo_load");
    setOptions(ammoOptions);
    return;
  }
}

/**
 * 处理近战武器装备选择
 * @param {number} input - 玩家输入的选项编号
 */
function handleMeleeEquipAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const option = state.options[optionIndex];

  if (option.action === "back") {
    handleEquipSelect();
    return;
  }

  if (option.action === "equip_fist") {
    if (state.meleeWeapon.id !== "拳头") {
      state.other.push(state.meleeWeapon);
      state.meleeWeapon = { id: "拳头", name: "拳头", damage: 10, durability: Infinity, currentDurability: Infinity };
    }
    setStory("你卸下了近战武器，现在使用拳头作战。");
    returnToMenu();
    return;
  }

  if (option.action === "equip_melee") {
    const meleeItems = state.other.filter(item => item.type === "melee");
    const item = meleeItems[option.index];
    if (!item) {
      setStory("无法装备该武器。");
      returnToMenu();
      return;
    }
    const result = equipMelee(item.id);
    if (result) {
      setStory(`你装备了${result.name}。`);
    } else {
      setStory("装备失败。");
    }
    returnToMenu();
    return;
  }
}

/**
 * 处理远程武器装备选择
 * @param {number} input - 玩家输入的选项编号
 */
function handleRangedEquipAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) {
    return;
  }

  const option = state.options[optionIndex];

  if (option.action === "back") {
    handleEquipSelect();
    return;
  }

  if (option.action === "unequip_ranged") {
    if (state.rangedWeapon) {
      state.other.push(state.rangedWeapon);
      const weaponName = state.rangedWeapon.name;
      state.rangedWeapon = null;
      setStory(`你卸下了${weaponName}。`);
    }
    returnToMenu();
    return;
  }

  if (option.action === "equip_ranged_item") {
    const rangedItems = state.other.filter(item => item.type === "ranged");
    const item = rangedItems[option.index];
    if (!item) {
      setStory("无法装备该武器。");
      returnToMenu();
      return;
    }
    const result = equipRanged(item.id);
    if (result) {
      setStory(`你装备了${result.name}。`);
    } else {
      setStory("装备失败。");
    }
    returnToMenu();
    return;
  }
}

/**
 * 处理弹药加载操作
 * @param {number} input - 玩家输入的选项编号
 */
function handleAmmoLoadAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) {
    return;
  }

  const option = state.options[optionIndex];

  if (option.action === "back") {
    handleEquipSelect();
    return;
  }

  if (option.action === "load_ammo") {
    const ammo = state.ammo[option.index];
    if (!ammo) return;

    if (!state.rangedWeapon) {
      setStory("你没有装备远程武器，无法装填弹药。");
      returnToMenu();
      return;
    }

    if (state.rangedWeapon.ammoType !== ammo.name) {
      setStory(`${ammo.name}不兼容你的${state.rangedWeapon.name}（需要${state.rangedWeapon.ammoType}）。`);
      returnToMenu();
      return;
    }

    setStory(`${state.rangedWeapon.name}已装填${ammo.name}（库存${ammo.count}发）。`);
    returnToMenu();
    return;
  }
}

// ---------- 丢弃 ----------

/**
 * 进入丢弃物品选择界面
 */
function handleDiscardSelect() {
  const state = getState();
  setPhase("discard_select");
  setStory("请选择要丢弃的物品：");
  const items = [];
  state.food.forEach((item, i) => items.push({ category: "food", index: i, label: `[食物] ${item.name}` }));
  state.drinks.forEach((item, i) => items.push({ category: "drinks", index: i, label: `[饮品] ${item.name}` }));
  state.medicine.forEach((item, i) => items.push({ category: "medicine", index: i, label: `[药品] ${item.name}` }));
  state.other.forEach((item, i) => items.push({ category: "other", index: i, label: `[其他] ${item.name}` }));
  state.cargo.forEach((c, i) => items.push({ category: "cargo", index: i, label: `[货物] ${c.name}` }));
  items.push({ category: "back", index: -1, label: "返回" });
  const opts = items.map((item, i) => ({ text: item.label, action: "discard", index: i }));
  setOptions(opts);
}

/**
 * 处理丢弃物品确认
 * @param {number} input - 玩家输入的选项编号
 */
function handleDiscardAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const option = state.options[optionIndex];

  const items = [];
  state.food.forEach((item, i) => items.push({ category: "food", index: i, name: item.name }));
  state.drinks.forEach((item, i) => items.push({ category: "drinks", index: i, name: item.name }));
  state.medicine.forEach((item, i) => items.push({ category: "medicine", index: i, name: item.name }));
  state.other.forEach((item, i) => items.push({ category: "other", index: i, name: item.name }));
  state.cargo.forEach((c, i) => items.push({ category: "cargo", index: i, name: c.name }));
  items.push({ category: "back", index: -1, name: "返回" });

  const item = items[option.index];
  if (!item || item.category === "back") {
    returnToMenu();
    return;
  }

  const removed = removeItem(item.category, item.index);
  if (removed) {
    setStory(`你丢弃了${removed.name}。`);
  }
  returnToMenu();
}

// ---------- 路由分发 ----------

/**
 * 通用选择阶段处理器 - 处理菜单中的物品选择
 * @param {number} input - 玩家输入的选项编号
 * @param {string} key - 背包分类键名
 * @param {string} label - 物品类型标签
 * @param {boolean} consume - 是否消耗（true: 使用, false: 仅选择）
 */
function handleSelectionPhase(input, key, label, consume) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const option = state.options[optionIndex];

  if (option.action === "back") {
    returnToMenu();
    return;
  }

  if (consume && state[key] && state[key][optionIndex]) {
    const item = state[key][optionIndex];
    const result = consumeItem(key, optionIndex);
    if (result) {
      let msg = `你使用了${item.name}。`;
      if (result.hunger) msg += ` 饱腹+${result.hunger}`;
      if (result.hydration) msg += ` 水分+${result.hydration}`;
      if (result.effects?.health) msg += ` 生命+${result.effects.health}`;
      if (result.effects?.infection) msg += ` 感染${result.effects.infection > 0 ? '+' : ''}${result.effects.infection}`;
      if (result.effects?.crash) msg += ` 崩溃${result.effects.crash > 0 ? '+' : ''}${result.effects.crash}`;
      setStory(msg);
      updateStatusEffects();
      checkDeath();
      returnToMenu();
    }
  }
}

/**
 * 处理主页和探索界面的操作选择
 * @param {number} input - 玩家输入的选项编号
 */
function handleChooseAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const action = state.options[optionIndex].action;

  switch (action) {
    case "sleep":
      handleSleep();
      break;
    case "eat":
      handleEatSelect();
      break;
    case "drink":
      handleDrinkSelect();
      break;
    case "medicine":
      handleMedicineSelect();
      break;
    case "equip":
      handleEquipSelect();
      break;
    case "goOut":
      if (getState().weather === "酸雨") {
        setStory("外面下着腐蚀性的酸雨，根本无法外出。");
        break;
      }
      handleGoOut();
      break;
    case "discard":
      handleDiscardSelect();
      break;
    case "save_game":
      handleSavePage();
      break;
    case "partner_harvest":
      handlePartnerHarvest();
      break;
    case "base_build":
      handleBaseBuild();
      break;
    case "upgrade_base":
      handleUpgradeBase();
      return;
    case "plant_crop":
      handlePlantCrop();
      return;
    case "view_crops":
      handleViewCrops();
      return;
    case "harvest_crops":
      handleHarvestCrops();
      return;
    case "build_warehouse":
      handleBuildWarehouse();
      return;
    case "open_warehouse":
      handleOpenWarehouse();
      return;
    case "back_to_home":
      showHomeOptions();
      return;
    case "back_to_base":
      handleBaseBuild();
      return;
    case "back_to_warehouse":
      handleOpenWarehouse();
      return;
    default:
      break;
  }
}

/**
 * 进入存档页面
 */
function handleSavePage() {
  if (getState().gameOver) return;
  setPhase("save_page");
  setStory("存档管理 - 选择一个存档槽位进行操作：\n输入对应编号选择槽位，输入 11 返回。");
  renderSaveSlotsAsOptions();
}

/**
 * 将存档槽位渲染为操作选项
 */
function renderSaveSlotsAsOptions() {
  const slots = getAllSlots();
  const opts = slots.map((slot, i) => {
    if (slot) {
      return { text: `槽位 ${i + 1}. ${slot.nickname} | 第${slot.day}天 | ${slot.timestamp}`, action: "save_slot", index: i };
    } else {
      return { text: `槽位 ${i + 1}. ——空——`, action: "save_slot", index: i };
    }
  });
  opts.push({ text: "返回", action: "back", index: -1 });
  setOptions(opts);
}

/**
 * 处理存档页面的槽位选择
 * @param {number} input - 玩家输入的选项编号
 */
function handleSavePageAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const option = state.options[optionIndex];

  if (option.action === "back") {
    returnToMenu();
    return;
  }

  const slotId = option.index;
  state._saveSlotId = slotId;
  state._saveSlotData = loadGame(slotId);

  setPhase("save_confirm");

  if (state._saveSlotData) {
    setStory(`槽位 ${slotId + 1}：${state._saveSlotData.nickname} | 第${state._saveSlotData.day}天 | ${state._saveSlotData.timestamp}\n⚠ 选择"保存覆盖"将永久覆盖此存档！`);
    setOptions([
      { text: "读取存档", action: "load" },
      { text: "保存覆盖", action: "overwrite" },
      { text: "删除存档", action: "delete" },
      { text: "返回", action: "back" }
    ]);
  } else {
    setStory(`槽位 ${slotId + 1}：空`);
    setOptions([
      { text: "保存存档到此", action: "save" },
      { text: "返回", action: "back" }
    ]);
  }
}

/**
 * 处理存档确认操作
 * @param {number} input - 玩家输入的选项编号
 */
function handleSaveConfirm(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const action = state.options[optionIndex].action;
  const slotId = state._saveSlotId;

  if (action === "back") {
    handleSavePage();
    return;
  }

  if (action === "save" || action === "overwrite") {
    const ok = saveGame(slotId, state, state.name);
    if (ok) {
      setStory(`存档已保存到槽位 ${slotId + 1}。`);
    } else {
      setStory("保存失败！");
    }
    handleSavePage();
    return;
  }

  if (action === "load") {
    const saveData = loadGame(slotId);
    if (!saveData || !saveData.gameState) {
      setStory("读取存档失败，存档数据损坏！");
      handleSavePage();
      return;
    }
    Object.assign(state, saveData.gameState);
    setStory(`存档读取成功！欢迎回来，${state.name}。`);
    setPhase("choose");
    if (state.currentMap) {
      showExploreOptionsState();
    } else {
      showHomeOptions();
    }
    return;
  }

  if (action === "delete") {
    const ok = deleteSlot(slotId);
    if (ok) {
      setStory(`槽位 ${slotId + 1} 的存档已删除。`);
    } else {
      setStory("删除失败！");
    }
    handleSavePage();
    return;
  }
}


/**
 * 处理食物消耗操作
 * @param {number} input - 玩家输入的选项编号
 */
function handleFoodAction(input) {
  handleSelectionPhase(input, "food", "食物", true);
}

/**
 * 处理饮品消耗操作
 * @param {number} input - 玩家输入的选项编号
 */
function handleDrinkAction(input) {
  handleSelectionPhase(input, "drinks", "饮品", true);
}

/**
 * 处理医疗物品使用操作
 * @param {number} input - 玩家输入的选项编号
 */
function handleMedicineAction(input) {
  handleSelectionPhase(input, "medicine", "医疗物品", true);
}

/**
 * 处理地图选择
 * @param {number} input - 玩家输入的选项编号
 */
function handleMapAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) {
    return;
  }

  const option = state.options[optionIndex];
  if (option.action === "back") {
    showHomeOptions();
    return;
  }

  const map = MAPS[option.index];
  if (!map) {
    return;
  }

  setCurrentMap(map);
  setLocation(map.name);
  let entryMsg = `你已进入${map.name}。`;
  if (map.danger.includes("炼狱") || map.danger.includes("绝境")) {
    entryMsg += "\n\n⚠️ 这里的危险程度超乎你的想象……";
  } else if (map.danger.includes("高危")) {
    entryMsg += "\n\n这里看起来很危险，空气中弥漫着死亡的气息。";
  }
  setStory(entryMsg);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  showExploreOptionsState();
}

/**
 * 处理探索界面的操作选择
 * @param {number} input - 玩家输入的选项编号
 */
function handleExploreAction(input) {
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= getState().options.length) {
    return;
  }

  const action = getState().options[optionIndex].action;

  switch (action) {
    case "explore":
      handleExplore();
      break;
    case "outpost_explore":
      handleOutpostExplore();
      break;
    case "eat":
      handleEatSelect();
      break;
    case "drink":
      handleDrinkSelect();
      break;
    case "medicine":
      handleMedicineSelect();
      break;
    case "equip":
      handleEquipSelect();
      break;
    case "goHome":
      handleGoHome();
      break;
    case "discard":
      handleDiscardSelect();
      break;
    case "npc_v":
      handleNpcInteract("v");
      break;
    case "npc_xiaohan":
      handleNpcInteract("xiaohan");
      break;
    case "npc_lili":
      handleNpcInteract("lili");
      break;
    case "beg_supplies":
      handleBegSupplies();
      break;
    case "work":
      handleWork();
      break;
    case "climb_tower":
      handleClimbTower();
      break;
    case "pick_fruit":
      handlePickFruit();
      break;
    case "explore_cave":
      handleExploreCave();
      break;
    case "loot_corpse":
      handleLootCorpse();
      break;
    case "outlaw_interact":
      handleOutlawInteract();
      break;
    case "outlaw_chat":
      handleOutlawChat();
      break;
    case "outlaw_fight":
      handleOutlawFight();
      break;
    case "outlaw_leave":
      handleOutlawLeave();
      break;
    case "search_food_locker":
      handleSearchFoodLocker();
      break;
    case "mechanic_interact":
      handleMechanicInteract();
      break;
    case "mechanic_chat":
      handleMechanicChat();
      break;
    case "mechanic_trade":
      handleMechanicTrade();
      break;
    case "mechanic_leave":
      handleMechanicLeave();
      break;
    case "infected_woman":
      handleInfectedWoman();
      break;
    case "inject_woman":
      handleInjectWoman();
      break;
    case "ignore_woman":
      handleIgnoreWoman();
      break;
    case "kill_zombie_woman":
      handleKillZombieWoman();
      break;
    case "wolf_interact":
      handleWolfInteract();
      break;
    case "wolf_chat":
      handleWolfChat();
      break;
    case "wolf_leave":
      handleWolfLeave();
      break;
    case "explore_factory":
      handleExploreFactory();
      break;
    case "view_river":
      handleViewRiver();
      break;
    case "masked_man":
      handleMaskedManInteract();
      break;
    case "masked_man_fight":
      handleMaskedManFight();
      break;
    case "masked_man_leave":
      handleMaskedManLeave();
      break;
    case "warehouse_guard_interact":
      handleWarehouseGuardInteract();
      break;
    case "warehouse_guard_chat":
      handleWarehouseGuardChat();
      break;
    case "warehouse_guard_leave":
      handleWarehouseGuardLeave();
      break;
    case "nurse_zombie_interact":
      handleNurseZombieInteract();
      break;
    case "nurse_zombie_feed":
      handleNurseZombieFeedSelect();
      break;
    case "nurse_zombie_bring_home":
      handleNurseZombieBringHome();
      break;
    case "nurse_zombie_leave":
      handleNurseZombieLeave();
      break;
    case "police_raid":
      handlePoliceRaid();
      break;
    case "veteran_interact":
      handleVeteranInteract();
      break;
    case "veteran_chat":
      handleVeteranChat();
      break;
    case "veteran_ammo":
      handleVeteranAmmo();
      break;
    case "veteran_leave":
      handleVeteranLeave();
      break;
    case "explore_tunnel":
      handleExploreTunnel();
      break;
    case "doctor_interact":
      handleDoctorInteract();
      break;
    case "doctor_trade":
      handleDoctorTrade();
      break;
    case "doctor_chat":
      handleDoctorChat();
      break;
    case "doctor_leave":
      handleDoctorLeave();
      break;
    case "zombie_king_interact":
      handleZombieKingInteract();
      break;
    default:
      break;
  }
}

// ---------- 基地建设功能 ----------

function handleUpgradeBase() {
  const state = getState();
  if (state.baseLevel >= 4) {
    setStory("你的基地已经是最高等级（幸存者别墅），无法继续升级。");
    showHomeOptions();
    return;
  }
  const cost = getBaseUpgradeCost(state.baseLevel + 1);
  if (!cost) {
    showHomeOptions();
    return;
  }
  const lines = [`升级到 ${getBaseName(state.baseLevel + 1)} 需要：`];
  let canAfford = true;
  const costNames = { wood: "木材", building_mat: "建筑材料", stone: "石头", nails: "铁钉", glass: "玻璃" };
  for (const [id, count] of Object.entries(cost)) {
    const have = countBuildingMaterial(state, id);
    lines.push(`${costNames[id]}: ${have}/${count} ${have >= count ? "✅" : "❌"}`);
    if (have < count) canAfford = false;
  }
  if (canAfford) {
    setStory(lines.join("\n") + "\n\n升级将消耗1天时间（8回合）。确定升级？");
    setPhase("base_upgrade_confirm");
    setOptions([
      { text: "确认升级", action: "confirm_upgrade" },
      { text: "返回", action: "back_to_base" },
    ]);
  } else {
    setStory(lines.join("\n") + "\n\n建筑材料不足，无法升级。");
    handleBaseBuild();
  }
}

function handleConfirmUpgrade() {
  const state = getState();
  const cost = getBaseUpgradeCost(state.baseLevel + 1);
  if (!cost) { showHomeOptions(); return; }
  for (const [id, count] of Object.entries(cost)) {
    removeBuildingMaterials(state, id, count);
  }
  state.baseLevel++;
  advanceTime(8);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    setStory(`在物资的堆积和你的努力下，基地升级成了${getBaseName(state.baseLevel)}！睡觉恢复效果提升了。`);
    showHomeOptions();
  }
}

function handlePlantCrop() {
  const state = getState();
  const emptySlot = state.crops.findIndex(c => c === null);
  if (emptySlot === -1) {
    setStory("你的耕地已满（最多5块），请先收获已成熟的作物。");
    handleBaseBuild();
    return;
  }
  const seedIdx = state.other.findIndex(i => i.id === "seed");
  if (seedIdx === -1) {
    setStory("你没有种子可以种植。种子可以在黑市商人处购买，或在谷仓/农家乐/露营地搜刮。");
    handleBaseBuild();
    return;
  }
  state.other.splice(seedIdx, 1);
  const crop = CROPS[Math.floor(Math.random() * CROPS.length)];
  state.crops[emptySlot] = { name: crop.name, matureTurns: crop.matureTurns, totalTurns: crop.matureTurns, reward: crop.reward };
  setStory(`你在耕地[${emptySlot + 1}] 种下了${crop.name}。预计${crop.matureTurns}回合后成熟。`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    handleBaseBuild();
  }
}

function handleViewCrops() {
  const state = getState();
  let lines = [];
  for (let i = 0; i < 5; i++) {
    const crop = state.crops[i];
    if (crop === null) {
      lines.push(`[${i + 1}] 空位`);
    } else if (crop.matureTurns <= 0) {
      lines.push(`[${i + 1}] ${crop.name} - ✅ 已成熟，可以收获！`);
    } else {
      lines.push(`[${i + 1}] ${crop.name} - 还需 ${crop.matureTurns} 回合成熟`);
    }
  }
  setStory(lines.join("\n"));
  handleBaseBuild();
}

function handleHarvestCrops() {
  const state = getState();
  let harvested = [];
  for (let i = 0; i < 5; i++) {
    const crop = state.crops[i];
    if (crop !== null && crop.matureTurns <= 0) {
      const foodCount = crop.reward.food || 0;
      for (let j = 0; j < foodCount; j++) {
        const foodItem = FOODS[Math.floor(Math.random() * FOODS.length)];
        const added = addItem({ ...foodItem });
        if (!added) {
          setStory("背包已满，部分作物无法全部收获。");
          handleBaseBuild();
          return;
        }
      }
      harvested.push(crop.name);
      state.crops[i] = null;
    }
  }
  if (harvested.length === 0) {
    setStory("没有已成熟的作物可以收获。");
  } else {
    setStory(`你收获了：${harvested.join("、")}。`);
  }
  handleBaseBuild();
}

function handleBuildWarehouse() {
  const state = getState();
  if (state.warehouseLevel >= 7) {
    setStory("仓库已经最大容量（100格），无需继续扩建。");
    handleBaseBuild();
    return;
  }
  const nextLevel = state.warehouseLevel + 1;
  const cost = getWarehouseUpgradeCost(nextLevel);
  if (!cost) {
    handleBaseBuild();
    return;
  }
  const costNames = { wood: "木材", building_mat: "建筑材料", stone: "石头", nails: "铁钉", glass: "玻璃" };
  let lines = [`升级到仓库 Lv${nextLevel}（${getWarehouseCapacity(nextLevel)}格）需要：`];
  let canAfford = true;
  for (const [id, count] of Object.entries(cost)) {
    const have = countBuildingMaterial(state, id);
    lines.push(`${costNames[id]}: ${have}/${count} ${have >= count ? "✅" : "❌"}`);
    if (have < count) canAfford = false;
  }
  if (canAfford) {
    setStory(lines.join("\n") + "\n\n确定建造？");
    setPhase("warehouse_upgrade_confirm");
    setOptions([
      { text: "确认建造", action: "confirm_warehouse" },
      { text: "返回", action: "back_to_base" },
    ]);
  } else {
    setStory(lines.join("\n") + "\n\n建筑材料不足。");
    handleBaseBuild();
  }
}

function handleConfirmWarehouse() {
  const state = getState();
  const nextLevel = state.warehouseLevel + 1;
  const cost = getWarehouseUpgradeCost(nextLevel);
  if (!cost) { showHomeOptions(); return; }
  for (const [id, count] of Object.entries(cost)) {
    removeBuildingMaterials(state, id, count);
  }
  state.warehouseLevel++;
  setStory(`仓库升级完成！现在容量为${getWarehouseCapacity(state.warehouseLevel)}格。`);
  advanceTime(2);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    showHomeOptions();
  }
}

function handleOpenWarehouse() {
  const state = getState();
  const cap = getWarehouseCapacity(state.warehouseLevel);
  setStory(`仓库 (${state.warehouse.length}/${cap}格)`);
  setPhase("warehouse_menu");
  setOptions([
    { text: "存入物品", action: "warehouse_deposit" },
    { text: "取出物品", action: "warehouse_withdraw" },
    { text: "返回", action: "back_to_base" },
  ]);
}

function handleWarehouseDeposit() {
  const state = getState();
  const cap = getWarehouseCapacity(state.warehouseLevel);
  if (state.warehouse.length >= cap) {
    setStory("仓库已满，无法存入。");
    handleOpenWarehouse();
    return;
  }
  let items = [];
  state.food.forEach((item, i) => items.push({ ...item, cat: "food", idx: i, label: `[食物] ${item.name}` }));
  state.drinks.forEach((item, i) => items.push({ ...item, cat: "drinks", idx: i, label: `[饮品] ${item.name}` }));
  state.medicine.forEach((item, i) => items.push({ ...item, cat: "medicine", idx: i, label: `[医疗] ${item.name}` }));
  state.other.forEach((item, i) => items.push({ ...item, cat: "other", idx: i, label: `[其他] ${item.name}` }));
  state.cargo.forEach((item, i) => items.push({ ...item, cat: "cargo", idx: i, label: `[货物] ${item.name}` }));
  if (items.length === 0) {
    setStory("背包中没有物品可以存入。");
    handleOpenWarehouse();
    return;
  }
  setPhase("warehouse_deposit_select");
  const opts = items.map((item, i) => ({ text: item.label, action: "do_deposit", index: i, depositItem: item }));
  opts.push({ text: "返回", action: "back_to_warehouse", index: -1 });
  setOptions(opts);
}

function handleWarehouseWithdraw() {
  const state = getState();
  if (state.warehouse.length === 0) {
    setStory("仓库是空的。");
    handleOpenWarehouse();
    return;
  }
  setPhase("warehouse_withdraw_select");
  const opts = state.warehouse.map((item, i) => ({ text: `${item.name}`, action: "do_withdraw", index: i }));
  opts.push({ text: "返回", action: "back_to_warehouse", index: -1 });
  setOptions(opts);
}

function handleDoDeposit(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) { handleOpenWarehouse(); return; }
  const option = state.options[optIdx];
  if (option.action !== "do_deposit") { handleOpenWarehouse(); return; }
  const item = option.depositItem;
  state.warehouse.push(item);
  const catMap = { food: state.food, drinks: state.drinks, medicine: state.medicine, other: state.other, cargo: state.cargo };
  catMap[item.cat].splice(item.idx, 1);
  setStory(`${item.name} 已存入仓库。`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    handleOpenWarehouse();
  }
}

function handleDoWithdraw(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) { handleOpenWarehouse(); return; }
  const option = state.options[optIdx];
  if (option.action !== "do_withdraw") { handleOpenWarehouse(); return; }
  const item = state.warehouse[option.index];
  const added = addItem({ ...item });
  if (!added) {
    setStory("你的背包已满，无法取出物品。");
    handleOpenWarehouse();
    return;
  }
  state.warehouse.splice(option.index, 1);
  setStory(`${item.name} 已从仓库取出。`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    handleOpenWarehouse();
  }
}

function handleWarehouseMenuAction(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;
  const action = state.options[optIdx].action;
  if (action === "warehouse_deposit") handleWarehouseDeposit();
  else if (action === "warehouse_withdraw") handleWarehouseWithdraw();
  else handleBaseBuild();
}

/**
 * 主操作分发函数 - 根据当前游戏阶段将玩家输入
 * 路由到对应的处理函数。这是游戏逻辑模块的
 * 核心入口点，连接玩家交互与游戏状态变更。
 *
 * @param {number} input - 玩家输入的数值选项（1-based）
 */
function getBaseName(level) {
  const names = ["幸存者帐篷", "幸存者木屋", "幸存者石屋", "幸存者房子", "幸存者别墅"];
  return names[level] || names[0];
}

function getBaseBonus(level) {
  const bonuses = [0, 5, 10, 15, 20];
  return bonuses[level] || 0;
}

function getBaseUpgradeCost(level) {
  const costs = [
    null,
    { wood: 15, building_mat: 5 },
    { wood: 25, building_mat: 10, stone: 10 },
    { wood: 40, building_mat: 20, stone: 20, nails: 10 },
    { wood: 60, building_mat: 35, stone: 35, nails: 25, glass: 10 },
  ];
  return costs[level] || null;
}

function getWarehouseCapacity(level) {
  return 30 + level * 10;
}

function getWarehouseUpgradeCost(level) {
  const costs = [
    null,
    { wood: 5, building_mat: 3 },
    { wood: 10, building_mat: 5 },
    { wood: 15, building_mat: 8, stone: 5 },
    { wood: 20, building_mat: 12, stone: 10, nails: 5 },
    { wood: 30, building_mat: 18, stone: 15, nails: 10 },
    { wood: 40, building_mat: 25, stone: 20, nails: 15 },
    { wood: 50, building_mat: 35, stone: 30, nails: 20, glass: 5 },
  ];
  return costs[level] || null;
}

function countBuildingMaterial(state, id) {
  return state.other.filter(i => i.id === id).length;
}

function removeBuildingMaterials(state, id, count) {
  let removed = 0;
  for (let i = state.other.length - 1; i >= 0 && removed < count; i--) {
    if (state.other[i].id === id) {
      state.other.splice(i, 1);
      removed++;
    }
  }
  return removed === count;
}

export { handleSavePage, returnToMenu };
export function handleAction(input) {
  const state = getState();

  if (input < 1) {
    return;
  }

  const phase = state.phase;

  switch (phase) {
    case "choose":
      handleChooseAction(input);
      break;
    case "save_page":
      handleSavePageAction(input);
      break;
    case "save_confirm":
      handleSaveConfirm(input);
      break;
    case "base_build":
      handleBaseBuildAction(input);
      break;
    case "eat_select":
      handleFoodAction(input);
      break;
    case "drink_select":
      handleDrinkAction(input);
      break;
    case "medicine_select":
      handleMedicineAction(input);
      break;
    case "map_select":
      handleMapAction(input);
      break;
    case "explore":
      handleExploreAction(input);
      break;
    case "pre_combat":
      handlePreCombatChoice(input);
      break;
    case "pre_combat_npc":
      handlePreCombatNpcChoice(input);
      break;
    case "survivor_interact":
      handleSurvivorAction(input);
      break;
    case "trader_interact":
      handleWanderingTraderAction(input);
      break;
    case "trader_buy_ammo":
      handleTraderBuyAmmo(input);
      break;
    case "trader_buy_weapon":
      handleTraderBuyWeapon(input);
      break;
    case "doctor_interact":
      handleDoctorAction(input);
      break;
    case "npc_interact":
      handleNpcAction(input);
      break;
    case "repair_select":
      handleRepairConfirm(input);
      break;
    case "repair_bow_select":
      handleRepairBowConfirm(input);
      break;
    case "npc_chat":
      if (input === 1) {
        const npcId = getState()._npcId;
        handleNpcInteract(npcId);
      }
      break;
    case "npc_gift": {
      const s = getState();
      const checkItem = s.options[input - 1];
      if (checkItem && checkItem.giftItem && checkItem.giftItem.isRecycle) {
        handleRecycleConfirm(input);
      } else if (checkItem && checkItem.giftItem && checkItem.giftItem.isRecycleRanged) {
        handleRecycleRangedConfirm(input);
      } else {
        handleNpcGiftConfirm(input);
      }
      break;
    }
    case "npc_quest_confirm":
      handleNpcQuestConfirm(input);
      break;
    case "equip_select":
      handleEquipSubAction(input);
      break;
    case "melee_equip":
      handleMeleeEquipAction(input);
      break;
    case "ranged_equip":
      handleRangedEquipAction(input);
      break;
    case "ammo_load":
      handleAmmoLoadAction(input);
      break;
    case "discard_select":
      handleDiscardAction(input);
      break;
    case "trade_choice":
      handleTradeChoice(input);
      break;
    case "trade_input":
      handleTradeInput(input);
      break;
    case "nurse_feed":
      handleNurseZombieFeedConfirm(input);
      break;
    case "base_upgrade_confirm":
      if (input === 1) handleConfirmUpgrade();
      else handleBaseBuild();
      break;
    case "warehouse_upgrade_confirm":
      if (input === 1) handleConfirmWarehouse();
      else handleBaseBuild();
      break;
    case "warehouse_menu":
      handleWarehouseMenuAction(input);
      break;
    case "warehouse_deposit_select":
      handleDoDeposit(input);
      break;
    case "warehouse_withdraw_select":
      handleDoWithdraw(input);
      break;
    case "game_over":
      if (input === 1) {
        updateBestRecord(state);
        resetState();
        showHomeOptions();
      }
      break;
    default:
      break;
  }
}