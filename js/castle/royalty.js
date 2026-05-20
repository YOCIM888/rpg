import { getState, setPhase, setStory, setOptions, addItem, advanceTime, updateStatusEffects, checkDeath, getItemDisplayName, isQuestDone, markQuestDone, removeItemById, removeRoyalCoins } from '../state.js';
import { CASTLE_KING_DIALOGUES, CASTLE_KING_HIGH_DIALOGUES, CASTLE_QUEEN_DIALOGUES, CASTLE_QUEEN_HIGH_DIALOGUES, FOODS, FRUITS, DRINKS, MEDICINES, RANGED_WEAPONS, MELEE_WEAPONS, GAME_CONSTANTS, getDialogueByRank, KING_UNDERGROUND_STORY, SPECIAL_ITEMS } from '../config.js';
import { getCastleRank, getCastleRankName, hasCastleIdentity } from '../faction.js';
import { refreshCastleOutpost } from './outpost.js';
import { refreshCastleInterior } from './interior.js';
import { checkGoHomeEnding } from '../game/endings.js';

export function handleCastleKing() {
  const state = getState();
  const rank = getCastleRank(state);
  const line = getDialogueByRank("king", rank);
  setStory(`城堡国王坐在高高的王座上，俯视着你：${line}`);
  const opts = [];
  if (rank === 6 && state.doctorQuest1Accepted && !state.undergroundKeyObtained) {
    opts.push({ text: "陛下，我想去地下区域", action: "king_underground" });
  }
  opts.push({ text: "返回大厅", action: "castle_back" });
  setOptions(opts);
  setPhase("castle_interior");
}

export function handleCastleQueen() {
  const state = getState();
  const rank = getCastleRank(state);
  const line = getDialogueByRank("queen", rank);
  const hasLetter = state.other.some(i => i.id === "letter_to_sister");
  const hasToken = state.other.some(i => i.id === "love_token");
  const quest4Done = isQuestDone("queenQuest4");
  
  const opts = [];
  let story = `城堡皇后慵懒地靠在软榻上，瞥了你一眼：${line}`;
  
  if (hasLetter) {
    story += "\n\n你注意到她的目光在扫过你手中的信件时，微微停顿了一下。";
    opts.push({ text: "迟到的道歉", action: "queen_late_apology" });
  }
  
  if (hasToken) {
    story += "\n\n你拿出那枚向日葵吊坠，皇后的表情瞬间凝固了。";
    opts.push({ text: "聊聊过去", action: "queen_past" });
  }
  
  if (quest4Done) {
    opts.push({ text: "皇家交易", action: "queen_royal_trade" });
  }
  
  setStory(story);
  setPhase("castle_interior");
  opts.push({ text: "返回大厅", action: "castle_back" });
  setOptions(opts);
}

export function handleQueenLateApology() {
  const state = getState();
  const hasLetter = state.other.some(i => i.id === "letter_to_sister");
  if (!hasLetter) {
    setStory("你没有信件可以交给皇后。");
    refreshCastleInterior();
    return;
  }
  const letterIdx = state.other.findIndex(i => i.id === "letter_to_sister");
  if (letterIdx !== -1) {
    state.other.splice(letterIdx, 1);
  }
  const reply = SPECIAL_ITEMS.queen_reply;
  addItem({ ...reply });
  setStory(`你将那封泛黄的信递给皇后。\n\n她漫不经心地接过，刚要随手放下，却看到了信封上的字迹。她的手僵住了。\n\n"这是……哥哥的字迹。"\n\n她缓缓拆开信，一个字一个字地看。帐篷里安静得只能听到纸张翻动的声音。\n\n良久，她将信折好，贴在胸口。她的眼眶红了，但没有流泪。\n\n"三年了。" 她的声音很轻，"三年了他才肯让人送来。"\n\n她沉默了很久，久到你以为她不会再说话了。\n\n"我不会回去的。" 她终于开口，语气平静却坚定，"我已经习惯了这里的生活。城堡虽然虚伪，但至少……我不用再面对那些回忆。"\n\n她从梳妆台上取出一封信纸，提笔写了几行字：\n"把这个交给他。告诉他，我不恨他。但有些伤口，时间也治不好。"\n\n📖 获得【皇后的回信】\n\n（提示：将回信交给阵地首领）`);
  refreshCastleInterior();
}

export function handleCastleBanquet() {
  const state = getState();
  const hasId = hasCastleIdentity(state);
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
  state.hunger = Math.min(100, state.hunger + GAME_CONSTANTS.CASTLE.BANQUET_HUNGER_RESTORE);
  state.hydration = Math.min(100, state.hydration + GAME_CONSTANTS.CASTLE.BANQUET_HYDRATION_RESTORE);
  setStory(`你坐在长长的宴会桌前，享用着丰盛的大餐——烤火鸡、红酒、奶油浓汤……在末日里吃上这样一顿简直是奢望！\n\n饱食度和水分各恢复 +${GAME_CONSTANTS.CASTLE.BANQUET_HUNGER_RESTORE}%。`);
  advanceTime(GAME_CONSTANTS.CASTLE.BANQUET_TIME_COST);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) refreshCastleInterior();
}

export function handleQueenPast() {
  const state = getState();
  if (isQuestDone("queenQuest4")) {
    setStory("皇后微笑着看着你：\"过去的事，就让它过去吧。我们都要往前看。\"");
    refreshCastleInterior();
    return;
  }
  
  const opts = [];
  let story = "皇后看着那枚向日葵吊坠，目光复杂：\n\"这是他送我的……在我们还是普通人的时候。\"\n\n她沉默了片刻，叹了口气：\n\"有些事，我一直想找人帮忙。你愿意听吗？\"";
  
  if (!isQuestDone("queenQuest1")) {
    opts.push({ text: "消愁", action: "queen_quest1" });
  } else if (!isQuestDone("queenQuest2")) {
    opts.push({ text: "消愁（已完成）", action: "queen_past", disabled: true });
    opts.push({ text: "国王近况", action: "queen_quest2" });
  } else if (!isQuestDone("queenQuest3")) {
    opts.push({ text: "消愁（已完成）", action: "queen_past", disabled: true });
    opts.push({ text: "国王近况（已完成）", action: "queen_past", disabled: true });
    opts.push({ text: "剑术练习", action: "queen_quest3" });
  } else if (!isQuestDone("queenQuest4")) {
    opts.push({ text: "消愁（已完成）", action: "queen_past", disabled: true });
    opts.push({ text: "国王近况（已完成）", action: "queen_past", disabled: true });
    opts.push({ text: "剑术练习（已完成）", action: "queen_past", disabled: true });
    opts.push({ text: "结婚纪念日", action: "queen_quest4" });
  }
  
  opts.push({ text: "返回大厅", action: "castle_back" });
  setStory(story);
  setPhase("castle_interior");
  setOptions(opts);
}

export function handleQueenQuest1() {
  const state = getState();
  const baiweiCount = state.drinks.filter(i => i.id === "百味啤酒").reduce((sum, i) => sum + (i.count || 1), 0);
  const dongliCount = state.drinks.filter(i => i.id === "动力啤酒").reduce((sum, i) => sum + (i.count || 1), 0);
  const needBaiwei = 5;
  const needDongli = 5;
  
  if (baiweiCount < needBaiwei || dongliCount < needDongli) {
    let msg = "皇后叹了口气：\"看到这吊坠，就想起那些不愉快的事。帮我弄点酒来消消愁吧。\"\n\n所需物品：";
    if (baiweiCount < needBaiwei) msg += `\n  百味啤酒 ${baiweiCount}/${needBaiwei}`;
    else msg += `\n  百味啤酒 ${baiweiCount}/${needBaiwei} ✓`;
    if (dongliCount < needDongli) msg += `\n  动力啤酒 ${dongliCount}/${needDongli}`;
    else msg += `\n  动力啤酒 ${dongliCount}/${needDongli} ✓`;
    setStory(msg);
    refreshCastleInterior();
    return;
  }
  
  removeItemById("drinks", "百味啤酒", needBaiwei);
  removeItemById("drinks", "动力啤酒", needDongli);
  markQuestDone("queenQuest1");
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  addItem({ id: "皇家币", name: "皇家币", type: "royal_coin", count: 10 });
  setStory(`你把百味啤酒和动力啤酒摆在皇后面前。她拿起一瓶，仰头灌了一大口。\n\n"你不知道，"她擦了擦嘴角，"这吊坠是他亲手做的。那时候他还没当国王，只是个地产商。他说向日葵永远朝着太阳，就像他永远看着我。"\n\n她又灌了一口：\n"后来呢？后来他有了权力，有了城堡，有了所有人跪在他脚下。可他还是要我戴着这个。你说，这是深情，还是枷锁？"\n\n你没有回答。有些问题，答案不在酒里。\n\n🪙 获得【皇家币】×10`);
  refreshCastleInterior();
}

export function handleQueenQuest2() {
  const state = getState();
  const gouqiCount = state.food.filter(i => i.id === "gouqi").reduce((sum, i) => sum + (i.count || 1), 0);
  const needGouqi = 10;
  
  if (gouqiCount < needGouqi) {
    setStory(`皇后忧心忡忡地说：\"最近国王身体不好，总是咳嗽。我听说枸杞对身体有益，你能帮我找一些来吗？\"\n\n所需物品：\n  枸杞 ${gouqiCount}/${needGouqi}`);
    refreshCastleInterior();
    return;
  }
  
  removeItemById("food", "gouqi", needGouqi);
  markQuestDone("queenQuest2");
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  addItem({ id: "皇家币", name: "皇家币", type: "royal_coin", count: 20 });
  setStory(`你把枸杞交给皇后。她小心翼翼地收好，像是捧着什么珍贵的宝物。\n\n"谢谢。"她的声音很轻，"不管别人怎么说他，他对我……是真的好。"\n\n她顿了顿，苦笑道：\n"他只有我一个皇后。在这个末世，一个国王只守着一个人，你信吗？"\n\n你看着她的眼睛，那里有光，也有阴影。\n\n🪙 获得【皇家币】×20`);
  refreshCastleInterior();
}

export function handleQueenQuest3() {
  const state = getState();
  const swordCount = state.other.filter(i => i.id === "西洋剑").length;
  const needSwords = 3;
  
  if (swordCount < needSwords) {
    setStory(`皇后说：\"城堡演练场的剑都坏了，急需新的。你能弄到3把西洋剑来吗？国王喜欢练剑，这是他唯一的爱好。\"\n\n所需物品：\n  西洋剑 ${swordCount}/${needSwords}`);
    refreshCastleInterior();
    return;
  }
  
  for (let i = 0; i < needSwords; i++) {
    const idx = state.other.findIndex(item => item.id === "西洋剑");
    if (idx !== -1) state.other.splice(idx, 1);
  }
  markQuestDone("queenQuest3");
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  addItem({ id: "皇家币", name: "皇家币", type: "royal_coin", count: 30 });
  setStory(`你把3把西洋剑交给了皇后。她亲自检查了每一把，满意地点了点头。\n\n"他每天都要练剑。"皇后看着剑刃上的寒光，"他说，只有手中有剑，才能保护想保护的人。"\n\n她忽然低声说：\n"可他保护了所有人，唯独保护不了自己。他的身体……越来越差了。"\n\n🪙 获得【皇家币】×30`);
  refreshCastleInterior();
}

export function handleQueenQuest4() {
  const state = getState();
  const hasM700 = state.rangedWeapon && state.rangedWeapon.id === "M700";
  const m700InBag = state.other.some(i => i.id === "M700");
  
  if (!hasM700 && !m700InBag) {
    setStory("皇后犹豫了一下，然后说：\"今天是我们的结婚纪念日。他喜欢打猎和收集武器……我想送他一把好枪。你能帮我弄到一把M700吗？\"\n\n所需物品：\n  M700 ×1\n\n（提示：M700需要装备为远程武器或放在背包中）");
    refreshCastleInterior();
    return;
  }
  
  if (hasM700) {
    state.rangedWeapon = null;
  } else {
    const idx = state.other.findIndex(i => i.id === "M700");
    if (idx !== -1) state.other.splice(idx, 1);
  }
  
  markQuestDone("queenQuest4");
  if (checkGoHomeEnding()) return;
  addItem({ id: "皇家币", name: "皇家币", type: "royal_coin", count: 40 });
  const pass = SPECIAL_ITEMS.castle_pass;
  addItem({ ...pass });
  setStory(`你把M700递给皇后。她接过枪，轻轻抚摸着枪托上的纹路，眼中闪过一丝温柔。\n\n"他一定会喜欢的。"她把枪放在一旁，从软榻下取出一个精致的信封，递给你。\n\n"这是城堡通行证。有了它，你可以随时进出城堡，不需要身份牌，也不需要贿赂守卫。"\n\n她看着窗外的夜色，轻声说：\n"你知道吗？他从来不让我受一点委屈。在这个末世，他给了我一个家，一个王冠，还有……他全部的真心。"\n\n"可真心这种东西，有时候比子弹还伤人。"\n\n她回头看着你，微笑中带着释然：\n"替我照顾好他。也替我……照顾好我哥哥。"\n\n🪙 获得【皇家币】×40！\n🎫 获得【城堡通行证】！\n\n（提示：持有城堡通行证可自由进出城堡）`);
  refreshCastleInterior();
}

export function handleKingUnderground() {
  const state = getState();
  if (state.undergroundKeyObtained) {
    setStory("国王摆了摆手：\"钥匙不是已经给你了吗？快去吧。\"");
    refreshCastleInterior();
    return;
  }
  setStory(KING_UNDERGROUND_STORY);
  const hasAWM = state.rangedWeapon && state.rangedWeapon.id === GAME_CONSTANTS.ROCKET.AWM_ID;
  const hasAWMInBag = state.other.some(i => i.id === GAME_CONSTANTS.ROCKET.AWM_ID);
  const opts = [];
  if (hasAWM || hasAWMInBag) {
    opts.push({ text: "上缴AWM", action: "king_trade_awm" });
  } else {
    opts.push({ text: "上缴AWM（你没有AWM）", action: "king_trade_awm", disabled: true });
  }
  opts.push({ text: "离开", action: "castle_back" });
  setOptions(opts);
  setPhase("castle_interior");
}

export function handleKingTradeAWM() {
  const state = getState();
  if (state.rangedWeapon && state.rangedWeapon.id === GAME_CONSTANTS.ROCKET.AWM_ID) {
    state.rangedWeapon = null;
  } else {
    const awmIdx = state.other.findIndex(i => i.id === GAME_CONSTANTS.ROCKET.AWM_ID);
    if (awmIdx !== -1) {
      state.other.splice(awmIdx, 1);
    } else {
      setStory("你没有AWM可以上缴。");
      refreshCastleInterior();
      return;
    }
  }
  state.undergroundKeyObtained = true;
  state.other.push({ ...SPECIAL_ITEMS.underground_key });
  setStory("国王接过AWM，爱不释手地摩挲着枪身：\"好枪！好枪啊！\" 他从王座下取出一把锈迹斑斑的钥匙扔给你：\"拿去吧，地下区域的钥匙。别把我的核电装置都拆走了！\"");
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) refreshCastleInterior();
}

export function handleCastleBall() {
  const state = getState();
  const hasId = hasCastleIdentity(state);
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
  setStory(`你在华美的舞厅中翩翩起舞，悠扬的华尔兹让你暂时忘却了末日的残酷。一曲终了，你感到身心都得到了放松。\n\n崩溃度 -${GAME_CONSTANTS.CASTLE.BALL_CRASH_REDUCTION}。`);
  advanceTime(GAME_CONSTANTS.CASTLE.BALL_TIME_COST);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) refreshCastleInterior();
}

export function handleCastleRoom() {
  const state = getState();
  const hasId = hasCastleIdentity(state);
  if (!hasId) {
    setStory("客房管家拦住了你：\"这里只对贵族开放。\" 你没有身份牌，被赶了出去。\n\n你被识破了没有贵族身份，被赶出去了！");
    state.currentSubMap = null;
    refreshCastleOutpost();
    return;
  }
  state.health = Math.min(GAME_CONSTANTS.MAX_HEALTH, state.health + GAME_CONSTANTS.CASTLE.ROOM_HEALTH_RESTORE);
  setStory(`你在柔软的贵族客房里美美地休息了一阵。醒来后精神焕发。\n\n生命值 +${GAME_CONSTANTS.CASTLE.ROOM_HEALTH_RESTORE}（当前 ${state.health}/${GAME_CONSTANTS.MAX_HEALTH}）。`);
  advanceTime(GAME_CONSTANTS.CASTLE.ROOM_TIME_COST);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) refreshCastleInterior();
}

export function handleCastleSalary() {
  const state = getState();
  const rank = getCastleRank(state);
  if (rank < 2) {
    setStory("您还不满足俸禄领取条件。");
    refreshCastleInterior();
    return;
  }
  if (state.lastSalaryDay === state.day) {
    setStory("您今天已经领取过俸禄了，明天再来吧。");
    refreshCastleInterior();
    return;
  }
  const rankName = getCastleRankName(state);
  const count = rank - 1;
  state.lastSalaryDay = state.day;
  const pools = [FOODS, FRUITS, DRINKS];
  const received = [];
  for (let i = 0; i < count; i++) {
    const pool = pools[Math.floor(Math.random() * pools.length)];
    const item = { ...pool[Math.floor(Math.random() * pool.length)] };
    addItem(item);
    received.push(getItemDisplayName(item));
  }
  setStory(`您当前的身份是${rankName}，获得了${received.join("、")}。`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) refreshCastleInterior();
}

const ROYAL_SHOP_ITEMS = [
  { name: "军粮罐头", price: 2, type: "food", itemId: "军粮罐头" },
  { name: "电解质水", price: 2, type: "drink", itemId: "电解质水" },
  { name: "抗感染血清", price: 3, type: "medicine", itemId: "抗感染血清" },
  { name: "医用急救包", price: 5, type: "medicine", itemId: "医用急救包" },
  { name: "战地医疗箱", price: 10, type: "medicine", itemId: "战地医疗箱" },
  { name: "皇家短枪", price: 100, type: "ranged", itemId: "皇家短枪" },
  { name: "皇家银剑", price: 100, type: "melee", itemId: "皇家银剑" },
];

export function handleRoyalTrade() {
  const state = getState();
  setStory(`皇后微微点头："皇家交易？当然。你手里的皇家币在这里可以换取不少好东西。"\n\n当前皇家币：${state.royalCoins}`);
  setPhase("castle_interior");
  setOptions([
    { text: "兑换皇家币", action: "queen_royal_exchange" },
    { text: "皇后杂货铺", action: "queen_royal_shop" },
    { text: "返回大厅", action: "castle_back" },
  ]);
}

export function handleRoyalExchange() {
  const state = getState();
  const gouqiCount = state.food.filter(i => i.id === "gouqi").reduce((sum, i) => sum + (i.count || 1), 0);
  const swordCount = state.other.filter(i => i.id === "西洋剑").length;
  setStory(`皇后："你可以用物资来兑换皇家币。"\n\n当前皇家币：${state.royalCoins}\n\n可兑换：\n  枸杞 ×${gouqiCount}（2枸杞 = 1皇家币）\n  西洋剑 ×${swordCount}（1西洋剑 = 5皇家币）`);
  setPhase("castle_interior");
  setOptions([
    { text: `上交枸杞（2→1币）×${gouqiCount}`, action: "queen_exchange_gouqi" },
    { text: `上交西洋剑（1→5币）×${swordCount}`, action: "queen_exchange_sword" },
    { text: "返回", action: "queen_royal_trade" },
  ]);
}

export function handleExchangeGouqi() {
  const state = getState();
  const gouqiCount = state.food.filter(i => i.id === "gouqi").reduce((sum, i) => sum + (i.count || 1), 0);
  if (gouqiCount < 2) {
    setStory("你的枸杞不够，至少需要2个才能兑换1皇家币。");
    refreshCastleInterior();
    return;
  }
  removeItemById("food", "gouqi", 2);
  addItem({ id: "皇家币", name: "皇家币", type: "royal_coin", count: 1 });
  setStory(`你上交了2个枸杞，获得了1皇家币。\n\n当前皇家币：${state.royalCoins}`);
  refreshCastleInterior();
}

export function handleExchangeSword() {
  const state = getState();
  const swordIdx = state.other.findIndex(i => i.id === "西洋剑");
  if (swordIdx === -1) {
    setStory("你没有西洋剑可以上交。");
    refreshCastleInterior();
    return;
  }
  state.other.splice(swordIdx, 1);
  addItem({ id: "皇家币", name: "皇家币", type: "royal_coin", count: 5 });
  setStory(`你上交了1把西洋剑，获得了5皇家币。\n\n当前皇家币：${state.royalCoins}`);
  refreshCastleInterior();
}

export function handleRoyalShop() {
  const state = getState();
  let shopList = "皇后杂货铺\n\n";
  ROYAL_SHOP_ITEMS.forEach((item, idx) => {
    shopList += `  ${idx + 1}. ${item.name} — ${item.price}皇家币\n`;
  });
  shopList += `\n当前皇家币：${state.royalCoins}`;
  setStory(shopList);
  setPhase("castle_interior");
  const opts = ROYAL_SHOP_ITEMS.map(item => ({
    text: `${item.name}（${item.price}币）`,
    action: `queen_buy_${item.itemId}`,
  }));
  opts.push({ text: "返回", action: "queen_royal_trade" });
  setOptions(opts);
}

export function handleRoyalShopBuy(itemId) {
  const state = getState();
  const shopItem = ROYAL_SHOP_ITEMS.find(i => i.itemId === itemId);
  if (!shopItem) {
    refreshCastleInterior();
    return;
  }
  if (state.royalCoins < shopItem.price) {
    setStory(`你的皇家币不足。需要${shopItem.price}皇家币，当前只有${state.royalCoins}。`);
    refreshCastleInterior();
    return;
  }
  removeRoyalCoins(shopItem.price);
  let itemToAdd;
  if (shopItem.type === "food") {
    const foodDef = FOODS.find(f => f.id === itemId);
    itemToAdd = foodDef ? { ...foodDef } : { id: itemId, name: shopItem.name, type: "food" };
  } else if (shopItem.type === "drink") {
    const drinkDef = DRINKS.find(d => d.id === itemId);
    itemToAdd = drinkDef ? { ...drinkDef } : { id: itemId, name: shopItem.name, type: "drink" };
  } else if (shopItem.type === "medicine") {
    const medDef = MEDICINES.find(m => m.id === itemId);
    itemToAdd = medDef ? { ...medDef } : { id: itemId, name: shopItem.name, type: "medicine" };
  } else if (shopItem.type === "ranged") {
    const rangedDef = RANGED_WEAPONS.find(w => w.id === itemId);
    itemToAdd = rangedDef ? { ...rangedDef } : { id: itemId, name: shopItem.name, type: "ranged" };
  } else if (shopItem.type === "melee") {
    const meleeDef = MELEE_WEAPONS.find(w => w.id === itemId);
    itemToAdd = meleeDef ? { ...meleeDef, currentDurability: meleeDef.durability } : { id: itemId, name: shopItem.name, type: "melee" };
  }
  if (itemToAdd) {
    const added = addItem(itemToAdd);
    if (!added) {
      addItem({ id: "皇家币", name: "皇家币", type: "royal_coin", count: shopItem.price });
      setStory("你的背包已满，无法购买此物品。皇家币已退回。");
      refreshCastleInterior();
      return;
    }
  }
  setStory(`你花费了${shopItem.price}皇家币，购买了【${shopItem.name}】。\n\n当前皇家币：${state.royalCoins}`);
  refreshCastleInterior();
}
