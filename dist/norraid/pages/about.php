<?php
page_head(['path' => 'about', 'title' => t('about.title'), 'description' => t('about.lead')]);
?>
<section class="page-hero plain">
 <div class="wrap ph-inner about-hero">
  <img src="<?= e(nr_base()) ?>assets/brand/norraid-logo-stacked-color.svg" alt="NORRAID AFRICA – Humanity Without Borders" width="280" height="200">
  <div><h1><?= te('about.title') ?></h1><p class="lead"><?= te('about.lead') ?></p></div>
 </div>
</section>
<section class="sec pt0">
 <div class="wrap intro-grid">
  <figure class="reveal"><?= img('drc_backtoschool', 'rounded', 900, false, '(max-width:800px) 100vw, 45vw') ?><figcaption class="credit"><?= media_credit(media('drc_backtoschool')) ?></figcaption></figure>
  <div class="reveal prose">
   <?php foreach (tl('about.body') as $p): ?><p><?= e($p) ?></p><?php endforeach; ?>
   <p class="notice"><?= icon('info', 'ic') ?> <span><?= te('about.name_note') ?></span></p>
   <p><a class="btn btn-forest" href="<?= e(u('mission')) ?>"><?= te('nav.mission') ?> <?= icon('arrow', 'ic sm') ?></a> <a class="btn btn-line" href="<?= e(u('contact')) ?>"><?= te('nav.contact') ?></a></p>
  </div>
 </div>
</section>
<section class="sec sand">
 <div class="wrap">
  <?= section_head('', t('mission.values_title')) ?>
  <div class="values"><?php foreach (tl('mission.values') as $i => $v): ?><article class="value reveal"><span class="v-n">0<?= $i + 1 ?></span><h3><?= e($v['t']) ?></h3><p><?= e($v['d']) ?></p></article><?php endforeach; ?></div>
 </div>
</section>
<?= newsletter_block() ?>
<?php page_foot();
