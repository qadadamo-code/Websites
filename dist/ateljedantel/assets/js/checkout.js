/* Checkout: summary from the cart, coupon, shipping, validation, order request. */
(() => {
  const f = document.getElementById('co'); if (!f) return;
  const $ = s => f.querySelector(s), A = window.AD, T = k => A.t[k] || k;
  const SHIP = JSON.parse(f.dataset.ship || '{}');
  let coupon = null;
  const sub = () => A.getCart().reduce((s, i) => s + (A.VAR[i.v] ? A.VAR[i.v].v.price * i.q : 0), 0);
  function render() {
    const c = A.getCart();
    $('#coItems').innerHTML = c.length ? c.map(i => { const x = A.VAR[i.v]; if (!x) return ''; return '<div class="li"><img src="' + A.esc(x.v.img || x.p.img) + '" alt=""><div><h4>' + A.esc(x.p.title) + '</h4><small>' + A.esc([x.v.color, x.v.size].filter(Boolean).join(' · ')) + ' · ' + i.q + ' st</small>' + (x.v.order ? '<small>' + T('ui.order') + '</small>' : '') + '</div><span class="price">' + A.kr(x.v.price * i.q) + '</span></div>'; }).join('')
      : '<div class="empty"><p>' + T('ui.cartempty') + '</p><a class="btn btn--sm" href="butik.php">' + T('ui.continue') + '</a></div>';
    const s = sub(); const d = coupon ? Math.min(coupon.discount, s) : 0;
    const post = f.ship && [...f.querySelectorAll('[name=ship]')].find(r => r.checked)?.value === 'post';
    const ship = post ? (SHIP.free && s - d >= SHIP.free ? 0 : SHIP.post) : 0;
    $('#sSub').textContent = A.kr(s);
    $('#sDiscRow').hidden = !d; $('#sDisc').textContent = '-' + A.kr(d);
    $('#sShip').textContent = ship ? A.kr(ship) : T('co.free');
    $('#sTotal').textContent = A.kr(Math.max(0, s - d) + ship);
    $('#addr').hidden = !post;
    f.querySelectorAll('[data-pay="store"]').forEach(el => { el.hidden = post; if (post && el.querySelector('input').checked) { const o = f.querySelector('[data-pay]:not([hidden]) input'); o && (o.checked = true); } });
    $('#placeBtn').disabled = !c.length;
  }
  A.catReady.then(render);
  f.addEventListener('change', e => { if (e.target.name === 'ship') render(); });
  window.addEventListener('storage', render);
  /* the cart drawer may change quantities on this page too */
  const _set = A.setCart; A.setCart = c => { _set(c); render(); };
  document.getElementById('cartList')?.addEventListener('click', () => setTimeout(render, 0));
  async function applyCoupon() {
    const code = $('#coupon').value.trim(); const m = $('#couponMsg');
    if (!code) { coupon = null; m.textContent = ''; render(); return; }
    try {
      const r = await fetch('api/coupon.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, subtotal: sub() }) });
      const d = await r.json(); coupon = d.ok ? d : null; m.className = 'coupon-msg ' + (d.ok ? 'ok' : 'bad'); m.textContent = d.msg || '';
    } catch (e) { m.className = 'coupon-msg bad'; m.textContent = T('f.err'); }
    render();
  }
  $('#couponBtn').addEventListener('click', applyCoupon);
  $('#coupon').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); } });
  function showErrors(errs) {
    f.querySelectorAll('.fld').forEach(x => { x.classList.remove('err'); const m = x.querySelector('.msg'); m && (m.textContent = ''); });
    f.querySelector('[data-msg=pay]').textContent = '';
    let first = null;
    Object.entries(errs).forEach(([k, v]) => {
      const inp = f.querySelector('[name="' + k + '"]'); if (!inp) return;
      const fld = inp.closest('.fld');
      if (fld) { fld.classList.add('err'); const m = fld.querySelector('.msg'); m && (m.textContent = v); }
      if (k === 'pay') f.querySelector('[data-msg=pay]').textContent = v;
      if (k === 'terms') inp.closest('.check').style.color = 'var(--red)';
      first = first || inp;
    });
    first && first.focus();
  }
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(f); const errs = {};
    const post = fd.get('ship') === 'post';
    if (!fd.get('name').trim()) errs.name = T('f.req');
    if (!/^\S+@\S+\.\S+$/.test(fd.get('email'))) errs.email = T('f.email');
    if (fd.get('phone').replace(/\D/g, '').length < 7) errs.phone = T('f.req');
    if (post) ['address', 'zip', 'city'].forEach(k => { if (!String(fd.get(k) || '').trim()) errs[k] = T('f.req'); });
    if (!fd.get('pay')) errs.pay = T('f.req');
    if (!fd.get('terms')) errs.terms = T('f.req');
    $('#coErr').textContent = '';
    if (Object.keys(errs).length) { showErrors(errs); $('#coErr').textContent = T('co.err'); return; }
    showErrors({}); $('.check').style.color = '';
    const btn = $('#placeBtn'); btn.disabled = true; const old = btn.innerHTML; btn.textContent = T('co.sending');
    const body = Object.fromEntries(fd.entries()); body.terms = !!fd.get('terms'); body.items = A.getCart(); body.coupon = coupon ? coupon.code : '';
    try {
      const r = await fetch('api/order.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const d = await r.json();
      if (d.ok) { A.setCart([]); location.href = d.url; return; }
      if (d.errors) showErrors(d.errors);
      $('#coErr').textContent = d.msg || T('f.err');
    } catch (er) { $('#coErr').textContent = T('f.err'); }
    btn.disabled = false; btn.innerHTML = old;
  });
})();
