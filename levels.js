// Root-level levels.js wrapper
// Some HTML files reference "levels.js" at the repo root while the real implementation
// lives in "js/levels.js". When served statically this causes a 404 and the click
// handlers never get registered, which makes the Levels screen buttons appear to do
// nothing. This bootstrap injects the actual script into the page only when needed.
// It avoids overwriting the game's startLevel() implementation when the full game
// is already loaded (e.g. index.html loads game.js which defines startLevel()).
(function(){
  if (window.__levels_wrapper_loaded) return;
  window.__levels_wrapper_loaded = true;

  // If a robust game implementation already provided startLevel, don't load the
  // lightweight js/levels.js which contains stubs. Loading it would overwrite the
  // real function and break button behavior. This check keeps the wrapper safe
  // for both the full game (index.html) and the standalone levels page (html/levels.html).
  if (typeof window.startLevel === 'function') {
    console.log('startLevel already defined — skipping loading js/levels.js to avoid overriding game implementation');
    return;
  }

  var script = document.createElement('script');
  script.src = 'js/levels.js';
  script.onload = function(){
    console.log('Loaded js/levels.js via root-level wrapper');
  };
  script.onerror = function(){
    console.error('Failed to load js/levels.js from expected path "js/levels.js". Check that file exists and the server serves it.');
  };
  document.head.appendChild(script);
})();
