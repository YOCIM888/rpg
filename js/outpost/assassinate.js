import {
  getState,
  setPhase,
  setStory,
  setOptions,
  advanceTime,
  updateStatusEffects,
  checkDeath,
} from '../state.js';

import {
  NAMED_NPCS,
} from '../config.js';

import { showLeaderOptions } from './leader.js';

export function handleLeaderAssassinate() {
  const state = getState();
  if (!state.kingQuestsDone || !state.kingQuestsDone.king_4) {
    setStory("你看着首领的背影，心中犹豫了许久，最终还是放下了这个念头。\n\n你没有理由这样做。");
    showLeaderOptions();
    return;
  }
  setStory("你握紧了武器，心中回想起国王的命令：\"除掉曙光阵地首领。\"\n\n眼前的首领正在背对着你整理物资，毫无防备。你深吸一口气——这是一个千载难逢的机会。\n\n但你也知道，这位首领能够带领阵地在这末世生存至今，绝非等闲之辈。他的实力堪比丧尸之王。\n\n你决定……");
  setPhase("leader_assassinate");
  setOptions([
    { text: "近战偷袭", action: "assassinate_melee" },
    { text: "远程狙击", action: "assassinate_ranged" },
    { text: "放弃计划", action: "assassinate_flee" },
  ]);
}

function startAssassinationCombat(mode) {
  const state = getState();

  const leaderDef = NAMED_NPCS.leader;
  state._pendingNpc = {
    name: leaderDef.name,
    hp: leaderDef.hp,
    maxHp: leaderDef.hp,
    damage: leaderDef.damage,
    hasRanged: leaderDef.hasRanged,
    dodgeRate: leaderDef.dodgeRate,
    isAssassination: true,
  };

  setPhase("pre_combat_npc");
  if (mode === "melee") {
    setStory("你拔出近战武器，悄无声息地向首领靠近。然而就在你举起武器的那一刻，首领猛地转过身来！\n\n\"我早就感觉到你的杀气。\" 首领冷冷地看着你，随手抄起一根铁棍。\"来吧，让我看看你有什么本事！\"");
    setOptions([
      { text: "近战作战", action: "combat_npc_melee" },
      { text: "远程射击", action: "combat_npc_ranged" },
      { text: "逃跑（100%）", action: "assassinate_flee_combat" },
    ]);
  } else {
    setStory("你拉开距离，举起远程武器瞄准了首领的后背。但在扣动扳机的瞬间，首领仿佛有所感应一般猛地侧身！\n\n\"暗箭伤人？\" 首领怒吼一声，向你冲了过来！");
    setOptions([
      { text: "近战作战", action: "combat_npc_melee" },
      { text: "远程射击", action: "combat_npc_ranged" },
      { text: "逃跑（100%）", action: "assassinate_flee_combat" },
    ]);
  }
}

function handleAssassinateFlee() {
  const state = getState();
  setStory("你深吸一口气，把武器收了起来。暗杀阵地首领……这个念头太过疯狂。\n\n你放弃了暗杀计划，首领有些疑惑地看向你离开的方向。");
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) showLeaderOptions();
}

export function handleAssassinateFleeCombat() {
  const state = getState();
  setStory("你意识到自己不是首领的对手，趁他不备转身就跑。你侥幸逃脱了。\n\n你放弃了暗杀计划，首领有些疑惑地看向你离开的方向。");
  state._pendingNpc = null;
  state._combatNpcDefeated = false;
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) showLeaderOptions();
}

export function checkLeaderAssassinationVictory() {
  const state = getState();
  if (state._combatNpcDefeated && state._pendingNpc && state._pendingNpc.isAssassination) {
    state.leaderAlive = false;
    state._combatNpcDefeated = false;
    setStory("你气喘吁吁地站在倒下的首领身旁。鲜血从你的武器上滴落。\n\n首领用最后一口气看着你：\"你……为什么要这么做……\"\n\n他的眼睛失去了光彩。曙光阵地首领——这个曾经带领无数人对抗末日的领袖，死在了你的手中。\n\n国王交给你的任务完成了，但你的双手沾满了鲜血。");
    state._pendingNpc = null;
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    if (!state.gameOver) showLeaderOptions();
    return true;
  }
  return false;
}

export function handleOutpostAssassinateAction(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;
  const action = state.options[optIdx].action;
  if (action === "assassinate_melee") { startAssassinationCombat("melee"); return; }
  if (action === "assassinate_ranged") { startAssassinationCombat("ranged"); return; }
  if (action === "assassinate_flee") { handleAssassinateFlee(); return; }
}
