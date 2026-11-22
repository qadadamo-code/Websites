<?php
require __DIR__ . '/inc.php';
require_admin();
$orders = eb_load('orders');
$live = array_filter($orders, fn($o) => $o['status'] !== 'cancelled');
$today = date('Y-m-d'); $month = date('Y-m');
$todayOrders = array_filter($live, fn($o) => substr($o['created'], 0, 10) === $today);
$monthOrders = array_filter($live, fn($o) => substr($o['created'], 0, 7) === $month);
$sum = fn($list) => array_sum(array_map(fn($o) => $o['total'], $list));
$new = array_filter($orders, fn($o) => $o['status'] === 'new');
$aov = $live ? $sum($live) / count($live) : 0;
$unpaid = array_filter($live, fn($o) => $o['payment'] !== 'cod' && empty($o['paid']));

// last 14 days revenue
$days = [];
for ($i = 13; $i >= 0; $i--) $days[date('Y-m-d', strtotime("-$i day"))] = 0;
foreach ($live as $o) { $d = substr($o['created'], 0, 10); if (isset($days[$d])) $days[$d] += $o['total']; }
$maxDay = max(1, max($days));

$products = eb_load('products');
$low = array_filter($products, fn($p) => (int)$p['stock'] <= (int)setting('low_stock', 2));
usort($products, fn($a, $b) => ($b['sold'] ?? 0) <=> ($a['sold'] ?? 0));
$top = array_slice(array_filter($products, fn($p) => ($p['sold'] ?? 0) > 0), 0, 5);
$recent = array_slice(array_reverse($orders), 0, 6);
$s = eb_load('settings');
admin_head('أهلاً ' . ($_SESSION['eb_admin'] ?? ''), 'index');
?>
<?php if (empty($s['whatsapp']) || empty($s['order_email'])): ?>
  <div class="flash flash--warn">أكمل بيانات التواصل (رقم واتساب وإيميل استلام الطلبات) من <a href="settings.php">الإعدادات</a> عشان أزرار واتساب تظهر في المتجر والإشعارات توصلك.</div>
<?php endif; ?>
<section class="kpis">
  <div class="kpi"><span>طلبات جديدة</span><b><?= count($new) ?></b><a href="orders.php?status=new">راجعها ←</a></div>
  <div class="kpi"><span>مبيعات النهارده</span><b><?= egp($sum($todayOrders)) ?></b><small><?= count($todayOrders) ?> طلب</small></div>
  <div class="kpi"><span>مبيعات الشهر</span><b><?= egp($sum($monthOrders)) ?></b><small><?= count($monthOrders) ?> طلب</small></div>
  <div class="kpi"><span>متوسط قيمة الطلب</span><b><?= egp($aov) ?></b><small><?= count($live) ?> طلب إجمالاً</small></div>
</section>

<section class="grid2">
  <div class="card">
    <h2>المبيعات آخر 14 يوم</h2>
    <div class="bars">
      <?php foreach ($days as $d => $v): ?>
        <div class="bars__col" title="<?= e($d) ?>: <?= egp($v) ?>"><i style="height:<?= max(2, round($v / $maxDay * 100)) ?>%"></i><span><?= date('d', strtotime($d)) ?></span></div>
      <?php endforeach; ?>
    </div>
  </div>
  <div class="card">
    <h2>تحتاج انتباهك</h2>
    <ul class="list">
      <?php if ($unpaid): ?><li><a href="orders.php?unpaid=1"><b><?= count($unpaid) ?></b> طلب تحويل لسه ماتأكدش الدفع</a></li><?php endif; ?>
      <?php foreach ($low as $p): ?><li><a href="product.php?id=<?= e($p['id']) ?>"><?= e($p['name_ar']) ?></a> <span class="<?= $p['stock'] ? 'warn' : 'bad' ?>"><?= $p['stock'] ? 'متبقي ' . (int)$p['stock'] : 'نفدت الكمية' ?></span></li><?php endforeach; ?>
      <?php if (!$unpaid && !$low): ?><li class="muted">كل حاجة تمام ✓</li><?php endif; ?>
    </ul>
  </div>
</section>

<section class="grid2">
  <div class="card">
    <div class="card__head"><h2>آخر الطلبات</h2><a href="orders.php">كل الطلبات ←</a></div>
    <?php if (!$recent): ?><p class="muted">لسه مفيش طلبات. أول طلب هيظهر هنا فوراً.</p><?php else: ?>
    <table class="tbl"><tbody>
      <?php foreach ($recent as $o): ?>
        <tr onclick="location='order.php?id=<?= e($o['number']) ?>'"><td><b><?= e($o['number']) ?></b><br><small><?= fmt_date($o['created']) ?></small></td><td><?= e($o['customer']['name']) ?></td><td><?= egp($o['total']) ?></td><td><?= status_badge($o['status']) ?></td></tr>
      <?php endforeach; ?>
    </tbody></table>
    <?php endif; ?>
  </div>
  <div class="card">
    <h2>الأكثر مبيعاً</h2>
    <?php if (!$top): ?><p class="muted">هتظهر هنا أكتر القطع مبيعاً.</p><?php else: ?>
    <ul class="list list--prod">
      <?php foreach ($top as $p): ?><li><img src="<?= e(img_src($p['images'][0] ?? '')) ?>" alt=""><span><?= e($p['name_ar']) ?></span><b><?= (int)$p['sold'] ?> قطعة</b></li><?php endforeach; ?>
    </ul>
    <?php endif; ?>
  </div>
</section>
<?php admin_foot();
