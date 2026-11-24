(function () {
  'use strict';
  document.querySelectorAll('form[data-confirm]').forEach(function (f) {
    f.addEventListener('submit', function (e) { if (!window.confirm(f.getAttribute('data-confirm'))) e.preventDefault(); });
  });
  var t = document.querySelector('[data-toggle="side"]'), side = document.getElementById('side');
  if (t && side) t.addEventListener('click', function () {
    var open = side.classList.toggle('open');
    t.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  // warn before leaving a form with unsaved changes
  var dirty = false;
  document.querySelectorAll('form.form, form.card').forEach(function (f) {
    f.addEventListener('input', function () { dirty = true; });
    f.addEventListener('submit', function () { dirty = false; });
  });
  window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
})();
