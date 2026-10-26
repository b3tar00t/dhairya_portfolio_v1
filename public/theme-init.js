// Runs before React to avoid a flash of the wrong theme.
(function () {
  var theme;
  try {
    theme = localStorage.getItem('b3ta:theme');
  } catch (e) {
    theme = null;
  }
  if (theme !== 'light' && theme !== 'dark') {
    // The console look is designed dark-first; light is opt-in via the toggle.
    theme = 'dark';
  }
  document.documentElement.classList.toggle('dark', theme === 'dark');
})();
