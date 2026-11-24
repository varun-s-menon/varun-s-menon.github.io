/* Light/dark theme. Follows the system setting until the reader picks one with the toggle,
   and then remembers that choice. */
(function () {
  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
  function saved() { try { return localStorage.getItem('theme'); } catch (e) { return null; } }
  function apply(theme) {
    if (theme === 'light') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
    var b = document.querySelector('.theme-toggle');
    if (b) b.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
  }
  function current() { return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; }
  if (mq) {
    var onChange = function (e) { if (!saved()) apply(e.matches ? 'light' : 'dark'); };
    if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);
  }
  document.addEventListener('DOMContentLoaded', function () {
    var b = document.querySelector('.theme-toggle');
    if (!b) return;
    apply(current());
    b.addEventListener('click', function () {
      var next = current() === 'light' ? 'dark' : 'light';
      try { localStorage.setItem('theme', next); } catch (e) {}
      apply(next);
    });
  });
})();
