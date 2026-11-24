<?php
page_head(['path' => 'impact', 'title' => t('impact.title'), 'description' => t('impact.lead')]);
$tot = impact_headline();
?>
<section class="page-hero plain">
 <div class="wrap ph-inner"><p class="eyebrow"><?= icon('chart', 'ic sm') ?> <?= te('nav.impact') ?></p><h1><?= te('impact.title') ?></h1><p class="lead"><?= te('impact.lead') ?></p></div>
</section>
<section class="sec pt0">
 <div class="wrap">
  <div class="impact-box reveal">
   <div class="metric-grid">
    <?php foreach (IMPACT_METRICS as $m): ?>
     <div class="metric<?= $tot ? '' : ' empty' ?>"><b<?= $tot ? ' data-count="' . (int)$tot[$m] . '"' : '' ?>><?= $tot ? e(num($tot[$m])) : '—' ?></b><span><?= te('imetric.' . $m) ?></span><?php if (!$tot): ?><small><?= te('common.coming_soon') ?></small><?php endif; ?></div>
    <?php endforeach; ?>
   </div>
  </div>
<?php if (!$tot): ?>
  <div class="soon reveal">
   <?= logo_mark('soon-mark') ?>
   <h2><?= te('impact.soon_title') ?></h2>
   <p class="lead"><?= te('impact.soon_text') ?></p>
  </div>
<?php else: ?>
  <?php foreach (COUNTRY_IDS as $c): $list = achievements($c); if (!$list) continue; ?>
   <section class="country-dash reveal" id="<?= e($c) ?>">
    <h2><?= e(country_name($c)) ?> — <?= te('impact.country_dash') ?></h2>
    <?php if (!$list): ?><p><?= te('impact.none_country') ?></p><?php else: $ct = impact_totals($c); ?>
     <div class="bars" role="list">
      <?php $max = max(1, max($ct)); foreach ($ct as $mk => $v): if (!$v) continue; ?>
       <div class="bar" role="listitem"><span><?= te('imetric.' . $mk) ?></span><i style="--w:<?= round($v / $max * 100) ?>%"></i><b><?= e(num($v)) ?></b></div>
      <?php endforeach; ?>
     </div>
     <h3><?= te('impact.timeline') ?></h3>
     <ol class="timeline">
      <?php foreach ($list as $a): ?>
       <li><b><?= e(loc($a['title'] ?? '')) ?></b> — <?= e(num((float)$a['value'])) ?> <?= te('imetric.' . ($a['metric'] ?? '')) ?>
        <br><small><?= te('impact.period') ?>: <?= e(date_l((string)$a['period_start'])) ?> – <?= e(date_l((string)$a['period_end'])) ?> · <?= te('impact.location') ?>: <?= e((string)($a['location'] ?? '')) ?><?php if (!empty($a['spent'])): ?> · <?= te('impact.spent') ?>: €<?= e(num((float)$a['spent'])) ?><?php endif; ?></small>
        <?php if (!empty($a['evidence'])): ?><br><a href="<?= e(nr_base() . 'uploads/docs/' . rawurlencode(basename((string)$a['evidence']))) ?>"><?= icon('doc', 'ic sm') ?> <?= te('impact.evidence') ?></a><?php endif; ?>
        <?php if (!empty($a['photo']) && media($a['photo'])): ?><?= figure($a['photo'], 'ach-photo', 900) ?><?php endif; ?>
       </li>
      <?php endforeach; ?>
     </ol>
    <?php endif; ?>
   </section>
  <?php endforeach; ?>
<?php endif; ?>
 </div>
</section>
<section class="sec sand">
 <div class="wrap">
  <?= section_head(t('nav.impact'), t('impact.planned_title'), t('home.programs_text')) ?>
  <div class="prog-grid"><?php foreach (tl('home.programs') as $p): ?><article class="prog reveal"><span class="prog-ic"><?= icon($p['k']) ?></span><h3><?= e($p['t']) ?></h3><p><?= e($p['d']) ?></p></article><?php endforeach; ?></div>
 </div>
</section>
<section class="sec">
 <div class="wrap intro-grid">
  <div class="reveal"><h2><?= te('impact.method_title') ?></h2></div>
  <ul class="checks reveal"><?php foreach (tl('impact.method') as $p): ?><li><?= icon('check', 'ic sm') ?> <?= e($p) ?></li><?php endforeach; ?></ul>
 </div>
 <?php $reps = documents('report'); if ($reps): ?>
 <div class="wrap"><h2><?= te('impact.reports') ?></h2><ul class="docs"><?php foreach ($reps as $d): ?><li><a href="<?= e(nr_base() . 'uploads/docs/' . rawurlencode(basename((string)$d['file']))) ?>"><?= icon('doc', 'ic') ?> <?= e(loc($d['title'] ?? '')) ?></a></li><?php endforeach; ?></ul></div>
 <?php endif; ?>
</section>
<?= newsletter_block() ?>
<?php page_foot();
