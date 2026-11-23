<?php
require __DIR__ . '/inc.php';
require_perm('orders.view');
if (posted()) {
    need('orders.edit');
    $ids = array_map('strval', (array)($_POST['ids'] ?? [])); $act = p('act'); $n = 0;
    if ($act === 'delete') {
        need('orders.delete');
        ad_tx('orders', function (&$d) use ($ids, &$n) { $before = count($d); $d = array_values(array_filter($d, fn($o) => !in_array($o['id'], $ids, true))); $n = $before - count($d); });
    } elseif ($act === 'paid' || $act === 'unpaid') {
        ad_tx('orders', function (&$d) use ($ids, $act, &$n) { foreach ($d as &$o) if (in_array($o['id'], $ids, true)) { $o['paid'] = $act === 'paid'; $n++; } });
    } elseif (isset(ORDER_ST()[$act])) {
        foreach ($ids as $id) if (order_set_status($id, $act, !empty($_POST['notify']))) $n++;
    }
    if ($n) { log_act(L('Massåtgärd ordrar', 'Bulk order action'), "$act × $n"); flash(L("$n order(s) uppdaterade", "$n order(s) updated")); }
    go('orders.php' . (($q = $_SERVER['QUERY_STRING'] ?? '') ? '?' . $q : ''));
}
$all = ad_load('orders');
$st = (string)($_GET['st'] ?? ''); $q = mb_strtolower(trim((string)($_GET['q'] ?? ''))); $from = (string)($_GET['from'] ?? ''); $to = (string)($_GET['to'] ?? ''); $pay = (string)($_GET['pay'] ?? '');
$rows = array_values(array_filter($all, function ($o) use ($st, $q, $from, $to, $pay) {
    if ($st === 'unpaid') { if (!empty($o['paid']) || $o['status'] === 'cancelled') return false; }
    elseif ($st !== '' && $o['status'] !== $st) return false;
    if ($pay !== '' && $o['pay'] !== $pay) return false;
    $d = substr($o['at'], 0, 10); if ($from && $d < $from) return false; if ($to && $d > $to) return false;
    if ($q !== '') { $c = $o['customer']; $hay = mb_strtolower($o['ref'] . ' ' . $c['name'] . ' ' . $c['email'] . ' ' . $c['phone'] . ' ' . implode(' ', array_column($o['items'], 'title')) . ' ' . implode(' ', array_column($o['items'], 'sku'))); if (!str_contains($hay, $q)) return false; }
    return true;
}));
if (isset($_GET['export']) && can('export')) {
    $out = [];
    foreach ($rows as $o) $out[] = [$o['ref'], fdate($o['at']), $o['customer']['name'], $o['customer']['email'], $o['customer']['phone'], implode(', ', array_map(fn($l) => $l['q'] . '× ' . $l['title'] . ($l['size'] ? " ({$l['size']})" : ''), $o['items'])), (float)$o['subtotal'], (float)$o['discount'], (float)$o['shipping'], (float)$o['total'], PAY_NAMES()[$o['pay']] ?? $o['pay'], !empty($o['paid']) ? L('Ja', 'Yes') : L('Nej', 'No'), ORDER_ST()[$o['status']] ?? $o['status'], $o['ship'] === 'post' ? 'PostNord' : L('Hämtas', 'Pickup')];
    export_rows(L('ordrar', 'orders'), [L('Order', 'Order'), L('Datum', 'Date'), L('Kund', 'Customer'), L('E-post', 'Email'), L('Telefon', 'Phone'), L('Artiklar', 'Items'), L('Delsumma', 'Subtotal'), L('Rabatt', 'Discount'), L('Frakt', 'Shipping'), L('Totalt', 'Total'), L('Betalsätt', 'Payment'), L('Betald', 'Paid'), 'Status', L('Leverans', 'Delivery')], $out, $_GET['export'] === 'csv' ? 'csv' : 'xls');
}
$counts = ['' => count($all)]; foreach ($all as $o) $counts[$o['status']] = ($counts[$o['status']] ?? 0) + 1;
$counts['unpaid'] = count(array_filter($all, fn($o) => empty($o['paid']) && $o['status'] !== 'cancelled'));
[$page, $pager] = paginate($rows, 40);
admin_head(L('Ordrar', 'Orders'), 'orders', export_buttons('orders.php?' . http_build_query(array_diff_key($_GET, ['pg' => 1]))));
?>
<div class="tabs">
  <?php foreach (['' => L('Alla', 'All'), 'new' => ORDER_ST()['new'], 'unpaid' => L('Obetalda', 'Unpaid'), 'confirmed' => ORDER_ST()['confirmed'], 'paid' => ORDER_ST()['paid'], 'shipped' => ORDER_ST()['shipped'], 'ready' => ORDER_ST()['ready'], 'done' => ORDER_ST()['done'], 'cancelled' => ORDER_ST()['cancelled']] as $k => $lbl): $qq = $_GET; $qq['st'] = $k; unset($qq['pg']); ?>
  <a href="?<?= e(http_build_query($qq)) ?>" class="<?= $st === $k ? 'on' : '' ?>"><?= e($lbl) ?><b><?= (int)($counts[$k] ?? 0) ?></b></a>
  <?php endforeach; ?>
</div>
<form class="filters" method="get">
  <input type="hidden" name="st" value="<?= e($st) ?>">
  <input type="search" name="q" value="<?= e($_GET['q'] ?? '') ?>" placeholder="<?= L('Sök order, kund, produkt…', 'Search order, customer, product…') ?>">
  <select name="pay"><option value=""><?= L('Alla betalsätt', 'All payment methods') ?></option><?php foreach (PAY_NAMES() as $k => $v): ?><option value="<?= $k ?>" <?= sel($pay, $k) ?>><?= e($v) ?></option><?php endforeach; ?></select>
  <input type="date" name="from" value="<?= e($from) ?>" style="width:auto" aria-label="from"> – <input type="date" name="to" value="<?= e($to) ?>" style="width:auto" aria-label="to">
  <button class="b b--ghost"><?= icon('search') ?></button>
  <span class="spacer"></span><span class="muted"><?= count($rows) ?> · <?= money(array_sum(array_map(fn($o) => $o['status'] === 'cancelled' ? 0 : (float)$o['total'], $rows))) ?></span>
</form>
<form method="post" data-bulk><?= csrf_field() ?>
  <?php if (can('orders.edit')): ?>
  <div class="bulk" hidden><b data-bulk-n>0</b> <?= L('valda', 'selected') ?>
    <select name="act"><optgroup label="Status"><?php foreach (ORDER_ST() as $k => $v): ?><option value="<?= $k ?>"><?= e($v) ?></option><?php endforeach; ?></optgroup><optgroup label="<?= L('Betalning', 'Payment') ?>"><option value="paid"><?= L('Markera som betald', 'Mark as paid') ?></option><option value="unpaid"><?= L('Markera som obetald', 'Mark as unpaid') ?></option></optgroup><?php if (can('orders.delete')): ?><option value="delete"><?= L('Radera', 'Delete') ?></option><?php endif; ?></select>
    <label class="chk" style="margin:0;color:inherit"><input type="checkbox" name="notify" value="1"> <?= L('Meddela kund', 'Notify customer') ?></label>
    <button class="b b--sm" data-confirm="<?= L('Utför åtgärden på valda ordrar?', 'Apply the action to the selected orders?') ?>"><?= L('Utför', 'Apply') ?></button>
  </div>
  <?php endif; ?>
  <?php if (!$page): ?><div class="card empty"><p class="muted"><?= $all ? L('Inga ordrar matchar filtret.', 'No orders match the filter.') : L('Inga ordrar ännu. Beställningar från webbplatsen dyker upp här direkt, med ljud- och skrivbordsavisering.', 'No orders yet. Orders from the website appear here right away, with a sound and desktop notification.') ?></p></div><?php else: ?>
  <div class="tbl-wrap card" style="padding:0"><table class="t"><thead><tr><th style="width:30px"><input type="checkbox" data-check-all aria-label="all"></th><th>Order</th><th><?= L('Kund', 'Customer') ?></th><th class="hide-sm"><?= L('Artiklar', 'Items') ?></th><th><?= L('Summa', 'Total') ?></th><th class="hide-sm"><?= L('Betalning', 'Payment') ?></th><th>Status</th></tr></thead><tbody>
  <?php foreach ($page as $o): ?><tr>
    <td><input type="checkbox" name="ids[]" value="<?= e($o['id']) ?>"></td>
    <td><a class="rowlink" href="order.php?id=<?= e($o['id']) ?>"><?= e($o['ref']) ?></a><br><small class="muted" title="<?= e(fdate($o['at'])) ?>"><?= e(ago($o['at'])) ?></small></td>
    <td><?= e($o['customer']['name']) ?><br><small class="muted"><?= e($o['customer']['phone']) ?></small></td>
    <td class="hide-sm"><small><?= e(implode(', ', array_map(fn($l) => ($l['q'] > 1 ? $l['q'] . '× ' : '') . $l['title'] . ($l['size'] ? " ({$l['size']})" : ''), array_slice($o['items'], 0, 3)))) ?><?= count($o['items']) > 3 ? ' …' : '' ?></small></td>
    <td><b><?= money($o['total']) ?></b><br><small class="muted"><?= $o['ship'] === 'post' ? 'PostNord' : L('Hämtas', 'Pickup') ?></small></td>
    <td class="hide-sm"><?= e(PAY_NAMES()[$o['pay']] ?? $o['pay']) ?><br><?= !empty($o['paid']) ? '<span class="st st--paid">' . L('Betald', 'Paid') . '</span>' : '<span class="st st--warn">' . L('Ej betald', 'Unpaid') . '</span>' ?></td>
    <td><?= badge($o['status'], ORDER_ST()) ?></td>
  </tr><?php endforeach; ?>
  </tbody></table></div><?php endif; ?>
</form>
<?= $pager ?>
<?php admin_foot(); ?>
