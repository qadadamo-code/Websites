/* Ateljé Dantel dashboard: nav, confirm dialogs, bulk select, language tabs, variant editor, image picker, drag sorting, notifications. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
document.addEventListener('click', e => {
  if (e.target.closest('[data-nav-open]')) document.body.classList.add('nav-open');
  if (e.target.closest('[data-nav-close]')) document.body.classList.remove('nav-open');
  if (e.target.closest('[data-theme]')) { const r = document.documentElement; r.dataset.theme = r.dataset.theme === 'dark' ? '' : 'dark'; try { localStorage.setItem('ad_admin_theme', r.dataset.theme); } catch (er) {} }
});

/* confirm before destructive actions: <button data-confirm="Text"> */
const dlg = $('#confirm');
function ask(text) {
  return new Promise(res => {
    if (!dlg) return res(window.confirm(text));
    $('#confirmText').textContent = text; dlg.hidden = false; $('[data-c="0"]', dlg).focus();
    const done = v => { dlg.hidden = true; dlg.onclick = null; document.removeEventListener('keydown', key); res(v); };
    const key = e => { if (e.key === 'Escape') done(false); };
    document.addEventListener('keydown', key);
    dlg.onclick = e => { const b = e.target.closest('[data-c]'); if (b) done(b.dataset.c === '1'); else if (e.target === dlg) done(false); };
  });
}
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-confirm]'); if (!b || b.dataset.ok) return;
  e.preventDefault();
  if (await ask(b.dataset.confirm)) { b.dataset.ok = 1; if (b.form && b.tagName === 'BUTTON') { if (b.name) { const h = document.createElement('input'); h.type = 'hidden'; h.name = b.name; h.value = b.value; b.form.appendChild(h); } b.form.requestSubmit ? b.form.submit() : b.form.submit(); } else if (b.href) location.href = b.href; else b.click(); }
});

/* bulk selection */
$$('[data-bulk]').forEach(form => {
  const all = $('[data-check-all]', form), boxes = () => $$('input[name="ids[]"]', form), bar = $('.bulk', form), n = $('[data-bulk-n]', form);
  const upd = () => { const k = boxes().filter(x => x.checked).length; bar.hidden = !k; n && (n.textContent = k); };
  all && all.addEventListener('change', () => { boxes().forEach(x => { if (x.closest('tr').offsetParent) x.checked = all.checked; }); upd(); });
  form.addEventListener('change', e => { if (e.target.name === 'ids[]') upd(); });
  upd();
});

/* instant table filter: <input data-filter="#table"> */
$$('[data-filter]').forEach(inp => {
  const t = $(inp.dataset.filter);
  inp.addEventListener('input', () => { const q = inp.value.trim().toLowerCase(); $$('tbody tr', t).forEach(tr => { tr.hidden = q && !tr.textContent.toLowerCase().includes(q); }); });
});

/* language tabs for sv/en fields: wrapper [data-lang-tabs] contains [data-l=sv] / [data-l=en] */
$$('[data-lang-tabs]').forEach(w => {
  const btns = $$('.langtabs button', w);
  btns.forEach(b => b.addEventListener('click', () => { btns.forEach(x => x.classList.toggle('on', x === b)); $$('[data-l]', w).forEach(f => { f.hidden = f.dataset.l !== b.dataset.show; }); }));
});

/* auto slug */
const title = $('[data-slug-from]'), slug = $('[data-slug]');
if (title && slug) { let touched = !!slug.value; slug.addEventListener('input', () => { touched = true; }); title.addEventListener('input', () => { if (!touched) slug.value = title.value.toLowerCase().replace(/[åä]/g, 'a').replace(/ö/g, 'o').replace(/é/g, 'e').replace(/&/g, 'och').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70); }); }

/* warn about unsaved changes */
$$('form[data-dirty]').forEach(f => {
  let dirty = false;
  f.addEventListener('input', () => { dirty = true; });
  f.addEventListener('submit', () => { dirty = false; });
  window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ADM.t.saved; } });
});

/* ---------- variant editor ---------- */
const ved = $('#variants');
if (ved) {
  const tpl = $('#vtpl').innerHTML;
  const lib = JSON.parse($('#imglib').textContent || '[]');
  let pickTarget = null;
  const renum = () => $$('.vcard', ved).forEach((c, i) => { $('.vnum', c).textContent = i + 1; $$('[name]', c).forEach(inp => { inp.name = inp.name.replace(/v\[\d+\]/, 'v[' + i + ']'); }); });
  const syncImgs = card => { const list = $$('.im', card).map(im => im.dataset.src); $('.vimgs', card).value = list.join('\n'); };
  const imgHtml = s => '<div class="im" draggable="true" data-src="' + s + '"><img src="../' + s + '" alt=""><button type="button" data-imrm title="×">×</button></div>';
  $('#addVariant').addEventListener('click', () => {
    const first = $('.vcard', ved); const wrap = document.createElement('div'); wrap.innerHTML = tpl.replace(/__i__/g, $$('.vcard', ved).length); const card = wrap.firstElementChild;
    if (first) { ['price', 'compare', 'color', 'colorEn', 'hex'].forEach(k => { const a = $('[data-k="' + k + '"]', first), b = $('[data-k="' + k + '"]', card); if (a && b) b.value = a.value; }); $('.imgs', card).insertAdjacentHTML('afterbegin', $$('.im', first).map(im => imgHtml(im.dataset.src)).join('')); syncImgs(card); }
    ved.appendChild(card); renum(); $('[data-k="size"]', card).focus();
  });
  ved.addEventListener('click', async e => {
    const rm = e.target.closest('[data-vrm]');
    if (rm) { if ($$('.vcard', ved).length < 2) return; if (await ask(rm.dataset.q)) { rm.closest('.vcard').remove(); renum(); } return; }
    const dup = e.target.closest('[data-vdup]');
    if (dup) { const c = dup.closest('.vcard'); const n = c.cloneNode(true); $$('input', n).forEach(i => { if (i.dataset.k === 'id') i.value = ''; if (i.dataset.k === 'sku') i.value = ''; if (i.dataset.k === 'size') i.value = ''; }); c.after(n); renum(); return; }
    const imrm = e.target.closest('[data-imrm]'); if (imrm) { const card = imrm.closest('.vcard'); imrm.parentElement.remove(); syncImgs(card); return; }
    const pick = e.target.closest('[data-pick]'); if (pick) { pickTarget = pick.closest('.vcard'); openPicker(); return; }
  });
  /* drag to reorder images (first image = main picture of that colour) */
  let dragEl = null;
  ved.addEventListener('dragstart', e => { const im = e.target.closest('.im'); if (!im) return; dragEl = im; im.classList.add('drag'); e.dataTransfer.effectAllowed = 'move'; });
  ved.addEventListener('dragend', () => { if (dragEl) { dragEl.classList.remove('drag'); syncImgs(dragEl.closest('.vcard')); dragEl = null; } });
  ved.addEventListener('dragover', e => { const im = e.target.closest('.im'); if (!dragEl || !im || im === dragEl || im.parentElement !== dragEl.parentElement) return; e.preventDefault(); const r = im.getBoundingClientRect(); im.parentElement.insertBefore(dragEl, e.clientX < r.left + r.width / 2 ? im : im.nextSibling); });
  /* upload new images into a variant */
  ved.addEventListener('change', async e => {
    const inp = e.target.closest('[data-upload]'); if (!inp || !inp.files.length) return;
    const card = inp.closest('.vcard'); const fd = new FormData(); [...inp.files].forEach(f => fd.append('img[]', f)); fd.append('_t', $('[name=_t]').value);
    const add = $('.add', card), lbl = $('span', add); lbl.textContent = '…';
    try { const r = await fetch('upload.php', { method: 'POST', body: fd, credentials: 'same-origin' }); const d = await r.json(); (d.files || []).forEach(s => { add.closest('.imgs').insertAdjacentHTML('beforeend', imgHtml(s)); lib.unshift(s); }); if (d.error) alert(d.error); }
    catch (er) { alert('Upload failed'); }
    lbl.textContent = add.dataset.label; inp.value = ''; $('.imgs', card).appendChild(add); syncImgs(card);
  });
  /* picker over all existing images */
  function openPicker() {
    const box = document.createElement('div'); box.className = 'picker';
    const chosen = new Set($$('.im', pickTarget).map(im => im.dataset.src));
    box.innerHTML = '<div class="picker__box"><div class="picker__hd"><input type="search" placeholder="' + (ADM.lang === 'en' ? 'Search file name…' : 'Sök filnamn…') + '"><button type="button" class="b" data-done>' + (ADM.lang === 'en' ? 'Done' : 'Klar') + '</button></div><div class="picker__grid">' +
      lib.map(s => '<button type="button" data-s="' + s + '" class="' + (chosen.has(s) ? 'on' : '') + '" title="' + s.split('/').pop() + '"><img src="../' + s + '" loading="lazy" alt=""></button>').join('') + '</div></div>';
    document.body.appendChild(box);
    $('input', box).addEventListener('input', ev => { const q = ev.target.value.toLowerCase(); $$('[data-s]', box).forEach(b => { b.hidden = q && !b.dataset.s.toLowerCase().includes(q); }); });
    box.addEventListener('click', ev => {
      const b = ev.target.closest('[data-s]'); if (b) { b.classList.toggle('on'); return; }
      if (ev.target.closest('[data-done]') || ev.target === box) {
        const on = $$('[data-s].on', box).map(x => x.dataset.s); const keep = $$('.im', pickTarget).map(im => im.dataset.src).filter(s => on.includes(s)); const add = on.filter(s => !keep.includes(s));
        const imgs = $('.imgs', pickTarget); $$('.im', imgs).forEach(x => x.remove()); imgs.insertAdjacentHTML('afterbegin', [...keep, ...add].map(imgHtml).join('')); syncImgs(pickTarget); box.remove();
      }
    });
  }
  /* colour name → swatch preview */
  ved.addEventListener('input', e => { if (e.target.dataset.k === 'hex') { const sw = e.target.closest('.vcard').querySelector('.vcard__hd .swatch'); sw && (sw.style.background = e.target.value); } });
}

/* spec rows */
$('#addSpec')?.addEventListener('click', () => { const w = $('#specs'); const d = document.createElement('div'); d.className = 'specrow'; d.innerHTML = '<input name="spec_k[]" placeholder="' + (ADM.lang === 'en' ? 'e.g. Length' : 't.ex. Längd') + '"><input name="spec_v[]"><button type="button" class="b b--ghost b--icon" data-specrm>×</button>'; w.appendChild(d); });
document.addEventListener('click', e => { const b = e.target.closest('[data-specrm]'); if (b) b.parentElement.remove(); });

/* repeatable rows (FAQ, price list, hours): [data-rep] with template [data-rep-tpl] */
$$('[data-rep]').forEach(w => {
  const tpl = $('template', w);
  w.addEventListener('click', e => {
    if (e.target.closest('[data-rep-add]')) { const n = $$('[data-rep-row]', w).length; const d = document.createElement('div'); d.innerHTML = tpl.innerHTML.replace(/__i__/g, n + '_' + Date.now()); const row = d.firstElementChild; e.target.closest('[data-rep-add]').before(row); }
    const rm = e.target.closest('[data-rep-rm]'); if (rm) rm.closest('[data-rep-row]').remove();
    const up = e.target.closest('[data-rep-up]'); if (up) { const r = up.closest('[data-rep-row]'); r.previousElementSibling?.matches('[data-rep-row]') && r.parentElement.insertBefore(r, r.previousElementSibling); }
  });
});

/* drag-sort table rows, writes order into hidden inputs */
$$('table.sortable tbody').forEach(tb => {
  let drag = null;
  tb.addEventListener('dragstart', e => { drag = e.target.closest('tr'); drag.style.opacity = .4; });
  tb.addEventListener('dragend', () => { if (drag) drag.style.opacity = ''; drag = null; $$('tr', tb).forEach((tr, i) => { const o = $('[data-order]', tr); o && (o.value = (i + 1) * 10); }); tb.closest('form')?.querySelector('[data-sort-save]')?.removeAttribute('hidden'); });
  tb.addEventListener('dragover', e => { const tr = e.target.closest('tr'); if (!drag || !tr || tr === drag) return; e.preventDefault(); const r = tr.getBoundingClientRect(); tb.insertBefore(drag, e.clientY < r.top + r.height / 2 ? tr : tr.nextSibling); });
});

/* new orders / bookings: badge + sound + desktop note, polled every 45 s */
if (document.body.dataset.notify) {
  let last = null;
  const beep = () => { try { const a = new (window.AudioContext || window.webkitAudioContext)(); const o = a.createOscillator(), g = a.createGain(); o.connect(g); g.connect(a.destination); o.frequency.value = 880; g.gain.setValueAtTime(.15, a.currentTime); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + .6); o.start(); o.stop(a.currentTime + .6); } catch (e) {} };
  const poll = async () => {
    try {
      const r = await fetch('notify.php', { credentials: 'same-origin', cache: 'no-store' }); if (!r.ok) return; const d = await r.json();
      [['orders', d.orders], ['bookings', d.bookings], ['messages', d.messages]].forEach(([k, n]) => { const p = $('[data-nav="' + k + '"] .pill'); if (p && n !== undefined) { p.textContent = n; p.hidden = !n; } });
      if (last && (d.lastOrder > last.lastOrder || d.lastBooking > last.lastBooking)) { beep(); document.title = '● ' + document.title.replace(/^● /, ''); if ('Notification' in window && Notification.permission === 'granted') new Notification(d.lastOrder > last.lastOrder ? ADM.t.newOrder : ADM.t.newBooking); }
      last = d;
    } catch (e) {}
  };
  poll(); setInterval(poll, 45000);
  document.addEventListener('click', () => { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission(); }, { once: true });
}
})();
