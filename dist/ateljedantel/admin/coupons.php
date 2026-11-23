<?php
require __DIR__ . '/inc.php';
require_perm('coupons.edit');
if (posted()) {
    $act = p('act'); $cid = p('id');
    if ($act === 'delete') { ad_tx('coupons', function (&$d) use ($cid) { $d = array_values(array_filter($d, fn($c) => $c['id'] !== $cid)); }); log_act(L('Raderade rabattkod', 'Deleted discount code'), $cid); flash(L('Rabattkoden är raderad', 'The code was deleted')); go('coupons.php'); }
    if ($act === 'toggle') { ad_tx('coupons', function (&$d) use ($cid) { foreach ($d as &$c) if ($c['id'] === $cid) $c['active'] = empty($c['active']); }); flash(L('Uppdaterad', 'Updated')); go('coupons.php'); }
    $code = strtoupper(preg_replace('/[^A-Za-z0-9_-]/', '', p('code')));
    $dup = false; foreach (ad_load('coupons') as $c) if ($c['id'] !== $cid && strtoupper($c['code']) === $code) $dup = true;
    if ($code === '' || $dup) { flash($dup ? L('Koden finns redan', 'The code already exists') : L('Ange en kod', 'Enter a code'), 'bad'); go('coupons.php?id=' . urlencode($cid ?: 'new')); }
    $type = p('type') === 'fixed' ? 'fixed' : 'percent'; $val = max(0, pnum('value')); if ($type === 'percent') $val = min(100, $val);
    $row = ['code' => $code, 'type' => $type, 'value' => $val, 'min' => max(0, pnum('min')), 'from' => pdate('from'), 'to' => pdate('to'), 'limit' => max(0, (int)pnum('limit')), 'active' => !empty($_POST['active']), 'note' => clean(p('note'), 200)];
    ad_tx('coupons', function (&$d) use ($cid, $row) { foreach ($d as &$c) if ($c['id'] === $cid) { $c = array_merge($c, $row); return; } unset($c); $d[] = $row + ['id' => ad_id('c'), 'uses' => 0]; });
    log_act(L('Sparade rabattkod', 'Saved discount code'), $code); flash(L('Rabattkoden är sparad', 'The code is saved')); go('coupons.php');
}
$all = ad_load('coupons');
$edit = null; foreach ($all as $c) if ($c['id'] === ($_GET['id'] ?? '')) $edit = $c;
$state = function ($c) { if (empty($c['active'])) return ['off', L('Inaktiv', 'Inactive')]; if (!in_window(($c['from'] ?? '') ?: null, ($c['to'] ?? '') ?: null)) return ['warn', L('Utanför datum', 'Out of dates')]; if (!empty($c['limit']) && $c['uses'] >= $c['limit']) return ['warn', L('Förbrukad', 'Used up')]; return ['on', L('Aktiv', 'Active')]; };
admin_head(L('Rabattkoder', 'Discount codes'), 'coupons', '<a class="b" href="?id=new">' . icon('plus') . ' ' . L('Ny rabattkod', 'New code') . '</a>');
?>
<div class="cols">
  <div class="card" style="padding:0">
    <?php if (!$all): ?><p class="muted empty"><?= L('Inga rabattkoder ännu.', 'No discount codes yet.') ?></p><?php else: ?>
    <table class="t"><thead><tr><th><?= L('Kod', 'Code') ?></th><th><?= L('Rabatt', 'Discount') ?></th><th class="hide-sm"><?= L('Använd', 'Used') ?></th><th>Status</th><th></th></tr></thead><tbody>
    <?php foreach ($all as $c): [$k, $lbl] = $state($c); ?><tr>
      <td><a class="rowlink" href="?id=<?= e($c['id']) ?>"><code><?= e($c['code']) ?></code></a><?php if ($c['note']): ?><br><small class="muted"><?= e($c['note']) ?></small><?php endif; ?></td>
      <td><?= $c['type'] === 'fixed' ? money($c['value']) : e((float)$c['value'] . ' %') ?><?= $c['min'] ? '<br><small class="muted">' . L('från', 'from') . ' ' . money($c['min']) . '</small>' : '' ?></td>
      <td class="hide-sm"><?= (int)$c['uses'] ?><?= $c['limit'] ? ' / ' . (int)$c['limit'] : '' ?><?= ($c['from'] || $c['to']) ? '<br><small class="muted">' . e($c['from'] . ' – ' . $c['to']) . '</small>' : '' ?></td>
      <td><span class="st st--<?= $k ?>"><?= e($lbl) ?></span></td>
      <td><form method="post" class="acts"><?= csrf_field() ?><input type="hidden" name="id" value="<?= e($c['id']) ?>"><button class="b b--ghost b--sm" name="act" value="toggle"><?= empty($c['active']) ? L('Aktivera', 'Activate') : L('Pausa', 'Pause') ?></button><button class="b b--ghost b--icon b--sm" name="act" value="delete" data-confirm="<?= L('Radera rabattkoden?', 'Delete the code?') ?>"><?= icon('trash') ?></button></form></td>
    </tr><?php endforeach; ?>
    </tbody></table><?php endif; ?>
  </div>
  <div>
    <?php if ($edit || ($_GET['id'] ?? '') === 'new'): $c = $edit ?: ['id' => '', 'code' => '', 'type' => 'percent', 'value' => 10, 'min' => 0, 'from' => '', 'to' => '', 'limit' => 0, 'active' => true, 'note' => '']; ?>
    <form method="post" class="card"><?= csrf_field() ?><input type="hidden" name="id" value="<?= e($c['id']) ?>"><input type="hidden" name="act" value="save">
      <h3><?= $edit ? L('Redigera', 'Edit') . ' ' . e($c['code']) : L('Ny rabattkod', 'New discount code') ?></h3>
      <label><?= L('Kod', 'Code') ?><input name="code" value="<?= e($c['code']) ?>" required style="text-transform:uppercase" placeholder="BAL2027"></label>
      <div class="grid2">
        <label><?= L('Typ', 'Type') ?><select name="type"><option value="percent" <?= sel($c['type'], 'percent') ?>><?= L('Procent', 'Percent') ?></option><option value="fixed" <?= sel($c['type'], 'fixed') ?>><?= L('Fast belopp (kr)', 'Fixed amount (kr)') ?></option></select></label>
        <label><?= L('Värde', 'Value') ?><input name="value" value="<?= e($c['value']) ?>" inputmode="decimal"></label>
        <label><?= L('Minsta köp (kr)', 'Minimum order (kr)') ?><input name="min" value="<?= e($c['min']) ?>" inputmode="decimal"></label>
        <label><?= L('Max antal användningar (0 = obegränsat)', 'Max uses (0 = unlimited)') ?><input name="limit" value="<?= e($c['limit']) ?>" inputmode="numeric"></label>
        <label><?= L('Gäller från', 'Valid from') ?><input type="date" name="from" value="<?= e($c['from']) ?>"></label>
        <label><?= L('Gäller till', 'Valid to') ?><input type="date" name="to" value="<?= e($c['to']) ?>"></label>
      </div>
      <label><?= L('Intern notering', 'Internal note') ?><input name="note" value="<?= e($c['note']) ?>"></label>
      <label class="chk"><input type="checkbox" name="active" value="1" <?= checked($c['active']) ?>> <?= L('Aktiv', 'Active') ?></label>
      <div class="row"><button class="b"><?= L('Spara', 'Save') ?></button><a class="b b--ghost" href="coupons.php"><?= L('Avbryt', 'Cancel') ?></a></div>
    </form>
    <?php else: ?><div class="card"><p class="muted"><?= L('Kunden anger koden i kassan. Rabatten räknas alltid om på servern, och antal användningar räknas automatiskt.', 'The customer enters the code at checkout. The discount is always recalculated on the server and uses are counted automatically.') ?></p></div><?php endif; ?>
  </div>
</div>
<?php admin_foot(); ?>
