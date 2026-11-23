<?php
require __DIR__ . '/inc.php';
require_perm('products.edit');
$prods = ad_load('products');
$count = []; foreach ($prods as $p) $count[$p['cat']] = ($count[$p['cat']] ?? 0) + 1;
if (posted()) {
    $act = p('act');
    if ($act === 'order') {
        $ord = (array)($_POST['order'] ?? []);
        ad_tx('categories', function (&$d) use ($ord) { foreach ($d as &$c) if (isset($ord[$c['id']])) $c['order'] = (int)$ord[$c['id']]; });
        log_act(L('Ändrade ordning på kategorier', 'Reordered categories')); flash(L('Ordningen är sparad', 'The order is saved')); go('categories.php');
    }
    if ($act === 'delete') {
        need('products.delete'); $cid = p('id');
        if (!empty($count[$cid])) { flash(L('Flytta eller radera produkterna i kategorin först', 'Move or delete the products in the category first'), 'bad'); go('categories.php'); }
        ad_tx('categories', function (&$d) use ($cid) { $d = array_values(array_filter($d, fn($c) => $c['id'] !== $cid)); });
        log_act(L('Raderade kategori', 'Deleted category'), $cid); flash(L('Kategorin är raderad', 'The category was deleted')); go('categories.php');
    }
    if ($act === 'save') {
        $cid = p('id'); $name = clean(p('name_sv'), 60);
        if ($name === '') { flash(L('Namn krävs', 'Name is required'), 'bad'); go('categories.php'); }
        $icon = null;
        if (!empty($_FILES['icon']['tmp_name'])) $icon = save_upload($_FILES['icon'], 'site');
        $all = ad_load('categories');
        $slug = slugify(p('slug') ?: $name);
        foreach ($all as $c) if ($c['id'] !== $cid && $c['slug'] === $slug) $slug .= '-2';
        ad_tx('categories', function (&$d) use ($cid, $name, $slug, $icon) {
            $row = ['name' => ['sv' => $name, 'en' => clean(p('name_en'), 60)], 'tag' => ['sv' => clean(p('tag_sv'), 120), 'en' => clean(p('tag_en'), 120)], 'slug' => $slug, 'active' => !empty($_POST['active'])];
            foreach ($d as &$c) if ($c['id'] === $cid) { $c = array_merge($c, $row); if ($icon) $c['icon'] = $icon; return; }
            unset($c);
            $max = 0; foreach ($d as $c) $max = max($max, (int)($c['order'] ?? 0));
            $d[] = $row + ['id' => preg_replace('/[^a-z0-9]/', '', substr($slug, 0, 12)) . substr(bin2hex(random_bytes(2)), 0, 3), 'icon' => $icon ?: '', 'order' => $max + 1];
        });
        log_act($cid ? L('Sparade kategori', 'Saved category') : L('Skapade kategori', 'Created category'), $name);
        flash(L('Kategorin är sparad', 'The category is saved')); go('categories.php');
    }
}
$cats = sort_by_order(ad_load('categories'));
$edit = null; foreach ($cats as $c) if ($c['id'] === ($_GET['id'] ?? '')) $edit = $c;
$iconSrc = fn($c) => cat_icon($c);
admin_head(L('Kategorier', 'Categories'), 'categories', '<a class="b" href="categories.php?id=new">' . icon('plus') . ' ' . L('Ny kategori', 'New category') . '</a>');
?>
<div class="cols">
<form method="post" class="card" style="padding:0"><?= csrf_field() ?><input type="hidden" name="act" value="order">
  <table class="t sortable"><thead><tr><th></th><th></th><th><?= L('Kategori', 'Category') ?></th><th><?= L('Produkter', 'Products') ?></th><th>Status</th><th></th></tr></thead><tbody>
  <?php foreach ($cats as $c): ?><tr draggable="true">
    <td class="handle" title="<?= L('Dra för att sortera', 'Drag to sort') ?>"><?= icon('drag') ?><input type="hidden" data-order name="order[<?= e($c['id']) ?>]" value="<?= (int)($c['order'] ?? 0) ?>"></td>
    <td><?php if ($iconSrc($c)): ?><img src="<?= e(src($iconSrc($c))) ?>" alt="" style="width:40px;height:40px;object-fit:contain"><?php endif; ?></td>
    <td><a class="rowlink" href="?id=<?= e($c['id']) ?>"><?= e($c['name']['sv']) ?></a><br><small class="muted"><?= e($c['name']['en'] ?? '') ?> · /<?= e($c['slug']) ?></small></td>
    <td><a href="products.php?cat=<?= e($c['id']) ?>"><?= (int)($count[$c['id']] ?? 0) ?></a></td>
    <td><?= !empty($c['active']) ? '<span class="st st--on">' . L('Synlig', 'Visible') . '</span>' : '<span class="st st--off">' . L('Dold', 'Hidden') . '</span>' ?></td>
    <td><div class="acts"><a class="b b--ghost b--icon b--sm" href="?id=<?= e($c['id']) ?>"><?= icon('edit') ?></a></div></td>
  </tr><?php endforeach; ?>
  </tbody></table>
  <div style="padding:12px" data-sort-save hidden><button class="b"><?= L('Spara ordning', 'Save order') ?></button></div>
</form>
<div>
  <?php if ($edit || ($_GET['id'] ?? '') === 'new'): $c = $edit ?: ['id' => '', 'name' => ['sv' => '', 'en' => ''], 'tag' => ['sv' => '', 'en' => ''], 'slug' => '', 'active' => true, 'icon' => '']; ?>
  <form method="post" enctype="multipart/form-data" class="card" data-lang-tabs><?= csrf_field() ?><input type="hidden" name="act" value="save"><input type="hidden" name="id" value="<?= e($c['id']) ?>">
    <div class="card__hd"><h3><?= $edit ? L('Redigera kategori', 'Edit category') : L('Ny kategori', 'New category') ?></h3><div class="langtabs"><button type="button" class="on" data-show="sv">SV</button><button type="button" data-show="en">EN</button></div></div>
    <label data-l="sv"><?= L('Namn', 'Name') ?> *<input name="name_sv" value="<?= e($c['name']['sv']) ?>" required data-slug-from></label>
    <label data-l="en" hidden><?= L('Namn (engelska)', 'Name (English)') ?><input name="name_en" value="<?= e($c['name']['en'] ?? '') ?>"></label>
    <label data-l="sv"><?= L('Underrubrik', 'Subtitle') ?><input name="tag_sv" value="<?= e($c['tag']['sv'] ?? '') ?>"></label>
    <label data-l="en" hidden><?= L('Underrubrik (engelska)', 'Subtitle (English)') ?><input name="tag_en" value="<?= e($c['tag']['en'] ?? '') ?>"></label>
    <label><?= L('Webbadress (slug)', 'URL (slug)') ?><input name="slug" value="<?= e($c['slug']) ?>" data-slug></label>
    <label><?= L('Ikon / bild (PNG med transparent bakgrund)', 'Icon / image (PNG with transparent background)') ?><input type="file" name="icon" accept="image/png,image/webp,image/jpeg"></label>
    <?php if ($iconSrc($c)): ?><img src="<?= e(src($iconSrc($c))) ?>" alt="" style="width:70px;height:70px;object-fit:contain;margin-bottom:10px"><?php endif; ?>
    <label class="chk"><input type="checkbox" name="active" value="1" <?= checked($c['active']) ?>> <?= L('Synlig i butiken', 'Visible in shop') ?></label>
    <div class="row"><button class="b"><?= L('Spara', 'Save') ?></button><a class="b b--ghost" href="categories.php"><?= L('Avbryt', 'Cancel') ?></a><span class="spacer"></span>
    <?php if ($edit && can('products.delete')): ?><button class="b b--danger b--sm" form="catdel" data-confirm="<?= L('Radera kategorin?', 'Delete the category?') ?>"><?= icon('trash') ?></button><?php endif; ?></div>
  </form>
  <?php if ($edit): ?><form method="post" id="catdel"><?= csrf_field() ?><input type="hidden" name="act" value="delete"><input type="hidden" name="id" value="<?= e($edit['id']) ?>"></form><?php endif; ?>
  <?php else: ?>
  <div class="card"><p class="muted"><?= L('Dra raderna för att ändra ordningen i menyn och butiken. Klicka på en kategori för att redigera namn, underrubrik och ikon.', 'Drag the rows to change the order in the menu and shop. Click a category to edit its name, subtitle and icon.') ?></p></div>
  <?php endif; ?>
</div>
</div>
<?php admin_foot(); ?>
