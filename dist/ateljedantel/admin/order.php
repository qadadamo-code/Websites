<?php
require __DIR__ . '/inc.php';
require_perm('orders.view');
$id = (string)($_GET['id'] ?? '');
$find = function () use ($id) { foreach (ad_load('orders') as $o) if ($o['id'] === $id) return $o; return null; };
$o = $find();
if (!$o) { flash(L('Ordern finns inte', 'Order not found'), 'bad'); go('orders.php'); }
if (posted()) {
    $act = p('act');
    if ($act === 'delete') {
        need('orders.delete');
        ad_tx('orders', function (&$d) use ($id) { $d = array_values(array_filter($d, fn($x) => $x['id'] !== $id)); });
        log_act(L('Raderade order', 'Deleted order'), $o['ref']); flash(L('Ordern är raderad', 'The order was deleted')); go('orders.php');
    }
    need('orders.edit');
    if ($act === 'status') {
        $new = p('status');
        if ($new !== $o['status']) { order_set_status($id, $new, !empty($_POST['notify'])); log_act(L('Ändrade orderstatus', 'Changed order status'), $o['ref'] . ' → ' . (ORDER_ST()[$new] ?? $new)); }
        $paid = !empty($_POST['paid']); $note = clean(p('staffNote'), 2000); $track = clean(p('tracking'), 80);
        ad_tx('orders', function (&$d) use ($id, $paid, $note, $track) { foreach ($d as &$x) if ($x['id'] === $id) { if ((bool)($x['paid'] ?? false) !== $paid) { $x['paid'] = $paid; $x['paidAt'] = $paid ? now_iso() : ''; } $x['staffNote'] = $note; $x['tracking'] = $track; } });
        flash(L('Ordern är sparad', 'The order is saved'));
    }
    go('order.php?id=' . urlencode($id));
}
$c = $o['customer']; $s = settings(); $en = alang() === 'en';
admin_head(L('Order', 'Order') . ' ' . $o['ref'], 'orders', '<a class="b b--ghost" href="orders.php">← ' . L('Ordrar', 'Orders') . '</a><button class="b b--ghost" type="button" onclick="print()">' . icon('print') . ' ' . L('Skriv ut / kvitto', 'Print / receipt') . '</button>');
?>
<div class="cols">
  <div>
    <div class="card">
      <div class="card__hd"><h3><?= e($o['ref']) ?> · <?= e(fdate($o['at'])) ?></h3><span><?= badge($o['status'], ORDER_ST()) ?> <?= !empty($o['paid']) ? badge('paid', ORDER_ST()) : '<span class="st st--warn">' . L('Ej betald', 'Unpaid') . '</span>' ?></span></div>
      <div class="order-items">
        <?php foreach ($o['items'] as $l): ?><div class="li">
          <img src="<?= e(src($l['img'])) ?>" alt="">
          <div><b><?= e($en && !empty($l['titleEn']) ? $l['titleEn'] : $l['title']) ?></b><br><small class="muted"><?= e(implode(' · ', array_filter([$l['size'] ? L('Storlek', 'Size') . ' ' . $l['size'] : '', $l['color'], $l['sku'] ? L('Art.nr', 'SKU') . ' ' . $l['sku'] : '']))) ?></small><?= !empty($l['order']) ? '<br><span class="st st--confirmed">' . L('Beställningsvara', 'Made to order') . '</span>' : '' ?></div>
          <div style="text-align:right"><?= (int)$l['q'] ?> × <?= money($l['price']) ?><br><b><?= money($l['price'] * $l['q']) ?></b></div>
        </div><?php endforeach; ?>
      </div>
      <ul class="list" style="margin-top:10px">
        <li><span><?= L('Delsumma', 'Subtotal') ?></span><span><?= money($o['subtotal']) ?></span></li>
        <?php if ($o['discount'] > 0): ?><li><span><?= L('Rabatt', 'Discount') ?> <?= e($o['coupon']) ?></span><span>−<?= money($o['discount']) ?></span></li><?php endif; ?>
        <li><span><?= $o['ship'] === 'post' ? L('Frakt PostNord', 'Shipping PostNord') : L('Hämtas i butiken', 'Pickup in store') ?></span><span><?= money($o['shipping']) ?></span></li>
        <li><b><?= L('Totalt (inkl. moms)', 'Total (incl. VAT)') ?></b><b><?= money($o['total']) ?></b></li>
        <li><span class="muted"><?= L('varav moms 25 %', 'of which VAT 25%') ?></span><span class="muted"><?= money(round($o['total'] * 0.2, 2)) ?></span></li>
      </ul>
    </div>
    <div class="card">
      <h3><?= L('Kund', 'Customer') ?></h3>
      <div class="grid2">
        <div><b><?= e($c['name']) ?></b><br><a href="mailto:<?= e($c['email']) ?>"><?= e($c['email']) ?></a><br><a href="tel:<?= e(preg_replace('/[^\d+]/', '', $c['phone'])) ?>"><?= e($c['phone']) ?></a></div>
        <div><?php if ($o['ship'] === 'post'): ?><?= e($c['address']) ?><br><?= e($c['zip'] . ' ' . $c['city']) ?><?php else: ?><span class="muted"><?= L('Hämtar i butiken', 'Collects in store') ?></span><?php endif; ?><br><span class="muted"><?= L('Betalsätt', 'Payment') ?>: <?= e(PAY_NAMES()[$o['pay']] ?? $o['pay']) ?></span></div>
      </div>
      <?php if (!empty($c['note'])): ?><p style="margin-top:12px;padding:12px;background:var(--bg);border-radius:10px"><b><?= L('Kundens meddelande', 'Customer message') ?>:</b><br><?= nl2br(e($c['note'])) ?></p><?php endif; ?>
      <?php if (can('customers.view')): ?><a class="link" href="customers.php?q=<?= e(urlencode($c['email'])) ?>"><?= L('Visa kundens historik', 'Show customer history') ?> →</a><?php endif; ?>
    </div>
  </div>
  <div class="no-print">
    <?php if (can('orders.edit')): ?>
    <form method="post" class="card"><?= csrf_field() ?><input type="hidden" name="act" value="status">
      <h3><?= L('Hantera', 'Manage') ?></h3>
      <label>Status<select name="status"><?php foreach (ORDER_ST() as $k => $v): ?><option value="<?= $k ?>" <?= sel($o['status'], $k) ?>><?= e($v) ?></option><?php endforeach; ?></select></label>
      <label class="chk"><input type="checkbox" name="notify" value="1"> <?= L('Skicka e-post till kunden om ny status', 'Email the customer about the new status') ?></label>
      <label class="chk"><input type="checkbox" name="paid" value="1" <?= checked($o['paid'] ?? false) ?>> <?= L('Betalning mottagen', 'Payment received') ?></label>
      <?php if ($o['ship'] === 'post'): ?><label><?= L('Kollinummer (PostNord)', 'Tracking number (PostNord)') ?><input name="tracking" value="<?= e($o['tracking'] ?? '') ?>"></label><?php endif; ?>
      <label><?= L('Intern anteckning', 'Internal note') ?><textarea name="staffNote" rows="3"><?= e($o['staffNote'] ?? '') ?></textarea></label>
      <p class="hint"><?= L('Avbryts ordern läggs reserverade varor automatiskt tillbaka i lager.', 'If the order is cancelled, reserved items go back into stock automatically.') ?></p>
      <button class="b" style="width:100%"><?= L('Spara', 'Save') ?></button>
    </form>
    <?php endif; ?>
    <div class="card">
      <h3><?= L('Historik', 'History') ?></h3>
      <ul class="timeline"><?php foreach (array_reverse($o['history'] ?? []) as $h): ?><li><b><?= e(ORDER_ST()[$h['st']] ?? $h['st']) ?></b> · <?= e(fdate($h['at'])) ?><br><small class="muted"><?= e($h['by'] === 'web' ? L('Webbplatsen', 'Website') : $h['by']) ?></small></li><?php endforeach; ?></ul>
    </div>
    <?php if ($o['pay'] === 'swish' && !empty($s['pay']['swish']['number'])): ?><div class="card"><h3>Swish</h3><p><?= e($s['pay']['swish']['number']) ?> · <?= L('Meddelande', 'Message') ?>: <b><?= e($o['ref']) ?></b></p></div><?php endif; ?>
    <?php if (can('orders.delete')): ?><form method="post" class="card"><?= csrf_field() ?><input type="hidden" name="act" value="delete"><button class="b b--danger" style="width:100%" data-confirm="<?= L('Radera ordern permanent? (Lagret ändras inte.)', 'Delete the order permanently? (Stock is not changed.)') ?>"><?= icon('trash') ?> <?= L('Radera order', 'Delete order') ?></button></form><?php endif; ?>
  </div>
</div>
<?php admin_foot(); ?>
