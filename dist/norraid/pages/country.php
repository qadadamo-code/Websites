<?php
$id = $page;
$c = country($id);
$name = country_name($id);
$k = "country.$id";
page_head(['path' => $id, 'title' => $name, 'description' => t("$k.lead"), 'og' => ($m = media($c['hero'])) ? media_url($m) : '', 'body' => 'country-page']);
$hero = media($c['hero']);
$all = stats($id);
?>
<section class="page-hero photo">
 <div class="hero-media"><?= img($c['hero'], 'hero-img', 1600, true) ?><span class="hero-shade"></span></div>
 <div class="wrap ph-inner">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="<?= e(u('')) ?>"><?= te('nav.home') ?></a> / <a href="<?= e(u('countries')) ?>"><?= te('nav.countries') ?></a> / <span aria-current="page"><?= e($name) ?></span></nav>
  <p class="eyebrow light"><span class="dot"></span><?= te("$k.tag") ?></p>
  <h1><?= e($name) ?></h1>
  <p class="hero-text"><?= te("$k.lead") ?></p>
  <div class="hero-ctas"><a class="btn btn-gold btn-lg" href="<?= e(u('donate')) ?>?fund=<?= e($id) ?>"><?= icon('heart', 'ic') ?> <?= te('common.donate_cta') ?></a></div>
 </div>
 <?php if ($hero): ?><p class="hero-credit credit"><?= media_credit($hero) ?></p><?php endif; ?>
</section>

<section class="sec">
 <div class="wrap intro-grid">
  <div class="reveal"><p class="eyebrow">1 · <?= te('countries_page.situation') ?></p><h2><?= te('countries_page.stats_title') ?></h2></div>
  <div class="reveal prose"><?php foreach (tl("$k.intro") as $p): ?><p><?= e($p) ?></p><?php endforeach; ?></div>
 </div>
 <div class="wrap">
  <div class="stat-grid">
   <?php foreach ($all as $s) echo stat_card($s, 'reveal'); ?>
  </div>
  <p class="small center"><a href="<?= e(u('sources')) ?>"><?= icon('doc', 'ic sm') ?> <?= te('common.view_sources') ?></a></p>
 </div>
</section>

<section class="sec sand">
 <div class="wrap map-grid country-map">
  <div class="map-box reveal">
   <?= map_svg($c['map'], ['label' => $name . ' – ' . t('countries_page.map_title')]) ?>
  </div>
  <div class="reveal">
   <p class="eyebrow"><?= icon('pin', 'ic sm') ?> <?= te('countries_page.map_title') ?></p>
   <h2><?= e($name) ?></h2>
   <p class="legend"><span class="lg-sw"></span> <?= te('countries_page.map_legend') ?></p>
   <p><?= te("$k.regions") ?></p>
   <p class="small"><?= te('common.source') ?>: <?php $p = stat_one($id, 'pin'); echo $p ? source_link($p) : ''; ?></p>
  </div>
 </div>
</section>

<section class="sec needs">
 <div class="wrap">
  <?= section_head('2 · ' . t('countries_page.people'), t('countries_page.needs')) ?>
  <?php $i = 0; foreach (['food', 'water', 'health', 'displacement', 'education'] as $sec):
      $mid = $c['sections'][$sec] ?? ''; $i++; ?>
   <article class="need<?= $mid ? '' : ' no-img' ?><?= $i % 2 ? '' : ' rev' ?> reveal">
    <?php if ($mid && media($mid)): ?><?= figure($mid, 'need-img', 900, '(max-width:800px) 100vw, 45vw') ?><?php endif; ?>
    <div class="need-body">
     <span class="need-ic"><?= icon($sec === 'education' ? 'education' : $sec) ?></span>
     <h3><?= te('countries_page.' . $sec) ?></h3>
     <p><?= te("$k.$sec") ?></p>
    </div>
   </article>
  <?php endforeach; ?>
 </div>
</section>

<?php $st = stories($id); if ($st): ?>
<section class="sec sand">
 <div class="wrap">
  <?= section_head(t('common.third_party'), t('countries_page.stories')) ?>
  <div class="story-grid"><?php foreach ($st as $s) echo story_card($s); ?></div>
 </div>
</section>
<?php endif; ?>

<section class="sec">
 <div class="wrap prio-wrap">
  <?= section_head('3 · ' . t('countries_page.response'), t('countries_page.priorities'), t('countries_page.priorities_note')) ?>
  <ul class="prio-list">
   <?php foreach (tl("$k.priorities") as $p): ?><li class="reveal"><?= e($p) ?></li><?php endforeach; ?>
  </ul>
  <div class="impact-mini reveal">
   <h3><?= icon('chart', 'ic sm') ?> <?= te('home.impact_title') ?></h3>
   <p><a href="<?= e(u('impact')) ?>"><?= te('impact.title') ?> <?= icon('arrow', 'ic sm') ?></a></p>
  </div>
 </div>
</section>

<section class="sec gallery-sec">
 <div class="wrap gallery">
  <?php foreach ($c['gallery'] as $g) echo figure($g, 'g-item reveal', 900, '(max-width:800px) 100vw, 33vw'); ?>
 </div>
</section>

<?= donate_band(t('countries_page.donate_title', ['country' => $name]), t('countries_page.donate_text', ['country' => $name]), $id) ?>
<?php page_foot();
