import { renderAll, initUI } from './ui.js';
import { handleAction } from './game.js';
import { getState } from './state.js';

function setupActionInput() {
  const input = document.getElementById('action-input');
  const btn = document.getElementById('submit-btn');

  function submitAction() {
    const value = parseInt(input.value);
    if (isNaN(value) || value < 1) return;
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

function init() {
  initUI();
  setupActionInput();
  renderAll();
}

init();