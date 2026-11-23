<?php
require __DIR__ . '/inc/layout.php';
$p = product_by_slug((string)($_GET['p'] ?? ''));
if (!$p) { http_response_code(404); require __DIR__ . '/404.php'; exit; }
$s = settings(); $L = lang();
$cat = category($p['cat']);
$card = product_card($p);
$images = []; foreach ($p['variants'] as $v) foreach ($v['images'] ?? [] as $im) $images[$im] = 1;
$images = array_keys($images);
$pdata = ['id' => $p['id'], 'title' => tr($p['title']), 'images' => $images, 'v' => array_map(function ($v) use ($L) {
    [$pr, $cp] = variant_price($v);
    return ['id' => $v['id'], 'size' => $v['size'] ?? '', 'color' => $L === 'en' ? (($v['colorEn'] ?? '') ?: ($v['color'] ?? '')) : ($v['color'] ?? ''), 'hex' => $v['hex'] ?? '', 'price' => $pr, 'compare' => $cp,
        'stock' => (int)($v['stock'] ?? 0), 'order' => !empty($v['order']), 'sku' => $v['sku'] ?? '', 'images' => array_values($v['images'] ?? [])];
}, $p['variants'])];
$hasColors = count(array_unique(array_filter(array_column($p['variants'], 'hex')))) > 1;
$hasSizes = (bool)array_filter(array_column($p['variants'], 'size'));
$isDress = in_array($p['cat'], ['brud', 'fest'], true);
$desc = tr($p['desc']);
$notes = trim(tr($p['notes'] ?? ''));
$related = array_values(array_filter(array_map('product_card', products()), fn($x) => $x['cat'] === $p['cat'] && $x['id'] !== $p['id'] && $x['stock']));
usort($related, fn($a, $b) => (($b['brand'] === $p['brand']) <=> ($a['brand'] === $p['brand'])) ?: ($b['featured'] <=> $a['featured']));
$related = array_slice($related, 0, 4);
$v0 = $p['variants'][0];
$schema = ['@context' => 'https://schema.org', '@type' => 'Product', 'name' => tr($p['title']), 'image' => $images, 'description' => mb_substr(str_replace("\n", ' ', $desc), 0, 400), 'sku' => $v0['sku'] ?? $p['id'],
    'brand' => ['@type' => 'Brand', 'name' => $p['brand'] ?: 'Ateljé Dantel'],
    'offers' => ['@type' => 'AggregateOffer', 'priceCurrency' => 'SEK', 'lowPrice' => $card['price'], 'highPrice' => $card['max'], 'offerCount' => count($p['variants']), 'availability' => $card['stock'] ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock']];
site_head(tr($p['title']), ['page' => 'product', 'desc' => mb_substr(str_replace("\n", ' ', tr($p['headline']) ?: $desc), 0, 160), 'image' => $images[0] ?? '', 'schema' => $schema]);
?>
<div class="wrap" style="padding-top:22px">
  <nav class="crumbs" aria-label="breadcrumb"><a href="./"><?= t('nav.home') ?></a><span><a href="butik.php"><?= t('nav.shop') ?></a></span><?php if ($cat): ?><span><a href="butik.php?kat=<?= e($cat['slug']) ?>"><?= e(tr($cat['name'])) ?></a></span><?php endif; ?><span><?= e(tr($p['title'])) ?></span></nav>
</div>
<section class="pd wrap" id="pd">
  <div class="gal">
    <div class="gal__thumbs"></div>
    <div class="gal__main">
      <img src="<?= e($images[0] ?? '') ?>" alt="<?= e(tr($p['title'])) ?>" fetchpriority="high">
      <?php if ($card['compare']): ?><span class="tag tag--sale"><?= t('ui.sale') ?></span><?php elseif (($p['cond'] ?? '') === 'sample'): ?><span class="tag"><?= t('ui.sample') ?></span><?php elseif (($p['cond'] ?? '') === 'defect'): ?><span class="tag"><?= t('ui.defect') ?></span><?php endif; ?>
      <div class="gal__nav"><button type="button" data-gnav="-1" aria-label="<?= t('ui.prev') ?>"><?= ic('arrow') ?></button><button type="button" data-gnav="1" aria-label="<?= t('ui.next') ?>"><?= ic('arrow') ?></button></div>
      <div class="gal__dots"></div>
    </div>
  </div>
  <div class="pinfo">
    <span class="pinfo__brand"><?= e($p['brand'] ?: tr($cat['name'] ?? '')) ?></span>
    <h1><?= e(tr($p['title'])) ?></h1>
    <?php if (tr($p['headline']) !== '' && tr($p['headline']) !== tr($p['title'])): ?><p class="pinfo__head"><?= e(tr($p['headline'])) ?></p><?php endif; ?>
    <div class="pinfo__price" id="pprice"><span><?= kr($card['price']) ?></span></div>

    <?php if ($hasColors): ?><div class="opt"><div class="opt__hd"><span><?= t('ui.color') ?>: <b id="colorName"></b></span></div><div class="swatches" id="swatches"></div></div><?php endif; ?>
    <?php if ($hasSizes): ?><div class="opt"><div class="opt__hd"><span><?= t('ui.size') ?></span><?php if ($isDress || $p['cat'] === 'skor'): ?><button type="button" data-sizeguide><?= ic('ruler') ?> <?= t('ui.sizeguide') ?></button><?php endif; ?></div><div class="sizes" id="sizes"></div></div><?php endif; ?>
    <div class="pinfo__stock" id="pstock"></div>
    <div class="buy">
      <button class="btn" id="addBtn" type="button"><?= ic('bag') ?> <?= t('ui.add') ?></button>
      <button type="button" data-wish="<?= e($p['id']) ?>" aria-label="<?= t('ui.wishadd') ?>"><?= ic('heart') ?></button>
    </div>
    <div class="pinfo__alt">
      <a class="btn btn--line" href="boka.php?typ=<?= $p['cat'] === 'brud' ? 'brud' : 'fest' ?>&amp;p=<?= e($p['id']) ?>"><?= ic('cal') ?> <?= t('nav.book') ?></a>
      <a class="btn btn--line" href="kontakt.php?om=<?= e(rawurlencode(tr($p['title']))) ?>"><?= ic('mail') ?> <?= t('ui.ask') ?></a>
    </div>
    <ul class="perks">
      <?php if ($isDress): ?><li><?= ic('needle') ?><?= t('ui.fittext') ?></li><?php endif; ?>
      <li><?= ic('pin') ?><?= t('co.pickup') ?> · MVG-gallerian, Umeå</li>
      <li><?= ic('truck') ?><?= e(tr($s['shipping']['note'] ?? '')) ?></li>
    </ul>
    <div class="acc pacc">
      <details class="acc__item" open><summary><span><?= t('ui.desc') ?></span><i><?= ic('plus') ?></i></summary><div class="acc__body"><?= nl2br(e($desc)) ?><?php if ($notes !== '' && lang() === 'sv'): ?><p class="muted" style="margin-top:12px"><?= nl2br(e($notes)) ?></p><?php endif; ?></div></details>
      <details class="acc__item"><summary><span><?= t('ui.details') ?></span><i><?= ic('plus') ?></i></summary><div class="acc__body">
        <table class="specs">
          <?php if ($p['brand']): ?><tr><td><?= t('ui.brand') ?></td><td><?= e($p['brand']) ?></td></tr><?php endif; ?>
          <tr><td><?= t('ui.sku') ?></td><td id="psku"><?= e($v0['sku'] ?? '') ?></td></tr>
          <?php foreach ($p['specs'] ?? [] as [$k, $val]): ?><tr><td><?= e($k) ?></td><td><?= e($val) ?></td></tr><?php endforeach; ?>
        </table></div></details>
      <details class="acc__item"><summary><span><?= t('ui.delivery') ?></span><i><?= ic('plus') ?></i></summary><div class="acc__body"><p><?= e(tr($s['shipping']['note'] ?? '')) ?></p><p><?= e(tr($s['returns'] ?? '')) ?></p><a class="link" href="villkor.php"><?= t('nav.terms') ?> <?= ic('arrow') ?></a></div></details>
    </div>
    <p style="margin-top:20px"><button type="button" class="link" data-share><?= ic('share') ?> <?= t('ui.share') ?></button></p>
  </div>
</section>

<?php if ($related): ?>
<section class="related wrap">
  <header class="sec__hd"><h2 class="h2" data-lines><?= t('ui.related') ?></h2></header>
  <div class="grid"><?php foreach ($related as $r) echo card_html($r); ?></div>
</section>
<?php endif; ?>

<div class="sticky-buy"><img src="<?= e($images[0] ?? '') ?>" alt=""><div><b><?= e(tr($p['title'])) ?></b><span class="price"><?= kr($card['price']) ?></span></div><button class="btn btn--sm" id="stickyAdd" type="button"><?= t('ui.add') ?></button></div>
<template id="sizeguideTpl"><?php require __DIR__ . '/inc/sizechart.php'; ?></template>
<script type="application/json" id="pdata"><?= json_encode($pdata, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP) ?></script>
<?php site_foot(); ?>
