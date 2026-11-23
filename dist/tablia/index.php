<?php
require __DIR__ . '/inc/core.php';
$D = public_data();
$C = $D['config'];
$M = (array)$C['mama'];
$ribbon = $C['ribbon'] ?: ['أكل البيت.. على طبليتك'];
foreach (array_reverse($D['offers']['coupons']) as $cp) array_unshift($ribbon, 'كود ' . $cp['code'] . ' · خصم ' . $cp['value'] . ($cp['type'] === 'fixed' ? ' جنيه' : '%') . ' على طلبك');
$byCat = []; foreach ($D['menu'] as $c) $byCat[$c['id']] = $c;
$meals = array_values(array_filter($D['menu'], fn($c) => ($c['kind'] ?? '') === 'meal'));
$kitchen = array_values(array_filter($D['menu'], fn($c) => ($c['kind'] ?? '') !== 'meal'));
$minMeal = 0; foreach ($meals as $c) foreach ($c['items'] as $it) $minMeal = $minMeal ? min($minMeal, $it['price']) : $it['price'];
$itemCount = array_sum(array_map(fn($c) => count($c['items']), $D['menu']));
$plates = array_values(array_filter(['d1', 'd3', 'd2', 'd4', 'k7', 'd6', 'c5', 'd5', 'm1', 'a1', 'w2', 'd7'], fn($p) => is_file(__DIR__ . "/assets/plates/$p.webp")));
header('Cache-Control: no-cache');
$https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
$siteUrl = ($https ? 'https' : 'http') . '://' . preg_replace('/[^A-Za-z0-9.:-]/', '', $_SERVER['HTTP_HOST'] ?? 'localhost') . rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/')), '/') . '/';
$wa = $C['whatsapp']; $p2 = $C['phone2'];
$ld = ['@context' => 'https://schema.org', '@type' => 'FoodEstablishment', 'name' => 'طبلية | Tabliyya', 'url' => $siteUrl, 'image' => $siteUrl . 'assets/brand/og.jpg',
    'logo' => $siteUrl . 'assets/brand/favicon.png', 'servesCuisine' => ['أكل بيتي مصري', 'كاترينج', 'Egyptian home food'], 'priceRange' => '$$', 'areaServed' => ['القاهرة', 'الجيزة'],
    'telephone' => '+' . $wa, 'acceptsReservations' => true,
    'hasMenu' => ['@type' => 'Menu', 'url' => $siteUrl . '#menu', 'hasMenuSection' => array_map(fn($c) => ['@type' => 'MenuSection', 'name' => $c['title'],
        'hasMenuItem' => array_map(fn($it) => ['@type' => 'MenuItem', 'name' => $it['name'], 'offers' => ['@type' => 'Offer', 'price' => $it['price'], 'priceCurrency' => 'EGP']], $c['items'])], $D['menu'])]];
$same = array_values(array_filter((array)$C['social'])); if ($same) $ld['sameAs'] = $same;
function svg_ic(string $n): string {
    $p = [
        'wa' => '<path d="M12 2.2A9.8 9.8 0 0 0 3.6 17l-1.4 4.8 5-1.3A9.8 9.8 0 1 0 12 2.2Zm0 17.8a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20Zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 5 5 0 0 0 1 2.6 11.2 11.2 0 0 0 4.3 3.8c1.6.7 2.2.7 3 .6.5-.1 1.4-.6 1.6-1.2.2-.6.2-1.1.1-1.2l-.5-.2Z" fill="currentColor"/>',
        'phone' => '<path d="M6.6 2.8 9 2.3l1.7 4.3-2 1.6a12 12 0 0 0 7.1 7.1l1.6-2 4.3 1.7-.5 2.4a2 2 0 0 1-2 1.6A17.4 17.4 0 0 1 3.2 4.8a2 2 0 0 1 1.6-2Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
        'fb' => '<path d="M14 8.5V6.8c0-.8.5-1 1-1h2V2.3h-2.8C11 2.3 10.3 4.5 10.3 6v2.5H8v3.6h2.3V22H14v-9.9h2.6l.4-3.6Z" fill="currentColor"/>',
        'ig' => '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor"/>',
        'tt' => '<path d="M16.6 2.5h-3.4v13a2.9 2.9 0 1 1-2-2.8V9.2a6.4 6.4 0 1 0 5.4 6.3V8.9a7.8 7.8 0 0 0 4.4 1.4V6.9a4.4 4.4 0 0 1-4.4-4.4Z" fill="currentColor"/>',
        'pin' => '<path d="M12 22s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12Z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="10" r="2.6" fill="none" stroke="currentColor" stroke-width="1.7"/>',
        'clock' => '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 7v5l3.2 2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
        'moon' => '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
        'sun' => '<circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
        'search' => '<circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m16 16 4.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
        'close' => '<path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    ][$n] ?? '';
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' . $p . '</svg>';
}
?><!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>طبلية | أكل البيت من مطبخ ماما رحاب · كاترينج القاهرة والجيزة</title>
<meta name="description" content="طبلية: أكل بيتي معمول بحب من مطبخ ماما رحاب. وجبات يومية كاملة من <?= (int)$minMeal ?> جنيه، منيو أورينتال بالكيلو، سِت منيو وأوبن بوفيه للأفراح والمناسبات والشركات في القاهرة والجيزة. اطلب على واتساب.">
<meta name="theme-color" content="#A3261B">
<meta property="og:title" content="طبلية | أكل البيت.. على طبليتك">
<meta property="og:description" content="وجبات يومية، منيو بالكيلو، وباقات أفراح ومناسبات من مطبخ ماما رحاب. القاهرة والجيزة.">
<meta property="og:image" content="<?= e($siteUrl) ?>assets/brand/og.jpg">
<meta property="og:url" content="<?= e($siteUrl) ?>">
<meta property="og:type" content="restaurant.restaurant">
<meta property="og:locale" content="ar_EG">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="<?= e($siteUrl) ?>">
<script type="application/ld+json"><?= json_encode($ld, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG) ?></script>
<link rel="icon" type="image/png" href="assets/brand/favicon.png">
<link rel="apple-touch-icon" href="assets/brand/apple-touch.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@400;500;600;700;800;900&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="preload" as="image" href="assets/brand/badge.webp">
<link rel="stylesheet" href="assets/css/style.css?v=<?= BC_VERSION ?>">
<script>try{var t=localStorage.getItem('tb-theme');if(t)document.documentElement.dataset.theme=t;}catch(e){}</script>
</head>
<body class="is-loading">

<!-- ============ LOGO INTRO ============ -->
<div class="intro" id="intro" aria-hidden="true">
  <div class="intro__stage">
    <div class="intro__ring"></div>
    <div class="intro__logo" id="introLogo">
      <div class="lg-badge"><img src="assets/brand/badge.webp" alt="" width="820" height="706">
        <svg class="lg-steam" viewBox="0 0 120 80"><path d="M30 78c-8-12 8-18 0-30s6-18 0-30"/><path d="M60 78c-8-12 8-18 0-30s6-18 0-30"/><path d="M90 78c-8-12 8-18 0-30s6-18 0-30"/></svg>
      </div>
      <div class="lg-word"><img class="lg-en" src="assets/brand/word-en.webp" alt=""><img class="lg-ar" src="assets/brand/word-ar.webp" alt=""></div>
    </div>
    <p class="intro__line">من مطبخ ماما رحاب.. لطبليتك</p>
  </div>
</div>

<!-- ============ HEADER ============ -->
<header class="hdr" id="hdr">
  <a class="hdr__brand" href="#top" aria-label="طبلية">
    <img class="hdr__badge" src="assets/brand/badge.webp" alt="" width="54" height="46">
    <img class="hdr__word" src="assets/brand/word-ar.webp" alt="طبلية" width="96" height="40">
  </a>
  <nav class="hdr__nav" aria-label="الأقسام">
    <a href="#today">طبلية اليوم</a>
    <a href="#menu">منيو المطبخ</a>
    <a href="#occasions">المناسبات</a>
    <a href="#mama">ماما رحاب</a>
    <a href="#contact">تواصل</a>
  </nav>
  <div class="hdr__tools">
    <button class="icon-btn" id="themeBtn" aria-label="الوضع الليلي"><span class="i-moon"><?= svg_ic('moon') ?></span><span class="i-sun"><?= svg_ic('sun') ?></span></button>
    <a class="hdr__wa" href="https://wa.me/<?= e($wa) ?>" target="_blank" rel="noopener"><?= svg_ic('wa') ?><span>اطلب واتساب</span></a>
    <button class="hdr__cart" id="cartBtn" aria-label="طبليتي"><span class="hdr__cart-ic"></span><b id="cartCount">0</b></button>
    <button class="burger" id="burger" aria-label="القائمة"><i></i><i></i></button>
  </div>
</header>
<div class="mnav" id="mnav">
  <a href="#today">طبلية اليوم</a><a href="#menu">منيو المطبخ</a><a href="#occasions">المناسبات والأفراح</a><a href="#mama">ماما رحاب</a><a href="#contact">تواصل معانا</a>
  <div class="mnav__foot"><a href="https://wa.me/<?= e($wa) ?>" target="_blank" rel="noopener"><?= svg_ic('wa') ?> <?= e($C['whatsappDisplay']) ?></a><a href="tel:+<?= e($p2) ?>"><?= svg_ic('phone') ?> <?= e($C['phone2Display']) ?></a></div>
</div>

<main id="top">

<!-- ============ HERO ============ -->
<section class="hero" id="hero">
  <div class="hero__pattern" aria-hidden="true"></div>
  <div class="hero__copy">
    <p class="kicker"><span class="dot"></span> كاترينج أكل بيتي · القاهرة والجيزة</p>
    <h1 class="hero__title"><span class="ln">أكل البيت..</span><span class="ln ln--red">على طبليتك</span></h1>
    <p class="hero__sub">من مطبخ <b>ماما رحاب</b> لبيتك ومكتبك ومناسبتك. وجبات يومية كاملة، منيو بالكيلو، وباقات أفراح ومناسبات بنفس طعم أكل العيلة.</p>
    <div class="hero__cta">
      <a class="btn btn--red" href="#today">اطلب طبلية اليوم</a>
      <a class="btn btn--line" href="#occasions">احجز مناسبتك</a>
    </div>
    <ul class="hero__facts">
      <li><b><?= (int)$minMeal ?></b><span>جنيه بداية الوجبة الكاملة</span></li>
      <li><b><?= $itemCount ?></b><span>صنف في المنيو</span></li>
      <li><b>10K+</b><span>متابع على فيسبوك</span></li>
    </ul>
  </div>
  <div class="hero__art" id="heroArt">
    <div class="tablia" id="heroTablia">
      <div class="tablia__top"></div>
      <div class="tablia__ring" id="heroRing">
        <?php foreach ($plates as $i => $p): ?><span class="plate" style="--i:<?= $i ?>;--n:<?= count($plates) ?>"><img src="assets/plates/<?= $p ?>.webp" alt="" loading="<?= $i < 6 ? 'eager' : 'lazy' ?>" width="220" height="220"></span><?php endforeach; ?>
      </div>
      <div class="tablia__mama"><img src="assets/brand/badge.webp" alt="ماما رحاب" width="410" height="353"></div>
    </div>
    <div class="stamp" aria-hidden="true"><svg viewBox="0 0 200 200"><defs><path id="stc" d="M100 100m-74 0a74 74 0 1 1 148 0a74 74 0 1 1-148 0"/></defs><text><textPath href="#stc" startOffset="0">كل الوجبات معاها عيش ومخلل وحلو ✦ كل الوجبات معاها عيش ومخلل وحلو ✦</textPath></text></svg><b>بالهنا<br>والشفا</b></div>
  </div>
</section>

<div class="ribbon" aria-label="أخبار طبلية"><div class="ribbon__track"><?php for ($k = 0; $k < 2; $k++): foreach ($ribbon as $r): ?><span><?= e($r) ?></span><i>✦</i><?php endforeach; endfor; ?></div></div>

<!-- ============ TODAY ============ -->
<?php if ($meals): ?>
<section class="sec today" id="today">
  <div class="sec__head">
    <p class="kicker"><span class="dot"></span> كل يوم طازة</p>
    <h2 class="sec__title">طبلية اليوم</h2>
    <p class="sec__lead">وجبة كاملة على قدّك، أو طبلية عزومة على كيفك. <b>كل الوجبات معاها عيش ومخلل وحلو.</b></p>
  </div>
  <div class="seg" role="tablist" id="mealTabs">
    <?php foreach ($meals as $i => $c): ?><button role="tab" data-cat="<?= e($c['id']) ?>" class="<?= $i ? '' : 'is-on' ?>"><b><?= e($c['title']) ?></b><small><?= $c['id'] === 'daily' ? 'على قدّك' : 'على كيفك' ?></small></button><?php endforeach; ?>
  </div>
  <div class="meals" id="mealGrid"></div>
  <?php if (!empty($C['dailyNote'])): ?><p class="note"><span class="note__ic">🕘</span><?= e($C['dailyNote']) ?></p><?php endif; ?>
</section>
<?php endif; ?>

<!-- ============ MAMA REHAB ============ -->
<section class="sec mama" id="mama">
  <div class="mama__card">
    <div class="mama__portrait">
      <div class="mama__halo"></div>
      <img src="assets/brand/badge.webp" alt="ماما رحاب" width="410" height="353" loading="lazy">
      <span class="mama__name">ماما رحاب</span>
    </div>
    <div class="mama__copy">
      <p class="kicker"><span class="dot"></span> صاحبة الطبلية</p>
      <h2 class="sec__title">حكاية ماما رحاب</h2>
      <blockquote class="mama__quote">«<?= e($M['quote'] ?? 'الأكل اللي بيتعمل بحب.. بيوصل بحب.') ?>»</blockquote>
      <p class="mama__story"><?= nl2br(e($M['story'] ?? '')) ?></p>
      <p class="mama__sign">— <?= e($M['sign'] ?? 'ماما رحاب') ?></p>
    </div>
  </div>
  <div class="vows">
    <article class="vow"><span class="vow__no">01</span><h3>طازة كل يوم</h3><p>طلبك بيتطبخ في يومه. علشان كده بنأكّد طلب بكرة من بالليل أو الصبح بدري.</p></article>
    <article class="vow"><span class="vow__no">02</span><h3>بإيد ماما رحاب</h3><p>ورق العنب والمحشي ملفوفين بإيد، والطاجن على نار هادية، زي سفرة يوم الجمعة.</p></article>
    <article class="vow"><span class="vow__no">03</span><h3>التفاصيل بتفرق</h3><p>من تغليف الوجبة لحد ترتيب البوفيه، كل حاجة بتوصل مرتبة ونضيفة وسخنة.</p></article>
  </div>
</section>

<!-- ============ KITCHEN MENU ============ -->
<?php if ($kitchen): ?>
<section class="sec menu" id="menu">
  <div class="sec__head">
    <p class="kicker"><span class="dot"></span> منيو أورينتال</p>
    <h2 class="sec__title">منيو المطبخ</h2>
    <p class="sec__lead">لحوم وفراخ وسي فود بالكيلو ونص الكيلو، محاشي وصواني وسلطات وحلويات للعزومات والسفرة الكبيرة.</p>
  </div>
  <div class="menu__bar" id="menuBar">
    <div class="chips" id="menuChips">
      <?php foreach ($kitchen as $c): ?><button data-cat="<?= e($c['id']) ?>"><?= e($c['title']) ?></button><?php endforeach; ?>
    </div>
    <label class="search"><?= svg_ic('search') ?><input type="search" id="menuSearch" placeholder="بتدوّر على صنف معيّن؟" autocomplete="off"></label>
  </div>
  <div class="menu__body" id="menuBody">
    <?php foreach ($kitchen as $c): ?>
      <div class="mcat" id="cat-<?= e($c['id']) ?>" data-cat="<?= e($c['id']) ?>">
        <div class="mcat__head"><h3><?= e($c['title']) ?></h3><p><?= e($c['line']) ?></p><?php if (!empty($c['off'])): ?><span class="off">خصم <?= e($c['off']) ?>%</span><?php endif; ?></div>
        <div class="mlist" data-list="<?= e($c['id']) ?>"></div>
      </div>
    <?php endforeach; ?>
    <p class="empty" id="menuEmpty" hidden>مفيش صنف بالاسم ده.. جرّب كلمة تانية أو كلّمنا على واتساب.</p>
  </div>
</section>
<?php endif; ?>

<!-- ============ OCCASIONS ============ -->
<?php if ($D['packages']): ?>
<section class="sec occ" id="occasions">
  <div class="occ__hero">
    <img src="assets/img/buffet.webp" alt="أوبن بوفيه طبلية" loading="lazy" width="1600" height="898">
    <div class="occ__hero-copy">
      <p class="kicker kicker--light"><span class="dot"></span> أفراح · مناسبات · شركات</p>
      <h2 class="sec__title">مناسبتك علينا</h2>
      <p>عزومة من غير تعب. سِت منيو وأوبن بوفيه بنفس طعم أكل البيت، وإحنا نجهّز كل حاجة.</p>
    </div>
  </div>
  <div class="seg seg--wide" id="packTabs">
    <button data-type="set" class="is-on"><b>سِت منيو</b><small>علبة لكل فرد</small></button>
    <button data-type="buffet"><b>أوبن بوفيه الأفراح</b><small>بوفيه مفتوح</small></button>
  </div>
  <div class="packs" id="packGrid"></div>

  <div class="book" id="book">
    <div class="book__calc">
      <h3>احسب مناسبتك</h3>
      <label class="fld"><span>الباقة</span><select id="bkPack"></select></label>
      <div class="fld"><span>عدد الضيوف: <b id="bkGuestsOut">100</b> فرد</span><input type="range" id="bkGuests" min="20" max="1000" step="10" value="100"></div>
      <div class="book__total"><small>الإجمالي التقريبي</small><b id="bkTotal">0</b><span>جنيه</span></div>
      <p class="book__hint" id="bkHint">السعر النهائي بيتأكد مع فريق طبلية حسب العدد والمكان والتاريخ.</p>
    </div>
    <form class="book__form" id="bookForm" autocomplete="on">
      <h3>احجز ميعادك</h3>
      <div class="row2">
        <label class="fld"><span>الاسم</span><input name="name" required maxlength="80" autocomplete="name"></label>
        <label class="fld"><span>الموبايل</span><input name="phone" required inputmode="tel" maxlength="20" autocomplete="tel" dir="ltr"></label>
      </div>
      <div class="row2">
        <label class="fld"><span>تاريخ المناسبة</span><input type="date" name="date" required id="bkDate"></label>
        <label class="fld"><span>الساعة</span><input type="time" name="time" value="14:00"></label>
      </div>
      <div class="row2">
        <label class="fld"><span>نوع المناسبة</span><select name="occasion"><option>فرح / خطوبة</option><option>عزومة عائلية</option><option>حفلة شركة / مكتب</option><option>عقيقة / سبوع</option><option>عزاء</option><option>مناسبة أخرى</option></select></label>
        <label class="fld"><span>المنطقة</span><input name="address" maxlength="200" placeholder="مثلًا: مدينة نصر"></label>
      </div>
      <label class="fld"><span>ملاحظات</span><textarea name="notes" rows="2" maxlength="400" placeholder="أصناف زيادة، ميعاد التجهيز، أي تفاصيل"></textarea></label>
      <input class="hp" name="website" tabindex="-1" autocomplete="off">
      <button class="btn btn--red btn--block" type="submit"><?= svg_ic('wa') ?> ابعت الحجز على واتساب</button>
    </form>
  </div>
</section>
<?php endif; ?>

<!-- ============ HOW ============ -->
<section class="sec how">
  <h2 class="sec__title sec__title--sm">ازاي توصلك الطبلية؟</h2>
  <ol class="steps">
    <li><b>1</b><h3>اختار أصنافك</h3><p>من طبلية اليوم أو منيو المطبخ، وحطها على طبليتك.</p></li>
    <li><b>2</b><h3>ابعت على واتساب</h3><p>الطلب بيوصلنا متكتب كامل بالأسعار والميعاد.</p></li>
    <li><b>3</b><h3>نأكّد ونطبخ</h3><p>نكلّمك نأكّد، والأكل يتطبخ طازة في يومه.</p></li>
    <li><b>4</b><h3>بالهنا والشفا</h3><p>توصيل لحد باب البيت أو المكتب في القاهرة والجيزة.</p></li>
  </ol>
</section>

<!-- ============ CONTACT ============ -->
<section class="sec contact" id="contact">
  <div class="contact__card">
    <div class="contact__main">
      <p class="kicker kicker--light"><span class="dot"></span> اطلب طبليتك دلوقتي</p>
      <h2 class="sec__title">إحنا على الواتساب</h2>
      <div class="contact__nums">
        <a class="cbtn cbtn--wa" href="https://wa.me/<?= e($wa) ?>" target="_blank" rel="noopener"><?= svg_ic('wa') ?><span><small>واتساب</small><b dir="ltr"><?= e($C['whatsappDisplay']) ?></b></span></a>
        <?php if ($p2): ?><a class="cbtn" href="tel:+<?= e($p2) ?>"><?= svg_ic('phone') ?><span><small>اتصال</small><b dir="ltr"><?= e($C['phone2Display']) ?></b></span></a><?php endif; ?>
      </div>
      <ul class="contact__info">
        <li><?= svg_ic('pin') ?><?= e($C['address'] ?: 'القاهرة والجيزة') ?></li>
        <?php if ($C['hours']): ?><li><?= svg_ic('clock') ?><?= e($C['hours']) ?></li><?php endif; ?>
      </ul>
      <div class="social">
        <?php $soc = (array)$C['social']; foreach (['facebook' => 'fb', 'instagram' => 'ig', 'tiktok' => 'tt'] as $k => $ic): if (!empty($soc[$k])): ?><a href="<?= e($soc[$k]) ?>" target="_blank" rel="noopener" aria-label="<?= $k ?>"><?= svg_ic($ic) ?></a><?php endif; endforeach; ?>
        <span>tablia.catering</span>
      </div>
    </div>
    <div class="contact__art"><img src="assets/brand/badge.webp" alt="" loading="lazy" width="410" height="353"></div>
  </div>
</section>
</main>

<footer class="foot">
  <img src="assets/brand/word-cream.webp" alt="طبلية" width="150" height="102" loading="lazy">
  <p>أكل البيت.. على طبليتك · © <?= date('Y') ?> طبلية</p>
  <a class="foot__by" href="https://theplanetco.com" target="_blank" rel="noopener">Website by Planet</a>
</footer>

<!-- ============ CART ============ -->
<button class="fab" id="fab" aria-label="طبليتي"><span class="fab__t"><span class="fab__plates" id="fabPlates"></span></span><span class="fab__l">طبليتي</span><b id="fabCount">0</b></button>
<div class="layer" id="cartLayer" aria-hidden="true">
  <div class="layer__bg" data-close></div>
  <aside class="drawer" role="dialog" aria-label="طبليتي" data-lenis-prevent>
    <header class="drawer__head"><h3>طبليتي</h3><button class="icon-btn" data-close aria-label="إغلاق"><?= svg_ic('close') ?></button></header>
    <div class="drawer__body">
      <div class="drawer__tablia" id="drawerTablia"></div>
      <div id="cartList" class="clist"></div>
      <p class="clist__empty" id="cartEmpty">الطبلية لسه فاضية.. اختار وجبتك من <a href="#today" data-close>طبلية اليوم</a>.</p>
      <form id="orderForm" class="oform" autocomplete="on">
        <div class="seg seg--sm" id="typeSeg"><button type="button" data-v="توصيل" class="is-on">توصيل</button><button type="button" data-v="استلام من المطبخ">استلام</button></div>
        <div class="row2">
          <label class="fld"><span>يوم الطلب</span><select name="day" id="daySel"></select></label>
          <label class="fld"><span>الميعاد</span><select name="slot"><option>1 - 3 الضهر</option><option>3 - 5 العصر</option><option>5 - 7 المغرب</option><option>7 - 9 بالليل</option><option>أقرب ميعاد</option></select></label>
        </div>
        <div class="row2">
          <label class="fld"><span>الاسم</span><input name="name" required maxlength="80" autocomplete="name"></label>
          <label class="fld"><span>الموبايل</span><input name="phone" required inputmode="tel" maxlength="20" dir="ltr" autocomplete="tel"></label>
        </div>
        <label class="fld" id="zoneFld" hidden><span>منطقة التوصيل</span><select name="zone" id="zoneSel"></select></label>
        <label class="fld" id="addrFld"><span>العنوان</span><input name="address" maxlength="300" autocomplete="street-address" placeholder="المنطقة، الشارع، رقم العمارة والدور"></label>
        <label class="fld"><span>ملاحظات</span><input name="notes" maxlength="300" placeholder="مثلًا: من غير بصل"></label>
        <div class="coupon"><input id="couponIn" placeholder="كود خصم" maxlength="30" dir="ltr"><button type="button" id="couponBtn">تطبيق</button></div>
        <p class="coupon__msg" id="couponMsg"></p>
        <input class="hp" name="website" tabindex="-1" autocomplete="off">
      </form>
    </div>
    <footer class="drawer__foot">
      <div class="totals" id="totals"></div>
      <button class="btn btn--red btn--block" id="sendOrder"><?= svg_ic('wa') ?> ابعت الطلب على واتساب</button>
    </footer>
  </aside>
</div>

<!-- item sheet -->
<div class="layer" id="sheetLayer" aria-hidden="true">
  <div class="layer__bg" data-close></div>
  <div class="sheet" role="dialog" data-lenis-prevent>
    <button class="icon-btn sheet__x" data-close aria-label="إغلاق"><?= svg_ic('close') ?></button>
    <div id="sheetBody"></div>
  </div>
</div>
<div class="toast" id="toast" role="status"></div>

<script src="assets/vendor/gsap.min.js"></script>
<script src="assets/vendor/ScrollTrigger.min.js"></script>
<script src="assets/vendor/lenis.min.js"></script>
<script>window.TB = <?= json_encode($D, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP) ?>;</script>
<script src="assets/js/app.js?v=<?= BC_VERSION ?>"></script>
</body>
</html>
