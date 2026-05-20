import {
  getState,
  setPhase,
  setStory,
  setOptions,
  addItem,
  advanceTime,
  updateStatusEffects,
  checkDeath,
  addNpcAffinity,
  getNpcAffinity,
  getAffinityLabel,
  canChatToday,
  incrementChatCount,
  getAffinityStage,
  isQuestDone,
  markQuestDone,
  removeCigarettes,
  removeGasoline,
  removeItemById,
  getItemDisplayName,
} from '../state.js';

import {
  SEEDS,
  CROPS,
  RANGED_WEAPONS,
  SURVIVOR_NPC,
  GAME_CONSTANTS,
  AFFINITY_MAX,
  SPECIAL_ITEMS,
} from '../config.js';

import { returnToMenu } from '../routing.js';

import { checkGoHomeEnding } from '../game/endings.js';

export function showMumiaoOptions() {
  const state = getState();
  const affinity = getNpcAffinity("mumiao");
  const friendshipLabel = getAffinityLabel(affinity);
  const config = SURVIVOR_NPC.find(n => n.id === "mumiao");
  const stage = getAffinityStage(affinity);
  const lines = config.dialogues[stage] || config.dialogues["stranger"];
  const greeting = lines[Math.floor(Math.random() * lines.length)];

  let desc = config.desc;
  desc += `\n\n当前好感：${affinity}/${AFFINITY_MAX.mumiao}（${friendshipLabel}）`;
  desc += `\n\n${greeting}`;

  setPhase("npc_mumiao");
  setStory(desc);

  const opts = [
    { text: "购买种子（1根香烟→3颗随机种子）", action: "mumiao_buy_seeds" },
    { text: "照看实验田", action: "mumiao_tend_field" },
  ];

  if (affinity >= 150 && !isQuestDone("mumiaoSecret")) {
    opts.push({ text: "她有个秘密", action: "mumiao_secret" });
  } else if (affinity < 150) {
    opts.push({ text: "她有个秘密（好感不足）", action: "mumiao_secret_locked" });
  }

  const hasDiary = state.other.some(i => i.id === "miaomiao_diary");
  if (hasDiary) {
    opts.push({ text: "埋没的过去", action: "mumiao_buried_past" });
  }

  opts.push({ text: "赠送物品", action: "mumiao_gift" });
  opts.push({ text: "离开", action: "mumiao_leave" });

  setOptions(opts);
}

export function handleMumiaoBuySeeds() {
  const state = getState();
  if (state.cigarettes < 1) {
    setStory("沐苗苗摇了摇头：\"没有香烟可不行，种子培育很费资源的。\"");
    showMumiaoOptions();
    return;
  }
  removeCigarettes(1);
  const seedCount = GAME_CONSTANTS.NPC.MUMIAO_SEED_COUNT;
  const addedSeeds = [];
  let anyFailed = false;
  for (let i = 0; i < seedCount; i++) {
    const seed = SEEDS[Math.floor(Math.random() * SEEDS.length)];
    const added = addItem({ ...seed });
    if (added) {
      addedSeeds.push(seed.name);
    } else {
      anyFailed = true;
    }
  }
  if (addedSeeds.length > 0) {
    let msg = `沐苗苗接过香烟，从苗圃里挑出几颗种子递给你：\"拿好了，每颗种子都来之不易。\"\n\n获得：${addedSeeds.join("、")}`;
    if (anyFailed) {
      msg += "\n\n⚠️ 部分种子因背包已满未能放入。";
    }
    setStory(msg);
  } else {
    state.cigarettes += 1;
    setStory("背包已满，无法放入种子。沐苗苗把香烟还给了你。");
  }
  showMumiaoOptions();
}

export function handleMumiaoTendField() {
  const state = getState();
  if (state.lastMumiaoTendDay >= state.day) {
    setStory("沐苗苗摆了摆手：\"今天已经照看过了，明天再来吧。苗也需要休息的。\"");
    showMumiaoOptions();
    return;
  }
  state.lastMumiaoTendDay = state.day;
  const affinityGain = GAME_CONSTANTS.NPC.MUMIAO_TEND_AFFINITY_MIN + Math.floor(Math.random() * (GAME_CONSTANTS.NPC.MUMIAO_TEND_AFFINITY_MAX - GAME_CONSTANTS.NPC.MUMIAO_TEND_AFFINITY_MIN + 1));
  addNpcAffinity("mumiao", affinityGain);
  const seed = SEEDS[Math.floor(Math.random() * SEEDS.length)];
  const added = addItem({ ...seed });
  advanceTime(2);
  updateStatusEffects();
  checkDeath();
  let msg = "你跟着沐苗苗走进实验田，帮她除草、浇水、松土。她一边干活一边给你讲解种植技巧。\n\n";
  msg += `沐苗苗好感度 +${affinityGain}（当前 ${getNpcAffinity("mumiao")}/${AFFINITY_MAX.mumiao}）\n\n`;
  msg += `时间推进了2个回合。`;
  if (added) {
    msg += `\n\n临走时，沐苗苗递给你一颗${seed.name}：\"这个给你，算是辛苦费。\"`;
  } else {
    msg += `\n\n沐苗苗想给你一颗种子，但你的背包已经满了。`;
  }
  setStory(msg);
  if (!state.gameOver) {
    showMumiaoOptions();
  }
}

export function handleMumiaoSecret() {
  const state = getState();
  const affinity = getNpcAffinity("mumiao");
  if (affinity < 150) {
    setStory("沐苗苗移开了目光：\"你们的关系还没那么好……\" 她低下头继续摆弄着手中的花苗。");
    showMumiaoOptions();
    return;
  }
  if (isQuestDone("mumiaoSecret")) {
    setStory("沐苗苗微笑着摇了摇头：\"秘密已经告诉你了……那片花田，会一直在那里。\"");
    showMumiaoOptions();
    return;
  }
  markQuestDone("mumiaoSecret");
  const badge = SPECIAL_ITEMS.farming_master_badge;
  addItem({ ...badge });
  setStory(`沐苗苗沉默了很久，终于抬起头看着你的眼睛。\n\n"我有一片花田……在阵地后面的山谷里。"\n\n她的声音很轻，像怕惊扰了什么：\n"末世之前，那里是我导师的实验站。导师走后，我一个人守着那些花。没有人知道那个地方……"\n\n她带你穿过一片荒芜的废墟，翻过一道矮墙。眼前豁然开朗——\n\n一片隐秘的山谷中，各色花朵在暮光中轻轻摇曳。向日葵、薰衣草、雏菊……它们在废墟的缝隙中倔强地生长着，像是这个世界最后的温柔。\n\n"很美吧？" 她站在花丛中，夕阳把她的侧脸染成金色。\n\n你不知道该说什么。你尊敬她，由衷地。但你的心里有一丝矛盾——这份温柔太沉重了，你不确定自己配得上。\n\n沐苗苗似乎看出了你的犹豫，她轻轻笑了笑：\n"没关系。我只是想让你知道……这个世界上还有值得守护的东西。"\n\n她从花丛中摘下一枚徽章递给你：\n"这是导师留给我的。现在，它属于你了。"\n\n🌾 获得【农业大师徽章】`);
  showMumiaoOptions();
}

export function handleMumiaoSecretLocked() {
  setStory("沐苗苗移开了目光：\"你们的关系还没那么好……\" 她低下头继续摆弄着手中的花苗。");
  showMumiaoOptions();
}

export function handleMumiaoAction(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;
  const action = state.options[optIdx].action;

  switch (action) {
    case "mumiao_buy_seeds":
      handleMumiaoBuySeeds();
      break;
    case "mumiao_tend_field":
      handleMumiaoTendField();
      break;
    case "mumiao_secret":
      handleMumiaoSecret();
      break;
    case "mumiao_secret_locked":
      handleMumiaoSecretLocked();
      break;
    case "mumiao_gift":
      state._currentNpc = "mumiao";
      setPhase("npc_gift");
      setStory("请选择要赠送的物品（不同物品好感提升不同）：");
      let items = [];
      state.food.forEach((item, i) => items.push({ ...item, cat: "food", idx: i, label: `[食物] ${getItemDisplayName(item)}` }));
      state.drinks.forEach((item, i) => items.push({ ...item, cat: "drinks", idx: i, label: `[饮品] ${getItemDisplayName(item)}` }));
      state.medicine.forEach((item, i) => items.push({ ...item, cat: "medicine", idx: i, label: `[医疗] ${getItemDisplayName(item)}` }));
      state.other.forEach((item, i) => items.push({ ...item, cat: "other", idx: i, label: `[其他] ${getItemDisplayName(item)}` }));
      if (state.seeds) state.seeds.forEach((item, i) => items.push({ ...item, cat: "seed", idx: i, label: `[种子] ${getItemDisplayName(item)}` }));
      if (state.cigarettes > 0) items.push({ cat: "cigarettes", idx: 0, name: "香烟", label: `[货物] (${state.cigarettes})香烟` });
      if (state.gasoline > 0) items.push({ cat: "gasoline", idx: 0, name: "汽油", label: `[货物] (${state.gasoline})汽油` });
      if (items.length === 0) {
        setStory("你翻遍了背包，发现没什么能送人的东西……");
        showMumiaoOptions();
        return;
      }
      const opts = items.map((item, i) => ({ text: item.label, action: "gift_confirm", index: i, giftItem: item }));
      opts.push({ text: "返回", action: "gift_back", index: -1 });
      setOptions(opts);
      break;
    case "mumiao_leave":
      state._currentNpc = null;
      returnToMenu();
      break;
    case "mumiao_buried_past":
      handleMumiaoBuriedPast();
      break;
    case "mumiao_quest1":
      handleMumiaoQuest1();
      break;
    case "mumiao_quest2":
      handleMumiaoQuest2();
      break;
    case "mumiao_quest3":
      handleMumiaoQuest3();
      break;
    case "mumiao_back":
      showMumiaoOptions();
      break;
    default:
      showMumiaoOptions();
      break;
  }
}

export function handleMumiaoBuriedPast() {
  const state = getState();
  const opts = [];
  if (!isQuestDone("mumiaoQuest1")) {
    opts.push({ text: "一起去野炊吧", action: "mumiao_quest1" });
  } else if (!isQuestDone("mumiaoQuest2")) {
    opts.push({ text: "一起去野炊吧（已完成）", action: "mumiao_buried_past", disabled: true });
    opts.push({ text: "跨时空的思念", action: "mumiao_quest2" });
  } else if (!isQuestDone("mumiaoQuest3")) {
    opts.push({ text: "一起去野炊吧（已完成）", action: "mumiao_buried_past", disabled: true });
    opts.push({ text: "跨时空的思念（已完成）", action: "mumiao_buried_past", disabled: true });
    opts.push({ text: "扩大试验田", action: "mumiao_quest3" });
  } else {
    setStory("沐苗苗微笑着看着你：\"谢谢你……那些过去，终于不再只是我一个人扛了。\"");
    showMumiaoOptions();
    return;
  }
  setPhase("npc_mumiao");
  setStory("沐苗苗看到你手中的日记本，眼眶瞬间红了。她颤抖着伸出手，又缩了回去。\n\n\"这是……我的日记。我以为它已经永远埋在那里了。\"\n\n她深吸一口气，努力让自己平静下来：\n\"有些事情……我一直想去做，但一个人做不到。你愿意帮我吗？\"");
  opts.push({ text: "返回", action: "mumiao_back" });
  setOptions(opts);
}

export function handleMumiaoQuest1() {
  const state = getState();
  const carrotCount = state.food.filter(i => i.id === "luobo").reduce((sum, i) => sum + (i.count || 1), 0);
  const potatoCount = state.food.filter(i => i.id === "tudou").reduce((sum, i) => sum + (i.count || 1), 0);
  const needCarrot = 3;
  const needPotato = 3;
  if (carrotCount < needCarrot || potatoCount < needPotato) {
    let msg = "沐苗苗有些期待地看着你：\"我们需要一些食材来野炊……\"\n\n所需物品：";
    if (carrotCount < needCarrot) msg += `\n  胡萝卜 ${carrotCount}/${needCarrot}`;
    else msg += `\n  胡萝卜 ${carrotCount}/${needCarrot} ✓`;
    if (potatoCount < needPotato) msg += `\n  土豆 ${potatoCount}/${needPotato}`;
    else msg += `\n  土豆 ${potatoCount}/${needPotato} ✓`;
    setStory(msg);
    showMumiaoOptions();
    return;
  }
  removeItemById("food", "luobo", needCarrot);
  removeItemById("food", "tudou", needPotato);
  markQuestDone("mumiaoQuest1");
  addNpcAffinity("mumiao", 20);
  advanceTime(3);
  updateStatusEffects();
  checkDeath();
  setStory(`你带着胡萝卜和土豆，跟着沐苗苗来到瞭望塔旁的一片空地。她从背包里掏出一块旧布铺在地上，又找来几块石头搭了个简易灶台。\n\n"好久没有这样了……"她一边削土豆皮一边说，"小时候，爸爸妈妈会带我去野炊。爸爸总是把土豆烤焦，妈妈就笑他。"\n\n火苗舔着锅底，胡萝卜和土豆在汤里翻滚。简单的食材，却飘出了久违的香气。\n\n沐苗苗盛了一碗递给你，自己也端起一碗。她喝了一口，忽然笑了：\n"你尝尝，这是我妈妈的味道。"\n\n夕阳西下，两个人坐在废墟旁，喝着热汤。风把她的头发吹乱了，她也不在意。\n\n"谢谢你。"她轻声说，"这是末世以来，我吃过最好喝的汤。"\n\n沐苗苗好感度 +20（当前 ${getNpcAffinity("mumiao")}/${AFFINITY_MAX.mumiao}）\n\n时间推进了3个回合。`);
  if (!state.gameOver) {
    showMumiaoOptions();
  }
}

export function handleMumiaoQuest2() {
  const state = getState();
  const baijiuCount = state.drinks.filter(i => i.id === "高度白酒").reduce((sum, i) => sum + (i.count || 1), 0);
  const ryeCount = state.food.filter(i => i.id === "heimai").reduce((sum, i) => sum + (i.count || 1), 0);
  const needBaijiu = 5;
  const needRye = 10;
  if (baijiuCount < needBaijiu || ryeCount < needRye) {
    let msg = "沐苗苗低着头说：\"我想去……给他们扫墓。需要一些东西。\"\n\n所需物品：";
    if (baijiuCount < needBaijiu) msg += `\n  高度白酒 ${baijiuCount}/${needBaijiu}`;
    else msg += `\n  高度白酒 ${baijiuCount}/${needBaijiu} ✓`;
    if (ryeCount < needRye) msg += `\n  黑麦 ${ryeCount}/${needRye}`;
    else msg += `\n  黑麦 ${ryeCount}/${needRye} ✓`;
    setStory(msg);
    showMumiaoOptions();
    return;
  }
  removeItemById("drinks", "高度白酒", needBaijiu);
  removeItemById("food", "heimai", needRye);
  markQuestDone("mumiaoQuest2");
  addNpcAffinity("mumiao", 30);
  advanceTime(3);
  updateStatusEffects();
  checkDeath();
  setStory(`你跟着沐苗苗，回到了那块花圈墓碑前。\n\n她把白酒洒在墓碑前，又把黑麦一粒粒地撒在泥土上。那些黑麦在风中轻轻摇晃，像是无数双手在向天空伸展。\n\n"爸，妈……"她的声音很轻，却异常坚定，"我种出来了。"\n\n她蹲下身，用手指在泥土上画着什么：\n"看啊爸爸妈妈，我已经种出来了。胡萝卜、土豆、黑麦……你们再也不用挨饿了。"\n\n她把日记本摊开放在墓碑前，翻到最后一页——那幅手绘的一家人。风吹过来，纸页哗哗作响，像是在回应她。\n\n沐苗苗站起身，擦了擦眼泪，忽然笑了：\n"他们一定看到了。"\n\n你站在她身旁，看着那些黑麦在风中摇曳。阳光穿过云层，洒在那幅画上，画中的三个人似乎在微笑。\n\n沐苗苗好感度 +30（当前 ${getNpcAffinity("mumiao")}/${AFFINITY_MAX.mumiao}）\n\n时间推进了3个回合。`);
  if (!state.gameOver) {
    showMumiaoOptions();
  }
}

export function handleMumiaoQuest3() {
  const state = getState();
  const cropIds = CROPS.map(c => c.id);
  const ownedCropIds = [];
  const missingCrops = [];
  for (const cropId of cropIds) {
    const hasIt = state.food.some(i => i.id === cropId && (i.count || 1) > 0);
    if (hasIt) {
      ownedCropIds.push(cropId);
    } else {
      missingCrops.push(CROPS.find(c => c.id === cropId).name);
    }
  }
  if (ownedCropIds.length < 15) {
    setStory(`沐苗苗看着你说："我想把试验田扩大，种上所有能种的作物。你能帮我凑齐15种不同的作物吗？"\n\n当前拥有 ${ownedCropIds.length}/15 种作物。\n\n还缺少：${missingCrops.join("、")}`);
    showMumiaoOptions();
    return;
  }
  for (const cropId of cropIds) {
    removeItemById("food", cropId, 1);
  }
  markQuestDone("mumiaoQuest3");
  addNpcAffinity("mumiao", 50);
  const bow = RANGED_WEAPONS.find(w => w.id === "原野之弓");
  if (bow) {
    addItem({ ...bow });
  }
  addItem({ id: "箭矢", name: "箭矢", type: "ammo", count: 30 });
  advanceTime(3);
  updateStatusEffects();
  checkDeath();
  setStory(`你把15种作物一一摆在沐苗苗面前。她的眼睛亮了起来，像看到了世界上最珍贵的宝藏。\n\n"这些……全都是你种出来的？"她小心翼翼地捧起每一颗作物，像是在抚摸新生的婴儿。\n\n她深吸一口气，站直了身子：\n"我要把试验田扩大三倍。每一颗种子，每一株苗，我都会好好照顾。再也不会有人因为饥饿而失去家人了。"\n\n她从工具棚里取出一把古朴的长弓，弓身上刻着麦穗的纹路，弓弦是用特殊的植物纤维编成的。\n\n"这把弓是导师留给我的。她说，这是用试验田里最坚韧的植物做的。"沐苗苗把弓递给你，"现在，它属于你了。守护这片田地，也守护你自己。"\n\n远处，试验田里的作物在风中沙沙作响，像是在为新的开始鼓掌。\n\n沐苗苗好感度 +50（当前 ${getNpcAffinity("mumiao")}/${AFFINITY_MAX.mumiao}）\n\n🏹 获得【原野之弓】！\n🏹 获得【箭矢】×30！\n\n时间推进了3个回合。`);
  if (!state.gameOver) {
    if (checkGoHomeEnding()) return;
    showMumiaoOptions();
  }
}
