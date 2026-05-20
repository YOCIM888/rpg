/* ============================================================
   游戏 UI 渲染模块
   组织顺序：导入 → 辅助函数 → 面板渲染（状态/武器/背包/货物/故事/选项）
   → 综合渲染 → UI 初始化
   ============================================================ */

import { getState, setName, setPhase, resetState, getItemDisplayName } from './state.js';
import { TIME_PHASES, BASE_LEVELS, ACHIEVEMENTS } from './config.js';
import { getAllSlots, getBestRecord } from './save.js';
import { handleSavePage } from './game/index.js';
import { returnToMenu } from './routing.js';
import { getIdentityDisplayName } from './faction.js';
import { INVEST_DIRECTIONS } from './data/island/investment.js';

// ---------- 辅助函数 ----------

// 计算背包中所有物品的总数量
function getBackpackCount(state) {
  const countArr = (arr) => arr.reduce((sum, item) => sum + (item.count || 1), 0);
  return countArr(state.food) + countArr(state.drinks) + countArr(state.medicine) + countArr(state.other) + (state.seeds ? countArr(state.seeds) : 0);
}

// 格式化弹药显示文本，无弹药时返回"无"
function formatAmmo(state) {
  if (state.ammo.length === 0) {
    return '无';
  }
  return state.ammo.map(a => `${a.name}×${a.count}`).join('、');
}

function getBaseDisplayName(state) {
  return BASE_LEVELS[state.baseLevel || 0]?.name || BASE_LEVELS[0].name;
}

// ---------- 面板渲染 ----------

export function renderIdentity(state) {
  const panel = document.getElementById('identity-panel');
  const display = getIdentityDisplayName(state);
  state._identityDisplay = display;
  panel.innerHTML = `
<div class="identity-panel">
  <div class="panel-title">🎭 身份</div>
  <div class="stat-row"><span class="stat-label">身份</span><span class="stat-value identity-value">${display}</span></div>
</div>`;
}

/**
 * 渲染角色状态面板
 * @param {Object} state - 游戏状态对象
 */
export function renderStats(state) {
  const panel = document.getElementById('stats-panel');
  panel.innerHTML = `
<div class="stats-title">📊 角色状态</div>
<div class="stat-row"><span class="stat-label">角色</span><span class="stat-value">${state.name}</span></div>
<div class="stat-row"><span class="stat-label">时间</span><span class="stat-value">第${state.day}天 ${TIME_PHASES[state.phaseIndex]} · ${state.weather}</span></div>
<div class="stat-row"><span class="stat-label">地点</span><span class="stat-value">${state.location}</span></div>
<div class="stat-row"><span class="stat-label">❤️ 健康</span><span class="stat-value hp">${state.health}</span></div>
<div class="stat-row"><span class="stat-label">💔 崩溃</span><span class="stat-value crash">${state.crash}%</span></div>
<div class="stat-row"><span class="stat-label">🦠 感染</span><span class="stat-value infection">${state.infection}%</span></div>
<div class="stat-row"><span class="stat-label">🍖 饱腹</span><span class="stat-value hunger">${state.hunger}%</span></div>
<div class="stat-row"><span class="stat-label">💧 水分</span><span class="stat-value thirst">${state.hydration}%</span></div>
<div class="stat-row"><span class="stat-label">状态</span><span class="stat-value">${state.status}</span></div>
<div class="stat-row"><span class="stat-label">🏠 基地</span><span class="stat-value">${getBaseDisplayName(state)}</span></div>`;
}

/**
 * 渲染武器面板
 * @param {Object} state - 游戏状态对象
 */
export function renderWeapons(state) {
  const panel = document.getElementById('weapon-panel');
  const meleeDurability = state.meleeWeapon.durability === Infinity 
    ? '无限' 
    : `${state.meleeWeapon.currentDurability}/${state.meleeWeapon.durability}`;
  panel.innerHTML = `
<div class="weapon-panel">
  <div class="panel-title">⚔️ 武器</div>
  <div class="stat-row"><span class="stat-label">近战</span><span class="stat-value">${state.meleeWeapon.name}（伤害${state.meleeWeapon.damage} 连击${Math.round((state.meleeWeapon.comboRate || 0) * 100)}%）</span></div>
  <div class="stat-row"><span class="stat-label">耐久</span><span class="stat-value">${meleeDurability}</span></div>
  <div class="stat-row"><span class="stat-label">远程</span><span class="stat-value">${state.rangedWeapon ? state.rangedWeapon.name : '无'}</span></div>
  <div class="stat-row"><span class="stat-label">完整</span><span class="stat-value">${state.rangedWeapon ? state.rangedWeapon.integrity : '无'}</span></div>
  <div class="stat-row"><span class="stat-label">弹药</span><span class="stat-value">${formatAmmo(state)}</span></div>
</div>`;
}

/**
 * 渲染背包面板
 * @param {Object} state - 游戏状态对象
 */
export function renderInventory(state) {
  const panel = document.getElementById('inventory-panel');
  const count = getBackpackCount(state);
  panel.innerHTML = `
<div class="inventory-panel">
  <div class="panel-title">🎒 背包</div>
  <div class="stat-row"><span class="stat-label">背包</span><span class="stat-value">${state.backpack.type}（容量${count}/${state.backpack.capacity}）</span></div>
  <div class="stat-row"><span class="stat-label">食物</span><span class="stat-value">${state.food.map(f => getItemDisplayName(f)).join('、') || '无'}</span></div>
  <div class="stat-row"><span class="stat-label">饮品</span><span class="stat-value">${state.drinks.map(d => getItemDisplayName(d)).join('、') || '无'}</span></div>
  <div class="stat-row"><span class="stat-label">医疗</span><span class="stat-value">${state.medicine.map(m => getItemDisplayName(m)).join('、') || '无'}</span></div>
  <div class="stat-row"><span class="stat-label">其他</span><span class="stat-value">${state.other.map(o => getItemDisplayName(o)).join('、') || '无'}</span></div>
  <div class="stat-row"><span class="stat-label">种子</span><span class="stat-value">${state.seeds ? state.seeds.map(s => getItemDisplayName(s)).join('、') || '无' : '无'}</span></div>
</div>`;
}

/**
 * 渲染货物面板
 * @param {Object} state - 游戏状态对象
 */
export function renderCargo(state) {
  const panel = document.getElementById('cargo-panel');
  const cigDisplay = state.cigarettes > 0 ? `(${state.cigarettes})香烟` : '无';
  const gasDisplay = state.gasoline > 0 ? `(${state.gasoline})汽油` : '无';
  const royalDisplay = state.royalCoins > 0 ? `(${state.royalCoins})皇家币` : '无';
  panel.innerHTML = `
<div class="cargo-panel">
  <div class="panel-title">📦 货物</div>
  <div class="stat-row"><span class="stat-label">香烟</span><span class="stat-value">${cigDisplay}</span></div>
  <div class="stat-row"><span class="stat-label">汽油</span><span class="stat-value">${gasDisplay}</span></div>
  <div class="stat-row"><span class="stat-label">皇家币</span><span class="stat-value">${royalDisplay}</span></div>
  <div class="stat-row"><span class="stat-label">城堡债务</span><span class="stat-value">${state.castleDebt ? (() => { const d = state.castleDebt.dueDay - state.day; return d > 0 ? `${state.castleDebt.amount}根香烟，剩余${d}天` : `${state.castleDebt.amount}根香烟，逾期${-d}天！`; })() : "无"}</span></div>
  <div class="stat-row"><span class="stat-label">岛屿债务</span><span class="stat-value">${state.islandDebt ? (() => { const d = state.islandDebt.dueDay - state.day; return d > 0 ? `${state.islandDebt.amount}皇家币，剩余${d}天` : `${state.islandDebt.amount}皇家币，逾期${-d}天！`; })() : "无"}</span></div>
  <div class="stat-row"><span class="stat-label">投资</span><span class="stat-value">${state.investment ? (() => { const dir = INVEST_DIRECTIONS.find(d => d.id === state.investment.directionId); const daysLeft = state.investment.dueDay - state.day; return daysLeft > 0 ? `${dir ? dir.name : state.investment.directionId}，${state.investment.amount}币，剩余${daysLeft}天` : `${dir ? dir.name : state.investment.directionId}，${state.investment.amount}币，已到期！`; })() : "无"}</span></div>
</div>`;
}

/**
 * 渲染故事文本区域
 * @param {Object} state - 游戏状态对象
 */
export function renderStory(state) {
  const area = document.getElementById('story-area');
  area.textContent = state.story;
}

/**
 * 渲染选项列表
 * @param {Object} state - 游戏状态对象
 */
export function renderOptions(state) {
  const area = document.getElementById('options-area');
  if (!state.options || state.options.length === 0) {
    area.innerHTML = '';
    return;
  }
  area.innerHTML = state.options.map((option, i) => {
    const disabledClass = option.disabled ? ' option-disabled' : '';
    const disabledAttr = option.disabled ? ' data-disabled="true"' : '';
    return `<div class="option-item${disabledClass}" data-index="${i + 1}"${disabledAttr}>${option.text}</div>`;
  }).join('');
}

// ---------- 存档/最佳记录页面 ----------

/**
 * 渲染存档槽位页面
 */
export function renderSavePage() {
  const area = document.getElementById('save-slots-area');
  const slots = getAllSlots();
  let html = '';
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    if (slot === null) {
      html += `<div class="option-item" data-index="${i + 1}">槽位 ${i + 1} —— 空 ——</div>`;
    } else {
      html += `<div class="option-item" data-index="${i + 1}">槽位 ${i + 1}：${slot.nickname} · 第${slot.day}天 · ${slot.timestamp}</div>`;
    }
  }
  html += `<div class="option-item" data-index="11">返回</div>`;
  area.innerHTML = html;
}

/**
 * 渲染最佳记录页面
 */
export function renderBestRecordPage() {
  const area = document.getElementById('best-record-content');
  const record = getBestRecord();
  if (!record) {
    area.innerHTML = `<div>暂无历史记录。</div>`;
    return;
  }
  const s = record.snapshot;
  const backpackName = s.backpack ? s.backpack.name : '无';
  const backpackCapacity = s.backpack ? s.backpack.capacity : 0;
  const meleeName = s.meleeWeapon ? s.meleeWeapon.name : '无';
  const rangedName = s.rangedWeapon ? s.rangedWeapon.name : '无';
  const foodNames = (s.food && s.food.length > 0) ? s.food.map(f => f.count > 1 ? f.count + f.name : f.name).join('、') : '无';
  const drinkNames = (s.drinks && s.drinks.length > 0) ? s.drinks.map(d => d.count > 1 ? d.count + d.name : d.name).join('、') : '无';
  const medicineNames = (s.medicine && s.medicine.length > 0) ? s.medicine.map(m => m.count > 1 ? m.count + m.name : m.name).join('、') : '无';
  const otherNames = (s.other && s.other.length > 0) ? s.other.map(o => o.count > 1 ? o.count + o.name : o.name).join('、') : '无';
  const cigDisplay = (s.cigarettes && s.cigarettes > 0) ? '(' + s.cigarettes + ')香烟' : '无';
  const gasDisplay = (s.gasoline && s.gasoline > 0) ? '(' + s.gasoline + ')汽油' : '无';
  const royalDisplay = (s.royalCoins && s.royalCoins > 0) ? '(' + s.royalCoins + ')皇家币' : '无';
  const ammoNames = (s.ammo && s.ammo.length > 0) ? s.ammo.map(a => `${a.name}×${a.count}`).join('、') : '无';

  area.innerHTML = `
<div>最长生存：第 ${record.day} 天</div>
<div>角色：${record.nickname}</div>
<div>生命：${s.health}</div>
<div>崩溃：${s.crash}%</div>
<div>感染：${s.infection}%</div>
<div>位置：${s.location}</div>
<div>近战武器：${meleeName}</div>
<div>远程武器：${rangedName}</div>
<div>背包：${backpackName}（${backpackCapacity}格）</div>
<div>食物：${foodNames}</div>
<div>饮品：${drinkNames}</div>
<div>药品：${medicineNames}</div>
<div>其他：${otherNames}</div>
<div>香烟：${cigDisplay}</div>
<div>汽油：${gasDisplay}</div>
<div>皇家币：${royalDisplay}</div>
<div>弹药：${ammoNames}</div>`;
}

// ---------- 成就页面 ----------

/**
 * 渲染成就页面
 */
export function renderAchievementPage() {
  const area = document.getElementById('achievement-content');
  const state = getState();
  const unlocked = state.unlockedAchievements || [];
  let html = '<div class="achievement-list">';
  for (const ach of ACHIEVEMENTS) {
    const isUnlocked = unlocked.includes(ach.id);
    if (isUnlocked) {
      html += `<div class="achievement-item unlocked">
        <div class="achievement-icon">${ach.icon}</div>
        <div class="achievement-info">
          <div class="achievement-name">${ach.name}</div>
          <div class="achievement-desc">${ach.desc}</div>
        </div>
      </div>`;
    } else {
      html += `<div class="achievement-item locked">
        <div class="achievement-icon">❓</div>
        <div class="achievement-info">
          <div class="achievement-name">???</div>
          <div class="achievement-desc">尚未解锁</div>
        </div>
      </div>`;
    }
  }
  html += '</div>';
  area.innerHTML = html;
}

// ---------- 综合渲染 ----------

/**
 * 综合渲染所有 UI 面板，根据游戏阶段控制界面显示
 */
export function renderAll() {
  const state = getState();

  const nameSetup = document.getElementById('name-setup');
  const gameContent = document.getElementById('game-content');
  const inputArea = document.getElementById('input-area');
  const savePage = document.getElementById('save-page');
  const bestRecordPage = document.getElementById('best-record-page');
  const achievementPage = document.getElementById('achievement-page');

  if (state.phase === 'main_menu') {
    nameSetup.style.display = 'block';
    gameContent.style.display = 'none';
    inputArea.style.display = 'none';
    savePage.style.display = 'none';
    bestRecordPage.style.display = 'none';
    achievementPage.style.display = 'none';
    return;
  }

  if (state.phase === 'save_page' || state.phase === 'save_confirm') {
    nameSetup.style.display = 'none';
    gameContent.style.display = 'none';
    inputArea.style.display = 'block';
    savePage.style.display = 'block';
    bestRecordPage.style.display = 'none';
    achievementPage.style.display = 'none';
    const saveStory = document.getElementById('save-story-area');
    const saveOpts = document.getElementById('save-options-area');
    if (state.story) {
      saveStory.style.display = 'block';
      saveStory.textContent = state.story;
    } else {
      saveStory.style.display = 'none';
    }
    if (state.options && state.options.length > 0) {
      saveOpts.style.display = 'block';
      saveOpts.innerHTML = state.options.map((option, i) =>
        `<div class="option-item">${i + 1}. ${option.text}</div>`
      ).join('');
    } else {
      saveOpts.style.display = 'none';
    }
    return;
  }

  if (state.gameOver) {
    gameContent.style.display = 'block';
    nameSetup.style.display = 'none';
    inputArea.style.display = 'block';
    savePage.style.display = 'none';
    bestRecordPage.style.display = 'none';
    achievementPage.style.display = 'none';
    renderStats(state);
    renderWeapons(state);
    renderInventory(state);
    renderCargo(state);
    renderIdentity(state);
    renderStory(state);
    renderOptions(state);
    const storyArea = document.getElementById('story-area');
    storyArea.scrollTop = storyArea.scrollHeight;
    return;
  }

  if (state.name === '') {
    nameSetup.style.display = 'block';
    gameContent.style.display = 'none';
    inputArea.style.display = 'none';
    savePage.style.display = 'none';
    bestRecordPage.style.display = 'none';
    achievementPage.style.display = 'none';
    return;
  }

  nameSetup.style.display = 'none';
  gameContent.style.display = 'block';
  inputArea.style.display = 'block';
  savePage.style.display = 'none';
  bestRecordPage.style.display = 'none';
  achievementPage.style.display = 'none';

  renderStats(state);
  renderWeapons(state);
  renderInventory(state);
  renderCargo(state);
  renderIdentity(state);
  renderStory(state);
  renderOptions(state);

  const storyArea = document.getElementById('story-area');
  storyArea.scrollTop = storyArea.scrollHeight;
}

// ---------- UI 初始化 ----------

/**
 * 初始化 UI 事件绑定与初始显示状态
 */
export function initUI() {
  const nameInput = document.getElementById('name-input');
  const newGameBtn = document.getElementById('new-game-btn');
  const loadGameBtn = document.getElementById('load-game-btn');
  const bestRecordBtn = document.getElementById('best-record-btn');
  const saveReturnBtn = document.getElementById('save-return-btn');
  const bestRecordReturnBtn = document.getElementById('best-record-return-btn');
  const achievementBtn = document.getElementById('achievement-btn');
  const achievementReturnBtn = document.getElementById('achievement-return-btn');

  if (newGameBtn) {
    newGameBtn.addEventListener('click', () => {
      const value = nameInput.value.trim();
      if (!value) {
        alert('请输入角色昵称');
        return;
      }
      resetState();
      setName(value);
      setPhase('choose');
      renderAll();
    });
  }

  if (loadGameBtn) {
    loadGameBtn.addEventListener('click', () => {
      handleSavePage();
      renderAll();
    });
  }

  if (bestRecordBtn) {
    bestRecordBtn.addEventListener('click', () => {
      document.getElementById('name-setup').style.display = 'none';
      document.getElementById('best-record-page').style.display = 'block';
      document.getElementById('game-content').style.display = 'none';
      document.getElementById('input-area').style.display = 'none';
      renderBestRecordPage();
    });
  }

  if (saveReturnBtn) {
    saveReturnBtn.addEventListener('click', () => {
      const state = getState();
      if (state.phase === 'save_confirm') {
        handleSavePage();
      } else if (state.name !== '') {
        returnToMenu();
      } else {
        document.getElementById('name-setup').style.display = 'block';
        document.getElementById('save-page').style.display = 'none';
      }
      renderAll();
    });
  }

  if (bestRecordReturnBtn) {
    bestRecordReturnBtn.addEventListener('click', () => {
      document.getElementById('name-setup').style.display = 'block';
      document.getElementById('best-record-page').style.display = 'none';
      renderAll();
    });
  }

  if (achievementBtn) {
    achievementBtn.addEventListener('click', () => {
      document.getElementById('name-setup').style.display = 'none';
      document.getElementById('achievement-page').style.display = 'block';
      document.getElementById('game-content').style.display = 'none';
      document.getElementById('input-area').style.display = 'none';
      document.getElementById('save-page').style.display = 'none';
      document.getElementById('best-record-page').style.display = 'none';
      renderAchievementPage();
    });
  }

  if (achievementReturnBtn) {
    achievementReturnBtn.addEventListener('click', () => {
      document.getElementById('name-setup').style.display = 'block';
      document.getElementById('achievement-page').style.display = 'none';
      renderAll();
    });
  }

  if (nameInput) {
    nameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        newGameBtn?.click();
      }
    });
  }

  document.getElementById('game-content').style.display = 'none';
  document.getElementById('input-area').style.display = 'none';
  document.getElementById('name-setup').style.display = 'block';
  document.getElementById('save-page').style.display = 'none';
  document.getElementById('best-record-page').style.display = 'none';
}
