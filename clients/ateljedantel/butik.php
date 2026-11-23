<?php
require __DIR__ . '/inc/layout.php';
$cats = categories();
$sel = null; $kat = (string)($_GET['kat'] ?? '');
foreach ($cats as $c) if ($c['slug'] === $kat || $c['id'] === $kat) $sel = $c;
$cards = array_map('product_card', products());
usort($cards, fn($a, $b) => ($b['featured'] <=> $a['featured']) ?: (($b['stock'] <=> $a['stock']) ?: ($b['created'] <=> $a['created'])));
$sort = in_array($_GET['sort'] ?? '', ['new', 'low', 'high'], true) ? $_GET['sort'] : 'rec';

/* facets from what is actually in the shop */
$sizeOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
$sizes = []; $colors = []; $brands = []; $maxPrice = 0;
foreach ($cards as $c) {
    foreach ($c['sizes'] as $z) $sizes[$z] = 1;
    foreach ($c['colors'] as $hex => $n) $colors[$hex] = $n;
    if ($c['brand'] !== '') $brands[$c['brand']] = ($brands[$c['brand']] ?? 0) + 1;
    $maxPrice = max($maxPrice, $c['max']);
}
$sizes = array_keys($sizes);
usort($sizes, function ($a, $b) use ($sizeOrder) {
    $ia = array_search(strtoupper($a), $sizeOrder, true); $ib = array_search(strtoupper($b), $sizeOrder, true);
    if ($ia !== false && $ib !== false) return $ia <=> $ib;
    if (is_numeric($a) && is_numeric($b)) return (float)$a <=> (float)$b;
    return ($ia === false) <=> ($ib === false) ?: strnatcmp($a, $b);
});
arsort($brands);
$title = $sel ? tr($sel['name']) : t('shop.title');
site_head($title, ['page' => 'shop', 'desc' => $sel ? tr($sel['tag']) . ' – Ateljé Dantel, Umeå' : t('shop.lead')]);
?>
<section class="ph wrap" id="shop">
  <nav class="crumbs" aria-label="breadcrumb"><a href="./"><?= t('nav.home') ?></a><span><a href="butik.php"><?= t('nav.shop') ?></a></span><?php if ($sel): ?><span><?= e(tr($sel['name'])) ?></span><?php endif; ?></nav>
  <h1 class="h1" data-lines><?= e($title) ?></h1>
  <p class="lead"><?= e($sel ? tr($sel['tag']) : t('shop.lead')) ?></p>
</section>

<div class="shopbar">
  <div class="shopbar__in wrap">
    <button class="chip filter-btn" id="filterBtn" type="button"><?= ic('filter') ?> <?= t('ui.filter') ?> <span data-fcount></span></button>
    <div class="chips" role="tablist">
      <a href="butik.php" class="chip<?= $sel ? '' : ' on' ?>" data-cat="" data-slug=""><?= t('ui.all') ?> <sup><?= count($cards) ?></sup></a>
      <?php foreach ($cats as $c): $n = count(array_filter($cards, fn($x) => $x['cat'] === $c['id'])); if (!$n) continue; ?>
      <a href="butik.php?kat=<?= e($c['slug']) ?>" class="chip<?= $sel && $sel['id'] === $c['id'] ? ' on' : '' ?>" data-cat="<?= e($c['id']) ?>" data-slug="<?= e($c['slug']) ?>"><?= e(tr($c['name'])) ?> <sup><?= $n ?></sup></a>
      <?php endforeach; ?>
    </div>
    <label class="sr-only" for="sort" hidden><?= t('ui.sort') ?></label>
    <select id="sort" aria-label="<?= t('ui.sort') ?>">
      <?php foreach (['rec', 'new', 'low', 'high'] as $k): ?><option value="<?= $k ?>"<?= $sort === $k ? ' selected' : '' ?>><?= t("sort.$k") ?></option><?php endforeach; ?>
    </select>
  </div>
</div>

<div class="shop wrap">
  <form class="filters" id="filters" onsubmit="return false">
    <div class="fsheet__hd"><b><?= t('ui.filter') ?></b><button type="button" class="tool" data-fclose aria-label="<?= t('ui.close') ?>"><?= ic('close') ?></button></div>
    <?php if ($sizes): ?><div class="fgroup"><h4><?= t('ui.size') ?></h4><div class="fsizes"><?php foreach ($sizes as $z): ?><label><input type="checkbox" name="size" value="<?= e($z) ?>"><span><?= e($z) ?></span></label><?php endforeach; ?></div></div><?php endif; ?>
    <?php if ($colors): ?><div class="fgroup"><h4><?= t('ui.color') ?></h4><div class="fcolors"><?php foreach ($colors as $hex => $n): ?><label title="<?= e($n) ?>"><input type="checkbox" name="color" value="<?= e($hex) ?>" aria-label="<?= e($n) ?>"><span style="--c:<?= e($hex) ?>"></span></label><?php endforeach; ?></div></div><?php endif; ?>
    <div class="fgroup"><h4><?= t('ui.price') ?></h4><div class="frange"><input type="number" name="min" min="0" step="100" placeholder="0" inputmode="numeric" aria-label="min"><span>–</span><input type="number" name="max" min="0" step="100" placeholder="<?= (int)ceil($maxPrice / 100) * 100 ?>" inputmode="numeric" aria-label="max"></div></div>
    <?php if ($brands): ?><div class="fgroup"><h4><?= t('ui.brand') ?></h4><?php foreach ($brands as $b => $n): ?><label class="fcheck"><input type="checkbox" name="brand" value="<?= e($b) ?>"> <?= e($b) ?> <span class="muted">(<?= $n ?>)</span></label><?php endforeach; ?></div><?php endif; ?>
    <div class="fgroup"><label class="fcheck"><input type="checkbox" name="sale" value="1"> <?= t('ui.onlysale') ?></label><label class="fcheck"><input type="checkbox" name="stock" value="1"> <?= t('ui.onlystock') ?></label></div>
    <div class="fgroup"><button type="button" class="link" data-clear><?= t('ui.clear') ?></button></div>
    <div class="fsheet__ft"><button type="button" class="btn btn--line" data-clear><?= t('ui.clear') ?></button><button type="button" class="btn" data-fclose><?= t('ui.showresults') ?></button></div>
  </form>
  <div>
    <div class="grid__meta"><span><b id="count"><?= count($cards) ?></b> <?= t('ui.results') ?></span><a class="link" href="storleksguide.php"><?= ic('ruler') ?> <?= t('nav.size') ?></a></div>
    <div class="grid" id="grid">
      <?php foreach ($cards as $c) echo card_html($c); ?>
      <p class="nores" id="nores" hidden><?= t('ui.noresults') ?></p>
    </div>
  </div>
</div>
<?php site_foot(); ?>
