<?php
require __DIR__ . '/inc.php';
require_perm('products.edit');
$cats = sort_by_order(ad_load('categories')); $catName = []; foreach ($cats as $c) $catName[$c['id']] = $c['name']['sv'];
if (posted()) {
    $act = p('act'); $ids = array_map('strval', (array)($_POST['ids'] ?? [])); if (p('id') !== '') $ids = [p('id')];
    if ($act === 'delete') need('products.delete');
    if ($act === 'dup' && $ids) {
        $new = null;
        ad_tx('products', function (&$all) use ($ids, &$new) {
            foreach ($all as $i => $p) if ($p['id'] === $ids[0]) {
                $n = $p; $n['id'] = ad_id('p'); $n['slug'] = $p['slug'] . '-kopia-' . substr($n['id'], -4); $n['title']['sv'] .= ' (kopia)'; if (!empty($n['title']['en'])) $n['title']['en'] .= ' (copy)';
                $n['active'] = false; $n['featured'] = false; $n['created'] = time();
                foreach ($n['variants'] as &$v) { $v['id'] = ad_id('v'); } unset($v);
                array_splice($all, $i + 1, 0, [$n]); $new = $n; return;
            }
        });
        if ($new) { log_act(L('Duplicerade produkt', 'Duplicated product'), $new['title']['sv']); flash(L('Kopian är skapad och dold tills du aktiverar den', 'The copy is created and hidden until you activate it')); go('product.php?id=' . $new['id']); }
    }
    $n = 0;
    if ($ids && in_array($act, ['on', 'off', 'feat', 'unfeat', 'delete', 'cat'], true)) {
        $cat = p('cat');
        ad_tx('products', function (&$all) use ($ids, $act, $cat, &$n) {
            foreach ($all as $i => &$p) {
                if (!in_array($p['id'], $ids, true)) continue; $n++;
                if ($act === 'on') $p['active'] = true; elseif ($act === 'off') $p['active'] = false;
                elseif ($act === 'feat') $p['featured'] = true; elseif ($act === 'unfeat') $p['featured'] = false;
                elseif ($act === 'cat' && $cat !== '') $p['cat'] = $cat;
                elseif ($act === 'delete') unset($all[$i]);
            }
            unset($p); $all = array_values($all);
        });
        log_act(L('Massåtgärd produkter', 'Bulk product action'), "$act × $n");
        flash($act === 'delete' ? L("$n produkt(er) raderade", "$n product(s) deleted") : L("$n produkt(er) uppdaterade", "$n product(s) updated"));
    }
    go('products.php' . (($q = $_SERVER['QUERY_STRING'] ?? '') ? '?' . $q : ''));
}
$all = ad_load('products');
$q = mb_strtolower(trim((string)($_GET['q'] ?? ''))); $fc = (string)($_GET['cat'] ?? ''); $f = (string)($_GET['f'] ?? '');
$stockOf = fn($p) => array_sum(array_map(fn($v) => empty($v['order']) ? max(0, (int)($v['stock'] ?? 0)) : 0, $p['variants']));
$rows = array_values(array_filter($all, function ($p) use ($q, $fc, $f, $stockOf) {
    if ($fc !== '' && $p['cat'] !== $fc) return false;
    if ($f === 'hidden' && !empty($p['active'])) return false;
    if ($f === 'feat' && empty($p['featured'])) return false;
    if ($f === 'out' && ($stockOf($p) > 0 || array_filter($p['variants'], fn($v) => !empty($v['order'])))) return false;
    if ($f === 'sale' && !array_filter($p['variants'], fn($v) => (float)($v['compare'] ?? 0) > (float)$v['price'])) return false;
    if ($q !== '') { $hay = mb_strtolower(($p['title']['sv'] ?? '') . ' ' . ($p['title']['en'] ?? '') . ' ' . ($p['brand'] ?? '') . ' ' . implode(' ', array_column($p['variants'], 'sku')) . ' ' . implode(' ', $p['tags'] ?? [])); if (!str_contains($hay, $q)) return false; }
    return true;
}));
if (isset($_GET['export']) && can('export')) {
    $out = [];
    foreach ($rows as $p) foreach ($p['variants'] as $v) $out[] = [$p['id'], $p['title']['sv'], $p['brand'] ?? '', $catName[$p['cat']] ?? $p['cat'], $v['sku'] ?? '', $v['size'] ?? '', $v['color'] ?? '', (float)$v['price'], (float)($v['compare'] ?? 0), (int)($v['stock'] ?? 0), !empty($v['order']) ? L('Ja', 'Yes') : '', !empty($p['active']) ? L('Ja', 'Yes') : L('Nej', 'No')];
    export_rows(L('produkter', 'products'), ['ID', L('Titel', 'Title'), L('Märke', 'Brand'), L('Kategori', 'Category'), L('Art.nr', 'SKU'), L('Storlek', 'Size'), L('Färg', 'Colour'), L('Pris', 'Price'), L('Ord. pris', 'Was price'), L('Lager', 'Stock'), L('Beställningsvara', 'Made to order'), L('Synlig', 'Visible')], $out, $_GET['export'] === 'csv' ? 'csv' : 'xls');
}
[$page, $pager] = paginate($rows, 40);
$tabs = ['' => L('Alla', 'All'), 'out' => L('Slut i lager', 'Out of stock'), 'sale' => L('Rea', 'Sale'), 'feat' => L('Utvalda', 'Featured'), 'hidden' => L('Dolda', 'Hidden')];
admin_head(L('Produkter', 'Products'), 'products', export_buttons('products.php?' . http_build_query(array_diff_key($_GET, ['pg' => 1]))) . '<a class="b" href="product.php">' . icon('plus') . ' ' . L('Ny produkt', 'New product') . '</a>');
?>
<div class="tabs"><?php foreach ($tabs as $k => $lbl): $qq = $_GET; $qq['f'] = $k; unset($qq['pg']); ?><a href="?<?= e(http_build_query($qq)) ?>" class="<?= $f === $k ? 'on' : '' ?>"><?= e($lbl) ?></a><?php endforeach; ?></div>
<form class="filters" method="get">
  <input type="hidden" name="f" value="<?= e($f) ?>">
  <input type="search" name="q" value="<?= e($_GET['q'] ?? '') ?>" placeholder="<?= L('Sök titel, märke, art.nr…', 'Search title, brand, SKU…') ?>">
  <select name="cat" onchange="this.form.submit()"><option value=""><?= L('Alla kategorier', 'All categories') ?></option><?php foreach ($cats as $c): ?><option value="<?= e($c['id']) ?>" <?= sel($fc, $c['id']) ?>><?= e($c['name']['sv']) ?></option><?php endforeach; ?></select>
  <button class="b b--ghost"><?= icon('search') ?> <?= L('Sök', 'Search') ?></button>
  <span class="spacer"></span><span class="muted"><?= count($rows) ?> <?= L('produkter', 'products') ?></span>
</form>
<form method="post" data-bulk><?= csrf_field() ?>
  <div class="bulk" hidden><b data-bulk-n>0</b> <?= L('valda', 'selected') ?>
    <select name="act"><option value="on"><?= L('Visa i butiken', 'Show in shop') ?></option><option value="off"><?= L('Dölj', 'Hide') ?></option><option value="feat"><?= L('Markera som utvald', 'Mark as featured') ?></option><option value="unfeat"><?= L('Ta bort utvald', 'Remove featured') ?></option><option value="cat"><?= L('Flytta till kategori →', 'Move to category →') ?></option><?php if (can('products.delete')): ?><option value="delete"><?= L('Radera', 'Delete') ?></option><?php endif; ?></select>
    <select name="cat"><option value="">—</option><?php foreach ($cats as $c): ?><option value="<?= e($c['id']) ?>"><?= e($c['name']['sv']) ?></option><?php endforeach; ?></select>
    <button class="b b--sm" data-confirm="<?= L('Utför åtgärden på valda produkter?', 'Apply the action to the selected products?') ?>"><?= L('Utför', 'Apply') ?></button>
  </div>
  <?php if (!$page): ?><div class="card empty"><p class="muted"><?= L('Inga produkter matchar.', 'No products match.') ?></p></div><?php else: ?>
  <div class="tbl-wrap card" style="padding:0"><table class="t"><thead><tr><th style="width:30px"><input type="checkbox" data-check-all aria-label="all"></th><th></th><th><?= L('Produkt', 'Product') ?></th><th class="hide-sm"><?= L('Kategori', 'Category') ?></th><th><?= L('Pris', 'Price') ?></th><th class="hide-sm"><?= L('Lager', 'Stock') ?></th><th>Status</th><th></th></tr></thead><tbody>
  <?php foreach ($page as $p): $c = product_card($p); $st = $stockOf($p); $ord = (bool)array_filter($p['variants'], fn($v) => !empty($v['order'])); ?>
    <tr>
      <td><input type="checkbox" name="ids[]" value="<?= e($p['id']) ?>"></td>
      <td><img class="thumb" src="<?= e(src($c['img'])) ?>" alt="" loading="lazy"></td>
      <td><a class="rowlink" href="product.php?id=<?= e($p['id']) ?>"><?= e($p['title']['sv']) ?></a><br><small class="muted"><?= e($p['brand'] ?? '') ?> · <?= count($p['variants']) ?> <?= L('varianter', 'variants') ?><?= $c['colors'] ? ' · ' : '' ?></small><?php foreach (array_slice(array_keys($c['colors']), 0, 6) as $hx): ?><span class="swatch" style="background:<?= e($hx) ?>;width:11px;height:11px;margin-left:3px;vertical-align:middle"></span><?php endforeach; ?></td>
      <td class="hide-sm"><?= e($catName[$p['cat']] ?? $p['cat']) ?></td>
      <td><?= $c['price'] < $c['max'] ? money($c['price']) . '–' . money($c['max']) : money($c['price']) ?><?php if ($c['compare']): ?><br><small class="muted"><s><?= money($c['compare']) ?></s></small><?php endif; ?></td>
      <td class="hide-sm"><?= $st > 0 ? $st . ' ' . L('st', 'pcs') : ($ord ? '<span class="st st--confirmed">' . L('Beställning', 'To order') . '</span>' : '<span class="st st--warn">' . L('Slut', 'Out') . '</span>') ?></td>
      <td><?= !empty($p['active']) ? '<span class="st st--on">' . L('Synlig', 'Visible') . '</span>' : '<span class="st st--off">' . L('Dold', 'Hidden') . '</span>' ?><?= !empty($p['featured']) ? ' <span title="' . L('Utvald', 'Featured') . '">★</span>' : '' ?></td>
      <td><div class="acts">
        <a class="b b--ghost b--icon b--sm" href="../produkt.php?p=<?= e($p['slug']) ?>" target="_blank" title="<?= L('Visa', 'View') ?>"><?= icon('eye') ?></a>
        <button class="b b--ghost b--icon b--sm" form="dupform" name="id" value="<?= e($p['id']) ?>" title="<?= L('Duplicera', 'Duplicate') ?>"><?= icon('copy') ?></button>
      </div></td>
    </tr>
  <?php endforeach; ?>
  </tbody></table></div><?php endif; ?>
</form>
<form method="post" id="dupform"><?= csrf_field() ?><input type="hidden" name="act" value="dup"></form>
<?= $pager ?>
<?php admin_foot(); ?>
