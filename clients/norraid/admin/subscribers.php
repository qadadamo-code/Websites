<?php
require __DIR__ . '/inc.php';
require_perm('subscribers');
csrf_check();
if (is_post() && p('act') === 'delete') {
    $em = strtolower((string)p('email'));
    admin_tx('subscribers', function (&$l) use ($em) { $l = array_values(array_filter($l, fn($s) => strtolower($s['email']) !== $em)); }, 'delete', preg_replace('/(^.).*(@.*$)/', '$1***$2', $em), 'erasure');
    flash('Subscriber erased.');
    go('subscribers.php');
}
$subs = nr_load('subscribers');
$by = array_count_values(array_map(fn($s) => (string)($s['status'] ?? ''), $subs));
$q = mb_strtolower(trim((string)($_GET['q'] ?? '')));
$list = $q === '' ? $subs : array_filter($subs, fn($s) => str_contains(mb_strtolower($s['email']), $q));
admin_head('Subscribers');
?>
<p class="intro">Double opt-in: only "confirmed" people receive emails. Every email carries an unsubscribe link. Use Erase for GDPR deletion requests.</p>
<div class="kpis"><div><b><?= (int)($by['confirmed'] ?? 0) ?></b><span>Confirmed</span></div><div><b><?= (int)($by['pending'] ?? 0) ?></b><span>Waiting for confirmation</span></div><div><b><?= (int)($by['unsubscribed'] ?? 0) ?></b><span>Unsubscribed</span></div></div>
<div class="toolbar"><form method="get"><input type="search" name="q" value="<?= e((string)($_GET['q'] ?? '')) ?>" placeholder="Search email"><button class="btn ghost">Search</button></form><a class="btn ghost" href="export.php?what=subscribers&_csrf=<?= e(csrf()) ?>">Export confirmed (CSV)</a></div>
<div class="table-wrap"><table class="tbl"><thead><tr><th>Email</th><th>Language</th><th>Status</th><th>Requested</th><th>Confirmed</th><th></th></tr></thead><tbody>
<?php foreach (array_slice(array_values($list), 0, 300) as $s): ?><tr><td><?= e($s['email']) ?></td><td><?= e(strtoupper((string)($s['lang'] ?? ''))) ?></td><td><?= badge((string)($s['status'] ?? '')) ?></td><td><?= e(substr((string)($s['requested_at'] ?? ''), 0, 10)) ?></td><td><?= e(substr((string)($s['confirmed_at'] ?? ''), 0, 10)) ?></td>
<td><form method="post" data-confirm="Erase this person completely?"><?= csrf_field() ?><input type="hidden" name="act" value="delete"><input type="hidden" name="email" value="<?= e($s['email']) ?>"><button class="linkbtn">Erase</button></form></td></tr><?php endforeach; ?>
<?php if (!$list): ?><tr><td colspan="6" class="muted">No subscribers yet.</td></tr><?php endif; ?>
</tbody></table></div>
<?php admin_foot();
