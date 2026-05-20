import {
  getState,
  setPhase,
  setStory,
  resetState,
  checkDeath,
} from '../state.js';

import { showHomeOptions } from '../routing.js';

import {
  saveGame,
  loadGame,
  updateBestRecord as updateRecord,
} from '../save.js';

import {
  handleUpgradeBase,
  handlePlantCrop,
  handleViewCrops,
  handleHarvestCrops,
  handleBuildWarehouse,
  handleOpenWarehouse,
  handleConfirmUpgrade,
  handleConfirmWarehouse,
  handleWarehouseMenuAction,
  handleDoDeposit,
  handleDoWithdraw,
  handleSeedSelect,
} from '../base.js';

import {
  handleEquipSelect,
  handleEquipSubAction,
  handleMeleeEquipAction,
  handleRangedEquipAction,
  handleAmmoLoadAction,
  handleBackpackEquipAction,
  handleDiscardSelect,
  handleDiscardAction,
} from '../equipment.js';

import {
  handleTradeChoice,
  handleTradeInput,
} from '../trading.js';

import {
  handlePreCombatChoice,
  handleSurvivorAction,
  handleWanderingTraderAction,
  handleTraderBuyAmmo,
  handleTraderBuyWeapon,
  handleDoctorAction,
  handlePreCombatNpcChoice,
} from '../combat.js';

import {
  handleNurseZombieFeedConfirm,
  handlePartnerHarvest,
} from '../maps.js';

import {
  handleCastleGuardAction,
  handleCastleBankAction,
  handleCastleIdentityAction,
  handleCastleInteriorAction,
  handleLoanSubmit,
  handleCastleBankerAction,
} from '../castle/index.js';

import {
  handleNpcAction,
  handleNpcInteract,
  handleNpcGiftConfirm,
  handleNpcQuestConfirm,
  handleRecycleConfirm,
  handleRecycleRangedConfirm,
  handleRepairConfirm,
  handleRepairBowConfirm,
  handleCureConfirm,
  handleNpcQuest,
  handleNpcQuestPreview,
  handleLiliRepairGunConfirm,
  handleLiliRepairBowConfirm,
} from '../npcs/index.js';

import {
  handleVTrade,
  handleVTradeConfirm,
} from '../npcs/v.js';

import {
  handleXiaohanTrade,
} from '../npcs/xiaohan.js';

import {
  handleLiliTrade,
} from '../npcs/lili.js';

import {
  handleMapNpcsAction,
  handleMapNpcTrade,
  handleMapNpcGiftConfirm,
} from '../npcs/map-npcs.js';

import {
  showMumiaoOptions,
} from '../npcs/mumiao.js';

import {
  handleLeaderDoGift,
  handleOutpostAssassinateAction,
} from '../outpost/index.js';

import { triggerEnding, checkEndingTriggerAfterAction, checkGoHomeEnding, handleEndingAction } from './endings.js';
import { handleBaseBuild, handleBaseBuildAction } from './base-actions.js';
import { handleSleep, handleEatSelect, handleDrinkSelect, handleMedicineSelect, handleFoodAction, handleDrinkAction, handleMedicineAction, handleSelectionPhase } from './consumables.js';
import { handleGoOut, handleGoHome, handleMapAction } from './navigation.js';
import { handleExplore, handleExploreAction } from './exploration.js';
import { handleSavePage, handleSavePageAction, handleSaveConfirm, renderSaveSlotsAsOptions } from './save.js';
import { buildSurvivalNotes, handleSurvivalNotesAction, handleSurvivalNotesDetailAction } from './notes.js';
import { tryUnlockAchievement, checkSurvivalAchievements, checkExplorationAchievements } from './achievements.js';
import { handleIslandAction, handleIslandBankAction, handleIslandBarAction, handleIslandStreetAction, handleIslandInvestAction } from '../island/index.js';
import { handleFishingAction } from '../island/fishing.js';
import { handleYumoAction } from '../island/yumo.js';
import { handleGuyueAction } from '../island/guyue.js';
import { handleLinhanAction } from '../island/linhan.js';

function handleChooseAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;

  const action = state.options[optionIndex].action;

  switch (action) {
    case "sleep":
      handleSleep();
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
    case "goOut":
      if (getState().weather === "酸雨") {
        setStory("外面下着腐蚀性的酸雨，根本无法出门。");
        return;
      }
      handleGoOut();
      break;
    case "discard":
      handleDiscardSelect();
      break;
    case "save_game":
      handleSavePage();
      break;
    case "partner_harvest":
      handlePartnerHarvest();
      break;
    case "base_build":
      handleBaseBuild();
      break;
    case "survival_notes":
      setPhase("survival_notes");
      buildSurvivalNotes();
      return;
    case "back_to_main_menu":
      setPhase("main_menu");
      return;
    case "upgrade_base":
      handleUpgradeBase();
      return;
    case "plant_crop":
      handlePlantCrop();
      return;
    case "view_crops":
      handleViewCrops();
      return;
    case "harvest_crops":
      handleHarvestCrops();
      return;
    case "build_warehouse":
      handleBuildWarehouse();
      return;
    case "open_warehouse":
      handleOpenWarehouse();
      return;
    case "back_to_home":
      showHomeOptions();
      return;
    case "back_to_base":
      handleBaseBuild();
      return;
    case "back_to_warehouse":
      handleOpenWarehouse();
      return;
    default:
      break;
  }
}

export function handleAction(input) {
  const state = getState();

  if (state._playerDied) {
    state._playerDied = false;
    if (!state.unlockedEndings || (!state.unlockedEndings.includes("ending_death") && !state.unlockedEndings.includes("ending_food") && !state.unlockedEndings.includes("ending_elopement"))) {
      triggerEnding("ending_death");
    }
    return;
  }

  if (input < 1) {
    return;
  }

  if (state.options && state.options.length > 0) {
    const optIdx = input - 1;
    if (optIdx >= 0 && optIdx < state.options.length && state.options[optIdx].disabled) {
      setStory("条件未满足，无法执行此操作");
      return;
    }
  }

  const phase = state.phase;

  switch (phase) {
    case "choose":
      handleChooseAction(input);
      break;
    case "save_page":
      handleSavePageAction(input);
      break;
    case "save_confirm":
      handleSaveConfirm(input);
      break;
    case "base_build":
      handleBaseBuildAction(input);
      break;
    case "eat_select":
      handleFoodAction(input);
      break;
    case "drink_select":
      handleDrinkAction(input);
      break;
    case "medicine_select":
      handleMedicineAction(input);
      break;
    case "map_select":
      handleMapAction(input);
      break;
    case "survival_notes":
      handleSurvivalNotesAction(input);
      break;
    case "survival_notes_detail":
      handleSurvivalNotesDetailAction(input);
      break;
    case "explore":
      handleExploreAction(input);
      break;
    case "pre_combat":
      handlePreCombatChoice(input);
      break;
    case "pre_combat_npc":
      handlePreCombatNpcChoice(input);
      break;
    case "survivor_interact":
      handleSurvivorAction(input);
      break;
    case "trader_interact":
      handleWanderingTraderAction(input);
      break;
    case "trader_buy_ammo":
      handleTraderBuyAmmo(input);
      break;
    case "trader_ammo_qty":
      handleTraderBuyAmmo(input);
      break;
    case "trader_buy_weapon":
      handleTraderBuyWeapon(input);
      break;
    case "doctor_interact":
      handleDoctorAction(input);
      break;
    case "npc_interact":
      handleNpcAction(input);
      break;
    case "repair_select":
      handleRepairConfirm(input);
      break;
    case "repair_bow_select":
      handleRepairBowConfirm(input);
      break;
    case "npc_chat":
      if (input === 1) {
        const npcId = getState()._currentNpc;
        handleNpcInteract(npcId);
      }
      break;
    case "npc_gift": {
      const s = getState();
      const checkItem = s.options[input - 1];
      if (checkItem && checkItem.action === "gift_back") {
        if (s._currentNpc === "mumiao") {
          showMumiaoOptions();
        } else {
          handleNpcAction(input);
        }
      } else if (checkItem && checkItem.giftItem && checkItem.giftItem.isRecycle) {
        handleRecycleConfirm(input);
      } else if (checkItem && checkItem.giftItem && checkItem.giftItem.isRecycleRanged) {
        handleRecycleRangedConfirm(input);
      } else {
        handleNpcGiftConfirm(input);
        if (s._currentNpc === "mumiao" && !getState().gameOver) {
          showMumiaoOptions();
        }
      }
      break;
    }
    case "npc_quest_confirm":
      handleNpcQuestConfirm(input);
      break;
    case "equip_select":
      handleEquipSubAction(input);
      break;
    case "melee_equip":
      handleMeleeEquipAction(input);
      break;
    case "ranged_equip":
      handleRangedEquipAction(input);
      break;
    case "ammo_load":
      handleAmmoLoadAction(input);
      break;
    case "backpack_equip":
      handleBackpackEquipAction(input);
      break;
    case "discard_select":
      handleDiscardAction(input);
      break;
    case "discard_quantity":
      handleDiscardQuantityAction(input);
      break;
    case "trade_choice":
      handleTradeChoice(input);
      break;
    case "trade_input":
      handleTradeInput(input);
      break;
    case "nurse_feed":
      handleNurseZombieFeedConfirm(input);
      break;
    case "base_upgrade_confirm":
      if (input === 1) handleConfirmUpgrade();
      else handleBaseBuild();
      break;
    case "warehouse_upgrade_confirm":
      if (input === 1) handleConfirmWarehouse();
      else handleBaseBuild();
      break;
    case "warehouse_menu":
      handleWarehouseMenuAction(input);
      break;
    case "warehouse_deposit_select":
      handleDoDeposit(input);
      break;
    case "warehouse_withdraw_select":
      handleDoWithdraw(input);
      break;
    case "game_over":
      if (input === 1) {
        updateRecord(state);
        resetState();
        showHomeOptions();
      }
      break;
    case "castle_guard":
      handleCastleGuardAction(input);
      break;
    case "castle_bank":
      handleCastleBankAction(input);
      break;
    case "castle_identity":
      handleCastleIdentityAction(input);
      break;
    case "castle_interior":
      handleCastleInteriorAction(input);
      break;
    case "castle_loan_input":
      handleLoanSubmit(input);
      break;
    case "castle_banker":
      handleCastleBankerAction(input);
      break;
    case "npc_leader":
      handleExploreAction(input);
      break;
    case "leader_assassinate":
      handleOutpostAssassinateAction(input);
      break;
    case "castle_treatment":
      handleCastleInteriorAction(input);
      break;
    case "castle_king_quest":
      handleCastleInteriorAction(input);
      break;
    case "castle_king_dialog":
      handleCastleInteriorAction(input);
      break;
    case "leader_gift_select":
      handleLeaderDoGift(input);
      break;
    case "npc_v":
    case "npc_xiaohan":
    case "npc_lili":
    case "npc_mumiao":
      handleNpcAction(input);
      break;
    case "seed_select":
      handleSeedSelect(input);
      break;
    case "npc_recycle":
      handleRecycleConfirm(input);
      break;
    case "npc_recycle_ranged":
      handleRecycleRangedConfirm(input);
      break;
    case "npc_repair":
      handleRepairConfirm(input);
      break;
    case "npc_repair_bow":
      handleRepairBowConfirm(input);
      break;
    case "lili_repair_gun":
      handleLiliRepairGunConfirm(input);
      break;
    case "lili_repair_bow":
      handleLiliRepairBowConfirm(input);
      break;
    case "npc_cure": {
      const optIdx = input - 1;
      const s = getState();
      if (optIdx >= 0 && optIdx < s.options.length) {
        const opt = s.options[optIdx];
        if (opt.action === "cure_confirm") {
          handleCureConfirm();
        } else {
          handleNpcAction(input);
        }
      }
      break;
    }
    case "npc_quest": {
      const qIdx = input - 1;
      const qs = getState();
      if (qIdx >= 0 && qIdx < qs.options.length) {
        const qAction = qs.options[qIdx].action;
        if (qAction === "quest_confirm") {
          handleNpcQuestConfirm(input);
        } else if (qAction === "quest_preview") {
          handleNpcQuestPreview();
        } else {
          handleNpcAction(input);
        }
      }
      break;
    }
    case "npc_quest_preview": {
      const qpIdx = input - 1;
      const qps = getState();
      if (qpIdx >= 0 && qpIdx < qps.options.length) {
        const qpAction = qps.options[qpIdx].action;
        if (qpAction === "quest_confirm") {
          handleNpcQuestConfirm(input);
        } else {
          handleNpcQuest();
        }
      }
      break;
    }
    case "map_npc":
      handleMapNpcsAction(input);
      break;
    case "map_npc_trade":
      handleMapNpcTrade(input);
      break;
    case "map_npc_gift_select":
      handleMapNpcGiftConfirm(input);
      break;
    case "v_trade":
      handleVTrade(input);
      break;
    case "v_trade_result":
      handleVTradeConfirm(input);
      break;
    case "xiaohan_trade":
      handleXiaohanTrade(input);
      break;
    case "lili_trade":
      handleLiliTrade(input);
      break;
    case "ending":
      handleEndingAction(input);
      break;
    case "island": {
      const s = getState();
      const optIdx = input - 1;
      if (optIdx >= 0 && optIdx < s.options.length) {
        const act = s.options[optIdx].action;
        if (act === "eat") { handleEatSelect(); break; }
        if (act === "drink") { handleDrinkSelect(); break; }
        if (act === "medicine") { handleMedicineSelect(); break; }
        if (act === "equip") { handleEquipSelect(); break; }
        if (act === "discard") { handleDiscardSelect(); break; }
        handleIslandAction(input);
      }
      break;
    }
    case "island_bank":
      handleIslandBankAction(input);
      break;
    case "island_fishing":
      handleFishingAction(input);
      break;
    case "island_yumo":
      handleYumoAction(input);
      break;
    case "island_guyue":
      handleGuyueAction(input);
      break;
    case "island_linhan":
      handleLinhanAction(input);
      break;
    case "island_bar":
      handleIslandBarAction(input);
      break;
    case "island_street":
      handleIslandStreetAction(input);
      break;
    case "island_invest":
      handleIslandInvestAction(input);
      break;
    default:
      break;
  }

  const finalState = getState();
  if (finalState.phase !== "ending" && !finalState.gameOver && finalState.name !== "") {
    if (checkEndingTriggerAfterAction()) return;
  }
  if (finalState.gameOver && finalState.phase !== "ending") {
    triggerEnding("ending_death");
    return;
  }
}

export {
  handleSavePage,
  handleBaseBuild,
  handleGoHome,
  handleEatSelect,
  handleDrinkSelect,
  handleMedicineSelect,
  tryUnlockAchievement,
  checkSurvivalAchievements,
  checkExplorationAchievements,
  triggerEnding,
  checkEndingTriggerAfterAction,
  checkGoHomeEnding,
  handleGoOut,
  handleExplore,
  handleExploreAction,
  handleMapAction,
  handleSleep,
  handleFoodAction,
  handleDrinkAction,
  handleMedicineAction,
  handleBaseBuildAction,
  handleSavePageAction,
  handleSaveConfirm,
  renderSaveSlotsAsOptions,
  buildSurvivalNotes,
  handleSurvivalNotesAction,
  handleSurvivalNotesDetailAction,
  handleEndingAction,
  handleSelectionPhase,
  handleChooseAction,
};
