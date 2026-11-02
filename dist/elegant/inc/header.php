<?php
/** @var string $pageTitle @var string $pageClass @var string $pageDesc */
$pageTitle = $pageTitle ?? '';
$pageClass = $pageClass ?? '';
$storeName = L(eb_load('settings'), 'store_name');
$fullTitle = $pageTitle ? "$pageTitle | $storeName" : $storeName . ' — ' . L(eb_load('settings'), 'tagline');
$pageDesc = $pageDesc ?? (LANG === 'ar'
    ? 'إليجانس بوتيك: مجوهرات فاخرة مطلية بالذهب والبلاتين، عقود وحلقان وأساور وأطقم. توصيل لكل مصر والدفع عند الاستلام.'
    : 'Elegance Boutique: gold and platinum plated fine-fashion jewellery — necklaces, earrings, bracelets and sets. Delivery across Egypt, cash on delivery.');
$ogImage = $ogImage ?? 'assets/img/scenes/hero-still.jpg';
$navCats = array_filter(categories(), fn($c) => category_count($c['id']) > 0);

// Lightweight catalogue for the cart, search and quick-add (server re-prices every order).
$jsProducts = array_map(fn($p) => [
    'id' => $p['id'], 'name' => L($p, 'name'), 'price' => (float)$p['price'], 'compare' => (float)($p['compare'] ?? 0),
    'img' => $p['images'][0] ?? '', 'stock' => (int)$p['stock'], 'cat' => $p['category'],
    'catName' => L(category($p['category']) ?? [], ''), 'url' => 'product.php?p=' . rawurlencode($p['id']),
], products());
foreach ($jsProducts as &$jp) { $c = category($jp['cat']); $jp['catName'] = $c ? ($c[LANG] ?? '') : ''; } unset($jp);
?><!doctype html>
<html lang="<?= LANG ?>" dir="<?= DIR ?>">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title><?= e($fullTitle) ?></title>
<meta name="description" content="<?= e($pageDesc) ?>">
<meta name="theme-color" content="#FBF8F1">
<meta property="og:title" content="<?= e($fullTitle) ?>">
<meta property="og:description" content="<?= e($pageDesc) ?>">
<meta property="og:image" content="<?= e($ogImage) ?>">
<meta property="og:type" content="website">
<link rel="icon" href="assets/img/brand/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="assets/img/brand/apple-touch-icon.png">
<link rel="preload" href="assets/fonts/<?= LANG === 'ar' ? 'alexandria-arabic-200-normal' : 'bodoni-moda-latin-400-normal' ?>.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/<?= LANG === 'ar' ? 'readex-pro-arabic-300-normal' : 'manrope-latin-400-normal' ?>.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="<?= asset('assets/css/site.css') ?>">
<script>document.documentElement.classList.add('js');</script>
</head>
<body class="<?= e($pageClass) ?> lang-<?= LANG ?>">
<a class="skip" href="#main"><?= LANG === 'ar' ? 'تخطَّ إلى المحتوى' : 'Skip to content' ?></a>

<?php if (empty($noPreloader)): ?>
<div class="preloader" aria-hidden="true">
  <div class="preloader__mark">
    <svg viewBox="0 0 120 120" class="mono mono--draw"><use href="#eb-mono"/></svg>
    <span class="preloader__word">ELEGANCE&nbsp;BOUTIQUE</span>
  </div>
  <div class="preloader__bar"><i></i></div>
</div>
<?php endif; ?>

<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <linearGradient id="eb-gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#E9D3A0"/><stop offset=".45" stop-color="#C7A86A"/><stop offset="1" stop-color="#9C7B3F"/>
    </linearGradient>
    <symbol id="eb-mono" viewBox="0 0 120 120">
      <text x="4" y="80" direction="ltr" font-family="Bodoni Moda, serif" font-size="92" font-weight="400" fill="currentColor">E</text>
      <text x="45" y="112" direction="ltr" font-family="Bodoni Moda, serif" font-size="92" font-weight="400" fill="currentColor">B</text>
    </symbol>
  </defs>
</svg>

<div class="announce" role="note">
  <div class="announce__track">
    <?php for ($i = 0; $i < 4; $i++): ?><span><?= e(L(eb_load('settings'), 'announcement')) ?></span><span class="announce__dot">✦</span><?php endfor; ?>
  </div>
</div>

<header class="hdr" data-hdr>
  <div class="hdr__inner">
    <button class="hdr__burger" data-menu-open aria-label="<?= t('menu') ?>"><span></span><span></span></button>
    <nav class="hdr__nav" aria-label="<?= t('collections') ?>">
      <a href="shop.php" class="<?= ($pageClass === 'page-shop' && empty($_GET['cat'])) ? 'is-active' : '' ?>"><?= t('shop_all') ?></a>
      <?php foreach ($navCats as $c): ?>
        <a href="shop.php?cat=<?= e($c['id']) ?>" class="<?= (($_GET['cat'] ?? '') === $c['id']) ? 'is-active' : '' ?>"><?= e($c[LANG]) ?></a>
      <?php endforeach; ?>
    </nav>
    <a class="hdr__logo" href="./" aria-label="<?= e($storeName) ?>">
      <img class="hdr__mark" src="assets/img/brand/logo-gold.png" alt="" width="342" height="342">
      <span class="hdr__word"><b>ELEGANCE</b><small>BOUTIQUE</small></span>
    </a>
    <div class="hdr__tools">
      <a class="hdr__lang" href="<?= e(lang_url(LANG === 'ar' ? 'en' : 'ar')) ?>"><?= LANG === 'ar' ? 'EN' : 'ع' ?></a>
      <button class="icon-btn" data-search-open aria-label="<?= t('search') ?>">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg>
      </button>
      <a class="icon-btn hide-sm" href="track.php" aria-label="<?= t('track') ?>">
        <svg viewBox="0 0 24 24"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17" cy="17.5" r="1.6"/></svg>
      </a>
      <button class="icon-btn cart-btn" data-cart-open aria-label="<?= t('cart') ?>">
        <svg viewBox="0 0 24 24"><path d="M5 8h14l-1.2 12H6.2z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>
        <span class="cart-count" data-cart-count>0</span>
      </button>
    </div>
  </div>
</header>

<div class="menu" data-menu aria-hidden="true">
  <div class="menu__panel">
    <button class="menu__close" data-menu-close aria-label="<?= t('close') ?>">✕</button>
    <a href="./" class="menu__link"><?= t('home') ?></a>
    <a href="shop.php" class="menu__link"><?= t('shop_all') ?></a>
    <?php foreach ($navCats as $c): ?>
      <a href="shop.php?cat=<?= e($c['id']) ?>" class="menu__link"><?= e($c[LANG]) ?> <sup><?= category_count($c['id']) ?></sup></a>
    <?php endforeach; ?>
    <a href="track.php" class="menu__link"><?= t('track') ?></a>
    <div class="menu__foot">
      <a href="<?= e(lang_url(LANG === 'ar' ? 'en' : 'ar')) ?>"><?= LANG === 'ar' ? 'English' : 'العربية' ?></a>
      <?php if (setting('instagram')): ?><a href="https://instagram.com/<?= e(setting('instagram')) ?>" target="_blank" rel="noopener">Instagram</a><?php endif; ?>
    </div>
  </div>
</div>

<div class="search" data-search aria-hidden="true">
  <div class="search__box">
    <input type="search" placeholder="<?= t('search_ph') ?>" data-search-input aria-label="<?= t('search') ?>">
    <button class="search__close" data-search-close aria-label="<?= t('close') ?>">✕</button>
  </div>
  <div class="search__results" data-search-results></div>
</div>

<script>
window.EB = <?= json_encode([
    'lang' => LANG,
    'products' => $jsProducts,
    'cur' => LANG === 'ar' ? setting('currency_ar', 'ج.م') : setting('currency_en', 'EGP'),
    'freeShip' => (float)setting('free_shipping_over', 0),
    'csrf' => csrf(),
    's' => [
        'added' => t('added'), 'empty' => t('cart_empty'), 'emptySub' => t('cart_empty_sub'), 'remove' => t('remove'),
        'freeLeft' => t('free_ship_left'), 'freeOk' => t('free_ship_ok'), 'noResults' => t('no_results'),
        'soldOut' => t('sold_out'), 'shopAll' => t('shop_all'), 'required' => t('required'), 'phoneInvalid' => t('phone_invalid'),
    ],
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>;
</script>
<main id="main">
