<?php
require __DIR__ . '/inc.php';
require_admin();
if (post_ok()) {
    $sh = eb_load('shipping');
    $all = isset($_POST['all']) && $_POST['all'] !== '' ? max(0, (float)$_POST['all']) : null;
    foreach ($sh as &$g) $g['fee'] = $all !== null ? $all : max(0, (float)($_POST['fee'][$g['id']] ?? $g['fee']));
    unset($g);
    eb_save('shipping', $sh);
    $s = eb_load('settings'); $s['free_shipping_over'] = max(0, (float)($_POST['free'] ?? 0)); eb_save('settings', $s);
    flash('تم حفظ أسعار الشحن');
    back('shipping.php');
}
admin_head('الشحن', 'shipping');
?>
<form method="post" class="card">
  <input type="hidden" name="csrf" value="<?= e(csrf()) ?>">
  <div class="row3">
    <label class="fld">شحن مجاني للطلبات من (ج.م)<input type="number" name="free" min="0" value="<?= (float)setting('free_shipping_over', 0) ?>"><small>0 = بدون شحن مجاني</small></label>
    <label class="fld">توحيد سعر الشحن لكل المحافظات<input type="number" name="all" min="0" placeholder="اتركه فاضي لو مختلف"></label>
  </div>
  <div class="ship-grid">
    <?php foreach (eb_load('shipping') as $g): ?>
      <label class="fld"><?= e($g['ar']) ?><input type="number" name="fee[<?= e($g['id']) ?>]" min="0" value="<?= (float)$g['fee'] ?>"></label>
    <?php endforeach; ?>
  </div>
  <button class="btn btn--gold">حفظ</button>
</form>
<?php admin_foot();
