<?php
require __DIR__ . '/inc.php';
require_admin();
$id = (string)($_GET['id'] ?? '');
$p = $id !== '' ? product($id) : null;
if ($id !== '' && !$p) back('products.php');
$isNew = !$p;
$p = $p ?? ['id' => '', 'category' => categories()[0]['id'] ?? '', 'price' => 0, 'compare' => 0, 'stock' => 1, 'featured' => false, 'best' => false, 'hidden' => false,
    'badge_ar' => '', 'badge_en' => '', 'name_ar' => '', 'name_en' => '', 'desc_ar' => '', 'desc_en' => '', 'details_ar' => [], 'details_en' => [], 'images' => [], 'sold' => 0];

if (post_ok()) {
    if (isset($_POST['delete']) && !$isNew) {
        eb_transaction('products', function (array &$ps) use ($id) { $ps = array_values(array_filter($ps, fn($x) => $x['id'] !== $id)); });
        flash('تم حذف المنتج');
        back('products.php');
    }
    $str = fn($k, $n = 300) => mb_substr(trim((string)($_POST[$k] ?? '')), 0, $n);
    $lines = fn($k) => array_values(array_filter(array_map('trim', preg_split('/\R/', (string)($_POST[$k] ?? ''))), 'strlen'));
    $d = array_merge($p, [
        'name_ar' => $str('name_ar', 120), 'name_en' => $str('name_en', 120), 'category' => $str('category', 40),
        'price' => max(0, (float)($_POST['price'] ?? 0)), 'compare' => max(0, (float)($_POST['compare'] ?? 0)), 'stock' => max(0, (int)($_POST['stock'] ?? 0)),
        'featured' => !empty($_POST['featured']), 'best' => !empty($_POST['best']), 'hidden' => !empty($_POST['hidden']),
        'badge_ar' => $str('badge_ar', 40), 'badge_en' => $str('badge_en', 40), 'desc_ar' => $str('desc_ar', 2000), 'desc_en' => $str('desc_en', 2000),
        'details_ar' => $lines('details_ar'), 'details_en' => $lines('details_en'),
    ]);
    // images: keep in the chosen order, drop removed ones, append uploads
    $keep = [];
    foreach ((array)($_POST['img'] ?? []) as $k => $src) if (empty($_POST['img_rm'][$k]) && in_array($src, $p['images'], true)) $keep[] = $src;
    $main = (int)($_POST['img_main'] ?? 0);
    if (isset($keep[$main])) { $m = $keep[$main]; unset($keep[$main]); array_unshift($keep, $m); }
    if (!empty($_FILES['new_images']['name'][0])) {
        foreach ($_FILES['new_images']['name'] as $k => $_) {
            $saved = save_upload(['name' => $_FILES['new_images']['name'][$k], 'tmp_name' => $_FILES['new_images']['tmp_name'][$k], 'size' => $_FILES['new_images']['size'][$k]]);
            if ($saved) $keep[] = $saved;
        }
    }
    $d['images'] = array_values($keep);
    $errs = [];
    if ($d['name_ar'] === '') $errs[] = 'اكتب اسم المنتج بالعربي';
    if ($d['name_en'] === '') $d['name_en'] = $d['name_ar'];
    if (!category($d['category'])) $errs[] = 'اختار المجموعة';
    if (!$d['images']) $errs[] = 'ارفع صورة واحدة على الأقل';
    if ($errs) { flash(implode(' · ', $errs), 'bad'); $p = $d; }
    else {
        if ($isNew) {
            $base = slugify($d['name_en']); $nid = $base; $n = 2;
            while (product($nid)) $nid = $base . '-' . $n++;
            $d['id'] = $nid;
        }
        eb_transaction('products', function (array &$ps) use ($d, $isNew) {
            if ($isNew) { $ps[] = $d; return; }
            foreach ($ps as &$x) if ($x['id'] === $d['id']) $x = $d;
        });
        flash($isNew ? 'تمت إضافة المنتج للمتجر' : 'تم حفظ التعديلات');
        back('product.php?id=' . rawurlencode($d['id']));
    }
}
admin_head($isNew ? 'منتج جديد' : $p['name_ar'], 'products');
?>
<form method="post" enctype="multipart/form-data" class="pform">
  <input type="hidden" name="csrf" value="<?= e(csrf()) ?>">
  <div class="card">
    <h2>الصور</h2>
    <p class="muted">الصورة المختارة كرئيسية بتظهر أولاً، والتانية بتظهر لما العميلة تقف على المنتج. أفضل مقاس: طولي 3:4.</p>
    <div class="imgs">
      <?php foreach ($p['images'] as $k => $src): ?>
        <div class="imgs__item">
          <img src="<?= e(img_src($src)) ?>" alt="">
          <input type="hidden" name="img[<?= $k ?>]" value="<?= e($src) ?>">
          <label><input type="radio" name="img_main" value="<?= $k ?>" <?= $k === 0 ? 'checked' : '' ?>> رئيسية</label>
          <label class="bad"><input type="checkbox" name="img_rm[<?= $k ?>]" value="1"> حذف</label>
        </div>
      <?php endforeach; ?>
      <label class="imgs__add"><input type="file" name="new_images[]" accept="image/jpeg,image/png,image/webp" multiple onchange="this.nextElementSibling.textContent = this.files.length + ' صورة جاهزة للرفع'"><span>+ رفع صور</span></label>
    </div>
  </div>

  <div class="grid2">
    <div class="card">
      <h2>البيانات</h2>
      <label class="fld">الاسم بالعربي<input name="name_ar" required value="<?= e($p['name_ar']) ?>"></label>
      <label class="fld">الاسم بالإنجليزي<input name="name_en" dir="ltr" value="<?= e($p['name_en']) ?>"></label>
      <label class="fld">المجموعة<select name="category"><?php foreach (categories() as $c): ?><option value="<?= e($c['id']) ?>" <?= $p['category'] === $c['id'] ? 'selected' : '' ?>><?= e($c['ar']) ?></option><?php endforeach; ?></select></label>
      <div class="row3">
        <label class="fld">السعر (ج.م)<input name="price" type="number" min="0" step="1" required value="<?= (float)$p['price'] ?>"></label>
        <label class="fld">السعر قبل الخصم<input name="compare" type="number" min="0" step="1" value="<?= (float)$p['compare'] ?>"><small>اختياري، بيظهر مشطوب</small></label>
        <label class="fld">المخزون<input name="stock" type="number" min="0" value="<?= (int)$p['stock'] ?>"></label>
      </div>
      <div class="row3">
        <label class="fld">شارة بالعربي<input name="badge_ar" value="<?= e($p['badge_ar']) ?>" placeholder="مثلاً: جديد"></label>
        <label class="fld">شارة بالإنجليزي<input name="badge_en" dir="ltr" value="<?= e($p['badge_en']) ?>" placeholder="New"></label>
      </div>
      <label class="check"><input type="checkbox" name="best" value="1" <?= !empty($p['best']) ? 'checked' : '' ?>> يظهر في "الأكثر طلباً" بالرئيسية</label>
      <label class="check"><input type="checkbox" name="featured" value="1" <?= !empty($p['featured']) ? 'checked' : '' ?>> مميز (يظهر أولاً في المتجر)</label>
      <label class="check"><input type="checkbox" name="hidden" value="1" <?= !empty($p['hidden']) ? 'checked' : '' ?>> مخفي من المتجر</label>
    </div>
    <div class="card">
      <h2>الوصف</h2>
      <label class="fld">الوصف بالعربي<textarea name="desc_ar" rows="4"><?= e($p['desc_ar']) ?></textarea></label>
      <label class="fld">الوصف بالإنجليزي<textarea name="desc_en" rows="4" dir="ltr"><?= e($p['desc_en']) ?></textarea></label>
      <label class="fld">التفاصيل بالعربي (كل سطر نقطة)<textarea name="details_ar" rows="4"><?= e(implode("\n", $p['details_ar'] ?? [])) ?></textarea></label>
      <label class="fld">التفاصيل بالإنجليزي<textarea name="details_en" rows="4" dir="ltr"><?= e(implode("\n", $p['details_en'] ?? [])) ?></textarea></label>
    </div>
  </div>
  <div class="actions">
    <button class="btn btn--gold"><?= $isNew ? 'إضافة المنتج' : 'حفظ' ?></button>
    <?php if (!$isNew): ?>
      <a class="btn btn--ghost" href="../product.php?p=<?= e($p['id']) ?>" target="_blank">عرض في المتجر ↗</a>
      <button class="btn btn--danger" name="delete" value="1" data-confirm="متأكد إنك عايز تحذف المنتج ده؟">حذف المنتج</button>
    <?php endif; ?>
  </div>
</form>
<?php admin_foot();
