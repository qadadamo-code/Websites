<?php
require __DIR__ . '/inc.php';
require_perm('log.view');
$log = ad_load('log');
$undoReqs = []; foreach (ad_load('undo') as $r) if (empty($r['undone'])) $undoReqs[$r['req']][] = $r['file'];
$undone = []; foreach (ad_load('undo') as $r) if (!empty($r['undone'])) $undone[$r['req']] = 1;
$q = mb_strtolower(trim((string)($_GET['q'] ?? ''))); $who = (string)($_GET['u'] ?? '');
$rows = array_values(array_filter($log, fn($l) => ($who === '' || $l['uid'] === $who) && ($q === '' || str_contains(mb_strtolower($l['action'] . ' ' . $l['detail'] . ' ' . $l['name']), $q))));
if (isset($_GET['export']) && can('export')) export_rows(L('logg', 'log'), [L('Tid', 'Time'), L('Användare', 'User'), L('Händelse', 'Action'), L('Detalj', 'Detail')], array_map(fn($l) => [fdate($l['at']), $l['name'], $l['action'], $l['detail']], $rows), $_GET['export'] === 'csv' ? 'csv' : 'xls');
[$page, $pager] = paginate($rows, 60);
$names = []; foreach (users_all() as $u) $names[$u['id']] = $u['name'];
$fileName = ['products' => L('produkter', 'products'), 'orders' => L('ordrar', 'orders'), 'bookings' => L('bokningar', 'bookings'), 'customers' => L('kunder', 'customers'), 'coupons' => L('rabattkoder', 'codes'), 'content' => L('texter', 'texts'), 'settings' => L('inställningar', 'settings'), 'categories' => L('kategorier', 'categories'), 'messages' => L('meddelanden', 'messages'), 'subscribers' => L('nyhetsbrev', 'newsletter')];
admin_head(L('Logg & ångra', 'Log & undo'), 'log', export_buttons('log.php?' . http_build_query(array_diff_key($_GET, ['pg' => 1]))));
?>
<form class="filters" method="get">
  <input type="search" name="q" value="<?= e($_GET['q'] ?? '') ?>" placeholder="<?= L('Sök i loggen…', 'Search the log…') ?>">
  <select name="u" onchange="this.form.submit()"><option value=""><?= L('Alla användare', 'All users') ?></option><?php foreach ($names as $id => $n): ?><option value="<?= e($id) ?>" <?= sel($who, $id) ?>><?= e($n) ?></option><?php endforeach; ?></select>
  <button class="b b--ghost"><?= icon('search') ?></button>
</form>
<p class="hint" style="margin:-4px 0 12px"><?= L('Varje ändring sparas med vem som gjorde den. Klicka Ångra för att återställa just den ändringen – resten av datan påverkas inte.', 'Every change is saved with who made it. Click Undo to restore just that change – the rest of the data is not affected.') ?></p>
<div class="card" style="padding:0"><table class="t"><thead><tr><th><?= L('Tid', 'Time') ?></th><th><?= L('Användare', 'User') ?></th><th><?= L('Händelse', 'Action') ?></th><th></th></tr></thead><tbody>
<?php foreach ($page as $l): $files = $undoReqs[$l['req']] ?? []; ?><tr>
  <td><small title="<?= e(fdate($l['at'])) ?>"><?= e(fdate($l['at'])) ?></small></td>
  <td><?= e($l['name']) ?></td>
  <td><b><?= e($l['action']) ?></b><?= $l['detail'] !== '' ? '<br><small class="muted">' . e($l['detail']) . '</small>' : '' ?><?= $files ? '<br><small class="hint">' . e(implode(', ', array_unique(array_map(fn($f) => $fileName[$f] ?? $f, $files)))) . '</small>' : '' ?></td>
  <td style="text-align:right"><?php if ($files && undo_ok($l['req'])): ?><form method="post" action="undo.php" style="margin:0"><?= csrf_field() ?><input type="hidden" name="req" value="<?= e($l['req']) ?>"><input type="hidden" name="back" value="log.php"><button class="b b--ghost b--sm" data-confirm="<?= L('Ångra den här ändringen?', 'Undo this change?') ?>"><?= icon('undo') ?> <?= L('Ångra', 'Undo') ?></button></form><?php elseif (isset($undone[$l['req']])): ?><small class="muted"><?= L('Ångrad', 'Undone') ?></small><?php endif; ?></td>
</tr><?php endforeach; ?>
<?php if (!$page): ?><tr><td colspan="4" class="muted empty"><?= L('Ingen aktivitet ännu.', 'No activity yet.') ?></td></tr><?php endif; ?>
</tbody></table></div>
<?= $pager ?>
<?php admin_foot(); ?>
