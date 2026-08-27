// levels.js
// Binds the hotspots on the standalone levels.html page and positions
// percentage-based hotspots to pixel-accurate locations for the displayed image.
//
// Behavior:
// - If the page was opened by the main game window (window.opener) and that window
//   exposes a startLevel(levelNumber) function, clicking a planet will call it.
// - Otherwise clicking logs to console and shows an in-page toast message.

// ---------------------- init & positioning helper ----------------------
function initLevelsPage(imagePath) {
  const img = document.getElementById('levels-art');
  if (!img) return;

  // Percent coordinates for hotspots relative to the image (0..100)
  const hotspotsPercent = {
    'btn-back':            { left: 2.2,  top: 3.9,  width: 11.5, height: 9.5  },
    'btn-settings':        { left: 80.8, top: 3.9,  width: 9.5,  height: 12.0 },
    'btn-upgrade':         { left: 91.0, top: 3.9,  width: 7.5,  height: 12.0 },

    'level-1':             { left: 7.6,  top: 21.0, width: 20.6, height: 31.0 },
    'level-2':             { left: 31.8, top: 21.0, width: 20.6, height: 31.0 },
    'level-3':             { left: 56.0, top: 21.0, width: 20.6, height: 31.0 },
    'level-4':             { left: 79.6, top: 21.0, width: 16.8, height: 31.0 },

    'level-5':             { left: 7.6,  top: 55.0, width: 20.6, height: 31.0 },
    'level-6':             { left: 31.8, top: 55.0, width: 20.6, height: 31.0 },
    'level-7':             { left: 56.0, top: 55.0, width: 20.6, height: 31.0 },
    'level-8':             { left: 79.6, top: 55.0, width: 16.8, height: 31.0 },

    'btn-collect-stars':   { left: 29.5, top: 88.0, width: 40.0, height: 8.5 },
  };

  const encodedPath = encodeURI(imagePath);
  img.src = encodedPath;

  function debounce(fn, wait) {
    let t;
    return function () { clearTimeout(t); t = setTimeout(() => fn.apply(this, arguments), wait); };
  }

  function updateAllHotspots() {
    const wrapper = img.closest('.frame-photo-wrap') || document.body;
    const imgRect = img.getBoundingClientRect();
    const wrapRect = wrapper.getBoundingClientRect();
    if (!imgRect.width || !imgRect.height) return;

    Object.keys(hotspotsPercent).forEach(id => {
      const pct = hotspotsPercent[id];
      const el = document.getElementById(id);
      if (!el) return;
      const leftPx  = Math.round((pct.left  / 100) * imgRect.width);
      const topPx   = Math.round((pct.top   / 100) * imgRect.height);
      const wPx     = Math.round((pct.width / 100) * imgRect.width);
      const hPx     = Math.round((pct.height/ 100) * imgRect.height);

      const leftRel = Math.round(imgRect.left - wrapRect.left) + leftPx;
      const topRel  = Math.round(imgRect.top  - wrapRect.top)  + topPx;

      el.style.position = 'absolute';
      el.style.left = leftRel + 'px';
      el.style.top = topRel + 'px';
      el.style.width = Math.max(44, wPx) + 'px';
      el.style.height = Math.max(44, hPx) + 'px';
      el.style.display = 'block';
      el.style.transform = 'none';
      el.style.padding = '0';
      el.style.boxSizing = 'border-box';
    });
  }

  function onImageReady() {
    const wrapper = img.closest('.frame-photo-wrap') || document.body;
    if (wrapper && getComputedStyle(wrapper).position === 'static') wrapper.style.position = 'relative';

    // initial update
    updateAllHotspots();

    // reflow on resize and when wrapper changes
    window.addEventListener('resize', debounce(updateAllHotspots, 80), { passive: true });
    const mo = new MutationObserver(debounce(updateAllHotspots, 40));
    mo.observe(wrapper, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
  }

  if (img.complete && img.naturalWidth) setTimeout(onImageReady, 20);
  else img.addEventListener('load', onImageReady, { once: true });
  img.addEventListener('error', () => console.error('Failed to load levels image:', encodedPath), { once: true });
}

// Call initLevelsPage automatically on DOM ready with the image path you added
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => {
  initLevelsPage('assets/levels/WhatsApp Image 2026-08-16 at 4.53.45 PM.jpeg');
});
else initLevelsPage('assets/levels/WhatsApp Image 2026-08-16 at 4.53.45 PM.jpeg');

// ---------------------- existing binding & fallback logic ----------------------
(function () {
  function callGameStart(level) {
    // If the page is opened by the main app (popup or new window), prefer calling its startLevel
    try {
      if (window.opener && typeof window.opener.startLevel === 'function') {
        window.opener.startLevel(level);
        return true;
      }
      if (window.parent && window.parent !== window && typeof window.parent.startLevel === 'function') {
        window.parent.startLevel(level);
        return true;
      }
    } catch (e) {}
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
    try {
      if (window.opener && typeof window.opener.showScreen === 'function') { window.opener.showScreen('title'); window.close(); return; }
      if (window.parent && window.parent !== window && typeof window.parent.showScreen === 'function') { window.parent.showScreen('title'); return; }
    } catch (e) { }
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
