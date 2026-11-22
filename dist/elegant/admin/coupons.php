<?php
require __DIR__ . '/inc.php';
require_admin();
if (post_ok()) {
    $cs = eb_load('coupons');
    if (!empty($_POST['add'])) {
        $code = strtoupper(preg_replace('/[^A-Za-z0-9_-]/', '', (string)$_POST['code']));
        if ($code === '' || find_coupon($code) || array_filter($cs, fn($c) => strtoupper($c['code']) === $code)) { flash('الكود فاضي أو موجود قبل كده', 'bad'); back('coupons.php'); }
        $cs[] = ['code' => $code, 'type' => ($_POST['type'] ?? '') === 'fixed' ? 'fixed' : 'percent', 'value' => max(0, (float)$_POST['value']), 'min' => max(0, (float)$_POST['min']),
            'active' => true, 'uses' => 0, 'max_uses' => max(0, (int)$_POST['max_uses']), 'expires' => preg_match('/^\d{4}-\d{2}-\d{2}$/', $_POST['expires'] ?? '') ? $_POST['expires'] : ''];
        flash('تم إنشاء الكود ' . $code);
    } else {
        foreach ($cs as $k => &$c) {
            $c['active'] = !empty($_POST['active'][$c['code']]);
            if (!empty($_POST['del'][$c['code']])) unset($cs[$k]);
        }
        unset($c);
        flash('تم الحفظ');
    }
    eb_save('coupons', array_values($cs));
    back('coupons.php');
}
admin_head('أكواد الخصم', 'coupons');
?>
<form method="post" class="card card--flush">
  <input type="hidden" name="csrf" value="<?= e(csrf()) ?>">
  <table class="tbl">
    <thead><tr><th>الكود</th><th>الخصم</th><th>الحد الأدنى</th><th>الاستخدام</th><th>ينتهي</th><th>مفعّل</th><th></th></tr></thead>
    <tbody>
    <?php foreach (eb_load('coupons') as $c): ?>
      <tr><td><b dir="ltr"><?= e($c['code']) ?></b></td><td><?= $c['type'] === 'percent' ? (float)$c['value'] . '%' : egp($c['value']) ?></td><td><?= $c['min'] ? egp($c['min']) : '—' ?></td>
        <td><?= (int)$c['uses'] ?><?= $c['max_uses'] ? ' / ' . (int)$c['max_uses'] : '' ?></td><td><?= e($c['expires'] ?? '') ?: '—' ?></td>
        <td><label class="switch"><input type="checkbox" name="active[<?= e($c['code']) ?>]" value="1" <?= !empty($c['active']) ? 'checked' : '' ?>><i></i></label></td>
        <td><label class="bad"><input type="checkbox" name="del[<?= e($c['code']) ?>]" value="1"> حذف</label></td></tr>
    <?php endforeach; ?>
    </tbody>
  </table>
  <div class="pad"><button class="btn btn--dark">حفظ</button></div>
</form>
<form method="post" class="card">
  <input type="hidden" name="csrf" value="<?= e(csrf()) ?>"><input type="hidden" name="add" value="1">
  <h2>كود جديد</h2>
  <div class="row3">
    <label class="fld">الكود<input name="code" required dir="ltr" placeholder="EID20" style="text-transform:uppercase"></label>
    <label class="fld">النوع<select name="type"><option value="percent">نسبة %</option><option value="fixed">مبلغ ثابت ج.م</option></select></label>
    <label class="fld">القيمة<input name="value" type="number" min="0" required></label>
    <label class="fld">الحد الأدنى للطلب<input name="min" type="number" min="0" value="0"></label>
    <label class="fld">أقصى عدد استخدام<input name="max_uses" type="number" min="0" value="0"><small>0 = بلا حد</small></label>
    <label class="fld">تاريخ الانتهاء<input name="expires" type="date"></label>
  </div>
  <button class="btn btn--gold">إنشاء الكود</button>
</form>
<?php admin_foot();
