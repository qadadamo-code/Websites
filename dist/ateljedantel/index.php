<?php
require __DIR__ . '/inc/layout.php';
$s = settings(); $c = content();
$cards = array_map('product_card', products());
$byId = []; foreach ($cards as $x) $byId[$x['id']] = $x;
$featured = array_values(array_filter($cards, fn($x) => $x['featured']));
if (count($featured) < 8) { $more = array_filter($cards, fn($x) => !$x['featured'] && in_array($x['cat'], ['brud', 'fest'], true) && $x['stock']); $featured = array_merge($featured, array_slice(array_values($more), 0, 10 - count($featured))); }

/* fitting-room mirror: one evening dress per colour, using the picture of that colour */
$mirror = []; $seen = [];
foreach (products() as $p) {
    if ($p['cat'] !== 'fest') continue;
    foreach ($p['variants'] as $v) {
        $hex = $v['hex'] ?? '';
        if (!$hex || isset($seen[$hex]) || empty($v['images'][0]) || !variant_in_stock($v)) continue;
        $seen[$hex] = 1;
        $mirror[] = ['img' => $v['images'][0], 'hex' => $hex, 'name' => lang() === 'en' ? ($v['colorEn'] ?: $v['color']) : $v['color'], 'title' => tr($p['title']), 'slug' => $p['slug'], 'price' => variant_price($v)[0]];
        break;
    }
}
$mirror = array_slice($mirror, 0, 7);

$catImg = ['brud' => 'assets/p/2026_01_Elmira-F.webp', 'fest' => 'assets/p/2026_02_1-2.webp', 'har' => '', 'skor' => '', 'clutch' => ''];
foreach (categories() as $cat) if (empty($catImg[$cat['id']])) foreach ($cards as $x) if ($x['cat'] === $cat['id']) { $catImg[$cat['id']] = $x['img']; break; }
$count = count($cards);

/* open now? */
$dow = (int)date('N'); $hm = date('H:i');
$win = $s['booking']['days'][(string)$dow] ?? null;
$openNow = $dow <= 5 && $win && $hm >= $win[0] && $hm < $win[1];

site_head('', ['page' => 'home', 'intro' => true, 'overlay' => false, 'body' => 'home', 'schema' => [
    '@context' => 'https://schema.org', '@type' => 'ClothingStore', 'name' => 'Ateljé Dantel', 'image' => 'assets/img/store.webp', 'telephone' => $s['phoneIntl'], 'email' => $s['email'],
    'address' => ['@type' => 'PostalAddress', 'streetAddress' => 'Kungsgatan 52–54, MVG-gallerian', 'postalCode' => '903 26', 'addressLocality' => 'Umeå', 'addressCountry' => 'SE'],
    'openingHoursSpecification' => [['@type' => 'OpeningHoursSpecification', 'dayOfWeek' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], 'opens' => '10:00', 'closes' => '17:00']],
    'foundingDate' => '2012', 'founder' => ['@type' => 'Person', 'name' => 'Mofida Alashi']]]);
?>
<section class="hero" id="top">
  <div class="lace lace--hero" aria-hidden="true"></div>
  <div class="hero__copy">
    <p class="eyebrow" data-rise><?= e(tr($c['hero']['kicker'])) ?></p>
    <h1 class="hero__title" data-lines><?= e(tr($c['hero']['title'])) ?></h1>
    <p class="hero__text" data-rise><?= e(tr($c['hero']['text'])) ?></p>
    <div class="hero__cta" data-rise>
      <a class="btn" href="butik.php"><?= t('ui.shopnow') ?> <?= ic('arrow') ?></a>
      <a class="btn btn--line" href="boka.php"><?= ic('cal') ?> <?= t('nav.book') ?></a>
    </div>
    <ul class="hero__facts" data-rise>
      <li><b data-count-to="40">40</b><sup>+</sup><span><?= t('home.since') ?></span></li>
      <li><b>2012</b><span><?= t('home.est') ?></span></li>
      <li><b data-count-to="<?= $count ?>"><?= $count ?></b><span><?= t('home.pieces') ?></span></li>
    </ul>
  </div>
  <div class="hero__stage">
    <figure class="arch arch--hero" data-arch>
      <div class="arch__slides" data-slides>
        <img class="arch__slide on" src="assets/p/2026_02_1778585624081.webp" alt="" fetchpriority="high">
        <img class="arch__slide" src="assets/p/2026_01_Elmira-F.webp" alt="" decoding="async">
        <img class="arch__slide" src="assets/p/2026_02_1-2.webp" alt="" decoding="async">
        <img class="arch__slide" src="assets/p/2026_01_Jenny-184-F.webp" alt="" decoding="async">
        <img class="arch__slide" src="assets/p/2026_02_1036-Burgundi.webp" alt="" decoding="async">
        <img class="arch__slide" src="assets/p/2026_01_victoria-vincent-Elsa-F.webp" alt="" decoding="async">
      </div>
      <span class="arch__shine" aria-hidden="true"></span>
    </figure>
    <figure class="arch arch--mini" data-float><img src="assets/img/mofida-sewing.webp" alt="Mofida Alashi vid symaskinen" loading="eager"></figure>
    <a class="hero__stamp" href="boka.php" aria-label="<?= t('nav.book') ?>">
      <svg viewBox="0 0 200 200" aria-hidden="true"><defs><path id="circ" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0"/></defs><text><textPath href="#circ"><?= lang() === 'en' ? 'BOOK A FITTING ✦ BOOK A FITTING ✦ ' : 'BOKA PROVNING ✦ BOKA PROVNING ✦ ' ?></textPath></text></svg>
      <i><?= ic('needle') ?></i>
    </a>
  </div>
  <a class="hero__scroll" href="#kollektioner"><span><?= t('ui.scroll') ?></span><i></i></a>
</section>

<div class="ribbon" aria-hidden="true"><div class="ribbon__track" data-marquee>
  <?php for ($i = 0; $i < 3; $i++) foreach (categories() as $cat): ?><span><?= e(tr($cat['name'])) ?></span><img src="assets/brand/mark.svg" alt=""><?php endforeach; ?>
</div></div>

<section class="sec cats" id="kollektioner">
  <header class="sec__hd wrap"><p class="eyebrow"><?= t('home.cats') ?></p><h2 class="h2" data-lines><?= t('home.catsT') ?></h2><a class="link" href="butik.php"><?= t('ui.seeall') ?> <?= ic('arrow') ?></a></header>
  <div class="cats__grid wrap" role="list">
    <?php foreach (categories() as $i => $cat): $n = count(array_filter($cards, fn($x) => $x['cat'] === $cat['id'])); ?>
    <a class="cat cat--<?= e($cat['id']) ?>" role="listitem" href="butik.php?kat=<?= e($cat['slug']) ?>" data-rise>
      <img class="cat__img" src="<?= e($catImg[$cat['id']]) ?>" alt="" loading="lazy">
      <span class="cat__ic"><img src="<?= e(cat_icon($cat)) ?>" alt="" loading="lazy"></span>
      <span class="cat__txt"><small>0<?= $i + 1 ?> · <?= $n ?> <?= t('ui.results') ?></small><b><?= e(tr($cat['name'])) ?></b><em><?= e(tr($cat['tag'])) ?></em></span>
      <span class="cat__go"><?= ic('arrow') ?></span>
    </a>
    <?php endforeach; ?>
  </div>
</section>

<?php if (count($mirror) >= 3): ?>
<section class="mirror" id="provrummet" style="--n:<?= count($mirror) ?>">
  <div class="mirror__pin">
    <div class="mirror__copy">
      <p class="eyebrow"><?= t('home.mirror') ?></p>
      <h2 class="h2"><?= lang() === 'en' ? 'Find your colour' : 'Hitta din färg' ?></h2>
      <p class="muted"><?= lang() === 'en' ? 'Scroll and let the mirror show you our evening gowns, one colour at a time – just like in our fitting room.' : 'Scrolla och låt spegeln visa våra festklänningar, en färg i taget – precis som i vårt provrum.' ?></p>
      <ol class="mirror__list">
        <?php foreach ($mirror as $i => $m): ?><li class="<?= $i === 0 ? 'on' : '' ?>" style="--c:<?= e($m['hex']) ?>"><i></i><span><?= e($m['name']) ?></span></li><?php endforeach; ?>
      </ol>
    </div>
    <div class="mirror__glass">
      <div class="mirror__frame">
        <?php foreach ($mirror as $i => $m): ?>
        <a class="mirror__slide" href="produkt.php?p=<?= e($m['slug']) ?>" style="--i:<?= $i ?>;--c:<?= e($m['hex']) ?>"><img src="<?= e($m['img']) ?>" alt="<?= e($m['title'] . ' – ' . $m['name']) ?>" loading="lazy"></a>
        <?php endforeach; ?>
        <span class="mirror__sheen" aria-hidden="true"></span>
      </div>
      <div class="mirror__base" aria-hidden="true"></div>
    </div>
    <div class="mirror__meta">
      <?php foreach ($mirror as $i => $m): ?>
      <div class="mirror__info<?= $i === 0 ? ' on' : '' ?>" style="--c:<?= e($m['hex']) ?>"><span class="mirror__name"><?= e($m['name']) ?></span><b><?= e($m['title']) ?></b><span class="price"><?= kr($m['price']) ?></span><a class="link" href="produkt.php?p=<?= e($m['slug']) ?>"><?= t('ui.view') ?> <?= ic('arrow') ?></a></div>
      <?php endforeach; ?>
      <div class="mirror__count"><b class="mirror__now">01</b> / <?= sprintf('%02d', count($mirror)) ?></div>
    </div>
  </div>
</section>
<?php endif; ?>

<section class="sec feat">
  <header class="sec__hd wrap"><p class="eyebrow"><?= t('home.feat') ?></p><h2 class="h2" data-lines><?= t('home.featT') ?></h2>
    <div class="feat__nav"><button class="round" data-slide="-1" aria-label="<?= t('ui.prev') ?>"><?= ic('arrow') ?></button><button class="round" data-slide="1" aria-label="<?= t('ui.next') ?>"><?= ic('arrow') ?></button></div></header>
  <div class="rail" data-rail><?php foreach ($featured as $f) echo card_html($f, ' card--rail'); ?></div>
  <div class="rail__bar wrap"><i data-rail-bar></i></div>
</section>

<section class="story" id="ateljen">
  <div class="story__media">
    <div class="reveal-img" data-reveal-img>
      <img class="reveal-img__base" src="assets/img/mofida-sewing.webp" alt="Mofida Alashi vid symaskinen" loading="lazy">
      <img class="reveal-img__top" src="assets/img/mofida-sewing.webp" alt="" loading="lazy" aria-hidden="true">
    </div>
    <span class="story__tag"><?= ic('needle') ?> Mofida Alashi</span>
  </div>
  <div class="story__copy">
    <p class="eyebrow"><?= t('home.services') ?></p>
    <h2 class="h2" data-lines><?= e(tr($c['story']['title'])) ?></h2>
    <p class="lead" data-rise><?= e(tr($c['story']['text'])) ?></p>
    <blockquote data-rise>“<?= e(tr($c['story']['quote'])) ?>”<cite>Mofida Alashi</cite></blockquote>
    <a class="link" href="om-oss.php" data-rise><?= t('ui.readmore') ?> <?= ic('arrow') ?></a>
  </div>
</section>

<section class="sec journey">
  <header class="sec__hd wrap"><p class="eyebrow">01 — 04</p><h2 class="h2" data-lines><?= t('home.journey') ?></h2></header>
  <ol class="journey__steps wrap" data-journey>
    <svg class="journey__thread" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0 60 C150 10 250 110 400 60 S650 10 800 60 S1050 110 1200 60"/></svg>
    <?php for ($i = 1; $i <= 4; $i++): ?>
    <li data-rise><span class="journey__n">0<?= $i ?></span><h3><?= t("j.$i") ?></h3><p><?= t("j.{$i}d") ?></p></li>
    <?php endfor; ?>
  </ol>
  <div class="wrap center"><a class="btn" href="boka.php"><?= ic('cal') ?> <?= t('nav.book') ?></a></div>
</section>

<section class="sec services">
  <header class="sec__hd wrap"><p class="eyebrow"><?= t('home.services') ?></p><h2 class="h2" data-lines><?= t('home.servicesT') ?></h2></header>
  <div class="svc wrap" data-svc>
    <ul class="svc__list">
      <?php foreach ($c['services'] as $i => $sv): ?>
      <li class="<?= $i === 0 ? 'on' : '' ?>" data-img="<?= e($sv['img']) ?>">
        <a href="<?= $sv['id'] === 'skradd' ? 'skradderi.php' : ($sv['id'] === 'herr' ? 'herr.php' : 'boka.php?typ=' . ($sv['id'] === 'matt' ? 'matt' : 'brud')) ?>">
          <span class="svc__n">0<?= $i + 1 ?></span><span class="svc__t"><?= e(tr($sv['t'])) ?></span><span class="svc__d"><?= e(tr($sv['d'])) ?></span><span class="svc__go"><?= ic('arrow') ?></span>
        </a>
      </li>
      <?php endforeach; ?>
    </ul>
    <figure class="svc__view arch"><?php foreach ($c['services'] as $i => $sv): ?><img src="<?= e($sv['img']) ?>" alt="" class="<?= $i === 0 ? 'on' : '' ?>" loading="lazy"><?php endforeach; ?></figure>
  </div>
</section>

<section class="banner" data-parallax>
  <img src="assets/img/prom.webp" alt="" loading="lazy" data-speed="0.18">
  <div class="banner__copy wrap">
    <p class="eyebrow"><?= lang() === 'en' ? 'Prom ' . date('Y') : 'Studentbal ' . date('Y') ?></p>
    <h2 class="h1" data-lines><?= lang() === 'en' ? 'The night you will talk about for years' : 'Kvällen ni kommer prata om i åratal' ?></h2>
    <a class="btn btn--light" href="butik.php?kat=festklanningar"><?= t('nav.evening') ?> <?= ic('arrow') ?></a>
  </div>
</section>

<section class="sec faq wrap-narrow">
  <header class="sec__hd sec__hd--center"><p class="eyebrow">FAQ</p><h2 class="h2" data-lines><?= t('home.faq') ?></h2></header>
  <div class="acc">
    <?php foreach ($c['faq'] as $i => $f): ?>
    <details class="acc__item"<?= $i === 0 ? ' open' : '' ?>><summary><span><?= e(tr($f['q'])) ?></span><i><?= ic('plus') ?></i></summary><div class="acc__body"><p><?= e(tr($f['a'])) ?></p></div></details>
    <?php endforeach; ?>
  </div>
</section>

<section class="visit">
  <div class="visit__img"><img src="assets/img/store.webp" alt="Ateljé Dantel butik i MVG-gallerian, Umeå" loading="lazy" data-speed="0.1"></div>
  <div class="visit__card">
    <p class="eyebrow"><?= t('home.visit') ?></p>
    <h2 class="h2">MVG-gallerian, Umeå</h2>
    <p class="status <?= $openNow ? 'is-open' : '' ?>"><i></i><?= $openNow ? t('ui.openNow') : t('ui.closedNow') ?></p>
    <ul class="visit__list">
      <li><?= ic('pin') ?><a href="<?= e($s['mapUrl']) ?>" target="_blank" rel="noopener"><?= e($s['address']) ?>, <?= e($s['city']) ?></a></li>
      <li><?= ic('phone') ?><a href="tel:<?= e($s['phoneIntl']) ?>"><?= e($s['phone']) ?></a></li>
      <li><?= ic('mail') ?><a href="mailto:<?= e($s['email']) ?>"><?= e($s['email']) ?></a></li>
    </ul>
    <ul class="hours"><?php foreach ($s['hours'] as $h): ?><li><span><?= e(tr($h['d'])) ?></span><span><?= e(tr($h['h'])) ?></span></li><?php endforeach; ?></ul>
    <div class="row-btns"><a class="btn" href="boka.php"><?= ic('cal') ?> <?= t('nav.book') ?></a><a class="btn btn--line" href="<?= e($s['mapUrl']) ?>" target="_blank" rel="noopener"><?= ic('pin') ?> <?= t('ui.map') ?></a></div>
  </div>
</section>

<?php site_foot(); ?>
