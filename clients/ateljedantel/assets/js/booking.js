/* Fitting appointments: month calendar with free days, free times per day, booking request. */
(() => {
  const f = document.getElementById('bk'); if (!f) return;
  const $ = s => document.querySelector(s), A = window.AD, T = k => A.t[k] || k, L = A.lang === 'en' ? 'en-GB' : 'sv-SE';
  let month = new Date(); month.setDate(1); let date = '', time = '', days = {};
  const type = () => f.querySelector('[name=type]:checked');
  const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const dow = L === 'sv-SE' ? ['mån', 'tis', 'ons', 'tor', 'fre', 'lör', 'sön'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  async function loadMonth() {
    const m = month.getFullYear() + '-' + String(month.getMonth() + 1).padStart(2, '0');
    $('#calTitle').textContent = month.toLocaleDateString(L, { month: 'long', year: 'numeric' });
    drawCal(true);
    try { const r = await fetch('api/slots.php?month=' + m + '&type=' + encodeURIComponent(type()?.value || '')); days = (await r.json()).days || {}; } catch (e) { days = {}; }
    drawCal(false);
  }
  function drawCal(loading) {
    const first = new Date(month); const off = (first.getDay() + 6) % 7; const n = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const today = iso(new Date());
    let h = dow.map(d => '<span class="cal__dow">' + d + '</span>').join('') + '<span></span>'.repeat(off);
    for (let i = 1; i <= n; i++) { const d = iso(new Date(month.getFullYear(), month.getMonth(), i)); const free = !loading && days[d]; h += '<button type="button" class="cal__d' + (d === date ? ' on' : '') + (d === today ? ' today' : '') + '" data-d="' + d + '"' + (free ? '' : ' disabled') + '>' + i + '</button>'; }
    $('#cal').innerHTML = h;
    const now = new Date(); now.setDate(1);
    f.querySelector('[data-m="-1"]').disabled = month <= now;
  }
  async function loadSlots() {
    const box = $('#slots'); time = ''; sum();
    if (!date) return;
    box.innerHTML = '<p class="muted">…</p>';
    try {
      const r = await fetch('api/slots.php?date=' + date + '&type=' + encodeURIComponent(type()?.value || '')); const d = await r.json();
      box.innerHTML = d.slots && d.slots.length ? d.slots.map(s => '<button type="button" class="slot" data-t="' + s + '">' + s + '</button>').join('') : '<p class="muted">' + T('bk.none') + '</p>';
    } catch (e) { box.innerHTML = '<p class="muted">' + T('f.err') + '</p>'; }
  }
  function sum() {
    const ty = type();
    $('#sType').textContent = ty ? ty.dataset.label + ' · ' + ty.dataset.min + ' min' : '—';
    $('#sDate').textContent = date ? new Date(date + 'T12:00').toLocaleDateString(L, { weekday: 'long', day: 'numeric', month: 'long' }) : '—';
    $('#sTime').textContent = time || '—';
  }
  f.addEventListener('click', e => {
    const m = e.target.closest('[data-m]'); if (m) { month.setMonth(month.getMonth() + (+m.dataset.m)); loadMonth(); return; }
    const d = e.target.closest('[data-d]'); if (d && !d.disabled) { date = d.dataset.d; f.querySelectorAll('.cal__d').forEach(x => x.classList.toggle('on', x === d)); loadSlots(); sum(); return; }
    const t = e.target.closest('[data-t]'); if (t) { time = t.dataset.t; f.querySelectorAll('.slot').forEach(x => x.classList.toggle('on', x === t)); sum(); }
  });
  f.addEventListener('change', e => { if (e.target.name === 'type') { date = ''; time = ''; $('#slots').innerHTML = ''; loadMonth(); sum(); } });
  /* dresses from the wishlist (and the one the visitor came from) */
  A.catReady.then(() => {
    const ids = [...new Set([f.dataset.pre, ...A.getWish()].filter(id => id && A.PROD[id]))].slice(0, 12);
    if (!ids.length) return;
    $('#wishWrap').hidden = false;
    $('#wishPick').innerHTML = ids.map(id => { const p = A.PROD[id]; return '<label><input type="checkbox" name="wish" value="' + A.esc(id) + '" checked><img src="' + A.esc(p.img) + '" alt="">' + A.esc(p.title) + '</label>'; }).join('');
  });
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(f); const errs = {};
    if (!fd.get('name').trim()) errs.name = T('f.req');
    if (!/^\S+@\S+\.\S+$/.test(fd.get('email'))) errs.email = T('f.email');
    if (fd.get('phone').replace(/\D/g, '').length < 7) errs.phone = T('f.req');
    f.querySelectorAll('.fld').forEach(x => { x.classList.remove('err'); const m = x.querySelector('.msg'); m && (m.textContent = ''); });
    f.querySelector('[data-msg=time]').textContent = date && time ? '' : T('f.req');
    Object.entries(errs).forEach(([k, v]) => { const fl = f.querySelector('[name=' + k + ']').closest('.fld'); fl.classList.add('err'); fl.querySelector('.msg').textContent = v; });
    if (Object.keys(errs).length || !date || !time) { $('#bkErr').textContent = T('co.err'); return; }
    $('#bkErr').textContent = '';
    const btn = $('#bkBtn'); btn.disabled = true;
    const body = { type: fd.get('type'), date, time, name: fd.get('name'), email: fd.get('email'), phone: fd.get('phone'), guests: fd.get('guests'), event: fd.get('event'), note: fd.get('note'), wish: fd.getAll('wish'), website: fd.get('website') };
    try {
      const r = await fetch('api/book.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const d = await r.json();
      if (d.ok) { f.hidden = true; $('#bkOk').hidden = false; $('#bkOkWhen').textContent = $('#sType').textContent + ' — ' + $('#sDate').textContent + ' ' + time; scrollTo({ top: 0, behavior: 'smooth' }); window.__lenis && __lenis.scrollTo(0); return; }
      $('#bkErr').textContent = d.msg || T('f.err');
      if (d.taken) loadSlots();
    } catch (er) { $('#bkErr').textContent = T('f.err'); }
    btn.disabled = false;
  });
  loadMonth(); sum();
})();
