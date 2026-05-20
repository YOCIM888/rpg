/* ============================================================
   地图互动模块 — 统一导出入口
   所有函数已拆分至 map-events/ 子目录
   ============================================================ */

export {
  handleClimbTower,
  handleTombstone,
  handleTombstoneLook,
  handleTombstoneDig,
} from './map-events/lookout.js';

export {
  handlePickFruit,
} from './map-events/barn.js';

export {
  handleExploreCave,
  handleMoldySeeds,
  handleAbandonedField,
} from './map-events/village.js';

export {
  handleStinkyTent,
  handleStinkyTentEnter,
  handleStinkyTentSearch,
  handleLootCorpse,
} from './map-events/campsite.js';

export {
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
} from './map-events/outlaw.js';

export {
  handleMechanicInteract,
  handleMechanicChat,
  handleMechanicTrade,
  handleMechanicTradeConfirm,
  handleMechanicLeave,
  handleMechanicGasTrade,
  handleMechanicGasConfirm,
} from './map-events/mechanic.js';

export {
  handleWolfInteract,
  handleWolfChat,
  handleWolfLeave,
  handleWolfTrade,
} from './map-events/wolf.js';

export {
  handleExploreFactory,
} from './map-events/factory.js';

export {
  handleYacht,
  handleViewRiver,
} from './map-events/harbor.js';

export {
  handleMaskedManInteract,
  handleMaskedManFight,
  handleMaskedManLeave,
} from './map-events/supermarket.js';

export {
  handleWarehouseGuardInteract,
  handleWarehouseGuardChat,
  handleWarehouseGuardLeave,
  handleWarehouseGuardTrade,
  handleWarehouseGuardTradeConfirm,
} from './map-events/warehouse.js';

export {
  handleNurseZombieInteract,
  handleNurseZombieFeedSelect,
  handleNurseZombieFeedConfirm,
  handleNurseZombieBringHome,
  handleNurseZombieLeave,
} from './map-events/nurse-zombie.js';

export {
  handlePoliceRaid,
} from './map-events/police.js';

export {
  handleVeteranInteract,
  handleVeteranChat,
  handleVeteranLeave,
  handleVeteranAmmo,
} from './map-events/veteran.js';

export {
  handleExploreTunnel,
} from './map-events/tunnel.js';

export {
  handleDoctorInteract,
  handleDoctorTrade,
  handleDoctorChat,
  handleDoctorLeave,
  handleDoctorRocketConsult,
  handleDoctorQuest1Accept,
  handleDoctorQuest1Reject,
  handleDoctorQuest1Submit,
  handleDoctorQuest2Submit,
  handleDoctorQuest3Submit,
  handleDoctorRocketStatus,
  handleDoctorHarvestSerum,
  handleEnergyWell,
} from './map-events/doctor.js';

export {
  handleLaunchCenter,
  handleGiantPuppetInteract,
  handleLaunchCenterLeave,
  handleRepairRocket,
  handleRocketEndingChoices,
  handleRocketEndingSpace,
  handleRocketEndingHope,
  handleRocketEndingStay,
} from './map-events/rocket.js';

export {
  handleZombieKingInteract,
} from './map-events/zombie-king.js';

export {
  handleInfectedWoman,
  handleInjectWoman,
  handleIgnoreWoman,
  handleKillZombieWoman,
  handleLiuruyanClassroom,
  handleLiuruyanSeat,
  handleLiuruyanReject,
  handleLiuruyanQuestAccept,
  handleLiuruyanQuestReject,
  handleLiuruyanQuestFight,
} from './map-events/liuruyan.js';

export {
  handlePartnerHarvest,
} from './map-events/partner-harvest.js';
