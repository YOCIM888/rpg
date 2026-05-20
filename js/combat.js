/* ============================================================
   战斗系统模块
   组织顺序：战斗工具 → 丧尸战斗 → NPC战斗 → 遭遇事件
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
  addCigarettes,
  removeCigarettes,
  getItemDisplayName,
} from './state.js';

import {
  AMMO,
  FOODS,
  DRINKS,
  FRUITS,
  MELEE_WEAPONS,
  RANGED_WEAPONS,
  GAME_CONSTANTS,
  SPECIAL_ITEMS,
  BUILDING_MATERIALS,
  getAmmoById,
  getRandomZombie,
  pickRandomLoot,
  createNpcInstance,
  generateNpcLoot,
  getRandomTrade,
  TRADER_WEAPON_SHOP,
  FIXED_LOOT_DROPS,
  DEFAULT_ITEM_IDS,
  BOSS_NAMES,
  SEEDS,
} from './config.js';

import { MAP_NPC_INTROS } from './data/dialogues/map-dialogues.js';

import { showExploreOptionsState, showHomeOptions } from './routing.js';
import { triggerEnding } from './game/endings.js';

import { checkLeaderAssassinationVictory } from './outpost/index.js';

import { refreshIslandMenu } from './island/index.js';

// ---------- 战斗工具 ----------

function getRangedAmmoInfo(state) {
  if (!state.rangedWeapon) return "(未装备)";
  const ammoId = state.rangedWeapon.ammoType;
  const ammo = state.ammo.find(a => a.id === ammoId);
  const ammoCount = ammo ? ammo.count : 0;
  return `(弹药:${ammoCount}发 完整:${state.rangedWeapon.integrity}%)`;
}

/**
 * 检查是否可以使用远程武器进行战斗
 * @param {Object} state - 游戏状态
 * @returns {boolean} 是否有弹药和武器
 */
function canRangedCombat(state) {
  if (!state.rangedWeapon) return false;
  const ammoId = state.rangedWeapon.ammoType;
  const ammo = state.ammo.find(a => a.id === ammoId && a.count > 0);
  return !!ammo;
}

/**
 * 处理战斗前选择（近战/远程/逃跑）
 * @param {number} input - 玩家选择的选项编号
 */
function handlePreCombatChoice(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const action = state.options[optionIndex].action;

  if (action === "combat_flee") {
    if (Math.random() < GAME_CONSTANTS.COMBAT.FLEE_RATE) {
      setStory(`你成功从${state._pendingZombie?.name || "丧尸"}的追击中逃脱了！`);
      advanceTime(1);
      updateStatusEffects();
      checkDeath();
      if (!state.gameOver) {
        showExploreOptionsState();
      }
    } else {
      setStory("逃跑失败！你被丧尸缠住了！被迫进入战斗！");
      setPhase("combat");
      setOptions([{ text: "战斗进行中...", action: "none" }]);
      const zombieDef = state._pendingZombie;
      const died = handleCombat(zombieDef, "melee");
      if (died) return;
      advanceTime(1);
      updateStatusEffects();
      checkDeath();
      if (!state.gameOver) {
        showExploreOptionsState();
      }
    }
    return;
  }

  if (action === "combat_melee") {
    setPhase("combat");
    setOptions([{ text: "战斗进行中...", action: "none" }]);
    const zombieDef = state._pendingZombie;
    const died = handleCombat(zombieDef, "melee");
    if (died) return;
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    if (!state.gameOver) {
      showExploreOptionsState();
    }
    return;
  }

  if (action === "combat_ranged") {
    if (!canRangedCombat(state)) {
      setStory("你没有可用的远程武器或弹药！只能近战了！");
      setPhase("combat");
      setOptions([{ text: "战斗进行中...", action: "none" }]);
      const zombieDef = state._pendingZombie;
      const died = handleCombat(zombieDef, "melee");
      if (died) return;
      advanceTime(1);
      updateStatusEffects();
      checkDeath();
      if (!state.gameOver) {
        showExploreOptionsState();
      }
      return;
    }
    setPhase("combat");
    setOptions([{ text: "战斗进行中...", action: "none" }]);
    const zombieDef = state._pendingZombie;
    const died = handleCombat(zombieDef, "ranged");
    if (died) return;
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    if (!state.gameOver) {
      showExploreOptionsState();
    }
    return;
  }
}

// ---------- 战斗（丧尸）----------

/**
 * 处理与丧尸的战斗
 * @param {Object} zombieDef - 丧尸的定义数据
 * @param {string} combatMode - 战斗模式：'melee' 或 'ranged'
 */
function handleCombat(zombieDef, combatMode = "melee") {
  const state = getState();
  const zombie = { ...zombieDef, currentHp: zombieDef.hp, summoned: false };
  const combatLog = [];
  let round = 0;
  let currentMode = combatMode;

  state._tripped = 0;
  state._frozen = 0;
  state._blindTurns = 0;

  const isCrippled = state.crash >= GAME_CONSTANTS.CRASH_MAX;
  if (isCrippled) {
    combatLog.push({ round: 0, text: "你过于崩溃导致无法战斗，只能挨打！" });
  }

  while (zombie.currentHp > 0 && state.health > 0) {
    round++;

    if (Array.isArray(zombie.ability) && zombie.ability.includes("screech") && round % 2 === 0) {
      state.crash = Math.min(100, (state.crash || 0) + GAME_CONSTANTS.COMBAT.ABILITY_SCREECH_CRASH);
      combatLog.push({ round, text: `${zombie.name}发出尖啸，你的精神受到冲击！崩溃+${GAME_CONSTANTS.COMBAT.ABILITY_SCREECH_CRASH}` });
    }

    if (currentMode === "ranged") {
      if (!canRangedCombat(state)) {
        combatLog.push({ round, text: "你已没有子弹，只能近战了。" });
        currentMode = "melee";
      } else if (state.rangedWeapon && state.rangedWeapon.integrity <= 0) {
        combatLog.push({ round, text: "你的枪已经坏了，只能近战了。" });
        state.rangedWeapon = null;
        currentMode = "melee";
      }
    }

    if (!isCrippled) {
      let skipTurn = false;

      if (state._tripped > 0 && Math.random() < GAME_CONSTANTS.COMBAT.ABILITY_TRIP_SKIP_RATE) {
        combatLog.push({ round, text: "你被爬行尸绊倒，灰头土脸地爬起来，无法攻击！" });
        state._tripped = 0;
        skipTurn = true;
      }

      if (!skipTurn && state._blindTurns > 0 && Math.random() < GAME_CONSTANTS.COMBAT.ABILITY_BLIND_MISS_RATE) {
        combatLog.push({ round, text: "你因为致盲效果打偏了！" });
        state._blindTurns = 0;
        skipTurn = true;
      }

      if (!skipTurn && state._frozen > 0) {
        combatLog.push({ round, text: "冰霜的寒气侵蚀着你的身体，攻击力下降！" });
      }

      if (!skipTurn) {
        if (Math.random() < zombie.dodge) {
          combatLog.push({ round, text: "丧尸闪避了你的攻击！" });

          if (Array.isArray(zombie.ability) && zombie.ability.includes("leap")) {
            const leapDmg = Math.floor(zombie.damage * GAME_CONSTANTS.COMBAT.ABILITY_LEAP_DAMAGE_MULT);
            state.health -= leapDmg;
            state.health = Math.max(0, state.health);
            combatLog.push({ round, text: `跳跃尸借势反扑！对你造成${leapDmg}点伤害！` });
          }

          if (Array.isArray(zombie.ability) && zombie.ability.includes("cloak")) {
            const cloakDmg = Math.floor(zombie.damage * GAME_CONSTANTS.COMBAT.ABILITY_CLOAK_COUNTER_MULT);
            state.health -= cloakDmg;
            state.health = Math.max(0, state.health);
            combatLog.push({ round, text: `幽灵潜行尸遁入暗影，从背后偷袭！造成${cloakDmg}点伤害！` });
          }
        } else if (currentMode === "ranged" && state.rangedWeapon) {
          const ammoId = state.rangedWeapon.ammoType;
          const ammo = state.ammo.find(a => a.id === ammoId);
          if (ammo && ammo.count > 0) {
            ammo.count--;
            if (ammo.count <= 0) {
              state.ammo = state.ammo.filter(a => a.id !== ammoId);
            }
            const critRate = state.rangedWeapon.critRate || 0;
            const isCrit = Math.random() < critRate;
            let damage = state.rangedWeapon.damage;
            if (Array.isArray(zombie.ability) && zombie.ability.includes("armor")) {
              damage = Math.floor(damage * GAME_CONSTANTS.COMBAT.ABILITY_ARMOR_MULT);
            }
            if (state._frozen > 0) {
              damage = Math.floor(damage * GAME_CONSTANTS.COMBAT.FROZEN_DAMAGE_MULT);
              state._frozen = 0;
            }
            if (isCrit) {
              damage *= GAME_CONSTANTS.COMBAT.CRIT_MULTIPLIER;
              combatLog.push({ round, text: `💀爆头！命中${zombie.name}头部，伤害翻倍！造成${damage}点伤害！` });
            } else {
              combatLog.push({ round, text: `你用${state.rangedWeapon.name}射击，造成${damage}点伤害。` });
            }
            zombie.currentHp -= damage;
            if (state.liuruyanRescued && Math.random() < GAME_CONSTANTS.COMBAT.LIURUYAN_ASSIST_RATE && zombie.currentHp > 0) {
              zombie.currentHp -= GAME_CONSTANTS.COMBAT.LIURUYAN_ASSIST_DAMAGE;
              combatLog.push({ round, text: `柳如烟从暗处出手相助，造成${GAME_CONSTANTS.COMBAT.LIURUYAN_ASSIST_DAMAGE}点伤害！` });
            }
            if (state.rangedWeapon.ammoType !== "箭矢") {
              state.rangedWeapon.integrity = Math.max(0, state.rangedWeapon.integrity - GAME_CONSTANTS.COMBAT.RANGED_SHOT_INTEGRITY_LOSS);
              if (state.rangedWeapon.integrity <= 0) {
                combatLog.push({ round, text: `${state.rangedWeapon.name}耐久耗尽，彻底损坏了！` });
                state.rangedWeapon = null;
                currentMode = "melee";
              }
            }
          }
        } else {
          let comboHits = 0;
          do {
            let playerDamage = state.meleeWeapon.damage;
            if (Array.isArray(zombie.ability) && zombie.ability.includes("armor")) {
              playerDamage = Math.floor(playerDamage * GAME_CONSTANTS.COMBAT.ABILITY_ARMOR_MULT);
            }
            if (state._frozen > 0) {
              playerDamage = Math.floor(playerDamage * GAME_CONSTANTS.COMBAT.FROZEN_DAMAGE_MULT);
              state._frozen = 0;
            }
            zombie.currentHp -= playerDamage;
            if (state.liuruyanRescued && Math.random() < GAME_CONSTANTS.COMBAT.LIURUYAN_ASSIST_RATE && zombie.currentHp > 0) {
              zombie.currentHp -= GAME_CONSTANTS.COMBAT.LIURUYAN_ASSIST_DAMAGE;
              combatLog.push({ round, text: `柳如烟从暗处出手相助，造成${GAME_CONSTANTS.COMBAT.LIURUYAN_ASSIST_DAMAGE}点伤害！` });
            }
            state.meleeWeapon.currentDurability = Math.max(0, state.meleeWeapon.currentDurability - 1);
            if (comboHits === 0) {
              combatLog.push({ round, text: `你用${state.meleeWeapon.name}攻击，造成${playerDamage}点伤害。（HP:${Math.max(0, zombie.currentHp)}）` });
            } else {
              combatLog.push({ round, text: `连击！追加攻击！造成${playerDamage}点伤害！（${comboHits}连击）（HP:${Math.max(0, zombie.currentHp)}）` });
            }
            if (state.meleeWeapon.currentDurability <= 0 && state.meleeWeapon.id !== DEFAULT_ITEM_IDS.melee) {
              combatLog.push({ round, text: `${state.meleeWeapon.name}耐久耗尽，彻底损坏了！` });
              const fist = MELEE_WEAPONS.find(w => w.id === DEFAULT_ITEM_IDS.melee);
              state.meleeWeapon = { ...fist, currentDurability: fist.durability };
              break;
            }
            comboHits++;
          } while (zombie.currentHp > 0 && Math.random() < (state.meleeWeapon.comboRate || 0));
        }
        state._blindTurns = 0;
      }
    } else {
      combatLog.push({ round, text: "你精神崩溃，无力还手……" });
    }

    if (zombie.currentHp <= 0) {
      break;
    }

    let playerDodged = false;
    if (currentMode === "ranged" && Math.random() < GAME_CONSTANTS.COMBAT.RANGED_DODGE_RATE) {
      playerDodged = true;
      combatLog.push({ round, text: "你拿着枪保持距离，闪避了丧尸的攻击！" });
    }

    if (!playerDodged) {
      state.health -= zombie.damage;
      state.health = Math.max(0, state.health);

      if (Array.isArray(zombie.ability) && zombie.ability.includes("infect")) {
        state.infection = Math.min(100, state.infection + GAME_CONSTANTS.COMBAT.INFECTION_ON_HIT);
        combatLog.push({ round, text: `${zombie.name}的感染让你感到不适！感染值+${GAME_CONSTANTS.COMBAT.INFECTION_ON_HIT}` });
      }

      if (Array.isArray(zombie.ability) && zombie.ability.includes("blind")) {
        state._blindTurns = 1;
        combatLog.push({ round, text: "你被致盲了，下一回合命中率降低！" });
      }

      if (Array.isArray(zombie.ability) && zombie.ability.includes("corrode")) {
        if (currentMode === "melee" && state.meleeWeapon.id !== DEFAULT_ITEM_IDS.melee) {
          state.meleeWeapon.currentDurability = Math.max(0, state.meleeWeapon.currentDurability - GAME_CONSTANTS.COMBAT.ABILITY_CORRODE_DURABILITY);
          combatLog.push({ round, text: "你的武器被腐蚀了！" });
        } else if (currentMode === "ranged" && state.rangedWeapon) {
          state.rangedWeapon.integrity = Math.max(0, state.rangedWeapon.integrity - GAME_CONSTANTS.COMBAT.ABILITY_CORRODE_INTEGRITY);
          combatLog.push({ round, text: "你的武器被腐蚀了！" });
        }
      }

      if (Array.isArray(zombie.ability) && zombie.ability.includes("acid")) {
        const acidDamage = Math.floor(Math.random() * (GAME_CONSTANTS.COMBAT.ABILITY_ACID_DAMAGE_MAX - GAME_CONSTANTS.COMBAT.ABILITY_ACID_DAMAGE_MIN + 1)) + GAME_CONSTANTS.COMBAT.ABILITY_ACID_DAMAGE_MIN;
        state.health -= acidDamage;
        state.health = Math.max(0, state.health);
        combatLog.push({ round, text: `酸液喷射尸的酸液腐蚀了你！额外受到${acidDamage}点伤害！` });
      }

      if (Array.isArray(zombie.ability) && zombie.ability.includes("summon") && !zombie.summoned) {
        zombie.summoned = true;
        combatLog.push({ round, text: "群居尸母召唤了2只普通游荡丧尸！" });
        const summonDmg = GAME_CONSTANTS.COMBAT.SUMMONED_ZOMBIE_DAMAGE;
        state.health -= summonDmg;
        state.health = Math.max(0, state.health);
        combatLog.push({ round, text: `召唤丧尸对你造成了${summonDmg}点伤害。` });
        state.health -= summonDmg;
        state.health = Math.max(0, state.health);
        combatLog.push({ round, text: `召唤丧尸对你造成了${summonDmg}点伤害。` });
      }

      if (Array.isArray(zombie.ability) && zombie.ability.includes("trip")) {
        state._tripped = 1;
        combatLog.push({ round, text: "爬行尸缠绕住你的双腿，你被绊倒了！" });
      }

      if (Array.isArray(zombie.ability) && zombie.ability.includes("freeze")) {
        state._frozen = 1;
        combatLog.push({ round, text: "冰霜尸的寒气侵入你的身体，你的动作变得迟缓了！" });
      }

      if (Array.isArray(zombie.ability) && zombie.ability.includes("impale")) {
        const impaleDmg = Math.floor(zombie.damage * GAME_CONSTANTS.COMBAT.ABILITY_IMPALE_MULT);
        state.health -= impaleDmg;
        state.health = Math.max(0, state.health);
        combatLog.push({ round, text: `穿刺尸的骨刺深深刺入你的身体！额外受到${impaleDmg}点穿甲伤害！` });
      }

      if (Array.isArray(zombie.ability) && zombie.ability.includes("cloak") && Math.random() < GAME_CONSTANTS.COMBAT.ABILITY_CLOAK_AMBUSH_RATE) {
        const cloakDmg = Math.floor(zombie.damage * GAME_CONSTANTS.COMBAT.ABILITY_CLOAK_AMBUSH_MULT);
        state.health -= cloakDmg;
        state.health = Math.max(0, state.health);
        combatLog.push({ round, text: `幽灵潜行尸从暗影中发动偷袭！额外造成${cloakDmg}点伤害！` });
      }

      combatLog.push({ round, text: `丧尸对你造成了${zombie.damage}点伤害。` });
    }
  }

  if (zombie.currentHp <= 0) {
    combatLog.push({ round: "胜利", text: `你击败了${zombie.name}！` });

    if (Array.isArray(zombie.ability) && zombie.ability.includes("selfDestruct")) {
      state.health -= zombie.damage;
      state.health = Math.max(0, state.health);
      combatLog.push({ round: "胜利", text: `${zombie.name}爆炸了！造成${zombie.damage}点伤害！` });
    }

    if (Array.isArray(zombie.ability) && zombie.ability.includes("explosive")) {
      const explosiveDmg = Math.floor(zombie.damage * GAME_CONSTANTS.COMBAT.ABILITY_EXPLOSIVE_MULT);
      state.health -= explosiveDmg;
      state.health = Math.max(0, state.health);
      combatLog.push({ round: "胜利", text: `爆裂尸的尸体猛然炸开！碎片四溅，造成${explosiveDmg}点伤害！` });
    }

    if (state.nurseZombieRescued) {
      state.health = Math.min(GAME_CONSTANTS.MAX_HEALTH, state.health + GAME_CONSTANTS.COMBAT.NURSE_HEAL_AFTER_COMBAT);
      combatLog.push({ round: "胜利", text: `露露薇为你简单进行了伤口清理，健康恢复了${GAME_CONSTANTS.COMBAT.NURSE_HEAL_AFTER_COMBAT}。` });
    }

    if (Math.random() < GAME_CONSTANTS.COMBAT.ZOMBIE_LOOT_DROP_RATE) {
      const isFood = Math.random() < GAME_CONSTANTS.COMBAT.ZOMBIE_LOOT_FOOD_RATE;
      let lootItem;
      if (isFood) {
        const food = FOODS[Math.floor(Math.random() * FOODS.length)];
        lootItem = { ...food };
      } else {
        const drink = DRINKS[Math.floor(Math.random() * DRINKS.length)];
        lootItem = { ...drink };
      }
      const added = addItem(lootItem);
      if (added) {
        combatLog.push({ round: "胜利", text: `丧尸身上掉落了一些${isFood ? '食物' : '饮品'}：${lootItem.name}。` });
      } else {
        combatLog.push({ round: "胜利", text: `丧尸身上掉落了一些${isFood ? '食物' : '饮品'}，但背包已满。` });
      }
    }

    if (Math.random() < GAME_CONSTANTS.YUMO.GEL_DROP_RATE) {
      const gel = { id: "zombie_gel", name: "丧尸凝胶", type: "medicine", count: 1 };
      const added = addItem(gel);
      if (added) {
        combatLog.push({ round: "胜利", text: "丧尸身上析出了一团黏稠的凝胶。" });
      }
    }

    if (!state.stats) state.stats = {};
    if (!state.stats.zombieKills) state.stats.zombieKills = 0;
    state.stats.zombieKills++;
    const kills = state.stats.zombieKills;
    if (!state.unlockedAchievements) state.unlockedAchievements = [];
    for (const entry of GAME_CONSTANTS.ACHIEVEMENTS.ZOMBIE_KILLS) {
      if (kills >= entry.threshold && !state.unlockedAchievements.includes(entry.id)) {
        state.unlockedAchievements.push(entry.id);
      }
    }
  }

  if (state.health <= 0) {
    combatLog.push({ round: "败北", text: "你被丧尸击倒了……" });
    checkDeath();
  }

  const logText = combatLog.map(entry => {
    if (typeof entry.round === "number") {
      return `[第${entry.round}回合] ${entry.text}`;
    }
    return entry.text;
  }).join("\n");

  const currentStory = state.story || "";
  setStory(currentStory + "\n\n--- 战斗记录 ---\n" + logText);

  return state.health <= 0;
}

// ---------- NPC 战斗与交互 ----------

/**
 * 触发幸存者遭遇事件
 */
function handleSurvivorEncounter() {
  setStory("你在探索时遇到了一个幸存者。他警惕地看着你，但似乎没有立即动手的打算。");
  setPhase("survivor_interact");
  setOptions([
    { text: "交易（用食物换子弹）", action: "survivor_trade" },
    { text: "背刺（偷袭幸存者）", action: "survivor_backstab" },
    { text: "离开", action: "survivor_leave" }
  ]);
}

/**
 * 触发悍匪遭遇事件
 */
function handleBanditEncounter() {
  const state = getState();
  const bandit = createNpcInstance('bandit');
  state._pendingNpc = bandit;
  setPhase("pre_combat_npc");
  const meleeName = state.meleeWeapon.name;
  const rangedName = state.rangedWeapon ? state.rangedWeapon.name : "无";
  const ammoInfo = getRangedAmmoInfo(state);
  const crashWarning = state.crash >= GAME_CONSTANTS.CRASH_MAX ? "\n\n⚠ 你的精神状态极差，无法正常战斗！建议先恢复精神再探索。" : "";
  setStory(`你遇到了${bandit.name}！他二话不说就朝你冲了过来！\n\n【近战】${meleeName}\n【远程】${rangedName} ${ammoInfo}${crashWarning}`);
  const options = [
    { text: "近战作战", action: "combat_npc_melee" }
  ];
  if (canRangedCombat(state)) {
    options.push({ text: "远程作战", action: "combat_npc_ranged" });
  } else {
    options.push({ text: "远程作战（不可用：无弹药）", action: "combat_npc_ranged", disabled: true });
  }
  options.push({ text: GAME_CONSTANTS.COMBAT.FLEE_RATE_TEXT, action: "combat_npc_flee" });
  setOptions(options);
  return;
}

/**
 * 处理悍匪战斗前选择
 * @param {number} input - 玩家选择的选项编号
 */
function handlePreCombatNpcChoice(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const action = state.options[optionIndex].action;

  if (action === "combat_npc_flee") {
    const wasDivingZombie = !!state._divingZombieCombat;
    if (Math.random() < GAME_CONSTANTS.COMBAT.FLEE_RATE) {
      if (wasDivingZombie) delete state._divingZombieCombat;
      setStory(`你成功从${state._pendingNpc?.name || "敌人"}的追击中逃脱了！`);
      advanceTime(1);
      updateStatusEffects();
      checkDeath();
      if (!state.gameOver) {
        if (wasDivingZombie) {
          refreshIslandMenu();
        } else {
          showExploreOptionsState();
        }
      }
    } else {
      setStory("逃跑失败！你被悍匪缠住了！被迫进入战斗！");
      setPhase("combat");
      setOptions([{ text: "战斗进行中...", action: "none" }]);
      const npc = state._pendingNpc;
      handleNpcCombat(npc, "melee");
    }
    return;
  }

  if (action === "combat_npc_melee") {
    setPhase("combat");
    setOptions([{ text: "战斗进行中...", action: "none" }]);
    const npc = state._pendingNpc;
    handleNpcCombat(npc, "melee");
    return;
  }

  if (action === "combat_npc_ranged") {
    if (!canRangedCombat(state)) {
      setStory("你没有可用的远程武器或弹药！只能近战了！");
      setPhase("combat");
      setOptions([{ text: "战斗进行中...", action: "none" }]);
      const npc = state._pendingNpc;
      handleNpcCombat(npc, "melee");
      return;
    }
    setPhase("combat");
    setOptions([{ text: "战斗进行中...", action: "none" }]);
    const npc = state._pendingNpc;
    handleNpcCombat(npc, "ranged");
    return;
  }
}

/**
 * 处理幸存者交互界面的选择
 * @param {number} input - 玩家输入的选项编号
 */
function handleSurvivorAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const action = state.options[optionIndex].action;

  if (action === "survivor_leave") {
    setStory("你选择不招惹幸存者，默默离开了。");
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    showExploreOptionsState();
    return;
  }

  if (action === "survivor_trade") {
    const trade = getRandomTrade();
    state._trade = trade;
    setPhase("trade_choice");
    setStory("幸存者愿意用子弹交换你的物资。");
    setOptions([
      { text: "用食物换子弹", action: "trade_food" },
      { text: "用饮品换子弹", action: "trade_drink" },
      { text: "返回", action: "trade_back" },
    ]);
    return;
  }

  if (action === "survivor_backstab") {
    const survivor = createNpcInstance('survivor');
    getState()._pendingNpc = survivor;
    setPhase("pre_combat_npc");
    const meleeName = getState().meleeWeapon.name;
    const rangedName = getState().rangedWeapon ? getState().rangedWeapon.name : "无";
    const ammoInfo = getRangedAmmoInfo(getState());
    const crashWarning = getState().crash >= GAME_CONSTANTS.CRASH_MAX ? "\n\n⚠ 你的精神状态极差，无法正常战斗！建议先恢复精神再探索。" : "";
    setStory(`你决定铤而走险，偷袭这个幸存者！\n\n【近战】${meleeName}\n【远程】${rangedName} ${ammoInfo}${crashWarning}`);
    const options = [
      { text: "近战作战", action: "combat_npc_melee" }
    ];
    if (canRangedCombat(getState())) {
      options.push({ text: "远程作战", action: "combat_npc_ranged" });
    } else {
      options.push({ text: "远程作战（不可用：无弹药）", action: "combat_npc_ranged", disabled: true });
    }
    options.push({ text: GAME_CONSTANTS.COMBAT.FLEE_RATE_TEXT, action: "combat_npc_flee" });
    setOptions(options);
    return;
  }
}

/**
 * 处理与 NPC 的战斗
 * @param {Object} npc - NPC 实例数据
 * @param {string} combatMode - 战斗模式：'melee' 或 'ranged'
 */
function handleNpcCombat(npc, combatMode = "melee") {
  const state = getState();
  state._tripped = 0;
  state._frozen = 0;
  state._blindTurns = 0;
  const combatLog = [];
  let round = 0;
  let currentMode = combatMode;

  const isCrippled = state.crash >= GAME_CONSTANTS.CRASH_MAX;
  if (isCrippled) {
    combatLog.push({ round: 0, text: "你过于崩溃导致无法战斗，只能挨打！" });
  }

  if (npc.hasRanged && Math.random() < GAME_CONSTANTS.COMBAT.NPC_RANGED_TRIGGER_RATE) {
    const npcRangedDamage = Math.floor(Math.random() * (GAME_CONSTANTS.COMBAT.NPC_RANGED_OPENING_DAMAGE_MAX - GAME_CONSTANTS.COMBAT.NPC_RANGED_OPENING_DAMAGE_MIN + 1)) + GAME_CONSTANTS.COMBAT.NPC_RANGED_OPENING_DAMAGE_MIN;
    state.health -= npcRangedDamage;
    state.health = Math.max(0, state.health);
    combatLog.push({ round: 0, text: `${npc.name}拔出了远程武器朝你射击，造成${npcRangedDamage}点伤害！` });
  }

  if (!isCrippled && currentMode === "ranged" && state.rangedWeapon) {
    const ammoId = state.rangedWeapon.ammoType;
    const ammo = state.ammo.find(a => a.id === ammoId);
    if (ammo && ammo.count > 0) {
      ammo.count--;
      if (ammo.count <= 0) {
        state.ammo = state.ammo.filter(a => a.id !== ammoId);
      }
      const critRate = state.rangedWeapon.critRate || 0;
      const isCrit = Math.random() < critRate;
      let damage = state.rangedWeapon.damage;
      if (isCrit) {
        damage *= GAME_CONSTANTS.COMBAT.CRIT_MULTIPLIER;
        combatLog.push({ round: 0, text: `💀爆头！你用${state.rangedWeapon.name}命中${npc.name}头部，造成${damage}点伤害！` });
      } else {
        combatLog.push({ round: 0, text: `你用${state.rangedWeapon.name}射击，造成${damage}点伤害。` });
      }
      npc.hp -= damage;
      if (state.liuruyanRescued && Math.random() < GAME_CONSTANTS.COMBAT.LIURUYAN_ASSIST_RATE && npc.hp > 0) {
        npc.hp -= GAME_CONSTANTS.COMBAT.LIURUYAN_ASSIST_DAMAGE;
        combatLog.push({ round: 0, text: `柳如烟从暗处出手相助，造成${GAME_CONSTANTS.COMBAT.LIURUYAN_ASSIST_DAMAGE}点伤害！` });
      }
      if (state.rangedWeapon.ammoType !== "箭矢") {
        state.rangedWeapon.integrity = Math.max(0, state.rangedWeapon.integrity - GAME_CONSTANTS.COMBAT.RANGED_SHOT_INTEGRITY_LOSS);
        if (state.rangedWeapon.integrity <= 0) {
          combatLog.push({ round: 0, text: `${state.rangedWeapon.name}耐久耗尽，彻底损坏了！` });
          state.rangedWeapon = null;
        }
      }
    } else {
      combatLog.push({ round: 0, text: "你已没有子弹，只能近战了。" });
      currentMode = "melee";
    }
  }

  while (npc.hp > 0 && state.health > 0) {
    round++;

    if (currentMode === "ranged") {
      if (!canRangedCombat(state)) {
        combatLog.push({ round, text: "你已没有子弹，只能近战了。" });
        currentMode = "melee";
      } else if (state.rangedWeapon && state.rangedWeapon.integrity <= 0) {
        combatLog.push({ round, text: "你的枪已经坏了，只能近战了。" });
        state.rangedWeapon = null;
        currentMode = "melee";
      }
    }

    if (!isCrippled) {
      const playerDamage = state.meleeWeapon.damage;

      if (Math.random() < (npc.dodgeRate || GAME_CONSTANTS.COMBAT.DEFAULT_NPC_DODGE_RATE)) {
        combatLog.push({ round, text: `${npc.name}闪避了你的攻击！` });
      } else if (currentMode === "ranged" && state.rangedWeapon) {
        const ammoId = state.rangedWeapon.ammoType;
        const ammo = state.ammo.find(a => a.id === ammoId);
        if (ammo && ammo.count > 0) {
          ammo.count--;
          if (ammo.count <= 0) {
            state.ammo = state.ammo.filter(a => a.id !== ammoId);
          }
          const critRate = state.rangedWeapon.critRate || 0;
          const isCrit = Math.random() < critRate;
          let damage = state.rangedWeapon.damage;
          if (isCrit) {
            damage *= GAME_CONSTANTS.COMBAT.CRIT_MULTIPLIER;
            combatLog.push({ round, text: `💀爆头！命中${npc.name}头部，伤害翻倍！造成${damage}点伤害！` });
          } else {
            combatLog.push({ round, text: `你用${state.rangedWeapon.name}射击，造成${damage}点伤害。` });
          }
          npc.hp -= damage;
          if (state.liuruyanRescued && Math.random() < GAME_CONSTANTS.COMBAT.LIURUYAN_ASSIST_RATE && npc.hp > 0) {
            npc.hp -= GAME_CONSTANTS.COMBAT.LIURUYAN_ASSIST_DAMAGE;
            combatLog.push({ round, text: `柳如烟从暗处出手相助，造成${GAME_CONSTANTS.COMBAT.LIURUYAN_ASSIST_DAMAGE}点伤害！` });
          }
          if (state.rangedWeapon.ammoType !== "箭矢") {
            state.rangedWeapon.integrity = Math.max(0, state.rangedWeapon.integrity - GAME_CONSTANTS.COMBAT.RANGED_SHOT_INTEGRITY_LOSS);
            if (state.rangedWeapon.integrity <= 0) {
              combatLog.push({ round, text: `${state.rangedWeapon.name}耐久耗尽，彻底损坏了！` });
              state.rangedWeapon = null;
            }
          }
        }
      } else {
        let comboHits = 0;
        do {
          npc.hp -= playerDamage;
          if (state.liuruyanRescued && Math.random() < GAME_CONSTANTS.COMBAT.LIURUYAN_ASSIST_RATE && npc.hp > 0) {
            npc.hp -= GAME_CONSTANTS.COMBAT.LIURUYAN_ASSIST_DAMAGE;
            combatLog.push({ round, text: `柳如烟从暗处出手相助，造成${GAME_CONSTANTS.COMBAT.LIURUYAN_ASSIST_DAMAGE}点伤害！` });
          }
          state.meleeWeapon.currentDurability = Math.max(0, state.meleeWeapon.currentDurability - 1);
          if (comboHits === 0) {
            combatLog.push({ round, text: `你用${state.meleeWeapon.name}攻击，造成${playerDamage}点伤害。（${npc.name} HP:${Math.max(0, npc.hp)}）` });
          } else {
            combatLog.push({ round, text: `连击！追加攻击！造成${playerDamage}点伤害！（${comboHits}连击）（${npc.name} HP:${Math.max(0, npc.hp)}）` });
          }
          if (state.meleeWeapon.currentDurability <= 0 && state.meleeWeapon.id !== DEFAULT_ITEM_IDS.melee) {
            combatLog.push({ round, text: `${state.meleeWeapon.name}耐久耗尽，彻底损坏了！` });
            const fist = MELEE_WEAPONS.find(w => w.id === DEFAULT_ITEM_IDS.melee);
            state.meleeWeapon = { ...fist, currentDurability: fist.durability };
            break;
          }
          comboHits++;
        } while (npc.hp > 0 && Math.random() < (state.meleeWeapon.comboRate || 0));
      }
    } else {
      combatLog.push({ round, text: "你精神崩溃，无力还手……" });
    }

    if (npc.hp <= 0) break;

    let playerDodged = false;
    if (currentMode === "ranged" && Math.random() < GAME_CONSTANTS.COMBAT.RANGED_DODGE_RATE) {
      playerDodged = true;
      combatLog.push({ round, text: "你拿着枪保持距离，闪避了攻击！" });
    }

    if (!playerDodged) {
      const npcDamage = npc.damage;
      state.health -= npcDamage;
      state.health = Math.max(0, state.health);
      combatLog.push({ round, text: `${npc.name}对你造成了${npcDamage}点伤害。` });
    }
  }

  if (npc.hp <= 0) {
    combatLog.push({ round: "胜利", text: `你击败了${npc.name}！` });
    state._combatNpcDefeated = true;

    const isBoss = BOSS_NAMES.includes(npc.name);
    if (isBoss) {
      const bossState = getState();
      if (!bossState.unlockedAchievements) bossState.unlockedAchievements = [];
      if (!bossState.unlockedAchievements.includes("boss_killer")) bossState.unlockedAchievements.push("boss_killer");
    }

    if (state._maSanQuest4Combat) {
      delete state._maSanQuest4Combat;
      state.maSanQuest4Done = true;
      triggerEnding("ending_food");
      return;
    } else if (npc.name === "马三") {
      state.outlawKilled = true;
      state.stats.bossesDefeated.push("马三");
      const outlawDrop = FIXED_LOOT_DROPS.outlaw_kill;
      const outlawWeapon = RANGED_WEAPONS.find(w => w.id === outlawDrop.weaponId);
      const addedAk = addItem({ ...outlawWeapon });
      const outlawAmmo = AMMO.find(a => a.id === outlawDrop.ammoId);
      const addedAmmo = addItem({ id: outlawAmmo.id, name: outlawAmmo.name, type: "ammo", count: outlawDrop.ammoCount });
      if (addedAk && addedAmmo) {
        combatLog.push({ round: "胜利", text: `马三身上掉落：${outlawWeapon.name}×1、${outlawAmmo.name}×${outlawDrop.ammoCount}` });
      } else {
        combatLog.push({ round: "胜利", text: "马三身上掉落了一些装备，但你的背包空间不足，部分物品无法携带。" });
      }
    } else if (npc.name === "黑影") {
      state.stats.bossesDefeated.push("黑影");
      const shadowDrop = FIXED_LOOT_DROPS.shadow_kill;
      const shadowWeapon = RANGED_WEAPONS.find(w => w.id === shadowDrop.weaponId);
      const addedGun = addItem({ ...shadowWeapon });
      const shadowAmmo = AMMO.find(a => a.id === shadowDrop.ammoId);
      const addedAmmo2 = addItem({ id: shadowAmmo.id, name: shadowAmmo.name, type: "ammo", count: shadowDrop.ammoCount });
      if (addedGun && addedAmmo2) {
        combatLog.push({ round: "胜利", text: `黑影身上掉落：${shadowWeapon.name}×1、${shadowAmmo.name}×${shadowDrop.ammoCount}` });
      } else {
        combatLog.push({ round: "胜利", text: "黑影身上掉落了一些装备，但你的背包空间不足，部分物品无法携带。" });
      }
    } else if (npc.name === "沉默的丧尸之王") {
      state.zombieKingDefeated = true;
      state.stats.bossesDefeated.push("沉默的丧尸之王");
      state.other.push({ ...SPECIAL_ITEMS.silence_badge });
      combatLog.push({ round: "胜利", text: "你击败了丧尸巢穴的真正主人！它的身躯轰然倒地，整个巢穴都为之震动。你在这场史无前例的战斗中活了下来，这将是末日后值得铭记的一刻。" });
      combatLog.push({ round: "胜利", text: "你击败了尸王·寂灭！在它的残骸中，你发现了一枚刻着古老符文的徽章——【寂灭徽章】。这是一份荣誉的象征。" });
    } else if (npc.name === "银行行长") {
      state.castleDebt = null;
      state.castleDebtTriggered = false;
      state.bankerKilled = true;
      const drop = FIXED_LOOT_DROPS.banker_kill;
      const dropWeapon = drop.type === "ranged"
        ? RANGED_WEAPONS.find(w => w.id === drop.weaponId)
        : MELEE_WEAPONS.find(w => w.id === drop.weaponId);
      if (dropWeapon) {
        const dropItem = drop.type === "melee"
          ? { ...dropWeapon, currentDurability: dropWeapon.durability }
          : { ...dropWeapon };
        const added = addItem(dropItem);
        if (added) {
          combatLog.push({ round: "胜利", text: `行长倒地不起，债务一笔勾销！你从他桌上拿走了一把${dropWeapon.name}。` });
        } else {
          combatLog.push({ round: "胜利", text: `行长倒地不起，债务一笔勾销！但背包已满，无法拿走${dropWeapon.name}。` });
        }
      }
    } else if (state._liuruyanQuest2Combat) {
      delete state._liuruyanQuest2Combat;
      state.liuruyanQuest2Done = true;
      const logText = combatLog.map(entry => typeof entry.round === "number" ? `[第${entry.round}回合] ${entry.text}` : entry.text).join("\n");
      setStory(logText + "\n\n---\n\n" + MAP_NPC_INTROS.liuruyan_quest2_victory);
      advanceTime(1);
      updateStatusEffects();
      checkDeath();
      showExploreOptionsState();
      return;
    } else if (state._divingZombieCombat) {
      delete state._divingZombieCombat;
      state.yumoDivingKills++;
      if (state.yumoDivingKills >= GAME_CONSTANTS.YUMO.QUEST3_DIVING_KILLS) {
        state.npcQuestsDone.yumoQuest3 = true;
      }
      const progress = `已击杀${state.yumoDivingKills}/${GAME_CONSTANTS.YUMO.QUEST3_DIVING_KILLS}只潜水丧尸。`;
      const questDone = state.yumoDivingKills >= GAME_CONSTANTS.YUMO.QUEST3_DIVING_KILLS ? "\n你已经完成了清理登陆丧尸的任务！" : "";
      combatLog.push({ round: "胜利", text: progress });
      advanceTime(1);
      updateStatusEffects();
      checkDeath();
      if (!state.gameOver) {
        const logText = combatLog.map(entry => typeof entry.round === "number" ? `[第${entry.round}回合] ${entry.text}` : entry.text).join("\n");
        setStory(logText + "\n\n---\n\n" + `你击败了潜水丧尸！\n${progress}${questDone}`);
        refreshIslandMenu();
      }
      return;
    } else if (state._pendingNpc && state._pendingNpc.name && state._pendingNpc.name.includes("傀儡")) {
      state.giantPuppetDefeated = true;
      delete state._pendingNpc;
      advanceTime(1);
      updateStatusEffects();
      checkDeath();
      if (!state.gameOver) {
        const logText = combatLog.map(entry => typeof entry.round === "number" ? `[第${entry.round}回合] ${entry.text}` : entry.text).join("\n");
        setStory(logText + "\n\n---\n\n" + "巨型丧尸傀儡轰然倒塌，金属框架扭曲变形，暗红色的管线断裂后喷出最后一股蒸汽。它终于安静了。发射中心的大门向你敞开。");
        showExploreOptionsState();
      }
      return;
    } else if (Math.random() < GAME_CONSTANTS.COMBAT.NPC_LOOT_DROP_RATE) {
      const loot = generateNpcLoot();
      const droppedItems = [];
      for (const item of loot) {
        const added = addItem(item);
        if (added) droppedItems.push(getItemDisplayName(item));
      }
      if (droppedItems.length > 0) {
        combatLog.push({ round: "胜利", text: `${npc.name}身上掉落：${droppedItems.join("、")}` });
      }
      if (droppedItems.length < loot.length) {
        combatLog.push({ round: "胜利", text: "背包已满，部分物品无法携带。" });
      }
    }

    if (state.nurseZombieRescued) {
      state.health = Math.min(GAME_CONSTANTS.MAX_HEALTH, state.health + GAME_CONSTANTS.COMBAT.NURSE_HEAL_AFTER_COMBAT);
      combatLog.push({ round: "胜利", text: `露露薇为你简单进行了伤口清理，健康恢复了${GAME_CONSTANTS.COMBAT.NURSE_HEAL_AFTER_COMBAT}。` });
    }

    if (npc.type === "wanderingTrader") {
      const cigCount = Math.floor(Math.random() * (GAME_CONSTANTS.COMBAT.TRADER_CIG_DROP_MAX - GAME_CONSTANTS.COMBAT.TRADER_CIG_DROP_MIN + 1)) + GAME_CONSTANTS.COMBAT.TRADER_CIG_DROP_MIN;
      addCigarettes(cigCount);
      combatLog.push({ round: "胜利", text: `${npc.name}身上掉落了${cigCount}根香烟` });
    }
  }

  if (state.health <= 0) {
    combatLog.push({ round: "败北", text: `你被${npc.name}杀死了……` });
    if (state._maSanQuest4Combat) {
      delete state._maSanQuest4Combat;
    }
  }

  const logText = combatLog.map(entry => {
    if (typeof entry.round === "number") {
      return `[第${entry.round}回合] ${entry.text}`;
    }
    return entry.text;
  }).join("\n");

  setStory((state.story || "") + "\n\n--- 战斗记录 ---\n" + logText);

  advanceTime(1);
  updateStatusEffects();
  checkDeath();

  if (!state.gameOver) {
    if (checkLeaderAssassinationVictory()) {
      return;
    }
    if (state.currentMap) {
      showExploreOptionsState();
    } else {
      showHomeOptions();
    }
  }
}

/**
 * 触发黑市商人遭遇事件
 */
function handleWanderingTraderEncounter() {
  setStory("一个背着大包小包的黑市商人出现在你面前。他咧嘴一笑：\"嘿，想不想做点买卖？我这儿什么都有！\"");
  setPhase("trader_interact");
  setOptions([
    { text: "香烟换子弹", action: "trader_ammo" },
    { text: "购买武器", action: "trader_weapon" },
    { text: "换随机消耗品（1根香烟）", action: "trader_consumable" },
    { text: "背刺（偷袭黑市商人）", action: "trader_backstab" },
    { text: "离开", action: "trader_leave" }
  ]);
}

/**
 * 处理黑市商人交互界面的选择
 * @param {number} input - 玩家输入的选项编号
 */
function handleWanderingTraderAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const action = state.options[optionIndex].action;

  if (action === "trader_leave") {
    setStory("你告别了黑市商人，继续你的旅途。");
    showExploreOptionsState();
    return;
  }

  if (action === "trader_backstab") {
    const trader = createNpcInstance('wanderingTrader');
    state._pendingNpc = trader;
    setPhase("pre_combat_npc");
    const meleeName = state.meleeWeapon.name;
    const rangedName = state.rangedWeapon ? state.rangedWeapon.name : "无";
    const ammoInfo = getRangedAmmoInfo(state);
    const crashWarning = state.crash >= GAME_CONSTANTS.CRASH_MAX ? "\n\n⚠ 你的精神状态极差，无法正常战斗！建议先恢复精神再探索。" : "";
    setStory(`你决定铤而走险，偷袭这个黑市商人！但他显然早有防备……\n\n【近战】${meleeName}\n【远程】${rangedName} ${ammoInfo}${crashWarning}`);
    const options = [
      { text: "近战作战", action: "combat_npc_melee" }
    ];
    if (canRangedCombat(state)) {
      options.push({ text: "远程作战", action: "combat_npc_ranged" });
    } else {
      options.push({ text: "远程作战（不可用：无弹药）", action: "combat_npc_ranged", disabled: true });
    }
    options.push({ text: GAME_CONSTANTS.COMBAT.FLEE_RATE_TEXT, action: "combat_npc_flee" });
    setOptions(options);
    return;
  }

  if (action === "trader_ammo") {
    if (state.cigarettes === 0) {
      setStory("黑市商人瞥了你一眼：\"你没香烟还想换子弹？去去去！\"");
      showExploreOptionsState();
      return;
    }
    setPhase("trader_buy_ammo");
    setStory(`黑市商人掏出一个弹药箱：\"说吧，要什么子弹？每根香烟换${GAME_CONSTANTS.TRADING.AMMO_PER_CIG_MIN}~${GAME_CONSTANTS.TRADING.AMMO_PER_CIG_MAX}发。\"\n你有${state.cigarettes}根香烟。`);
    const ammoOptions = AMMO.map((a, i) => ({
      text: `${a.name}（每根香烟换${GAME_CONSTANTS.TRADING.AMMO_PER_CIG_MIN}~${GAME_CONSTANTS.TRADING.AMMO_PER_CIG_MAX}发）`,
      action: "buy_ammo",
      index: i
    }));
    ammoOptions.push({ text: "返回", action: "trader_back", index: -1 });
    setOptions(ammoOptions);
    return;
  }

  if (action === "trader_weapon") {
    if (state.cigarettes === 0) {
      setStory("黑市商人摇摇头：\"一根香烟都没有，我可不会白送武器。\"");
      showExploreOptionsState();
      return;
    }
    setPhase("trader_buy_weapon");
    setStory(`黑市商人拍了拍他的货箱：\"武器可不便宜，远程更贵！\"\n你有${state.cigarettes}根香烟。`);
    const weaponOptions = TRADER_WEAPON_SHOP.map((item, i) => {
      const typeLabel = item.type === "ranged" ? "远程" : "近战";
      const weapon = item.type === "ranged"
        ? RANGED_WEAPONS.find(w => w.id === item.weaponId)
        : MELEE_WEAPONS.find(w => w.id === item.weaponId);
      const weaponName = weapon ? weapon.name : item.weaponId;
      return { text: `${weaponName}（${typeLabel} ${item.costMin}~${item.costMax}根香烟）`, action: `buy_weapon_${i}`, index: i };
    });
    weaponOptions.push({ text: "返回", action: "trader_back", index: -1 });
    setOptions(weaponOptions);
    return;
  }

  if (action === "trader_consumable") {
    if (state.cigarettes === 0) {
      setStory("黑市商人摆摆手：\"没香烟？那就别浪费我时间。\"");
      showExploreOptionsState();
      return;
    }
    const consumableRoll = Math.random();
    let consumableItem;
    if (consumableRoll < 0.25) {
      consumableItem = { ...FOODS[Math.floor(Math.random() * FOODS.length)] };
    } else if (consumableRoll < 0.5) {
      consumableItem = { ...DRINKS[Math.floor(Math.random() * DRINKS.length)] };
    } else if (consumableRoll < 0.75) {
      consumableItem = { ...FRUITS[Math.floor(Math.random() * FRUITS.length)] };
    } else {
      consumableItem = { ...SEEDS[Math.floor(Math.random() * SEEDS.length)] };
    }
    removeCigarettes(1);
    const added = addItem(consumableItem);
    if (added) {
      setStory(`黑市商人用${consumableItem.name}换走了你一根香烟。`);
    } else {
      addCigarettes(1);
      setStory(`背包已满，交易失败。黑市商人把香烟还给了你。`);
    }
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    showExploreOptionsState();
    return;
  }
}

/**
 * 处理黑市商人购买弹药的选择
 * @param {number} input - 玩家输入的选项编号
 */
function handleTraderBuyAmmo(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const option = state.options[optionIndex];

  if (option.action === "trader_back") {
    handleWanderingTraderEncounter();
    return;
  }

  if (option.action === "buy_ammo") {
    const ammo = AMMO[option.index];
    if (!ammo || state.cigarettes === 0) {
      setStory("你没有任何香烟，无法兑换弹药。");
      showExploreOptionsState();
      return;
    }
    setPhase("trader_ammo_qty");
    setStory(`选择用多少香烟兑换${ammo.name}？（1根香烟=随机${GAME_CONSTANTS.TRADING.AMMO_PER_CIG_MIN}~${GAME_CONSTANTS.TRADING.AMMO_PER_CIG_MAX}发）\n当前香烟：${state.cigarettes}根`);
    const qtyOptions = [];
    const amounts = [1, 5, 10];
    for (const amt of amounts) {
      if (amt <= state.cigarettes) {
        qtyOptions.push({ text: `用${amt}根香烟兑换`, action: "confirm_ammo_qty", ammoIndex: option.index, qty: amt });
      }
    }
    if (state.cigarettes > 10) {
      qtyOptions.push({ text: `用全部${state.cigarettes}根香烟兑换`, action: "confirm_ammo_qty", ammoIndex: option.index, qty: state.cigarettes });
    }
    qtyOptions.push({ text: "返回", action: "trader_back" });
    setOptions(qtyOptions);
    return;
  }

  if (option.action === "confirm_ammo_qty") {
    const ammo = AMMO[option.ammoIndex];
    const qty = option.qty;
    if (!ammo || qty <= 0 || state.cigarettes < qty) {
      setStory("香烟不足，无法兑换。");
      showExploreOptionsState();
      return;
    }
    const perCig = Math.floor(Math.random() * (GAME_CONSTANTS.TRADING.AMMO_PER_CIG_MAX - GAME_CONSTANTS.TRADING.AMMO_PER_CIG_MIN + 1)) + GAME_CONSTANTS.TRADING.AMMO_PER_CIG_MIN;
    const totalAmmo = qty * perCig;
    removeCigarettes(qty);
    const added = addItem({ id: ammo.id, name: ammo.name, type: "ammo", count: totalAmmo });
    if (!added) {
      addCigarettes(qty);
      setStory("你的背包已满，无法装下更多弹药。");
      showExploreOptionsState();
      return;
    }
    setStory(`交易成功！你用${qty}根香烟换来了${totalAmmo}发${ammo.name}（每根${perCig}发）。`);
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    showExploreOptionsState();
  }
}

/**
 * 处理黑市商人购买武器的选择
 * @param {number} input - 玩家输入的选项编号
 */
function handleTraderBuyWeapon(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const option = state.options[optionIndex];

  if (option.action === "trader_back") {
    handleWanderingTraderEncounter();
    return;
  }

  if (state.cigarettes === 0) {
    setStory("黑市商人瞪了你一眼：\"没香烟凑什么热闹？\"");
    showExploreOptionsState();
    return;
  }

  const shopMatch = option.action.match(/^buy_weapon_(\d+)$/);
  if (!shopMatch) return;
  const shopIndex = parseInt(shopMatch[1]);
  const shopItem = TRADER_WEAPON_SHOP[shopIndex];
  if (!shopItem) return;

  const weaponDef = shopItem.type === "ranged"
    ? RANGED_WEAPONS.find(w => w.id === shopItem.weaponId)
    : MELEE_WEAPONS.find(w => w.id === shopItem.weaponId);
  const costMin = shopItem.costMin;
  const costMax = shopItem.costMax;
  const costLabel = shopItem.type === "ranged" ? "远程" : "近战";

  if (!weaponDef) return;

  const cost = Math.floor(Math.random() * (costMax - costMin + 1)) + costMin;

  if (state.cigarettes < cost) {
    setStory(`黑市商人摇摇头：\"这${costLabel}武器要${cost}根香烟，你只有${state.cigarettes}根，不够啊。\"`);
    showExploreOptionsState();
    return;
  }

  removeCigarettes(cost);
  const weaponItem = weaponDef.type === "melee"
    ? { ...weaponDef, currentDurability: weaponDef.durability }
    : { ...weaponDef };

  const added = addItem(weaponItem);
  if (!added) {
    addCigarettes(cost);
    setStory("背包已满，交易失败。黑市商人把香烟还给了你。");
  } else {
    setStory(`交易成功！你用${cost}根香烟买下了一把${weaponDef.name}。黑市商人吹了个口哨。`);
  }

  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  showExploreOptionsState();
}

/**
 * 触发末日医生遭遇事件
 */
function handleDoctorEncounter() {
  setStory(`一个穿着白大褂、戴着口罩的中年人正在角落里整理医药箱。看到你走近，他平静地说："我是末日医生。给我${GAME_CONSTANTS.DOCTOR.TREATMENT_ITEM_COST}份物资，我可以治疗你。"`);
  setPhase("doctor_interact");
  setOptions([
    { text: `用${GAME_CONSTANTS.DOCTOR.TREATMENT_ITEM_COST}份食物治疗`, action: "doctor_food" },
    { text: `用${GAME_CONSTANTS.DOCTOR.TREATMENT_ITEM_COST}份饮品治疗`, action: "doctor_drink" },
    { text: `用${GAME_CONSTANTS.DOCTOR.TREATMENT_ITEM_COST}份水果治疗`, action: "doctor_fruit" },
    { text: `心理治疗（${GAME_CONSTANTS.DOCTOR.PSYCHOLOGY_FOOD_COST}食物，崩溃-${GAME_CONSTANTS.DOCTOR.PSYCHOLOGY_CRASH_REDUCTION}）`, action: "doctor_psychology" },
    { text: "背刺（偷袭医生）", action: "doctor_backstab" },
    { text: "离开", action: "doctor_leave" }
  ]);
}

/**
 * 处理末日医生交互界面的选择
 * @param {number} input - 玩家输入的选项编号
 */
function handleDoctorAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const action = state.options[optionIndex].action;

  if (action === "doctor_leave") {
    setStory("你谢过医生，继续上路了。");
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    showExploreOptionsState();
    return;
  }

  if (action === "doctor_psychology") {
    const foodItems1 = state.food;
    const foodCount = foodItems1.reduce((sum, f) => sum + (f.count || 1), 0);
    if (foodCount < GAME_CONSTANTS.DOCTOR.PSYCHOLOGY_FOOD_COST) {
      setStory(`你的食物不够，心理治疗需要${GAME_CONSTANTS.DOCTOR.PSYCHOLOGY_FOOD_COST}份食物。`);
      handleDoctorEncounter();
      return;
    }
    let remaining = GAME_CONSTANTS.DOCTOR.PSYCHOLOGY_FOOD_COST;
    for (let i = state.food.length - 1; i >= 0 && remaining > 0; i--) {
      const available = state.food[i].count || 1;
      if (available <= remaining) {
        state.food.splice(i, 1);
        remaining -= available;
      } else {
        state.food[i].count = available - remaining;
        remaining = 0;
      }
    }
    state.crash = Math.max(0, (state.crash || 0) - GAME_CONSTANTS.DOCTOR.PSYCHOLOGY_CRASH_REDUCTION);
    setStory(`末世游医给你进行了一段简短的心理疏导……你感觉心里好受了一些。崩溃-${GAME_CONSTANTS.DOCTOR.PSYCHOLOGY_CRASH_REDUCTION}。`);
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    showExploreOptionsState();
    return;
  }

  if (action === "doctor_backstab") {
    setStory("你握紧了武器，但转念一想——在这个末世，医生太宝贵了。医生对你有用，所以你收起了心思。");
    setPhase("doctor_interact");
    setOptions([
      { text: `用${GAME_CONSTANTS.DOCTOR.TREATMENT_ITEM_COST}份食物治疗`, action: "doctor_food" },
      { text: `用${GAME_CONSTANTS.DOCTOR.TREATMENT_ITEM_COST}份饮品治疗`, action: "doctor_drink" },
      { text: `用${GAME_CONSTANTS.DOCTOR.TREATMENT_ITEM_COST}份水果治疗`, action: "doctor_fruit" },
      { text: "离开", action: "doctor_leave" }
    ]);
    return;
  }

  const typeMap = {
    doctor_food: { type: "food", label: "食物", arr: state.food },
    doctor_drink: { type: "drinks", label: "饮品", arr: state.drinks },
    doctor_fruit: { type: "food", label: "水果", arr: state.food.filter(i => i.type === "fruit") },
  };

  const info = typeMap[action];
  if (!info) return;

  if (action === "doctor_fruit") {
    const fruitCount = state.food.filter(i => i.type === "fruit").reduce((sum, i) => sum + (i.count || 1), 0);
    if (fruitCount < GAME_CONSTANTS.DOCTOR.TREATMENT_ITEM_COST) {
      setStory(`医生摇摇头：\"你只有${fruitCount}份水果，我需要${GAME_CONSTANTS.DOCTOR.TREATMENT_ITEM_COST}份。去多找些水果再来。\"`);
      advanceTime(1);
      updateStatusEffects();
      checkDeath();
      showExploreOptionsState();
      return;
    }
    let remaining = GAME_CONSTANTS.DOCTOR.TREATMENT_ITEM_COST;
    for (let i = state.food.length - 1; i >= 0 && remaining > 0; i--) {
      if (state.food[i].type === "fruit") {
        const available = state.food[i].count || 1;
        if (available <= remaining) {
          state.food.splice(i, 1);
          remaining -= available;
        } else {
          state.food[i].count = available - remaining;
          remaining = 0;
        }
      }
    }
  } else {
    const itemCount = info.arr.reduce((sum, i) => sum + (i.count || 1), 0);
    if (itemCount < GAME_CONSTANTS.DOCTOR.TREATMENT_ITEM_COST) {
      setStory(`医生摇摇头：\"你只有${itemCount}份${info.label}，我需要${GAME_CONSTANTS.DOCTOR.TREATMENT_ITEM_COST}份。\"`);
      advanceTime(1);
      updateStatusEffects();
      checkDeath();
      showExploreOptionsState();
      return;
    }
    let remaining = GAME_CONSTANTS.DOCTOR.TREATMENT_ITEM_COST;
    for (let i = info.arr.length - 1; i >= 0 && remaining > 0; i--) {
      const available = info.arr[i].count || 1;
      if (available <= remaining) {
        info.arr.splice(i, 1);
        remaining -= available;
      } else {
        info.arr[i].count = available - remaining;
        remaining = 0;
      }
    }
  }

  state.health = Math.min(GAME_CONSTANTS.MAX_HEALTH, state.health + GAME_CONSTANTS.DOCTOR.HEAL_AMOUNT);
  setStory(`医生仔细地处理了你的伤口。你感觉好多了！（恢复了${GAME_CONSTANTS.DOCTOR.HEAL_AMOUNT}点生命值）`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  showExploreOptionsState();
}

export {
  getRangedAmmoInfo,
  canRangedCombat,
  handlePreCombatChoice,
  handleCombat,
  handleSurvivorEncounter,
  handleBanditEncounter,
  handlePreCombatNpcChoice,
  handleSurvivorAction,
  handleNpcCombat,
  handleWanderingTraderEncounter,
  handleWanderingTraderAction,
  handleTraderBuyAmmo,
  handleTraderBuyWeapon,
  handleDoctorEncounter,
  handleDoctorAction,
};
