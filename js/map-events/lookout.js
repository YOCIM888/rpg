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
  GAME_CONSTANTS,
  SPECIAL_ITEMS,
} from '../config.js';

import {
  showExploreOptionsState,
} from '../routing.js';

export function handleClimbTower() {
  const state = getState();
  if (state.lastClimbDay >= state.day) {
    setStory("你今天已经上过塔顶了，明天再来吧");
    showExploreOptionsState();
    return;
  }
  state.crash = Math.max(0, state.crash - GAME_CONSTANTS.MAP_EVENTS.TOWER_CRASH_REDUCTION);
  state.lastClimbDay = state.day;
  setStory("你登上塔顶之后，会当凌绝顶，一览众山小，崩溃度降低了。");
  advanceTime(2);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    showExploreOptionsState();
  }
}

export function handleTombstone() {
  const state = getState();
  setPhase("explore_action");
  setStory("你走到瞭望塔旁的一处角落，那里立着一块斑驳的墓碑，上面摆着几圈已经枯萎的花环。墓碑上的字迹已经被风雨侵蚀得看不清了，只隐约能看到一个「苗」字。空气中弥漫着一股说不出的诡异气息。");
  setOptions([
    { text: "查看", action: "tombstone_look" },
    { text: "离开", action: "tombstone_leave" },
  ]);
}

export function handleTombstoneLook() {
  const state = getState();
  const hasBadge = state.other.some(i => i.id === "farming_master_badge");
  if (!hasBadge) {
    setStory("这个墓碑太诡异了，你不敢前往查看。花环上的花虽然枯萎了，但散发着一种令人不安的气息。你下意识地后退了几步。（需要沐苗苗的农业大师徽章）");
    setOptions([
      { text: "离开", action: "tombstone_leave" },
    ]);
    return;
  }
  setStory("我好像鬼迷心窍了，总感觉这些花环的花在哪里见过，旁边泥土好像埋着什么。你蹲下身，发现墓碑旁的泥土有被翻动过的痕迹，似乎下面埋着什么东西……");
  setOptions([
    { text: "挖掘", action: "tombstone_dig" },
    { text: "离开", action: "tombstone_leave" },
  ]);
}

export function handleTombstoneDig() {
  const state = getState();
  if (state.tombstoneDug) {
    setStory("这里已经被挖过了，除了那个防水袋，泥土里没有其他东西了。");
    showExploreOptionsState();
    return;
  }
  const isHoldingShovel = state.meleeWeapon && state.meleeWeapon.id === "铁铲";
  if (!isHoldingShovel) {
    setStory("你需要装备一把铁铲，不然挖不动。泥土太硬了，徒手根本无法挖掘。");
    setOptions([
      { text: "离开", action: "tombstone_leave" },
    ]);
    return;
  }
  state.tombstoneDug = true;
  const diary = SPECIAL_ITEMS.miaomiao_diary;
  addItem({ ...diary });
  advanceTime(2);
  updateStatusEffects();
  checkDeath();
  setStory(`你用铁铲小心翼翼地挖开墓碑旁的泥土。挖了大约半米深，铲子碰到了一个硬物——是一个用塑料袋层层包裹的防水袋。\n\n你打开防水袋，里面是一本泛黄的日记本。封面上用稚嫩的笔迹写着"苗苗的日记"。\n\n翻开第一页，你的手微微颤抖：\n\n"第1天。爸爸妈妈说他们很饿，家里什么吃的都没有了。"\n"第15天。爸爸不动了。妈妈也不动了。我好害怕。"\n"第30天。我不能再哭了，我要活下去。邻居叔叔教我种菜。"\n"第100天。我种出了第一颗土豆！爸爸，妈妈，你们看到了吗？"\n……\n\n日记本的最后一页，夹着一张手绘的画——画面上，一个扎着辫子的小女孩站在一片田地中间，左边是爸爸，右边是妈妈，三个人手拉着手，头上画着大大的太阳。画的下面歪歪扭扭地写着：\n\n"我们一家人，永远在一起。"\n\n📖 获得【苗苗日记本】\n\n时间推进了2个回合。`);
  if (!state.gameOver) {
    showExploreOptionsState();
  }
}
