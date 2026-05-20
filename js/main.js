/* ============================================================
   游戏入口模块
   组织顺序：导入 → 输入绑定 → 初始化
   ============================================================ */

import { renderAll, initUI } from './ui.js';
import { handleAction } from './game/index.js';
import { processCheatCommand } from './cheats.js';
import { getState, setStory } from './state.js';

// ---------- 输入绑定 ----------

/**
 * 设置操作输入监听
 * 绑定输入框的提交按钮点击和回车键事件
 * 所有游戏操作（包括存档页面的槽位选择）都通过此入口路由
 */
function setupActionInput() {
  const input = document.getElementById('action-input');
  const btn = document.getElementById('submit-btn');

  function submitAction() {
    const rawValue = input.value.trim();
    if (!rawValue) return;

    const cheatResult = processCheatCommand(rawValue);
    if (cheatResult !== null) {
      if (cheatResult.success && cheatResult.message) {
        const state = getState();
        setStory((state.story || "") + "\n\n【作弊】" + cheatResult.message);
      }
      renderAll();
      input.value = '';
      input.focus();
      return;
    }

    const value = parseInt(rawValue, 10);
    if (isNaN(value) || value < 1) {
      alert('请正确输入选项');
      input.value = '';
      input.focus();
      return;
    }
    handleAction(value);
    renderAll();
    input.value = '';
    input.focus();
  }

  btn.addEventListener('click', submitAction);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitAction();
  });
}

// ---------- 初始化 ----------

/**
 * 初始化游戏
 * 初始化 UI（含开始界面按钮绑定）、绑定操作输入、渲染所有界面
 */
function init() {
  initUI();
  setupActionInput();
  renderAll();
}

// ---------- 启动 ----------
init();
