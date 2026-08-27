// Root-level levels.js wrapper
// Some HTML files reference "levels.js" at the repo root while the real implementation
// lives in "js/levels.js". When served statically this causes a 404 and the click
// handlers never get registered, which makes the Levels screen buttons appear to do
// nothing. This small bootstrap simply injects the actual script into the page so
// the existing HTML does not need to be changed.
(function(){
  if (window.__levels_wrapper_loaded) return;
  window.__levels_wrapper_loaded = true;

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
