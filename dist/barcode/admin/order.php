<?php
/** Add a manual order (phone, walk-in) or edit any order: customer, lines, prices, discount, payment, status. */
require __DIR__ . '/inc.php';
require_perm('orders.edit');
$orders = bc_load('orders');
$id = (string)($_GET['id'] ?? '');
$o = null; foreach ($orders as $x) if ($x['id'] === $id) $o = $x;
if ($id !== '' && !$o) { flash('الطلب غير موجود', 'bad'); go('orders.php'); }
$isNew = !$o;
$cats = []; foreach (bc_load('categories') as $c) $cats[$c['id']] = $c;
$menu = sort_by_order(bc_load('items'));
$byId = []; foreach ($menu as $it) $byId[$it['id']] = $it;

if (posted()) {
    $ids = (array)($_POST['line_id'] ?? []); $names = (array)($_POST['line_name'] ?? []); $qtys = (array)($_POST['line_qty'] ?? []); $prices = (array)($_POST['line_price'] ?? []);
    $lines = []; $sub = 0;
    foreach ($ids as $i => $lid) {
        $lid = (string)$lid; $q = max(0, min(200, (int)digits_en((string)($qtys[$i] ?? 0))));
        if (!$q) continue;
        $nm = clean((string)($names[$i] ?? ''), 80);
        $pr = (string)($prices[$i] ?? '') !== '' ? max(0, (float)digits_en((string)$prices[$i])) : null;
        if (isset($byId[$lid])) { $nm = $nm ?: $byId[$lid]['name']; if ($pr === null) [$pr] = item_price($byId[$lid], $cats[$byId[$lid]['cat']] ?? null); }
        if ($nm === '' || $pr === null) continue;
        $lines[] = ['id' => isset($byId[$lid]) ? $lid : '', 'name' => $nm, 'qty' => $q, 'price' => $pr];
        $sub += $pr * $q;
    }
    $name = clean(p('name'), 80);
    if (!$lines || $name === '') { flash(!$lines ? 'ضيف صنف واحد على الأقل' : 'اكتب اسم العميل', 'bad'); go('order.php' . ($isNew ? '' : '?id=' . rawurlencode($id))); }
    $disc = min($sub, max(0, (float)digits_en(p('discount'))));
    $type = in_array(p('type'), ORDER_TYPES, true) ? p('type') : ORDER_TYPES[0];
    $tot = !empty($_POST['charges']) ? order_totals($sub, $disc, $type, p('zone')) : ['service' => 0, 'vat' => 0, 'delivery' => 0, 'zone' => '', 'total' => $sub - $disc];
    $st = isset(ORDER_ST[p('status')]) ? p('status') : 'new';
    $pay = array_key_exists(p('pay'), PAY_METHODS) ? p('pay') : '';
    $row = array_merge($o ?: ['id' => bc_id('o'), 'no' => 'M' . random_int(1000, 9999), 'at' => now_iso(), 'channel' => 'manual', 'coupon' => ''], [
        'name' => $name, 'phone' => clean(digits_en(p('phone')), 30), 'type' => $type, 'table' => clean(p('table'), 20),
        'address' => clean(p('address'), 300), 'notes' => clean(p('notes'), 300), 'staffNote' => clean(p('staffNote'), 300),
        'items' => $lines, 'subtotal' => $sub, 'discount' => $disc, 'coupon' => strtoupper(clean(p('coupon'), 30)),
        'service' => $tot['service'], 'vat' => $tot['vat'], 'delivery' => $tot['delivery'], 'zone' => $tot['zone'], 'total' => $tot['total'], 'charges' => !empty($_POST['charges']),
        'status' => $st, 'pay' => $pay, 'paid' => $pay !== '', 'updated' => now_iso(), 'updatedBy' => me()['name'] ?? '',
    ]);
    bc_tx('orders', function (&$d) use ($row, $isNew) {
        if ($isNew) { array_unshift($d, $row); return; }
        foreach ($d as $i => $x) if ($x['id'] === $row['id']) $d[$i] = $row;
    });
    log_act($isNew ? 'إضافة طلب يدوي' : 'تعديل طلب', '#' . $row['no'] . ' · ' . $row['name'] . ' · ' . egp($row['total']));
    flash($isNew ? 'تمت إضافة الطلب' : 'تم حفظ تعديلات الطلب');
    go('orders.php?open=' . rawurlencode($row['id']) . '#detail');
}

$o = $o ?: ['name' => '', 'phone' => '', 'type' => 'داخل الكافيه', 'table' => '', 'address' => '', 'notes' => '', 'staffNote' => '', 'items' => [], 'discount' => 0, 'coupon' => '', 'status' => 'new', 'pay' => '', 'no' => ''];
$opts = '<option value="">صنف خارج المنيو…</option>';
$curCat = '';
foreach ($menu as $it) {
    if ($it['cat'] !== $curCat) { if ($curCat !== '') $opts .= '</optgroup>'; $curCat = $it['cat']; $opts .= '<optgroup label="' . e($cats[$curCat]['title'] ?? $curCat) . '">'; }
    [$pr] = item_price($it, $cats[$it['cat']] ?? null);
    $opts .= '<option value="' . e($it['id']) . '" data-unit="' . $pr . '" data-name="' . e($it['name']) . '">' . e($it['name']) . ' · ' . $pr . '</option>';
}
$opts .= '</optgroup>';
$lineRow = function (array $l) use ($opts) {
    $sel = $l['id'] ? str_replace('value="' . e($l['id']) . '"', 'value="' . e($l['id']) . '" selected', $opts) : $opts;
    return '<div class="oline"><select name="line_id[]" class="inp" data-line-item>' . $sel . '</select>'
        . '<input name="line_name[]" class="inp" value="' . e($l['name']) . '" placeholder="اسم الصنف">'
        . '<input name="line_qty[]" class="inp latin" type="number" min="0" max="200" value="' . (int)$l['qty'] . '" data-line-qty>'
        . '<input name="line_price[]" class="inp latin" type="number" min="0" step="0.5" value="' . e((string)$l['price']) . '" data-line-price placeholder="السعر">'
        . '<b class="latin oline__sum" data-line-sum></b><button type="button" class="icon-b" data-line-del title="حذف السطر">' . icon('trash') . '</button></div>';
};
admin_head($isNew ? 'طلب جديد' : 'تعديل طلب #' . $o['no'], 'orders', '<a class="b" href="orders.php">رجوع للطلبات</a>');
?>
<?php $chg = charges(); $hasChg = $chg['service'] || $chg['vat'] || $chg['deliveryFee'] || $chg['zones']; $chOn = $isNew ? true : (!empty($o['charges']) || !empty($o['service']) || !empty($o['vat']) || !empty($o['delivery'])); ?>
<form method="post" class="form-grid" id="orderForm" data-charges="<?= e(json_encode($chg, JSON_UNESCAPED_UNICODE)) ?>">
  <?= csrf_field() ?>
  <section class="card card--full">
    <div class="card__head"><h3>الأصناف</h3><span class="muted">السعر بيتملي من المنيو تلقائيًا وتقدر تعدّله</span></div>
    <div class="oline oline--head"><span>من المنيو</span><span>الاسم</span><span>الكمية</span><span>سعر الوحدة</span><span>الإجمالي</span><span></span></div>
    <div id="lines"><?php foreach ($o['items'] as $l) echo $lineRow($l + ['id' => '']); if (!$o['items']) echo $lineRow(['id' => '', 'name' => '', 'qty' => 1, 'price' => '']); ?></div>
    <template id="lineTpl"><?= $lineRow(['id' => '', 'name' => '', 'qty' => 1, 'price' => '']) ?></template>
    <button type="button" class="b b--sm" id="addLine"><?= icon('plus') ?> سطر جديد</button>
    <div class="ototal">
      <label class="f"><span>كود خصم (للتسجيل)</span><input name="coupon" value="<?= e($o['coupon']) ?>" class="latin" dir="ltr"></label>
      <label class="f"><span>قيمة الخصم (جنيه)</span><input name="discount" type="number" min="0" step="0.5" value="<?= e((string)$o['discount']) ?>" class="latin" id="discInp"></label>
      <div class="ototal__sum"><span>المجموع <b class="latin" id="subOut">0</b></span><span id="chgOut" class="ototal__chg"></span><span>الإجمالي <b class="latin" id="totOut">0</b></span></div>
      <?php if ($hasChg): ?><label class="switch" style="grid-column:1/-1"><input type="checkbox" name="charges" value="1" id="chgOn" <?= $chOn ? 'checked' : '' ?>><i></i><span>طبّق الخدمة والضريبة والتوصيل من <a href="charges.php">صفحة الرسوم</a></span></label><?php endif; ?>
    </div>
  </section>

  <section class="card">
    <div class="card__head"><h3>العميل</h3></div>
    <div class="fg">
      <label class="f"><span>الاسم *</span><input name="name" value="<?= e($o['name']) ?>" required maxlength="80"></label>
      <label class="f"><span>الموبايل</span><input name="phone" value="<?= e($o['phone']) ?>" class="latin" dir="ltr" inputmode="tel"></label>
      <label class="f"><span>نوع الطلب</span><select name="type"><?php foreach (ORDER_TYPES as $t): ?><option <?= sel(['استلام' => 'استلام من الفرع', 'في الكافيه' => 'داخل الكافيه'][$o['type']] ?? $o['type'], $t) ?>><?= $t ?></option><?php endforeach; ?></select></label>
      <label class="f"><span>رقم الترابيزة</span><input name="table" value="<?= e($o['table'] ?? '') ?>" maxlength="20" placeholder="للطلبات داخل الكافيه"></label>
      <?php if ($chg['zones']): ?><label class="f"><span>منطقة التوصيل</span><select name="zone"><option value="">—</option><?php foreach ($chg['zones'] as $z): ?><option value="<?= e($z['name']) ?>" <?= sel($o['zone'] ?? '', $z['name']) ?>><?= e($z['name']) ?> · <?= egp($z['fee']) ?></option><?php endforeach; ?></select></label><?php endif; ?>
      <label class="f"><span>العنوان</span><input name="address" value="<?= e($o['address'] ?? '') ?>" maxlength="300"></label>
      <label class="f f--full"><span>ملاحظات العميل</span><textarea name="notes" rows="2" maxlength="300"><?= e($o['notes'] ?? '') ?></textarea></label>
    </div>
  </section>

  <section class="card">
    <div class="card__head"><h3>الحالة والدفع</h3></div>
    <div class="fg">
      <label class="f"><span>الحالة</span><select name="status"><?php foreach (ORDER_ST as $k => $l): ?><option value="<?= $k ?>" <?= sel($o['status'], $k) ?>><?= $l ?></option><?php endforeach; ?></select></label>
      <label class="f"><span>طريقة الدفع</span><select name="pay"><?php foreach (PAY_METHODS as $k => $l): ?><option value="<?= $k ?>" <?= sel($o['pay'] ?? '', $k) ?>><?= $l ?></option><?php endforeach; ?></select></label>
      <label class="f f--full"><span>ملاحظة داخلية (للفريق فقط)</span><textarea name="staffNote" rows="2" maxlength="300"><?= e($o['staffNote'] ?? '') ?></textarea></label>
    </div>
  </section>
  <div class="form-actions"><a class="b" href="orders.php">إلغاء</a><button class="b b--primary"><?= $isNew ? 'إضافة الطلب' : 'حفظ التعديلات' ?></button></div>
</form>
<?php admin_foot();
