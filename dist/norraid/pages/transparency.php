<?php
page_head(['path' => 'transparency', 'title' => t('transparency.title'), 'description' => t('transparency.lead')]);
$o = org();
$ver = org_verified();
$pend = '<span class="pending">' . te('common.pending') . '</span>';
$f = fn($k) => ($ver && !empty($o[$k])) ? e((string)$o[$k]) : $pend;
$rname = trim((string)setting('recipient_name'));
$tot = donation_totals();
?>
<section class="page-hero plain">
 <div class="wrap ph-inner"><p class="eyebrow"><?= icon('protection', 'ic sm') ?> NORRAID AFRICA</p><h1><?= te('transparency.title') ?></h1><p class="lead"><?= te('transparency.lead') ?></p>
  <div class="status-pill<?= $ver ? ' ok' : '' ?>"><span class="pulse"></span><?= $ver ? te('transparency.status_verified') : te('transparency.status_pending') ?></div></div>
</section>
<section class="sec pt0">
 <div class="wrap t-grid">
  <section class="t-card reveal"><h2><?= icon('doc', 'ic') ?> <?= te('transparency.legal_title') ?></h2>
   <dl class="facts">
    <dt><?= te('transparency.f_name') ?></dt><dd><?= $f('legal_name') ?></dd>
    <dt><?= te('transparency.f_number') ?></dt><dd><?= $f('org_number') ?></dd>
    <dt><?= te('transparency.f_authority') ?></dt><dd><?= $f('authority') ?></dd>
    <dt><?= te('transparency.f_date') ?></dt><dd><?= $f('registration_date') ?></dd>
    <dt><?= te('transparency.f_address') ?></dt><dd><?= $f('address') ?></dd>
    <dt><?= te('transparency.f_rep') ?></dt><dd><?= $f('representative') ?></dd>
    <dt><?= te('transparency.f_email') ?></dt><dd><?= $f('email') ?></dd>
    <dt><?= te('transparency.f_approvals') ?></dt><dd><?= $f('approvals') ?></dd>
    <dt><?= te('transparency.f_90') ?></dt><dd><?= ($ver && !empty($o['ninety_account'])) ? '✓' : te('transparency.no_90') ?></dd>
   </dl>
  </section>
  <section class="t-card reveal"><h2><?= icon('lock', 'ic') ?> <?= te('transparency.recipient_title') ?></h2>
   <dl class="facts">
    <dt><?= te('transparency.recipient_type') ?></dt><dd><?= te('transparency.personal_account') ?></dd>
    <dt><?= te('transparency.recipient_name') ?></dt><dd><?= $rname !== '' ? e($rname) : te('donate.recipient_pending') ?></dd>
    <dt>PayPal</dt><dd><?= te('donate.secure') ?></dd>
   </dl>
   <p class="small"><?= te('donate.no_tax') ?> <?= te('donate.not_charity') ?></p>
   <?php if (setting('show_public_totals') && $tot['count']): ?><h3><?= te('transparency.totals_title') ?></h3><p><?= te('transparency.totals_text', ['count' => num($tot['count']), 'sum' => '€' . num($tot['sum'], 2)]) ?></p><?php endif; ?>
  </section>
  <section class="t-card reveal"><h2><?= icon('chart', 'ic') ?> <?= te('transparency.expenditure_title') ?></h2>
   <?php $ach = achievements(); $spent = array_sum(array_map(fn($a) => (float)($a['spent'] ?? 0), $ach)); ?>
   <?php if (!$spent): ?><p><?= te('transparency.expenditure_none') ?></p><?php else: ?>
    <table class="tbl"><thead><tr><th><?= te('sources.col_country') ?></th><th><?= te('impact.period') ?></th><th><?= te('impact.spent') ?></th></tr></thead><tbody>
    <?php foreach ($ach as $a): if (empty($a['spent'])) continue; ?><tr><td><?= e(country_name((string)$a['country'])) ?> — <?= e(loc($a['title'] ?? '')) ?></td><td><?= e((string)$a['period_start']) ?> – <?= e((string)$a['period_end']) ?></td><td>€<?= e(num((float)$a['spent'], 2)) ?></td></tr><?php endforeach; ?>
    </tbody></table>
   <?php endif; ?>
  </section>
  <section class="t-card reveal"><h2><?= icon('doc', 'ic') ?> <?= te('transparency.statements_title') ?></h2>
   <?php $st = documents('statement'); if (!$st): ?><p><?= te('transparency.statements_none') ?></p><?php else: ?><ul class="docs"><?php foreach ($st as $d): ?><li><a href="<?= e(nr_base() . 'uploads/docs/' . rawurlencode(basename((string)$d['file']))) ?>"><?= icon('doc', 'ic sm') ?> <?= e(loc($d['title'] ?? '')) ?></a></li><?php endforeach; ?></ul><?php endif; ?>
  </section>
  <section class="t-card reveal"><h2><?= icon('globe', 'ic') ?> <?= te('transparency.partners_title') ?></h2>
   <?php $pa = documents('partner'); if (!$pa): ?><p><?= te('transparency.partners_none') ?></p><?php else: ?><ul class="docs"><?php foreach ($pa as $d): ?><li><?= e(loc($d['title'] ?? '')) ?></li><?php endforeach; ?></ul><?php endif; ?>
  </section>
  <section class="t-card reveal"><h2><?= icon('protection', 'ic') ?> <?= te('transparency.gov_title') ?></h2>
   <ul class="checks"><?php foreach (tl('mission.gov') as $p): ?><li><?= icon('check', 'ic sm') ?> <?= e($p) ?></li><?php endforeach; ?></ul>
  </section>
 </div>
 <div class="wrap">
  <section class="t-card wide reveal"><h2><?= icon('doc', 'ic') ?> <?= te('transparency.docs_title') ?></h2>
   <?php $all = documents(); if (!$all): ?><p><?= te('transparency.docs_none') ?></p><?php else: ?>
   <ul class="docs"><?php foreach ($all as $d): ?><li><a href="<?= e(nr_base() . 'uploads/docs/' . rawurlencode(basename((string)$d['file']))) ?>"><?= icon('doc', 'ic sm') ?> <?= e(loc($d['title'] ?? '')) ?></a> <small><?= e((string)($d['date'] ?? '')) ?></small></li><?php endforeach; ?></ul><?php endif; ?>
   <p><a href="<?= e(u('sources')) ?>"><?= te('common.view_sources') ?></a> · <a href="<?= e(u('donation-policy')) ?>"><?= te('footer.donation_policy') ?></a> · <a href="<?= e(u('contact')) ?>"><?= te('transparency.contact_title') ?></a></p>
  </section>
 </div>
</section>
<?php page_foot();
