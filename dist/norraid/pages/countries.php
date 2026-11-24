<?php
page_head(['path' => 'countries', 'title' => t('countries_page.title'), 'description' => t('countries_page.lead')]);
?>
<section class="page-hero plain">
 <div class="wrap ph-inner">
  <p class="eyebrow"><?= te('home.eyebrow') ?></p>
  <h1><?= te('countries_page.title') ?></h1>
  <p class="lead"><?= te('countries_page.lead') ?></p>
 </div>
</section>
<section class="sec pt0">
 <div class="wrap">
  <div class="country-grid"><?php foreach (COUNTRY_IDS as $c) echo country_card($c); ?></div>
 </div>
</section>
<section class="sec sand">
 <div class="wrap map-grid">
  <div class="map-box reveal"><?= map_svg('africa', ['label' => t('home.map_title')]) ?>
   <?php foreach (COUNTRY_IDS as $c): ?><a class="map-label ml-<?= e($c) ?>" href="<?= e(u($c)) ?>"><?= e(country_name($c)) ?></a><?php endforeach; ?>
  </div>
  <div class="reveal">
   <h2><?= te('mission.countries_title') ?></h2>
   <p class="lead"><?= te('mission.countries') ?></p>
   <?php foreach (COUNTRY_IDS as $c): ?>
    <h3><a href="<?= e(u($c)) ?>"><?= e(country_name($c)) ?></a></h3><p><?= te("country.$c.lead") ?></p>
   <?php endforeach; ?>
  </div>
 </div>
</section>
<?= donate_band(t('home.intro_title'), t('home.hero_text')) ?>
<?php page_foot();
