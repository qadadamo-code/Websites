<?php
require __DIR__ . '/inc.php';
require_perm('reports.view');
$pre = (string)($_GET['p'] ?? 'month');
[$from, $to] = match ($pre) {
    'last' => [date('Y-m-01', strtotime('first day of last month')), date('Y-m-t', strtotime('last day of last month'))],
    'year' => [date('Y-01-01'), today()],
    '30' => [date('Y-m-d', strtotime('-29 days')), today()],
    'custom' => [preg_match('/^\d{4}-\d{2}-\d{2}$/', $_GET['from'] ?? '') ? $_GET['from'] : date('Y-m-01'), preg_match('/^\d{4}-\d{2}-\d{2}$/', $_GET['to'] ?? '') ? $_GET['to'] : today()],
    default => [date('Y-m-01'), today()],
};
$onlyPaid = !empty($_GET['paid']);
$orders = array_values(array_filter(ad_load('orders'), function ($o) use ($from, $to, $onlyPaid) { $d = substr($o['at'], 0, 10); return $d >= $from && $d <= $to && $o['status'] !== 'cancelled' && (!$onlyPaid || !empty($o['paid'])); }));
$prods = []; foreach (ad_load('products') as $p) $prods[$p['id']] = $p;
$cats = []; foreach (ad_load('categories') as $c) $cats[$c['id']] = $c['name']['sv'];
$rev = 0; $disc = 0; $ship = 0; $items = 0; $byPay = []; $byCat = []; $top = []; $byDay = [];
foreach ($orders as $o) {
    $rev += $o['total']; $disc += $o['discount']; $ship += $o['shipping'];
    $byPay[$o['pay']] = ($byPay[$o['pay']] ?? 0) + $o['total'];
    $d = substr($o['at'], 0, 10); $byDay[$d] = ($byDay[$d] ?? 0) + $o['total'];
    foreach ($o['items'] as $l) {
        $items += $l['q']; $sum = $l['price'] * $l['q'];
        $cat = $cats[$prods[$l['pid']]['cat'] ?? ''] ?? L('Okänd', 'Unknown');
        $byCat[$cat] = ($byCat[$cat] ?? 0) + $sum;
        $k = $l['pid']; $top[$k] = ['title' => $l['title'], 'q' => ($top[$k]['q'] ?? 0) + $l['q'], 'sum' => ($top[$k]['sum'] ?? 0) + $sum, 'cat' => $cat];
    }
}
uasort($top, fn($a, $b) => $b['sum'] <=> $a['sum']); arsort($byCat); arsort($byPay);
$bookings = array_filter(ad_load('bookings'), fn($b) => $b['date'] >= $from && $b['date'] <= $to && $b['status'] !== 'cancelled');
$byType = []; foreach ($bookings as $b) $byType[$b['typeName']] = ($byType[$b['typeName']] ?? 0) + 1; arsort($byType);
if (isset($_GET['export']) && can('export')) {
    $fmt = $_GET['export'] === 'csv' ? 'csv' : 'xls';
    if (($_GET['what'] ?? '') === 'products') export_rows(L('produktforsaljning', 'product-sales') . "-$from-$to", [L('Produkt', 'Product'), L('Kategori', 'Category'), L('Antal', 'Qty'), L('Summa', 'Total')], array_map(fn($t) => [$t['title'], $t['cat'], (int)$t['q'], (float)$t['sum']], array_values($top)), $fmt);
    $rows = [];
    foreach ($orders as $o) foreach ($o['items'] as $l) $rows[] = [$o['ref'], substr($o['at'], 0, 10), $o['customer']['name'], $l['title'], $l['sku'], $l['size'], $l['color'], (int)$l['q'], (float)$l['price'], (float)($l['price'] * $l['q']), PAY_NAMES()[$o['pay']] ?? $o['pay'], !empty($o['paid']) ? L('Ja', 'Yes') : L('Nej', 'No'), ORDER_ST()[$o['status']] ?? $o['status']];
    export_rows(L('forsaljning', 'sales') . "-$from-$to", ['Order', L('Datum', 'Date'), L('Kund', 'Customer'), L('Produkt', 'Product'), L('Art.nr', 'SKU'), L('Storlek', 'Size'), L('Färg', 'Colour'), L('Antal', 'Qty'), L('À-pris', 'Unit price'), L('Summa', 'Total'), L('Betalsätt', 'Payment'), L('Betald', 'Paid'), 'Status'], $rows, $fmt);
}
/* daily series over the range (max 92 bars, else per month) */
$span = (strtotime($to) - strtotime($from)) / 86400 + 1;
$series = [];
if ($span <= 92) { for ($t = strtotime($from); $t <= strtotime($to); $t += 86400) $series[date('Y-m-d', $t)] = $byDay[date('Y-m-d', $t)] ?? 0; }
else { foreach ($byDay as $d => $v) $series[substr($d, 0, 7)] = ($series[substr($d, 0, 7)] ?? 0) + $v; ksort($series); }
$maxS = max(1, $series ? max($series) : 1);
$q = $_GET; unset($q['export'], $q['what']);
$exp = can('export') ? '<a class="b b--ghost" href="?' . e(http_build_query($q + ['export' => 'xls'])) . '">' . icon('down') . ' ' . L('Försäljning Excel', 'Sales Excel') . '</a><a class="b b--ghost" href="?' . e(http_build_query($q + ['export' => 'xls', 'what' => 'products'])) . '">' . L('Produkter Excel', 'Products Excel') . '</a><a class="b b--ghost" href="?' . e(http_build_query($q + ['export' => 'csv'])) . '">CSV</a>' : '';
admin_head(L('Rapporter', 'Reports'), 'reports', $exp);
?>
<form class="filters" method="get">
  <div class="tabs" style="margin:0"><?php foreach (['month' => L('Denna månad', 'This month'), 'last' => L('Förra månaden', 'Last month'), '30' => L('30 dagar', '30 days'), 'year' => L('I år', 'This year')] as $k => $lbl): ?><a href="?p=<?= $k ?><?= $onlyPaid ? '&paid=1' : '' ?>" class="<?= $pre === $k ? 'on' : '' ?>"><?= e($lbl) ?></a><?php endforeach; ?></div>
  <input type="hidden" name="p" value="custom"><input type="date" name="from" value="<?= e($from) ?>" style="width:auto"> – <input type="date" name="to" value="<?= e($to) ?>" style="width:auto">
  <label class="chk" style="margin:0"><input type="checkbox" name="paid" value="1" <?= checked($onlyPaid) ?>> <?= L('Endast betalda', 'Paid only') ?></label>
  <button class="b b--ghost"><?= L('Visa', 'Show') ?></button>
</form>
<div class="kpis">
  <div class="kpi"><small><?= L('Försäljning', 'Revenue') ?></small><b><?= money($rev) ?></b><span><?= L('inkl. moms', 'incl. VAT') ?> · <?= L('moms', 'VAT') ?> <?= money(round($rev * 0.2)) ?></span></div>
  <div class="kpi"><small><?= L('Ordrar', 'Orders') ?></small><b><?= count($orders) ?></b><span><?= L('snitt', 'avg') ?> <?= money(count($orders) ? round($rev / count($orders)) : 0) ?></span></div>
  <div class="kpi"><small><?= L('Sålda plagg', 'Items sold') ?></small><b><?= $items ?></b><span><?= L('rabatter', 'discounts') ?> <?= money($disc) ?></span></div>
  <div class="kpi"><small><?= L('Provningar', 'Fittings') ?></small><b><?= count($bookings) ?></b><span><?= L('frakt', 'shipping') ?> <?= money($ship) ?></span></div>
</div>
<div class="card"><div class="card__hd"><h3><?= L('Försäljning över tid', 'Sales over time') ?></h3><span class="muted"><?= e("$from – $to") ?></span></div>
  <div class="bars" style="gap:<?= count($series) > 40 ? 2 : 6 ?>px"><?php $i = 0; foreach ($series as $d => $v): $i++; ?><div title="<?= e($d . ': ' . kr($v)) ?>"><i style="height:<?= round($v / $maxS * 100, 1) ?>%"></i><span><?= count($series) <= 31 || $i % 7 === 1 ? e(strlen($d) === 7 ? substr($d, 5) : (int)substr($d, 8)) : '&nbsp;' ?></span></div><?php endforeach; ?></div>
</div>
<div class="cols">
  <div class="card"><h3><?= L('Toppsäljare', 'Top sellers') ?></h3>
    <?php if (!$top): ?><p class="muted"><?= L('Ingen försäljning i perioden.', 'No sales in the period.') ?></p><?php else: ?>
    <table class="t"><thead><tr><th><?= L('Produkt', 'Product') ?></th><th class="hide-sm"><?= L('Kategori', 'Category') ?></th><th><?= L('Antal', 'Qty') ?></th><th><?= L('Summa', 'Total') ?></th></tr></thead><tbody>
    <?php foreach (array_slice($top, 0, 15, true) as $pid => $t): ?><tr><td><?= isset($prods[$pid]) && can('products.edit') ? '<a href="product.php?id=' . e($pid) . '">' . e($t['title']) . '</a>' : e($t['title']) ?></td><td class="hide-sm"><?= e($t['cat']) ?></td><td><?= (int)$t['q'] ?></td><td><?= money($t['sum']) ?></td></tr><?php endforeach; ?>
    </tbody></table><?php endif; ?>
  </div>
  <div>
    <div class="card"><h3><?= L('Per kategori', 'By category') ?></h3><ul class="list"><?php foreach ($byCat as $k => $v): ?><li><span><?= e($k) ?></span><b><?= money($v) ?></b></li><?php endforeach; ?><?php if (!$byCat): ?><li class="muted">—</li><?php endif; ?></ul></div>
    <div class="card"><h3><?= L('Per betalsätt', 'By payment method') ?></h3><ul class="list"><?php foreach ($byPay as $k => $v): ?><li><span><?= e(PAY_NAMES()[$k] ?? $k) ?></span><b><?= money($v) ?></b></li><?php endforeach; ?><?php if (!$byPay): ?><li class="muted">—</li><?php endif; ?></ul></div>
    <div class="card"><h3><?= L('Provningar per typ', 'Fittings by type') ?></h3><ul class="list"><?php foreach ($byType as $k => $v): ?><li><span><?= e($k) ?></span><b><?= $v ?></b></li><?php endforeach; ?><?php if (!$byType): ?><li class="muted">—</li><?php endif; ?></ul></div>
  </div>
</div>
<?php admin_foot(); ?>
