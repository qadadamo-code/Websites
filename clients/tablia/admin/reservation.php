<?php
/** Add or edit an occasion booking (buffet / set menu / custom feast): package, guests, price, deposit, address. */
require __DIR__ . '/inc.php';
require_perm('res.edit');
$all = bc_load('reservations');
$packs = sort_by_order(bc_load('packages')); $pById = []; foreach ($packs as $p) $pById[$p['id']] = $p;
$id = (string)($_GET['id'] ?? '');
$r = null; foreach ($all as $x) if ($x['id'] === $id) $r = $x;
if ($id !== '' && !$r) { flash('العزومة مش موجودة', 'bad'); go('reservations.php'); }
$isNew = !$r;
$pname = fn($p) => ($p['type'] === 'buffet' ? 'أوبن بوفيه' : 'سِت منيو') . ' · ' . $p['name'];

if (posted()) {
    if (p('act') === 'delete' && !$isNew) {
        need('res.delete'); log_act('حذف عزومة', $r['name'] . ' · ' . $r['date']);
        bc_tx('reservations', function (&$d) use ($id) { $d = array_values(array_filter($d, fn($x) => $x['id'] !== $id)); });
        flash('اتحذفت العزومة'); go('reservations.php');
    }
    $pk = p('package'); $pack = $pById[$pk] ?? null;
    $guests = max(1, min(5000, (int)digits_en(p('guests'))));
    $pp = (float)digits_en(p('pp')); if ($pp <= 0 && $pack) $pp = (float)$pack['price'];
    $est = (float)digits_en(p('estimate')); if ($est <= 0) $est = $pp * $guests;
    $row = array_merge($r ?: ['id' => bc_id('r'), 'at' => now_iso(), 'code' => 'TB-' . random_int(1000, 9999), 'source' => 'manual'], [
        'name' => clean(p('name'), 80), 'phone' => clean(digits_en(p('phone')), 30), 'date' => pdate('date'), 'time' => ptime('time'),
        'guests' => $guests, 'occasion' => clean(p('occasion'), 60),
        'package' => $pack['id'] ?? '', 'packageName' => $pack ? $pname($pack) : (clean(p('custom'), 80) ?: 'عزومة حسب الطلب'),
        'pp' => $pp, 'estimate' => $est, 'deposit' => max(0, (float)digits_en(p('deposit'))), 'address' => clean(p('address'), 200),
        'notes' => clean(p('notes'), 400), 'staffNote' => clean(p('staffNote'), 400),
        'status' => isset(RES_ST[p('status')]) ? p('status') : 'new', 'updated' => now_iso(), 'updatedBy' => me()['name'] ?? '',
    ]);
    if ($row['name'] === '' || $row['date'] === '') { flash('الاسم والتاريخ مطلوبين', 'bad'); go('reservation.php' . ($isNew ? '' : '?id=' . rawurlencode($id))); }
    bc_tx('reservations', function (&$d) use ($row, $isNew) {
        if ($isNew) { array_unshift($d, $row); return; }
        foreach ($d as $i => $x) if ($x['id'] === $row['id']) $d[$i] = $row;
    });
    log_act($isNew ? 'إضافة عزومة' : 'تعديل عزومة', $row['name'] . ' · ' . $row['date'] . ' · ' . $row['guests'] . ' فرد · ' . egp($row['estimate']));
    flash($isNew ? 'اتسجلت العزومة' : 'اتحفظت العزومة');
    go('reservation.php?id=' . rawurlencode($row['id']));
}
$r = $r ?: ['name' => '', 'phone' => '', 'date' => date('Y-m-d', strtotime('+3 days')), 'time' => '14:00', 'guests' => 100, 'occasion' => '', 'package' => '', 'packageName' => '', 'pp' => 0, 'estimate' => 0, 'deposit' => 0, 'address' => '', 'notes' => '', 'staffNote' => '', 'status' => 'new', 'code' => ''];
$rest = max(0, (float)$r['estimate'] - (float)$r['deposit']);
$wp = wa_phone($r['phone'] ?? '');
$cur = $pById[$r['package']] ?? null;
admin_head($isNew ? 'عزومة جديدة' : 'عزومة ' . $r['name'], 'reservations', '<a class="b" href="reservations.php">رجوع للعزايم</a>');
?>
<form method="post" class="form-grid" id="resForm">
  <?= csrf_field() ?>
  <section class="card">
    <div class="card__head"><h3>العميل والمناسبة</h3><?php if ($r['code']): ?><span class="code"><?= e($r['code']) ?></span><?php endif; ?></div>
    <div class="fg">
      <label class="f"><span>الاسم *</span><input name="name" value="<?= e($r['name']) ?>" required maxlength="80"></label>
      <label class="f"><span>الموبايل</span><input name="phone" value="<?= e($r['phone']) ?>" class="latin" dir="ltr" inputmode="tel"></label>
      <label class="f"><span>المناسبة</span><input name="occasion" value="<?= e($r['occasion']) ?>" maxlength="60" list="occList" placeholder="فرح، عزومة عيلة، اجتماع شركة…">
        <datalist id="occList"><option>عزومة عيلة</option><option>خطوبة</option><option>فرح</option><option>عيد ميلاد</option><option>اجتماع شركة</option><option>عزاء</option><option>إفطار رمضان</option></datalist></label>
      <label class="f"><span>الحالة</span><select name="status"><?php foreach (RES_ST as $k => $l): ?><option value="<?= $k ?>" <?= sel($r['status'], $k) ?>><?= $l ?></option><?php endforeach; ?></select></label>
      <label class="f"><span>التاريخ *</span><input name="date" type="date" value="<?= e($r['date']) ?>" required></label>
      <label class="f"><span>ميعاد التسليم</span><input name="time" type="time" value="<?= e($r['time']) ?>"></label>
      <label class="f f--full"><span>عنوان المناسبة</span><input name="address" value="<?= e($r['address'] ?? '') ?>" maxlength="200"></label>
    </div>
  </section>

  <section class="card">
    <div class="card__head"><h3>الباقة والحساب</h3></div>
    <div class="fg">
      <label class="f f--full"><span>الباقة</span><select name="package" id="pkSel">
        <option value="" data-pp="0">عزومة حسب الطلب (منيو مخصوص)</option>
        <?php foreach ($packs as $p): ?><option value="<?= e($p['id']) ?>" data-pp="<?= 0 + $p['price'] ?>" <?= sel($r['package'], $p['id']) ?>><?= e($pname($p)) ?> · <?= egp($p['price']) ?> للفرد</option><?php endforeach; ?>
      </select></label>
      <label class="f f--full" id="customWrap"<?= $r['package'] ? ' hidden' : '' ?>><span>وصف المنيو المخصوص</span><input name="custom" value="<?= e($r['package'] ? '' : ($r['packageName'] ?? '')) ?>" maxlength="80" placeholder="مثال: 2 صينية محشي + كيلو ممبار + فراخ"></label>
      <label class="f"><span>عدد الأفراد</span><input name="guests" id="gIn" type="number" min="1" max="5000" value="<?= (int)$r['guests'] ?>" class="latin"></label>
      <label class="f"><span>سعر الفرد (ج)</span><input name="pp" id="ppIn" inputmode="decimal" value="<?= e((string)(0 + $r['pp'])) ?>" class="latin"></label>
      <label class="f"><span>إجمالي الاتفاق (ج)</span><input name="estimate" id="estIn" inputmode="decimal" value="<?= e((string)(0 + $r['estimate'])) ?>" class="latin"><small>بيتحسب تلقائي = الأفراد × سعر الفرد، وتقدر تكتب رقم الاتفاق النهائي.</small></label>
      <label class="f"><span>العربون المدفوع (ج)</span><input name="deposit" id="depIn" inputmode="decimal" value="<?= e((string)(0 + $r['deposit'])) ?>" class="latin"></label>
      <div class="f f--full"><div class="kpi" style="padding:14px 18px"><span>الباقي على العميل</span><b class="latin" id="restOut"><?= number_format($rest) ?></b><small>جنيه</small></div></div>
    </div>
  </section>

  <?php if ($cur): ?>
  <section class="card">
    <div class="card__head"><h3>محتوى الباقة</h3><?php if (can('pack.edit')): ?><a href="packages.php?id=<?= e($cur['id']) ?>">تعديل الباقة ←</a><?php endif; ?></div>
    <div class="pack__body" style="padding:0">
      <?php foreach (['mains' => 'الأساسي', 'apps' => 'المقبلات', 'salads' => 'السلطات', 'sweets' => 'الحلو'] as $k => $l): if (!empty($cur[$k])): ?><div><b><?= $l ?>:</b> <?= e(implode(' • ', $cur[$k])) ?></div><?php endif; endforeach; ?>
      <?php if (!empty($cur['sweetsAlt'])): ?><div class="muted"><?= e($cur['sweetsAlt']) ?></div><?php endif; ?>
    </div>
  </section>
  <?php endif; ?>

  <section class="card<?= $cur ? '' : ' card--full' ?>">
    <div class="card__head"><h3>ملاحظات</h3></div>
    <div class="fg">
      <label class="f f--full"><span>ملاحظات العميل</span><textarea name="notes" rows="3" maxlength="400"><?= e($r['notes']) ?></textarea></label>
      <label class="f f--full"><span>ملاحظة داخلية (للفريق فقط)</span><textarea name="staffNote" rows="2" maxlength="400"><?= e($r['staffNote'] ?? '') ?></textarea></label>
    </div>
  </section>

  <div class="form-actions">
    <a class="b" href="reservations.php">إلغاء</a><button class="b b--primary"><?= $isNew ? 'تسجيل العزومة' : 'حفظ' ?></button>
    <?php if (!$isNew && $wp): $msg = "أهلًا {$r['name']} ✨\nعزومتك مع طبلية اتأكدت\n📅 " . date('d/m', strtotime($r['date'])) . ($r['time'] ? ' الساعة ' . $r['time'] : '') . "\n👥 " . (int)$r['guests'] . " فرد\n🍽 " . ($r['packageName'] ?? '') . "\n💰 الإجمالي " . number_format((float)$r['estimate']) . ' ج' . ((float)$r['deposit'] ? ' · العربون ' . number_format((float)$r['deposit']) . ' · الباقي ' . number_format($rest) : '') . "\nكود العزومة: {$r['code']}\nماما رحاب بتقولك: نوّرتونا ❤️"; ?>
      <a class="b" target="_blank" href="https://wa.me/<?= e($wp) ?>?text=<?= rawurlencode($msg) ?>"><?= icon('wa') ?> ابعت التأكيد واتساب</a>
    <?php endif; ?>
    <?php if (!$isNew && can('res.delete')): ?><button class="b b--danger" name="act" value="delete" data-confirm="حذف العزومة نهائيًا؟">حذف</button><?php endif; ?>
  </div>
</form>
<script>
(() => {
  const pk = document.getElementById('pkSel'), g = document.getElementById('gIn'), pp = document.getElementById('ppIn'), est = document.getElementById('estIn'), dep = document.getElementById('depIn'), out = document.getElementById('restOut'), cw = document.getElementById('customWrap');
  let manual = false;
  const n = (el) => parseFloat(String(el.value).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))) || 0;
  const calc = () => { if (!manual) est.value = Math.round(n(g) * n(pp)); out.textContent = Math.max(0, n(est) - n(dep)).toLocaleString('en-US'); };
  pk.addEventListener('change', () => { const v = +pk.selectedOptions[0].dataset.pp; if (v) pp.value = v; cw.hidden = !!pk.value; manual = false; calc(); });
  [g, pp].forEach((el) => el.addEventListener('input', () => { manual = false; calc(); }));
  est.addEventListener('input', () => { manual = true; calc(); });
  dep.addEventListener('input', calc);
})();
</script>
<?php admin_foot();
