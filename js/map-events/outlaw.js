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
  OUTLAW_DIALOGUES,
  MAP_NPC_INTROS,
  NAMED_NPCS,
  GAME_CONSTANTS,
  CROP_FOOD_MAP,
} from '../config.js';

import {
  showExploreOptionsState,
} from '../routing.js';

import { triggerEnding } from '../game/endings.js';

export function handleRestaurantEat() {
  setPhase("restaurant");
  setStory(MAP_NPC_INTROS.restaurant_intro);
  setOptions([
    { text: "食用桌上的杂肉", action: "restaurant_consume" },
    { text: "离开", action: "restaurant_leave" },
  ]);
}

export function handleRestaurantConsume() {
  const state = getState();
  state.hunger = Math.min(100, state.hunger + 5);
  state.hydration = Math.min(100, state.hydration + 5);
  state.crash = Math.min(100, state.crash + 5);
  state.infection = Math.min(100, state.infection + 10);
  state.hasEatenStrangeMeat = true;
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (state.gameOver) return;
  setStory(MAP_NPC_INTROS.restaurant_eat);
  setOptions([
    { text: "食用桌上的杂肉", action: "restaurant_consume" },
    { text: "离开", action: "restaurant_leave" },
  ]);
}

export function handleRestaurantLeave() {
  setStory("你离开了服务区餐厅，那股诡异的肉味还萦绕在鼻尖。");
  showExploreOptionsState();
}

export function handleOutlawInteract() {
  const state = getState();
  if (state.outlawKilled) {
    setStory(MAP_NPC_INTROS.outlaw_killed);
    showExploreOptionsState();
    return;
  }
  setPhase("explore");
  setStory(MAP_NPC_INTROS.outlaw_intro);
  showOutlawMenu();
}

function showOutlawMenu() {
  const opts = [
    { text: "对话", action: "outlaw_chat" },
    { text: "关于餐厅的食物", action: "outlaw_food_chat" },
    { text: "挑战", action: "outlaw_fight" },
    { text: "离开", action: "outlaw_leave" },
  ];
  setOptions(opts);
}

export function handleOutlawChat() {
  const line = OUTLAW_DIALOGUES[Math.floor(Math.random() * OUTLAW_DIALOGUES.length)];
  setStory(line);
  showOutlawMenu();
}

export function handleOutlawFoodChat() {
  const state = getState();
  if (!state.hasEatenStrangeMeat) {
    setStory(MAP_NPC_INTROS.outlaw_food_denied);
    showOutlawMenu();
    return;
  }
  if (!state.maSanQuest1Done) {
    setStory(MAP_NPC_INTROS.outlaw_food_quest1);
    setPhase("outlaw_quest");
    setOptions([
      { text: "接受（需要3瓶动力啤酒）", action: "outlaw_food_accept" },
      { text: "拒绝", action: "outlaw_food_refuse" },
    ]);
    return;
  }
  if (!state.maSanQuest2Done) {
    setStory(MAP_NPC_INTROS.outlaw_food_quest2);
    setPhase("outlaw_quest");
    setOptions([
      { text: "接受（需要提交3份作物）", action: "outlaw_food_accept" },
      { text: "拒绝", action: "outlaw_food_refuse" },
    ]);
    return;
  }
  if (!state.maSanQuest3Done) {
    setStory(MAP_NPC_INTROS.outlaw_food_quest3);
    setPhase("outlaw_quest");
    setOptions([
      { text: "接受（需要10根香烟）", action: "outlaw_food_accept" },
      { text: "拒绝", action: "outlaw_food_refuse" },
    ]);
    return;
  }
  if (!state.maSanQuest4Done) {
    setStory(MAP_NPC_INTROS.outlaw_food_quest4);
    setPhase("outlaw_quest");
    setOptions([
      { text: "接受马三的邀请（⚠ 这将改变你的命运）", action: "outlaw_food_accept" },
      { text: "拒绝", action: "outlaw_food_refuse" },
    ]);
    return;
  }
  setStory("马三已经没什么好说的了。");
  showOutlawMenu();
}

export function handleOutlawFoodAccept() {
  const state = getState();
  if (!state.maSanQuest1Done) {
    const beerCount = state.drinks.filter(d => d.id === "动力啤酒").reduce((sum, d) => sum + (d.count || 1), 0);
    if (beerCount < 3) {
      setStory(`你需要3瓶动力啤酒，但只有${beerCount}瓶。`);
      showOutlawMenu();
      return;
    }
    let remaining = 3;
    for (let i = state.drinks.length - 1; i >= 0 && remaining > 0; i--) {
      if (state.drinks[i].id === "动力啤酒") {
        const available = state.drinks[i].count || 1;
        if (available <= remaining) {
          state.drinks.splice(i, 1);
          remaining -= available;
        } else {
          state.drinks[i].count = available - remaining;
          remaining = 0;
        }
      }
    }
    state.maSanQuest1Done = true;
    setStory(MAP_NPC_INTROS.outlaw_food_quest1_accept);
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    if (!state.gameOver) showOutlawMenu();
    return;
  }
  if (!state.maSanQuest2Done) {
    const cropIds = Object.keys(CROP_FOOD_MAP);
    const cropCount = state.food.filter(f => cropIds.includes(f.id)).reduce((sum, f) => sum + (f.count || 1), 0);
    if (cropCount < 3) {
      setStory(`你需要提交3份作物，但你只有${cropCount}份。`);
      showOutlawMenu();
      return;
    }
    let remaining = 3;
    for (let i = state.food.length - 1; i >= 0 && remaining > 0; i--) {
      if (!cropIds.includes(state.food[i].id)) continue;
      const available = state.food[i].count || 1;
      if (available <= remaining) {
        state.food.splice(i, 1);
        remaining -= available;
      } else {
        state.food[i].count = available - remaining;
        remaining = 0;
      }
    }
    state.maSanQuest2Done = true;
    setStory(MAP_NPC_INTROS.outlaw_food_quest2_accept);
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    if (!state.gameOver) showOutlawMenu();
    return;
  }
  if (!state.maSanQuest3Done) {
    if (state.cigarettes < 10) {
      setStory(`你需要10根香烟，但你只有${state.cigarettes}根。`);
      showOutlawMenu();
      return;
    }
    state.cigarettes -= 10;
    state.maSanQuest3Done = true;
    setStory(MAP_NPC_INTROS.outlaw_food_quest3_accept);
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    if (!state.gameOver) showOutlawMenu();
    return;
  }
  if (!state.maSanQuest4Done) {
    state.maSanQuest4Done = true;
    triggerEnding("ending_food");
    return;
  }
}

export function handleOutlawFoodRefuse() {
  const state = getState();
  if (!state.maSanQuest1Done) {
    setStory(MAP_NPC_INTROS.outlaw_food_quest1_reject);
    showOutlawMenu();
    return;
  }
  if (!state.maSanQuest2Done) {
    setStory(MAP_NPC_INTROS.outlaw_food_quest2_reject);
    showOutlawMenu();
    return;
  }
  if (!state.maSanQuest3Done) {
    setStory(MAP_NPC_INTROS.outlaw_food_quest3_reject);
    showOutlawMenu();
    return;
  }
  if (!state.maSanQuest4Done) {
    state._maSanQuest4Combat = true;
    state._pendingNpc = {
      name: NAMED_NPCS.ma_san.name,
      hp: NAMED_NPCS.ma_san.hp,
      damage: Math.floor(Math.random() * (NAMED_NPCS.ma_san.damageMax - NAMED_NPCS.ma_san.damageMin + 1)) + NAMED_NPCS.ma_san.damageMin,
      hasRanged: NAMED_NPCS.ma_san.hasRanged,
      dodgeRate: NAMED_NPCS.ma_san.dodgeRate,
    };
    setPhase("pre_combat_npc");
    setStory(MAP_NPC_INTROS.outlaw_food_quest4_reject);
    setOptions([
      { text: "近战作战", action: "combat_npc_melee" },
      { text: "远程射击", action: "combat_npc_ranged" },
      { text: GAME_CONSTANTS.COMBAT.FLEE_RATE_TEXT, action: "combat_npc_flee" },
    ]);
    return;
  }
}

export function handleOutlawFight() {
  const state = getState();
  const maSan = NAMED_NPCS.ma_san;
  state._pendingNpc = {
    name: maSan.name,
    hp: maSan.hp,
    damage: Math.floor(Math.random() * (maSan.damageMax - maSan.damageMin + 1)) + maSan.damageMin,
    hasRanged: maSan.hasRanged,
    dodgeRate: maSan.dodgeRate,
  };
  setPhase("pre_combat_npc");
  setStory(MAP_NPC_INTROS.outlaw_fight);
  setOptions([
    { text: "近战作战", action: "combat_npc_melee" },
    { text: "远程射击", action: "combat_npc_ranged" },
    { text: GAME_CONSTANTS.COMBAT.FLEE_RATE_TEXT, action: "combat_npc_flee" },
  ]);
}

export function handleOutlawLeave() {
  setStory(MAP_NPC_INTROS.outlaw_leave);
  showExploreOptionsState();
}

export function handleSearchFoodLocker() {
  const state = getState();
  if (state.lastFoodLockerDay > 0 && state.day - state.lastFoodLockerDay < GAME_CONSTANTS.MAP_EVENTS.CORPSE_COOLDOWN_DAYS) {
    const remaining = GAME_CONSTANTS.MAP_EVENTS.CORPSE_COOLDOWN_DAYS - (state.day - state.lastFoodLockerDay);
    setStory(`食物储物柜已经翻过了，再过 ${remaining} 天再来吧。`);
    showExploreOptionsState();
    return;
  }
  state.lastFoodLockerDay = state.day;
  const isGood = Math.random() < GAME_CONSTANTS.MAP_EVENTS.FOOD_LOCKER_GOOD_RATE;
  if (isGood) {
    state.hunger = Math.min(100, state.hunger + GAME_CONSTANTS.MAP_EVENTS.FOOD_LOCKER_HUNGER_RESTORE);
    state.hydration = Math.min(100, state.hydration + GAME_CONSTANTS.MAP_EVENTS.FOOD_LOCKER_HYDRATION_RESTORE);
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    if (!state.gameOver) {
      setStory("你翻找了服务区的食物储物柜，找到了一些看起来还算新鲜的食物和水。饱腹度和水分恢复了。");
      showExploreOptionsState();
    }
  } else {
    state.crash = Math.min(100, state.crash + GAME_CONSTANTS.MAP_EVENTS.FOOD_LOCKER_BAD_FOOD_CRASH);
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    if (!state.gameOver) {
      setStory("你翻找了食物储物柜，但里面的食物都已经发霉变质了。看着那些腐烂的食物，你感到一阵恶心，崩溃度增加了。");
      showExploreOptionsState();
    }
  }
}
