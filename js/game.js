import {
  getState,
  advanceTime,
  addItem,
  removeItem,
  consumeItem,
  equipMelee,
  equipRanged,
  useAmmo,
  reduceMeleeDurability,
  reduceRangedIntegrity,
  checkDeath,
  updateStatusEffects,
  setLocation,
  setCurrentMap,
  setPhase,
  setStory,
  setOptions,
  resetState
} from './state.js';

import {
  MAPS,
  NPCS,
  getRandomZombie,
  pickRandomLoot,
  getRandomTrade,
  createNpcInstance,
  generateNpcLoot,
} from './config.js';

function showHomeOptions() {
  setPhase("choose");
  setOptions([
    { text: "睡觉", action: "sleep" },
    { text: "进食", action: "eat" },
    { text: "饮水", action: "drink" },
    { text: "医疗", action: "medicine" },
    { text: "装备", action: "equip" },
    { text: "外出", action: "goOut" },
    { text: "丢弃", action: "discard" }
  ]);
}

function showExploreOptionsState() {
  setPhase("explore");
  setOptions([
    { text: "探索", action: "explore" },
    { text: "回家", action: "goHome" },
    { text: "丢弃", action: "discard" }
  ]);
}

function handleSleep() {
  const state = getState();
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
  const reduction = Math.floor(Math.random() * 16) + 10;
  state.crash = Math.max(0, state.crash - reduction);
  const healthRecovery = Math.floor(Math.random() * 16) + 10;
  state.health = Math.min(100, state.health + healthRecovery);
  advanceTime(4);
  updateStatusEffects();
  setStory(`你沉沉睡去，醒来后感觉精神好了一些。崩溃减轻了${reduction}%，健康恢复了${healthRecovery}点。`);
  checkDeath();
  showHomeOptions();
}

function handleEatSelect() {
  const state = getState();
  if (state.food.length === 0) {
    setStory("你没有食物可以吃。");
    showHomeOptions();
    return;
  }
  setPhase("eat_select");
  const foodOptions = state.food.map((f, i) => ({
    text: f.name + (f.hunger ? ` (饱腹+${f.hunger})` : ""),
    action: "eat_food",
    index: i
  }));
  foodOptions.push({ text: "返回", action: "back", index: -1 });
  setOptions(foodOptions);
}

function handleDrinkSelect() {
  const state = getState();
  if (state.drinks.length === 0) {
    setStory("你没有饮品可以喝。");
    showHomeOptions();
    return;
  }
  setPhase("drink_select");
  const drinkOptions = state.drinks.map((d, i) => ({
    text: d.name + (d.hydration ? ` (水分+${d.hydration})` : ""),
    action: "drink_item",
    index: i
  }));
  drinkOptions.push({ text: "返回", action: "back", index: -1 });
  setOptions(drinkOptions);
}

function handleMedicineSelect() {
  const state = getState();
  if (state.medicine.length === 0) {
    setStory("你没有医疗物品可用。");
    showHomeOptions();
    return;
  }
  setPhase("medicine_select");
  const medOptions = state.medicine.map((m, i) => ({
    text: m.name,
    action: "use_med",
    index: i
  }));
  medOptions.push({ text: "返回", action: "back", index: -1 });
  setOptions(medOptions);
}

function handleEquipSelect() {
  setPhase("equip_select");
  setOptions([
    { text: "装备近战", action: "melee_equip" },
    { text: "装备远程", action: "ranged_equip" },
    { text: "加载弹药", action: "ammo_load" },
    { text: "返回", action: "back" }
  ]);
}

function handleGoOut() {
  setPhase("map_select");
  const mapOptions = MAPS.map((m, i) => ({
    text: `${m.name} [${m.danger}]`,
    action: "select_map",
    index: i
  }));
  mapOptions.push({ text: "返回", action: "back", index: -1 });
  setOptions(mapOptions);
}

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

function handleExplore() {
  const state = getState();
  const map = state.currentMap;
  if (!map) {
    setStory("你不在任何地图中，无法探索。");
    showHomeOptions();
    return;
  }

  if (Math.random() < 0.1) {
    const npcType = Math.random() < 0.5 ? 'survivor' : 'bandit';
    if (npcType === 'survivor') {
      handleSurvivorEncounter();
    } else {
      handleBanditEncounter();
    }
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    return;
  }

  if (Math.random() < map.encounterRate) {
    const zombieDef = getRandomZombie(map.danger);
    handleCombat(zombieDef);
  } else {
    const loot = pickRandomLoot(map);
    if (!loot) {
      setStory("你仔细搜索了一番，什么也没找到。");
    } else if (loot.type === "backpack") {
      if (loot.capacity > state.backpack.capacity) {
        const oldName = state.backpack.name;
        const oldCapacity = state.backpack.capacity;
        state.backpack = { type: loot.id, name: loot.name, capacity: loot.capacity };
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
  updateStatusEffects();
  checkDeath();

  if (!state.gameOver) {
    showExploreOptionsState();
  }
}

function handleCombat(zombieDef) {
  const state = getState();
  const zombie = { ...zombieDef, currentHp: zombieDef.hp, summoned: false };
  const combatLog = [];
  const summonedZombies = [];
  let round = 0;

  if (state.rangedWeapon) {
    const ammoId = state.rangedWeapon.ammoType;
    const hasAmmo = state.ammo.some(a => a.id === ammoId && a.count > 0);
    if (hasAmmo) {
      useAmmo(ammoId);
      const weaponName = state.rangedWeapon.name;
      const weaponDamage = state.rangedWeapon.damage;
      zombie.currentHp -= weaponDamage;
      const breakMsg = reduceRangedIntegrity();
      combatLog.push({
        round: 0,
        text: `你用${weaponName}开了一枪，造成${weaponDamage}点伤害！`
      });
      if (breakMsg) {
        combatLog.push({
          round: 0,
          text: breakMsg
        });
      }
    }
  }

  while (zombie.currentHp > 0 && state.health > 0) {
    round++;

    if (Math.random() < zombie.dodge) {
      combatLog.push({ round, text: "丧尸闪避了你的攻击！" });
    } else {
      zombie.currentHp -= state.meleeWeapon.damage;
      const breakMsg = reduceMeleeDurability();
      combatLog.push({
        round,
        text: `你用${state.meleeWeapon.name}攻击，造成${state.meleeWeapon.damage}点伤害。`
      });
      if (breakMsg) {
        combatLog.push({ round, text: breakMsg });
      }
    }

    if (zombie.currentHp <= 0) {
      break;
    }

    state.health -= zombie.damage;

    if (zombie.ability === "infect") {
      state.infection = Math.min(100, state.infection + 5);
      combatLog.push({ round, text: "腐烂腐尸的感染让你感到不适！感染值+5" });
    }

    if (zombie.ability === "summon" && !zombie.summoned) {
      summonedZombies.push({ name: "普通游荡丧尸", damage: 8 });
      summonedZombies.push({ name: "普通游荡丧尸", damage: 8 });
      zombie.summoned = true;
      combatLog.push({ round, text: "群居尸母召唤了2只普通游荡丧尸！" });
    }

    combatLog.push({
      round,
      text: `丧尸对你造成了${zombie.damage}点伤害。`
    });

    for (let i = 0; i < summonedZombies.length; i++) {
      const sz = summonedZombies[i];
      state.health -= sz.damage;
      combatLog.push({
        round,
        text: `召唤丧尸对你造成了${sz.damage}点伤害。`
      });
    }
  }

  if (zombie.currentHp <= 0) {
    combatLog.push({ round: "胜利", text: `你击败了${zombie.name}！` });

    if (Math.random() < 0.5) {
      const roll = Math.random();
      if (roll < 0.5) {
        combatLog.push({ round: "胜利", text: "丧尸身上掉落了一些食物。" });
      } else {
        combatLog.push({ round: "胜利", text: "丧尸身上掉落了一些饮品。" });
      }
    }
  }

  if (state.health <= 0) {
    combatLog.push({ round: "败北", text: "你被丧尸击倒了……" });
  }

  const logText = combatLog.map(entry => {
    if (typeof entry.round === "number") {
      return `[第${entry.round}回合] ${entry.text}`;
    }
    return entry.text;
  }).join("\n");

  const currentStory = state.story || "";
  setStory(currentStory + "\n\n--- 战斗记录 ---\n" + logText);
}

function handleSurvivorEncounter() {
  setStory("你在探索时遇到了一个幸存者。他警惕地看着你，但似乎没有立即动手的打算。");
  setPhase("survivor_interact");
  setOptions([
    { text: "交易（用食物换子弹）", action: "survivor_trade" },
    { text: "背刺（偷袭幸存者）", action: "survivor_backstab" },
    { text: "离开", action: "survivor_leave" }
  ]);
}

function handleBanditEncounter() {
  const state = getState();
  const bandit = createNpcInstance('bandit');
  setStory("你遇到了一个悍匪！他二话不说就朝你冲了过来！");
  handleNpcCombat(bandit);
}

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
    if (state.food.length < trade.foodNeeded) {
      setStory(`幸存者想要${trade.desc}，但你的食物不够（需要${trade.foodNeeded}份，你只有${state.food.length}份）。交易失败。`);
      advanceTime(1);
      updateStatusEffects();
      checkDeath();
      showExploreOptionsState();
      return;
    }
    for (let i = 0; i < trade.foodNeeded; i++) {
      state.food.pop();
    }
    addItem({ id: trade.ammoType, name: trade.ammoType, type: "ammo", count: trade.ammoCount });
    setStory(`交易成功！你用${trade.foodNeeded}份食物换来了${trade.ammoCount}发${trade.ammoType}。`);
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    showExploreOptionsState();
    return;
  }

  if (action === "survivor_backstab") {
    const survivor = createNpcInstance('survivor');
    setStory("你决定铤而走险，偷袭这个幸存者！");
    handleNpcCombat(survivor);
    return;
  }
}

function handleNpcCombat(npc) {
  const state = getState();
  const combatLog = [];
  let round = 0;

  if (npc.hasRanged && Math.random() < 0.4) {
    const npcRangedDamage = Math.floor(Math.random() * 15) + 10;
    state.health -= npcRangedDamage;
    combatLog.push({ round: 0, text: `${npc.name}拔出了远程武器朝你射击，造成${npcRangedDamage}点伤害！` });
  }

  while (npc.hp > 0 && state.health > 0) {
    round++;

    const playerDamage = state.meleeWeapon.damage;
    if (round === 1 && !combatLog.some(l => l.round === 0)) {
      if (state.rangedWeapon) {
        const ammoId = state.rangedWeapon.ammoType;
        const hasAmmo = state.ammo.some(a => a.id === ammoId && a.count > 0);
        if (hasAmmo) {
          useAmmo(ammoId);
          npc.hp -= state.rangedWeapon.damage;
          const breakMsg = reduceRangedIntegrity();
          combatLog.push({ round, text: `你用${state.rangedWeapon.name}开了一枪，造成${state.rangedWeapon.damage}点伤害！` });
          if (breakMsg) combatLog.push({ round, text: breakMsg });
          if (npc.hp <= 0) break;
        }
      }
    }

    if (npc.hp > 0) {
      npc.hp -= playerDamage;
      const breakMsg = reduceMeleeDurability();
      combatLog.push({ round, text: `你用${state.meleeWeapon.name}攻击，造成${playerDamage}点伤害。` });
      if (breakMsg) combatLog.push({ round, text: breakMsg });
    }

    if (npc.hp <= 0) break;

    const npcDamage = npc.damage;
    state.health -= npcDamage;
    combatLog.push({ round, text: `${npc.name}对你造成了${npcDamage}点伤害。` });
  }

  if (npc.hp <= 0) {
    combatLog.push({ round: "胜利", text: `你击败了${npc.name}！` });

    if (Math.random() < 0.8) {
      const loot = generateNpcLoot();
      const droppedItems = [];
      for (const item of loot) {
        const added = addItem(item);
        if (added) droppedItems.push(item.name);
      }
      if (droppedItems.length > 0) {
        combatLog.push({ round: "胜利", text: `${npc.name}身上掉落：${droppedItems.join("、")}` });
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

function handleDiscardSelect() {
  const state = getState();
  const items = [];

  state.food.forEach((f, i) => items.push({ category: "food", index: i, label: `[食物] ${f.name}` }));
  state.drinks.forEach((d, i) => items.push({ category: "drinks", index: i, label: `[饮品] ${d.name}` }));
  state.medicine.forEach((m, i) => items.push({ category: "medicine", index: i, label: `[医疗] ${m.name}` }));
  state.other.forEach((o, i) => items.push({ category: "other", index: i, label: `[其他] ${o.name}` }));
  state.ammo.forEach((a, i) => items.push({ category: "ammo", index: i, label: `[弹药] ${a.name} ×${a.count}` }));

  if (items.length === 0) {
    setStory("背包空空如也，没什么可丢弃的。");
    if (state.currentMap) {
      showExploreOptionsState();
    } else {
      showHomeOptions();
    }
    return;
  }

  setPhase("discard_select");
  const options = items.map((item, i) => ({
    text: item.label,
    action: "discard_item",
    discardIndex: i,
  }));
  options.push({ text: "返回", action: "back", discardIndex: -1 });
  setOptions(options);

  state._discardItems = items;
}

function handleDiscardAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const option = state.options[optionIndex];

  if (option.action === "back") {
    state._discardItems = null;
    if (state.currentMap) {
      showExploreOptionsState();
    } else {
      showHomeOptions();
    }
    return;
  }

  if (option.action === "discard_item") {
    const items = state._discardItems;
    if (!items || option.discardIndex < 0 || option.discardIndex >= items.length) return;

    const target = items[option.discardIndex];
    let removedName;

    if (target.category === "ammo") {
      const ammo = state.ammo[target.index];
      if (ammo) {
        removedName = `${ammo.name} ×${ammo.count}`;
        state.ammo.splice(target.index, 1);
      }
    } else {
      const removed = removeItem(target.category, target.index);
      if (removed) removedName = removed.name;
    }

    state._discardItems = null;
    if (removedName) {
      setStory(`你丢弃了${removedName}。`);
    } else {
      setStory("丢弃失败。");
    }

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
}

function handleChooseAction(input, state) {
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) {
    return;
  }

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
      handleGoOut();
      break;
    case "discard":
      handleDiscardSelect();
      break;
    default:
      break;
  }
}

function handleSelectionPhase(input, type, label, skipTime = false) {
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

  const item = consumeItem(type, option.index);
  if (item) {
    const itemName = item.name;
    if (!skipTime) advanceTime(1);
    updateStatusEffects();
    setStory(`你使用了${itemName}。`);
    checkDeath();
  } else {
    setStory(`无法使用该${label}。`);
  }
  showHomeOptions();
}

function handleFoodAction(input) {
  handleSelectionPhase(input, "food", "食物", true);
}

function handleDrinkAction(input) {
  handleSelectionPhase(input, "drinks", "饮品", true);
}

function handleMedicineAction(input) {
  handleSelectionPhase(input, "medicine", "医疗物品");
}

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
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  showExploreOptionsState();
}

function handleEquipSubAction(input) {
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

  if (option.action === "melee_equip") {
    setPhase("melee_equip");
    const meleeItems = state.other.filter(item => item.type === "melee");
    const options = meleeItems.map((item, i) => ({
      text: `${item.name}（伤害${item.damage}，耐久${item.durability}）`,
      action: "equip_melee_item",
      index: i
    }));
    options.push({ text: "卸下（使用拳头）", action: "unequip_melee", index: -1 });
    options.push({ text: "返回", action: "back", index: -1 });
    setOptions(options);
    return;
  }

  if (option.action === "ranged_equip") {
    setPhase("ranged_equip");
    const rangedItems = state.other.filter(item => item.type === "ranged");
    const options = rangedItems.map((item, i) => ({
      text: `${item.name}（伤害${item.damage}，完整度${item.integrity}）`,
      action: "equip_ranged_item",
      index: i
    }));
    if (state.rangedWeapon) {
      options.push({ text: "卸下远程武器", action: "unequip_ranged", index: -1 });
    }
    options.push({ text: "返回", action: "back", index: -1 });
    setOptions(options);
    return;
  }

  if (option.action === "ammo_load") {
    setPhase("ammo_load");
    if (!state.rangedWeapon) {
      setStory("你没有装备远程武器。");
      showHomeOptions();
      return;
    }
    const ammoOptions = state.ammo.map((a, i) => ({
      text: `${a.name} ×${a.count}`,
      action: "load_ammo",
      index: i
    }));
    if (ammoOptions.length === 0) {
      setStory("你没有弹药可以加载。");
      showHomeOptions();
      return;
    }
    ammoOptions.push({ text: "返回", action: "back", index: -1 });
    setOptions(ammoOptions);
    return;
  }
}

function handleMeleeEquipAction(input) {
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

  if (option.action === "unequip_melee") {
    const result = equipMelee("拳头");
    if (result) {
      setStory("你卸下了近战武器，现在使用拳头。");
    } else {
      setStory("你现在使用拳头。");
    }
    showHomeOptions();
    return;
  }

  if (option.action === "equip_melee_item") {
    const meleeItems = state.other.filter(item => item.type === "melee");
    const item = meleeItems[option.index];
    if (!item) {
      setStory("无法装备该武器。");
      showHomeOptions();
      return;
    }
    const result = equipMelee(item.id);
    if (result) {
      setStory(`你装备了${result.name}。`);
    } else {
      setStory("装备失败。");
    }
    showHomeOptions();
    return;
  }
}

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
    showHomeOptions();
    return;
  }

  if (option.action === "equip_ranged_item") {
    const rangedItems = state.other.filter(item => item.type === "ranged");
    const item = rangedItems[option.index];
    if (!item) {
      setStory("无法装备该武器。");
      showHomeOptions();
      return;
    }
    const result = equipRanged(item.id);
    if (result) {
      setStory(`你装备了${result.name}。`);
    } else {
      setStory("装备失败。");
    }
    showHomeOptions();
    return;
  }
}

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
    if (!ammo) {
      setStory("无效的弹药。");
      showHomeOptions();
      return;
    }
    if (state.rangedWeapon && ammo.id === state.rangedWeapon.ammoType) {
      setStory("弹药已加载。");
    } else {
      setStory("该弹药与你装备的远程武器不兼容。");
    }
    showHomeOptions();
    return;
  }
}

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
    case "goHome":
      handleGoHome();
      break;
    case "discard":
      handleDiscardSelect();
      break;
    default:
      break;
  }
}

export function handleAction(input) {
  const state = getState();

  if (input < 1) {
    return;
  }

  const phase = state.phase;

  switch (phase) {
    case "choose":
      handleChooseAction(input, state);
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
    case "survivor_interact":
      handleSurvivorAction(input);
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
    case "game_over":
      if (input === 1) {
        resetState();
        showHomeOptions();
      }
      break;
    default:
      break;
  }
}