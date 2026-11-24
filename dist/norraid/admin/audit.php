<?php
require __DIR__ . '/inc.php';
require_perm('audit');
$log = nr_load('audit');
$q = mb_strtolower(trim((string)($_GET['q'] ?? '')));
if ($q !== '') $log = array_values(array_filter($log, fn($r) => str_contains(mb_strtolower(implode(' ', array_map('strval', $r))), $q)));
$log = array_slice($log, 0, 500);
admin_head('Audit log');
?>
<p class="intro">Every sign-in and every change in the admin, newest first (last 500 shown).</p>
<div class="toolbar"><form method="get"><input type="search" name="q" value="<?= e((string)($_GET['q'] ?? '')) ?>" placeholder="Search user, action, item"><button class="btn ghost">Search</button></form></div>
<div class="table-wrap"><table class="tbl"><thead><tr><th>When</th><th>User</th><th>Action</th><th>Item</th><th>Detail</th></tr></thead><tbody>
<?php foreach ($log as $r): ?><tr><td><?= e(substr((string)$r['at'], 0, 19)) ?></td><td><?= e((string)$r['user']) ?></td><td><?= badge((string)$r['action']) ?></td><td><?= e((string)$r['target']) ?></td><td><?= e((string)$r['detail']) ?></td></tr><?php endforeach; ?>
</tbody></table></div>
<?php admin_foot();
