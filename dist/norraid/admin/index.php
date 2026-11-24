<?php
require __DIR__ . '/inc.php';
require_login();
$org = org();
$stats = nr_load('stats');
$stale = array_filter($stats, fn($s) => ($s['status'] ?? '') === 'published' && (empty($s['verified']) || strtotime((string)$s['verified']) < strtotime('-120 days')));
$subs = nr_load('subscribers');
$msgs = array_filter(nr_load('messages'), fn($m) => ($m['status'] ?? '') === 'new');
$don = nr_load('donations');
$intents30 = count(array_filter($don, fn($d) => ($d['type'] ?? '') === 'intent' && strtotime((string)($d['at'] ?? '')) > strtotime('-30 days')));
$tot = donation_totals();
$ach = achievements();
$draftAch = count(array_filter(nr_load('achievements'), fn($a) => ($a['status'] ?? '') !== 'published'));
$s = settings();
admin_head('Dashboard');
?>
<div class="kpis">
 <div><b><?= count(array_filter($subs, fn($x) => ($x['status'] ?? '') === 'confirmed')) ?></b><span>Confirmed subscribers</span></div>
 <div><b><?= count($msgs) ?></b><span>New messages</span></div>
 <div><b><?= $intents30 ?></b><span>PayPal click-throughs, last 30 days (not money)</span></div>
 <div><b><?= (int)$tot['count'] ?></b><span>Confirmed donations recorded</span></div>
 <div><b><?= count($ach) ?></b><span>Verified impact rows public</span></div>
</div>

<section class="card">
 <h2>Before you go live</h2>
 <ul class="todo">
  <li class="<?= ($org['status'] ?? '') === 'verified' ? 'done' : '' ?>">Legal status: <b><?= e($org['status'] === 'verified' ? 'Verified' : 'Registration details pending verification') ?></b> <?php if (can('org')): ?><a href="org.php">Edit</a><?php endif; ?></li>
  <li class="<?= trim((string)($s['recipient_name'] ?? '')) !== '' ? 'done' : '' ?>">PayPal recipient name shown on the Donate page <?php if (can('settings')): ?><a href="settings.php">Settings</a><?php endif; ?></li>
  <li class="<?= !empty($s['contact_email']) ? 'done' : '' ?>">Contact email: <?= e((string)($s['contact_email'] ?? '—')) ?></li>
  <li class="<?= count(array_filter(media_all(), fn($m) => !empty($m['file']))) === count(media_all()) ? 'done' : '' ?>">Photos stored locally (<?= count(array_filter(media_all(), fn($m) => !empty($m['file']))) ?> of <?= count(media_all()) ?>) <?php if (can('media')): ?><a href="media.php">Media</a><?php endif; ?></li>
  <li class="<?= !$stale ? 'done' : '' ?>">Statistics checked in the last 120 days<?= $stale ? ': ' . count($stale) . ' need a fresh check' : '' ?> <?php if (can('stats')): ?><a href="crud.php?t=stats">Statistics</a><?php endif; ?></li>
  <li class="<?= $draftAch === 0 ? 'done' : '' ?>">Impact rows waiting for verification: <?= $draftAch ?></li>
 </ul>
</section>

<section class="card">
 <h2>House rules</h2>
 <ul class="rules">
  <li>No invented statistics, stories, quotes or photos. Every figure has a source, a year and a verified date.</li>
  <li>Never call the initiative a registered charity and never promise tax deduction until registration is verified.</li>
  <li>Donations are only "confirmed" from PayPal records. Click-throughs are not donations.</li>
  <li>Impact numbers appear only when verified with evidence. The ×30 scenario is an internal planning tool and is never published.</li>
 </ul>
</section>
<?php admin_foot();
