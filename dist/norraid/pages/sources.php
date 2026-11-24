<?php
page_head(['path' => 'sources', 'title' => t('sources.title'), 'description' => t('sources.lead')]);
$src = sources();
?>
<section class="page-hero plain"><div class="wrap ph-inner"><p class="eyebrow"><?= icon('doc', 'ic sm') ?> NORRAID AFRICA</p><h1><?= te('sources.title') ?></h1><p class="lead"><?= te('sources.lead') ?></p></div></section>
<section class="sec pt0">
 <div class="wrap intro-grid">
  <div class="reveal">
   <h2><?= te('cat.in_need') ?> · <?= te('cat.targeted') ?> · <?= te('cat.reached') ?></h2>
   <dl class="defs"><?php foreach (STAT_CATEGORIES as $c): ?><dt><span class="cat-dot cat-<?= e($c) ?>"></span><?= te('cat.' . $c) ?></dt><dd><?= te('cat.' . $c . '_def') ?></dd><?php endforeach; ?></dl>
  </div>
  <ul class="checks reveal"><?php foreach (tl('sources.rules') as $r): ?><li><?= icon('check', 'ic sm') ?> <?= e($r) ?></li><?php endforeach; ?></ul>
 </div>
 <div class="wrap">
  <h2><?= te('sources.table_title') ?></h2>
  <div class="tbl-wrap"><table class="tbl">
   <thead><tr><th><?= te('sources.col_country') ?></th><th><?= te('sources.col_metric') ?></th><th><?= te('sources.col_cat') ?></th><th><?= te('sources.col_value') ?></th><th><?= te('sources.col_year') ?></th><th><?= te('sources.col_source') ?></th><th><?= te('sources.col_verified') ?></th></tr></thead>
   <tbody>
   <?php foreach (stats() as $s): $so = $src[$s['source']] ?? null; ?>
    <tr><td><?= e(country_name($s['country'])) ?></td><td><?= e(stat_label($s)) ?><?php if (L() === 'en' && ($n = loc($s['note'] ?? ''))): ?><br><small><?= e($n) ?></small><?php endif; ?></td><td><span class="cat-dot cat-<?= e($s['category']) ?>"></span><?= te('cat.' . $s['category']) ?></td><td class="num"><b><?= e(stat_value($s)) ?></b></td><td><?= e((string)$s['year']) ?></td><td><?php if ($so): ?><a href="<?= e($so['url']) ?>" target="_blank" rel="noopener"><?= e($so['org']) ?> — <?= e($so['title']) ?></a><?php endif; ?></td><td><?= e(date_l((string)$s['verified'])) ?></td></tr>
   <?php endforeach; ?>
   </tbody>
  </table></div>
  <h2 id="photos"><?= te('sources.photos_title') ?></h2>
  <ul class="credits">
   <?php foreach (media_all() as $m): if (($m['status'] ?? 'published') !== 'published') continue; ?>
    <li><b><?= e(media_alt($m)) ?></b><br><span class="credit"><?= media_credit($m) ?></span></li>
   <?php endforeach; ?>
  </ul>
 </div>
</section>
<?php page_foot();
