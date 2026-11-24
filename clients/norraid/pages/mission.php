<?php
page_head(['path' => 'mission', 'title' => t('mission.title'), 'description' => t('mission.lead')]);
?>
<section class="page-hero photo short">
 <div class="hero-media"><?= img('ss_tree_class', 'hero-img', 1600, true) ?><span class="hero-shade"></span></div>
 <div class="wrap ph-inner">
  <p class="eyebrow light"><span class="dot"></span>NORRAID AFRICA</p>
  <h1><?= te('mission.title') ?></h1>
  <p class="hero-text"><?= te('mission.lead') ?></p>
 </div>
 <p class="hero-credit credit"><?= media_credit(media('ss_tree_class')) ?></p>
</section>
<section class="sec">
 <div class="wrap intro-grid">
  <div class="reveal"><h2><?= te('mission.why_title') ?></h2></div>
  <div class="reveal prose"><?php foreach (tl('mission.why') as $p): ?><p><?= e($p) ?></p><?php endforeach; ?></div>
 </div>
</section>
<section class="sec sand">
 <div class="wrap">
  <?= section_head('', t('mission.values_title')) ?>
  <div class="values">
   <?php foreach (tl('mission.values') as $i => $v): ?><article class="value reveal"><span class="v-n">0<?= $i + 1 ?></span><h3><?= e($v['t']) ?></h3><p><?= e($v['d']) ?></p></article><?php endforeach; ?>
  </div>
 </div>
</section>
<section class="sec">
 <div class="wrap intro-grid">
  <div class="reveal"><h2><?= te('mission.countries_title') ?></h2></div>
  <div class="reveal prose"><p><?= te('mission.countries') ?></p>
   <p><?php foreach (COUNTRY_IDS as $c): ?><a class="chip lg" href="<?= e(u($c)) ?>"><?= e(country_name($c)) ?></a> <?php endforeach; ?></p></div>
 </div>
</section>
<section class="sec dark">
 <div class="wrap two-col">
  <div class="reveal"><h2><?= te('mission.partners_title') ?></h2><ul class="checks light"><?php foreach (tl('mission.partners') as $p): ?><li><?= icon('check', 'ic sm') ?> <?= e($p) ?></li><?php endforeach; ?></ul></div>
  <div class="reveal"><h2><?= te('mission.gov_title') ?></h2><ul class="checks light"><?php foreach (tl('mission.gov') as $p): ?><li><?= icon('protection', 'ic sm') ?> <?= e($p) ?></li><?php endforeach; ?></ul>
   <a class="btn btn-ghost" href="<?= e(u('transparency')) ?>"><?= te('home.transp_cta') ?> <?= icon('arrow', 'ic sm') ?></a></div>
 </div>
</section>
<?= donate_band(t('home.intro_title'), t('home.hero_text')) ?>
<?php page_foot();
