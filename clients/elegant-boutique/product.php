<?php
require __DIR__ . '/inc/bootstrap.php';
require __DIR__ . '/inc/ui.php';
$p = product((string)($_GET['p'] ?? ''));
if (!$p || !empty($p['hidden'])) { http_response_code(404); $p = null; }
$ar = LANG === 'ar';
$noPreloader = true;
$pageClass = 'page-product';
if ($p) {
    $pageTitle = L($p, 'name');
    $pageDesc = mb_substr(L($p, 'desc'), 0, 155);
    $ogImage = $p['images'][0] ?? null;
    $cat = category($p['category']);
    $related = array_values(array_filter(products(), fn($x) => $x['id'] !== $p['id'] && $x['category'] === $p['category']));
    if (count($related) < 4) $related = array_merge($related, array_values(array_filter(products(), fn($x) => $x['id'] !== $p['id'] && $x['category'] !== $p['category'] && !empty($x['best']))));
    $related = array_slice($related, 0, 4);
    $stock = (int)$p['stock'];
}
require __DIR__ . '/inc/header.php';
if (!$p): ?>
  <section class="empty empty--page wrap"><h1 class="sec-title">404</h1><p><?= t('no_results') ?></p><a class="btn btn--dark" href="shop.php"><?= t('shop_all') ?></a></section>
<?php require __DIR__ . '/inc/footer.php'; exit; endif; ?>

<div class="pdp-wrap" style="<?= tone_style($p) ?>">
<nav class="crumbs wrap" aria-label="breadcrumb">
  <a href="./"><?= t('home') ?></a><i>/</i><a href="shop.php?cat=<?= e($p['category']) ?>"><?= e($cat[LANG] ?? '') ?></a><i>/</i><span><?= e(L($p, 'name')) ?></span>
</nav>

<section class="pdp wrap" data-pdp="<?= e($p['id']) ?>">
  <div class="pdp__gallery">
    <div class="pdp__thumbs">
      <?php foreach ($p['images'] as $k => $img): ?>
        <button class="pdp__thumb <?= $k === 0 ? 'is-on' : '' ?>" data-thumb="<?= $k ?>" aria-label="<?= $k + 1 ?>"><img src="<?= e($img) ?>" alt=""></button>
      <?php endforeach; ?>
    </div>
    <div class="pdp__main" data-lens data-zoomable>
      <?php foreach ($p['images'] as $k => $img): ?>
        <img class="pdp__img <?= $k === 0 ? 'is-on' : '' ?>" src="<?= e($img) ?>" alt="<?= e(L($p, 'name')) ?>" data-slide="<?= $k ?>" <?= $k ? 'loading="lazy"' : 'fetchpriority="high"' ?>>
      <?php endforeach; ?>
      <span class="spot__lens" aria-hidden="true"></span>
      <span class="pdp__counter"><b data-counter>1</b> / <?= count($p['images']) ?></span>
    </div>
  </div>

  <div class="pdp__info">
    <div class="pdp__sticky">
      <span class="pdp__cat"><?= e($cat[LANG] ?? '') ?><?php if (L($p, 'badge')): ?> · <em><?= e(L($p, 'badge')) ?></em><?php endif; ?></span>
      <h1 class="pdp__name" data-split><?= split_words(L($p, 'name')) ?></h1>
      <div class="pdp__price">
        <?php if (!empty($p['compare']) && $p['compare'] > $p['price']): ?><s><?= money($p['compare']) ?></s><?php endif; ?>
        <span><?= money($p['price']) ?></span>
      </div>
      <p class="pdp__desc"><?= e(L($p, 'desc')) ?></p>

      <div class="pdp__stock <?= $stock ? ($stock <= (int)setting('low_stock', 2) ? 'is-low' : 'is-ok') : 'is-out' ?>">
        <i></i><?= $stock ? ($stock <= (int)setting('low_stock', 2) ? sprintf(t('only_left'), $stock) : t('in_stock')) : t('sold_out') ?>
      </div>

      <?php if ($stock): ?>
      <div class="pdp__buy">
        <div class="qty" data-qty>
          <button type="button" data-qty-minus aria-label="-">−</button>
          <input type="number" value="1" min="1" max="<?= $stock ?>" aria-label="<?= t('qty') ?>" data-qty-input>
          <button type="button" data-qty-plus aria-label="+">+</button>
        </div>
        <button class="btn btn--dark btn--grow" data-add="<?= e($p['id']) ?>" data-with-qty data-magnetic><?= t('add_to_cart') ?></button>
      </div>
      <button class="btn btn--gold btn--block" data-buy-now="<?= e($p['id']) ?>"><?= t('buy_now') ?></button>
      <?php endif; ?>

      <?php $wa = wa_link(($ar ? 'أهلاً، عندي سؤال عن: ' : 'Hello, a question about: ') . L($p, 'name')); if ($wa): ?>
        <a class="pdp__wa" href="<?= e($wa) ?>" target="_blank" rel="noopener"><?= t('ask_whatsapp') ?> →</a>
      <?php endif; ?>

      <div class="acc">
        <details open><summary><?= t('details') ?></summary>
          <ul><?php foreach (($p['details_' . LANG] ?? []) as $d): ?><li><?= e($d) ?></li><?php endforeach; ?></ul>
        </details>
        <details><summary><?= t('care') ?></summary><p><?= t('care_text') ?></p></details>
        <details><summary><?= t('ship_warranty') ?></summary><p><?= t('ship_warranty_text') ?></p></details>
      </div>

      <div class="pdp__trust">
        <span><?= t('feat_cod') ?></span><span><?= t('feat_warranty') ?></span><span><?= t('feat_gift') ?></span>
      </div>
    </div>
  </div>
</section>
</div>

<!-- Look closer: the photo grows to full screen and pans across details as you scroll -->
<section class="closer" data-closer>
  <div class="closer__pin">
    <div class="closer__frame"><img src="<?= e($p['images'][0]) ?>" alt="" data-closer-img></div>
    <div class="closer__text">
      <p class="eyebrow"><span class="line"></span><?= t('look_closer') ?></p>
      <h2><?= t('look_closer_sub') ?></h2>
      <ol class="closer__notes">
        <?php foreach (array_slice($p['details_' . LANG] ?? [], 0, 3) as $k => $d): ?><li data-note="<?= $k ?>"><span>0<?= $k + 1 ?></span><?= e($d) ?></li><?php endforeach; ?>
      </ol>
    </div>
  </div>
</section>

<?php if ($related): ?>
<section class="grid-sec wrap">
  <div class="sec-head"><h2 class="sec-title" data-reveal><?= t('you_may_like') ?></h2></div>
  <div class="pgrid"><?php foreach ($related as $i => $r) echo product_card($r, $i); ?></div>
</section>
<?php endif; ?>

<div class="lightbox" data-lightbox aria-hidden="true">
  <button class="lightbox__x" data-lightbox-close aria-label="<?= t('close') ?>">✕</button>
  <img alt="">
</div>

<?php if ($stock): ?>
<div class="sticky-buy" data-sticky-buy>
  <img src="<?= e($p['images'][0]) ?>" alt="">
  <div><b><?= e(L($p, 'name')) ?></b><span><?= money($p['price']) ?></span></div>
  <button class="btn btn--dark btn--sm" data-add="<?= e($p['id']) ?>"><?= t('add_to_cart') ?></button>
</div>
<?php endif; ?>

<script type="application/ld+json"><?= json_encode([
    '@context' => 'https://schema.org', '@type' => 'Product', 'name' => L($p, 'name'), 'description' => L($p, 'desc'),
    'image' => $p['images'], 'brand' => ['@type' => 'Brand', 'name' => 'Elegance Boutique'],
    'offers' => ['@type' => 'Offer', 'priceCurrency' => 'EGP', 'price' => $p['price'], 'availability' => $stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'],
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?></script>
<?php require __DIR__ . '/inc/footer.php'; ?>
