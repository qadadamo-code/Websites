<?php
require __DIR__ . '/inc/bootstrap.php';
require __DIR__ . '/inc/ui.php';
$pageClass = 'page-home';
$all = products();
$best = array_values(array_filter($all, fn($p) => !empty($p['best'])));
$ruby = product('ruby-necklace-earrings-set');
$cuff = product('floral-shoulder-cuff');
$ar = LANG === 'ar';
require __DIR__ . '/inc/header.php';
?>

<!-- HERO: a light story slider — the ruby set assembles, then gold, then worn -->
<?php
$slides = [
  ['seq', '', $ar ? 'من حجرٍ… إلى توقيع.' : 'From stone to signature.'],
  ['img', 'assets/img/products/floral-shoulder-cuff-1.webp', $ar ? 'تفاصيل من الذهب.' : 'Set in gold.'],
  ['img', 'assets/img/products/pearl-gold-link-necklace-2.webp', $ar ? 'صُنعت لتُرتدى.' : 'Made to wear.'],
  ['video', 'assets/video/hero.mp4', $ar ? 'تلمع من كل زاوية.' : 'Light from every angle.'],
];
?>
<section class="hs" data-hs>
  <div class="hs__titles" aria-live="polite">
    <?php foreach ($slides as $k => $sl): ?><h<?= $k ? 2 : 1 ?> class="hs__title <?= $k ? '' : 'is-on' ?>" data-hs-title="<?= $k ?>"><?= e($sl[2]) ?></h<?= $k ? 2 : 1 ?>><?php endforeach; ?>
  </div>
  <div class="hs__stage">
    <?php foreach ($slides as $k => [$kind, $src]): ?>
      <div class="hs__slide hs__slide--<?= $kind ?> <?= $k ? '' : 'is-on' ?>" data-hs-slide="<?= $k ?>">
        <?php if ($kind === 'seq'): ?><canvas class="hs__seq" width="600" height="800" data-hs-seq data-path="assets/seq/explode/" data-frames="61"></canvas>
        <?php elseif ($kind === 'img'): ?><div class="hs__frame"><img src="<?= e($src) ?>" alt="" <?= $k > 1 ? 'loading="lazy"' : '' ?>></div>
        <?php else: ?><div class="hs__frame"><video src="<?= e($src) ?>" muted loop playsinline preload="none" poster="assets/video/hero-poster.webp"></video></div><?php endif; ?>
      </div>
    <?php endforeach; ?>
    <button class="hs__arrow hs__arrow--prev" data-hs-prev aria-label="prev"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
    <button class="hs__arrow hs__arrow--next" data-hs-next aria-label="next"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>
  </div>
  <div class="hs__foot">
    <div class="hs__dots"><?php foreach ($slides as $k => $_): ?><button class="<?= $k ? '' : 'is-on' ?>" data-hs-dot="<?= $k ?>" aria-label="<?= $k + 1 ?>"><i></i></button><?php endforeach; ?></div>
    <div class="hs__ctas">
      <a href="shop.php" class="btn btn--dark"><?= t('shop_all') ?></a>
      <a href="#vitrine" class="btn btn--ghost"><?= $ar ? 'ادخلي الفاترينة' : 'Enter the window' ?></a>
    </div>
  </div>
</section>

<!-- Categories ribbon -->
<div class="ribbon" aria-hidden="true">
  <div class="ribbon__track">
    <?php for ($k = 0; $k < 3; $k++): foreach (categories() as $c): if (!category_count($c['id'])) continue; ?>
      <span><?= e($c[LANG]) ?></span><i>✦</i>
    <?php endforeach; endfor; ?>
  </div>
</div>

<!-- VITRINE: a lit display window. Tap a piece and the camera moves in on it. -->
<?php
$vitIds = ['floral-shoulder-cuff', 'classic-coin-necklace', 'ruby-necklace-earrings-set', 'golden-fan-earrings', 'multicolor-gemstone-necklace', 'classic-tennis-bracelet'];
$vit = array_values(array_filter(array_map('product', $vitIds), fn($p) => $p && empty($p['hidden'])));
if (count($vit) < 4) $vit = array_slice(products(), 0, 6);
?>
<section class="vit" id="vitrine" data-vit>
  <div class="vit__head wrap">
    <p class="eyebrow"><span class="line"></span><?= $ar ? 'الفاترينة' : 'The window' ?><span class="line"></span></p>
    <h2 class="sec-title"><?= $ar ? 'اختاري قطعتك <em>من الفاترينة</em>' : 'Choose your piece <em>from the window</em>' ?></h2>
    <p class="vit__hint"><?= $ar ? 'اضغطي على أي قطعة لتقربي منها' : 'Tap any piece to step closer' ?></p>
  </div>
  <div class="vit__scene" data-vit-scene>
    <div class="vit__glow" data-vit-glow></div>
    <div class="vit__row" data-vit-row>
      <?php foreach ($vit as $k => $p): $cat = category($p['category']); ?>
        <button class="vit__item" data-vit-item="<?= $k ?>" style="<?= tone_style($p) ?>" aria-label="<?= e(L($p, 'name')) ?>"
          data-id="<?= e($p['id']) ?>" data-name="<?= e(L($p, 'name')) ?>" data-cat="<?= e($cat[LANG] ?? '') ?>" data-price="<?= e(money($p['price'])) ?>"
          data-url="product.php?p=<?= e(rawurlencode($p['id'])) ?>" data-stock="<?= (int)$p['stock'] ?>"
          data-notes="<?= e(json_encode(array_slice($p['details_' . LANG] ?? [], 0, 3), JSON_UNESCAPED_UNICODE)) ?>">
          <span class="vit__lamp" aria-hidden="true"></span>
          <span class="vit__niche"><img src="<?= e($p['images'][0]) ?>" alt="" loading="lazy"></span>
          <span class="vit__plinth"><b><?= money($p['price']) ?></b></span>
        </button>
      <?php endforeach; ?>
    </div>
    <aside class="vit__card" data-vit-card aria-hidden="true">
      <span class="vit__no" data-vit-no></span>
      <h3 data-vit-name></h3>
      <ul class="vit__notes" data-vit-notes></ul>
      <div class="vit__price" data-vit-price></div>
      <button class="btn btn--gold btn--block" data-vit-add data-add=""><?= t('add_to_cart') ?></button>
      <a class="vit__more" data-vit-url href="#"><?= $ar ? 'كل التفاصيل' : 'Full details' ?></a>
      <div class="vit__nav">
        <button data-vit-prev aria-label="prev">‹</button>
        <button class="vit__back" data-vit-back>← <?= $ar ? 'رجوع للفاترينة' : 'Back to the window' ?></button>
        <button data-vit-next aria-label="next">›</button>
      </div>
    </aside>
  </div>
</section>

<!-- Manifesto: words light up as you scroll -->
<section class="manifesto wrap">
  <p class="eyebrow"><span class="line"></span><?= $ar ? 'فلسفتنا' : 'Our philosophy' ?></p>
  <p class="manifesto__text" data-scrub-words><?= $ar
      ? 'كل قطعة عندنا بتبدأ بتفصيلة صغيرة: حجر بيلمع، بتلة ذهبية، لؤلؤة بتعكس النور. ولما التفاصيل دي تتجمع على بعضها… بتبقى إنتِ.'
      : 'Every piece begins with a small detail: a stone that sparkles, a golden petal, a pearl that holds the light. When those details come together… they become you.' ?></p>
</section>

<!-- Collections -->
<section class="cats wrap">
  <div class="sec-head">
    <h2 class="sec-title" data-reveal><?= $ar ? 'تسوّقي حسب <em>المجموعة</em>' : 'Shop by <em>collection</em>' ?></h2>
    <a class="link-arrow" href="shop.php"><?= t('view_all') ?></a>
  </div>
  <div class="cats__grid">
    <?php $ci = 0; foreach (categories() as $c): $n = category_count($c['id']); if (!$n) continue; ?>
      <a class="cat" href="shop.php?cat=<?= e($c['id']) ?>" data-reveal style="--i:<?= $ci++ ?>" data-cursor="<?= $ar ? 'تسوّقي' : 'Shop' ?>">
        <div class="cat__img"><img src="<?= e($c['image']) ?>" alt="<?= e($c[LANG]) ?>" loading="lazy"></div>
        <div class="cat__label"><h3><?= e($c[LANG]) ?></h3><span><?= $n ?> <?= t('pieces') ?></span></div>
        <span class="cat__num">0<?= $ci ?></span>
      </a>
    <?php endforeach; ?>
  </div>
</section>

<!-- DECONSTRUCT: scroll scrubs the exploding ruby set -->
<?php if ($ruby): ?>
<section class="decon" id="deconstruct" data-decon data-frames="61" data-path="assets/seq/explode/">
  <div class="decon__pin">
    <div class="decon__bg" aria-hidden="true"><span>RUBY</span></div>
    <div class="decon__stage">
      <canvas class="decon__canvas" width="600" height="800" aria-label="<?= e(L($ruby, 'name')) ?>"></canvas>
      <div class="decon__ring" aria-hidden="true"></div>
    </div>
    <div class="decon__copy">
      <p class="eyebrow"><span class="line"></span><?= $ar ? 'ما وراء البريق' : 'Beyond the sparkle' ?></p>
      <div class="decon__steps">
        <div class="decon__step is-on" data-step="0">
          <h2><?= $ar ? 'قطعة واحدة.<br><em>عشرات التفاصيل.</em>' : 'One piece.<br><em>Countless details.</em>' ?></h2>
          <p><?= $ar ? 'مرّري ببطء… وشوفي طقم الياقوت الأحمر وهو يتفكّك قدامك لقطعه الأساسية.' : 'Scroll slowly — and watch the Ruby Set come apart into the pieces that make it.' ?></p>
        </div>
        <div class="decon__step" data-step="1">
          <span class="decon__no">01</span>
          <h3><?= $ar ? 'الحجر الياقوتي' : 'The ruby heart' ?></h3>
          <p><?= $ar ? 'حجر بيضاوي أحمر في قلب التصميم، بيخطف العين من أول نظرة.' : 'An oval red centre stone at the heart of the design — it takes the eye at first glance.' ?></p>
        </div>
        <div class="decon__step" data-step="2">
          <span class="decon__no">02</span>
          <h3><?= $ar ? 'هالة الكريستال' : 'A halo of crystal' ?></h3>
          <p><?= $ar ? 'صف من الكريستالات الدائرية بيحيط بالياقوتة ويضاعف لمعانها.' : 'A ring of round crystals frames the ruby and doubles its fire.' ?></p>
        </div>
        <div class="decon__step" data-step="3">
          <span class="decon__no">03</span>
          <h3><?= $ar ? 'أجنحة الماركيز' : 'Marquise wings' ?></h3>
          <p><?= $ar ? 'جناحان من قطع الماركيز المصفوفة كأوراق الشجر، بطلاء بلاتيني لامع.' : 'Two wings of marquise stones set like leaves, in bright platinum plating.' ?></p>
        </div>
        <div class="decon__step" data-step="4">
          <h3><?= e(L($ruby, 'name')) ?></h3>
          <p class="decon__price"><?= money($ruby['price']) ?></p>
          <div class="decon__ctas">
            <button class="btn btn--dark" data-add="<?= e($ruby['id']) ?>" data-magnetic><?= t('add_to_cart') ?></button>
            <a class="link-arrow" href="product.php?p=<?= e($ruby['id']) ?>"><?= t('details') ?></a>
          </div>
        </div>
      </div>
      <div class="decon__progress"><i></i></div>
    </div>
  </div>
</section>
<?php endif; ?>

<!-- Best sellers -->
<section class="grid-sec wrap">
  <div class="sec-head">
    <h2 class="sec-title" data-reveal><?= $ar ? 'الأكثر <em>طلباً</em>' : 'Best <em>sellers</em>' ?></h2>
    <a class="link-arrow" href="shop.php"><?= t('view_all') ?></a>
  </div>
  <div class="pgrid">
    <?php foreach (array_slice($best, 0, 8) as $i => $p) echo product_card($p, $i); ?>
  </div>
</section>

<!-- Signature piece spotlight -->
<?php if ($cuff): ?>
<section class="spot" data-spot>
  <div class="spot__media">
    <div class="spot__frame" data-lens>
      <img src="<?= e($cuff['images'][0]) ?>" alt="<?= e(L($cuff, 'name')) ?>" loading="lazy">
      <span class="spot__lens" aria-hidden="true"></span>
    </div>
  </div>
  <div class="spot__copy">
    <p class="eyebrow"><span class="line"></span><?= $ar ? 'القطعة المميزة' : 'The signature piece' ?></p>
    <h2 class="sec-title"><?= e(L($cuff, 'name')) ?></h2>
    <p class="spot__desc"><?= e(L($cuff, 'desc')) ?></p>
    <ul class="spot__list">
      <?php foreach (($cuff['details_' . LANG] ?? []) as $d): ?><li><?= e($d) ?></li><?php endforeach; ?>
    </ul>
    <div class="spot__buy">
      <span class="spot__price"><?= money($cuff['price']) ?></span>
      <button class="btn btn--dark" data-add="<?= e($cuff['id']) ?>" data-magnetic><?= t('add_to_cart') ?></button>
    </div>
    <p class="spot__hint"><?= $ar ? 'حرّكي الماوس فوق الصورة لتكبير التفاصيل' : 'Hover the photo to magnify the details' ?></p>
  </div>
</section>
<?php endif; ?>

<!-- Lookbook: horizontal scroll -->
<section class="look" data-look>
  <div class="look__pin">
    <div class="look__head wrap">
      <p class="eyebrow"><span class="line"></span><?= $ar ? 'لوك بوك' : 'Lookbook' ?></p>
      <h2 class="sec-title"><?= $ar ? 'تتلبس <em>كده</em>' : 'Worn <em>like this</em>' ?></h2>
    </div>
    <div class="look__track" data-look-track>
      <?php
      $looks = [
        ['assets/img/products/lookbook-hero.webp', $ar ? 'سهرة بلمسة لعب' : 'Playful evening', 'classic-tennis-bracelet'],
        ['assets/img/products/floral-tennis-set-1.webp', $ar ? 'الطقم الكامل' : 'The full set', 'floral-tennis-set'],
        ['assets/img/products/multicolor-gemstone-necklace-2.webp', $ar ? 'لون على البحر' : 'Colour by the sea', 'multicolor-gemstone-necklace'],
        ['assets/img/products/pearl-gold-link-necklace-2.webp', $ar ? 'لؤلؤ النهار' : 'Daylight pearls', 'pearl-gold-link-necklace'],
        ['assets/img/products/necklace-earrings-set-2.webp', $ar ? 'لمسة ياقوت' : 'A touch of ruby', 'ruby-necklace-earrings-set'],
        ['assets/img/products/floral-earrings-gold-1.webp', $ar ? 'زهرة ذهبية' : 'Golden bloom', 'floral-earrings-gold'],
        ['assets/img/products/gold-plated-necklace-1.webp', $ar ? 'بساطة ذهبية' : 'Golden simplicity', 'gold-plated-necklace'],
      ];
      foreach ($looks as $k => [$img, $cap, $pid]): $lp = product($pid); ?>
        <a class="look__card" href="product.php?p=<?= e($pid) ?>" data-cursor="<?= $ar ? 'تسوّقي' : 'Shop' ?>">
          <div class="look__img"><img src="<?= e($img) ?>" alt="<?= e($cap) ?>" loading="lazy"></div>
          <div class="look__cap"><span>0<?= $k + 1 ?></span><b><?= e($cap) ?></b><?php if ($lp): ?><small><?= e(L($lp, 'name')) ?> · <?= money($lp['price']) ?></small><?php endif; ?></div>
        </a>
      <?php endforeach; ?>
      <a class="look__card look__card--end" href="shop.php">
        <span><?= $ar ? 'كل القطع' : 'All pieces' ?></span><b>→</b>
      </a>
    </div>
  </div>
</section>

<!-- Promise -->
<section class="promise wrap">
  <?php $feats = [
    ['M3 7h11v9H3zM14 10h4l3 3v3h-7z', 'feat_ship'], ['M4 7h16v10H4zM4 11h16', 'feat_cod'],
    ['M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z', 'feat_warranty'], ['M4 10h16v10H4zM12 10v10M4 10l2-4h12l2 4M12 6c-1-2-4-3-4-1s4 1 4 1 3-3 4-1-4 1-4 1', 'feat_gift'],
  ]; foreach ($feats as $k => [$d, $key]): ?>
    <div class="promise__item" data-reveal style="--i:<?= $k ?>">
      <svg viewBox="0 0 24 24"><path d="<?= $d ?>"/></svg>
      <h4><?= t($key) ?></h4><p><?= t($key . '_sub') ?></p>
    </div>
  <?php endforeach; ?>
</section>

<!-- Closing CTA -->
<section class="finale">
  <div class="finale__bg"><video src="assets/video/hero.mp4" muted loop playsinline autoplay preload="none" poster="assets/video/hero-poster.webp"></video></div>
  <div class="finale__inner wrap" data-reveal>
    <svg class="mono" viewBox="0 0 120 120"><use href="#eb-mono"/></svg>
    <h2><?= $ar ? 'قطعتك القادمة <em>مستنياكِ</em>' : 'Your next piece <em>is waiting</em>' ?></h2>
    <p><?= $ar ? 'استخدمي كود WELCOME10 واحصلي على خصم 10% على أول طلب فوق 1,000 ج.م' : 'Use WELCOME10 for 10% off your first order over EGP 1,000' ?></p>
    <a href="shop.php" class="btn btn--gold" data-magnetic><?= t('shop_all') ?></a>
    <?php if (setting('instagram')): ?>
      <a class="finale__ig" href="https://instagram.com/<?= e(setting('instagram')) ?>" target="_blank" rel="noopener">@<?= e(setting('instagram')) ?></a>
    <?php endif; ?>
  </div>
</section>

<?php require __DIR__ . '/inc/footer.php'; ?>
