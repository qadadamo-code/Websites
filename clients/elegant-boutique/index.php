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

<!-- HERO: looping campaign film -->
<section class="hero" data-hero>
  <div class="hero__media">
    <video class="hero__video" autoplay muted loop playsinline preload="auto" poster="assets/video/hero-poster.webp">
      <source src="assets/video/hero.mp4" type="video/mp4">
    </video>
    <div class="hero__shade"></div>
    <div class="hero__grain"></div>
  </div>
  <div class="hero__content wrap">
    <p class="eyebrow hero__eyebrow"><span class="line"></span><?= $ar ? 'مجموعة الخريف · 2026' : 'Autumn Collection · 2026' ?></p>
    <h1 class="hero__title" data-split>
      <span class="hero__l1"><?= split_words($ar ? 'أناقةٌ تُرتدى' : 'Elegance, worn,') ?></span>
      <span class="hero__l2"><em><?= split_words($ar ? 'لا تُشرح.' : 'not explained.') ?></em></span>
    </h1>
    <p class="hero__sub"><?= $ar ? 'مجوهرات مطلية بالذهب والبلاتين، مصمَّمة لتلتقط الضوء من كل زاوية… وتلفت الأنظار إليكِ.' : 'Gold and platinum plated pieces, designed to catch the light from every angle — and every eye in the room.' ?></p>
    <div class="hero__ctas">
      <a href="shop.php" class="btn btn--gold" data-magnetic><?= t('shop_all') ?></a>
      <a href="#deconstruct" class="btn btn--glass" data-magnetic><?= $ar ? 'شاهدي القطعة تتفكّك' : 'Watch a piece unfold' ?></a>
    </div>
  </div>
  <div class="hero__foot wrap">
    <div class="hero__scroll"><span><?= t('scroll') ?></span><i></i></div>
    <div class="hero__stats">
      <div><b data-count="<?= count($all) ?>">0</b><span><?= $ar ? 'قطعة مختارة' : 'curated pieces' ?></span></div>
      <div><b>6</b><span><?= $ar ? 'شهور ضمان' : 'month warranty' ?></span></div>
      <div><b>27</b><span><?= $ar ? 'محافظة نوصلها' : 'governorates served' ?></span></div>
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
  <div class="finale__bg"><img src="assets/img/scenes/hero-still.webp" alt="" loading="lazy"></div>
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
