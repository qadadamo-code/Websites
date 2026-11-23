<?php
require __DIR__ . '/inc.php';
require_admin();
$coupons = bc_load('coupons');
$editId = (string)($_GET['edit'] ?? '');
$cur = null; foreach ($coupons as $c) if ($c['id'] === $editId) $cur = $c;

if (posted()) {
    $act = p('act');
    if ($act === 'save') {
        $code = strtoupper(preg_replace('/[^A-Za-z0-9_-]/', '', p('code')));
        $type = p('type') === 'fixed' ? 'fixed' : 'percent';
        $val = (float)digits_en(p('value'));
        $id = p('id');
        $errs = [];
        if (strlen($code) < 3) $errs[] = 'الكود لازم يكون 3 حروف/أرقام إنجليزي على الأقل';
        if ($val <= 0 || ($type === 'percent' && $val > 100)) $errs[] = 'قيمة الخصم غير صحيحة';
        foreach ($coupons as $c) if (strtoupper($c['code']) === $code && $c['id'] !== $id) $errs[] = 'الكود ده مستخدم قبل كده';
        if ($errs) { flash(implode(' · ', $errs), 'bad'); go('discounts.php' . ($id ? '?edit=' . rawurlencode($id) : '') . '#new'); }
        $row = ['code' => $code, 'type' => $type, 'value' => $val, 'min' => (float)digits_en(p('min')) ?: 0, 'limit' => (int)digits_en(p('limit')) ?: 0,
            'from' => pdate('from'), 'to' => pdate('to'), 'note' => clean(p('note'), 80), 'active' => !empty($_POST['active'])];
        bc_tx('coupons', function (&$d) use ($row, $id) {
            foreach ($d as &$c) if ($c['id'] === $id) { $c = array_merge($c, $row); return; }
            array_unshift($d, $row + ['id' => bc_id('p'), 'uses' => 0, 'created' => now_iso()]);
        });
        flash($id ? 'تم حفظ الكود' : 'تم إنشاء كود الخصم ' . $code . '، العميل يكتبه في الفاتورة');
        go('discounts.php');
    }
    $id = p('id');
    if ($act === 'toggle') bc_tx('coupons', function (&$d) use ($id) { foreach ($d as &$c) if ($c['id'] === $id) $c['active'] = empty($c['active']); });
    if ($act === 'reset') bc_tx('coupons', function (&$d) use ($id) { foreach ($d as &$c) if ($c['id'] === $id) $c['uses'] = 0; });
    if ($act === 'delete') bc_tx('coupons', function (&$d) use ($id) { $d = array_values(array_filter($d, fn($c) => $c['id'] !== $id)); });
    if ($act === 'endsale') { $iid = p('item'); bc_tx('items', function (&$d) use ($iid) { foreach ($d as &$x) if ($x['id'] === $iid) { $x['sale'] = null; $x['saleFrom'] = ''; $x['saleTo'] = ''; } }); }
    if ($act === 'endcat') { $cid = p('cat'); bc_tx('categories', function (&$d) use ($cid) { foreach ($d as &$x) if ($x['id'] === $cid) { $x['discount'] = 0; $x['discountFrom'] = ''; $x['discountTo'] = ''; } }); }
    if ($act === 'catdisc') {
        $cid = p('cat'); $pct = max(0, min(90, (float)digits_en(p('pct'))));
        bc_tx('categories', function (&$d) use ($cid, $pct) { foreach ($d as &$x) if ($x['id'] === $cid || $cid === '__all') { $x['discount'] = $pct; $x['discountFrom'] = $pct ? pdate('from') : ''; $x['discountTo'] = $pct ? pdate('to') : ''; } });
    }
    flash(['toggle' => 'تم تحديث حالة الكود', 'reset' => 'تم تصفير عدد الاستخدام', 'delete' => 'تم حذف الكود', 'endsale' => 'تم إيقاف خصم الصنف', 'endcat' => 'تم إيقاف خصم القسم', 'catdisc' => 'تم تطبيق خصم القسم'][$act] ?? 'تم');
    go('discounts.php');
}

$cats = sort_by_order(bc_load('categories')); $catById = []; foreach ($cats as $c) $catById[$c['id']] = $c;
$sales = array_filter(bc_load('items'), fn($i) => !empty($i['sale']));
$catDisc = array_filter($cats, fn($c) => !empty($c['discount']));
$f = $cur ?: ['id' => '', 'code' => '', 'type' => 'percent', 'value' => '', 'min' => '', 'limit' => '', 'from' => '', 'to' => '', 'note' => '', 'active' => true];
function coupon_state(array $c): array {
    if (empty($c['active'])) return ['off', 'موقوف'];
    if (!empty($c['to']) && today() > $c['to']) return ['off', 'منتهي'];
    if (!empty($c['from']) && today() < $c['from']) return ['new', 'مجدول'];
    if (!empty($c['limit']) && (int)($c['uses'] ?? 0) >= (int)$c['limit']) return ['off', 'استُنفد'];
    return ['on', 'فعّال'];
}
admin_head('الخصومات', 'discounts', '<a class="b b--primary" href="#new">' . icon('plus') . ' كود خصم جديد</a>');
?>
<div class="cols">
  <section class="card card--wide">
    <div class="card__head"><h3>أكواد الخصم</h3><span class="muted">العميل يكتب الكود في الفاتورة قبل الإرسال</span></div>
    <?php if (!$coupons): ?><p class="empty">لا توجد أكواد بعد. أنشئ أول كود من النموذج.</p><?php else: ?>
    <div class="table-wrap" style="border:0;background:none">
    <table class="tbl">
      <thead><tr><th>الكود</th><th>الخصم</th><th>الشروط</th><th>الاستخدام</th><th>الحالة</th><th></th></tr></thead>
      <tbody>
      <?php foreach ($coupons as $c): [$sc, $sl] = coupon_state($c); ?>
        <tr>
          <td><span class="code"><?= e($c['code']) ?></span><?php if (!empty($c['note'])): ?><small><?= e($c['note']) ?></small><?php endif; ?></td>
          <td class="nowrap"><b class="latin"><?= $c['type'] === 'fixed' ? egp($c['value']) : (0 + $c['value']) . '%' ?></b></td>
          <td><small><?= !empty($c['min']) ? 'حد أدنى ' . egp($c['min']) : 'بدون حد أدنى' ?></small><small class="latin"><?= $c['from'] || $c['to'] ? e(($c['from'] ? date('d/m', strtotime($c['from'])) : '…') . ' ← ' . ($c['to'] ? date('d/m', strtotime($c['to'])) : '…')) : '' ?></small></td>
          <td class="latin nowrap"><?= (int)($c['uses'] ?? 0) ?><?= !empty($c['limit']) ? ' / ' . (int)$c['limit'] : '' ?></td>
          <td><span class="st st--<?= $sc ?>"><?= $sl ?></span></td>
          <td class="end nowrap">
            <button class="icon-b" form="cp-t-<?= e($c['id']) ?>" title="<?= !empty($c['active']) ? 'إيقاف' : 'تفعيل' ?>"><?= icon('eye') ?></button>
            <a class="icon-b" href="?edit=<?= e($c['id']) ?>#new" title="تعديل"><?= icon('edit') ?></a>
            <button class="icon-b" data-copy="<?= e($c['code']) ?>" title="نسخ"><?= icon('copy') ?></button>
            <button class="icon-b" form="cp-d-<?= e($c['id']) ?>" data-confirm="حذف الكود <?= e($c['code']) ?>؟" title="حذف"><?= icon('trash') ?></button>
            <form method="post" id="cp-t-<?= e($c['id']) ?>" hidden><?= csrf_field() ?><input type="hidden" name="act" value="toggle"><input type="hidden" name="id" value="<?= e($c['id']) ?>"></form>
            <form method="post" id="cp-d-<?= e($c['id']) ?>" hidden><?= csrf_field() ?><input type="hidden" name="act" value="delete"><input type="hidden" name="id" value="<?= e($c['id']) ?>"></form>
          </td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
    </div>
    <?php endif; ?>
  </section>

  <form method="post" class="card" id="new">
    <?= csrf_field() ?><input type="hidden" name="act" value="save"><input type="hidden" name="id" value="<?= e($f['id']) ?>">
    <div class="card__head"><h3><?= $cur ? 'تعديل الكود' : 'كود خصم جديد' ?></h3><?php if ($cur): ?><a href="discounts.php">إلغاء</a><?php endif; ?></div>
    <div class="fg">
      <label class="f f--full"><span>الكود *</span><div style="display:flex;gap:6px"><input name="code" id="cpCode" value="<?= e($f['code']) ?>" class="latin inp" dir="ltr" maxlength="20" required placeholder="WELCOME10" style="text-transform:uppercase"><button class="b" data-gen-code="#cpCode" type="button">توليد</button></div></label>
      <div class="f f--full"><span>نوع الخصم</span><div class="seg">
        <label><input type="radio" name="type" value="percent" <?= $f['type'] !== 'fixed' ? 'checked' : '' ?>><span>نسبة %</span></label>
        <label><input type="radio" name="type" value="fixed" <?= $f['type'] === 'fixed' ? 'checked' : '' ?>><span>مبلغ ثابت (ج.م)</span></label></div></div>
      <label class="f"><span>القيمة *</span><input name="value" value="<?= e((string)$f['value']) ?>" inputmode="decimal" class="latin" required placeholder="10"></label>
      <label class="f"><span>حد أدنى للطلب</span><input name="min" value="<?= e((string)($f['min'] ?: '')) ?>" inputmode="decimal" class="latin" placeholder="0"></label>
      <label class="f"><span>يبدأ</span><input type="date" name="from" value="<?= e($f['from']) ?>"></label>
      <label class="f"><span>ينتهي</span><input type="date" name="to" value="<?= e($f['to']) ?>"></label>
      <label class="f"><span>أقصى عدد استخدام</span><input name="limit" value="<?= e((string)($f['limit'] ?: '')) ?>" inputmode="numeric" class="latin" placeholder="بلا حد"></label>
      <label class="f"><span>ملاحظة داخلية</span><input name="note" value="<?= e($f['note'] ?? '') ?>" maxlength="80" placeholder="مثال: لمتابعي إنستجرام"></label>
      <label class="switch f--full"><input type="checkbox" name="active" <?= checked($f['active']) ?>><i></i><span>مفعّل</span></label>
    </div>
    <div class="form-actions"><button class="b b--primary b--block"><?= $cur ? 'حفظ التعديل' : 'إنشاء الكود' ?></button></div>
  </form>
</div>

<div class="cols cols--even">
  <section class="card">
    <div class="card__head"><h3>خصم على قسم كامل</h3></div>
    <form method="post" class="fg">
      <?= csrf_field() ?><input type="hidden" name="act" value="catdisc">
      <label class="f"><span>القسم</span><select name="cat"><option value="__all">كل الأقسام</option><?php foreach ($cats as $c): ?><option value="<?= e($c['id']) ?>"><?= e($c['title']) ?></option><?php endforeach; ?></select></label>
      <label class="f"><span>النسبة %</span><input name="pct" inputmode="decimal" class="latin" placeholder="15" required></label>
      <label class="f"><span>يبدأ</span><input type="date" name="from"></label>
      <label class="f"><span>ينتهي</span><input type="date" name="to"></label>
      <div class="f--full"><button class="b b--primary">تطبيق الخصم</button></div>
    </form>
    <?php if ($catDisc): ?><div class="list" style="margin-top:14px">
      <?php foreach ($catDisc as $c): $live = in_window($c['discountFrom'] ?? null, $c['discountTo'] ?? null); ?>
      <div class="row"><div><b><?= e($c['title']) ?></b><small class="latin"><?= e(($c['discountFrom'] ?: '…') . ' ← ' . ($c['discountTo'] ?: '…')) ?></small></div>
        <div class="row__end"><span class="st st--<?= $live ? 'sale' : 'off' ?>">-<?= 0 + $c['discount'] ?>%</span>
          <form method="post" class="inline-form"><?= csrf_field() ?><input type="hidden" name="act" value="endcat"><input type="hidden" name="cat" value="<?= e($c['id']) ?>"><button class="b b--sm">إيقاف</button></form></div></div>
      <?php endforeach; ?></div><?php endif; ?>
  </section>

  <section class="card">
    <div class="card__head"><h3>أصناف عليها خصم</h3><a href="items.php">إضافة خصم لأصناف ←</a></div>
    <?php if (!$sales): ?><p class="empty">لا توجد أصناف عليها خصم خاص. من صفحة الأصناف حدّد أصنافًا واختر «خصم %».</p><?php endif; ?>
    <div class="list">
      <?php foreach ($sales as $it): $live = in_window($it['saleFrom'] ?? null, $it['saleTo'] ?? null); ?>
      <div class="row"><div><b><?= e($it['name']) ?></b><small><?= e($catById[$it['cat']]['title'] ?? '') ?> · <span class="latin"><s><?= egp($it['price']) ?></s> ← <?= egp($it['sale']) ?></span><?= !$live ? ' · خارج الفترة' : '' ?></small></div>
        <div class="row__end"><span class="st st--<?= $live ? 'sale' : 'off' ?>">-<?= round((1 - $it['sale'] / $it['price']) * 100) ?>%</span>
          <form method="post" class="inline-form"><?= csrf_field() ?><input type="hidden" name="act" value="endsale"><input type="hidden" name="item" value="<?= e($it['id']) ?>"><button class="b b--sm">إيقاف</button></form></div></div>
      <?php endforeach; ?>
    </div>
  </section>
</div>
<?php admin_foot();
