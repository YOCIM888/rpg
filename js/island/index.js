import {
  getState, setPhase, setStory, setOptions,
  addItem, addRoyalCoins, removeRoyalCoins,
  advanceTime, updateStatusEffects, checkDeath,
  setLocation, isQuestDone,
} from '../state.js';

import {
  GAME_CONSTANTS, MAPS,
  pickRandomLoot, SPECIAL_ITEMS, NAMED_NPCS,
} from '../config.js';

import {
  hasCastleIdentity,
} from '../faction.js';

import { showExploreOptionsState } from '../routing.js';

import {
  handleFishingArea,
} from './fishing.js';

import {
  handleNpcYumo, handleYumoAction,
} from './yumo.js';

import {
  handleNpcGuyue, handleGuyueAction,
} from './guyue.js';

import {
  handleNpcLinhan, handleLinhanAction,
} from './linhan.js';

import { handleBar, handleBarAction } from './bar.js';
import { handleStreet, handleStreetAction } from './street.js';
import { handleInvest, handleInvestAction } from './invest.js';

export function handleEnterIsland() {
  const state = getState();
  const islandMap = MAPS.find(m => m.id === "小型岛屿");
  state.currentMap = islandMap;
  setLocation("小型岛屿");

  if (state.islandDebt) {
    const daysLeft = state.islandDebt.dueDay - state.day;
    if (daysLeft < 0 && !state.islandDebtTriggered) {
      state.islandDebtTriggered = true;
      const interest = Math.round(state.islandDebt.amount * GAME_CONSTANTS.ISLAND.INTEREST_RATE);
      state.islandDebt.amount += interest;
      state.islandDebt.dueDay = state.day + GAME_CONSTANTS.ISLAND.LOAN_TERM_DAYS;
      setStory(`你踏上了小型岛屿。余墨公爵的管家匆匆赶来：\"阁下的岛屿银行债务已逾期，加上${GAME_CONSTANTS.ISLAND.INTEREST_RATE * 100}%利息，现在共欠${state.islandDebt.amount}皇家币，还款期限已延至${state.islandDebt.dueDay}天。\"`);
      refreshIslandMenu();
      return;
    }
  }

  setStory("你驾驶游艇来到了小型岛屿。这座岛屿风景秀丽，是国王赐予余墨公爵的封地。岛上的居民安居乐业，城堡的旗帜在岛中央飘扬。");
  refreshIslandMenu();
}

export function refreshIslandMenu() {
  const state = getState();
  setPhase("island");
  const options = [
    { text: "探索", action: "island_explore" },
    { text: "进食", action: "eat" },
    { text: "饮水", action: "drink" },
    { text: "医疗", action: "medicine" },
    { text: "装备", action: "equip" },
    { text: "离开", action: "island_leave" },
    { text: "丢弃", action: "discard" },
    { text: "岛民顾月", action: "island_guyue" },
    { text: "岛民林寒", action: "island_linhan" },
    { text: "余墨公爵", action: "island_yumo" },
  ];
  if (isQuestDone("yumoQuest2") && !isQuestDone("yumoQuest3")) {
    options.push({ text: "清理登陆丧尸", action: "island_clean_diving" });
  }
  options.push({ text: "钓鱼区域", action: "island_fishing" });
  options.push({ text: "岛内休息", action: "island_rest" });
  options.push({ text: "凯伦国王酒吧", action: "island_bar" });
  options.push({ text: "艾莉娜皇后街", action: "island_street" });
  options.push({ text: "卢修斯投资行", action: "island_invest" });
  options.push({ text: "岛屿银行", action: "island_bank" });
  setOptions(options);
}

export function handleIslandAction(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;

  const action = state.options[optIdx].action;

  switch (action) {
    case "island_explore":
      handleIslandExplore();
      break;
    case "eat":
    case "drink":
    case "medicine":
    case "equip":
    case "discard":
      return action;
    case "island_leave":
      handleIslandLeave();
      break;
    case "island_guyue":
      handleNpcGuyue();
      break;
    case "island_linhan":
      handleNpcLinhan();
      break;
    case "island_yumo":
      handleNpcYumo();
      break;
    case "island_clean_diving":
      handleCleanDivingZombie();
      break;
    case "island_fishing":
      handleFishingArea();
      break;
    case "island_rest":
      handleIslandRest();
      break;
    case "island_bar":
      handleBar();
      break;
    case "island_street":
      handleStreet();
      break;
    case "island_invest":
      handleInvest();
      break;
    case "island_bank":
      handleIslandBank();
      break;
  }
}

export function handleIslandExplore() {
  const state = getState();
  const map = state.currentMap;
  if (!map) {
    refreshIslandMenu();
    return;
  }

  const loot = pickRandomLoot(map);
  if (!loot) {
    setStory("你在岛上四处寻找，什么也没找到。");
  } else {
    const added = addItem(loot);
    if (!added) {
      setStory(`你发现了${loot.name}，但背包已满，无法携带。`);
    } else {
      setStory(`你在岛上发现了${loot.name}！`);
    }
  }

  advanceTime(1);
  const wasFoggy = state.weather === "大雾";
  if (wasFoggy) advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) refreshIslandMenu();
}

export function handleIslandLeave() {
  const state = getState();
  const portMap = MAPS.find(m => m.id === "江边港口码头");
  state.currentMap = portMap;
  setLocation("江边港口码头");
  setStory("你驾驶游艇返回了江边港口码头。");
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) showExploreOptionsState();
}

export function handleIslandRest() {
  const state = getState();
  const healAmount = Math.min(GAME_CONSTANTS.ISLAND.REST_HEALTH, GAME_CONSTANTS.MAX_HEALTH - state.health);
  const crashReduction = Math.min(GAME_CONSTANTS.ISLAND.REST_CRASH, state.crash);
  state.health = Math.min(state.health + GAME_CONSTANTS.ISLAND.REST_HEALTH, GAME_CONSTANTS.MAX_HEALTH);
  state.crash = Math.max(state.crash - GAME_CONSTANTS.ISLAND.REST_CRASH, 0);

  setStory(`你在岛上的小屋中休憩了一段时间，海风轻拂，你感到身心都得到了充分的放松。\n恢复了${healAmount}点生命，降低了${crashReduction}点崩溃。`);

  advanceTime(GAME_CONSTANTS.ISLAND.REST_TIME);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) refreshIslandMenu();
}

export function handleCleanDivingZombie() {
  const state = getState();
  const dz = NAMED_NPCS.diving_zombie;
  state._pendingNpc = {
    name: dz.name,
    hp: dz.hp,
    damage: Math.floor(Math.random() * (dz.damageMax - dz.damageMin + 1)) + dz.damageMin,
    hasRanged: dz.hasRanged,
    dodgeRate: dz.dodgeRate,
  };
  state._divingZombieCombat = true;
  setPhase("pre_combat_npc");
  const crashWarning = state.crash >= GAME_CONSTANTS.CRASH_MAX ? "\n\n⚠ 你的精神状态极差，无法正常战斗！建议先恢复精神再探索。" : "";
  setStory(`一只潜水丧尸从海中爬上了岸，浑身滴着腥臭的海水，朝你扑来！${crashWarning}`);
  setOptions([
    { text: "近战作战", action: "combat_npc_melee" },
    { text: "远程射击", action: "combat_npc_ranged" },
    { text: GAME_CONSTANTS.COMBAT.FLEE_RATE_TEXT, action: "combat_npc_flee" },
  ]);
}

export function handleIslandBank() {
  setPhase("island_bank");
  const state = getState();
  let info = "🏦 【岛屿银行】\n由皇后开设的皇家银行\n\n";
  if (state.islandDebt) {
    const daysLeft = state.islandDebt.dueDay - state.day;
    if (daysLeft > 0) {
      info += `当前债务：${state.islandDebt.amount}皇家币（还剩 ${daysLeft} 天还款）\n\n`;
    } else {
      info += `当前债务：${state.islandDebt.amount}皇家币（已逾期 ${-daysLeft} 天！）\n\n`;
    }
  } else {
    info += "你目前没有债务。\n\n";
  }
  info += "借贷：借支皇家币（10/20/30三档）\n还款：偿还债务";
  setStory(info);
  setOptions([
    { text: "借贷", action: "island_loan" },
    { text: state.islandDebt ? "还款" : "还款（无债务）", action: "island_repay", disabled: !state.islandDebt },
    { text: "离开", action: "island_bank_leave" },
  ]);
}

export function handleIslandBankAction(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;
  const action = state.options[optIdx].action;

  if (action === "island_loan") {
    handleIslandLoan();
    return;
  }
  if (action === "island_repay") {
    handleIslandRepay();
    return;
  }
  if (action === "island_loan_submit") {
    handleIslandLoanSubmit(input);
    return;
  }
  if (action === "island_bank_leave" || action === "island_loan_back") {
    handleIslandBankLeave();
    return;
  }
}

export function handleIslandBankLeave() {
  refreshIslandMenu();
}

function hasAnyCastleRelatedIdentity(state) {
  if (hasCastleIdentity(state)) return true;
  if (state.other.some(i => i.id === SPECIAL_ITEMS.castle_pass.id)) return true;
  return false;
}

export function handleIslandLoan() {
  const state = getState();
  if (state.islandDebt) {
    setStory("你还有未还清的债务，先还清再来借吧。");
    handleIslandBank();
    return;
  }
  if (!hasAnyCastleRelatedIdentity(state)) {
    setStory("银行柜员礼貌地说：\"只有城堡相关势力成员才能使用岛屿银行。请出示城堡通行证或城堡身份牌。\"");
    handleIslandBank();
    return;
  }
  setPhase("island_bank");
  const opts = [];
  for (const amount of GAME_CONSTANTS.ISLAND.LOAN_AMOUNTS) {
    opts.push({ text: `${amount}皇家币`, action: "island_loan_submit", amount });
  }
  opts.push({ text: "返回", action: "island_loan_back" });
  setStory("🏦 请选择借贷金额（皇后开设的银行，利息仅10%，期限30天）：");
  setOptions(opts);
}

export function handleIslandLoanSubmit(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;
  const option = state.options[optIdx];
  if (option.action !== "island_loan_submit") return;
  const amount = option.amount;
  state.islandDebt = { amount, dueDay: state.day + GAME_CONSTANTS.ISLAND.LOAN_TERM_DAYS };
  addRoyalCoins(amount);
  setStory(`✅ 你从岛屿银行借贷了 ${amount} 皇家币。柜员微笑着说：\"皇后殿下吩咐过，利息只需10%，请务必在 ${GAME_CONSTANTS.ISLAND.LOAN_TERM_DAYS} 天内还清。\"\n\n当前皇家币：${state.royalCoins}`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) handleIslandBank();
}

export function handleIslandBarAction(input) {
  handleBarAction(input);
}

export function handleIslandStreetAction(input) {
  handleStreetAction(input);
}

export function handleIslandInvestAction(input) {
  handleInvestAction(input);
}

export function handleIslandRepay() {
  const state = getState();
  if (!state.islandDebt) {
    setStory("你没有债务需要偿还。");
    handleIslandBank();
    return;
  }
  const needed = state.islandDebt.amount;
  if (state.royalCoins < needed) {
    setStory(`❌ 你需要 ${needed} 皇家币来还清债务，但你只有 ${state.royalCoins} 皇家币。去城堡皇后那里兑换一些皇家币再来吧。`);
    handleIslandBank();
    return;
  }
  removeRoyalCoins(needed);
  state.islandDebt = null;
  state.islandDebtTriggered = false;
  setStory(`✅ 你偿还了全部债务（${needed}皇家币）。柜员点点头：\"谢谢您的诚信，皇后殿下会很高兴的。\"\n\n当前皇家币：${state.royalCoins}`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) handleIslandBank();
}
