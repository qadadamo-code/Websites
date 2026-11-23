<?php
/**
 * Service charge, VAT and delivery prices. Edits are kept as a draft until someone with the
 * permission approves them; only the approved version is used by the website, orders and invoices.
 */
require __DIR__ . '/inc.php';
require_perm('settings.site');
$s = settings();
$types = ORDER_TYPES_ALL;

if (posted()) {
    $act = p('act');
    if ($act === 'discard') {
        $n = $s; unset($n['chargesDraft']); bc_save('settings', $n);
        log_act('إلغاء مسودة الرسوم'); flash('اتلغت المسودة ورجعنا للمنشور'); go('charges.php');
    }
    $zones = [];
    $zn = (array)($_POST['zone_name'] ?? []); $zf = (array)($_POST['zone_fee'] ?? []);
    foreach ($zn as $i => $name) {
        $name = clean((string)$name, 40); if ($name === '') continue;
        $zones[] = ['name' => $name, 'fee' => max(0, min(100000, (float)digits_en((string)($zf[$i] ?? '0'))))];
    }
    $num = fn($k, $max) => max(0, min($max, (float)digits_en(p($k) ?: '0')));
    $c = [
        'service' => $num('service', 30), 'serviceTypes' => array_values(array_intersect((array)($_POST['serviceTypes'] ?? []), $types)),
        'vat' => $num('vat', 30), 'deliveryFee' => $num('deliveryFee', 100000), 'zones' => array_slice($zones, 0, 60),
        'freeOver' => $num('freeOver', 1000000), 'minOrder' => $num('minOrder', 1000000),
        'by' => me()['name'] ?? '', 'at' => now_iso(),
    ];
    if ($act === 'publish') {
        $n = array_merge($s, ['charges' => $c]); unset($n['chargesDraft']);
        bc_save('settings', $n);
        log_act('اعتماد الرسوم ونشرها', 'خدمة ' . $c['service'] . '% · ضريبة ' . $c['vat'] . '% · ' . count($zones) . ' منطقة توصيل');
        flash('اتعتمدت ونزلت على الموقع: كل الطلبات الجديدة هتتحسب بيها'); go('charges.php');
    }
    bc_save('settings', array_merge($s, ['chargesDraft' => $c]));
    log_act('حفظ مسودة الرسوم');
    flash('اتحفظت كمسودة، لسه مش ظاهرة على الموقع. راجعها ودوس "اعتماد ونشر"'); go('charges.php');
}

$live = charges();
$liveMeta = $s['charges'] ?? [];
$draft = $s['chargesDraft'] ?? null;
$c = $draft ?: array_merge($live, ['serviceTypes' => $live['serviceTypes']]);
$fmtP = fn($v) => rtrim(rtrim(number_format((float)$v, 2), '0'), '.');
admin_head('التوصيل والرسوم', 'charges');
?>
<?php if ($draft): ?>
<div class="flash flash--warn np" style="margin-bottom:16px"><span>في مسودة محفوظة<?= !empty($draft['by']) ? ' من ' . e($draft['by']) : '' ?> لسه ما اتعتمدتش. الموقع شغال بالأسعار المنشورة لحد ما تدوس "اعتماد ونشر".</span></div>
<?php endif; ?>
<form method="post" class="cols" id="chgForm">
  <?= csrf_field() ?>
  <div style="display:flex;flex-direction:column;gap:18px">
    <section class="card">
      <div class="card__head"><h3>الخدمة والضريبة</h3><span class="muted">بتتحسب بعد الخصم</span></div>
      <div class="fg">
        <label class="f"><span>نسبة الخدمة %</span><input name="service" inputmode="decimal" class="latin" value="<?= e($fmtP($c['service'])) ?>" data-calc></label>
        <label class="f"><span>ضريبة القيمة المضافة %</span><input name="vat" inputmode="decimal" class="latin" value="<?= e($fmtP($c['vat'])) ?>" data-calc><small>في مصر 14%. بتتحسب على الطلب + الخدمة</small></label>
        <div class="f f--full"><span>الخدمة بتتضاف على</span>
          <div class="chips-row">
            <?php foreach ($types as $t): ?><label class="chk"><input type="checkbox" name="serviceTypes[]" value="<?= e($t) ?>" <?= in_array($t, $c['serviceTypes'] ?? [], true) ? 'checked' : '' ?> data-calc> <?= $t ?></label><?php endforeach; ?>
          </div>
        </div>
      </div>
    </section>
    <section class="card">
      <div class="card__head"><h3>التوصيل</h3><span class="muted">لو مفيش مناطق، السعر الثابت هو اللي بيتحسب</span></div>
      <div class="fg">
        <label class="f"><span>سعر توصيل ثابت (EGP)</span><input name="deliveryFee" inputmode="decimal" class="latin" value="<?= e($fmtP($c['deliveryFee'])) ?>" data-calc></label>
        <label class="f"><span>توصيل مجاني للطلبات من (EGP)</span><input name="freeOver" inputmode="decimal" class="latin" value="<?= e($fmtP($c['freeOver'])) ?>" placeholder="0 = مش مفعّل" data-calc></label>
        <label class="f"><span>أقل طلب للتوصيل (EGP)</span><input name="minOrder" inputmode="decimal" class="latin" value="<?= e($fmtP($c['minOrder'])) ?>" placeholder="0 = مفيش حد أدنى"></label>
      </div>
      <h4 class="sub-h">أسعار حسب المنطقة</h4>
      <div id="zones" class="zones">
        <?php foreach (($c['zones'] ?? []) ?: [['name' => '', 'fee' => '']] as $z): ?>
        <div class="zrow"><input name="zone_name[]" class="inp" value="<?= e($z['name']) ?>" placeholder="اسم المنطقة، مثلاً وسط البلد"><input name="zone_fee[]" class="inp latin" inputmode="decimal" value="<?= e($z['fee'] === '' ? '' : $fmtP($z['fee'])) ?>" placeholder="السعر" data-calc><button type="button" class="icon-b" data-zdel title="حذف"><?= icon('trash') ?></button></div>
        <?php endforeach; ?>
      </div>
      <template id="zoneTpl"><div class="zrow"><input name="zone_name[]" class="inp" placeholder="اسم المنطقة"><input name="zone_fee[]" class="inp latin" inputmode="decimal" placeholder="السعر" data-calc><button type="button" class="icon-b" data-zdel title="حذف"><?= icon('trash') ?></button></div></template>
      <button type="button" class="b b--sm" id="zoneAdd"><?= icon('plus') ?> منطقة جديدة</button>
    </section>
  </div>
  <aside style="display:flex;flex-direction:column;gap:18px">
    <section class="card chg-prev">
      <div class="card__head"><h3>معاينة على طلب</h3><label class="muted">قيمة الطلب <input id="pvAmt" class="inp latin" value="200" inputmode="numeric" style="width:90px;display:inline-block;padding:6px 10px"></label></div>
      <div id="pvOut"></div>
    </section>
    <section class="card">
      <div class="card__head"><h3>المنشور على الموقع دلوقتي</h3></div>
      <ul class="ckv">
        <li><span>الخدمة</span><b class="latin"><?= $fmtP($live['service']) ?>%</b></li>
        <li><span>الضريبة</span><b class="latin"><?= $fmtP($live['vat']) ?>%</b></li>
        <li><span>التوصيل</span><b><?= $live['zones'] ? count($live['zones']) . ' منطقة' : egp($live['deliveryFee']) ?></b></li>
        <?php if (!empty($liveMeta['by'])): ?><li><span>اعتمدها</span><b><?= e($liveMeta['by']) ?> · <?= ago($liveMeta['at'] ?? '') ?></b></li><?php endif; ?>
      </ul>
    </section>
    <div class="chg-acts">
      <button class="b" name="act" value="draft"><?= icon('edit') ?> حفظ كمسودة</button>
      <button class="b b--primary" name="act" value="publish" data-confirm="الأسعار دي هتتطبق على الموقع وكل الطلبات الجديدة. تعتمدها؟"><?= icon('shield') ?> اعتماد ونشر على الموقع</button>
      <?php if ($draft): ?><button class="b b--danger" name="act" value="discard" formnovalidate data-confirm="إلغاء المسودة والرجوع للمنشور؟">إلغاء المسودة</button><?php endif; ?>
    </div>
  </aside>
</form>
<script>
(() => {
  const f = document.getElementById('chgForm'), out = document.getElementById('pvOut'), amt = document.getElementById('pvAmt');
  const num = (v) => parseFloat(String(v || '').replace(/[^\d.]/g, '')) || 0;
  const fmt = (n) => Math.round(n).toLocaleString('en-US') + ' EGP';
  const calc = () => {
    const sv = num(f.service.value), vat = num(f.vat.value), types = [...f.querySelectorAll('[name="serviceTypes[]"]:checked')].map((i) => i.value);
    const fee = num(f.deliveryFee.value), free = num(f.freeOver.value), net = num(amt.value);
    const zones = [...f.querySelectorAll('.zrow')].map((r) => ({ n: r.children[0].value.trim(), fee: num(r.children[1].value) })).filter((z) => z.n);
    const row = (type, del) => {
      const s = types.includes(type) ? Math.round(net * sv / 100) : 0, v = Math.round((net + s) * vat / 100);
      const d = type === 'توصيل' ? ((free > 0 && net >= free) ? 0 : del) : 0;
      return `<div class="pv"><b>${type}${type === 'توصيل' && zones.length ? ' <small>(' + (zones.find((z) => z.fee === del) || {}).n + ')</small>' : ''}</b><span>${[s ? 'خدمة ' + fmt(s) : '', v ? 'ضريبة ' + fmt(v) : '', type === 'توصيل' ? 'توصيل ' + (d ? fmt(d) : 'مجاني') : ''].filter(Boolean).join(' · ') || 'من غير رسوم إضافية'}</span><i class="latin">${fmt(net + s + v + d)}</i></div>`;
    };
    out.innerHTML = row('استلام من المطبخ', 0) + row('توصيل', zones.length ? zones[0].fee : fee);
  };
  f.addEventListener('input', calc); f.addEventListener('change', calc); amt.addEventListener('input', calc);
  document.getElementById('zoneAdd').addEventListener('click', () => { document.getElementById('zones').appendChild(document.getElementById('zoneTpl').content.cloneNode(true)); });
  document.getElementById('zones').addEventListener('click', (e) => { const b = e.target.closest('[data-zdel]'); if (b) { b.closest('.zrow').remove(); calc(); } });
  calc();
})();
</script>
<?php admin_foot();
