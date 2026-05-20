(function() {
  const STORED_HASH = "231339da043b2f367a61e3235eb56e94062d7ad36b7be7bd8099582387ddd653";

  function hex(buffer) {
    return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function sha256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    if (window.crypto && window.crypto.subtle) {
      const hash = await window.crypto.subtle.digest('SHA-256', data);
      return hex(hash);
    }
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const ch = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + ch;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  async function verifyPassword(input) {
    const hash = await sha256(input);
    return hash === STORED_HASH;
  }

  function createModal() {
    const overlay = document.createElement('div');
    overlay.id = 'devtools-overlay';
    overlay.innerHTML = `
      <div class="devtools-modal">
        <div class="devtools-modal-icon">🔧</div>
        <h2 class="devtools-modal-title">开发者工具</h2>
        <p class="devtools-modal-desc">请输入访问密码</p>
        <div class="devtools-modal-input-wrap">
          <input type="password" id="devtools-password" placeholder="输入密码..." autocomplete="off">
        </div>
        <div class="devtools-modal-error" id="devtools-error">密码错误，请重试</div>
        <div class="devtools-modal-btns">
          <button class="devtools-btn devtools-btn-cancel" id="devtools-cancel">取消</button>
          <button class="devtools-btn devtools-btn-confirm" id="devtools-confirm">确认</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const input = document.getElementById('devtools-password');
    const error = document.getElementById('devtools-error');
    const confirmBtn = document.getElementById('devtools-confirm');
    const cancelBtn = document.getElementById('devtools-cancel');

    function close() {
      overlay.classList.remove('show');
      setTimeout(() => overlay.remove(), 300);
    }

    async function handleConfirm() {
      const pw = input.value.trim();
      if (!pw) {
        error.textContent = '请输入密码';
        error.classList.add('show');
        return;
      }
      confirmBtn.disabled = true;
      confirmBtn.textContent = '验证中...';
      const ok = await verifyPassword(pw);
      if (ok) {
        close();
        window.open('tools/index.html', '_blank');
      } else {
        confirmBtn.disabled = false;
        confirmBtn.textContent = '确认';
        error.textContent = '密码错误，请重试';
        error.classList.add('show');
        input.value = '';
        input.focus();
      }
    }

    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', close);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') handleConfirm(); if (e.key === 'Escape') close(); });
    input.addEventListener('input', () => error.classList.remove('show'));

    requestAnimationFrame(() => {
      overlay.classList.add('show');
      input.focus();
    });
  }

  const style = document.createElement('style');
  style.textContent = `
    #devtools-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    #devtools-overlay.show { opacity: 1; }

    .devtools-modal {
      background: linear-gradient(145deg, #1a1a2e, #16213e);
      border: 1px solid rgba(233,69,96,0.3);
      border-radius: 16px;
      padding: 32px 28px 24px;
      width: 340px;
      max-width: 90vw;
      box-shadow: 0 0 60px rgba(233,69,96,0.15);
      text-align: center;
      transform: scale(0.9) translateY(20px);
      transition: all 0.3s ease;
    }
    #devtools-overlay.show .devtools-modal { transform: scale(1) translateY(0); }

    .devtools-modal-icon {
      width: 56px; height: 56px;
      margin: 0 auto 12px;
      background: linear-gradient(135deg, #e94560, #c73a52);
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 28px;
      box-shadow: 0 0 30px rgba(233,69,96,0.3);
    }

    .devtools-modal-title {
      font-size: 20px; font-weight: 700;
      color: #e8e8f0; margin-bottom: 6px;
    }

    .devtools-modal-desc {
      font-size: 13px; color: #9090a8; margin-bottom: 20px;
    }

    .devtools-modal-input-wrap {
      margin-bottom: 6px;
    }

    .devtools-modal-input-wrap input {
      width: 100%; padding: 12px 16px;
      background: rgba(0,0,0,0.3);
      border: 1px solid rgba(233,69,96,0.25);
      border-radius: 10px;
      color: #e8e8f0;
      font-size: 15px; font-family: 'Courier New', monospace;
      outline: none;
      text-align: center;
      letter-spacing: 2px;
      transition: border-color 0.3s, box-shadow 0.3s;
      box-sizing: border-box;
    }
    .devtools-modal-input-wrap input:focus {
      border-color: #e94560;
      box-shadow: 0 0 20px rgba(233,69,96,0.2);
    }
    .devtools-modal-input-wrap input::placeholder {
      letter-spacing: 0;
      color: #606078;
      font-family: inherit;
    }

    .devtools-modal-error {
      font-size: 12px; color: #e94560;
      margin: 8px 0;
      display: none;
    }
    .devtools-modal-error.show { display: block; }

    .devtools-modal-btns {
      display: flex; gap: 10px; margin-top: 16px;
    }

    .devtools-btn {
      flex: 1; padding: 10px 0;
      border: none; border-radius: 10px;
      font-size: 14px; font-weight: 600;
      cursor: pointer; font-family: inherit;
      transition: all 0.25s ease;
    }

    .devtools-btn-cancel {
      background: rgba(255,255,255,0.06);
      color: #9090a8;
    }
    .devtools-btn-cancel:hover {
      background: rgba(255,255,255,0.1);
      color: #e8e8f0;
    }

    .devtools-btn-confirm {
      background: linear-gradient(135deg, #e94560, #c73a52);
      color: #fff;
      box-shadow: 0 0 20px rgba(233,69,96,0.25);
    }
    .devtools-btn-confirm:hover {
      box-shadow: 0 0 30px rgba(233,69,96,0.4);
    }
    .devtools-btn-confirm:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    #devtools-trigger-btn {
      background: linear-gradient(135deg, rgba(233,69,96,0.08), rgba(233,69,96,0.03));
      border: 1px solid rgba(233,69,96,0.15);
      color: #e94560;
      padding: 8px 18px;
      border-radius: 8px;
      font-size: 13px;
      cursor: pointer;
      font-family: inherit;
      font-weight: 500;
      transition: all 0.25s ease;
      margin-top: 8px;
    }
    #devtools-trigger-btn:hover {
      background: linear-gradient(135deg, rgba(233,69,96,0.2), rgba(233,69,96,0.1));
      border-color: rgba(233,69,96,0.4);
      box-shadow: 0 0 20px rgba(233,69,96,0.15);
      transform: translateY(-1px);
    }
  `;
  document.head.appendChild(style);

  window.addEventListener('DOMContentLoaded', function() {
    const nameSetup = document.getElementById('name-setup');
    if (nameSetup) {
      const btn = document.createElement('button');
      btn.id = 'devtools-trigger-btn';
      btn.textContent = '🔧 开发者工具';
      btn.addEventListener('click', createModal);
      nameSetup.querySelector('.start-buttons')?.appendChild(btn);
    }
  });
})();
