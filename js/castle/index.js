/* ============================================================
   末日城堡模块
   组织顺序：城堡外围 → 守卫交互 → 城堡内部 → 身份/工作/银行
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
} from '../state.js';

import {
  CASTLE_GUARD_DIALOGUES,
  CASTLE_KING_DIALOGUES,
  CASTLE_QUEEN_DIALOGUES,
  CASTLE_BANKER_DIALOGUES,
  CIGARETTES,
  MELEE_WEAPONS,
  FOODS,
  DRINKS,
  FRUITS,
  RANGED_WEAPONS,
  GAME_CONSTANTS,
  SPECIAL_ITEMS,
  NAMED_NPCS,
  FIXED_LOOT_DROPS,
} from '../config.js';

import {
  hasNobleId,
  hasDawnBadge,
  cleanDualIdentity,
} from '../faction.js';

import {
  showExploreOptionsState,
} from '../routing.js';

import {
  handleEatSelect,
  handleDrinkSelect,
  handleMedicineSelect,
} from '../game.js';

import {
  handleEquipSelect,
  handleDiscardSelect,
} from '../equipment.js';

// ---------- 城堡外围 ----------

export function handleCastleOutpost() {
  const state = getState();
  if (state.castleDebt && state.day > state.castleDebt.dueDay && !state.castleDebtTriggered) {
    state.castleDebtTriggered = true;
    const totalItems = state.food.length + state.drinks.length + state.medicine.length + state.other.length + state.cargo.length;
    state.food = [];
    state.drinks = [];
    state.medicine = [];
    state.other = [];
    state.cargo = [];
    setStory(`⚠️ 因为没有及时还清债务，城堡银行的打手突然冲出来抢走了你的所有物品（共${totalItems}件）！他们人多势众，你根本打不过。\n\n债务依然存在：${state.castleDebt.amount}支香烟（需翻倍偿还）。`);
    showExploreOptionsState();
    return;
  }
  setPhase("explore");
  setStory("一座巍峨的城堡矗立在你面前，高耸的塔楼和厚实的城墙诉说着末日前夕的辉煌。门口站着两个全副武装的守卫，警惕地打量着每一个靠近的人。");
  refreshCastleOutpost();
  getState().currentMap = { id: "末日城堡" };
}

export function refreshCastleOutpost() {
  const state = getState();
  setPhase("explore");
  setOptions([
    { text: "探索", action: "castle_explore_blocked" },
    { text: "进食", action: "eat" },
    { text: "饮水", action: "drink" },
    { text: "医疗", action: "medicine" },
    { text: "装备", action: "equip" },
    { text: "回家", action: "goHome" },
    { text: "丢弃", action: "discard" },
    { text: "城堡守卫", action: "castle_guard" },
    { text: "城堡银行", action: "castle_bank" },
    { text: "身份办理", action: "castle_identity" },
    { text: "城堡工作", action: "castle_work" },
  ]);
  getState().currentMap = { id: "末日城堡" };
}

export function handleCastleExploreBlocked() {
  setStory("城堡守卫监控着这片区域，你鬼鬼祟祟的太可疑了，这里不适合探索。");
  showExploreOptionsState();
}

export function handleGuardChat() {
  const line = CASTLE_GUARD_DIALOGUES[Math.floor(Math.random() * CASTLE_GUARD_DIALOGUES.length)];
  setStory(`守卫对你吆喝道：${line}`);
  setPhase("castle_guard");
  setOptions([
    { text: "对话", action: "guard_chat" },
    { text: "进入城堡", action: "guard_enter" },
    { text: "给小费（1支香烟）", action: "guard_bribe" },
    { text: "离开", action: "guard_leave" },
  ]);
}

export function handleGuardEnter() {
  const state = getState();
  const hasId = state.other.some(i => i.id === SPECIAL_ITEMS.noble_id.id);
  if (hasId) {
    setStory("你掏出了贵族身份牌，守卫恭敬地让开了一条路。\n\n你通过了身份验证，来到了末日城堡内。");
    enterCastleInterior();
  } else {
    setStory("守卫冷笑一声：\"没有身份牌也想进城堡？滚滚滚！\"");
    setPhase("castle_guard");
    setOptions([
      { text: "对话", action: "guard_chat" },
      { text: "进入城堡", action: "guard_enter" },
      { text: "给小费（1支香烟）", action: "guard_bribe" },
      { text: "离开", action: "guard_leave" },
    ]);
  }
}

export function handleGuardBribe() {
  const state = getState();
  const cigIdx = state.cargo.findIndex(c => c.type === "cigarette");
  if (cigIdx === -1) {
    setStory("你翻遍了口袋，一支香烟都没有。守卫不耐烦地瞪着你。");
    setPhase("castle_guard");
    setOptions([
      { text: "对话", action: "guard_chat" },
      { text: "进入城堡", action: "guard_enter" },
      { text: "给小费（1支香烟）", action: "guard_bribe" },
      { text: "离开", action: "guard_leave" },
    ]);
    return;
  }
  state.cargo.splice(cigIdx, 1);
  setStory("你偷偷往守卫手里塞了一支香烟。守卫不动声色地收进口袋，朝你挤了挤眼：\"进去吧，别惹事！\"\n\n你通过贿赂守卫，偷偷摸摸地进入了城堡内。");
  enterCastleInterior();
}

export function handleGuardLeave() {
  setStory("你离开了城堡大门。");
  showExploreOptionsState();
}

export function handleCastleGuard() {
  setPhase("castle_guard");
  setStory("一个满脸横肉的守卫上下打量着你：\"干嘛的？\"");
  setOptions([
    { text: "对话", action: "guard_chat" },
    { text: "进入城堡", action: "guard_enter" },
    { text: "给小费（1支香烟）", action: "guard_bribe" },
    { text: "离开", action: "guard_leave" },
  ]);
}

function enterCastleInterior() {
  const state = getState();
  state.currentSubMap = "城堡内部";
  showCastleInterior();
}

export function showCastleInterior() {
  const state = getState();
  state.currentSubMap = "城堡内部";
  setPhase("castle_interior");
  const acidBlock = state.weather === "酸雨";
  setStory("你进入了末日城堡内部。宏伟的大厅内灯火通明，贵族们身着华服觥筹交错，仿佛末日从未降临。");
  refreshCastleInterior();
}

export function refreshCastleInterior() {
  const state = getState();
  setPhase("castle_interior");
  const acidBlock = state.weather === "酸雨";
  const opts = [
    { text: "探索", action: "castle_interior_explore" },
    { text: "进食", action: "eat" },
    { text: "饮水", action: "drink" },
    { text: "医疗", action: "medicine" },
    { text: "装备", action: "equip" },
    { text: "丢弃", action: "discard" },
    { text: acidBlock ? "离开（酸雨无法离开）" : "离开", action: "leave_castle_interior", disabled: acidBlock },
    { text: "见城堡国王", action: "castle_king" },
    { text: "见城堡皇后", action: "castle_queen" },
    { text: "参加贵族宴会", action: "castle_banquet" },
    { text: "参加贵族舞会", action: "castle_ball" },
    { text: "在贵族客房休息", action: "castle_room" },
  ];
  setOptions(opts);
}

export function handleCastleInteriorExplore() {
  const state = getState();
  const hasId = hasNobleId(state);
  const lootTables = [FOODS, DRINKS, FRUITS];
  const pool = lootTables[Math.floor(Math.random() * lootTables.length)];
  const item = pool[Math.floor(Math.random() * pool.length)];
  const added = addItem({ ...item });
  if (added) {
    if (hasId) {
      setStory(`你在城堡的角落发现了一些别人遗落的东西：${item.name}。`);
    } else {
      setStory(`你小心翼翼地搜寻，获得了${item.name}，但是你的身份被识破了！你被赶了出去！`);
      advanceTime(1);
      updateStatusEffects();
      checkDeath();
      if (!state.gameOver) {
        state.currentSubMap = null;
        refreshCastleOutpost();
      }
      return;
    }
  } else {
    if (hasId) {
      setStory("你在城堡里转了转，但背包已经满了，什么也拿不了。");
    } else {
      setStory("你正想搜刮点东西，但背包已经满了。巡逻的守卫注意到了你！你被赶了出去！");
      advanceTime(1);
      updateStatusEffects();
      checkDeath();
      if (!state.gameOver) {
        state.currentSubMap = null;
        refreshCastleOutpost();
      }
      return;
    }
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) refreshCastleInterior();
}

export function handleCastleInteriorAction(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;
  const option = state.options[optIdx];
  if (option.action === "eat") { handleEatSelect(); return; }
  if (option.action === "drink") { handleDrinkSelect(); return; }
  if (option.action === "medicine") { handleMedicineSelect(); return; }
  if (option.action === "equip") { handleEquipSelect(); return; }
  if (option.action === "discard") { handleDiscardSelect(); return; }
  if (option.action === "castle_interior_explore") { handleCastleInteriorExplore(); return; }
  if (option.action === "leave_castle_interior") {
    if (getState().weather === "酸雨") {
      setStory("外面下着腐蚀性的酸雨，你根本没法出去。还是找个地方待着吧。");
      return;
    }
    handleLeaveCastleInterior(); return;
  }
  if (option.action === "castle_king") { handleCastleKing(); return; }
  if (option.action === "castle_queen") { handleCastleQueen(); return; }
  if (option.action === "castle_banquet") { handleCastleBanquet(); return; }
  if (option.action === "castle_ball") { handleCastleBall(); return; }
  if (option.action === "castle_room") { handleCastleRoom(); return; }
}

export function handleCastleKing() {
  const line = CASTLE_KING_DIALOGUES[Math.floor(Math.random() * CASTLE_KING_DIALOGUES.length)];
  setStory(`城堡国王坐在高高的王座上，俯视着你：${line}`);
  refreshCastleInterior();
}

export function handleCastleQueen() {
  const line = CASTLE_QUEEN_DIALOGUES[Math.floor(Math.random() * CASTLE_QUEEN_DIALOGUES.length)];
  setStory(`城堡皇后慵懒地靠在软榻上，瞥了你一眼：${line}`);
  refreshCastleInterior();
}

export function handleCastleBanquet() {
  const state = getState();
  const hasId = state.other.some(i => i.id === SPECIAL_ITEMS.noble_id.id);
  if (!hasId) {
    setStory("你刚走到宴会厅门口，侍者就拦住了你：\"请出示贵族身份牌。\" 你没有身份牌，被赶了出去。\n\n你被识破了没有贵族身份，被赶出去了！");
    state.currentSubMap = null;
    refreshCastleOutpost();
    return;
  }
  if (state.lastBanquetDay === state.day) {
    setStory("你已经参加过今天的宴会了。贵族们还在觥筹交错，但你已经吃不下了。");
    refreshCastleInterior();
    return;
  }
  state.lastBanquetDay = state.day;
  state.hunger = 100;
  state.hydration = 100;
  setStory("你坐在长长的宴会桌前，享用着丰盛的大餐——烤火鸡、红酒、奶油浓汤……在末日里吃上这样一顿简直是奢望！\n\n饱食度和水分已全部恢复。");
  advanceTime(2);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) refreshCastleInterior();
}

export function handleCastleBall() {
  const state = getState();
  const hasId = state.other.some(i => i.id === SPECIAL_ITEMS.noble_id.id);
  if (!hasId) {
    setStory("舞会门口的侍卫拦住了你：\"请出示贵族身份牌。\" 你没有身份牌，被赶了出去。\n\n你被识破了没有贵族身份，被赶出去了！");
    state.currentSubMap = null;
    refreshCastleOutpost();
    return;
  }
  if (state.lastBallDay === state.day) {
    setStory("你已经参加了今天的舞会，脚都跳酸了。下次再来吧。");
    refreshCastleInterior();
    return;
  }
  state.lastBallDay = state.day;
  state.crash = Math.max(0, (state.crash || 0) - GAME_CONSTANTS.CASTLE.BALL_CRASH_REDUCTION);
  setStory("你在华美的舞厅中翩翩起舞，悠扬的华尔兹让你暂时忘却了末日的残酷。一曲终了，你感到身心都得到了放松。\n\n崩溃度 -50。");
  advanceTime(2);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) refreshCastleInterior();
}

export function handleCastleRoom() {
  const state = getState();
  const hasId = state.other.some(i => i.id === SPECIAL_ITEMS.noble_id.id);
  if (!hasId) {
    setStory("客房管家拦住了你：\"这里只对贵族开放。\" 你没有身份牌，被赶了出去。\n\n你被识破了没有贵族身份，被赶出去了！");
    state.currentSubMap = null;
    refreshCastleOutpost();
    return;
  }
  state.health = Math.min(GAME_CONSTANTS.MAX_HEALTH, state.health + GAME_CONSTANTS.CASTLE.ROOM_HEALTH_RESTORE);
  setStory(`你在柔软的贵族客房里美美地休息了一阵。醒来后精神焕发。\n\n生命值 +${GAME_CONSTANTS.CASTLE.ROOM_HEALTH_RESTORE}（当前 ${state.health}/${GAME_CONSTANTS.MAX_HEALTH}）。`);
  advanceTime(3);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) refreshCastleInterior();
}

export function handleLeaveCastleInterior() {
  const state = getState();
  state.currentSubMap = null;
  setStory("你离开了城堡。");
  showExploreOptionsState();
}

export function handleLeaveCastle() {
  setStory("你离开了末日城堡，回到了野外。");
  handleGoOut();
}

export function handleCastleIdentity() {
  setPhase("castle_identity");
  const state = getState();
  const hasId = state.other.some(i => i.id === SPECIAL_ITEMS.noble_id.id);
  setStory(`🏛️ 【城堡身份办理处】\n\n${hasId ? "你目前持有贵族身份牌。" : "你目前没有贵族身份牌。"}\n\n办理贵族身份牌需要 ${GAME_CONSTANTS.CASTLE.NOBLE_ID_COST} 支香烟。注意：身份牌一旦丢失需要重新办理，注销身份牌不会退还香烟。`);
  setOptions([
    { text: `办理身份（${GAME_CONSTANTS.CASTLE.NOBLE_ID_COST}支香烟）`, action: "identity_apply" },
    { text: hasId ? "注销身份" : "注销身份（未办理）", action: "identity_cancel", disabled: !hasId },
    { text: "离开", action: "identity_leave" },
  ]);
}

export function handleIdentityApply() {
  const state = getState();
  cleanDualIdentity(state);
  if (hasDawnBadge(state)) {
    setStory("办事员狐疑地打量着你：\"曙光阵地的人来办贵族身份？你是在逗我吗？\" 两个卫兵走了过来，你只好离开。");
    refreshCastleIdentity();
    return;
  }
  const cigs = state.cargo.filter(c => c.type === "cigarette");
  if (cigs.length < GAME_CONSTANTS.CASTLE.NOBLE_ID_COST) {
      setStory(`❌ 你需要 ${GAME_CONSTANTS.CASTLE.NOBLE_ID_COST} 支香烟才能办理贵族身份牌。你只有 ${cigs.length} 支。还是去攒点钱再来吧。`);
    handleCastleIdentity();
    return;
  }
  let removed = 0;
  for (let i = state.cargo.length - 1; i >= 0 && removed < GAME_CONSTANTS.CASTLE.NOBLE_ID_COST; i++) {
    if (state.cargo[i].type === "cigarette") {
      state.cargo.splice(i, 1);
      removed++;
    }
  }
  state.other.push({ ...SPECIAL_ITEMS.noble_id });
  setStory(`✅ 你缴纳了 ${GAME_CONSTANTS.CASTLE.NOBLE_ID_COST} 支香烟，办事员在一张烫金卡片上刻下了你的名字，郑重地交到你手中。\n\n获得【贵族身份牌】！现在你可以自由出入末日城堡的贵族区域了。`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) refreshCastleIdentity();
}

export function handleIdentityCancel() {
  const state = getState();
  const idx = state.other.findIndex(i => i.id === SPECIAL_ITEMS.noble_id.id);
  if (idx !== -1) {
    state.other.splice(idx, 1);
  }
  setStory("你交回了贵族身份牌，办事员面无表情地收下，一句话没说。50支香烟打了水漂……");
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) refreshCastleIdentity();
}

export function refreshCastleIdentity() {
  setPhase("castle_identity");
  const state = getState();
  const hasId = hasNobleId(state);
  setOptions([
    { text: `办理身份（${GAME_CONSTANTS.CASTLE.NOBLE_ID_COST}支香烟）`, action: "identity_apply" },
    { text: hasId ? "注销身份" : "注销身份（未办理）", action: "identity_cancel", disabled: !hasId },
    { text: "离开", action: "identity_leave" },
  ]);
}

export function handleCastleWork() {
  const state = getState();
  cleanDualIdentity(state);
  if (hasDawnBadge(state)) {
    setStory("城堡工头瞥了你一眼：\"曙光阵地的人还想来城堡干活？你怕不是奸细吧？滚！\" 两个卫兵把你架了出去。");
    refreshCastleOutpost();
    return;
  }
  setPhase("explore");
  setStory("你在城堡的工地上干了一整天的苦力——搬砖、扛沙袋、清理马厩……累得腰都直不起来。\n\n你累了一天，又饿又渴！感到身心疲惫，崩溃度上升了！但你获得了工资——一支香烟。");
  state.hunger = Math.max(0, state.hunger - GAME_CONSTANTS.CASTLE.WORK_HUNGER_COST);
  state.hydration = Math.max(0, state.hydration - GAME_CONSTANTS.CASTLE.WORK_HYDRATION_COST);
  state.crash = Math.min(100, (state.crash || 0) + GAME_CONSTANTS.CASTLE.WORK_CRASH_GAIN);
  const cig = CIGARETTES[Math.floor(Math.random() * CIGARETTES.length)];
  addItem({ ...cig });
  advanceTime(8);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    setPhase("explore");
    setOptions([
      { text: "探索", action: "castle_explore_blocked" },
      { text: "进食", action: "eat" },
      { text: "饮水", action: "drink" },
      { text: "医疗", action: "medicine" },
      { text: "装备", action: "equip" },
      { text: "回家", action: "goHome" },
      { text: "丢弃", action: "discard" },
      { text: "城堡守卫", action: "castle_guard" },
      { text: "城堡银行", action: "castle_bank" },
      { text: "身份办理", action: "castle_identity" },
      { text: "城堡工作", action: "castle_work" },
    ]);
  }
}

export function handleCastleBank() {
  setPhase("castle_bank");
  const state = getState();
  let info = "🏦 【城堡银行】\n\n";
  if (state.castleDebt) {
    const daysLeft = state.castleDebt.dueDay - state.day;
    info += `当前债务：${state.castleDebt.amount}支香烟（还剩 ${daysLeft} 天还款）\n\n`;
  } else {
    info += "你目前没有债务。\n\n";
  }
  info += "借贷：从银行借支香烟（最多10支）\n还款：偿还部分或全部债务";
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
  cleanDualIdentity(state);
  if (hasDawnBadge(state)) {
    setStory("银行柜员冷冷地看着你：\"曙光阵地的？我们银行不招待你们这些反叛分子。请马上离开，否则我叫守卫了。\"");
    refreshCastleBank();
    return;
  }
  setPhase("castle_loan_input");
  const opts = [];
  for (let i = 1; i <= 10; i++) {
    opts.push({ text: `${i}支香烟`, action: "loan_amount", amount: i });
  }
  opts.push({ text: "返回", action: "back" });
  setStory("🏦 请输入要借贷的香烟数量：");
  setOptions(opts);
  getState()._awaitingLoan = true;
}

export function handleLoanSubmit(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;
  const option = state.options[optIdx];
  if (option.action === "back") { handleCastleBank(); return; }
  const amount = option.amount;
  state.castleDebt = { amount: amount, dueDay: state.day + GAME_CONSTANTS.CASTLE.LOAN_TERM_DAYS };
  for (let i = 0; i < amount; i++) {
    const cig = CIGARETTES[Math.floor(Math.random() * CIGARETTES.length)];
    addItem({ ...cig });
  }
  setStory(`✅ 你从城堡银行借贷了 ${amount} 支香烟。行长笑眯眯地说："记得 ${GAME_CONSTANTS.CASTLE.LOAN_TERM_DAYS} 天内还清哦，不然……嘿嘿。"\n\n（没有告诉你的是，逾期要翻倍偿还。）`);
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
  const cigs = state.cargo.filter(c => c.type === "cigarette");
  if (cigs.length < needed) {
    setStory(`❌ 你需要 ${needed} 支香烟来还清债务，但你只有 ${cigs.length} 支。去凑够再来吧。`);
    refreshCastleBank();
    return;
  }
  let removed = 0;
  for (let i = state.cargo.length - 1; i >= 0 && removed < needed; i--) {
    if (state.cargo[i].type === "cigarette") {
      state.cargo.splice(i, 1);
      removed++;
    }
  }
  state.castleDebt = null;
  state.castleDebtTriggered = false;
  setStory(`✅ 你偿还了全部债务（${needed}支香烟）。行长满意地点了点头："不错不错，诚信经营，欢迎下次光临！"`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) refreshCastleBank();
}

export function handleBankBanker() {
  setPhase("castle_banker");
  const line = CASTLE_BANKER_DIALOGUES[Math.floor(Math.random() * CASTLE_BANKER_DIALOGUES.length)];
  setStory(`城堡银行行长坐在宽大的办公桌后，翘着二郎腿：${line}\n\n你决定……`);
  setOptions([
    { text: "请求宽限五天", action: "banker_mercy" },
    { text: "打死这个高利贷！", action: "banker_fight" },
    { text: "离开", action: "banker_leave" },
  ]);
}

export function handleBankerMercy() {
  const state = getState();
  if (!state.castleDebt) {
    setStory("行长摆摆手：\"你又没欠钱，宽限什么？别浪费我时间。\"");
    refreshCastleBank();
    return;
  }
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
    { text: "逃跑（25%）", action: "combat_npc_flee" },
  ]);
}

export function handleCastleGuardAction(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;
  const action = state.options[optIdx].action;
  if (action === "guard_chat") { handleGuardChat(); return; }
  if (action === "guard_enter") { handleGuardEnter(); return; }
  if (action === "guard_bribe") { handleGuardBribe(); return; }
  if (action === "guard_leave") { handleCastleOutpost(); return; }
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

export function handleCastleIdentityAction(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;
  const action = state.options[optIdx].action;
  if (action === "identity_apply") { handleIdentityApply(); return; }
  if (action === "identity_cancel") { handleIdentityCancel(); return; }
  if (action === "identity_leave") { handleCastleOutpost(); return; }
}

export function handleCastleBankerAction(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;
  const action = state.options[optIdx].action;
  if (action === "banker_mercy") { handleBankerMercy(); return; }
  if (action === "banker_fight") { handleBankerFight(); return; }
  if (action === "banker_leave") { handleCastleOutpost(); return; }
}
