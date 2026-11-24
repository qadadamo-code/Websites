<?php
page_head(['path' => '', 'body' => 'home']);
$pins = [];
foreach (COUNTRY_IDS as $c) if ($s = stat_one($c, 'pin')) $pins[$c] = $s;
$hero = media('hero_water');
?>
<section class="hero">
 <div class="hero-media"><?= img('hero_water', 'hero-img', 1600, true) ?><span class="hero-shade"></span></div>
 <div class="wrap hero-inner">
  <div class="hero-copy">
   <p class="eyebrow light"><span class="dot"></span><?= te('home.eyebrow') ?></p>
   <h1><?= te('home.hero_title') ?></h1>
   <p class="hero-text"><?= te('home.hero_text') ?></p>
   <div class="hero-ctas">
    <a class="btn btn-gold btn-lg" href="<?= e(u('donate')) ?>"><?= icon('heart', 'ic') ?> <?= te('home.hero_cta') ?></a>
    <a class="btn btn-ghost btn-lg" href="<?= e(u('countries')) ?>"><?= te('home.hero_cta2') ?> <?= icon('arrow', 'ic') ?></a>
   </div>
  </div>
  <aside class="hero-card" aria-label="<?= te('home.card_title') ?>">
   <div class="hc-top"><?= logo_mark('hc-mark') ?><span>NORRAID AFRICA</span><span class="hc-year">2026</span></div>
   <h2><?= te('home.card_title') ?></h2>
   <ul class="hc-list">
    <?php foreach ($pins as $c => $s): ?>
     <li><a href="<?= e(u($c)) ?>"><span><?= e(country_name($c)) ?></span><b><?= e(stat_value($s)) ?></b></a></li>
    <?php endforeach; ?>
   </ul>
   <p class="hc-note"><?= te('home.card_note') ?> <a href="<?= e(u('sources')) ?>"><?= te('common.sources') ?></a></p>
   <a class="btn btn-forest btn-block" href="<?= e(u('donate')) ?>"><?= te('common.donate_cta') ?></a>
  </aside>
 </div>
 <?php if ($hero): ?><p class="hero-credit credit"><?= media_credit($hero) ?></p><?php endif; ?>
</section>

<section class="intro sec">
 <div class="wrap intro-grid">
  <div class="reveal">
   <p class="eyebrow"><?= te('nav.mission') ?></p>
   <h2 class="display"><?= te('home.intro_title') ?></h2>
  </div>
  <div class="reveal">
   <p class="lead"><?= te('home.intro_text') ?></p>
   <p><a class="btn btn-forest" href="<?= e(u('donate')) ?>"><?= te('home.intro_cta') ?> <?= icon('arrow', 'ic sm') ?></a></p>
  </div>
 </div>
</section>

<section class="sec countries-sec" id="countries">
 <div class="wrap">
  <?= section_head(t('home.eyebrow'), t('home.countries_title'), t('home.countries_text')) ?>
  <div class="country-grid">
   <?php foreach (COUNTRY_IDS as $c) echo country_card($c); ?>
  </div>
 </div>
</section>

<section class="sec map-sec">
 <div class="wrap map-grid">
  <div class="map-box reveal"><?= map_svg('africa', ['label' => t('home.map_title')]) ?>
   <?php foreach (COUNTRY_IDS as $c): ?><a class="map-label ml-<?= e($c) ?>" href="<?= e(u($c)) ?>"><?= e(country_name($c)) ?></a><?php endforeach; ?>
  </div>
  <div class="reveal">
   <p class="eyebrow"><?= icon('pin', 'ic sm') ?> <?= te('home.map_title') ?></p>
   <h2><?= te('home.map_text') ?></h2>
   <ul class="map-list">
    <?php foreach (COUNTRY_IDS as $c): $p = $pins[$c] ?? null; ?>
     <li><a href="<?= e(u($c)) ?>"><span class="ml-dot"></span><b><?= e(country_name($c)) ?></b><span><?= $p ? e(stat_value($p)) . ' ' . te('cat.in_need') : '' ?></span><?= icon('arrow', 'ic sm') ?></a></li>
    <?php endforeach; ?>
   </ul>
  </div>
 </div>
</section>

<section class="sec stats-sec dark">
 <div class="wrap">
  <?= section_head('', t('home.stats_title'), t('home.stats_text'), 'light') ?>
  <div class="stats-table reveal" role="table" aria-label="<?= te('home.stats_title') ?>">
   <div class="st-row st-head" role="row">
    <span role="columnheader"></span>
    <?php foreach (['in_need', 'targeted'] as $cat): ?>
     <span role="columnheader"><b><?= te('cat.' . $cat) ?></b><small><?= te('cat.' . $cat . '_def') ?></small></span>
    <?php endforeach; ?>
   </div>
   <?php foreach (COUNTRY_IDS as $c): ?>
    <div class="st-row" role="row">
     <span role="rowheader" class="st-country"><a href="<?= e(u($c)) ?>"><?= e(country_name($c)) ?></a></span>
     <?php foreach (['in_need', 'targeted'] as $cat): $s = stats($c, $cat)[0] ?? null; ?>
      <span role="cell" data-label="<?= te('cat.' . $cat) ?>"><?php if ($s): ?><b class="num"><?= e(stat_value($s)) ?></b><small><?= source_link($s) ?> · <?= e((string)$s['year']) ?></small><?php else: ?>—<?php endif; ?></span>
     <?php endforeach; ?>
    </div>
   <?php endforeach; ?>
  </div>
  <p class="center"><a class="btn btn-ghost" href="<?= e(u('sources')) ?>"><?= icon('doc', 'ic sm') ?> <?= te('common.view_sources') ?></a></p>
 </div>
</section>

<section class="sec how-sec">
 <div class="wrap">
  <?= section_head(t('nav.transparency'), t('home.how_title'), t('home.how_text')) ?>
  <ol class="how-steps">
   <?php foreach (tl('home.how_steps') as $i => $st): ?>
    <li class="reveal"><span class="how-n"><?= $i + 1 ?></span><h3><?= e($st['t']) ?></h3><p><?= e($st['d']) ?></p></li>
   <?php endforeach; ?>
  </ol>
  <p class="notice reveal"><?= icon('info', 'ic') ?> <span><?= te('home.how_note') ?> <a href="<?= e(u('donation-policy')) ?>"><?= te('donate.policy_link') ?></a></span></p>
 </div>
</section>

<section class="sec stories-sec sand">
 <div class="wrap">
  <?= section_head(t('common.third_party'), t('home.stories_title'), t('home.stories_text')) ?>
  <div class="story-grid">
   <?php foreach (stories(null, 3) as $s) echo story_card($s); ?>
  </div>
  <p class="center"><a class="btn btn-forest" href="<?= e(u('stories')) ?>"><?= te('stories.all') ?> <?= icon('arrow', 'ic sm') ?></a></p>
 </div>
</section>

<section class="sec programs-sec">
 <div class="wrap">
  <?= section_head(t('common.planned'), t('home.programs_title'), t('home.programs_text')) ?>
  <div class="prog-grid">
   <?php foreach (tl('home.programs') as $p): ?>
    <article class="prog reveal"><span class="prog-ic"><?= icon($p['k']) ?></span><h3><?= e($p['t']) ?></h3><p><?= e($p['d']) ?></p></article>
   <?php endforeach; ?>
  </div>
 </div>
</section>

<section class="sec impact-sec">
 <div class="wrap">
  <div class="impact-box reveal">
   <div class="ib-head">
    <p class="eyebrow"><?= icon('chart', 'ic sm') ?> <?= te('nav.impact') ?></p>
    <h2><?= te('home.impact_title') ?></h2>
    <p><?= te('home.impact_text') ?></p>
   </div>
   <?php $tot = impact_headline(); ?>
   <div class="metric-grid">
    <?php foreach (IMPACT_METRICS as $m): ?>
     <div class="metric<?= $tot ? '' : ' empty' ?>">
      <b<?= $tot ? ' data-count="' . (int)$tot[$m] . '"' : '' ?>><?= $tot ? e(num($tot[$m])) : '—' ?></b>
      <span><?= te('imetric.' . $m) ?></span>
     </div>
    <?php endforeach; ?>
   </div>
  </div>
 </div>
</section>

<?= newsletter_block() ?>
<?php page_foot();
