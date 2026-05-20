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
  DOCTOR_INTRO,
  DOCTOR_DIALOGUES,
  DOCTOR_QUEST1_STORY,
  DOCTOR_QUEST1_COMPLETE,
  DOCTOR_QUEST2_COMPLETE,
  DOCTOR_QUEST3_COMPLETE,
  DOCTOR_QUEST1_REJECT,
  ENERGY_WELL_STORY,
  DOCTOR_ENDING8_GONE,
  AMMO,
  RANGED_WEAPONS,
  MEDICINES,
  DEFAULT_ITEM_IDS,
  BUILDING_MATERIALS,
  FIXED_LOOT_DROPS,
  GAME_CONSTANTS,
} from '../config.js';

import {
  showExploreOptionsState,
} from '../routing.js';

import { hasCastleIdentity } from '../faction.js';

export function handleDoctorInteract() {
  const state = getState();
  if (state.doctorLeftInEnding8) {
    setStory(DOCTOR_ENDING8_GONE);
    const opts = [];
    if (state.lastImprovedSerumDay !== state.day) {
      opts.push({ text: "领取产出", action: "doctor_harvest_serum" });
    } else {
      opts.push({ text: "领取产出（今日已领取）", action: "doctor_harvest_serum", disabled: true });
    }
    opts.push({ text: "离开", action: "doctor_leave" });
    setOptions(opts);
    return;
  }
  if (state.doctorTradeDone) {
    setPhase("explore");
    setStory("陈博士正忙着整理实验数据。看到你走来，他推了推眼镜点了点头。");
    const opts = [];
    opts.push({ text: "对话", action: "doctor_chat" });
    if (state.giantPuppetDefeated && !state.doctorQuest1Accepted && !state.doctorQuest1Done) {
      opts.push({ text: "火箭维修咨询", action: "doctor_rocket_consult" });
    } else if (!state.giantPuppetDefeated && !state.doctorQuest1Accepted && !state.doctorQuest1Done) {
      opts.push({ text: "火箭维修咨询（需要先击败航天基地的巨型傀儡）", action: "doctor_rocket_consult", disabled: true });
    }
    if (state.doctorQuest1Accepted && !state.doctorQuest1Done) {
      const hasGenerator = state.other.some(i => i.id === "small_nuclear_generator");
      if (hasGenerator) {
        opts.push({ text: "上交小核能发电机", action: "doctor_quest1_submit" });
      } else {
        opts.push({ text: "小核能发电机（未获取）", action: "doctor_quest1_submit", disabled: true });
      }
    }
    if (state.doctorQuest1Done && !state.doctorQuest2Done) {
      const energyCount = state.other.filter(i => i.id === "pure_energy").reduce((sum, i) => sum + (i.count || 1), 0);
      if (energyCount >= GAME_CONSTANTS.ROCKET.QUEST2_ENERGY_COST) {
        opts.push({ text: `上交${GAME_CONSTANTS.ROCKET.QUEST2_ENERGY_COST}个纯净能源`, action: "doctor_quest2_submit" });
      } else {
        opts.push({ text: `上交${GAME_CONSTANTS.ROCKET.QUEST2_ENERGY_COST}个纯净能源（你有${energyCount}个）`, action: "doctor_quest2_submit", disabled: true });
      }
    }
    if (state.doctorQuest2Done && !state.doctorQuest3Done) {
      const medCount = state.medicine.reduce((sum, m) => sum + (m.count || 1), 0);
      const foodCount = state.food.reduce((sum, f) => sum + (f.count || 1), 0);
      const drinkCount = state.drinks.reduce((sum, d) => sum + (d.count || 1), 0);
      const canSubmit = medCount >= GAME_CONSTANTS.ROCKET.QUEST3_MEDICINE_COST && foodCount >= GAME_CONSTANTS.ROCKET.QUEST3_FOOD_COST && drinkCount >= GAME_CONSTANTS.ROCKET.QUEST3_DRINKS_COST;
      if (canSubmit) {
        opts.push({ text: "上交物资储备", action: "doctor_quest3_submit" });
      } else {
        opts.push({ text: `物资储备（医疗${medCount}/${GAME_CONSTANTS.ROCKET.QUEST3_MEDICINE_COST} 食物${foodCount}/${GAME_CONSTANTS.ROCKET.QUEST3_FOOD_COST} 饮品${drinkCount}/${GAME_CONSTANTS.ROCKET.QUEST3_DRINKS_COST}）`, action: "doctor_quest3_submit", disabled: true });
      }
    }
    if (state.doctorQuest3Done) {
      opts.push({ text: "关于火箭…", action: "doctor_rocket_status" });
    }
    opts.push({ text: "离开", action: "doctor_leave" });
    setOptions(opts);
    return;
  }
  setPhase("explore");
  setStory(DOCTOR_INTRO);
  const serumCount = state.medicine.filter(m => m.id === DEFAULT_ITEM_IDS.serum).reduce((sum, m) => sum + (m.count || 1), 0);
  const opts = [];
  if (serumCount >= GAME_CONSTANTS.DOCTOR.SERUM_TRADE_COST) {
    opts.push({ text: `上交${GAME_CONSTANTS.DOCTOR.SERUM_TRADE_COST}支${MEDICINES.find(m => m.id === DEFAULT_ITEM_IDS.serum).name}`, action: "doctor_trade" });
  } else {
    opts.push({ text: `上交${GAME_CONSTANTS.DOCTOR.SERUM_TRADE_COST}支${MEDICINES.find(m => m.id === DEFAULT_ITEM_IDS.serum).name}（你仅有${serumCount}支）`, action: "doctor_trade", disabled: true });
  }
  opts.push({ text: "对话", action: "doctor_chat" });
  opts.push({ text: "火箭维修咨询（需要先完成陈博士的血清交易）", action: "doctor_rocket_consult", disabled: true });
  opts.push({ text: "离开", action: "doctor_leave" });
  setOptions(opts);
}

export function handleDoctorTrade() {
  const state = getState();
  const serumCount = state.medicine.filter(m => m.id === DEFAULT_ITEM_IDS.serum).reduce((sum, m) => sum + (m.count || 1), 0);
  if (serumCount < GAME_CONSTANTS.DOCTOR.SERUM_TRADE_COST) {
    handleDoctorInteract();
    return;
  }
  let remaining = GAME_CONSTANTS.DOCTOR.SERUM_TRADE_COST;
  for (let i = state.medicine.length - 1; i >= 0 && remaining > 0; i--) {
    if (state.medicine[i].id === DEFAULT_ITEM_IDS.serum) {
      const available = state.medicine[i].count || 1;
      if (available <= remaining) {
        state.medicine.splice(i, 1);
        remaining -= available;
      } else {
        state.medicine[i].count = available - remaining;
        remaining = 0;
      }
    }
  }
  const doctorDrop = FIXED_LOOT_DROPS.doctor_trade;
  const doctorWeapon = RANGED_WEAPONS.find(w => w.id === doctorDrop.weaponId);
  const addedGun = addItem({ ...doctorWeapon });
  const doctorAmmo = AMMO.find(a => a.id === doctorDrop.ammoId);
  const addedAmmo = addItem({ id: doctorAmmo.id, name: doctorAmmo.name, type: "ammo", count: doctorDrop.ammoCount });
  state.doctorTradeDone = true;
  if (addedGun && addedAmmo) {
    setStory(`博士接过${GAME_CONSTANTS.DOCTOR.SERUM_TRADE_COST}支血清，双手微微颤抖。"太感谢了……这足以让我完成研究了！"他递给你一把${doctorWeapon.name}和${doctorDrop.ammoCount}发${doctorAmmo.name}子弹。"这是我最后的私人物品，希望能帮到你。"`);
  } else {
    setStory(`博士接过${GAME_CONSTANTS.DOCTOR.SERUM_TRADE_COST}支血清，递给你${doctorWeapon.name}和子弹。但你的背包空间不足，部分物品无法携带！`);
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    showExploreOptionsState();
  }
}

export function handleDoctorChat() {
  const state = getState();
  const line = DOCTOR_DIALOGUES[Math.floor(Math.random() * DOCTOR_DIALOGUES.length)];
  setStory(line);
  if (state.doctorLeftInEnding8) {
    const opts = [];
    if (state.lastImprovedSerumDay !== state.day) {
      opts.push({ text: "领取产出", action: "doctor_harvest_serum" });
    } else {
      opts.push({ text: "领取产出（今日已领取）", action: "doctor_harvest_serum", disabled: true });
    }
    opts.push({ text: "离开", action: "doctor_leave" });
    setOptions(opts);
    return;
  }
  const opts = [];
  opts.push({ text: "对话", action: "doctor_chat" });
  if (state.doctorTradeDone && state.giantPuppetDefeated && !state.doctorQuest1Accepted && !state.doctorQuest1Done) {
    opts.push({ text: "火箭维修咨询", action: "doctor_rocket_consult" });
  }
  if (state.doctorTradeDone && state.doctorQuest1Accepted && !state.doctorQuest1Done) {
    const hasGenerator = state.other.some(i => i.id === "small_nuclear_generator");
    if (hasGenerator) {
      opts.push({ text: "上交小核能发电机", action: "doctor_quest1_submit" });
    } else {
      opts.push({ text: "小核能发电机（未获取）", action: "doctor_quest1_submit", disabled: true });
    }
  }
  if (state.doctorTradeDone && state.doctorQuest1Done && !state.doctorQuest2Done) {
    const energyCount = state.other.filter(i => i.id === "pure_energy").reduce((sum, i) => sum + (i.count || 1), 0);
    if (energyCount >= GAME_CONSTANTS.ROCKET.QUEST2_ENERGY_COST) {
      opts.push({ text: `上交${GAME_CONSTANTS.ROCKET.QUEST2_ENERGY_COST}个纯净能源`, action: "doctor_quest2_submit" });
    } else {
      opts.push({ text: `上交${GAME_CONSTANTS.ROCKET.QUEST2_ENERGY_COST}个纯净能源（你有${energyCount}个）`, action: "doctor_quest2_submit", disabled: true });
    }
  }
  if (state.doctorTradeDone && state.doctorQuest2Done && !state.doctorQuest3Done) {
    const medCount = state.medicine.reduce((sum, m) => sum + (m.count || 1), 0);
    const foodCount = state.food.reduce((sum, f) => sum + (f.count || 1), 0);
    const drinkCount = state.drinks.reduce((sum, d) => sum + (d.count || 1), 0);
    const canSubmit = medCount >= GAME_CONSTANTS.ROCKET.QUEST3_MEDICINE_COST && foodCount >= GAME_CONSTANTS.ROCKET.QUEST3_FOOD_COST && drinkCount >= GAME_CONSTANTS.ROCKET.QUEST3_DRINKS_COST;
    if (canSubmit) {
      opts.push({ text: "上交物资储备", action: "doctor_quest3_submit" });
    } else {
      opts.push({ text: `物资储备（医疗${medCount}/${GAME_CONSTANTS.ROCKET.QUEST3_MEDICINE_COST} 食物${foodCount}/${GAME_CONSTANTS.ROCKET.QUEST3_FOOD_COST} 饮品${drinkCount}/${GAME_CONSTANTS.ROCKET.QUEST3_DRINKS_COST}）`, action: "doctor_quest3_submit", disabled: true });
    }
  }
  if (state.doctorTradeDone && state.doctorQuest3Done) {
    opts.push({ text: "关于火箭…", action: "doctor_rocket_status" });
  }
  opts.push({ text: "离开", action: "doctor_leave" });
  setOptions(opts);
}

export function handleDoctorLeave() {
  setStory("你告别了博士，离开了研究所。");
  showExploreOptionsState();
}

export function handleDoctorRocketConsult() {
  setStory(DOCTOR_QUEST1_STORY);
  setOptions([
    { text: "接受任务", action: "doctor_quest1_accept" },
    { text: "拒绝", action: "doctor_quest1_reject" },
  ]);
}

export function handleDoctorQuest1Accept() {
  const state = getState();
  state.doctorQuest1Accepted = true;
  setStory("你点了点头。陈博士露出了久违的笑容：\"太好了！去城堡找国王吧，祝你好运。记住，你需要的是小核能发电机。\"");
  showExploreOptionsState();
}

export function handleDoctorQuest1Reject() {
  setStory(DOCTOR_QUEST1_REJECT);
  showExploreOptionsState();
}

export function handleDoctorQuest1Submit() {
  const state = getState();
  const genIdx = state.other.findIndex(i => i.id === "small_nuclear_generator");
  if (genIdx === -1) {
    handleDoctorInteract();
    return;
  }
  state.other.splice(genIdx, 1);
  state.doctorQuest1Done = true;
  setStory(DOCTOR_QUEST1_COMPLETE);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) showExploreOptionsState();
}

export function handleDoctorQuest2Submit() {
  const state = getState();
  const cost = GAME_CONSTANTS.ROCKET.QUEST2_ENERGY_COST;
  let remaining = cost;
  for (let i = state.other.length - 1; i >= 0 && remaining > 0; i--) {
    if (state.other[i].id === "pure_energy") {
      const available = state.other[i].count || 1;
      if (available <= remaining) {
        state.other.splice(i, 1);
        remaining -= available;
      } else {
        state.other[i].count = available - remaining;
        remaining = 0;
      }
    }
  }
  if (remaining > 0) {
    handleDoctorInteract();
    return;
  }
  state.doctorQuest2Done = true;
  setStory(DOCTOR_QUEST2_COMPLETE);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) showExploreOptionsState();
}

export function handleDoctorQuest3Submit() {
  const state = getState();
  const medCost = GAME_CONSTANTS.ROCKET.QUEST3_MEDICINE_COST;
  const foodCost = GAME_CONSTANTS.ROCKET.QUEST3_FOOD_COST;
  const drinkCost = GAME_CONSTANTS.ROCKET.QUEST3_DRINKS_COST;
  const medCount = state.medicine.reduce((sum, m) => sum + (m.count || 1), 0);
  const foodCount = state.food.reduce((sum, f) => sum + (f.count || 1), 0);
  const drinkCount = state.drinks.reduce((sum, d) => sum + (d.count || 1), 0);
  if (medCount < medCost || foodCount < foodCost || drinkCount < drinkCost) {
    handleDoctorInteract();
    return;
  }
  function removeStackableCount(arr, count) {
    let remaining = count;
    for (let i = arr.length - 1; i >= 0 && remaining > 0; i--) {
      const available = arr[i].count || 1;
      if (available <= remaining) {
        arr.splice(i, 1);
        remaining -= available;
      } else {
        arr[i].count = available - remaining;
        remaining = 0;
      }
    }
  }
  removeStackableCount(state.medicine, medCost);
  removeStackableCount(state.food, foodCost);
  removeStackableCount(state.drinks, drinkCost);
  state.doctorQuest3Done = true;
  setStory(DOCTOR_QUEST3_COMPLETE);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) showExploreOptionsState();
}

export function handleDoctorRocketStatus() {
  setStory("陈博士推了推眼镜：\"火箭已经准备就绪，所有系统运行正常。去航天基地的发射中心吧，在那里你将做出最后的选择。\"");
  showExploreOptionsState();
}

export function handleDoctorHarvestSerum() {
  const state = getState();
  if (state.lastImprovedSerumDay === state.day) {
    setStory("今天的改良抗体针已经领取过了，明天再来吧。");
    handleDoctorInteract();
    return;
  }
  state.lastImprovedSerumDay = state.day;
  const improvedSerum = MEDICINES.find(m => m.id === "improved_serum");
  if (improvedSerum) {
    const added = addItem({ ...improvedSerum });
    if (added) {
      setStory("你从博士留下的制造仪器中取出了一支改良抗体针。淡蓝色的液体在针管中微微发光。");
    } else {
      setStory("制造仪器产出了一支改良抗体针，但你的背包已满，无法携带！");
    }
  }
  handleDoctorInteract();
}

export function handleEnergyWell() {
  const state = getState();
  if (!state.doctorQuest1Done) {
    setStory("研究所深处似乎有什么装置，但目前还无法使用。也许需要陈博士的帮助才能启动。");
    showExploreOptionsState();
    return;
  }
  if (state.lastEnergyWellDay === state.day) {
    setStory(ENERGY_WELL_STORY + "\n\n开采井今天已经提取过了，明天再来吧。");
    showExploreOptionsState();
    return;
  }
  state.lastEnergyWellDay = state.day;
  const pureEnergy = BUILDING_MATERIALS.find(b => b.id === "pure_energy");
  const energyCount = state.other.filter(i => i.id === "pure_energy").reduce((sum, i) => sum + (i.count || 1), 0);
  const progressHint = `\n\n当前纯净能源数量：${energyCount}/${GAME_CONSTANTS.ROCKET.QUEST2_ENERGY_COST}`;
  if (pureEnergy) {
    const added = addItem({ ...pureEnergy });
    if (added) {
      setStory(ENERGY_WELL_STORY + "\n\n你从开采井中提取了一份纯净能源。淡蓝色的能量液体在容器中微微发光。" + progressHint);
    } else {
      setStory(ENERGY_WELL_STORY + "\n\n开采井产出了纯净能源，但你的背包已满，无法携带！" + progressHint);
    }
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) showExploreOptionsState();
}
