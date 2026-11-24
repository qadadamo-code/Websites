<?php
/** Public page frame: <head>, header, drawers (cart, wishlist, search), footer. */
require_once __DIR__ . '/core.php';

function url_lang(string $l): string {
    $q = $_GET; $q['lang'] = $l;
    return strtok($_SERVER['REQUEST_URI'] ?? '', '?') . '?' . http_build_query($q);
}
function asset(string $p): string { $f = AD_ROOT . '/' . $p; return $p . (is_file($f) ? '?v=' . substr(md5((string)filemtime($f)), 0, 8) : ''); }
function ic(string $n): string {
    $d = [
        'search' => '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
        'heart' => '<path d="M12 20s-7.5-4.6-7.5-10.1A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/>',
        'bag' => '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
        'close' => '<path d="M6 6l12 12M18 6 6 18"/>', 'menu' => '<path d="M4 8h16M4 16h16"/>',
        'moon' => '<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/>', 'arrow' => '<path d="M5 12h14M13 6l6 6-6 6"/>',
        'pin' => '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
        'phone' => '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
        'mail' => '<rect x="3.5" y="5.5" width="17" height="13" rx="1.5"/><path d="m4 7 8 6 8-6"/>', 'clock' => '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
        'cal' => '<rect x="4" y="5.5" width="16" height="14.5" rx="1.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>', 'ruler' => '<path d="m3 17 14-14 4 4L7 21z"/><path d="m7 13 2 2M10 10l2 2M13 7l2 2"/>',
        'plus' => '<path d="M12 5v14M5 12h14"/>', 'minus' => '<path d="M5 12h14"/>', 'check' => '<path d="m5 12.5 4.5 4.5L19 7.5"/>', 'share' => '<path d="M12 4v11M7.5 8.5 12 4l4.5 4.5M5 13v6h14v-6"/>',
        'filter' => '<path d="M4 7h16M7 12h10M10 17h4"/>', 'chev' => '<path d="m9 6 6 6-6 6"/>', 'needle' => '<path d="M19 5 7 17l-2 2"/><ellipse cx="18" cy="6" rx="1.2" ry="2.4" transform="rotate(45 18 6)"/><path d="M5 19c3-1 5 1 8-1s2-6 6-7"/>',
        'insta' => '<rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.8" cy="7.2" r=".6"/>', 'fb' => '<path d="M14 8h2.5V4.5H14A3.5 3.5 0 0 0 10.5 8v2.5H8V14h2.5v6H14v-6h2.5l.5-3.5h-3V8.5c0-.3.2-.5.5-.5z"/>',
        'zoom' => '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2M11 8.5v5M8.5 11h5"/>', 'truck' => '<path d="M3 6h11v10H3zM14 9.5h4l3 3.5v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
        'spark' => '<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/>',
    ][$n] ?? '';
    return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' . $d . '</svg>';
}

function site_head(string $title, array $o = []): void {
    $s = settings(); $L = lang();
    $desc = $o['desc'] ?? tr($s['seo']['desc'] ?? '');
    $page = $o['page'] ?? '';
    $full = $title === '' ? tr($s['seo']['title'] ?? 'Ateljé Dantel') : $title . ' – Ateljé Dantel';
    $img = $o['image'] ?? 'assets/img/bride-garden.webp';
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $base = $scheme . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/')), '/') . '/';
    $cats = categories();
    $navCats = ['brud' => t('nav.bridal'), 'fest' => t('nav.evening')];
    ?><!doctype html>
<html lang="<?= $L ?>" data-page="<?= e($page) ?>">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title><?= e($full) ?></title>
<meta name="description" content="<?= e($desc) ?>">
<meta name="theme-color" content="#F7F1EC" media="(prefers-color-scheme: light)"><meta name="theme-color" content="#120D0C" media="(prefers-color-scheme: dark)">
<link rel="icon" href="assets/brand/favicon.png" type="image/png"><link rel="apple-touch-icon" href="assets/brand/apple-touch-icon.png">
<link rel="alternate" hreflang="sv" href="<?= e(url_lang('sv')) ?>"><link rel="alternate" hreflang="en" href="<?= e(url_lang('en')) ?>">
<meta property="og:type" content="website"><meta property="og:title" content="<?= e($full) ?>"><meta property="og:description" content="<?= e($desc) ?>">
<meta property="og:image" content="<?= e($base . $img) ?>"><meta property="og:locale" content="<?= $L === 'en' ? 'en_GB' : 'sv_SE' ?>">
<link rel="preload" href="assets/fonts/jost-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/manrope-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="<?= asset('assets/css/site.css') ?>">
<script>try{var t=localStorage.getItem('ad_theme');if(t)document.documentElement.dataset.theme=t;if(sessionStorage.getItem('ad_intro'))document.documentElement.classList.add('no-intro')}catch(e){}document.documentElement.classList.add('js')</script>
<?php if (!empty($o['schema'])): ?><script type="application/ld+json"><?= json_encode($o['schema'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG) ?></script><?php endif; ?>
</head>
<body class="<?= e($o['body'] ?? '') ?>">
<a class="skip" href="#main"><?= t('ui.skip') ?></a>
<?php if (!empty($o['intro'])): ?>
<div class="intro" id="intro" aria-hidden="true">
  <div class="intro__inner"><?= logo_svg('intro__logo') ?></div>
  <div class="intro__curtain intro__curtain--l"></div><div class="intro__curtain intro__curtain--r"></div>
</div>
<?php endif; ?>
<?php if (tr($s['announce'] ?? '') !== ''): ?><div class="announce"><div class="announce__track"><?php for ($i = 0; $i < 4; $i++): ?><span><?= e(tr($s['announce'])) ?></span><i>✦</i><?php endfor; ?></div></div><?php endif; ?>
<header class="hd<?= !empty($o['overlay']) ? ' hd--over' : '' ?>" id="hd">
  <div class="hd__in">
    <button class="hd__burger" data-open="menu" aria-label="<?= t('nav.menu') ?>"><?= ic('menu') ?></button>
    <nav class="hd__nav" aria-label="<?= t('nav.menu') ?>">
      <div class="mega-wrap">
        <a href="butik.php" class="<?= $page === 'shop' ? 'on' : '' ?>"><?= t('nav.shop') ?></a>
        <div class="mega"><div class="mega__in">
          <?php foreach ($cats as $c): ?><a class="mega__cat" href="butik.php?kat=<?= e($c['slug']) ?>"><img src="<?= e(cat_icon($c)) ?>" alt="" loading="lazy"><b><?= e(tr($c['name'])) ?></b><small><?= e(tr($c['tag'])) ?></small></a><?php endforeach; ?>
          <a class="mega__feat" href="butik.php?kat=brudklanningar"><img src="assets/img/bride-tiara.webp" alt="" loading="lazy"><span><?= t('nav.bridal') ?> <?= ic('arrow') ?></span></a>
        </div></div>
      </div>
      <?php foreach ($navCats as $id => $label): $c = category($id); if (!$c || empty($c['active'])) continue; ?><a href="butik.php?kat=<?= e($c['slug']) ?>"><?= $label ?></a><?php endforeach; ?>
      <a href="skradderi.php" class="<?= $page === 'tailor' ? 'on' : '' ?>"><?= t('nav.tailor') ?></a>
      <a href="herr.php" class="<?= $page === 'herr' ? 'on' : '' ?>"><?= t('nav.herr') ?></a>
      <a href="om-oss.php" class="<?= $page === 'about' ? 'on' : '' ?>"><?= t('nav.about') ?></a>
    </nav>
    <a class="hd__logo" href="./" aria-label="Ateljé Dantel – <?= t('nav.home') ?>"><?= logo_svg('logo', false) ?></a>
    <div class="hd__tools">
      <a class="btn btn--sm btn--line hd__book" href="boka.php"><?= ic('cal') ?><span><?= t('nav.book') ?></span></a>
      <div class="lang" role="group" aria-label="Language"><a href="<?= e(url_lang('sv')) ?>" class="<?= $L === 'sv' ? 'on' : '' ?>" hreflang="sv">SV</a><a href="<?= e(url_lang('en')) ?>" class="<?= $L === 'en' ? 'on' : '' ?>" hreflang="en">EN</a></div>
      <button class="tool" data-theme-toggle aria-label="<?= t('ui.theme') ?>"><?= ic('moon') ?></button>
      <button class="tool" data-open="search" aria-label="<?= t('ui.search') ?>"><?= ic('search') ?></button>
      <button class="tool" data-open="wish" aria-label="<?= t('ui.wish') ?>"><?= ic('heart') ?><b class="count" data-count="wish" hidden>0</b></button>
      <button class="tool" data-open="cart" aria-label="<?= t('ui.cart') ?>"><?= ic('bag') ?><b class="count" data-count="cart" hidden>0</b></button>
    </div>
  </div>
</header>

<div class="menu" id="menu" data-panel="menu" aria-hidden="true">
  <div class="menu__top"><span class="eyebrow"><?= t('nav.menu') ?></span><div class="lang lang--menu" role="group" aria-label="Language"><a href="<?= e(url_lang('sv')) ?>" class="<?= $L === 'sv' ? 'on' : '' ?>" hreflang="sv">Svenska</a><a href="<?= e(url_lang('en')) ?>" class="<?= $L === 'en' ? 'on' : '' ?>" hreflang="en">English</a></div><button class="tool" data-close aria-label="<?= t('ui.close') ?>"><?= ic('close') ?></button></div>
  <nav class="menu__nav">
    <a href="butik.php"><?= t('nav.all') ?></a>
    <?php foreach ($cats as $c): ?><a href="butik.php?kat=<?= e($c['slug']) ?>"><?= e(tr($c['name'])) ?></a><?php endforeach; ?>
    <a href="skradderi.php"><?= t('nav.tailor') ?></a><a href="herr.php"><?= t('nav.herr') ?></a><a href="om-oss.php"><?= t('nav.about') ?></a><?php if (press_items()): ?><a href="press.php"><?= t('nav.press') ?></a><?php endif; ?><a href="storleksguide.php"><?= t('nav.size') ?></a><a href="kontakt.php"><?= t('nav.contact') ?></a>
  </nav>
  <div class="menu__foot"><a class="btn" href="boka.php"><?= ic('cal') ?> <?= t('nav.book') ?></a><a href="tel:<?= e($s['phoneIntl']) ?>"><?= e($s['phone']) ?></a><a href="mailto:<?= e($s['email']) ?>"><?= e($s['email']) ?></a></div>
</div>

<div class="search" id="search" data-panel="search" aria-hidden="true" role="dialog" aria-label="<?= t('ui.search') ?>">
  <div class="search__bar"><?= ic('search') ?><input type="search" id="q" placeholder="<?= t('ui.searchph') ?>" autocomplete="off" enterkeyhint="search"><button class="tool" data-close aria-label="<?= t('ui.close') ?>"><?= ic('close') ?></button></div>
  <div class="search__chips"><?php foreach (['Ivory', 'Burgundy', 'Navy', 'Spets', 'Satin', 'Paljett', 'Nixa', 'PartyLine'] as $q): ?><button type="button" data-q="<?= e($q) ?>"><?= e($q) ?></button><?php endforeach; ?></div>
  <div class="search__res" id="qres"></div>
</div>

<aside class="drawer" id="cart" data-panel="cart" aria-hidden="true" aria-label="<?= t('ui.cart') ?>">
  <div class="drawer__hd"><h2><?= t('ui.cart') ?> <sup data-count="cart">0</sup></h2><button class="tool" data-close aria-label="<?= t('ui.close') ?>"><?= ic('close') ?></button></div>
  <div class="drawer__body" id="cartList"></div>
  <div class="drawer__ft" id="cartFt">
    <div class="row"><span><?= t('ui.subtotal') ?></span><b id="cartSub">0 kr</b></div>
    <a class="btn btn--block" href="kassa.php"><?= t('ui.checkout') ?> <?= ic('arrow') ?></a>
    <p class="fine"><?= t('co.how1') ?></p>
  </div>
</aside>
<aside class="drawer" id="wish" data-panel="wish" aria-hidden="true" aria-label="<?= t('ui.wish') ?>">
  <div class="drawer__hd"><h2><?= t('ui.wish') ?> <sup data-count="wish">0</sup></h2><button class="tool" data-close aria-label="<?= t('ui.close') ?>"><?= ic('close') ?></button></div>
  <div class="drawer__body" id="wishList"></div>
  <div class="drawer__ft"><a class="btn btn--line btn--block" href="boka.php?wish=1"><?= ic('cal') ?> <?= t('bk.title') ?></a></div>
</aside>
<div class="scrim" data-close></div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
<div class="modal" id="modal" aria-hidden="true" role="dialog"><div class="modal__box"><button class="tool modal__x" data-close aria-label="<?= t('ui.close') ?>"><?= ic('close') ?></button><div class="modal__body" id="modalBody"></div></div></div>

<main id="main">
<?php
}

function site_foot(array $o = []): void {
    $s = settings(); $L = lang();
    $i18n = [];
    foreach (['ui.add', 'ui.added', 'ui.choose', 'ui.remove', 'ui.cartempty', 'ui.wishempty', 'ui.from', 'ui.soldout', 'ui.order', 'ui.results', 'ui.noresults', 'ui.view', 'ui.wishadd', 'ui.copied', 'ui.size', 'ui.color', 'ui.sale', 'ui.instock',
        'co.free', 'co.sending', 'co.err', 'co.place', 'f.req', 'f.email', 'f.err', 'f.rate', 'bk.none', 'bk.closed', 'bk.taken', 'bk.waMsg', 'bk.date', 'bk.noteSk', 'bk.noteReq', 'co.note', 'home.newsOk', 'ui.seeall', 'ui.onlyone', 'ui.sizeguide', 'ui.continue', 'ui.qty'] as $k) $i18n[$k] = t($k);
    ?>
</main>
<footer class="ft">
  <div class="ft__big" aria-hidden="true"><?= logo_svg('ft__logo') ?></div>
  <div class="ft__grid wrap">
    <div class="ft__col ft__about">
      <p><?= t('ft.about') ?></p>
      <div class="ft__social">
        <?php foreach (['instagram' => 'insta', 'facebook' => 'fb'] as $k => $icn): if (!empty($s['social'][$k])): ?><a href="<?= e($s['social'][$k]) ?>" target="_blank" rel="noopener" aria-label="<?= ucfirst($k) ?>"><?= ic($icn) ?></a><?php endif; endforeach; ?>
      </div>
    </div>
    <div class="ft__col"><h3><?= t('ft.shop') ?></h3><?php foreach (categories() as $c): ?><a href="butik.php?kat=<?= e($c['slug']) ?>"><?= e(tr($c['name'])) ?></a><?php endforeach; ?></div>
    <div class="ft__col"><h3><?= t('ft.help') ?></h3><a href="boka.php"><?= t('nav.book') ?></a><a href="skradderi.php"><?= t('nav.tailor') ?></a><a href="herr.php"><?= t('nav.herr') ?></a><a href="storleksguide.php"><?= t('nav.size') ?></a><a href="villkor.php"><?= t('nav.terms') ?></a><a href="kontakt.php"><?= t('nav.contact') ?></a><a href="om-oss.php"><?= t('nav.about') ?></a><?php if (press_items()): ?><a href="press.php"><?= t('nav.press') ?></a><?php endif; ?></div>
    <div class="ft__col"><h3><?= t('ui.visit') ?></h3>
      <a href="<?= e($s['mapUrl']) ?>" target="_blank" rel="noopener"><?= e($s['address']) ?><br><?= e($s['city']) ?></a>
      <a href="tel:<?= e($s['phoneIntl']) ?>"><?= e($s['phone']) ?></a><a href="mailto:<?= e($s['email']) ?>"><?= e($s['email']) ?></a>
      <ul class="hours"><?php foreach ($s['hours'] as $h): ?><li><span><?= e(tr($h['d'])) ?></span><span><?= e(tr($h['h'])) ?></span></li><?php endforeach; ?></ul>
    </div>
  </div>
  <div class="ft__base wrap">
    <span>© <?= date('Y') ?> Ateljé Dantel · Umeå. <?= t('ft.rights') ?></span>
    <span class="ft__pay"><?= t('ft.pay') ?>: <b>Swish</b> · <b><?= t('co.bank') ?></b> · <b><?= t('co.store') ?></b></span>
  </div>
</footer>
<script>window.AD={lang:<?= json_encode($L) ?>,t:<?= json_encode($i18n, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG) ?>,cat:<?= json_encode(asset('api/catalog.php') . '&lang=' . $L) ?>,v:<?= json_encode(AD_VERSION) ?>};</script>
<script src="assets/vendor/gsap.min.js" defer></script>
<script src="assets/vendor/ScrollTrigger.min.js" defer></script>
<script src="assets/vendor/lenis.min.js" defer></script>
<script src="<?= asset('assets/js/site.js') ?>" defer></script>
<?php foreach ($o['scripts'] ?? [] as $sc): ?><script src="<?= asset($sc) ?>" defer></script><?php endforeach; ?>
</body></html>
<?php
}

/** Product card used by grids. */
function card_html(array $c, string $extra = ''): string {
    $badge = '';
    if ($c['compare']) $badge = '<span class="tag tag--sale">-' . round((1 - $c['price'] / $c['compare']) * 100) . '%</span>';
    elseif ($c['cond'] === 'sample') $badge = '<span class="tag">' . t('ui.sample') . '</span>';
    elseif ($c['cond'] === 'defect') $badge = '<span class="tag">' . t('ui.defect') . '</span>';
    elseif (!$c['stock']) $badge = '<span class="tag tag--out">' . t('ui.soldout') . '</span>';
    $dots = '';
    foreach (array_slice($c['colors'], 0, 5, true) as $hex => $name) $dots .= '<i style="--c:' . e($hex) . '" title="' . e($name) . '"></i>';
    $price = ($c['max'] > $c['price'] ? t('ui.from') . ' ' : '') . kr($c['price']);
    $attrs = sprintf(' data-id="%s" data-cat="%s" data-price="%d" data-brand="%s" data-sizes="%s" data-colors="%s" data-sale="%d" data-stock="%d" data-new="%d" data-feat="%d"',
        e($c['id']), e($c['cat']), (int)$c['price'], e($c['brand']), e('|' . implode('|', $c['sizes']) . '|'), e('|' . implode('|', array_keys($c['colors'])) . '|'), $c['compare'] ? 1 : 0, $c['stock'] ? 1 : 0, $c['created'], $c['featured'] ? 1 : 0);
    return '<article class="card' . $extra . '"' . $attrs . '>'
        . '<a class="card__media" href="produkt.php?p=' . e($c['slug']) . '">'
        . '<img src="' . e($c['img']) . '" alt="' . e($c['title']) . '" loading="lazy" decoding="async" width="600" height="840">'
        . ($c['img2'] ? '<img class="card__alt" src="' . e($c['img2']) . '" alt="" loading="lazy" decoding="async" width="600" height="840">' : '')
        . $badge . '</a>'
        . '<button class="card__wish" data-wish="' . e($c['id']) . '" aria-label="' . t('ui.wishadd') . '">' . ic('heart') . '</button>'
        . '<button class="card__quick" data-quick="' . e($c['id']) . '">' . t('ui.quick') . '</button>'
        . '<div class="card__info"><a href="produkt.php?p=' . e($c['slug']) . '"><span class="card__brand">' . e($c['brand'] ?: tr(category($c['cat'])['name'] ?? '')) . '</span><h3>' . e($c['title']) . '</h3></a>'
        . '<div class="card__row"><span class="price">' . ($c['compare'] ? '<s>' . kr($c['compare']) . '</s> ' : '') . '<b>' . $price . '</b></span><span class="dots">' . $dots . '</span></div></div>'
        . '</article>';
}
