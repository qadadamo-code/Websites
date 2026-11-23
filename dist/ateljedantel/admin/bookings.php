<?php
require __DIR__ . '/inc.php';
require_perm('bookings.view');
$cfg = booking_cfg(); $types = []; foreach ((array)($cfg['types'] ?? []) as $t) $types[$t['id']] = $t;
$tab = (string)($_GET['tab'] ?? 'upcoming');
if (posted()) {
    $act = p('act') ?: p('st');
    if ($act === 'cfg') {
        need('settings.edit');
        $days = []; foreach (range(1, 7) as $d) if (!empty($_POST['day_on'][$d]) && preg_match('/^\d{2}:\d{2}$/', $_POST['day_from'][$d] ?? '') && preg_match('/^\d{2}:\d{2}$/', $_POST['day_to'][$d] ?? '')) $days[(string)$d] = [$_POST['day_from'][$d], $_POST['day_to'][$d]];
        $tys = [];
        foreach ((array)($_POST['ty'] ?? []) as $t) { $sv = clean((string)($t['sv'] ?? ''), 80); if ($sv === '') continue; $tid = preg_match('/^[a-z0-9]{2,20}$/', (string)($t['id'] ?? '')) ? $t['id'] : substr(slugify($sv), 0, 12); $tys[] = ['id' => str_replace('-', '', $tid), 'name' => ['sv' => $sv, 'en' => clean((string)($t['en'] ?? ''), 80)], 'min' => max(15, min(480, (int)($t['min'] ?? 60)))]; }
        $blocked = array_values(array_unique(array_filter(preg_split('/[\s,]+/', p('blocked')), fn($x) => preg_match('/^\d{4}-\d{2}-\d{2}$/', $x))));
        sort($blocked);
        ad_tx('settings', function (&$s) use ($days, $tys, $blocked) {
            $s['booking'] = array_merge($s['booking'] ?? [], ['enabled' => !empty($_POST['enabled']), 'slot' => max(15, min(120, (int)p('slot'))), 'days' => $days, 'leadHours' => max(0, (int)p('leadHours')), 'maxDays' => max(7, min(365, (int)p('maxDays'))), 'perSlot' => max(1, min(5, (int)p('perSlot'))), 'blocked' => $blocked, 'types' => $tys ?: ($s['booking']['types'] ?? [])]);
        });
        log_act(L('Ändrade bokningsinställningar', 'Changed booking settings')); flash(L('Bokningsinställningarna är sparade', 'Booking settings saved')); go('bookings.php?tab=settings');
    }
    if ($act === 'add') {
        need('bookings.edit');
        $type = p('type'); $date = pdate('date'); $time = preg_match('/^\d{2}:\d{2}$/', p('time')) ? p('time') : '';
        if (!isset($types[$type]) || !$date || !$time || p('name') === '') { flash(L('Fyll i typ, datum, tid och namn', 'Fill in type, date, time and name'), 'bad'); go('bookings.php?tab=add'); }
        $row = ['id' => ad_id('b'), 'ref' => 'B' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 5)), 'type' => $type, 'typeName' => $types[$type]['name']['sv'], 'min' => (int)$types[$type]['min'], 'date' => $date, 'time' => $time,
            'name' => clean(p('name'), 80), 'email' => strtolower(clean(p('email'), 120)), 'phone' => clean(p('phone'), 30), 'guests' => 1, 'event' => pdate('event'), 'note' => clean(p('note'), 800), 'wish' => [], 'lang' => 'sv', 'status' => 'confirmed', 'at' => now_iso(), 'staffNote' => '', 'manual' => true];
        ad_tx('bookings', function (&$d) use ($row) { $d[] = $row; });
        if (valid_email($row['email'])) customer_touch($row['email'], ['name' => $row['name'], 'phone' => $row['phone']], 'booking');
        log_act(L('Lade till bokning', 'Added booking'), "$date $time {$row['name']}"); flash(L('Bokningen är tillagd', 'The booking was added')); go('bookings.php');
    }
    $ids = array_map('strval', (array)($_POST['ids'] ?? [])); if (p('id') !== '') $ids = [p('id')];
    if ($act === 'delete') { need('bookings.delete'); ad_tx('bookings', function (&$d) use ($ids) { $d = array_values(array_filter($d, fn($b) => !in_array($b['id'], $ids, true))); }); log_act(L('Raderade bokning', 'Deleted booking'), (string)count($ids)); flash(L('Raderat', 'Deleted')); }
    elseif (isset(BOOK_ST()[$act]) || $act === 'note') {
        need('bookings.edit');
        $note = clean(p('staffNote'), 1000);
        ad_tx('bookings', function (&$d) use ($ids, $act, $note) { foreach ($d as &$b) if (in_array($b['id'], $ids, true)) { if ($act === 'note') $b['staffNote'] = $note; else $b['status'] = $act; } });
        if ($act === 'confirmed' && !empty($_POST['notify'])) foreach (ad_load('bookings') as $b) if (in_array($b['id'], $ids, true) && valid_email($b['email'])) {
            $en = ($b['lang'] ?? 'sv') === 'en'; $s = settings();
            ad_mail($b['email'], ($en ? 'Your fitting is confirmed – ' : 'Din tid är bekräftad – ') . $b['date'] . ' ' . $b['time'], ($en ? 'Hello ' : 'Hej ') . $b['name'] . ",\n\n" . ($en ? 'Welcome to Ateljé Dantel on ' : 'Välkommen till Ateljé Dantel ') . $b['date'] . ' ' . $b['time'] . ".\n{$s['address']}, {$s['city']}\n\n{$s['phone']} · {$s['email']}\n");
        }
        log_act(L('Uppdaterade bokning', 'Updated booking'), $act . ' × ' . count($ids)); flash(L('Bokningen är uppdaterad', 'The booking is updated'));
    }
    go('bookings.php' . (($q = $_SERVER['QUERY_STRING'] ?? '') ? '?' . $q : ''));
}
$all = ad_load('bookings'); $today = today();
usort($all, fn($a, $b) => strcmp($a['date'] . $a['time'], $b['date'] . $b['time']));
$rows = match ($tab) {
    'past' => array_reverse(array_values(array_filter($all, fn($b) => $b['date'] < $today))),
    'new' => array_values(array_filter($all, fn($b) => $b['status'] === 'new')),
    'all' => $all,
    default => array_values(array_filter($all, fn($b) => $b['date'] >= $today && !in_array($b['status'], ['cancelled'], true))),
};
if (isset($_GET['export']) && can('export')) export_rows(L('bokningar', 'bookings'), ['Ref', L('Datum', 'Date'), L('Tid', 'Time'), L('Typ', 'Type'), L('Min', 'Min'), L('Namn', 'Name'), L('E-post', 'Email'), L('Telefon', 'Phone'), L('Personer', 'Guests'), L('Bröllop/bal', 'Event date'), L('Vill prova', 'Wants to try'), L('Meddelande', 'Message'), 'Status'],
    array_map(fn($b) => [$b['ref'], $b['date'], $b['time'], $b['typeName'], (int)$b['min'], $b['name'], $b['email'], $b['phone'], (int)$b['guests'], $b['event'], implode(', ', $b['wish'] ?? []), $b['note'], BOOK_ST()[$b['status']] ?? $b['status']], $rows), $_GET['export'] === 'csv' ? 'csv' : 'xls');
$cnt = ['upcoming' => count(array_filter($all, fn($b) => $b['date'] >= $today && $b['status'] !== 'cancelled')), 'new' => count(array_filter($all, fn($b) => $b['status'] === 'new')), 'past' => count(array_filter($all, fn($b) => $b['date'] < $today)), 'all' => count($all)];
$dows = [1 => L('Måndag', 'Monday'), L('Tisdag', 'Tuesday'), L('Onsdag', 'Wednesday'), L('Torsdag', 'Thursday'), L('Fredag', 'Friday'), L('Lördag', 'Saturday'), L('Söndag', 'Sunday')];
admin_head(L('Bokningar', 'Bookings'), 'bookings', ($tab !== 'settings' && $tab !== 'add' ? export_buttons('bookings.php?tab=' . urlencode($tab)) : '') . (can('bookings.edit') ? '<a class="b" href="?tab=add">' . icon('plus') . ' ' . L('Ny bokning', 'New booking') . '</a>' : ''));
?>
<div class="tabs">
  <?php foreach (['upcoming' => L('Kommande', 'Upcoming'), 'new' => L('Nya', 'New'), 'past' => L('Tidigare', 'Past'), 'all' => L('Alla', 'All')] as $k => $lbl): ?><a href="?tab=<?= $k ?>" class="<?= $tab === $k ? 'on' : '' ?>"><?= e($lbl) ?><b><?= $cnt[$k] ?></b></a><?php endforeach; ?>
  <?php if (can('settings.edit')): ?><a href="?tab=settings" class="<?= $tab === 'settings' ? 'on' : '' ?>"><?= L('Öppettider & typer', 'Hours & types') ?></a><?php endif; ?>
</div>
<?php if ($tab === 'settings' && can('settings.edit')): ?>
<form method="post" class="card" data-dirty><?= csrf_field() ?><input type="hidden" name="act" value="cfg">
  <label class="chk"><input type="checkbox" name="enabled" value="1" <?= checked($cfg['enabled'] ?? false) ?>> <?= L('Onlinebokning är öppen', 'Online booking is open') ?></label>
  <div class="grid4">
    <label><?= L('Starttider var (min)', 'Start times every (min)') ?><input type="number" name="slot" value="<?= (int)($cfg['slot'] ?? 60) ?>" min="15" max="120" step="15"></label>
    <label><?= L('Minsta framförhållning (timmar)', 'Minimum notice (hours)') ?><input type="number" name="leadHours" value="<?= (int)($cfg['leadHours'] ?? 12) ?>" min="0"></label>
    <label><?= L('Boka max dagar framåt', 'Book max days ahead') ?><input type="number" name="maxDays" value="<?= (int)($cfg['maxDays'] ?? 90) ?>" min="7" max="365"></label>
    <label><?= L('Kunder samtidigt', 'Customers at once') ?><input type="number" name="perSlot" value="<?= (int)($cfg['perSlot'] ?? 1) ?>" min="1" max="5"></label>
  </div>
  <h3 style="margin-top:10px"><?= L('Bokningsbara tider per veckodag', 'Bookable hours per weekday') ?></h3>
  <?php foreach ($dows as $d => $n): $w = $cfg['days'][(string)$d] ?? null; ?>
  <div class="row" style="margin-bottom:8px"><label class="chk" style="width:140px;margin:0"><input type="checkbox" name="day_on[<?= $d ?>]" value="1" <?= checked($w) ?>> <?= e($n) ?></label><input type="time" name="day_from[<?= $d ?>]" value="<?= e($w[0] ?? '10:00') ?>" style="width:auto"> – <input type="time" name="day_to[<?= $d ?>]" value="<?= e($w[1] ?? '17:00') ?>" style="width:auto"></div>
  <?php endforeach; ?>
  <label style="margin-top:10px"><?= L('Stängda datum (semester, helgdagar) – ett per rad, ÅÅÅÅ-MM-DD', 'Closed dates (holidays) – one per line, YYYY-MM-DD') ?><textarea name="blocked" rows="4" placeholder="2026-12-24"><?= e(implode("\n", $cfg['blocked'] ?? [])) ?></textarea></label>
  <h3 style="margin-top:10px"><?= L('Typer av besök', 'Appointment types') ?></h3>
  <div data-rep>
    <?php foreach (array_values($cfg['types'] ?? []) as $i => $t): ?><div class="grid4" data-rep-row style="align-items:end"><input type="hidden" name="ty[<?= $i ?>][id]" value="<?= e($t['id']) ?>"><label><?= L('Namn (sv)', 'Name (sv)') ?><input name="ty[<?= $i ?>][sv]" value="<?= e($t['name']['sv']) ?>"></label><label><?= L('Namn (en)', 'Name (en)') ?><input name="ty[<?= $i ?>][en]" value="<?= e($t['name']['en'] ?? '') ?>"></label><label><?= L('Längd (min)', 'Length (min)') ?><input type="number" name="ty[<?= $i ?>][min]" value="<?= (int)$t['min'] ?>" min="15" step="15"></label><div class="row" style="padding-bottom:10px"><button type="button" class="b b--ghost b--icon b--sm" data-rep-up><?= icon('up') ?></button><button type="button" class="b b--ghost b--icon b--sm" data-rep-rm><?= icon('trash') ?></button></div></div><?php endforeach; ?>
    <button type="button" class="b b--ghost b--sm" data-rep-add><?= icon('plus') ?> <?= L('Lägg till typ', 'Add type') ?></button>
    <template><div class="grid4" data-rep-row style="align-items:end"><label><?= L('Namn (sv)', 'Name (sv)') ?><input name="ty[__i__][sv]"></label><label><?= L('Namn (en)', 'Name (en)') ?><input name="ty[__i__][en]"></label><label><?= L('Längd (min)', 'Length (min)') ?><input type="number" name="ty[__i__][min]" value="60" min="15" step="15"></label><div class="row" style="padding-bottom:10px"><button type="button" class="b b--ghost b--icon b--sm" data-rep-rm>×</button></div></div></template>
  </div>
  <div class="sticky-save"><button class="b"><?= L('Spara inställningar', 'Save settings') ?></button></div>
</form>
<?php elseif ($tab === 'add' && can('bookings.edit')): ?>
<form method="post" class="card narrow"><?= csrf_field() ?><input type="hidden" name="act" value="add">
  <p class="muted"><?= L('Lägg till en bokning som kommit via telefon eller i butiken. Tiden blockeras då för onlinebokning.', 'Add a booking made by phone or in store. The time is then blocked for online booking.') ?></p>
  <div class="grid2">
    <label class="full"><?= L('Typ', 'Type') ?><select name="type"><?php foreach ($types as $t): ?><option value="<?= e($t['id']) ?>"><?= e($t['name']['sv']) ?> (<?= (int)$t['min'] ?> min)</option><?php endforeach; ?></select></label>
    <label><?= L('Datum', 'Date') ?><input type="date" name="date" required value="<?= e($today) ?>"></label>
    <label><?= L('Tid', 'Time') ?><input type="time" name="time" required step="900"></label>
    <label><?= L('Namn', 'Name') ?><input name="name" required></label>
    <label><?= L('Telefon', 'Phone') ?><input name="phone"></label>
    <label><?= L('E-post', 'Email') ?><input type="email" name="email"></label>
    <label><?= L('Bröllops-/baldatum', 'Wedding/prom date') ?><input type="date" name="event"></label>
    <label class="full"><?= L('Anteckning', 'Note') ?><textarea name="note" rows="2"></textarea></label>
  </div>
  <button class="b"><?= L('Spara bokning', 'Save booking') ?></button>
</form>
<?php else: ?>
  <?php if (!$rows): ?><div class="card empty"><p class="muted"><?= L('Inga bokningar här.', 'No bookings here.') ?></p></div><?php endif; ?>
  <?php $cur = ''; foreach ($rows as $b): if ($b['date'] !== $cur): $cur = $b['date']; ?><div class="daygroup"><?= e($dows[(int)date('N', strtotime($cur))] . ' ' . $cur) ?><?= $cur === $today ? ' · ' . L('Idag', 'Today') : '' ?></div><?php endif; ?>
  <div class="card" style="padding:14px 18px;margin-bottom:10px">
    <div class="row">
      <b style="font-size:18px;min-width:56px"><?= e($b['time']) ?></b>
      <div style="flex:1;min-width:200px"><b><?= e($b['name']) ?></b> · <?= e($b['typeName']) ?> <span class="muted">(<?= (int)$b['min'] ?> min<?= $b['guests'] > 1 ? ', ' . (int)$b['guests'] . ' ' . L('pers', 'ppl') : '' ?>)</span><br>
        <small><a href="tel:<?= e(preg_replace('/[^\d+]/', '', $b['phone'])) ?>"><?= e($b['phone']) ?></a> · <a href="mailto:<?= e($b['email']) ?>"><?= e($b['email']) ?></a><?= $b['event'] ? ' · ' . L('Event', 'Event') . ': ' . e($b['event']) : '' ?> · <?= e($b['ref']) ?></small>
        <?php if (!empty($b['wish'])): ?><br><small>👗 <?= e(implode(', ', $b['wish'])) ?></small><?php endif; ?>
        <?php if ($b['note']): ?><br><small class="muted">“<?= e($b['note']) ?>”</small><?php endif; ?>
      </div>
      <?= badge($b['status'], BOOK_ST()) ?>
      <?php if (can('bookings.edit')): ?>
      <form method="post" class="row" style="gap:6px"><?= csrf_field() ?><input type="hidden" name="id" value="<?= e($b['id']) ?>">
        <?php if ($b['status'] === 'new'): ?><input type="hidden" name="notify" value="1"><button class="b b--sm" name="act" value="confirmed" title="<?= L('Bekräfta och mejla kunden', 'Confirm and email customer') ?>"><?= icon('check') ?> <?= L('Bekräfta', 'Confirm') ?></button><?php endif; ?>
        <select name="st" onchange="if(this.value)this.form.submit()" style="width:auto"><option value=""><?= L('Ändra…', 'Change…') ?></option><?php foreach (BOOK_ST() as $k => $v): ?><option value="<?= $k ?>"><?= e($v) ?></option><?php endforeach; ?></select>
        <?php if (can('bookings.delete')): ?><button class="b b--ghost b--icon b--sm" name="act" value="delete" data-confirm="<?= L('Radera bokningen?', 'Delete the booking?') ?>"><?= icon('trash') ?></button><?php endif; ?>
      </form>
      <?php endif; ?>
    </div>
  </div>
  <?php endforeach; ?>
<?php endif; ?>
<?php admin_foot(); ?>
