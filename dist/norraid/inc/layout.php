<?php
/** Page shell (head, header, footer) and shared UI components. */
declare(strict_types=1);

function icon(string $n, string $cls = 'ic'): string {
    $p = [
        'food' => '<path d="M4 11h16a8 8 0 0 1-16 0Z"/><path d="M12 3v4M8 5v2M16 5v2"/><path d="M7 19h10"/>',
        'water' => '<path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11Z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"/>',
        'health' => '<path d="M12 21s-7.5-4.6-9.3-9.2C1.4 8.5 3.6 5 7 5c2 0 3.3 1 5 3 1.7-2 3-3 5-3 3.4 0 5.6 3.5 4.3 6.8C19.5 16.4 12 21 12 21Z"/><path d="M9 12h6M12 9v6"/>',
        'shelter' => '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',
        'education' => '<path d="M2 9l10-5 10 5-10 5L2 9Z"/><path d="M6 11v5c3.5 2.7 8.5 2.7 12 0v-5"/><path d="M22 9v6"/>',
        'protection' => '<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
        'displacement' => '<path d="M4 20h16"/><path d="M6 20V9l6-5 6 5v11"/><path d="M14 13h-4M12 11l-2 2 2 2"/>',
        'globe' => '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z"/>',
        'arrow' => '<path d="M5 12h14M13 6l6 6-6 6"/>',
        'check' => '<path d="m5 12 4.5 4.5L19 7"/>',
        'info' => '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
        'lock' => '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
        'doc' => '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
        'mail' => '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
        'heart' => '<path d="M12 20s-7-4.4-8.6-8.6C2 7.8 4.4 5 7.4 5 9.3 5 10.6 6 12 7.6 13.4 6 14.7 5 16.6 5c3 0 5.4 2.8 4 6.4C19 15.6 12 20 12 20Z"/>',
        'chev' => '<path d="m6 9 6 6 6-6"/>',
        'menu' => '<path d="M4 7h16M4 12h16M4 17h16"/>',
        'x' => '<path d="M6 6l12 12M18 6 6 18"/>',
        'chart' => '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
        'pin' => '<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/>',
        'quote' => '<path d="M7 7c-2 1-3 3-3 6v4h5v-5H6.5C6.5 10 7.5 8.8 9 8.2L7 7Zm9 0c-2 1-3 3-3 6v4h5v-5h-2.5c0-2 1-3.2 2.5-3.8L16 7Z"/>',
    ];
    $flip = in_array($n, ['arrow'], true) ? ' flip-rtl' : '';
    return '<svg class="' . e($cls) . $flip . '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' . ($p[$n] ?? '') . '</svg>';
}

/** The logo mark inline (so it inherits the page background for its separators). */
function logo_mark(string $cls = 'mark'): string {
    $svg = (string)@file_get_contents(NR_ROOT . '/assets/brand/norraid-mark-color.svg');
    $svg = preg_replace('~<title>.*?</title>~', '', $svg);
    $svg = str_replace('stroke="#FAF8F2"', 'stroke="var(--logo-sep,#FAF8F2)"', $svg);
    return str_replace('<svg ', '<svg class="' . e($cls) . '" aria-hidden="true" focusable="false" ', $svg);
}

function page_head(array $o): void {
    $l = L();
    $title = $o['title'] ?? t('meta.title');
    $full = ($o['title'] ?? '') ? $title . ' | NORRAID AFRICA' : $title;
    $desc = $o['description'] ?? t('meta.description');
    $path = $o['path'] ?? '';
    $canon = nr_origin() . u($path);
    $og = $o['og'] ?? '';
    if ($og === '') $og = nr_origin() . nr_base() . 'assets/img/og.jpg';
    nr_security_headers();
    header('Content-Type: text/html; charset=utf-8');
    header('Content-Language: ' . LOCALES[$l][2]);
    header('Vary: Accept-Language, Cookie');
    ?><!doctype html>
<html lang="<?= e(LOCALES[$l][2]) ?>" dir="<?= dir_attr() ?>">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title><?= e($full) ?></title>
<meta name="description" content="<?= e($desc) ?>">
<link rel="canonical" href="<?= e($canon) ?>">
<?php foreach (LOCALES as $code => $info): ?>
<link rel="alternate" hreflang="<?= e($code === 'nb' ? 'nb' : $code) ?>" href="<?= e(nr_origin() . u($path, $code)) ?>">
<?php endforeach; ?>
<link rel="alternate" hreflang="x-default" href="<?= e(nr_origin() . u($path, 'en')) ?>">
<meta property="og:type" content="<?= e($o['og_type'] ?? 'website') ?>">
<meta property="og:site_name" content="NORRAID AFRICA">
<meta property="og:title" content="<?= e($full) ?>">
<meta property="og:description" content="<?= e($desc) ?>">
<meta property="og:url" content="<?= e($canon) ?>">
<meta property="og:image" content="<?= e($og) ?>">
<meta property="og:locale" content="<?= e(str_replace('-', '_', LOCALES[$l][2])) ?>">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#193E38">
<?php if ($sc = setting('search_console')): ?><meta name="google-site-verification" content="<?= e($sc) ?>"><?php endif; ?>
<?php if (!empty($o['noindex'])): ?><meta name="robots" content="noindex"><?php endif; ?>
<link rel="icon" href="<?= e(nr_base()) ?>assets/brand/favicon.svg" type="image/svg+xml">
<link rel="icon" href="<?= e(nr_base()) ?>assets/brand/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="<?= e(nr_base()) ?>assets/brand/apple-touch-icon.png">
<link rel="preload" href="<?= e(nr_base()) ?>assets/fonts/<?= $l === 'ar' ? 'IBMPlexSansArabic-600-arabic.woff2' : 'Manrope-400-800-latin.woff2' ?>" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="<?= e(asset('assets/fonts/fonts.css')) ?>">
<link rel="stylesheet" href="<?= e(asset('assets/css/site.css')) ?>">
<script type="application/ld+json"><?= json_encode(array_filter([
    '@context' => 'https://schema.org', '@type' => 'Organization', 'name' => 'NORRAID AFRICA', 'slogan' => 'Humanity Without Borders',
    'url' => nr_origin() . nr_base(), 'logo' => nr_origin() . nr_base() . 'assets/brand/norraid-logo-stacked-color.svg',
    'areaServed' => ['Sudan', 'Democratic Republic of the Congo', 'South Sudan'], 'address' => ['@type' => 'PostalAddress', 'addressCountry' => 'SE'],
    'email' => setting('contact_email') ?: null,
]), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?></script>
<?php if (!empty($o['jsonld'])): ?><script type="application/ld+json"><?= json_encode($o['jsonld'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?></script><?php endif; ?>
</head>
<body class="<?= e($o['body'] ?? '') ?>" data-base="<?= e(nr_base()) ?>" data-lang="<?= e($l) ?>">
<a class="skip" href="#main"><?= te('skip') ?></a>
<?php site_header($path); ?>
<main id="main" tabindex="-1">
<?php
}

function nav_link(string $path, string $label, string $cur): string {
    $active = ($path === '' ? $cur === '' : str_starts_with($cur, $path));
    return '<a href="' . e(u($path)) . '"' . ($active ? ' aria-current="page"' : '') . '>' . e($label) . '</a>';
}

function site_header(string $cur): void { ?>
<header class="site-header" data-header>
 <div class="wrap hdr">
  <a class="brand" href="<?= e(u('')) ?>" aria-label="NORRAID AFRICA – <?= te('nav.home') ?>">
   <?= logo_mark('brand-mark') ?>
   <span class="brand-word"><b>NORRAID</b><i>AFRICA</i></span>
  </a>
  <nav class="main-nav" aria-label="<?= te('nav.menu') ?>" id="main-nav">
   <?= nav_link('mission', t('nav.mission'), $cur) ?>
   <div class="dd">
    <button class="dd-btn" aria-expanded="false" aria-controls="dd-countries"><?= te('nav.countries') ?> <?= icon('chev', 'ic sm') ?></button>
    <div class="dd-menu" id="dd-countries">
     <?php foreach (COUNTRY_IDS as $c): ?><a href="<?= e(u($c)) ?>"<?= $cur === $c ? ' aria-current="page"' : '' ?>><?= e(country_name($c)) ?></a><?php endforeach; ?>
     <a href="<?= e(u('countries')) ?>"><?= te('nav.all_countries') ?></a>
    </div>
   </div>
   <?= nav_link('stories', t('nav.stories'), $cur) ?>
   <?= nav_link('impact', t('nav.impact'), $cur) ?>
   <?= nav_link('transparency', t('nav.transparency'), $cur) ?>
   <?= nav_link('about', t('nav.about'), $cur) ?>
   <a class="btn btn-gold nav-donate-m" href="<?= e(u('donate')) ?>"><?= icon('heart', 'ic sm') ?> <?= te('nav.donate') ?></a>
  </nav>
  <div class="hdr-actions">
   <div class="dd lang">
    <button class="dd-btn lang-btn" aria-expanded="false" aria-controls="dd-lang" aria-label="<?= te('nav.language') ?>: <?= e(LOCALES[L()][0]) ?>"><?= icon('globe', 'ic') ?><span><?= e(strtoupper(L())) ?></span></button>
    <div class="dd-menu dd-lang" id="dd-lang">
     <?php foreach (LOCALES as $code => $info): ?>
      <a href="<?= e(u($cur, $code)) ?>" hreflang="<?= e($code) ?>" lang="<?= e($code) ?>" data-setlang="<?= e($code) ?>"<?= $code === L() ? ' aria-current="true"' : '' ?>><?= e($info[0]) ?></a>
     <?php endforeach; ?>
    </div>
   </div>
   <a class="btn btn-gold hdr-donate" href="<?= e(u('donate')) ?>"><?= te('nav.donate') ?></a>
   <button class="menu-btn" aria-expanded="false" aria-controls="main-nav" aria-label="<?= te('nav.menu') ?>"><?= icon('menu', 'ic i-open') ?><?= icon('x', 'ic i-close') ?></button>
  </div>
 </div>
</header>
<?php }

function page_foot(): void { ?>
</main>
<footer class="site-footer">
 <div class="wrap">
  <div class="ft-grid">
   <div class="ft-brand">
    <img src="<?= e(nr_base()) ?>assets/brand/norraid-logo-horizontal-reverse.svg" alt="NORRAID AFRICA – Humanity Without Borders" width="260" height="70" loading="lazy">
    <p><?= te('footer.about') ?></p>
    <p class="ft-status"><?= icon('info', 'ic sm') ?> <?= te('footer.status') ?></p>
   </div>
   <div>
    <h2 class="ft-h"><?= te('footer.explore') ?></h2>
    <ul>
     <?php foreach (COUNTRY_IDS as $c): ?><li><a href="<?= e(u($c)) ?>"><?= e(country_name($c)) ?></a></li><?php endforeach; ?>
     <li><a href="<?= e(u('stories')) ?>"><?= te('nav.stories') ?></a></li>
     <li><a href="<?= e(u('impact')) ?>"><?= te('nav.impact') ?></a></li>
     <li><a href="<?= e(u('donate')) ?>"><?= te('nav.donate') ?></a></li>
    </ul>
   </div>
   <div>
    <h2 class="ft-h"><?= te('footer.organisation') ?></h2>
    <ul>
     <li><a href="<?= e(u('mission')) ?>"><?= te('nav.mission') ?></a></li>
     <li><a href="<?= e(u('about')) ?>"><?= te('nav.about') ?></a></li>
     <li><a href="<?= e(u('transparency')) ?>"><?= te('nav.transparency') ?></a></li>
     <li><a href="<?= e(u('sources')) ?>"><?= te('footer.sources') ?></a></li>
     <li><a href="<?= e(u('faq')) ?>"><?= te('nav.faq') ?></a></li>
     <li><a href="<?= e(u('contact')) ?>"><?= te('nav.contact') ?></a></li>
    </ul>
   </div>
   <div>
    <h2 class="ft-h"><?= te('footer.legal') ?></h2>
    <ul>
     <li><a href="<?= e(u('privacy')) ?>"><?= te('footer.privacy') ?></a></li>
     <li><a href="<?= e(u('cookies')) ?>"><?= te('footer.cookies') ?></a></li>
     <li><a href="<?= e(u('terms')) ?>"><?= te('footer.terms') ?></a></li>
     <li><a href="<?= e(u('donation-policy')) ?>"><?= te('footer.donation_policy') ?></a></li>
     <li><a href="<?= e(u('accessibility')) ?>"><?= te('footer.accessibility') ?></a></li>
    </ul>
   </div>
  </div>
  <div class="ft-bottom">
   <p>© <?= date('Y') ?> NORRAID AFRICA · <?= te('contact.based') ?> · <?= te('footer.rights') ?></p>
   <p><?= te('footer.photos') ?></p>
  </div>
 </div>
</footer>
<a class="m-donate" href="<?= e(u('donate')) ?>"><?= icon('heart', 'ic') ?> <?= te('common.donate_cta') ?></a>
<script src="<?= e(asset('assets/js/site.js')) ?>" defer></script>
</body>
</html>
<?php }

/* ---------- components ---------- */

function section_head(string $eyebrow, string $title, string $text = '', string $cls = ''): string {
    return '<div class="sec-head ' . e($cls) . ' reveal">' . ($eyebrow ? '<p class="eyebrow">' . e($eyebrow) . '</p>' : '')
        . '<h2>' . e($title) . '</h2>' . ($text ? '<p class="lead">' . e($text) . '</p>' : '') . '</div>';
}

function source_link(array $s): string {
    $src = sources()[$s['source'] ?? ''] ?? null;
    if (!$src) return '';
    return '<a href="' . e($src['url']) . '" target="_blank" rel="noopener">' . e($src['org']) . '</a>';
}

function stat_card(array $s, string $cls = ''): string {
    $cat = $s['category'] ?? 'context';
    $note = loc($s['note'] ?? '');
    return '<article class="stat-card cat-' . e($cat) . ' ' . e($cls) . '">'
        . '<p class="stat-cat">' . te('cat.' . $cat) . '</p>'
        . '<p class="stat-val" data-count="' . e((string)$s['value']) . '">' . e(stat_value($s)) . '</p>'
        . '<p class="stat-label">' . e(stat_label($s)) . '</p>'
        . ($note && L() === 'en' ? '<p class="stat-note">' . e($note) . '</p>' : '')
        . '<p class="stat-src">' . te('common.source') . ': ' . source_link($s) . ' · ' . e((string)$s['year']) . ' · ' . te('common.verified') . ' ' . e(date_l((string)$s['verified'])) . '</p>'
        . '</article>';
}

function story_card(array $s): string {
    $m = !empty($s['media']) ? media($s['media']) : null;
    $src = sources()[$s['source'] ?? ''] ?? null;
    $out = '<article class="story-card reveal' . ($m ? '' : ' no-photo') . '">';
    if ($m) $out .= '<a class="story-img" href="' . e(u('stories/' . $s['slug'])) . '" tabindex="-1" aria-hidden="true">' . img($s['media'], '', 900, false, '(max-width:700px) 100vw, 33vw') . '</a>';
    else $out .= '<div class="story-quote" aria-hidden="true">' . icon('quote', 'ic q') . '<span>' . e(country_name($s['country'])) . '</span></div>';
    $out .= '<div class="story-body"><p class="story-meta"><span class="chip">' . e(country_name($s['country'])) . '</span> <span>' . te('common.third_party') . '</span></p>'
        . '<h3><a href="' . e(u('stories/' . $s['slug'])) . '">' . e(story_text($s, 'title')) . '</a></h3>'
        . '<p>' . e(story_text($s, 'summary')) . '</p>'
        . '<p class="story-src">' . te('common.reported_by') . ' ' . e($src['org'] ?? '') . ' · ' . e(date_l((string)$s['published'])) . '</p></div></article>';
    return $out;
}

function country_card(string $id): string {
    $c = country($id);
    if (!$c) return '';
    $pin = stat_one($id, 'pin');
    return '<a class="country-card reveal" href="' . e(u($id)) . '">' . img($c['hero'], '', 900, false, '(max-width:800px) 100vw, 33vw')
        . '<span class="cc-shade"></span><span class="cc-body"><span class="cc-tag">' . te("country.$id.tag") . '</span>'
        . '<span class="cc-name">' . e(country_name($id)) . '</span>'
        . ($pin ? '<span class="cc-stat"><b>' . e(stat_value($pin)) . '</b> ' . te('cat.in_need') . ' · ' . e((string)$pin['year']) . '</span>' : '')
        . '<span class="cc-go">' . te('common.learn_more') . ' ' . icon('arrow', 'ic sm') . '</span></span></a>';
}

function newsletter_block(): string {
    ob_start(); ?>
<section class="newsletter" id="newsletter">
 <div class="wrap nl-inner reveal">
  <div>
   <p class="eyebrow"><?= icon('mail', 'ic sm') ?> NORRAID AFRICA</p>
   <h2><?= te('news.title') ?></h2>
   <p><?= te('news.text') ?></p>
  </div>
  <form class="nl-form" method="post" action="<?= e(nr_base()) ?>api/newsletter.php" data-ajax novalidate>
   <input type="hidden" name="_t" value="<?= e(form_token()) ?>">
   <input type="hidden" name="lang" value="<?= e(L()) ?>">
   <div class="hp" aria-hidden="true"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></div>
   <div class="nl-row">
    <label class="sr" for="nl-email"><?= te('news.email') ?></label>
    <input id="nl-email" type="email" name="email" required autocomplete="email" placeholder="<?= te('news.email') ?>">
    <button class="btn btn-gold" type="submit"><?= te('news.button') ?></button>
   </div>
   <label class="check"><input type="checkbox" name="consent" value="1" required> <span><?= te('news.consent') ?> <a href="<?= e(u('privacy')) ?>"><?= te('footer.privacy') ?></a></span></label>
   <p class="form-msg" role="status" aria-live="polite"></p>
  </form>
 </div>
</section>
<?php return (string)ob_get_clean();
}

function donate_band(string $title, string $text, string $fund = ''): string {
    return '<section class="donate-band"><div class="wrap db-inner reveal"><div>' . logo_mark('db-mark') . '<h2>' . e($title) . '</h2><p>' . e($text) . '</p></div>'
        . '<a class="btn btn-gold btn-lg" href="' . e(u('donate') . ($fund ? '?fund=' . $fund : '')) . '">' . icon('heart', 'ic') . ' ' . te('common.donate_cta') . '</a></div></section>';
}

/** Inline SVG map from data/maps.json. */
function map_svg(string $key, array $opts = []): string {
    static $maps = null;
    if ($maps === null) $maps = json_decode((string)file_get_contents(NR_ROOT . '/data/maps.json'), true) ?: [];
    $m = $maps[$key] ?? null;
    if (!$m) return '';
    $label = $opts['label'] ?? '';
    $out = '<svg class="map map-' . e($key) . '" viewBox="0 0 ' . (int)$m['w'] . ' ' . (int)$m['h'] . '" role="img" aria-label="' . e($label) . '">';
    if ($key === 'africa') {
        $focus = ['SDN' => 'sudan', 'COD' => 'drc', 'SSD' => 'south-sudan'];
        foreach ($m['countries'] as $iso => $d) {
            if (isset($focus[$iso])) {
                $out .= '<a href="' . e(u($focus[$iso])) . '" class="map-focus" data-c="' . e($focus[$iso]) . '"><title>' . e(country_name($focus[$iso])) . '</title><path d="' . e($d) . '"/></a>';
            } else {
                $out .= '<path class="map-land" d="' . e($d) . '"/>';
            }
        }
    } else {
        foreach ($m['regions'] as $r) {
            $out .= '<path class="map-reg' . (!empty($r['hl']) ? ' hl' : '') . '" d="' . e($r['d']) . '"><title>' . e($r['name']) . '</title></path>';
        }
        foreach ($m['regions'] as $r) {
            if (!empty($r['hl'])) $out .= '<circle class="map-dot" cx="' . e((string)$r['c'][0]) . '" cy="' . e((string)$r['c'][1]) . '" r="5"/>';
        }
    }
    return $out . '</svg>';
}
