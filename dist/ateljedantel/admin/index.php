<?php
require __DIR__ . '/inc.php';
require_admin();
$orders = can('orders.view') ? ad_load('orders') : [];
$bookings = can('bookings.view') ? ad_load('bookings') : [];
$valid = array_filter($orders, fn($o) => ($o['status'] ?? '') !== 'cancelled');
$month = date('Y-m'); $today = today();
$rev = fn($list) => array_sum(array_map(fn($o) => (float)$o['total'], $list));
$mOrders = array_filter($valid, fn($o) => substr($o['at'], 0, 7) === $month);
$upcoming = array_values(array_filter($bookings, fn($b) => ($b['date'] ?? '') >= $today && !in_array($b['status'] ?? '', ['cancelled', 'noshow', 'done'], true)));
usort($upcoming, fn($a, $b) => strcmp($a['date'] . $a['time'], $b['date'] . $b['time']));
$prods = ad_load('products');
$low = [];
foreach ($prods as $p) foreach ($p['variants'] as $v) if (empty($v['order']) && (int)($v['stock'] ?? 0) <= 0 && !empty($p['active'])) $low[] = [$p, $v];
$unpaid = array_filter($valid, fn($o) => empty($o['paid']) && ($o['status'] ?? '') !== 'done');
/* last 14 days */
$days = [];
for ($i = 13; $i >= 0; $i--) $days[date('Y-m-d', strtotime("-$i days"))] = 0;
foreach ($valid as $o) { $d = substr($o['at'], 0, 10); if (isset($days[$d])) $days[$d] += (float)$o['total']; }
$maxDay = max(1, max($days));
$me = me();
$h = (int)date('G');
admin_head(L('Översikt', 'Overview'), 'index', '<a class="b b--ghost" href="../" target="_blank">' . icon('eye') . ' ' . L('Visa butiken', 'View shop') . '</a>' . (can('products.edit') ? '<a class="b" href="product.php">' . icon('plus') . ' ' . L('Ny produkt', 'New product') . '</a>' : ''));
?>
<p class="muted" style="margin:-4px 0 18px"><?= $h < 10 ? L('God morgon', 'Good morning') : ($h < 18 ? L('Hej', 'Hello') : L('God kväll', 'Good evening')) ?>, <?= e(explode(' ', $me['name'] ?: $me['user'])[0]) ?> · <?= e(date('Y-m-d')) ?></p>
<div class="kpis">
  <?php if (can('orders.view')): ?>
  <div class="kpi"><small><?= L('Försäljning denna månad', 'Sales this month') ?></small><b><?= money($rev($mOrders)) ?></b><span><?= count($mOrders) ?> <?= L('ordrar', 'orders') ?></span></div>
  <div class="kpi"><small><?= L('Nya ordrar', 'New orders') ?></small><b><?= count(array_filter($orders, fn($o) => $o['status'] === 'new')) ?></b><span><?= count($unpaid) ?> <?= L('väntar på betalning', 'awaiting payment') ?></span></div>
  <?php endif; ?>
  <?php if (can('bookings.view')): ?>
  <div class="kpi"><small><?= L('Kommande provningar', 'Upcoming fittings') ?></small><b><?= count($upcoming) ?></b><span><?= count(array_filter($upcoming, fn($b) => $b['date'] === $today)) ?> <?= L('idag', 'today') ?></span></div>
  <?php endif; ?>
  <div class="kpi"><small><?= L('Produkter', 'Products') ?></small><b><?= count(array_filter($prods, fn($p) => !empty($p['active']))) ?></b><span><?= count($low) ?> <?= L('varianter slut i lager', 'variants out of stock') ?></span></div>
</div>

<div class="cols">
  <div>
    <?php if (can('orders.view')): ?>
    <div class="card">
      <div class="card__hd"><h3><?= L('Försäljning senaste 14 dagarna', 'Sales last 14 days') ?></h3><span class="muted"><?= money(array_sum($days)) ?></span></div>
      <div class="bars"><?php foreach ($days as $d => $v): ?><div title="<?= e($d . ': ' . kr($v)) ?>"><i style="height:<?= round($v / $maxDay * 100, 1) ?>%"></i><span><?= (int)substr($d, 8) ?></span></div><?php endforeach; ?></div>
    </div>
    <div class="card">
      <div class="card__hd"><h3><?= L('Senaste ordrar', 'Latest orders') ?></h3><a class="link" href="orders.php"><?= L('Alla ordrar', 'All orders') ?> →</a></div>
      <?php if (!$orders): ?><p class="muted empty"><?= L('Inga ordrar ännu. När en kund beställer på webbplatsen visas ordern här direkt.', 'No orders yet. When a customer orders on the website the order appears here right away.') ?></p><?php else: ?>
      <div class="tbl-wrap"><table class="t"><thead><tr><th>#</th><th><?= L('Kund', 'Customer') ?></th><th class="hide-sm"><?= L('Datum', 'Date') ?></th><th><?= L('Summa', 'Total') ?></th><th>Status</th></tr></thead><tbody>
      <?php foreach (array_slice($orders, 0, 8) as $o): ?><tr><td><a class="rowlink" href="order.php?id=<?= e($o['id']) ?>"><?= e($o['ref']) ?></a></td><td><?= e($o['customer']['name']) ?></td><td class="hide-sm"><?= e(ago($o['at'])) ?></td><td><?= money($o['total']) ?></td><td><?= badge($o['status'], ORDER_ST()) ?><?= !empty($o['paid']) ? ' ' . badge('paid', ORDER_ST()) : '' ?></td></tr><?php endforeach; ?>
      </tbody></table></div><?php endif; ?>
    </div>
    <?php endif; ?>
  </div>
  <div>
    <?php if (can('bookings.view')): ?>
    <div class="card">
      <div class="card__hd"><h3><?= L('Kommande bokningar', 'Upcoming bookings') ?></h3><a class="link" href="bookings.php">→</a></div>
      <?php if (!$upcoming): ?><p class="muted"><?= L('Inga kommande bokningar.', 'No upcoming bookings.') ?></p><?php else: ?>
      <ul class="list"><?php foreach (array_slice($upcoming, 0, 7) as $b): ?><li><span><b><?= e($b['name']) ?></b><br><small class="muted"><?= e($b['typeName']) ?></small></span><span style="text-align:right"><?= e($b['date'] === $today ? L('Idag', 'Today') : $b['date']) ?><br><small><?= e($b['time']) ?> <?= badge($b['status'], BOOK_ST()) ?></small></span></li><?php endforeach; ?></ul><?php endif; ?>
    </div>
    <?php endif; ?>
    <div class="card">
      <div class="card__hd"><h3><?= L('Slut i lager', 'Out of stock') ?></h3><?php if (can('products.edit')): ?><a class="link" href="products.php?f=out">→</a><?php endif; ?></div>
      <?php if (!$low): ?><p class="muted"><?= L('Allt finns i lager.', 'Everything is in stock.') ?></p><?php else: ?>
      <ul class="list"><?php foreach (array_slice($low, 0, 6) as [$p, $v]): ?><li><span><?= can('products.edit') ? '<a href="product.php?id=' . e($p['id']) . '">' . e($p['title']['sv']) . '</a>' : e($p['title']['sv']) ?></span><small class="muted"><?= e(trim(($v['size'] ?? '') . ' ' . ($v['color'] ?? ''))) ?></small></li><?php endforeach; ?></ul>
      <?php if (count($low) > 6): ?><p class="hint">+<?= count($low) - 6 ?> <?= L('till', 'more') ?></p><?php endif; endif; ?>
    </div>
    <div class="card">
      <h3><?= L('Snabbval', 'Shortcuts') ?></h3>
      <div class="row">
        <?php if (can('content.edit')): ?><a class="b b--ghost b--sm" href="content.php"><?= icon('text') ?> <?= L('Texter', 'Texts') ?></a><?php endif; ?>
        <?php if (can('coupons.edit')): ?><a class="b b--ghost b--sm" href="coupons.php"><?= icon('tag') ?> <?= L('Rabattkod', 'Discount code') ?></a><?php endif; ?>
        <?php if (can('settings.edit')): ?><a class="b b--ghost b--sm" href="settings.php#pay"><?= icon('settings') ?> Swish &amp; bank</a><?php endif; ?>
        <?php if (can('reports.view')): ?><a class="b b--ghost b--sm" href="reports.php"><?= icon('chart') ?> <?= L('Rapporter', 'Reports') ?></a><?php endif; ?>
      </div>
      <?php $s = settings(); if (can('settings.edit') && (($s['pay']['swish']['on'] ?? false) && empty($s['pay']['swish']['number']) || ($s['pay']['bank']['on'] ?? false) && empty($s['pay']['bank']['bankgiro']) && empty($s['pay']['bank']['iban']))): ?>
      <p class="flash flash--bad" style="margin:14px 0 0"><?= L('Fyll i Swish-nummer och bankuppgifter under Inställningar så att kunderna kan betala.', 'Fill in the Swish number and bank details under Settings so customers can pay.') ?></p><?php endif; ?>
    </div>
  </div>
</div>
<?php admin_foot(); ?>
