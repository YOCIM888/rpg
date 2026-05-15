import { MELEE_WEAPONS, RANGED_WEAPONS, AMMO, BACKPACK_TYPES } from './config.js';

const TIME_PHASES = [
  "凌晨", "早上", "上午", "中午", "下午", "傍晚", "夜晚", "深夜"
];

const INITIAL_STATE = {
  name: "",
  day: 1,
  phaseIndex: 0,
  location: "幸存者帐篷",
  health: 100,
  crash: 0,
  infection: 0,
  hunger: 100,
  hydration: 100,
  status: "正常",
  currentMap: null,
  meleeWeapon: { id: "拳头", name: "拳头", damage: 5, durability: Infinity },
  rangedWeapon: null,
  ammo: [],
  backpack: { type: "口袋", capacity: 10 },
  food: [{ id: "压缩饼干", name: "压缩饼干", hunger: 30 }],
  drinks: [{ id: "饮用水", name: "饮用水", hydration: 30 }],
  medicine: [],
  other: [],
  story: "开场白：丧尸病毒爆发已经一周了，你蜷缩在幸存者帐篷里，听着外面隐约传来的丧尸低吼声。饥饿、口渴和恐惧同时袭来，你必须想办法活下去……",
  options: [{ text: "睡觉", action: "sleep" }, { text: "进食", action: "eat" }, { text: "外出", action: "goOut" }],
  phase: "choose",
  gameOver: false,
  combatState: null,
};

let gameState = JSON.parse(JSON.stringify(INITIAL_STATE));

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function getState() {
  return gameState;
}

export function resetState() {
  gameState = JSON.parse(JSON.stringify(INITIAL_STATE));
}

export function setName(name) {
  gameState.name = name;
}

export function advanceTime(steps = 1) {
  const messages = [];

  gameState.phaseIndex += steps;

  while (gameState.phaseIndex >= TIME_PHASES.length) {
    gameState.day++;
    gameState.phaseIndex -= TIME_PHASES.length;
    messages.push(`新的一天开始了！第 ${gameState.day} 天`);
  }

  gameState.hunger = clamp(gameState.hunger - 5 * steps, 0, 100);
  gameState.hydration = clamp(gameState.hydration - 5 * steps, 0, 100);

  return messages;
}

export function addItem(item) {
  const totalItems =
    gameState.food.length +
    gameState.drinks.length +
    gameState.medicine.length +
    gameState.other.length;

  if (totalItems >= gameState.backpack.capacity) {
    return false;
  }

  if (item.type === "ammo") {
    const existing = gameState.ammo.find((a) => a.id === item.id);
    if (existing) {
      existing.count += item.count || 1;
    } else {
      gameState.ammo.push({ id: item.id, name: item.name, count: item.count || 1 });
    }
    return true;
  }

  const typeMap = {
    food: gameState.food,
    drink: gameState.drinks,
    drinks: gameState.drinks,
    medicine: gameState.medicine,
  };

  const target = typeMap[item.type] || gameState.other;
  target.push(item);
  return true;
}

export function removeItem(type, index) {
  const typeMap = {
    food: gameState.food,
    drinks: gameState.drinks,
    medicine: gameState.medicine,
    other: gameState.other,
  };

  const target = typeMap[type];
  if (!target || index < 0 || index >= target.length) {
    return null;
  }

  return target.splice(index, 1)[0];
}

export function consumeItem(type, index) {
  const item = removeItem(type, index);
  if (!item) {
    return null;
  }

  if (item.hunger) {
    gameState.hunger = clamp(gameState.hunger + item.hunger, 0, 100);
  }

  if (item.hydration) {
    gameState.hydration = clamp(gameState.hydration + item.hydration, 0, 100);
  }

  if (item.health) {
    gameState.health = clamp(gameState.health + item.health, 0, 100);
  }

  if (item.effects) {
    if (item.effects.infection != null) {
      gameState.infection = clamp(gameState.infection + item.effects.infection, 0, 100);
    }
    if (item.effects.crash != null) {
      gameState.crash = clamp(gameState.crash + item.effects.crash, 0, 100);
    }
    if (item.effects.hunger != null) {
      gameState.hunger = clamp(gameState.hunger + item.effects.hunger, 0, 100);
    }
    if (item.effects.hydration != null) {
      gameState.hydration = clamp(gameState.hydration + item.effects.hydration, 0, 100);
    }
    if (item.effects.health != null) {
      gameState.health = clamp(gameState.health + item.effects.health, 0, 100);
    }
  }

  return item;
}

export function equipMelee(itemId) {
  if (itemId === "拳头") {
    if (gameState.meleeWeapon.id !== "拳头") {
      gameState.other.push(gameState.meleeWeapon);
    }
    gameState.meleeWeapon = { id: "拳头", name: "拳头", damage: 5, durability: Infinity };
    return gameState.meleeWeapon;
  }

  const index = gameState.other.findIndex(
    (item) => item.id === itemId && item.type === "melee"
  );

  if (index === -1) {
    return null;
  }

  const newWeapon = gameState.other.splice(index, 1)[0];

  if (gameState.meleeWeapon.id !== "拳头") {
    gameState.other.push(gameState.meleeWeapon);
  }

  gameState.meleeWeapon = newWeapon;
  return gameState.meleeWeapon;
}

export function equipRanged(itemId) {
  const index = gameState.other.findIndex(
    (item) => item.id === itemId && item.type === "ranged"
  );

  if (index === -1) {
    return null;
  }

  const newWeapon = gameState.other.splice(index, 1)[0];

  if (gameState.rangedWeapon) {
    gameState.other.push(gameState.rangedWeapon);
  }

  gameState.rangedWeapon = newWeapon;
  return gameState.rangedWeapon;
}

export function addAmmo(ammoId, count) {
  const existing = gameState.ammo.find((a) => a.id === ammoId);
  if (existing) {
    existing.count += count;
  } else {
    gameState.ammo.push({ id: ammoId, name: ammoId, count });
  }
}

export function useAmmo(ammoId) {
  const existing = gameState.ammo.find((a) => a.id === ammoId);
  if (!existing || existing.count <= 0) {
    return false;
  }

  existing.count--;
  if (existing.count <= 0) {
    gameState.ammo = gameState.ammo.filter((a) => a.id !== ammoId);
  }
  return true;
}

export function reduceMeleeDurability() {
  if (gameState.meleeWeapon.durability === Infinity) {
    return null;
  }

  gameState.meleeWeapon.durability -= 1;

  if (gameState.meleeWeapon.durability <= 0) {
    const brokenName = gameState.meleeWeapon.name;
    gameState.meleeWeapon = { id: "拳头", name: "拳头", damage: 5, durability: Infinity };
    return `${brokenName} 已经损坏，你只能用拳头了。`;
  }

  return null;
}

export function reduceRangedIntegrity() {
  if (!gameState.rangedWeapon) {
    return null;
  }

  gameState.rangedWeapon.integrity -= 5;

  if (gameState.rangedWeapon.integrity <= 0) {
    const brokenName = gameState.rangedWeapon.name;
    gameState.rangedWeapon = null;
    return `${brokenName} 已经损坏，无法再使用。`;
  }

  return null;
}

export function checkDeath() {
  if (gameState.health <= 0 || gameState.infection >= 100) {
    gameState.gameOver = true;
    gameState.phase = "game_over";
    gameState.options = [{ text: "重新开始", action: "restart" }];
    gameState.story += "\n\n你死了。在这个残酷的世界里，生命如此脆弱……";
    return true;
  }
  return false;
}

export function updateStatusEffects() {
  const messages = [];

  if (gameState.hunger <= 0) {
    gameState.status = "饥饿";
    gameState.health = clamp(gameState.health - 10, 0, 100);
    messages.push("你极度饥饿，生命值下降！");
  }
  if (gameState.hydration <= 0) {
    gameState.status = "口渴";
    gameState.health = clamp(gameState.health - 10, 0, 100);
    messages.push("你极度口渴，生命值下降！");
  }
  if (gameState.hunger > 0 && gameState.hydration > 0) {
    if (gameState.infection > 50) {
      gameState.status = "感染";
      messages.push("你感到身体在被病毒侵蚀……");
    } else if (gameState.crash > 50) {
      gameState.status = "崩溃";
      messages.push("你的精神濒临崩溃……");
    } else if (gameState.health < 30) {
      gameState.status = "重伤";
      messages.push("你身受重伤，需要尽快治疗！");
    } else {
      gameState.status = "正常";
    }
  }

  return messages;
}

export function setLocation(location) {
  gameState.location = location;
}

export function setCurrentMap(map) {
  gameState.currentMap = map;
}

export function setPhase(phase) {
  gameState.phase = phase;
}

export function setStory(text) {
  gameState.story = text;
}

export function setOptions(options) {
  gameState.options = options;
}

export function getBackpackCount() {
  return (
    gameState.food.length +
    gameState.drinks.length +
    gameState.medicine.length +
    gameState.other.length
  );
}

export { gameState, TIME_PHASES };