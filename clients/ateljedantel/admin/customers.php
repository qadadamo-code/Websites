<?php
require __DIR__ . '/inc.php';
require_perm('customers.view');
if (posted()) {
    need('customers.edit');
    $act = p('act'); $cid = p('id');
    if ($act === 'save') {
        ad_tx('customers', function (&$d) use ($cid) { foreach ($d as &$c) if ($c['id'] === $cid) { $c['name'] = clean(p('name'), 80); $c['phone'] = clean(p('phone'), 30); $c['note'] = clean(p('note'), 2000); $c['tags'] = array_values(array_filter(array_map(fn($t) => clean($t, 30), explode(',', p('tags'))))); } });
        log_act(L('Sparade kund', 'Saved customer'), $cid); flash(L('Kunden är sparad', 'The customer is saved')); go('customers.php?id=' . urlencode($cid));
    }
    if ($act === 'delete') {
        $em = ''; foreach (ad_load('customers') as $c) if ($c['id'] === $cid) $em = $c['email'];
        ad_tx('customers', function (&$d) use ($cid) { $d = array_values(array_filter($d, fn($c) => $c['id'] !== $cid)); });
        if ($em !== '' && !empty($_POST['all'])) ad_tx('subscribers', function (&$d) use ($em) { $d = array_values(array_filter($d, fn($s) => $s['email'] !== $em)); });
        log_act(L('Raderade kund', 'Deleted customer'), $em); flash(L('Kunden är raderad', 'The customer was deleted')); go('customers.php');
    }
}
$orders = can('orders.view') ? ad_load('orders') : []; $bookings = can('bookings.view') ? ad_load('bookings') : [];
$stats = [];
foreach ($orders as $o) { if ($o['status'] === 'cancelled') continue; $e = strtolower($o['customer']['email']); $stats[$e]['n'] = ($stats[$e]['n'] ?? 0) + 1; $stats[$e]['sum'] = ($stats[$e]['sum'] ?? 0) + (float)$o['total']; }
$subs = array_column(array_filter(ad_load('subscribers'), fn($s) => !empty($s['active'])), 'email');
$all = ad_load('customers');
usort($all, fn($a, $b) => strcmp($b['last'] ?? '', $a['last'] ?? ''));
$src = ['order' => L('Order', 'Order'), 'booking' => L('Bokning', 'Booking'), 'newsletter' => L('Nyhetsbrev', 'Newsletter')];
$view = null; foreach ($all as $c) if ($c['id'] === ($_GET['id'] ?? '')) $view = $c;
if ($view) {
    $em = $view['email'];
    $co = array_filter($orders, fn($o) => strtolower($o['customer']['email']) === $em);
    $cb = array_filter($bookings, fn($b) => strtolower($b['email']) === $em);
    admin_head($view['name'] ?: $view['email'], 'customers', '<a class="b b--ghost" href="customers.php">← ' . L('Kunder', 'Customers') . '</a>');
    ?>
    <div class="cols"><div>
      <div class="kpis" style="grid-template-columns:repeat(3,1fr)"><div class="kpi"><small><?= L('Ordrar', 'Orders') ?></small><b><?= (int)($stats[$em]['n'] ?? 0) ?></b></div><div class="kpi"><small><?= L('Totalt köpt', 'Total spent') ?></small><b><?= money($stats[$em]['sum'] ?? 0) ?></b></div><div class="kpi"><small><?= L('Bokningar', 'Bookings') ?></small><b><?= count($cb) ?></b></div></div>
      <?php if ($co): ?><div class="card"><h3><?= L('Ordrar', 'Orders') ?></h3><ul class="list"><?php foreach ($co as $o): ?><li><a href="order.php?id=<?= e($o['id']) ?>"><?= e($o['ref']) ?></a><span><?= e(fdate($o['at'], false)) ?></span><span><?= money($o['total']) ?></span><?= badge($o['status'], ORDER_ST()) ?></li><?php endforeach; ?></ul></div><?php endif; ?>
      <?php if ($cb): ?><div class="card"><h3><?= L('Bokningar', 'Bookings') ?></h3><ul class="list"><?php foreach ($cb as $b): ?><li><span><?= e($b['typeName']) ?></span><span><?= e($b['date'] . ' ' . $b['time']) ?></span><?= badge($b['status'], BOOK_ST()) ?></li><?php endforeach; ?></ul></div><?php endif; ?>
    </div><div>
      <form method="post" class="card"><?= csrf_field() ?><input type="hidden" name="act" value="save"><input type="hidden" name="id" value="<?= e($view['id']) ?>">
        <h3><?= e($view['email']) ?></h3>
        <p class="muted"><?= L('Kund sedan', 'Customer since') ?> <?= e(fdate($view['created'], false)) ?> · <?= e(implode(', ', array_map(fn($x) => $src[$x] ?? $x, $view['sources'] ?? []))) ?><?= in_array($em, $subs, true) ? ' · ' . L('Prenumererar', 'Subscribed') : '' ?></p>
        <label><?= L('Namn', 'Name') ?><input name="name" value="<?= e($view['name']) ?>"></label>
        <label><?= L('Telefon', 'Phone') ?><input name="phone" value="<?= e($view['phone']) ?>"></label>
        <?php if (!empty($view['address'])): ?><p class="muted"><?= e($view['address'] . ', ' . $view['zip'] . ' ' . $view['city']) ?></p><?php endif; ?>
        <label><?= L('Taggar', 'Tags') ?><input name="tags" value="<?= e(implode(', ', $view['tags'] ?? [])) ?>" placeholder="<?= L('brud 2027, stamkund', 'bride 2027, regular') ?>"></label>
        <label><?= L('Anteckning (mått, önskemål, bröllopsdatum…)', 'Note (measurements, wishes, wedding date…)') ?><textarea name="note" rows="5"><?= e($view['note'] ?? '') ?></textarea></label>
        <?php if (can('customers.edit')): ?><button class="b"><?= L('Spara', 'Save') ?></button><?php endif; ?>
      </form>
      <?php if (can('customers.edit')): ?><form method="post" class="card"><?= csrf_field() ?><input type="hidden" name="act" value="delete"><input type="hidden" name="id" value="<?= e($view['id']) ?>">
        <label class="chk"><input type="checkbox" name="all" value="1" checked> <?= L('Ta även bort från nyhetsbrevet (GDPR)', 'Also remove from the newsletter (GDPR)') ?></label>
        <button class="b b--danger" data-confirm="<?= L('Radera kunden? Ordrar och bokningar finns kvar för bokföringen.', 'Delete the customer? Orders and bookings remain for bookkeeping.') ?>"><?= icon('trash') ?> <?= L('Radera kund', 'Delete customer') ?></button></form><?php endif; ?>
    </div></div>
    <?php admin_foot(); exit;
}
$q = mb_strtolower(trim((string)($_GET['q'] ?? '')));
$rows = array_values(array_filter($all, fn($c) => $q === '' || str_contains(mb_strtolower($c['name'] . ' ' . $c['email'] . ' ' . $c['phone'] . ' ' . implode(' ', $c['tags'] ?? []) . ' ' . ($c['note'] ?? '')), $q)));
if (isset($_GET['export']) && can('export')) {
    export_rows(L('kunder', 'customers'), [L('Namn', 'Name'), L('E-post', 'Email'), L('Telefon', 'Phone'), L('Adress', 'Address'), L('Postnr', 'Zip'), L('Ort', 'City'), L('Ordrar', 'Orders'), L('Totalt', 'Total'), L('Nyhetsbrev', 'Newsletter'), L('Källa', 'Source'), L('Taggar', 'Tags'), L('Skapad', 'Created')],
        array_map(fn($c) => [$c['name'], $c['email'], $c['phone'], $c['address'] ?? '', $c['zip'] ?? '', $c['city'] ?? '', (int)($stats[$c['email']]['n'] ?? 0), (float)($stats[$c['email']]['sum'] ?? 0), in_array($c['email'], $subs, true) ? L('Ja', 'Yes') : '', implode(', ', $c['sources'] ?? []), implode(', ', $c['tags'] ?? []), fdate($c['created'], false)], $rows), $_GET['export'] === 'csv' ? 'csv' : 'xls');
}
[$page, $pager] = paginate($rows, 50);
admin_head(L('Kunder', 'Customers'), 'customers', export_buttons('customers.php?' . http_build_query(array_diff_key($_GET, ['pg' => 1]))));
?>
<form class="filters" method="get"><input type="search" name="q" value="<?= e($_GET['q'] ?? '') ?>" placeholder="<?= L('Sök namn, e-post, telefon, tagg…', 'Search name, email, phone, tag…') ?>"><button class="b b--ghost"><?= icon('search') ?></button><span class="spacer"></span><span class="muted"><?= count($rows) ?> <?= L('kunder', 'customers') ?></span></form>
<?php if (!$page): ?><div class="card empty"><p class="muted"><?= L('Kunder skapas automatiskt från ordrar, bokningar och nyhetsbrev.', 'Customers are created automatically from orders, bookings and the newsletter.') ?></p></div><?php else: ?>
<div class="tbl-wrap card" style="padding:0"><table class="t"><thead><tr><th><?= L('Kund', 'Customer') ?></th><th class="hide-sm"><?= L('Telefon', 'Phone') ?></th><th><?= L('Ordrar', 'Orders') ?></th><th class="hide-sm"><?= L('Källa', 'Source') ?></th><th class="hide-sm"><?= L('Senast', 'Last seen') ?></th></tr></thead><tbody>
<?php foreach ($page as $c): ?><tr><td><a class="rowlink" href="?id=<?= e($c['id']) ?>"><?= e($c['name'] ?: '—') ?></a><br><small class="muted"><?= e($c['email']) ?></small></td><td class="hide-sm"><?= e($c['phone']) ?></td><td><?= (int)($stats[$c['email']]['n'] ?? 0) ?> · <?= money($stats[$c['email']]['sum'] ?? 0) ?></td><td class="hide-sm"><small><?= e(implode(', ', array_map(fn($x) => $src[$x] ?? $x, $c['sources'] ?? []))) ?></small></td><td class="hide-sm"><small><?= e(ago($c['last'] ?? $c['created'])) ?></small></td></tr><?php endforeach; ?>
</tbody></table></div><?php endif; ?>
<?= $pager ?>
<?php admin_foot(); ?>
