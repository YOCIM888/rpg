import {
  getState,
  setPhase,
  setStory,
  setOptions,
  addItem,
  advanceTime,
  updateStatusEffects,
  checkDeath,
  removeItem,
  addGasoline,
} from '../state.js';

import {
  MECHANIC_DIALOGUES,
  TOOL_WEAPON_IDS,
  AMMO,
  DRINKS,
  FOODS,
  MAP_NPC_INTROS,
  GAME_CONSTANTS,
} from '../config.js';

import {
  showExploreOptionsState,
} from '../routing.js';

function showMechanicMenu() {
  setOptions([
    { text: "对话", action: "mechanic_chat" },
    { text: "交易", action: "mechanic_trade" },
    { text: "离开", action: "mechanic_leave" },
  ]);
}

export function handleMechanicInteract() {
  setPhase("explore");
  setStory(MAP_NPC_INTROS.mechanic_intro);
  showMechanicMenu();
}

export function handleMechanicChat() {
  const line = MECHANIC_DIALOGUES[Math.floor(Math.random() * MECHANIC_DIALOGUES.length)];
  setStory(line);
  showMechanicMenu();
}

export function handleMechanicTrade() {
  const state = getState();
  const toolIds = TOOL_WEAPON_IDS;
  let foundIdx = -1;
  for (const id of toolIds) {
    foundIdx = state.other.findIndex(i => i.id === id);
    if (foundIdx !== -1) break;
  }
  if (foundIdx === -1) {
    setStory("王铁柱翻了翻你的背包：\"没有工具？那咱没啥好聊的。去搞点扳手铁管啥的再来吧！\"");
    showMechanicMenu();
    return;
  }
  const toolName = state.other[foundIdx].name;
  setStory(`王铁柱眼睛一亮：\"哟，${toolName}！这玩意儿我正好用得上！给我，我给你换点弹药、吃喝，咋样？\"`);
  setPhase("explore");
  setOptions([
    { text: `交易${toolName}`, action: "mechanic_trade_confirm" },
    { text: "再想想", action: "mechanic_chat" },
  ]);
}

export function handleMechanicTradeConfirm() {
  const state = getState();
  const toolIds = TOOL_WEAPON_IDS;
  let foundIdx = -1;
  for (const id of toolIds) {
    foundIdx = state.other.findIndex(i => i.id === id);
    if (foundIdx !== -1) break;
  }
  if (foundIdx === -1) {
    setStory("工具已经不在了。");
    showMechanicMenu();
    return;
  }
  const toolName = state.other[foundIdx].name;
  removeItem("other", foundIdx);
  const ammo = AMMO[Math.floor(Math.random() * AMMO.length)];
  addItem({ id: ammo.id, name: ammo.name, type: "ammo", count: 5 });
  const drink = DRINKS[Math.floor(Math.random() * DRINKS.length)];
  addItem({ ...drink, type: "drink" });
  const food = FOODS[Math.floor(Math.random() * FOODS.length)];
  addItem({ ...food });
  setStory(`你把${toolName}递给了王铁柱。他满意地接过去，从工具箱里翻出了一些东西：\n\n• ${ammo.name}×5\n• ${drink.name}×1\n• ${food.name}×1\n\n\"物有所值！下次有工具还来找我啊！\"`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!getState().gameOver) {
    showMechanicMenu();
  }
}

export function handleMechanicLeave() {
  setStory("你和王铁柱道别，离开了加工厂。");
  showExploreOptionsState();
}

export function handleMechanicGasTrade() {
  const state = getState();
  setPhase("explore");
  setStory(MAP_NPC_INTROS.mechanic_gas_intro);
  setOptions([
    { text: "兑换（5香烟 → 1汽油）", action: "mechanic_gas_confirm" },
    { text: "算了", action: "mechanic_leave" },
  ]);
}

export function handleMechanicGasConfirm() {
  const state = getState();
  if (state.cigarettes < 5) {
    setStory(MAP_NPC_INTROS.mechanic_gas_no_cigs);
    setOptions([
      { text: "离开", action: "mechanic_leave" },
    ]);
    return;
  }
  state.cigarettes -= 5;
  addGasoline(1);
  setStory(MAP_NPC_INTROS.mechanic_gas_success);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    setOptions([
      { text: "继续兑换", action: "mechanic_gas_confirm" },
      { text: "离开", action: "mechanic_leave" },
    ]);
  }
}
