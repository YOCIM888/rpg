import {
  getState, setPhase, setStory, setOptions,
  removeRoyalCoins, addRoyalCoins, advanceTime, updateStatusEffects, checkDeath,
} from '../state.js';

import { SPECIAL_ITEMS } from '../config.js';

import { hasCastleIdentity, getCastleRank, getCastleRankName } from '../faction.js';

import { INVEST_AMOUNTS, INVEST_DURATION_DAYS, INVEST_DIRECTIONS } from '../data/island/investment.js';

import { refreshIslandMenu } from './index.js';

function getInvestorTitle(state) {
  if (!hasCastleIdentity(state) && state.other.some(i => i.id === SPECIAL_ITEMS.castle_pass.id)) {
    return "先生";
  }
  const rankName = getCastleRankName(state);
  const titleMap = {
    "贵族": "贵族",
    "子爵": "子爵",
    "伯爵": "伯爵",
    "侯爵": "侯爵",
    "公爵": "公爵",
    "储君": "储君",
  };
  return titleMap[rankName] || "先生";
}

export function handleInvest() {
  const state = getState();
  if (!hasCastleIdentity(state) && !state.other.some(i => i.id === SPECIAL_ITEMS.castle_pass.id)) {
    setStory("一个衣着考究的代理人挡住了你：\"抱歉，只有持有城堡通行证或城堡身份牌的人才能进入卢修斯投资行。\"");
    refreshIslandMenu();
    return;
  }
  const title = getInvestorTitle(state);
  setPhase("island_invest");
  setStory(`尊敬的${title}大人，欢迎来到卢修斯投资行代理行，这里为你提供最好的投资服务！`);
  setOptions([
    { text: "进行投资", action: "invest_start" },
    { text: "投资收益", action: "invest_check" },
    { text: "离开", action: "invest_leave" },
  ]);
}

export function handleInvestAction(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;
  const action = state.options[optIdx].action;

  switch (action) {
    case "invest_start":
      handleInvestStart();
      break;
    case "invest_check":
      handleInvestCheck();
      break;
    case "invest_leave":
      refreshIslandMenu();
      break;
    case "invest_amount":
      handleInvestDirection(input);
      break;
    case "invest_direction":
      handleInvestConfirm(input);
      break;
    case "invest_back":
      handleInvest();
      break;
    case "invest_collect":
      handleInvestCollect(input);
      break;
    default:
      handleInvest();
      break;
  }
}

function handleInvestStart() {
  const state = getState();
  if (state.investment !== null) {
    setStory("你已经有一笔投资了。");
    handleInvest();
    return;
  }
  setPhase("island_invest");
  setStory("请选择投资金额：");
  const opts = INVEST_AMOUNTS.map(amount => ({
    text: `${amount}皇家币`,
    action: "invest_amount",
    amount,
  }));
  opts.push({ text: "返回", action: "invest_back" });
  setOptions(opts);
}

function handleInvestDirection(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;
  const option = state.options[optIdx];
  if (option.action !== "invest_amount") return;
  const amount = option.amount;

  setPhase("island_invest");
  setStory(`投资金额：${amount}皇家币\n请选择投资方向：`);
  const opts = INVEST_DIRECTIONS.map(dir => ({
    text: `${dir.name}`,
    action: "invest_direction",
    directionId: dir.id,
    amount,
  }));
  opts.push({ text: "返回", action: "invest_back" });
  setOptions(opts);
}

function handleInvestConfirm(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;
  const option = state.options[optIdx];
  if (option.action !== "invest_direction") return;

  const directionId = option.directionId;
  const amount = option.amount;

  if (state.royalCoins < amount) {
    setStory(`你的皇家币不足。你需要${amount}皇家币，但只有${state.royalCoins}皇家币。`);
    handleInvest();
    return;
  }

  removeRoyalCoins(amount);
  const direction = INVEST_DIRECTIONS.find(d => d.id === directionId);
  const directionName = direction ? direction.name : directionId;
  state.investment = {
    amount,
    directionId,
    startDay: state.day,
    dueDay: state.day + INVEST_DURATION_DAYS,
  };

  const title = getInvestorTitle(state);
  setStory(`你将${amount}皇家币投入了${directionName}。卢修斯微笑着说："明智的选择，${title}大人。${INVEST_DURATION_DAYS}天后再来看看结果吧。"`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) handleInvest();
}

function handleInvestCheck() {
  const state = getState();
  if (!state.investment) {
    setStory("你目前没有任何投资。");
    handleInvest();
    return;
  }

  const direction = INVEST_DIRECTIONS.find(d => d.id === state.investment.directionId);
  const directionName = direction ? direction.name : state.investment.directionId;
  const amount = state.investment.amount;
  const daysLeft = state.investment.dueDay - state.day;

  if (daysLeft > 0) {
    setStory(`你的投资还在进行中。投资方向：${directionName}，投入：${amount}皇家币，剩余${daysLeft}天。`);
    handleInvest();
    return;
  }

  const outcomes = direction.outcomes;
  let roll = Math.random();
  let cumulative = 0;
  let selectedOutcome = outcomes[outcomes.length - 1];
  for (const outcome of outcomes) {
    cumulative += outcome.probability;
    if (roll < cumulative) {
      selectedOutcome = outcome;
      break;
    }
  }

  const result = Math.round(amount * (1 + selectedOutcome.returnRate));
  if (result > 0) {
    addRoyalCoins(result);
  }
  setStory(`${selectedOutcome.desc}\n你投入了${amount}皇家币，收回了${result}皇家币。`);
  state.investment = null;
  handleInvest();
}

function handleInvestCollect(input) {
  handleInvestCheck();
}
