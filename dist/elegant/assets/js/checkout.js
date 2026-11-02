/* Checkout: live summary, shipping by governorate, coupon preview, receipt upload, order submit. */
(() => {
  'use strict';
  const EB = window.EB, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const form = $('[data-co-form]'); if (!form || !EB.cart) return;
  const ar = EB.lang === 'ar';
  const byId = Object.fromEntries(EB.products.map(p => [p.id, p]));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let discount = 0, couponCode = '';

  const gov = $('[data-gov]'), err = $('[data-co-err]'), submit = $('[data-co-submit]');

  function totals() {
    const sub = EB.cart.subtotal();
    const opt = gov.selectedOptions[0];
    const fee = opt && opt.value ? +opt.dataset.fee : null;
    const ship = fee === null ? null : (EB.freeShip && sub - discount >= EB.freeShip ? 0 : fee);
    return { sub, ship, total: sub - discount + (ship || 0) };
  }

  function render() {
    const lines = EB.cart.get();
    $('[data-co-empty]').hidden = !!lines.length;
    form.hidden = !lines.length;
    $('[data-co-items]').innerHTML = lines.map(l => {
      const p = byId[l.id];
      return `<div class="co__item"><div class="co__item-img"><img src="${p.img}" alt=""><i>${l.qty}</i></div><b>${esc(p.name)}</b><span>${EB.money(p.price * l.qty)}</span></div>`;
    }).join('');
    const t = totals();
    $('[data-co-sub]').textContent = EB.money(t.sub);
    $('[data-co-ship]').textContent = t.ship === null ? (ar ? 'اختاري المحافظة' : 'Choose governorate') : (t.ship === 0 ? (ar ? 'مجاني ✦' : 'Free ✦') : EB.money(t.ship));
    $('[data-co-disc-row]').hidden = !discount;
    $('[data-co-disc]').textContent = '− ' + EB.money(discount);
    $('[data-co-total]').textContent = EB.money(t.total);
  }

  gov.addEventListener('change', render);
  document.addEventListener('eb:cart', () => { if (couponCode) applyCoupon(true); else render(); });

  // coupon
  const cIn = $('[data-coupon]'), cMsg = $('[data-coupon-msg]');
  function applyCoupon(silent) {
    const code = cIn.value.trim();
    if (!code) { discount = 0; couponCode = ''; cMsg.textContent = ''; render(); return; }
    fetch(`api/coupon.php?code=${encodeURIComponent(code)}&subtotal=${EB.cart.subtotal()}`).then(r => r.json()).then(r => {
      discount = r.ok ? +r.discount : 0; couponCode = r.ok ? r.code : '';
      if (!silent || !r.ok) { cMsg.textContent = r.msg; cMsg.className = 'coupon__msg ' + (r.ok ? 'ok' : 'bad'); }
      render();
    }).catch(() => { cMsg.textContent = '…'; });
  }
  $('[data-coupon-apply]').addEventListener('click', () => applyCoupon(false));
  cIn.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); applyCoupon(false); } });

  // payment method → transfer details
  const transfer = $('[data-transfer]');
  const syncPay = () => {
    const m = (form.querySelector('[name=payment]:checked') || {}).value;
    transfer.hidden = !(m === 'instapay' || m === 'vodafone');
    $$('[data-transfer-to]', transfer).forEach(p => p.hidden = p.dataset.transferTo !== m);
  };
  $$('[name=payment]', form).forEach(r => r.addEventListener('change', syncPay));
  syncPay();

  const rIn = $('[data-receipt]'), rLab = $('[data-receipt-label]'), rDef = rLab.textContent;
  rIn.addEventListener('change', () => { const f = rIn.files[0]; rLab.textContent = f ? '✓ ' + f.name : rDef; rIn.closest('.upload').classList.toggle('has-file', !!f); });

  // validation helpers
  const setErr = (name, msg) => {
    const el = form.elements[name]; if (!el || !el.closest) return;
    const f = el.closest('.field'); if (!f) return;
    f.classList.toggle('is-err', !!msg);
    let s = $('.field__err', f);
    if (msg) { if (!s) { s = document.createElement('span'); s.className = 'field__err'; f.appendChild(s); } s.textContent = msg; } else if (s) s.remove();
  };
  const normPhone = v => v.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/\D/g, '').replace(/^0020/, '0').replace(/^20(?=1\d{9}$)/, '0');
  $$('input,textarea,select', form).forEach(el => el.addEventListener('input', () => setErr(el.name, '')));

  function validate() {
    let ok = true; const f = form.elements;
    const req = (n, cond, msg) => { if (!cond) { setErr(n, msg || EB.s.required); ok = false; } };
    req('name', f.name.value.trim().length >= 3);
    req('phone', /^01[0125]\d{8}$/.test(normPhone(f.phone.value)), EB.s.phoneInvalid);
    if (f.phone2.value.trim()) req('phone2', /^01[0125]\d{8}$/.test(normPhone(f.phone2.value)), EB.s.phoneInvalid);
    req('gov', !!f.gov.value);
    req('city', f.city.value.trim().length >= 2);
    req('address', f.address.value.trim().length >= 6);
    if (!ok) { const first = $('.is-err', form); first && first.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    return ok;
  }

  form.addEventListener('submit', e => {
    e.preventDefault(); err.textContent = '';
    if (!validate()) return;
    const fd = new FormData(form);
    fd.set('coupon', couponCode);
    fd.set('cart', JSON.stringify(EB.cart.get().map(l => ({ id: l.id, qty: l.qty }))));
    submit.classList.add('is-loading');
    fetch('api/order.php', { method: 'POST', body: fd, headers: { 'X-CSRF': EB.csrf } })
      .then(r => r.json().catch(() => ({ ok: false })))
      .then(r => {
        if (!r.ok) { err.textContent = r.error || (ar ? 'حصلت مشكلة، حاولي تاني' : 'Something went wrong, please try again'); submit.classList.remove('is-loading'); return; }
        EB.cart.clear();
        location.href = `order.php?n=${encodeURIComponent(r.number)}&t=${encodeURIComponent(r.token)}`;
      })
      .catch(() => { err.textContent = ar ? 'تأكدي من الاتصال بالإنترنت وحاولي تاني' : 'Check your connection and try again'; submit.classList.remove('is-loading'); });
  });

  render();
})();
