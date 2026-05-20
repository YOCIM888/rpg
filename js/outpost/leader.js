import {
  getState,
  setPhase,
  setStory,
  setOptions,
  addItem,
  removeCigarettes,
  removeGasoline,
  advanceTime,
  updateStatusEffects,
  checkDeath,
  getItemDisplayName,
  removeItemById,
  isQuestDone,
  markQuestDone,
  addNpcAffinity,
} from '../state.js';

import {
  MELEE_WEAPONS,
  RANGED_WEAPONS,
  AMMO,
  SPECIAL_ITEMS,
  FIXED_LOOT_DROPS,
  LEADER_DIALOGUES,
  GAME_CONSTANTS,
  AFFINITY_MAX,
} from '../config.js';

import {
  hasNobleId,
  hasDawnBadge,
  cleanDualIdentity,
  hasCastleIdentity,
  hasDawnCaptainBadge,
} from '../faction.js';

import { showOutpostOptions } from './menu.js';

export function handleNpcLeader() {
  const state = getState();
  if (!state.leaderAlive) {
    setStory("阵地首领已经不在了……他的位置空着，阵地里的人都在议论纷纷。");
    setPhase("npc_leader");
    setOptions([{ text: "返回", action: "leader_leave" }]);
    return;
  }
  cleanDualIdentity(state);
  if (hasCastleIdentity(state)) {
    setStory("阵地首领警惕地盯着你：\"你居然是城堡势力的人，快滚开！\" 几个卫兵围了上来，你只好灰溜溜地离开。");
    setPhase("npc_leader");
    setOptions([{ text: "返回", action: "leader_leave" }]);
    return;
  }
  const hasBadge = hasDawnBadge(state);
  const affinity = state.npcAffinity.leader || 0;
  setStory(`【阵地首领】\n\n阵地首领是个满脸风霜的中年男人，眼神坚毅。他打量着你，微微点头。\n\n好感度：${affinity}/${AFFINITY_MAX.leader}${hasBadge ? "\n\n你已加入曙光阵地，佩戴着曙光徽章。" : ""}`);
  showLeaderOptions();
}

export function showLeaderOptions() {
  const state = getState();
  setPhase("npc_leader");
  const hasBadge = hasDawnBadge(state);
  const opts = [
    { text: "对话", action: "leader_chat" },
    { text: "送礼", action: "leader_gift" },
    { text: hasBadge ? "退出阵地" : "加入阵地", action: hasBadge ? "leader_quit" : "leader_join" },
    { text: "领取礼物", action: "leader_claim" },
    { text: "获取荣誉", action: "leader_honor" },
  ];
  const hasRecorder = state.other.some(i => i.id === "strange_recorder");
  const leaderQuestInProgress = state.npcQuestsDone && (state.npcQuestsDone.leaderQuest1 || state.npcQuestsDone.leaderQuest2);
  if (!isQuestDone("leaderQuest3") && (hasRecorder || leaderQuestInProgress)) {
    opts.push({ text: "关于录音笔", action: "leader_recorder" });
  }
  opts.push({ text: "悄悄暗杀", action: "leader_assassinate" });
  opts.push({ text: "离开", action: "leader_leave" });
  setOptions(opts);
}

export function handleLeaderChat() {
  const state = getState();
  if (state.lastLeaderChatDay === state.day) {
    setStory("首领摆摆手：\"今天已经说得够多了，我很忙，你走吧。\"");
    showLeaderOptions();
    return;
  }
  state.lastLeaderChatDay = state.day;
  addNpcAffinity("leader", GAME_CONSTANTS.OUTPOST.LEADER_CHAT_AFFINITY);
  const chatLines = LEADER_DIALOGUES;
  const line = chatLines[Math.floor(Math.random() * chatLines.length)];
  setStory(`首领忙里偷闲和你聊了几句：${line}\n\n好感度 +1（当前 ${state.npcAffinity.leader}）`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) showLeaderOptions();
}

export function handleLeaderRecorder() {
  const state = getState();
  const hasRecorder = state.other.some(i => i.id === "strange_recorder");

  if (!hasRecorder && !isQuestDone("leaderQuest1")) {
    showLeaderOptions();
    return;
  }

  if (isQuestDone("leaderQuest3")) {
    setStory("首领拍了拍你的肩膀：\"过去的事就让它过去吧。\"");
    showLeaderOptions();
    return;
  }

  if (!isQuestDone("leaderQuest1")) {
    const recorderIdx = state.other.findIndex(i => i.id === "strange_recorder");
    if (recorderIdx !== -1) {
      state.other.splice(recorderIdx, 1);
    }
    markQuestDone("leaderQuest1");
    const letter = SPECIAL_ITEMS.letter_to_sister;
    addItem({ ...letter });
    addNpcAffinity("leader", 10);
    setStory(`你把录音笔递给首领。他按下播放键，脸色一点一点地沉了下去。\n\n录音结束后，帐篷里一片死寂。\n\n首领的拳头攥得咯咯作响，声音沙哑：\n"这个畜生……他杀了我派去的人。那个女孩，她只是个情报员，她什么都没做错……"\n\n他闭上眼，深吸了一口气：\n"三年前，他看上了我妹妹。我承认，我反对他们在一起，是因为我不信任他。后来他果然露出了真面目——他想控制阵地的资源，被我拒绝后就怀恨在心。"\n\n"我赶走了他，也伤了妹妹的心。她走了，去了城堡，成了现在的皇后。"\n\n首领从抽屉里取出一封泛黄的信：\n"这封信我写了三年，一直没勇气寄出去。你……能帮我交给她吗？"\n\n📖 获得【给妹妹的信】\n\n首领好感度 +10（当前 ${state.npcAffinity.leader}/${AFFINITY_MAX.leader}）\n\n（提示：将信件交给城堡的皇后）`);
    showLeaderOptions();
    return;
  }

  if (isQuestDone("leaderQuest1") && !isQuestDone("leaderQuest2")) {
    const hasReply = state.other.some(i => i.id === "queen_reply");
    if (!hasReply) {
      setStory("首领看着你：\"信送到了吗？她的回信……我需要知道她的想法。\"");
      showLeaderOptions();
      return;
    }
    handleLeaderQuest2();
    return;
  }

  if (isQuestDone("leaderQuest2") && !isQuestDone("leaderQuest3")) {
    handleLeaderQuest3();
    return;
  }

  showLeaderOptions();
}

export function handleLeaderQuest2() {
  const state = getState();
  const hasReply = state.other.some(i => i.id === "queen_reply");
  const baijiuCount = state.drinks.filter(i => i.id === "高度白酒").reduce((sum, i) => sum + (i.count || 1), 0);
  const needBaijiu = 5;

  if (!hasReply || baijiuCount < needBaijiu) {
    let msg = "首领叹了口气：\"我想喝点酒，你帮我弄点高度白酒来。5瓶就够了。还有……我妹妹的回信，你带了吗？\"\n\n所需物品：";
    if (!hasReply) msg += "\n  皇后的回信 ✗";
    else msg += "\n  皇后的回信 ✓";
    if (baijiuCount < needBaijiu) msg += `\n  高度白酒 ${baijiuCount}/${needBaijiu}`;
    else msg += `\n  高度白酒 ${baijiuCount}/${needBaijiu} ✓`;
    setStory(msg);
    showLeaderOptions();
    return;
  }

  const replyIdx = state.other.findIndex(i => i.id === "queen_reply");
  if (replyIdx !== -1) state.other.splice(replyIdx, 1);
  removeItemById("drinks", "高度白酒", needBaijiu);
  markQuestDone("leaderQuest2");
  addNpcAffinity("leader", 20);
  advanceTime(3);
  updateStatusEffects();
  checkDeath();
  setStory(`你把皇后的回信和5瓶高度白酒放在首领面前。\n\n他先倒了满满一杯，一饮而尽。然后小心翼翼地拆开回信，一个字一个字地看。\n\n"她说……她不怪我。" 首领的声音有些颤抖，"她说她理解我为什么赶走那个人，但她已经习惯了城堡的生活，不想回来了。"\n\n他又灌了一杯酒：\n"三年前，我写了一封信给她。我说，哥哥错了，不该把她的心上人赶走。我说，回来吧，阵地永远是你的家。"\n\n"可她没回来。"\n\n首领把信折好，放进了胸口的口袋里。他举起酒杯：\n"来，陪我喝。今晚不谈阵地，不谈末日，就两个老朋友，喝到天亮。"\n\n你们喝了一整夜。他讲了很多以前的事——怎么建起阵地，怎么在尸潮中活下来，怎么看着身边的人一个一个离开。说到最后，他靠在椅背上，醉眼朦胧地念着回信的最后一句话：\n\n"哥，我不恨你。但有些伤口，时间也治不好。"\n\n首领好感度 +20（当前 ${state.npcAffinity.leader}/${AFFINITY_MAX.leader}）\n\n时间推进了3个回合。`);
  if (!state.gameOver) showLeaderOptions();
}

export function handleLeaderQuest3() {
  const state = getState();
  const serumCount = state.medicine.filter(i => i.id === "improved_serum").reduce((sum, i) => sum + (i.count || 1), 0);
  const needSerum = 3;

  if (serumCount < needSerum) {
    setStory(`首领浑身长满了红疹，脸色铁青，显然是酒精中毒了。他勉强撑着说：\n"我没事……只是喝多了……"\n\n但他的情况明显很严重，需要万能针剂来解毒。\n\n所需物品：\n  万能针剂 ${serumCount}/${needSerum}`);
    showLeaderOptions();
    return;
  }

  removeItemById("medicine", "improved_serum", needSerum);
  markQuestDone("leaderQuest3");
  addNpcAffinity("leader", 30);
  addItem({ id: "9×19mm", name: "9×19mm", type: "ammo", count: 100 });
  const token = SPECIAL_ITEMS.love_token;
  addItem({ ...token });
  advanceTime(2);
  updateStatusEffects();
  checkDeath();
  setStory(`你把三支万能针剂依次注入首领体内。他的呼吸渐渐平稳，身上的红疹也开始消退。\n\n过了好一会儿，首领缓缓睁开眼睛，看到你守在旁边，露出一丝苦笑：\n"让你见笑了。堂堂阵地首领，差点被酒给送走。"\n\n他从枕头底下摸出一个小盒子，递给你：\n"别误会，这不是给你的定情信物。" 他咳了两声，"这是以前那个人——国王，送给我妹妹的礼物。他落在了阵地，一直没收回去。"\n\n他顿了顿：\n"现在它对你更有用。拿着吧，算是谢谢你。不只是救了我一命，还有……帮我完成了三年没做到的事。"\n\n你打开盒子，里面是一枚精致的吊坠，上面刻着一朵小小的向日葵。\n\n🏹 获得【9×19mm】×100！\n📿 获得【定情信物】！\n\n首领好感度 +30（当前 ${state.npcAffinity.leader}/${AFFINITY_MAX.leader}）\n\n时间推进了2个回合。`);
  if (!state.gameOver) showLeaderOptions();
}

export function handleLeaderHonor() {
  const state = getState();
  if (hasCastleIdentity(state)) {
    setStory("首领皱起了眉头，目光变得锐利：\"你身上有城堡势力的身份牌。我们曙光阵地不欢迎城堡的人。在你和城堡彻底断绝关系之前，不要再来找我了。\"\n\n他转过身去，不再看你。");
    showLeaderOptions();
    return;
  }
  const vAffinity = state.npcAffinity.v || 0;
  const xiaohanAffinity = state.npcAffinity.xiaohan || 0;
  const liliAffinity = state.npcAffinity.lili || 0;
  const allMaxed = vAffinity >= AFFINITY_MAX.v && xiaohanAffinity >= AFFINITY_MAX.xiaohan && liliAffinity >= AFFINITY_MAX.lili && (state.npcAffinity.leader || 0) >= AFFINITY_MAX.leader;

  if (!allMaxed) {
    const missing = [];
    if (vAffinity < AFFINITY_MAX.v) missing.push(`V小姐（${vAffinity}/${AFFINITY_MAX.v}）`);
    if (xiaohanAffinity < AFFINITY_MAX.xiaohan) missing.push(`苏小涵（${xiaohanAffinity}/${AFFINITY_MAX.xiaohan}）`);
    if (liliAffinity < AFFINITY_MAX.lili) missing.push(`莉莉丝（${liliAffinity}/${AFFINITY_MAX.lili}）`);
    if ((state.npcAffinity.leader || 0) < AFFINITY_MAX.leader) missing.push(`首领本人（${state.npcAffinity.leader || 0}/${AFFINITY_MAX.leader}）`);

    setStory(`首领摇了摇头，语气中带着遗憾：\"阵地的人还是不够信任你。你看看，${missing.join("、")}——他们对你的信任都还不够。曙光先锋队长的位置，需要得到阵地所有人的认可才行。去和他们多聊聊吧，帮助每一个人，让他们真心接纳你。等所有人都信任你了，再来找我。\"`);
    showLeaderOptions();
    return;
  }

  if (hasDawnCaptainBadge(state)) {
    setStory("首领拍了拍你的肩膀：\"你已经是曙光先锋队长了，无需再次授予。\"");
    showLeaderOptions();
    return;
  }

  state.other.push({ ...SPECIAL_ITEMS.dawn_captain_badge });

  const vectorWeapon = RANGED_WEAPONS.find(w => w.id === GAME_CONSTANTS.OUTPOST.HONOR_WEAPON_ID);
  const vectorAmmo = AMMO.find(a => a.id === GAME_CONSTANTS.OUTPOST.HONOR_AMMO_ID);
  if (vectorWeapon) addItem({ ...vectorWeapon });
  if (vectorAmmo) addItem({ id: vectorAmmo.id, name: vectorAmmo.name, type: "ammo", count: GAME_CONSTANTS.OUTPOST.HONOR_AMMO_COUNT });

  setStory(`首领看着你，眼中闪烁着欣慰的光芒。他站起身，郑重地走到你面前。\n\n\"${state.name}，自从你来到曙光阵地，这里的每一个人都被你所感动。V小姐那冷漠的心被你温暖了，苏小涵的笑容因你而更加灿烂，莉莉丝那调皮的性格也对你言听计从……甚至连我这个老头子，也从你身上看到了末日的希望。\"\n\n他顿了顿，从怀中取出一枚泛着银光的徽章，又从身后的箱子里拿出一把崭新的冲锋枪和几盒子弹。\n\n\"这是曙光队长徽章，代表着曙光阵地最高的荣誉。从今天起，你就是曙光先锋队长——阵地的领军人物！这把Vector冲锋枪是阵地最好的装备之一，配上60发9mm子弹，足够你应对任何危险。\"\n\n\"但你要记住，一旦接受这份荣誉，你将永远无法再与末日城堡有任何瓜葛。他们不会接受一个曙光队长，就像我们不会接受一个城堡贵族一样。\"\n\n他将徽章郑重地别在你的胸前，把武器塞到你手中。\n\n\"去吧，带领我们走向真正的曙光。\"\n\n获得【曙光队长徽章】！\n获得【Vector】+【9×19mm×60】！\n\n（提示：持有曙光队长徽章后，打工和乞讨产出翻倍，莉莉丝所有服务永久半价，但无法获得任何城堡身份。）`);
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
  state.food.forEach((item, i) => items.push({ ...item, cat: "food", idx: i, label: `[食物] ${getItemDisplayName(item)}` }));
  state.drinks.forEach((item, i) => items.push({ ...item, cat: "drinks", idx: i, label: `[饮品] ${getItemDisplayName(item)}` }));
  state.medicine.forEach((item, i) => items.push({ ...item, cat: "medicine", idx: i, label: `[医疗] ${getItemDisplayName(item)}` }));
  state.other.forEach((item, i) => items.push({ ...item, cat: "other", idx: i, label: `[其他] ${getItemDisplayName(item)}` }));
  if (state.cigarettes > 0) items.push({ cat: "cigarettes", idx: 0, name: "香烟", label: `[货物] (${state.cigarettes})香烟` });
  if (state.gasoline > 0) items.push({ cat: "gasoline", idx: 0, name: "汽油", label: `[货物] (${state.gasoline})汽油` });
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
  if (!state.unlockedAchievements) state.unlockedAchievements = [];
  if (!state.unlockedAchievements.includes("dawn_member")) state.unlockedAchievements.push("dawn_member");
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
  const captainIdx = state.other.findIndex(i => i.id === SPECIAL_ITEMS.dawn_captain_badge.id);
  if (captainIdx !== -1) {
    state.other.splice(captainIdx, 1);
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
  if ((state.npcAffinity.leader || 0) < AFFINITY_MAX.leader) {
    setStory(`首领笑了笑："你的好感度还不够（${state.npcAffinity.leader}/${AFFINITY_MAX.leader}），再帮我多做点事吧。"`);
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
  if (item.cat === "cigarettes") {
    removeCigarettes(1);
  } else if (item.cat === "gasoline") {
    removeGasoline(1);
  } else {
    const catMap = { food: state.food, drinks: state.drinks, medicine: state.medicine, other: state.other };
    const targetItem = catMap[item.cat][item.idx];
    if (targetItem && (targetItem.count || 1) > 1) {
      targetItem.count = (targetItem.count || 1) - 1;
    } else {
      catMap[item.cat].splice(item.idx, 1);
    }
  }
  state.lastLeaderGiftDay = state.day;
  addNpcAffinity("leader", GAME_CONSTANTS.OUTPOST.LEADER_GIFT_AFFINITY);
  setStory(`你送上了一份${getItemDisplayName(item)}。首领收下后点了点头："嗯，心意领了。"\n\n好感度 +1（当前 ${state.npcAffinity.leader}）`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) showLeaderOptions();
}
