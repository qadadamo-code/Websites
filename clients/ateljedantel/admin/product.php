<?php
require __DIR__ . '/inc.php';
require_perm('products.edit');
$id = (string)($_GET['id'] ?? '');
$all = ad_load('products');
$p = null; foreach ($all as $x) if ($x['id'] === $id) $p = $x;
if ($id !== '' && !$p) { flash(L('Produkten finns inte längre', 'The product no longer exists'), 'bad'); go('products.php'); }
$cats = sort_by_order(ad_load('categories'));
$okImg = fn($s) => (bool)preg_match('~^(assets/p|uploads/products)/[A-Za-z0-9._-]+\.(webp|jpe?g|png)$~', $s) && is_file(AD_ROOT . '/' . $s);

if (posted()) {
    if (p('act') === 'delete' && $p) {
        need('products.delete');
        ad_tx('products', function (&$d) use ($id) { $d = array_values(array_filter($d, fn($x) => $x['id'] !== $id)); });
        log_act(L('Raderade produkt', 'Deleted product'), $p['title']['sv']);
        flash(L('Produkten är raderad', 'The product was deleted')); go('products.php');
    }
    $titleSv = clean(p('title_sv'), 140);
    $err = [];
    if ($titleSv === '') $err[] = L('Svensk titel krävs', 'Swedish title is required');
    $slug = slugify(p('slug') ?: $titleSv);
    foreach ($all as $x) if ($x['id'] !== $id && $x['slug'] === $slug) $slug .= '-' . substr(bin2hex(random_bytes(2)), 0, 3);
    $catIds = array_column($cats, 'id'); $cat = in_array(p('cat'), $catIds, true) ? p('cat') : ($catIds[0] ?? '');
    $variants = [];
    foreach ((array)($_POST['v'] ?? []) as $v) {
        if (!is_array($v)) continue;
        $g = fn($k, $m = 80) => clean((string)($v[$k] ?? ''), $m);
        $num = fn($k) => max(0, (float)str_replace([' ', "\u{00A0}", ','], ['', '', '.'], (string)($v[$k] ?? '0')));
        $imgs = array_values(array_unique(array_filter(array_map('trim', preg_split('/\R/', (string)($v['images'] ?? ''))), $okImg)));
        $hex = preg_match('/^#[0-9a-f]{6}$/i', (string)($v['hex'] ?? '')) ? strtoupper($v['hex']) : '';
        $row = ['id' => preg_match('/^[a-z0-9]{2,20}$/i', (string)($v['id'] ?? '')) ? $v['id'] : ad_id('v'), 'sku' => $g('sku', 40), 'size' => $g('size', 20), 'color' => $g('color', 40), 'colorEn' => $g('colorEn', 40), 'hex' => $hex,
            'price' => $num('price'), 'compare' => $num('compare'), 'stock' => (int)$num('stock'), 'images' => $imgs, 'order' => !empty($v['order']), 'cond' => p('cond') ?: 'new'];
        if ($row['price'] <= 0 && $row['size'] === '' && $row['sku'] === '' && !$imgs) continue; // empty row
        $variants[] = $row;
    }
    $ids = array_column($variants, 'id'); if (count($ids) !== count(array_unique($ids))) foreach ($variants as $i => &$vv) if ($i > 0 && in_array($vv['id'], array_slice($ids, 0, $i), true)) $vv['id'] = ad_id('v'); unset($vv);
    if (!$variants) $err[] = L('Minst en variant med pris krävs', 'At least one variant with a price is required');
    foreach ($variants as $v) if ($v['price'] <= 0) { $err[] = L('Alla varianter behöver ett pris', 'Every variant needs a price'); break; }
    $specs = [];
    foreach ((array)($_POST['spec_k'] ?? []) as $i => $k) { $k = clean((string)$k, 60); $val = clean((string)($_POST['spec_v'][$i] ?? ''), 200); if ($k !== '' && $val !== '') $specs[] = [$k, $val]; }
    $new = [
        'id' => $p['id'] ?? ad_id('p'), 'slug' => $slug, 'cat' => $cat, 'brand' => clean(p('brand'), 60),
        'title' => ['sv' => $titleSv, 'en' => clean(p('title_en'), 140)],
        'headline' => ['sv' => clean(p('head_sv'), 200), 'en' => clean(p('head_en'), 200)],
        'desc' => ['sv' => clean(p('desc_sv'), 6000), 'en' => clean(p('desc_en'), 6000)],
        'notes' => ['sv' => clean(p('notes_sv'), 1000), 'en' => clean(p('notes_en'), 1000)],
        'specs' => $specs, 'cond' => in_array(p('cond'), ['new', 'sample', 'defect'], true) ? p('cond') : 'new', 'variants' => $variants,
        'tags' => array_values(array_filter(array_map(fn($t) => clean($t, 30), explode(',', p('tags'))))),
        'featured' => !empty($_POST['featured']), 'active' => !empty($_POST['active']), 'created' => $p['created'] ?? time(),
    ];
    if ($err) { flash(implode(' · ', $err), 'bad'); $p = $new; $_SESSION['pdraft'] = $new; go('product.php' . ($id ? '?id=' . urlencode($id) : '?draft=1')); }
    ad_tx('products', function (&$d) use ($new) {
        foreach ($d as &$x) if ($x['id'] === $new['id']) { $x = $new; return; }
        unset($x); array_unshift($d, $new);
    });
    log_act($p ? L('Sparade produkt', 'Saved product') : L('Skapade produkt', 'Created product'), $new['title']['sv']);
    flash(L('Produkten är sparad', 'The product is saved'));
    go('product.php?id=' . urlencode($new['id']));
}
if (!empty($_GET['draft']) && !empty($_SESSION['pdraft'])) { $p = $_SESSION['pdraft']; unset($p['id']); }
unset($_SESSION['pdraft']);
$isNew = empty($p['id']);
$p = $p ?: ['title' => ['sv' => '', 'en' => ''], 'headline' => ['sv' => '', 'en' => ''], 'desc' => ['sv' => '', 'en' => ''], 'notes' => ['sv' => '', 'en' => ''], 'slug' => '', 'brand' => '', 'cat' => $_GET['cat'] ?? ($cats[0]['id'] ?? ''), 'specs' => [], 'cond' => 'new', 'tags' => [], 'featured' => false, 'active' => true,
    'variants' => [['id' => '', 'sku' => '', 'size' => '', 'color' => '', 'colorEn' => '', 'hex' => '', 'price' => '', 'compare' => '', 'stock' => 1, 'images' => [], 'order' => false]]];
$brands = array_values(array_unique(array_filter(array_column($all, 'brand')))); sort($brands);
/* image library: uploads first (newest), then catalogue photos */
$lib = [];
foreach (array_reverse(glob(AD_UPLOADS . '/products/*.{webp,jpg,jpeg,png}', GLOB_BRACE) ?: []) as $f) $lib[] = 'uploads/products/' . basename($f);
foreach (glob(AD_ROOT . '/assets/p/*.{webp,jpg,jpeg,png}', GLOB_BRACE) ?: [] as $f) $lib[] = 'assets/p/' . basename($f);

function vcard(array $v, $i): string {
    $L = fn($a, $b) => L($a, $b);
    $imgs = '';
    foreach ($v['images'] ?? [] as $s) $imgs .= '<div class="im" draggable="true" data-src="' . e($s) . '"><img src="' . e(src($s)) . '" alt=""><button type="button" data-imrm title="×">×</button></div>';
    $n = "v[$i]";
    $in = fn($k, $label, $type = 'text', $extra = '') => '<label' . (in_array($k, ['color', 'colorEn'], true) ? ' class="w2"' : '') . '>' . $label . '<input type="' . $type . '" name="' . $n . '[' . $k . ']" data-k="' . $k . '" value="' . e($v[$k] ?? '') . '"' . $extra . '></label>';
    return '<div class="vcard"><div class="vcard__hd"><span class="swatch" style="background:' . e($v['hex'] ?: 'transparent') . '"></span><b>Variant <span class="vnum">' . (is_int($i) ? $i + 1 : '') . '</span></b><span class="spacer"></span>'
        . '<button type="button" class="b b--ghost b--sm" data-pick>' . icon('img') . ' ' . $L('Välj bilder', 'Pick images') . '</button>'
        . '<button type="button" class="b b--ghost b--sm b--icon" data-vdup title="' . $L('Duplicera (t.ex. ny storlek)', 'Duplicate (e.g. new size)') . '">' . icon('copy') . '</button>'
        . '<button type="button" class="b b--ghost b--sm b--icon" data-vrm data-q="' . $L('Ta bort varianten?', 'Remove this variant?') . '" title="' . $L('Ta bort', 'Remove') . '">' . icon('trash') . '</button></div>'
        . '<input type="hidden" name="' . $n . '[id]" data-k="id" value="' . e($v['id'] ?? '') . '">'
        . '<div class="vgrid">' . $in('size', $L('Storlek', 'Size')) . $in('sku', $L('Art.nr', 'SKU')) . $in('price', $L('Pris (kr)', 'Price (kr)'), 'text', ' inputmode="decimal" required')
        . $in('compare', $L('Ord. pris (rea)', 'Was price (sale)'), 'text', ' inputmode="decimal"') . $in('stock', $L('Lager (st)', 'Stock (pcs)'), 'number', ' min="0" step="1"')
        . '<label class="chk" style="align-self:end;padding-bottom:10px"><input type="checkbox" name="' . $n . '[order]" value="1" ' . checked($v['order'] ?? false) . '> ' . $L('Beställningsvara', 'Made to order') . '</label>'
        . $in('color', $L('Färg (svenska)', 'Colour (Swedish)')) . $in('colorEn', $L('Färg (engelska)', 'Colour (English)'))
        . '<label>' . $L('Färgprov', 'Swatch') . '<input type="color" name="' . $n . '[hex]" data-k="hex" value="' . e($v['hex'] ?: '#F3ECDD') . '"></label>'
        . '</div><textarea class="vimgs" name="' . $n . '[images]" hidden>' . e(implode("\n", $v['images'] ?? [])) . '</textarea>'
        . '<div class="imgs">' . $imgs . '<label class="add" data-label="+ ' . $L('Ladda upp', 'Upload') . '"><span>+ ' . $L('Ladda upp', 'Upload') . '</span><input type="file" data-upload accept="image/jpeg,image/png,image/webp" multiple hidden></label></div>'
        . '<p class="hint" style="margin:6px 0 0">' . $L('Första bilden (röd ram) visas först. Dra för att ändra ordning.', 'The first image (red frame) is shown first. Drag to reorder.') . '</p></div>';
}
$lf = fn($name, $label, $val, $type = 'input', $rows = 3, $attrs = '') => $type === 'input'
    ? '<label data-l="' . substr($name, -2) . '"' . (str_ends_with($name, 'en') ? ' hidden' : '') . '>' . $label . '<input name="' . $name . '" value="' . e($val) . '"' . $attrs . '></label>'
    : '<label data-l="' . substr($name, -2) . '"' . (str_ends_with($name, 'en') ? ' hidden' : '') . '>' . $label . '<textarea name="' . $name . '" rows="' . $rows . '"' . $attrs . '>' . e($val) . '</textarea></label>';
admin_head($isNew ? L('Ny produkt', 'New product') : $p['title']['sv'], 'products', '<a class="b b--ghost" href="products.php">← ' . L('Alla produkter', 'All products') . '</a>' . (!$isNew ? '<a class="b b--ghost" target="_blank" href="../produkt.php?p=' . e($p['slug']) . '">' . icon('eye') . ' ' . L('Visa', 'View') . '</a>' : ''));
?>
<form method="post" data-dirty id="pform"><?= csrf_field() ?>
<div class="ped">
  <div>
    <div class="card" data-lang-tabs>
      <div class="card__hd"><h3><?= L('Texter', 'Texts') ?></h3><div class="langtabs"><button type="button" class="on" data-show="sv">Svenska</button><button type="button" data-show="en">English</button></div></div>
      <?= $lf('title_sv', L('Titel', 'Title') . ' *', $p['title']['sv'], 'input', 3, ' data-slug-from required maxlength="140"') ?>
      <?= $lf('title_en', L('Titel (engelska)', 'Title (English)'), $p['title']['en'] ?? '', 'input', 3, ' maxlength="140"') ?>
      <?= $lf('head_sv', L('Kort rubrik', 'Short headline'), $p['headline']['sv'] ?? '') ?>
      <?= $lf('head_en', L('Kort rubrik (engelska)', 'Short headline (English)'), $p['headline']['en'] ?? '') ?>
      <?= $lf('desc_sv', L('Beskrivning', 'Description'), $p['desc']['sv'] ?? '', 'textarea', 9) ?>
      <?= $lf('desc_en', L('Beskrivning (engelska)', 'Description (English)'), $p['desc']['en'] ?? '', 'textarea', 9) ?>
      <?= $lf('notes_sv', L('Extra info (t.ex. leveranstid)', 'Extra info (e.g. delivery time)'), $p['notes']['sv'] ?? '', 'textarea', 2) ?>
      <?= $lf('notes_en', L('Extra info (engelska)', 'Extra info (English)'), $p['notes']['en'] ?? '', 'textarea', 2) ?>
      <p class="hint"><?= L('Lämnas engelska fält tomma visas den svenska texten även på engelska sidan.', 'If English fields are left empty, the Swedish text is shown on the English site too.') ?></p>
    </div>
    <div class="card">
      <div class="card__hd"><h3><?= L('Varianter – storlek, färg, pris, lager & bilder', 'Variants – size, colour, price, stock & images') ?></h3><button type="button" class="b b--sm" id="addVariant"><?= icon('plus') ?> <?= L('Lägg till variant', 'Add variant') ?></button></div>
      <div id="variants"><?php foreach ($p['variants'] as $i => $v) echo vcard($v + ['hex' => ''], $i); ?></div>
      <template id="vtpl"><?= vcard(['id' => '', 'sku' => '', 'size' => '', 'color' => '', 'colorEn' => '', 'hex' => '', 'price' => '', 'compare' => '', 'stock' => 1, 'images' => [], 'order' => false], '__i__') ?></template>
      <p class="hint"><?= L('En variant = en kombination av storlek och färg med eget lager. Beställningsvara går att köpa även med lager 0.', 'A variant = one combination of size and colour with its own stock. Made-to-order items can be bought even with stock 0.') ?></p>
    </div>
    <div class="card">
      <div class="card__hd"><h3><?= L('Detaljer (tabell på produktsidan)', 'Details (table on the product page)') ?></h3><button type="button" class="b b--ghost b--sm" id="addSpec"><?= icon('plus') ?> <?= L('Rad', 'Row') ?></button></div>
      <div id="specs"><?php foreach ($p['specs'] ?? [] as [$k, $val]): ?><div class="specrow"><input name="spec_k[]" value="<?= e($k) ?>"><input name="spec_v[]" value="<?= e($val) ?>"><button type="button" class="b b--ghost b--icon" data-specrm>×</button></div><?php endforeach; ?></div>
    </div>
  </div>
  <aside>
    <div class="card">
      <h3><?= L('Publicering', 'Publishing') ?></h3>
      <label class="chk"><input type="checkbox" name="active" value="1" <?= checked($p['active'] ?? true) ?>> <?= L('Synlig i butiken', 'Visible in shop') ?></label>
      <label class="chk"><input type="checkbox" name="featured" value="1" <?= checked($p['featured'] ?? false) ?>> <?= L('Utvald (visas på startsidan)', 'Featured (shown on home page)') ?></label>
      <label><?= L('Kategori', 'Category') ?><select name="cat"><?php foreach ($cats as $c): ?><option value="<?= e($c['id']) ?>" <?= sel($p['cat'], $c['id']) ?>><?= e($c['name']['sv']) ?></option><?php endforeach; ?></select></label>
      <label><?= L('Märke', 'Brand') ?><input name="brand" value="<?= e($p['brand'] ?? '') ?>" list="brands"><datalist id="brands"><?php foreach ($brands as $b): ?><option value="<?= e($b) ?>"><?php endforeach; ?></datalist></label>
      <label><?= L('Skick', 'Condition') ?><select name="cond"><option value="new" <?= sel($p['cond'] ?? 'new', 'new') ?>><?= L('Ny', 'New') ?></option><option value="sample" <?= sel($p['cond'] ?? '', 'sample') ?>><?= L('Provexemplar', 'Sample') ?></option><option value="defect" <?= sel($p['cond'] ?? '', 'defect') ?>><?= L('Defekt / fynd', 'Defect / bargain') ?></option></select></label>
      <label><?= L('Taggar (kommaseparerade)', 'Tags (comma separated)') ?><input name="tags" value="<?= e(implode(', ', $p['tags'] ?? [])) ?>" placeholder="spets, a-linje"></label>
      <label><?= L('Webbadress (slug)', 'URL (slug)') ?><input name="slug" value="<?= e($p['slug']) ?>" data-slug pattern="[a-z0-9\-]*"></label>
      <div class="row" style="margin-top:6px"><button class="b" style="flex:1"><?= icon('check') ?> <?= L('Spara', 'Save') ?></button></div>
    </div>
    <?php if (!$isNew && can('products.delete')): ?>
    <div class="card"><button class="b b--danger" form="delform" style="width:100%" data-confirm="<?= L('Radera produkten? Du kan ångra direkt efteråt.', 'Delete the product? You can undo right afterwards.') ?>"><?= icon('trash') ?> <?= L('Radera produkt', 'Delete product') ?></button></div>
    <?php endif; ?>
  </aside>
</div>
</form>
<?php if (!$isNew): ?><form method="post" id="delform"><?= csrf_field() ?><input type="hidden" name="act" value="delete"></form><?php endif; ?>
<script type="application/json" id="imglib"><?= json_encode($lib, JSON_UNESCAPED_SLASHES | JSON_HEX_TAG) ?></script>
<?php admin_foot(); ?>
