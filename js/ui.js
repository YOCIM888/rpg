import { getState, setName, setPhase } from './state.js';
import { TIME_PHASES } from './config.js';

function getBackpackCount(state) {
  return state.food.length + state.drinks.length + state.medicine.length + state.other.length;
}

function formatAmmo(state) {
  if (state.ammo.length === 0) {
    return '无';
  }
  return state.ammo.map(a => `${a.name}×${a.count}`).join('、');
}

export function renderStats(state) {
  const panel = document.getElementById('stats-panel');
  panel.innerHTML = `
<div class="panel stats-panel">
  <div class="panel-title">角色状态</div>
  <div class="stat-row"><span class="stat-label">【角色】</span><span class="stat-value">${state.name}</span></div>
  <div class="stat-row"><span class="stat-label">【时间】</span><span class="stat-value">第${state.day}天 ${TIME_PHASES[state.phaseIndex]}</span></div>
  <div class="stat-row"><span class="stat-label">【地点】</span><span class="stat-value">${state.location}</span></div>
  <div class="stat-row"><span class="stat-label">【健康】</span><span class="stat-value">${state.health}</span></div>
  <div class="stat-row"><span class="stat-label">【崩溃】</span><span class="stat-value">${state.crash}%</span></div>
  <div class="stat-row"><span class="stat-label">【感染】</span><span class="stat-value">${state.infection}%</span></div>
  <div class="stat-row"><span class="stat-label">【饱腹】</span><span class="stat-value">${state.hunger}%</span></div>
  <div class="stat-row"><span class="stat-label">【水分】</span><span class="stat-value">${state.hydration}%</span></div>
  <div class="stat-row"><span class="stat-label">【状态】</span><span class="stat-value">${state.status}</span></div>
</div>`;
}

export function renderWeapons(state) {
  const panel = document.getElementById('weapon-panel');
  panel.innerHTML = `
<div class="panel weapon-panel">
  <div class="panel-title">武器</div>
  <div class="stat-row"><span class="stat-label">【近战】</span><span class="stat-value">${state.meleeWeapon.name}（伤害${state.meleeWeapon.damage}点）</span></div>
  <div class="stat-row"><span class="stat-label">【耐久】</span><span class="stat-value">${state.meleeWeapon.durability === Infinity ? '无限' : state.meleeWeapon.durability}</span></div>
  <div class="stat-row"><span class="stat-label">【远程】</span><span class="stat-value">${state.rangedWeapon ? state.rangedWeapon.name : '无'}</span></div>
  <div class="stat-row"><span class="stat-label">【完整】</span><span class="stat-value">${state.rangedWeapon ? state.rangedWeapon.integrity : '无'}</span></div>
  <div class="stat-row"><span class="stat-label">【弹药】</span><span class="stat-value">${formatAmmo(state)}</span></div>
</div>`;
}

export function renderInventory(state) {
  const panel = document.getElementById('inventory-panel');
  const count = getBackpackCount(state);
  panel.innerHTML = `
<div class="panel inventory-panel">
  <div class="panel-title">背包</div>
  <div class="stat-row"><span class="stat-label">【背包】</span><span class="stat-value">${state.backpack.type}（容量${count}/${state.backpack.capacity}）</span></div>
  <div class="stat-row"><span class="stat-label">【食物】</span><span class="stat-value">${state.food.map(f => f.name).join('、') || '无'}</span></div>
  <div class="stat-row"><span class="stat-label">【饮品】</span><span class="stat-value">${state.drinks.map(d => d.name).join('、') || '无'}</span></div>
  <div class="stat-row"><span class="stat-label">【医疗】</span><span class="stat-value">${state.medicine.map(m => m.name).join('、') || '无'}</span></div>
  <div class="stat-row"><span class="stat-label">【其他】</span><span class="stat-value">${state.other.map(o => o.name).join('、') || '无'}</span></div>
</div>`;
}

export function renderStory(state) {
  const area = document.getElementById('story-area');
  area.textContent = state.story;
}

export function renderOptions(state) {
  const area = document.getElementById('options-area');
  if (!state.options || state.options.length === 0) {
    area.innerHTML = '';
    return;
  }
  area.innerHTML = state.options.map((option, i) =>
    `<div class="option-item">${i + 1}. ${option.text}</div>`
  ).join('');
}

export function renderCombatLog(combatState) {
  const area = document.getElementById('story-area');
  const logLines = combatState.log.map(round =>
    `第${round.round}回合：${round.text}`
  ).join('\n');
  area.textContent += '\n\n' + logLines;
}

export function renderAll() {
  const state = getState();

  const nameSetup = document.getElementById('name-setup');
  const gameContent = document.getElementById('game-content');
  const inputArea = document.getElementById('input-area');

  if (state.gameOver) {
    gameContent.style.display = 'block';
    nameSetup.style.display = 'none';
    inputArea.style.display = 'block';
    renderStats(state);
    renderWeapons(state);
    renderInventory(state);
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
    return;
  }

  nameSetup.style.display = 'none';
  gameContent.style.display = 'block';
  inputArea.style.display = 'block';

  renderStats(state);
  renderWeapons(state);
  renderInventory(state);
  renderStory(state);
  renderOptions(state);

  const storyArea = document.getElementById('story-area');
  storyArea.scrollTop = storyArea.scrollHeight;
}

export function initUI() {
  const nameBtn = document.getElementById('name-btn');
  const nameInput = document.getElementById('name-input');

  nameBtn.addEventListener('click', () => {
    const value = nameInput.value.trim();
    if (value) {
      setName(value);
      setPhase('choose');
      renderAll();
    }
  });

  nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      nameBtn.click();
    }
  });

  document.getElementById('game-content').style.display = 'none';
  document.getElementById('input-area').style.display = 'none';
  document.getElementById('name-setup').style.display = 'block';
}