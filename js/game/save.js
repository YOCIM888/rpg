import {
  getState,
  setPhase,
  setStory,
  setOptions,
  resetState,
} from '../state.js';

import {
  saveGame,
  loadGame,
  deleteSlot,
  getAllSlots
} from '../save.js';

import { showHomeOptions, showExploreOptionsState, returnToMenu } from '../routing.js';

export function handleSavePage() {
  if (getState().gameOver && !getState()._endingBeforeSave) return;
  setPhase("save_page");
  setStory("存档管理 - 选择一个存档槽位进行操作：\n输入对应编号选择槽位，输入 11 返回。");
  renderSaveSlotsAsOptions();
}

export function renderSaveSlotsAsOptions() {
  const slots = getAllSlots();
  const opts = slots.map((slot, i) => {
    if (slot) {
      return { text: `槽位 ${i + 1}. ${slot.nickname} | 第${slot.day}天 | ${slot.timestamp}`, action: "save_slot", index: i };
    } else {
      return { text: `槽位 ${i + 1}. ——空——`, action: "save_slot", index: i };
    }
  });
  opts.push({ text: "返回", action: "back", index: -1 });
  setOptions(opts);
}

export function handleSavePageAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const option = state.options[optionIndex];

  if (option.action === "back") {
    returnToMenu();
    return;
  }

  const slotId = option.index;
  state._saveSlotId = slotId;
  state._saveSlotData = loadGame(slotId);

  setPhase("save_confirm");

  if (state._saveSlotData) {
    setStory(`槽位 ${slotId + 1}：${state._saveSlotData.nickname} | 第${state._saveSlotData.day}天 | ${state._saveSlotData.timestamp}\n⚠ 选择"保存覆盖"将永久覆盖此存档！`);
    setOptions([
      { text: "读取存档", action: "load" },
      { text: "保存覆盖", action: "overwrite" },
      { text: "删除存档", action: "delete" },
      { text: "返回", action: "back" }
    ]);
  } else {
    setStory(`槽位 ${slotId + 1}：空`);
    setOptions([
      { text: "保存存档到此", action: "save" },
      { text: "返回", action: "back" }
    ]);
  }
}

export function handleSaveConfirm(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const action = state.options[optionIndex].action;
  const slotId = state._saveSlotId;

  if (action === "back") {
    handleSavePage();
    return;
  }

  if (action === "save" || action === "overwrite") {
    const ok = saveGame(slotId, state, state.name);
    if (ok) {
      setStory(`存档已保存到槽位 ${slotId + 1}。`);
    } else {
      setStory("保存失败！");
    }
    handleSavePage();
    return;
  }

  if (action === "load") {
    const saveData = loadGame(slotId);
    if (!saveData || !saveData.gameState) {
      setStory("读取存档失败，存档数据损坏！");
      handleSavePage();
      return;
    }
    resetState();
    Object.assign(getState(), saveData.gameState);
    const loadedState = getState();
    setStory(`存档读取成功！欢迎回来，${loadedState.name}。`);
    setPhase("choose");
    if (loadedState.currentMap) {
      showExploreOptionsState();
    } else {
      showHomeOptions();
    }
    return;
  }

  if (action === "delete") {
    const ok = deleteSlot(slotId);
    if (ok) {
      setStory(`槽位 ${slotId + 1} 的存档已删除。`);
    } else {
      setStory("删除失败！");
    }
    handleSavePage();
    return;
  }
}
