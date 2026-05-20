import {
  getState,
  advanceTime,
  updateStatusEffects,
  checkDeath,
  setPhase,
  setStory,
  setOptions,
  addItem,
} from '../state.js';

import {
  GAME_CONSTANTS,
  RANGED_WEAPONS,
  AMMO,
  FIXED_LOOT_DROPS,
  getRandomZombie,
  pickRandomLoot,
} from '../config.js';

import { showHomeOptions, showExploreOptionsState } from '../routing.js';

import {
  getRangedAmmoInfo,
  canRangedCombat,
  handleSurvivorEncounter,
  handleBanditEncounter,
  handleWanderingTraderEncounter,
  handleDoctorEncounter,
} from '../combat.js';

import {
  handleOutpostExplore,
  handleBegSupplies,
  handleWork,
  handleNpcLeader,
  showLeaderOptions,
  handleLeaderChat,
  handleLeaderGift,
  handleLeaderJoin,
  handleLeaderQuit,
  handleLeaderClaim,
  handleLeaderDoGift,
  handleLeaderHonor,
  handleLeaderAssassinate,
  handleAssassinateFleeCombat,
  handleLeaderRecorder,
  handleLeaderQuest2,
  handleLeaderQuest3,
  showOutpostOptions,
} from '../outpost/index.js';

import {
  handleClimbTower,
  handleTombstone,
  handleTombstoneLook,
  handleTombstoneDig,
  handlePickFruit,
  handleExploreCave,
  handleLootCorpse,
  handleRestaurantEat,
  handleRestaurantConsume,
  handleRestaurantLeave,
  handleOutlawInteract,
  handleOutlawChat,
  handleOutlawFoodChat,
  handleOutlawFoodAccept,
  handleOutlawFoodRefuse,
  handleOutlawFight,
  handleOutlawLeave,
  handleSearchFoodLocker,
  handleMechanicInteract,
  handleMechanicChat,
  handleMechanicTrade,
  handleMechanicTradeConfirm,
  handleMechanicLeave,
  handleWolfInteract,
  handleWolfChat,
  handleWolfLeave,
  handleWolfTrade,
  handleExploreFactory,
  handleViewRiver,
  handleMaskedManInteract,
  handleMaskedManFight,
  handleMaskedManLeave,
  handleWarehouseGuardInteract,
  handleWarehouseGuardChat,
  handleWarehouseGuardLeave,
  handleWarehouseGuardTrade,
  handleWarehouseGuardTradeConfirm,
  handleNurseZombieInteract,
  handleNurseZombieFeedSelect,
  handleNurseZombieBringHome,
  handleNurseZombieLeave,
  handlePoliceRaid,
  handleVeteranInteract,
  handleVeteranChat,
  handleVeteranLeave,
  handleVeteranAmmo,
  handleExploreTunnel,
  handleDoctorInteract,
  handleDoctorTrade,
  handleDoctorChat,
  handleDoctorLeave,
  handleZombieKingInteract,
  handleInfectedWoman,
  handleInjectWoman,
  handleIgnoreWoman,
  handleKillZombieWoman,
  handleLaunchCenter,
  handleLaunchCenterLeave,
  handleRepairRocket,
  handleRocketEndingSpace,
  handleRocketEndingHope,
  handleRocketEndingStay,
  handleDoctorRocketConsult,
  handleDoctorQuest1Accept,
  handleDoctorQuest1Reject,
  handleDoctorQuest1Submit,
  handleDoctorQuest2Submit,
  handleDoctorQuest3Submit,
  handleDoctorRocketStatus,
  handleDoctorHarvestSerum,
  handleEnergyWell,
  handleMoldySeeds,
  handleAbandonedField,
  handleStinkyTent,
  handleStinkyTentEnter,
  handleStinkyTentSearch,
  handleLiuruyanClassroom,
  handleLiuruyanSeat,
  handleLiuruyanReject,
  handleLiuruyanQuestAccept,
  handleLiuruyanQuestReject,
  handleLiuruyanQuestFight,
  handleMechanicGasTrade,
  handleMechanicGasConfirm,
  handleYacht,
} from '../maps.js';

import {
  handleCastleOutpost,
  handleCastleExploreBlocked,
  handleCastleGuard,
  handleCastleBank,
  handleCastleIdentity,
  handleCastleWork,
  handleLeaveCastle,
  handleGuardChat,
  handleGuardEnter,
  handleGuardBribe,
  handleGuardLeave,
  handleCastleInteriorExplore,
  handleLeaveCastleInterior,
  handleCastleKing,
  handleCastleQueen,
  handleCastleBanquet,
  handleCastleBall,
  handleCastleRoom,
  handleIdentityApply,
  handleIdentityCancel,
  handleBankLoan,
  handleBankRepay,
  handleBankBanker,
  handleBankerMercy,
  handleBankerFight,
  handleBankerWaiver,
  handleWaiver30,
  handleWaiver50,
  handleWaiver100,
} from '../castle/index.js';

import { handleEatSelect, handleDrinkSelect, handleMedicineSelect } from './consumables.js';
import { handleGoHome } from './navigation.js';
import { handleEquipSelect, handleDiscardSelect, handleDiscardQuantityAction } from '../equipment.js';
import { handleNpcInteract } from '../npcs/index.js';

import {
  showMumiaoOptions,
  handleMumiaoAction,
} from '../npcs/mumiao.js';

export function handleExplore() {
  const state = getState();
  const map = state.currentMap;
  if (!map) {
    setStory("你不在任何地图中，无法探索。");
    showHomeOptions();
    return;
  }

  if (Math.random() < GAME_CONSTANTS.ENCOUNTER.NPC_RATE) {
    const npcRoll = Math.random();
    const dist = GAME_CONSTANTS.ENCOUNTER.NPC_DISTRIBUTION;
    let npcType;
    let cumulative = 0;
    for (const [type, prob] of Object.entries(dist)) {
      cumulative += prob;
      if (npcRoll < cumulative) {
        npcType = type;
        break;
      }
    }
    if (!npcType) npcType = 'bandit';
    switch (npcType) {
      case 'survivor':
        handleSurvivorEncounter();
        break;
      case 'wanderingTrader':
        handleWanderingTraderEncounter();
        break;
      case 'doctor':
        handleDoctorEncounter();
        break;
      case 'bandit':
        handleBanditEncounter();
        break;
    }
    advanceTime(1);
    const wasFoggy1 = getState().weather === "大雾";
    if (wasFoggy1) advanceTime(1);
    updateStatusEffects();
    checkDeath();
    return;
  }

  if (Math.random() < map.encounterRate) {
    const zombieDef = getRandomZombie(map);
    setPhase("pre_combat");
    state._pendingZombie = zombieDef;
    const meleeName = state.meleeWeapon.name;
    const rangedName = state.rangedWeapon ? state.rangedWeapon.name : "无";
    const ammoInfo = getRangedAmmoInfo(state);
    const crashWarning = state.crash >= GAME_CONSTANTS.CRASH_MAX ? "\n\n⚠ 你的精神状态极差，无法正常战斗！建议先恢复精神再探索。" : "";
    setStory(`你遭遇了${zombieDef.name}（HP:${zombieDef.hp} 伤害:${zombieDef.damage}）！\n\n【近战】${meleeName}\n【远程】${rangedName} ${ammoInfo}${crashWarning}`);
    const options = [
      { text: "近战作战", action: "combat_melee" }
    ];
    if (canRangedCombat(state)) {
      options.push({ text: "远程作战", action: "combat_ranged" });
    } else {
      options.push({ text: "远程作战（不可用：无弹药）", action: "combat_ranged", disabled: true });
    }
    options.push({ text: GAME_CONSTANTS.COMBAT.FLEE_RATE_TEXT, action: "combat_flee" });
    setOptions(options);
    return;
  }

  if (map.id === "绝密航天基地" && !state._spaceCrateLooted && Math.random() < GAME_CONSTANTS.MAP_EVENTS.SPACE_CRATE_RATE) {
    state._spaceCrateLooted = true;
    const spaceDrop = FIXED_LOOT_DROPS.space_crate;
    if (!spaceDrop) {
      setStory("你在航天基地深处探索时，发现了一艘坠毁的太空舱，但里面已经空无一物。");
      advanceTime(1);
      updateStatusEffects();
      checkDeath();
      if (!state.gameOver) showExploreOptionsState();
      return;
    }
    const spaceWeapon = RANGED_WEAPONS.find(w => w.id === spaceDrop.weaponId);
    const spaceAmmo = AMMO.find(a => a.id === spaceDrop.ammoId);
    const addedWeapon = spaceWeapon ? addItem({ ...spaceWeapon }) : false;
    const addedAmmo = spaceAmmo ? addItem({ id: spaceAmmo.id, name: spaceAmmo.name, type: "ammo", count: spaceDrop.ammoCount }) : false;
    let msg = `你在航天基地深处探索时，发现了一艘坠毁的太空舱！舱体已经严重变形，但你从残骸中`;
    if (spaceWeapon && spaceAmmo) {
      msg += `找到了惊人的发现——一把${spaceWeapon.name}和${spaceDrop.ammoCount}发${spaceAmmo.name}弹药！`;
    } else if (spaceWeapon) {
      msg += `找到了一把${spaceWeapon.name}！`;
    } else if (spaceAmmo) {
      msg += `找到了${spaceDrop.ammoCount}发${spaceAmmo.name}弹药！`;
    } else {
      msg += "什么都没有找到。";
    }
    if ((addedWeapon && addedAmmo === false) || (addedWeapon === false && addedAmmo)) msg += "\n但背包已满，部分物品无法携带。";
    setStory(msg);
    advanceTime(1);
    const wasFoggy2 = getState().weather === "大雾";
    if (wasFoggy2) advanceTime(1);
    updateStatusEffects();
    checkDeath();
    if (!state.gameOver) showExploreOptionsState();
    return;
  }

  {
    const loot = pickRandomLoot(map);
    if (!loot) {
      setStory("你仔细搜索了一番，什么也没找到。");
    } else {
      const added = addItem(loot);
      if (!added) {
        setStory(`你发现了${loot.name}，但背包已满，无法携带。`);
      } else {
        setStory(`你发现了${loot.name}！`);
      }
    }
  }

  advanceTime(1);
  const wasFoggy2 = getState().weather === "大雾";
  if (wasFoggy2) advanceTime(1);
  updateStatusEffects();
  checkDeath();

  if (!state.gameOver) {
    showExploreOptionsState();
  }
}

export function handleExploreAction(input) {
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= getState().options.length) {
    return;
  }

  const action = getState().options[optionIndex].action;

  switch (action) {
    case "explore":
      handleExplore();
      break;
    case "outpost_explore":
      handleOutpostExplore();
      break;
    case "eat":
      handleEatSelect();
      break;
    case "drink":
      handleDrinkSelect();
      break;
    case "medicine":
      handleMedicineSelect();
      break;
    case "equip":
      handleEquipSelect();
      break;
    case "goHome":
      handleGoHome();
      break;
    case "discard":
      handleDiscardSelect();
      break;
    case "npc_v":
      handleNpcInteract("v");
      break;
    case "npc_xiaohan":
      handleNpcInteract("xiaohan");
      break;
    case "npc_lili":
      handleNpcInteract("lili");
      break;
    case "npc_mumiao":
      handleNpcInteract("mumiao");
      break;
    case "beg_supplies":
      handleBegSupplies();
      break;
    case "work":
      handleWork();
      break;
    case "climb_tower":
      handleClimbTower();
      break;
    case "tombstone":
      handleTombstone();
      break;
    case "tombstone_look":
      handleTombstoneLook();
      break;
    case "tombstone_dig":
      handleTombstoneDig();
      break;
    case "tombstone_leave":
      showExploreOptionsState();
      break;
    case "pick_fruit":
      handlePickFruit();
      break;
    case "explore_cave":
      handleExploreCave();
      break;
    case "moldy_seeds":
      handleMoldySeeds();
      break;
    case "abandoned_field":
      handleAbandonedField();
      break;
    case "loot_corpse":
      handleLootCorpse();
      break;
    case "stinky_tent":
      handleStinkyTent();
      break;
    case "stinky_tent_enter":
      handleStinkyTentEnter();
      break;
    case "stinky_tent_search":
      handleStinkyTentSearch();
      break;
    case "stinky_tent_leave":
      showExploreOptionsState();
      break;
    case "restaurant_eat":
      handleRestaurantEat();
      break;
    case "restaurant_consume":
      handleRestaurantConsume();
      break;
    case "restaurant_leave":
      handleRestaurantLeave();
      break;
    case "outlaw_interact":
      handleOutlawInteract();
      break;
    case "outlaw_chat":
      handleOutlawChat();
      break;
    case "outlaw_food_chat":
      handleOutlawFoodChat();
      break;
    case "outlaw_food_accept":
      handleOutlawFoodAccept();
      break;
    case "outlaw_food_refuse":
      handleOutlawFoodRefuse();
      break;
    case "outlaw_fight":
      handleOutlawFight();
      break;
    case "outlaw_leave":
      handleOutlawLeave();
      break;
    case "search_food_locker":
      handleSearchFoodLocker();
      break;
    case "mechanic_interact":
      handleMechanicInteract();
      break;
    case "mechanic_chat":
      handleMechanicChat();
      break;
    case "mechanic_trade":
      handleMechanicTrade();
      break;
    case "mechanic_trade_confirm":
      handleMechanicTradeConfirm();
      break;
    case "mechanic_leave":
      handleMechanicLeave();
      break;
    case "mechanic_gas_trade":
      handleMechanicGasTrade();
      break;
    case "mechanic_gas_confirm":
      handleMechanicGasConfirm();
      break;
    case "liuruyan_classroom":
      handleLiuruyanClassroom();
      break;
    case "liuruyan_seat":
      handleLiuruyanSeat();
      break;
    case "liuruyan_reject":
      handleLiuruyanReject();
      break;
    case "liuruyan_quest_accept":
      handleLiuruyanQuestAccept();
      break;
    case "liuruyan_quest_reject":
      handleLiuruyanQuestReject();
      break;
    case "liuruyan_quest_fight":
      handleLiuruyanQuestFight();
      break;
    case "infected_woman":
      handleInfectedWoman();
      break;
    case "inject_woman":
      handleInjectWoman();
      break;
    case "ignore_woman":
      handleIgnoreWoman();
      break;
    case "kill_zombie_woman":
      handleKillZombieWoman();
      break;
    case "wolf_interact":
      handleWolfInteract();
      break;
    case "wolf_chat":
      handleWolfChat();
      break;
    case "wolf_leave":
      handleWolfLeave();
      break;
    case "wolf_trade":
      handleWolfTrade();
      break;
    case "explore_factory":
      handleExploreFactory();
      break;
    case "view_river":
      handleViewRiver();
      break;
    case "yacht_interact":
      handleYacht();
      break;
    case "masked_man":
      handleMaskedManInteract();
      break;
    case "masked_man_fight":
      handleMaskedManFight();
      break;
    case "masked_man_leave":
      handleMaskedManLeave();
      break;
    case "warehouse_guard_interact":
      handleWarehouseGuardInteract();
      break;
    case "warehouse_guard_chat":
      handleWarehouseGuardChat();
      break;
    case "warehouse_guard_leave":
      handleWarehouseGuardLeave();
      break;
    case "warehouse_guard_trade":
      handleWarehouseGuardTrade();
      break;
    case "warehouse_guard_trade_confirm":
      handleWarehouseGuardTradeConfirm();
      break;
    case "nurse_zombie_interact":
      handleNurseZombieInteract();
      break;
    case "nurse_zombie_feed":
      handleNurseZombieFeedSelect();
      break;
    case "nurse_zombie_bring_home":
      handleNurseZombieBringHome();
      break;
    case "nurse_zombie_leave":
      handleNurseZombieLeave();
      break;
    case "police_raid":
      handlePoliceRaid();
      break;
    case "veteran_interact":
      handleVeteranInteract();
      break;
    case "veteran_chat":
      handleVeteranChat();
      break;
    case "veteran_ammo":
      handleVeteranAmmo();
      break;
    case "veteran_leave":
      handleVeteranLeave();
      break;
    case "explore_tunnel":
      handleExploreTunnel();
      break;
    case "doctor_interact":
      handleDoctorInteract();
      break;
    case "doctor_trade":
      handleDoctorTrade();
      break;
    case "doctor_chat":
      handleDoctorChat();
      break;
    case "doctor_leave":
      handleDoctorLeave();
      break;
    case "zombie_king_interact":
      handleZombieKingInteract();
      break;
    case "castle_explore_blocked":
      handleCastleExploreBlocked();
      break;
    case "castle_guard":
      handleCastleGuard();
      break;
    case "castle_bank":
      handleCastleBank();
      break;
    case "castle_identity":
      handleCastleIdentity();
      break;
    case "castle_work":
      handleCastleWork();
      break;
    case "castle_work_back":
      handleCastleOutpost();
      break;
    case "leave_castle":
      handleLeaveCastle();
      break;
    case "guard_chat":
      handleGuardChat();
      break;
    case "guard_enter":
      handleGuardEnter();
      break;
    case "guard_bribe":
      handleGuardBribe();
      break;
    case "guard_leave":
      handleGuardLeave();
      break;
    case "castle_interior_explore":
      handleCastleInteriorExplore();
      break;
    case "leave_castle_interior":
      handleLeaveCastleInterior();
      break;
    case "castle_king":
      handleCastleKing();
      break;
    case "castle_queen":
      handleCastleQueen();
      break;
    case "castle_banquet":
      handleCastleBanquet();
      break;
    case "castle_ball":
      handleCastleBall();
      break;
    case "castle_room":
      handleCastleRoom();
      break;
    case "identity_apply":
      handleIdentityApply();
      break;
    case "identity_cancel":
      handleIdentityCancel();
      break;
    case "identity_leave":
      handleCastleOutpost();
      break;
    case "bank_loan":
      handleBankLoan();
      break;
    case "bank_repay":
      handleBankRepay();
      break;
    case "bank_banker":
      handleBankBanker();
      break;
    case "bank_leave":
      handleCastleOutpost();
      break;
    case "banker_mercy":
      handleBankerMercy();
      break;
    case "banker_fight":
      handleBankerFight();
      break;
    case "banker_leave":
      handleCastleOutpost();
      break;
    case "banker_waiver":
      handleBankerWaiver();
      break;
    case "waiver_30":
      handleWaiver30();
      break;
    case "waiver_50":
      handleWaiver50();
      break;
    case "waiver_100":
      handleWaiver100();
      break;
    case "waiver_back":
      handleBankBanker();
      break;
    case "npc_leader":
      handleNpcLeader();
      break;
    case "leader_chat":
      handleLeaderChat();
      break;
    case "leader_gift":
      handleLeaderGift();
      break;
    case "leader_join":
      handleLeaderJoin();
      break;
    case "leader_quit":
      handleLeaderQuit();
      break;
    case "leader_claim":
      handleLeaderClaim();
      break;
    case "leader_leave":
      showOutpostOptions();
      break;
    case "leader_do_gift":
      handleLeaderDoGift(input);
      break;
    case "back_to_leader":
      showLeaderOptions();
      break;
    case "leader_honor":
      handleLeaderHonor();
      break;
    case "leader_recorder":
      handleLeaderRecorder();
      break;
    case "leader_quest2":
      handleLeaderQuest2();
      break;
    case "leader_quest3":
      handleLeaderQuest3();
      break;
    case "leader_assassinate":
      handleLeaderAssassinate();
      break;
    case "assassinate_flee_combat":
      handleAssassinateFleeCombat();
      break;
    case "launch_center":
      handleLaunchCenter();
      break;
    case "launch_center_leave":
      handleLaunchCenterLeave();
      break;
    case "repair_rocket":
      handleRepairRocket();
      break;
    case "rocket_ending_space":
      handleRocketEndingSpace();
      break;
    case "rocket_ending_hope":
      handleRocketEndingHope();
      break;
    case "rocket_ending_stay":
      handleRocketEndingStay();
      break;
    case "doctor_rocket_consult":
      handleDoctorRocketConsult();
      break;
    case "doctor_quest1_accept":
      handleDoctorQuest1Accept();
      break;
    case "doctor_quest1_reject":
      handleDoctorQuest1Reject();
      break;
    case "doctor_quest1_submit":
      handleDoctorQuest1Submit();
      break;
    case "doctor_quest2_submit":
      handleDoctorQuest2Submit();
      break;
    case "doctor_quest3_submit":
      handleDoctorQuest3Submit();
      break;
    case "doctor_rocket_status":
      handleDoctorRocketStatus();
      break;
    case "doctor_harvest_serum":
      handleDoctorHarvestSerum();
      break;
    case "energy_well":
      handleEnergyWell();
      break;
    default:
      break;
  }
}
