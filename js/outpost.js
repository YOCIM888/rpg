/* ============================================================
   曙光阵地模块
   组织顺序：阵地菜单 → 探索/乞讨/工作 → 阵地首领
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
  canBegToday,
  markBegDone,
} from './state.js';

import {
  FRUITS,
  MELEE_WEAPONS,
  RANGED_WEAPONS,
  SPECIAL_ITEMS,
  FIXED_LOOT_DROPS,
} from './config.js';

import {
  hasNobleId,
  hasDawnBadge,
  cleanDualIdentity,
} from './faction.js';

// ---------- 曙光阵地 ----------

/**
 * 显示曙光阵地专属菜单
 */
export function showOutpostOptions() {
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
    { text: "V小姐", action: "npc_v" },
    { text: "苏小涵", action: "npc_xiaohan" },
    { text: "莉莉丝", action: "npc_lili" },
    { text: "阵地首领", action: "npc_leader" }
  ];
  if (state.phaseIndex >= 1 && state.phaseIndex <= 4) {
    opts.push({ text: "轻松打工", action: "work" });
  }
  opts.push({ text: "乞讨物资", action: "beg_supplies" });
  setOptions(opts);
}

/**
 * 阵地探索 - 别人的地盘不能偷东西
 */
export function handleOutpostExplore() {
  setStory("你四处张望了一下——这里是别人的地盘，偷东西不好吧。");
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  showOutpostOptions();
}

/**
 * 乞讨物资 - 每日限领1次
 */
export function handleBegSupplies() {
  const state = getState();
  cleanDualIdentity(state);
  if (hasNobleId(state)) {
    setStory("阵地管理员瞥了你一眼：\"哼，城堡的贵族还来我们这讨饭？要不要脸！\" 周围的人投来鄙夷的目光，你只好灰溜溜地走开。");
    showOutpostOptions();
    return;
  }
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

export function handleWork() {
  const state = getState();
  cleanDualIdentity(state);
  if (hasNobleId(state)) {
    setStory("阵地主管皱了皱眉：\"你都是贵族老爷了，还来抢我们穷人的活干？去去去！\" 你被赶走了。");
    showOutpostOptions();
    return;
  }
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

// ---------- 阵地首领 ----------

export function handleNpcLeader() {
  const state = getState();
  cleanDualIdentity(state);
  if (hasNobleId(state)) {
    setStory("阵地首领警惕地盯着你：\"你居然是敌对势力的人，快滚开！\" 几个卫兵围了上来，你只好灰溜溜地离开。");
    showOutpostOptions();
    return;
  }
  const hasBadge = hasDawnBadge(state);
  const affinity = state.npcAffinity.leader || 0;
  setStory(`【阵地首领】\n\n阵地首领是个满脸风霜的中年男人，眼神坚毅。他打量着你，微微点头。\n\n好感度：${affinity}/150${hasBadge ? "\n\n你已加入曙光阵地，佩戴着曙光徽章。" : ""}`);
  showLeaderOptions();
}

export function showLeaderOptions() {
  const state = getState();
  setPhase("npc_leader");
  const hasBadge = hasDawnBadge(state);
  setOptions([
    { text: "对话", action: "leader_chat" },
    { text: "送礼", action: "leader_gift" },
    { text: hasBadge ? "退出阵地" : "加入阵地", action: hasBadge ? "leader_quit" : "leader_join" },
    { text: "领取礼物", action: "leader_claim" },
    { text: "离开", action: "leader_leave" },
  ]);
}

export function handleLeaderChat() {
  const state = getState();
  if (state.lastLeaderChatDay === state.day) {
    setStory("首领摆摆手：\"今天已经说得够多了，我很忙，你走吧。\"");
    showLeaderOptions();
    return;
  }
  state.lastLeaderChatDay = state.day;
  state.npcAffinity.leader = (state.npcAffinity.leader || 0) + 1;
  const chatLines = [
    "\"曙光阵地虽然简陋，但至少能让大家活下去。\"",
    "\"末世之中，守望相助才是正道。那些城堡贵族只顾自己享乐。\"",
    "\"你干得不错，继续保持。\"",
    "\"唉，物资越来越紧张了，但我们会挺过去的。\"",
    "\"别偷懒，去干活！阵地不养闲人！\"",
  ];
  const line = chatLines[Math.floor(Math.random() * chatLines.length)];
  setStory(`首领忙里偷闲和你聊了几句：${line}\n\n好感度 +1（当前 ${state.npcAffinity.leader}）`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) showLeaderOptions();
}

export function handleLeaderGift() {
  const state = getState();
  if (state.lastLeaderGiftDay === state.day) {
    setStory("首领摆摆手：\"今天已经收过你的东西了，我很忙。\"");
    showLeaderOptions();
    return;
  }
  let items = [];
  state.food.forEach((item, i) => items.push({ ...item, cat: "food", idx: i, label: `[食物] ${item.name}` }));
  state.drinks.forEach((item, i) => items.push({ ...item, cat: "drinks", idx: i, label: `[饮品] ${item.name}` }));
  state.medicine.forEach((item, i) => items.push({ ...item, cat: "medicine", idx: i, label: `[医疗] ${item.name}` }));
  state.other.forEach((item, i) => items.push({ ...item, cat: "other", idx: i, label: `[其他] ${item.name}` }));
  state.cargo.forEach((item, i) => items.push({ ...item, cat: "cargo", idx: i, label: `[货物] ${item.name}` }));
  if (items.length === 0) {
    setStory("你翻了翻背包，没什么能拿得出手的东西。");
    showLeaderOptions();
    return;
  }
  setPhase("leader_gift_select");
  setStory("请选择要送给首领的物品：");
  const opts = items.map((item, i) => ({ text: item.label, action: "leader_do_gift", index: i, giftItem: item }));
  opts.push({ text: "返回", action: "back_to_leader", index: -1 });
  setOptions(opts);
}

export function handleLeaderJoin() {
  const state = getState();
  if (hasDawnBadge(state)) {
    setStory("你已经加入了曙光阵地。");
    showLeaderOptions();
    return;
  }
  state.other.push({ ...SPECIAL_ITEMS.dawn_badge });
  cleanDualIdentity(state);
  setStory("首领郑重地将一枚曙光徽章别在你的胸前：\"欢迎加入曙光阵地。从今往后，我们就是一家人了。\"\n\n获得【曙光徽章】！\n\n（注意：加入曙光阵地后，你将无法在城堡银行借贷、在城堡打工、或办理贵族身份。）");
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) showLeaderOptions();
}

export function handleLeaderQuit() {
  const state = getState();
  const idx = state.other.findIndex(i => i.id === SPECIAL_ITEMS.dawn_badge.id);
  if (idx !== -1) {
    state.other.splice(idx, 1);
  }
  setStory("你交回了曙光徽章。首领叹了口气：\"人各有志，走吧。\"\n\n你退出了曙光阵地。");
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) showLeaderOptions();
}

export function handleLeaderClaim() {
  const state = getState();
  if (state.leaderGiftClaimed) {
    setStory("首领摇摇头：\"礼物你已经领过了，别贪心。\"");
    showLeaderOptions();
    return;
  }
  if ((state.npcAffinity.leader || 0) < 150) {
    setStory(`首领笑了笑："你的好感度还不够（${state.npcAffinity.leader}/150），再帮我多做点事吧。"`);
    showLeaderOptions();
    return;
  }
  state.leaderGiftClaimed = true;
  const gift = FIXED_LOOT_DROPS.leader_gift;
  const giftWeapon = gift.type === "ranged"
    ? RANGED_WEAPONS.find(w => w.id === gift.weaponId)
    : MELEE_WEAPONS.find(w => w.id === gift.weaponId);
  if (!giftWeapon) return;
  const giftItem = gift.type === "melee"
    ? { ...giftWeapon, currentDurability: giftWeapon.durability }
    : { ...giftWeapon };
  const added = addItem(giftItem);
  if (added) {
    const stats = gift.type === "melee"
      ? `${giftWeapon.damage}伤害/${giftWeapon.durability}耐久/${Math.round(giftWeapon.comboRate * 100)}%连击率`
      : `${giftWeapon.damage}伤害/${giftWeapon.ammoType}`;
    setStory(`首领从身后的箱子里取出一件武器："这是当年我在部队时用的${giftWeapon.name}，跟了我很多年。现在它是你的了。"\n\n获得【${giftWeapon.name}】(${stats})！`);
  } else {
    setStory(`首领想送你一把${giftWeapon.name}，但你的背包已经满了。先腾点空间吧。`);
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) showLeaderOptions();
}

export function handleLeaderDoGift(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;
  const option = state.options[optIdx];
  if (!option.giftItem) { showLeaderOptions(); return; }
  const item = option.giftItem;
  const catMap = { food: state.food, drinks: state.drinks, medicine: state.medicine, other: state.other, cargo: state.cargo };
  catMap[item.cat].splice(item.idx, 1);
  state.lastLeaderGiftDay = state.day;
  state.npcAffinity.leader = (state.npcAffinity.leader || 0) + 1;
  setStory(`你送上了一份${item.name}。首领收下后点了点头："嗯，心意领了。"\n\n好感度 +1（当前 ${state.npcAffinity.leader}）`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) showLeaderOptions();
}
