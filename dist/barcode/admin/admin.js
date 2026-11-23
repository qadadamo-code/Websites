/* Barcode dashboard — small progressive enhancements. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // confirm destructive actions
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-confirm]');
    if (b && !confirm(b.dataset.confirm)) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  // bulk selection
  const all = $('[data-all]'), rows = $$('[data-row]'), bar = $('#bulkbar'), n = $('#selN');
  const sync = () => {
    const k = rows.filter((r) => r.checked).length;
    if (bar) bar.hidden = k === 0;
    if (n) n.textContent = k;
    if (all) { all.checked = k && k === rows.length; all.indeterminate = k > 0 && k < rows.length; }
  };
  all && all.addEventListener('change', () => { rows.forEach((r) => (r.checked = all.checked)); sync(); });
  rows.forEach((r) => r.addEventListener('change', sync));

  // inline price edits → save bar
  const save = $('#savebar');
  $$('[data-price]').forEach((i) => {
    i.dataset.v = i.value;
    i.addEventListener('input', () => {
      i.classList.toggle('is-dirty', i.value !== i.dataset.v);
      if (save) save.hidden = !$$('[data-price]').some((x) => x.value !== x.dataset.v);
    });
  });
  // when saving prices, don't also submit unchecked bulk ids (harmless) — but do warn on leave
  window.addEventListener('beforeunload', (e) => { if (save && !save.hidden && !window.__saving) { e.preventDefault(); e.returnValue = ''; } });
  $$('form').forEach((f) => f.addEventListener('submit', () => (window.__saving = true)));

  // image preview
  $$('[data-preview]').forEach((inp) => inp.addEventListener('change', () => {
    const box = $(inp.dataset.preview), f = inp.files && inp.files[0];
    if (!box || !f) return;
    const img = new Image(); img.src = URL.createObjectURL(f); img.alt = '';
    box.innerHTML = ''; box.appendChild(img);
  }));

  // copy to clipboard
  const toast = (msg) => {
    let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 1800);
  };
  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-copy]'); if (!b) return;
    e.preventDefault();
    const txt = b.dataset.copy.startsWith('#') ? ($(b.dataset.copy).value || $(b.dataset.copy).textContent) : b.dataset.copy;
    try { await navigator.clipboard.writeText(txt); } catch (_) { const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
    toast('تم النسخ ✓');
  });

  // build absolute share links from relative paths (works on any domain)
  $$('[data-abs]').forEach((el) => {
    const url = new URL(el.dataset.abs, location.href).href;
    if (el.tagName === 'INPUT') el.value = url; else el.textContent = url;
    if (el.dataset.copyTarget !== undefined) el.dataset.copy = url;
  });
  $$('[data-wa-share]').forEach((a) => {
    const url = new URL(a.dataset.waShare, location.href).href;
    a.href = 'https://wa.me/?text=' + encodeURIComponent((a.dataset.text || '') + '\n' + url);
  });
  $$('[data-copy-abs]').forEach((b) => (b.dataset.copy = new URL(b.dataset.copyAbs, location.href).href));

  // auto-submit selects
  $$('[data-autosubmit]').forEach((s) => s.addEventListener('change', () => { window.__saving = true; s.form.submit(); }));

  // close mobile nav on navigation
  $$('.side a').forEach((a) => a.addEventListener('click', () => document.body.classList.remove('nav-open')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') document.body.classList.remove('nav-open'); });

  // coupon code generator
  const gen = $('[data-gen-code]');
  gen && gen.addEventListener('click', (e) => {
    e.preventDefault();
    const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = 'BC';
    for (let i = 0; i < 5; i++) s += a[Math.floor(Math.random() * a.length)];
    $(gen.dataset.genCode).value = s;
  });

  // slug suggestion for events
  const t = $('#evTitleEn'), sl = $('#evSlug');
  if (t && sl && !sl.value) t.addEventListener('input', () => { if (!sl.dataset.touched) sl.value = t.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40); });
  sl && sl.addEventListener('input', () => (sl.dataset.touched = 1));
})();
