<?php
require __DIR__ . '/inc.php';
require_admin();
if (post_ok()) {
    $cats = eb_load('categories');
    if (!empty($_POST['add']) && trim($_POST['new_ar'] ?? '') !== '') {
        $en = trim($_POST['new_en'] ?? '') ?: trim($_POST['new_ar']);
        $nid = slugify($en);
        while (category($nid)) $nid .= '-2';
        $cats[] = ['id' => $nid, 'ar' => trim($_POST['new_ar']), 'en' => $en, 'image' => '', 'sort' => count($cats) + 1];
    } else {
        foreach ($cats as $k => &$c) {
            $c['ar'] = trim($_POST['ar'][$c['id']] ?? $c['ar']);
            $c['en'] = trim($_POST['en'][$c['id']] ?? $c['en']);
            $c['sort'] = (int)($_POST['sort'][$c['id']] ?? $c['sort']);
            if (!empty($_FILES['img']['tmp_name'][$c['id']])) {
                $s = save_upload(['name' => $_FILES['img']['name'][$c['id']], 'tmp_name' => $_FILES['img']['tmp_name'][$c['id']], 'size' => $_FILES['img']['size'][$c['id']]]);
                if ($s) $c['image'] = $s;
            }
            if (!empty($_POST['del'][$c['id']]) && !category_count($c['id'])) unset($cats[$k]);
        }
        unset($c);
    }
    eb_save('categories', array_values($cats));
    flash('تم حفظ المجموعات');
    back('categories.php');
}
admin_head('المجموعات', 'categories');
?>
<form method="post" enctype="multipart/form-data" class="card card--flush">
  <input type="hidden" name="csrf" value="<?= e(csrf()) ?>">
  <table class="tbl">
    <thead><tr><th>الصورة</th><th>بالعربي</th><th>بالإنجليزي</th><th>الترتيب</th><th>المنتجات</th><th></th></tr></thead>
    <tbody>
    <?php foreach (categories() as $c): $n = category_count($c['id']); ?>
      <tr>
        <td><label class="catimg"><?php if ($c['image']): ?><img class="thumb" src="<?= e(img_src($c['image'])) ?>" alt=""><?php else: ?><span class="thumb thumb--empty">+</span><?php endif; ?><input type="file" name="img[<?= e($c['id']) ?>]" accept="image/*" hidden></label></td>
        <td><input name="ar[<?= e($c['id']) ?>]" value="<?= e($c['ar']) ?>"></td>
        <td><input name="en[<?= e($c['id']) ?>]" value="<?= e($c['en']) ?>" dir="ltr"></td>
        <td><input class="mini" type="number" name="sort[<?= e($c['id']) ?>]" value="<?= (int)$c['sort'] ?>"></td>
        <td><?= $n ?><?= $n ? '' : ' <small class="muted">(مخفية من المتجر)</small>' ?></td>
        <td><?php if (!$n): ?><label class="bad"><input type="checkbox" name="del[<?= e($c['id']) ?>]" value="1"> حذف</label><?php endif; ?></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
  <div class="pad"><button class="btn btn--dark">حفظ</button> <span class="muted">اضغط على الصورة لتغييرها. المجموعة الفاضية مش بتظهر في المتجر.</span></div>
</form>
<form method="post" class="card inline-form">
  <input type="hidden" name="csrf" value="<?= e(csrf()) ?>"><input type="hidden" name="add" value="1">
  <h2>مجموعة جديدة</h2>
  <input name="new_ar" placeholder="الاسم بالعربي" required><input name="new_en" placeholder="English name" dir="ltr">
  <button class="btn btn--gold">إضافة</button>
</form>
<?php admin_foot();
