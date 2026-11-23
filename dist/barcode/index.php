<?php
require __DIR__ . '/inc/core.php';
$D = public_data();
$C = $D['config'];
$itemCount = array_sum(array_map(fn($c) => count($c['items']), $D['menu']));
$ribbon = $C['ribbon'] ?: ['لكلّ مزاجٍ كود'];
$O = $D['offers']; $hasOffers = $O['items'] || $O['coupons'];
foreach (array_reverse($O['coupons']) as $cp) array_unshift($ribbon, 'كود ' . $cp['code'] . ' · خصم ' . $cp['value'] . ($cp['type'] === 'fixed' ? ' ج.م' : '%') . ' على فاتورتك');
header('Cache-Control: no-cache');
$https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
$siteUrl = ($https ? 'https' : 'http') . '://' . preg_replace('/[^A-Za-z0-9.:-]/', '', $_SERVER['HTTP_HOST'] ?? 'localhost') . rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/')), '/') . '/';
$ld = ['@context' => 'https://schema.org', '@type' => 'CafeOrCoffeeShop', 'name' => $C['brand'], 'url' => $siteUrl, 'image' => $siteUrl . 'assets/img/latte.jpg',
    'logo' => $siteUrl . 'assets/brand/favicon.png', 'servesCuisine' => ['قهوة', 'مشروبات', 'عصائر', 'شيشة'], 'priceRange' => '$$', 'acceptsReservations' => (bool)$C['reservations'],
    'hasMenu' => ['@type' => 'Menu', 'url' => $siteUrl . '#menu', 'hasMenuSection' => array_map(fn($c) => ['@type' => 'MenuSection', 'name' => $c['title'],
        'hasMenuItem' => array_map(fn($it) => ['@type' => 'MenuItem', 'name' => $it['name'], 'offers' => ['@type' => 'Offer', 'price' => $it['price'], 'priceCurrency' => 'EGP']], array_slice($c['items'], 0, 30))], $D['menu'])]];
if ($C['whatsappDisplay']) $ld['telephone'] = $C['whatsappDisplay'];
if ($C['address']) $ld['address'] = ['@type' => 'PostalAddress', 'streetAddress' => $C['address'], 'addressCountry' => 'EG'];
if ($C['mapUrl']) $ld['hasMap'] = $C['mapUrl'];
$same = array_values(array_filter((array)$C['social'])); if ($same) $ld['sameAs'] = $same;
?><!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>باركود كافيه | لكلّ مزاجٍ كود</title>
<meta name="description" content="باركود كافيه: قهوة مختصة، آيس كوفي وماتشا، ميلك شيك وفرابيه، عصائر وسموذي وموهيتو. اطلب أونلاين أو احجز طاولتك عبر واتساب.">
<meta name="theme-color" content="#140A04">
<meta property="og:title" content="باركود كافيه | لكلّ مزاجٍ كود">
<meta property="og:description" content="قهوة، ميلك شيك، عصائر وموهيتو. امسح مزاجك واطلب عبر واتساب.">
<meta property="og:image" content="<?= e($siteUrl) ?>assets/img/latte.jpg">
<meta property="og:url" content="<?= e($siteUrl) ?>">
<meta property="og:type" content="restaurant.restaurant">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="<?= e($siteUrl) ?>">
<script type="application/ld+json"><?= json_encode($ld, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG) ?></script>
<meta property="og:locale" content="ar_EG">
<link rel="icon" type="image/png" href="assets/brand/favicon.png">
<link rel="apple-touch-icon" href="assets/brand/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&family=Didact+Gothic&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css?v=<?= BC_VERSION ?>">
</head>
<body class="is-loading">

<!-- ============ LOADER ============ -->
<div class="loader" id="loader" aria-hidden="true">
  <div class="loader__inner">
    <div class="loader__bars" id="loaderBars"></div>
    <div class="loader__laser"></div>
    <img class="loader__logo" src="assets/brand/word-cream.png" alt="">
    <div class="loader__meta">
      <span>جارٍ مسح المزاج…</span>
      <span class="loader__pct latin"><b id="loaderPct">0</b>%</span>
    </div>
  </div>
</div>

<div class="grain" aria-hidden="true"></div>
<div class="cursor" id="cursor" aria-hidden="true"><span class="cursor__label" id="cursorLabel"></span></div>

<!-- ============ RIBBON (messages from the dashboard) ============ -->
<div class="ribbon" id="ribbon">
  <div class="ribbon__track">
    <?php for ($k = 0; $k < 3; $k++): foreach ($ribbon as $msg): ?><span><?= e($msg) ?></span><i></i><?php endforeach; endfor; ?>
  </div>
</div>

<!-- ============ NAV ============ -->
<header class="nav" id="nav">
  <a href="#top" class="nav__logo" aria-label="باركود كافيه — الرئيسية">
    <img src="assets/brand/word-cream.png" alt="Barcode Cafe">
  </a>
  <nav class="nav__links" aria-label="القائمة الرئيسية">
    <a href="#menu" data-magnetic>المنيو</a>
    <a href="#mood" data-magnetic>ماسح المزاج</a>
    <a href="#story" data-magnetic>الحكاية</a>
    <?php if ($hasOffers): ?><a href="#offers" data-magnetic>العروض</a><?php endif; ?>
    <?php if ($D['events']): ?><a href="#events" data-magnetic>الفعاليات</a><?php endif; ?>
    <?php if ($C['reservations']): ?><a href="#reserve" data-magnetic>احجز طاولة</a><?php endif; ?>
    <a href="#contact" data-magnetic>تواصل</a>
  </nav>
  <div class="nav__actions">
    <button class="cart-btn" id="cartBtn" aria-label="سلة الطلب" data-magnetic>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 7h6M9 11h6M9 15h3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
      <span class="cart-btn__count latin" id="cartCount">0</span>
    </button>
    <a class="btn btn--copper nav__wa" data-wa="nav" href="#" target="_blank" rel="noopener" data-magnetic>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>
      <span>اطلب الآن</span>
    </a>
    <button class="burger" id="burger" aria-label="فتح القائمة"><span></span><span></span></button>
  </div>
</header>

<div class="mnav" id="mnav">
  <a href="#menu">المنيو</a><a href="#mood">ماسح المزاج</a><a href="#story">الحكاية</a><?php if ($hasOffers): ?><a href="#offers">العروض</a><?php endif; ?><?php if ($D['events']): ?><a href="#events">الفعاليات</a><?php endif; ?><?php if ($C['reservations']): ?><a href="#reserve">احجز طاولة</a><?php endif; ?><a href="#contact">تواصل</a>
</div>

<main id="top">

<!-- ============ HERO (scroll-scrubbed latte) ============ -->
<section class="hero" id="hero">
  <div class="hero__pin">
    <canvas class="seq-canvas" data-seq="latte" data-frames="48"></canvas>
    <div class="hero__shade"></div>
    <div class="scanline" aria-hidden="true"></div>

    <div class="hero__content">
      <div class="hero__roundel" id="heroRoundel">
        <img src="assets/brand/roundel-cream.png" alt="شعار باركود كافيه">
      </div>
      <h1 class="hero__title" id="heroTitle">
        <span class="line"><span>لكلّ مزاجٍ</span></span>
        <span class="line"><span class="copper">كود.</span></span>
      </h1>
      <p class="hero__sub" id="heroSub">قهوةٌ مختصة، وميلك شيك كثيفٌ بلا اعتذار، وعصائرُ وموهيتو تُنعش أي يوم.<br>امسح مزاجك… واترك الباقي علينا.</p>
      <div class="hero__ctas" id="heroCtas">
        <a href="#menu" class="btn btn--cream" data-magnetic>تصفّح المنيو</a>
        <?php if ($C['reservations']): ?><a href="#reserve" class="btn btn--ghost" data-magnetic>احجز طاولتك</a><?php endif; ?>
      </div>
    </div>

    <div class="hero__hud latin" aria-hidden="true">
      <span>SCAN</span><span class="hud-frame" data-hud="latte">001/048</span><span>BARCODE·CAFE</span>
    </div>
    <div class="hero__hint">
      <span>مرّر لتُحضَّر قهوتك</span>
      <div class="hint-bars"><i></i><i></i><i></i><i></i></div>
    </div>
  </div>
</section>

<!-- ============ MARQUEE ============ -->
<section class="marquee" aria-hidden="true">
  <div class="marquee__row" data-dir="1">
    <span>إسبريسو</span><b class="bc-sep"></b><span>ميلك شيك لوتس</span><b class="bc-sep"></b><span>سبانيش لاتيه</span><b class="bc-sep"></b><span>موهيتو باركود</span><b class="bc-sep"></b><span>فرابيه كراميل</span><b class="bc-sep"></b><span>آيس ماتشا</span><b class="bc-sep"></b>
  </div>
  <div class="marquee__row marquee__row--outline latin" data-dir="-1">
    <span>SCAN</span><b class="bc-sep"></b><span>SIP</span><b class="bc-sep"></b><span>SHAKE</span><b class="bc-sep"></b><span>CHILL</span><b class="bc-sep"></b><span>REPEAT</span><b class="bc-sep"></b><span>SCAN</span><b class="bc-sep"></b><span>SIP</span><b class="bc-sep"></b>
  </div>
</section>

<?php if ($hasOffers): ?>
<!-- ============ OFFERS (auto: shows only while a discount is live) ============ -->
<section class="offers" id="offers">
  <div class="wrap">
    <div class="offers__head">
      <div>
        <span class="eyebrow latin">LIVE OFFERS · <?= count($O['items']) + count($O['coupons']) ?></span>
        <h2 class="offers__title">عروض <span class="copper">باركود</span></h2>
      </div>
      <p>خصومات شغّالة دلوقتي. السعر الجديد بيتحسب في الفاتورة تلقائيًا، والأكواد تكتبها قبل ما تبعت الطلب.</p>
    </div>
    <?php if ($O['coupons']): ?>
    <div class="coupons">
      <?php foreach ($O['coupons'] as $cp): ?>
      <div class="coupon">
        <div class="coupon__val"><b class="latin"><?= e($cp['value']) ?><small><?= $cp['type'] === 'fixed' ? 'EGP' : '%' ?></small></b><span>خصم على فاتورتك</span></div>
        <div class="coupon__body">
          <button class="coupon__code latin" type="button" data-coupon="<?= e($cp['code']) ?>" aria-label="انسخ الكود <?= e($cp['code']) ?>"><?= e($cp['code']) ?><i>انسخ</i></button>
          <small><?= $cp['min'] ? 'لطلبات من <span class="latin">' . number_format($cp['min']) . '</span> ج.م' : 'على أي طلب' ?><?= $cp['to'] ? ' · لحد <span class="latin">' . e(date('d/m', strtotime($cp['to']))) . '</span>' : '' ?></small>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>
    <?php if ($O['items']): ?><div class="offers__rail" id="offersRail"></div><?php endif; ?>
  </div>
</section>
<?php endif; ?>

<!-- ============ INTRO / MANIFESTO ============ -->
<section class="manifesto" id="story">
  <div class="wrap">
    <span class="eyebrow latin">— THE CODE · 00</span>
    <p class="manifesto__text" data-split>
      في عالمٍ صار فيه لكل شيءٍ رقمٌ وكود، قرّرنا أن نمنح المزاجَ كودَه الخاص. هنا لا نبيعك قهوةً فحسب؛ نقرأ يومك، ثم نصنع له ما يناسبه: فنجانًا يوقظك، أو شيكًا كثيفًا يُصالحك، أو موهيتو يقول لك «لا بأس».
    </p>
    <div class="stats">
      <div class="stat"><b class="latin" data-count="25">0</b><span>ثانية استخلاصٍ لكل شوت إسبريسو</span></div>
      <div class="stat"><b class="latin" data-count="16">0</b><span>نكهة ميلك شيك… اختر بحكمة</span></div>
      <div class="stat"><b class="latin" data-count="<?= (int)$itemCount ?>">0</b><span>صنفًا في المنيو… حتى الآن</span></div>
      <div class="stat"><b class="latin">∞</b><span>عدد المرات التي ستعود فيها</span></div>
    </div>
  </div>
</section>

<!-- ============ MENU (chapters generated from menu.js) ============ -->
<section class="menu" id="menu">
  <div class="menu__head wrap">
    <span class="eyebrow latin">— THE MENU</span>
    <h2 class="h2">المنيو<span class="copper">.</span></h2>
    <p class="lead">مرّر ببطء… كل قسمٍ يُحضَّر أمامك. أضف ما يعجبك إلى الفاتورة، ثم أرسلها لنا على واتساب بضغطة واحدة.</p>
  </div>
  <nav class="menu__tabs" id="menuTabs" aria-label="أقسام المنيو"></nav>
  <div id="chapters"></div>
</section>

<!-- ============ MOOD SCANNER ============ -->
<section class="mood" id="mood">
  <div class="wrap mood__grid">
    <div class="mood__intro">
      <span class="eyebrow latin">— MOOD SCANNER · BETA</span>
      <h2 class="h2">ماسح <span class="copper">المزاج</span></h2>
      <p class="lead">لا تعرف ماذا تطلب؟ طبيعي جدًا. اختر حالتك الآن، ودع الماسح يقرأ مزاجك ويطبع لك الوصفة المناسبة.</p>
      <div class="chips" id="moodChips"></div>
    </div>
    <div class="scanner" id="scanner">
      <div class="scanner__screen">
        <div class="scanner__bars" id="scannerBars"></div>
        <div class="scanner__laser"></div>
        <div class="scanner__idle" id="scannerIdle">اختر مزاجك<br><small class="latin">WAITING FOR INPUT_</small></div>
      </div>
      <div class="ticket" id="moodTicket" hidden>
        <div class="ticket__head"><span class="latin" id="moodCode">—</span><span>وصفة المزاج</span></div>
        <p class="ticket__note" id="moodNote"></p>
        <ul class="ticket__list" id="moodList"></ul>
        <div class="ticket__total"><span>المجموع</span><b class="latin" id="moodTotal">0</b></div>
        <button class="btn btn--copper btn--block" id="moodAdd">أضف الوصفة إلى الفاتورة</button>
      </div>
    </div>
  </div>
</section>

<!-- ============ RESERVE (boarding pass) ============ -->
<?php if ($C['reservations']): ?>
<section class="reserve" id="reserve">
  <div class="wrap">
    <span class="eyebrow latin">— RESERVATION</span>
    <h2 class="h2">احجز <span class="copper">طاولتك</span></h2>
    <p class="lead">تذكرة صعودٍ إلى المزاج. املأ البيانات، وسنؤكد حجزك على واتساب خلال دقائق.</p>

    <form class="pass" id="reserveForm" novalidate>
      <div class="pass__main">
        <div class="pass__top">
          <img src="assets/brand/word-dark.png" alt="" class="pass__logo">
          <span class="latin pass__type">BOARDING PASS · TABLE</span>
        </div>
        <div class="fields">
          <label class="field"><span>الاسم</span><input name="name" required autocomplete="name" placeholder="اسمك الكريم"></label>
          <label class="field"><span>رقم الموبايل</span><input name="phone" required inputmode="tel" autocomplete="tel" placeholder="01xxxxxxxxx" class="latin"></label>
          <label class="field"><span>التاريخ</span><input name="date" type="date" required class="latin"></label>
          <label class="field"><span>الوقت</span><input name="time" type="time" required class="latin" value="20:00"></label>
          <div class="field field--guests"><span>عدد الأشخاص</span>
            <div class="stepper"><button type="button" data-step="-1" aria-label="أقل">−</button><output class="latin" id="guests">2</output><button type="button" data-step="1" aria-label="أكثر">+</button></div>
          </div>
          <label class="field"><span>المناسبة</span>
            <select name="occasion">
              <option>جلسة عادية… وهذا يكفي</option>
              <option>عيد ميلاد</option>
              <option>اجتماع عمل</option>
              <option>مفاجأة لشخص مميز</option>
              <option>سهرة مع الشلة</option>
              <option>مناسبة خاصة</option>
            </select>
          </label>
          <label class="field field--full"><span>ملاحظات</span><input name="notes" placeholder="طاولة بجوار النافذة؟ كرسي أطفال؟ اكتب ما تريد"></label>
        </div>
        <div class="pass__actions">
          <button type="submit" class="btn btn--dark" data-magnetic>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z"/></svg>
            أكّد الحجز عبر واتساب</button>
          <button type="button" class="btn btn--line" id="reserveMail">أو أرسله بالإيميل</button>
        </div>
      </div>
      <div class="pass__stub">
        <span class="latin pass__label">PASSENGER</span>
        <b class="pass__name" id="passName">ضيفنا العزيز</b>
        <div class="pass__row latin"><span>DATE<br><b id="passDate">--/--</b></span><span>TIME<br><b id="passTime">20:00</b></span><span>PAX<br><b id="passPax">2</b></span></div>
        <div class="pass__barcode" id="passBarcode"></div>
        <span class="latin pass__code" id="passCode">BC-0000-00</span>
      </div>
    </form>
  </div>
</section>
<?php endif; ?>

<?php if ($D['events']): ?>
<!-- ============ EVENTS (from the dashboard) ============ -->
<section class="events" id="events">
  <div class="wrap">
    <span class="eyebrow latin">— EVENTS · INVITATIONS</span>
    <h2 class="h2">فعاليات <span class="copper">ودعوات</span></h2>
    <p class="lead">ليالٍ خاصة، وتجارب جديدة، ودعوات لا تتكرر. سجّل اسمك واحجز مكانك قبل أن يكتمل العدد.</p>
    <div class="ev-grid">
      <?php foreach ($D['events'] as $ev): $ts = strtotime($ev['date']); ?>
      <a class="ev-card" href="event.php?e=<?= e(rawurlencode($ev['slug'])) ?>">
        <div class="ev-card__media"><?php if ($ev['cover']): ?><img src="<?= e($ev['cover']) ?>" alt="" loading="lazy"><?php else: ?><img src="assets/img/latte.jpg" alt="" loading="lazy"><?php endif; ?>
          <div class="ev-card__date latin"><b><?= date('d', $ts) ?></b><span><?= strtoupper(date('M', $ts)) ?></span></div></div>
        <div class="ev-card__body">
          <h3><?= e($ev['title']) ?></h3>
          <?php if ($ev['subtitle']): ?><p><?= e($ev['subtitle']) ?></p><?php endif; ?>
          <div class="ev-card__meta"><?php if ($ev['time']): ?><span class="latin"><?= e($ev['time']) ?></span><?php endif; ?><?php if ($ev['place']): ?><span><?= e($ev['place']) ?></span><?php endif; ?><?php if ($ev['spots'] !== null): ?><span><?= $ev['spots'] ? 'متبقي ' . (int)$ev['spots'] . ' مكان' : 'اكتمل العدد' ?></span><?php endif; ?></div>
          <span class="ev-card__cta">احصل على دعوتك ←</span>
        </div>
      </a>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php endif; ?>

</main>

<!-- ============ FOOTER ============ -->
<footer class="footer" id="contact">
  <div class="wrap footer__grid">
    <div class="footer__brand">
      <img src="assets/brand/roundel-cream.png" alt="باركود كافيه" class="footer__roundel">
      <p>قهوة مختصة، مشروبات باردة، وأجواء على مقاس مزاجك.<br>لكلّ مزاجٍ كود.</p>
    </div>
    <div class="footer__col">
      <h4>تواصل معنا</h4>
      <a data-wa="footer" href="#" target="_blank" rel="noopener">واتساب: <span class="latin" dir="ltr" data-cfg="whatsappDisplay"></span></a>
      <a data-mail href="#"><span class="latin" data-cfg="email"></span></a>
      <?php if ($C['address']): ?><?php if ($C['mapUrl']): ?><a href="<?= e($C['mapUrl']) ?>" target="_blank" rel="noopener"><?= e($C['address']) ?></a><?php else: ?><span><?= e($C['address']) ?></span><?php endif; ?><?php endif; ?>
      <span data-cfg="hours"></span>
    </div>
    <div class="footer__col">
      <h4>تابعنا</h4>
      <div class="socials">
        <a data-social="instagram" href="#" aria-label="Instagram" target="_blank" rel="noopener"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="17.5" cy="6.5" r="1.1" fill="currentColor"/></svg></a>
        <a data-social="facebook" href="#" aria-label="Facebook" target="_blank" rel="noopener"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1z"/></svg></a>
        <a data-social="tiktok" href="#" aria-label="TikTok" target="_blank" rel="noopener"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M16.6 3c.3 2.2 1.6 3.6 3.8 3.8v2.6c-1.4.1-2.7-.3-3.8-1.1v5.9c0 3.5-2.6 5.8-5.7 5.8a5.6 5.6 0 0 1-5.6-5.7c0-3.4 2.9-6 6.5-5.5v2.7a2.9 2.9 0 1 0 2 2.8V3h2.8z"/></svg></a>
      </div>
      <?php if ($C['reservations']): ?><a class="btn btn--copper btn--sm" href="#reserve">احجز طاولة</a><?php endif; ?>
    </div>
  </div>
  <div class="footer__mega" aria-hidden="true"><img src="assets/brand/word-cream.png" alt=""></div>
  <div class="wrap footer__bottom">
    <span class="latin">© <span id="year"></span> BARCODE CAFE</span>
    <span>تصميم وتطوير <a href="https://theplanetco.com" target="_blank" rel="noopener">Planet</a></span>
  </div>
</footer>

<!-- ============ FLOATING WHATSAPP ============ -->
<a class="fab" data-wa="fab" href="#" target="_blank" rel="noopener" aria-label="تواصل عبر واتساب">
  <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>
</a>

<!-- ============ CART / RECEIPT DRAWER ============ -->
<div class="drawer" id="drawer" aria-hidden="true">
  <div class="drawer__backdrop" data-close></div>
  <aside class="receipt" data-lenis-prevent role="dialog" aria-label="فاتورة الطلب">
    <div class="receipt__bar"><b>فاتورتك</b><button class="receipt__close" data-close aria-label="إغلاق">×</button></div>
    <div class="receipt__paper">
      <div class="receipt__head">
        <img src="assets/brand/word-dark.png" alt="باركود كافيه">
        <span class="latin" dir="ltr" id="receiptNo">ORDER #0000</span>
        <span class="latin receipt__date" dir="ltr" id="receiptDate"></span>
      </div>
      <div class="receipt__dash"></div>
      <ul class="receipt__items" id="receiptItems"></ul>
      <div class="receipt__empty" id="receiptEmpty">
        <p>الفاتورة فارغة… وهذا أمرٌ محزن.</p>
        <a href="#menu" class="btn btn--dark btn--sm" data-close>اذهب إلى المنيو</a>
      </div>
      <div class="receipt__dash"></div>
      <div class="rcoupon" id="couponBox">
        <input id="couponInput" placeholder="عندك كود خصم؟" class="latin" autocomplete="off">
        <button type="button" id="couponApply">تطبيق</button>
      </div>
      <p class="coupon__msg" id="couponMsg"></p>
      <div class="receipt__sub" id="receiptSubRow" hidden><span>قبل الخصم</span><b class="latin" id="receiptSub"></b></div>
      <div class="receipt__sub receipt__sub--disc" id="receiptDiscRow" hidden><span id="receiptDiscLabel">الخصم</span><b class="latin" id="receiptDisc"></b></div>
      <div id="receiptCharges"></div>
      <div class="receipt__total"><span>الإجمالي</span><b class="latin" id="receiptTotal">0 EGP</b></div>
      <form class="receipt__form" id="orderForm">
        <div class="seg" role="radiogroup" aria-label="نوع الطلب">
          <label><input type="radio" name="type" value="توصيل" checked><span>توصيل</span></label>
          <label><input type="radio" name="type" value="استلام من الفرع"><span>استلام</span></label>
          <label><input type="radio" name="type" value="داخل الكافيه"><span>في الكافيه</span></label>
        </div>
        <select name="tablePick" id="tableSel" aria-label="رقم الترابيزة" hidden></select>
        <input name="name" placeholder="الاسم" autocomplete="name" required>
        <input name="phone" placeholder="رقم الموبايل" inputmode="tel" class="latin" autocomplete="tel" required>
        <select name="zone" id="zoneSel" aria-label="منطقة التوصيل" hidden></select>
        <input name="address" placeholder="العنوان بالتفصيل (للتوصيل)" autocomplete="street-address">
        <input name="notes" placeholder="ملاحظات: بدون سكر، ثلج زيادة، أي شيء…">
        <input name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
        <button type="submit" class="btn btn--copper btn--block">أرسل الطلب على واتساب</button>
        <button type="button" class="btn btn--line btn--block" id="orderMail">أرسل الطلب بالإيميل</button>
      </form>
      <div class="sent" id="orderSent" hidden>
        <div class="sent__tick">✓</div>
        <b>طلبك وصل للكافيه</b>
        <p>ترابيزة <span class="latin" id="sentTable"></span> · طلب <span class="latin" id="sentNo"></span></p>
        <div class="sent__status"><i></i><span id="sentStatus">وصل للكافيه</span></div>
        <button type="button" class="btn btn--line btn--block" id="sentMore">اطلب حاجة تانية</button>
      </div>
      <div class="receipt__foot">
        <div class="receipt__barcode" id="receiptBarcode"></div>
        <span>شكرًا لأنك اخترت مزاجًا جيدًا</span>
      </div>
    </div>
  </aside>
</div>

<div class="toast" id="toast" role="status" aria-live="polite"></div>

<script src="assets/vendor/gsap.min.js"></script>
<script src="assets/vendor/ScrollTrigger.min.js"></script>
<script src="assets/vendor/lenis.min.js"></script>
<?php $T = isset($_GET['t']) && !empty(settings()['dineIn']) ? table_by_code((string)$_GET['t']) : null; ?>
<script>window.BARCODE_TABLE = <?= $T ? json_encode(['code' => $T['code'], 'name' => $T['name'], 'mode' => in_array(settings()['tableOrder'] ?? 'both', ['both', 'site', 'whatsapp'], true) ? (settings()['tableOrder'] ?? 'both') : 'both'], JSON_UNESCAPED_UNICODE | JSON_HEX_TAG) : 'null' ?>;</script>
<script>window.BARCODE_DATA = <?= json_encode($D, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP) ?>;</script>
<script src="assets/js/app.js?v=<?= BC_VERSION ?>"></script>
</body>
</html>
