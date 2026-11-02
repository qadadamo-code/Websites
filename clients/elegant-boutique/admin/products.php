<?php
require __DIR__ . '/inc.php';
require_admin();
if (post_ok() && isset($_POST['quick'])) {
    // inline stock / price edit from the list
    eb_transaction('products', function (array &$ps) {
        foreach ($ps as &$p) {
            if (isset($_POST['stock'][$p['id']])) $p['stock'] = max(0, (int)$_POST['stock'][$p['id']]);
            if (isset($_POST['price'][$p['id']])) $p['price'] = max(0, (float)$_POST['price'][$p['id']]);
        }
    });
    flash('تم تحديث الأسعار والمخزون');
    back('products.php');
}
$cat = (string)($_GET['cat'] ?? '');
$list = eb_load('products');
if ($cat !== '') $list = array_filter($list, fn($p) => $p['category'] === $cat);
admin_head('المنتجات', 'products');
?>
<div class="toolbar">
  <div class="tabs">
    <a href="products.php" class="<?= $cat === '' ? 'is-on' : '' ?>">الكل <sup><?= count(eb_load('products')) ?></sup></a>
    <?php foreach (categories() as $c): ?><a href="?cat=<?= e($c['id']) ?>" class="<?= $cat === $c['id'] ? 'is-on' : '' ?>"><?= e($c['ar']) ?></a><?php endforeach; ?>
  </div>
  <a class="btn btn--gold" href="product.php">+ منتج جديد</a>
</div>
<form method="post" class="card card--flush">
  <input type="hidden" name="csrf" value="<?= e(csrf()) ?>"><input type="hidden" name="quick" value="1">
  <table class="tbl tbl--prod">
    <thead><tr><th></th><th>المنتج</th><th>المجموعة</th><th>السعر</th><th>المخزون</th><th>اتباع</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($list as $p): $c = category($p['category']); ?>
      <tr class="<?= !empty($p['hidden']) ? 'is-dim' : '' ?>">
        <td><img class="thumb" src="<?= e(img_src($p['images'][0] ?? '')) ?>" alt=""></td>
        <td><b><?= e($p['name_ar']) ?></b><br><small><?= e($p['name_en']) ?></small>
          <?php if (!empty($p['hidden'])): ?><span class="st st--cancelled">مخفي</span><?php endif; ?>
          <?php if (!empty($p['best'])): ?><span class="st st--confirmed">الأكثر طلباً</span><?php endif; ?></td>
        <td><?= e($c['ar'] ?? '—') ?></td>
        <td><input class="mini" type="number" name="price[<?= e($p['id']) ?>]" value="<?= (float)$p['price'] ?>" min="0"></td>
        <td><input class="mini <?= (int)$p['stock'] <= (int)setting('low_stock', 2) ? 'is-low' : '' ?>" type="number" name="stock[<?= e($p['id']) ?>]" value="<?= (int)$p['stock'] ?>" min="0"></td>
        <td><?= (int)($p['sold'] ?? 0) ?></td>
        <td><a class="btn btn--ghost btn--sm" href="product.php?id=<?= e($p['id']) ?>">تعديل</a></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
  <div class="pad"><button class="btn btn--dark">حفظ الأسعار والمخزون</button></div>
</form>
<?php admin_foot();
