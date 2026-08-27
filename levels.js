// levels.js
// Binds the hotspots on the standalone levels.html page.
//
// Behavior:
// - If the page was opened by the main game window (window.opener) and that window
//   exposes a startLevel(levelNumber) function, clicking a planet will call it.
// - Otherwise clicking logs to console and shows an in-page toast message.

(function () {
  function callGameStart(level) {
    // If the page is opened by the main app (popup or new window), prefer calling its startLevel
    try {
      if (window.opener && typeof window.opener.startLevel === 'function') {
        window.opener.startLevel(level);
        // optionally close the levels page if it's a separate window
        // window.close();
        return true;
      }
      if (window.parent && window.parent !== window && typeof window.parent.startLevel === 'function') {
        window.parent.startLevel(level);
        return true;
      }
    } catch (e) {
      // cross-origin or other; fall through
    }
    return false;
  }

  function showLocalToast(msg) {
    let t = document.getElementById('__levels_toast');
    if (!t) {
      t = document.createElement('div');
      t.id = '__levels_toast';
      t.style.position = 'fixed';
      t.style.left = '50%';
      t.style.bottom = '8%';
      t.style.transform = 'translateX(-50%)';
      t.style.background = 'rgba(4,6,16,0.95)';
      t.style.padding = '10px 16px';
      t.style.color = '#bfefff';
      t.style.border = '1px solid rgba(0,229,255,0.12)';
      t.style.borderRadius = '8px';
      t.style.zIndex = 2000;
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(window.__levels_toast_timer);
    window.__levels_toast_timer = setTimeout(() => t.style.opacity = '0', 1600);
  }

  function bindButton(id, cb) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', (ev) => {
      ev.preventDefault();
      cb(ev);
    }, { passive: false });
  }

  // Planet buttons
  for (let i = 1; i <= 8; i++) {
    bindButton('level-' + i, () => {
      const invoked = callGameStart(i);
      if (!invoked) showLocalToast('Start Level ' + i + ' (no game window detected)');
    });
  }

  // Back / Settings / Upgrade
  bindButton('btn-back', () => {
    // If opener exists, try to call a 'showScreen' method or just focus parent
    try {
      if (window.opener && typeof window.opener.showScreen === 'function') { window.opener.showScreen('title'); window.close(); return; }
      if (window.parent && window.parent !== window && typeof window.parent.showScreen === 'function') { window.parent.showScreen('title'); return; }
    } catch (e) { /* ignore cross-origin */ }
    // fallback: just go back in history
    if (history.length > 1) history.back();
  });

  bindButton('btn-settings', () => {
    try {
      if (window.opener && typeof window.opener.showOverlay === 'function') { window.opener.showOverlay('settings'); return; }
      if (window.parent && window.parent !== window && typeof window.parent.showOverlay === 'function') { window.parent.showOverlay('settings'); return; }
    } catch (e) {}
    showLocalToast('Settings (not available)');
  });

  bindButton('btn-upgrade', () => {
    try {
      if (window.opener && typeof window.opener.renderShop === 'function') { window.opener.renderShop(); window.opener.showOverlay('shop'); return; }
      if (window.parent && window.parent !== window && typeof window.parent.renderShop === 'function') { window.parent.renderShop(); window.parent.showOverlay('shop'); return; }
    } catch (e) {}
    showLocalToast('Upgrade (not available)');
  });

  // make hotspots keyboard accessible by focusing first planet by default
  const first = document.getElementById('level-1');
  if (first) first.focus();

  // Expose for debugging if needed
  window.__levels_callGameStart = callGameStart;
})();
