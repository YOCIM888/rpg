import { getState, setPhase, setStory, setOptions, addCigarettes, removeCigarettes, advanceTime, updateStatusEffects, checkDeath } from '../state.js';
import { CASTLE_BANKER_DIALOGUES, CASTLE_BANKER_HIGH_DIALOGUES, MELEE_WEAPONS, RANGED_WEAPONS, GAME_CONSTANTS, NAMED_NPCS, FIXED_LOOT_DROPS, getDialogueByRank } from '../config.js';
import { getCastleRank, getCastleRankName, hasAnyDawnIdentity, cleanDualIdentity } from '../faction.js';
import { handleCastleOutpost } from './outpost.js';

export function handleCastleBank() {
  setPhase("castle_bank");
  const state = getState();
  let info = "🏦 【城堡银行】\n\n";
  if (state.bankerKilled) {
    info += "城堡银行员工不愿意接待你，因为你刺杀了行长。\n\n";
    if (state.castleDebt) {
      info += `当前债务：${state.castleDebt.amount}根香烟\n\n`;
    }
    setStory(info);
    setOptions([
      { text: state.castleDebt ? "还款" : "还款（无债务）", action: "bank_repay", disabled: !state.castleDebt },
      { text: "离开", action: "bank_leave" },
    ]);
    return;
  }
  if (state.castleDebt) {
    const daysLeft = state.castleDebt.dueDay - state.day;
    if (daysLeft > 0) {
      info += `当前债务：${state.castleDebt.amount}根香烟（还剩 ${daysLeft} 天还款）\n\n`;
    } else {
      info += `当前债务：${state.castleDebt.amount}根香烟（已逾期 ${-daysLeft} 天！）\n\n`;
    }
  } else {
    info += "你目前没有债务。\n\n";
  }
  info += `借贷：从银行借支香烟（最多${GAME_CONSTANTS.CASTLE.MAX_LOAN_AMOUNT}根）\n还款：偿还部分或全部债务`;
  setStory(info);
  setOptions([
    { text: "借贷", action: "bank_loan" },
    { text: state.castleDebt ? "还款" : "还款（无债务）", action: "bank_repay", disabled: !state.castleDebt }, 
    { text: "与行长见面", action: "bank_banker" },
    { text: "离开", action: "bank_leave" },
  ]);
}

export function handleBankLoan() {
  const state = getState();
  if (state.castleDebt) {
    setStory("你已经有一笔未还清的债务，先还清再来借吧。");
    refreshCastleBank();
    return;
  }
  cleanDualIdentity(state);
  if (hasAnyDawnIdentity(state)) {
    setStory("银行柜员冷冷地看着你：\"曙光阵地的？我们银行不招待你们这些反叛分子。请马上离开，否则我叫守卫了。\"");
    refreshCastleBank();
    return;
  }
  setPhase("castle_loan_input");
  const opts = [];
  for (let i = 1; i <= GAME_CONSTANTS.CASTLE.MAX_LOAN_AMOUNT; i++) {
    opts.push({ text: `${i}根香烟`, action: "loan_amount", amount: i });
  }
  opts.push({ text: "返回", action: "back" });
  setStory("🏦 请输入要借贷的香烟数量：");
  setOptions(opts);
}

export function handleLoanSubmit(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;
  const option = state.options[optIdx];
  if (option.action === "back") { handleCastleBank(); return; }
  const amount = option.amount;
  state.castleDebt = { amount: amount, dueDay: state.day + GAME_CONSTANTS.CASTLE.LOAN_TERM_DAYS, mercyCount: 0 };
  addCigarettes(amount);
  setStory(`✅ 你从城堡银行借贷了 ${amount} 根香烟。行长笑眯眯地说："记得 ${GAME_CONSTANTS.CASTLE.LOAN_TERM_DAYS} 天内还清哦，不然……嘿嘿。"\n\n（没有告诉你的是，逾期要翻倍偿还。）`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) refreshCastleBank();
}

export function handleBankRepay() {
  const state = getState();
  if (!state.castleDebt) {
    setStory("你没有债务需要偿还。");
    refreshCastleBank();
    return;
  }
  const needed = state.castleDebt.amount;
  if (state.cigarettes < needed) {
    setStory(`❌ 你需要 ${needed} 根香烟来还清债务，但你只有 ${state.cigarettes} 根。去凑够再来吧。`);
    refreshCastleBank();
    return;
  }
  removeCigarettes(needed);
  state.castleDebt = null;
  state.castleDebtTriggered = false;
  setStory(`✅ 你偿还了全部债务（${needed}根香烟）。行长满意地点了点头："不错不错，诚信经营，欢迎下次光临！"`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) refreshCastleBank();
}

export function handleBankBanker() {
  const state = getState();
  const rank = getCastleRank(state);
  const line = getDialogueByRank("banker", rank);
  setStory(`城堡坐在宽大的办公桌后，翘着二郎腿：${line}\n\n你决定……`);
  setPhase("castle_banker");
  setOptions([
    { text: "申请免息", action: "banker_waiver" },
    { text: "请求宽限五天", action: "banker_mercy" },
    { text: "打死这个高利贷！", action: "banker_fight" },
    { text: "离开", action: "banker_leave" },
  ]);
}

export function handleBankerWaiver() {
  const state = getState();
  if (!state.castleDebt) {
    setStory("行长摆摆手：\"你又没欠钱，免什么息？别浪费我时间。\"");
    refreshCastleBank();
    return;
  }
  const rank = getCastleRank(state);
  const rankName = getCastleRankName(state) || "平民";
  setPhase("castle_banker_waiver");
  setStory(`行长看了看你：\"哦？想申请免息？让我看看你的资格……\"\n\n当前债务：${state.castleDebt.amount}根香烟\n你的身份：${rankName}`);
  setOptions([
    { text: rank >= 2 ? "免息三成并偿还" : "免息三成（子爵以上可享受）", action: "waiver_30", disabled: rank < 2 },
    { text: rank >= 4 ? "免息一半并偿还" : "免息一半（侯爵以上可享受）", action: "waiver_50", disabled: rank < 4 },
    { text: rank >= 6 ? "免息全部并偿还" : "免息全部（储君可享受）", action: "waiver_100", disabled: rank < 6 },
    { text: "返回", action: "waiver_back" },
  ]);
}

function executeWaiver(rate, rankRequired, successMsg, failMsg) {
  const state = getState();
  const rank = getCastleRank(state);
  const rankName = getCastleRankName(state) || "平民";
  if (rank < rankRequired) {
    setStory(failMsg);
    setPhase("castle_banker_waiver");
    setOptions([
      { text: rank >= 2 ? "免息三成并偿还" : "免息三成（子爵以上可享受）", action: "waiver_30", disabled: rank < 2 },
      { text: rank >= 4 ? "免息一半并偿还" : "免息一半（侯爵以上可享受）", action: "waiver_50", disabled: rank < 4 },
      { text: rank >= 6 ? "免息全部并偿还" : "免息全部（储君可享受）", action: "waiver_100", disabled: rank < 6 },
      { text: "返回", action: "waiver_back" },
    ]);
    return;
  }
  const debt = state.castleDebt.amount;
  const waiverAmount = debt * rate;
  if (waiverAmount < 1) {
    setStory("行长翻了翻账本，摇了摇头：\"你贷的太少了，没办法给你免。\"");
    setPhase("castle_banker_waiver");
    setOptions([
      { text: rank >= 2 ? "免息三成并偿还" : "免息三成（子爵以上可享受）", action: "waiver_30", disabled: rank < 2 },
      { text: rank >= 4 ? "免息一半并偿还" : "免息一半（侯爵以上可享受）", action: "waiver_50", disabled: rank < 4 },
      { text: rank >= 6 ? "免息全部并偿还" : "免息全部（储君可享受）", action: "waiver_100", disabled: rank < 6 },
      { text: "返回", action: "waiver_back" },
    ]);
    return;
  }
  const roundedWaiver = Math.round(waiverAmount);
  const newDebt = debt - roundedWaiver;
  if (newDebt <= 0) {
    state.castleDebt = null;
    state.castleDebtTriggered = false;
    setStory(`${successMsg}\n\n免除了${roundedWaiver}根香烟，债务已全部清偿！`);
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    if (!state.gameOver) refreshCastleBank();
    return;
  }
  if (state.cigarettes < newDebt) {
    setStory(`${successMsg}\n\n免除${roundedWaiver}根后，你还需要偿还${newDebt}根香烟，但你只有${state.cigarettes}根。去凑够再来吧。`);
    state.castleDebt.amount = newDebt;
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    if (!state.gameOver) refreshCastleBank();
    return;
  }
  removeCigarettes(newDebt);
  state.castleDebt = null;
  state.castleDebtTriggered = false;
  setStory(`${successMsg}\n\n免除${roundedWaiver}根，偿还${newDebt}根，债务已全部清偿！`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) refreshCastleBank();
}

export function handleWaiver30() {
  const state = getState();
  const rank = getCastleRank(state);
  const rankName = getCastleRankName(state) || "平民";
  if (rank >= 2) {
    executeWaiver(0.3, 2,
      "行长掂量了一下你的身份，想到了国王好像也在关照你，所以答应了免除三成利息的要求\"先生，行吧，给你降三成\"",
      "");
  } else if (rank === 1) {
    executeWaiver(0.3, 2, "",
      "行长冷笑了一声：\"降息，不可能的，这事免谈。\"");
  } else {
    executeWaiver(0.3, 2, "",
      "行长暴跳如雷：\"滚开，你个穷鬼！我们没有商量的余地！守卫，守卫在哪里？把他赶出去。\"");
  }
}

export function handleWaiver50() {
  const state = getState();
  const rank = getCastleRank(state);
  if (rank >= 4) {
    executeWaiver(0.5, 4,
      "行长邀请你坐在松软的沙发上，边泡茶边说\"这位大人财务比较紧张吗？这样吧，利息我给您免除一半。\"",
      "");
  } else if (rank === 2 || rank === 3) {
    executeWaiver(0.5, 4, "",
      "行长面露难色：\"先生，我们最近经济形势不好，要不你还是再重新考虑考虑？\"");
  } else if (rank === 1) {
    executeWaiver(0.5, 4, "",
      "行长嗤笑了一声：\"呵呵，你是在开玩笑吗？让我给你免一半，没门。\"");
  } else {
    executeWaiver(0.5, 4, "",
      "行长怒目圆睁：\"别白日做梦，把这个穷酸小子拖出去！\"");
  }
}

export function handleWaiver100() {
  const state = getState();
  const rank = getCastleRank(state);
  if (rank >= 6) {
    executeWaiver(1.0, 6,
      "行长准备了上好的茶水和零食特产，满脸堆笑地说道\"储君阁下您能来我们这里，是我们的荣幸，利息给你全免了，你只需要还本金就好。以后记得多多关照我们。\"",
      "");
  } else if (rank === 5 || rank === 4) {
    executeWaiver(1.0, 6, "",
      "行长为难地说：\"这位大人，免除全部对我们来说亏损太大了，要不您再考虑一下别的优惠？\"");
  } else if (rank === 3 || rank === 2) {
    executeWaiver(1.0, 6, "",
      "行长皱起眉头：\"先生，你这就狮子大开口了啊，可别和我开这种玩笑。\"");
  } else if (rank === 1) {
    executeWaiver(1.0, 6, "",
      "行长瞪大了眼睛：\"你吃迷药了吗？犯什么糊涂。\"");
  } else {
    executeWaiver(1.0, 6, "",
      "行长拍案而起：\"我感觉你这穷鬼有点欠揍啊？再不离开，我可要叫人打你了，给我滚。\"");
  }
}

export function handleBankerMercy() {
  const state = getState();
  if (!state.castleDebt) {
    setStory("行长摆摆手：\"你又没欠钱，宽限什么？别浪费我时间。\"");
    refreshCastleBank();
    return;
  }
  if (state.castleDebt.mercyCount >= 2) {
    setStory("行长不耐烦地挥了挥手：\"我已经宽限你两次了，不能再宽限了！赶紧想办法还钱！\"");
    refreshCastleBank();
    return;
  }
  state.castleDebt.mercyCount = (state.castleDebt.mercyCount || 0) + 1;
  state.castleDebt.dueDay += GAME_CONSTANTS.CASTLE.MERCY_EXTENSION_DAYS;
  setStory(`行长皱了皱眉："行吧行吧，看在你态度诚恳的份上，再给你 ${GAME_CONSTANTS.CASTLE.MERCY_EXTENSION_DAYS} 天。记住，${state.castleDebt.dueDay} 号之前必须还清！"\n\n还款期限延后 ${GAME_CONSTANTS.CASTLE.MERCY_EXTENSION_DAYS} 天。`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) refreshCastleBank();
}

export function refreshCastleBank() {
  setPhase("castle_bank");
  const state = getState();
  if (state.bankerKilled) {
    setOptions([
      { text: state.castleDebt ? "还款" : "还款（无债务）", action: "bank_repay", disabled: !state.castleDebt },
      { text: "离开", action: "bank_leave" },
    ]);
    return;
  }
  setOptions([
    { text: "借贷", action: "bank_loan" },
    { text: state.castleDebt ? "还款" : "还款（无债务）", action: "bank_repay", disabled: !state.castleDebt },
    { text: "与行长见面", action: "bank_banker" },
    { text: "离开", action: "bank_leave" },
  ]);
}

export function handleBankerFight() {
  const state = getState();
  const banker = NAMED_NPCS.banker;
  state._pendingNpc = {
    name: banker.name,
    hp: banker.hp,
    damage: Math.floor(Math.random() * (banker.damageMax - banker.damageMin + 1)) + banker.damageMin,
    hasRanged: banker.hasRanged,
    dodgeRate: banker.dodgeRate,
  };
  const bankerWeapon = FIXED_LOOT_DROPS.banker_kill.type === "ranged"
    ? RANGED_WEAPONS.find(w => w.id === FIXED_LOOT_DROPS.banker_kill.weaponId)
    : MELEE_WEAPONS.find(w => w.id === FIXED_LOOT_DROPS.banker_kill.weaponId);
  setPhase("pre_combat_npc");
  setStory(`你一拍桌子，拔出武器！行长冷笑一声，从桌下抽出一把寒光闪闪的${bankerWeapon.name}："找死！"`);
  setOptions([
    { text: "近战作战", action: "combat_npc_melee" },
    { text: "远程射击", action: "combat_npc_ranged" },
    { text: GAME_CONSTANTS.COMBAT.FLEE_RATE_TEXT, action: "combat_npc_flee" },
  ]);
}

export function handleCastleBankAction(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;
  const action = state.options[optIdx].action;
  if (action === "bank_loan") { handleBankLoan(); return; }
  if (action === "bank_repay") { handleBankRepay(); return; }
  if (action === "bank_banker") { handleBankBanker(); return; }
  if (action === "bank_leave") { handleCastleOutpost(); return; }
}

export function handleCastleBankerAction(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;
  const action = state.options[optIdx].action;
  if (action === "banker_waiver") { handleBankerWaiver(); return; }
  if (action === "waiver_30") { handleWaiver30(); return; }
  if (action === "waiver_50") { handleWaiver50(); return; }
  if (action === "waiver_100") { handleWaiver100(); return; }
  if (action === "waiver_back") { handleBankBanker(); return; }
  if (action === "banker_mercy") { handleBankerMercy(); return; }
  if (action === "banker_fight") { handleBankerFight(); return; }
  if (action === "banker_leave") { handleCastleOutpost(); return; }
}
