/* Tablia dashboard — small progressive enhancements. */
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
    const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = 'TB';
    for (let i = 0; i < 5; i++) s += a[Math.floor(Math.random() * a.length)];
    $(gen.dataset.genCode).value = s;
  });

  // ---- order editor: lines, live totals ----
  const lines = $('#lines');
  if (lines) {
    const fmt = (n) => (Math.round(n * 100) / 100).toLocaleString('en-US');
    const calc = () => {
      let sub = 0;
      $$('.oline', lines).forEach((r) => {
        const q = parseFloat($('[data-line-qty]', r).value) || 0, p = parseFloat($('[data-line-price]', r).value) || 0;
        sub += q * p; $('[data-line-sum]', r).textContent = q && p ? fmt(q * p) : '';
      });
      const d = Math.min(sub, parseFloat(($('#discInp') || {}).value) || 0);
      const f = $('#orderForm'), ch = JSON.parse(f.dataset.charges || '{}'), on = $('#chgOn') && $('#chgOn').checked;
      const type = (f.querySelector('[name=type]') || {}).value, zone = (f.querySelector('[name=zone]') || {}).value || '';
      const net = Math.max(0, sub - d); let sv = 0, vat = 0, del = 0;
      if (on) {
        sv = (ch.serviceTypes || []).includes(type) ? Math.round(net * ch.service / 100) : 0;
        vat = Math.round((net + sv) * ch.vat / 100);
        if (type === 'توصيل') { del = ch.deliveryFee; const z = (ch.zones || []).find((z) => z.name === zone); if (z) del = z.fee; if (ch.freeOver > 0 && net >= ch.freeOver) del = 0; }
      }
      const parts = []; if (sv) parts.push(`خدمة ${fmt(sv)}`); if (vat) parts.push(`ضريبة ${fmt(vat)}`); if (del) parts.push(`توصيل ${fmt(del)}`);
      const co = $('#chgOut'); if (co) { co.textContent = parts.join(' · '); co.hidden = !parts.length; }
      $('#subOut').textContent = fmt(sub); $('#totOut').textContent = fmt(net + sv + vat + del);
    };
    lines.addEventListener('input', calc);
    $('#orderForm').addEventListener('change', calc);
    $('#discInp') && $('#discInp').addEventListener('input', calc);
    lines.addEventListener('change', (e) => {
      const s = e.target.closest('[data-line-item]'); if (!s) return;
      const o = s.selectedOptions[0], r = s.closest('.oline');
      if (o && o.value) { $('[name="line_name[]"]', r).value = o.dataset.name || ''; $('[data-line-price]', r).value = o.dataset.unit || ''; const z = $('[data-line-size]', r); if (z) z.value = o.dataset.size || ''; }
      calc();
    });
    lines.addEventListener('click', (e) => {
      const b = e.target.closest('[data-line-del]'); if (!b) return;
      const row = b.closest('.oline');
      if ($$('.oline', lines).length > 1) lines.removeChild(row);
      else $$('input', row).forEach((i) => (i.value = i.matches('[data-line-qty]') ? 1 : ''));
      calc();
    });
    $('#addLine') && $('#addLine').addEventListener('click', () => {
      lines.appendChild($('#lineTpl').content.cloneNode(true));
      const last = $$('.oline', lines).pop(); $('select', last).focus(); calc();
    });
    calc();
  }

  // ---- users: role presets for permission checkboxes ----
  const roleIn = $$('[data-role]');
  if (roleIn.length && window.ROLE_PERMS) {
    const box = $('#permsBox');
    const apply = () => {
      const r = roleIn.find((x) => x.checked); if (!r) return;
      const custom = r.value === 'custom';
      box.classList.toggle('is-locked', !custom);
      $$('[data-perm]').forEach((c) => {
        if (!custom) c.checked = (window.ROLE_PERMS[r.value] || []).includes(c.dataset.perm);
        c.disabled = !custom;
      });
    };
    roleIn.forEach((r) => r.addEventListener('change', apply));
    box.closest('form').addEventListener('submit', () => $$('[data-perm]').forEach((c) => (c.disabled = false)));
    apply();
  }

  // ---- password generator ----
  $$('[data-gen-pass]').forEach((inp) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'b b--sm'; b.textContent = 'توليد كلمة مرور';
    b.style.marginTop = '6px';
    b.addEventListener('click', () => {
      const a = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'; const r = new Uint32Array(12); crypto.getRandomValues(r);
      inp.value = [...r].map((x) => a[x % a.length]).join(''); inp.focus(); inp.select();
    });
    inp.insertAdjacentElement('afterend', b);
  });

  // ---- inline edit rows (event guests) ----
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-toggle-row]'); if (!b) return;
    e.preventDefault();
    const r = document.getElementById(b.dataset.toggleRow); if (r) { r.hidden = !r.hidden; if (!r.hidden) { const i = $('input', r); i && i.focus(); } }
  });
  // ---- WhatsApp one-tap sender ----
  const run = $('#waRun');
  if (run) {
    const items = () => $$('#waList li:not(.is-sent):not(.is-skip)');
    const go = $('#waGo'), skip = $('#waSkip'), msg = $('#waMsg');
    let cur = null;
    const link = (li) => 'https://wa.me/' + li.dataset.wa + '?text=' + encodeURIComponent(msg.value.replace(/\{name\}/g, li.dataset.name || '').trim());
    const show = () => {
      $$('#waList li.is-cur').forEach((x) => x.classList.remove('is-cur'));
      cur = items()[0] || null;
      $('#waLeft').textContent = items().length;
      if (!cur) { $('#waCur').hidden = true; skip.hidden = true; go.removeAttribute('href'); go.classList.add('is-done'); go.textContent = 'خلصت القائمة ✓'; return; }
      cur.classList.add('is-cur'); cur.scrollIntoView({ block: 'nearest' });
      $('#waCur').hidden = false; skip.hidden = false;
      $('#waName').textContent = cur.dataset.full || 'عميل'; $('#waPhone').textContent = '+' + cur.dataset.wa;
      go.href = link(cur); go.lastChild.textContent = ' افتح واتساب وابعت';
    };
    msg.addEventListener('input', () => cur && (go.href = link(cur)));
    go.addEventListener('click', () => {
      if (!cur) return;
      const li = cur, body = new URLSearchParams({ _t: run.dataset.csrf, act: 'mark', wa: li.dataset.wa, t: run.dataset.key });
      fetch(location.pathname, { method: 'POST', body }).catch(() => {});
      li.classList.add('is-sent'); $('em', li).textContent = '✓ اتبعت';
      setTimeout(show, 150);
    });
    skip.addEventListener('click', () => { if (cur) { cur.classList.add('is-skip'); show(); } });
    show();
  }
  // ---- live order alerts: sound + toast + browser notification + sidebar counters ----
  if (document.body.dataset.notify) {
    const KEY = 'tb_seen';
    let seen = null; try { seen = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (_) {}
    let ctx = null, sig = '';
    const baseTitle = document.title;
    const unlock = () => { try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); } catch (_) {} };
    document.addEventListener('pointerdown', unlock, { once: true });
    const chime = () => {
      if (!ctx) return;
      const t = ctx.currentTime;
      [[880, 0], [1320, 0.16], [1760, 0.32]].forEach(([f, d]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0.0001, t + d); g.gain.exponentialRampToValueAtTime(0.35, t + d + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.45);
        o.start(t + d); o.stop(t + d + 0.5);
      });
    };
    const bell = $('#nbell');
    const wantBell = () => ('Notification' in window && Notification.permission === 'default') || !localStorage.getItem('tb_bell');
    if (bell && wantBell()) bell.hidden = false;
    if (bell) bell.addEventListener('click', async () => {
      unlock(); chime();
      try { if ('Notification' in window && Notification.permission === 'default') await Notification.requestPermission(); } catch (_) {}
      try { localStorage.setItem('tb_bell', '1'); } catch (_) {}
      bell.hidden = true;
    });
    let toastEl = null, toastT;
    const showToast = (title, sub, href) => {
      if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'ntoast'; toastEl.setAttribute('role', 'alert'); document.body.appendChild(toastEl); }
      toastEl.innerHTML = `<span class="ntoast__ic"><svg class="ic" viewBox="0 0 24 24"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 0 0 4 0"/></svg></span>
        <span><b></b><small></small></span><a class="b b--sm b--primary">افتح</a><button class="ntoast__x" aria-label="إغلاق">×</button>`;
      toastEl.querySelector('b').textContent = title;
      toastEl.querySelector('small').textContent = sub;
      toastEl.querySelector('a').href = href;
      toastEl.querySelector('.ntoast__x').onclick = () => toastEl.classList.remove('show');
      requestAnimationFrame(() => toastEl.classList.add('show'));
      clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 20000);
    };
    const notifyOS = (title, body, href) => {
      if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
        try { const nt = new Notification(title, { body, icon: '../assets/brand/favicon.png', tag: 'tb-' + href }); nt.onclick = () => { focus(); location.href = href; }; } catch (_) {}
      }
    };
    const dm = (d) => d ? d.slice(8, 10) + '/' + d.slice(5, 7) : '';
    const setPill = (nav, n) => {
      const p = document.querySelector(`[data-nav="${nav}"] .pill`); if (!p) return;
      if (String(n) !== p.textContent) { p.classList.remove('bump'); void p.offsetWidth; if (n > (+p.textContent || 0)) p.classList.add('bump'); }
      p.textContent = n; p.hidden = !n;
    };
    const poll = async () => {
      let d; try { d = await fetch('notify.php', { credentials: 'same-origin', cache: 'no-store' }).then((r) => r.json()); } catch (_) { return; }
      if (!d || !d.ok) return;
      setPill('orders', d.orders); setPill('reservations', d.res); setPill('kitchen', d.today);
      const ids = (d.newIds || []).concat((d.newRes || []).map((x) => 'r:' + x));
      if (seen === null) seen = ids.slice();
      const fresh = ids.filter((id) => !seen.includes(id));
      const freshO = fresh.filter((x) => !x.startsWith('r:')), freshR = fresh.filter((x) => x.startsWith('r:'));
      if (freshO.length && d.latest) {
        const o = d.latest, href = 'orders.php?open=' + encodeURIComponent(o.id) + '#detail';
        const t = freshO.length > 1 ? `${freshO.length} طلبات جديدة` : `طلب جديد · ${o.name}`;
        const sub = `#${o.no} · ${o.items} صنف · ${o.total.toLocaleString('en')} ج${o.day ? ' · تسليم ' + dm(o.day) : ''}`;
        chime(); showToast(t, sub, href); notifyOS(t, sub, href);
      } else if (freshR.length && d.latestRes) {
        const r = d.latestRes, href = 'reservation.php?id=' + encodeURIComponent(r.id);
        const t = `عزومة جديدة · ${r.name}`, sub = `${r.occasion || 'مناسبة'} · ${r.guests} فرد · ${dm(r.date)}`;
        chime(); showToast(t, sub, href); notifyOS(t, sub, href);
      }
      seen = Array.from(new Set(seen.concat(ids))).slice(-400);
      try { localStorage.setItem(KEY, JSON.stringify(seen)); } catch (_) {}
      document.title = (d.orders + d.res) ? `(${d.orders + d.res}) ${baseTitle}` : baseTitle;
    };
    poll(); setInterval(poll, 10000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) poll(); });
  }
})();
