<?php
require __DIR__ . '/inc.php';
require_perm('news.view');
$tab = ($_GET['tab'] ?? '') === 'news' ? 'news' : 'msg';
if (posted()) {
    $act = p('act'); $ids = array_map('strval', (array)($_POST['ids'] ?? [])); if (p('id') !== '') $ids = [p('id')];
    if ($tab === 'msg') {
        ad_tx('messages', function (&$d) use ($act, $ids) {
            if ($act === 'delete') { $d = array_values(array_filter($d, fn($m) => !in_array($m['id'], $ids, true))); return; }
            foreach ($d as &$m) if (in_array($m['id'], $ids, true)) $m['read'] = $act === 'read';
        });
    } else {
        ad_tx('subscribers', function (&$d) use ($act, $ids) {
            if ($act === 'delete') { $d = array_values(array_filter($d, fn($m) => !in_array($m['id'], $ids, true))); return; }
            foreach ($d as &$m) if (in_array($m['id'], $ids, true)) $m['active'] = $act === 'on';
        });
    }
    log_act(L('Meddelanden/nyhetsbrev', 'Messages/newsletter'), "$tab $act × " . count($ids)); flash(L('Uppdaterat', 'Updated'));
    go('messages.php?tab=' . $tab);
}
$msgs = ad_load('messages'); $subs = ad_load('subscribers');
usort($subs, fn($a, $b) => strcmp($b['at'], $a['at']));
if (isset($_GET['export']) && can('export')) {
    if ($tab === 'news') export_rows(L('nyhetsbrev', 'newsletter'), [L('E-post', 'Email'), L('Språk', 'Language'), L('Datum', 'Date'), L('Aktiv', 'Active')], array_map(fn($s) => [$s['email'], $s['lang'], fdate($s['at']), !empty($s['active']) ? L('Ja', 'Yes') : L('Nej', 'No')], $subs), $_GET['export'] === 'csv' ? 'csv' : 'xls');
    export_rows(L('meddelanden', 'messages'), [L('Datum', 'Date'), L('Namn', 'Name'), L('E-post', 'Email'), L('Telefon', 'Phone'), L('Produkt', 'Product'), L('Meddelande', 'Message')], array_map(fn($m) => [fdate($m['at']), $m['name'], $m['email'], $m['phone'], $m['product'] ?? '', $m['message']], $msgs), $_GET['export'] === 'csv' ? 'csv' : 'xls');
}
admin_head(L('Meddelanden & nyhetsbrev', 'Messages & newsletter'), 'messages', export_buttons('messages.php?tab=' . $tab));
$activeSubs = count(array_filter($subs, fn($s) => !empty($s['active'])));
?>
<div class="tabs"><a href="?tab=msg" class="<?= $tab === 'msg' ? 'on' : '' ?>"><?= L('Meddelanden', 'Messages') ?><b><?= count($msgs) ?></b></a><a href="?tab=news" class="<?= $tab === 'news' ? 'on' : '' ?>"><?= L('Nyhetsbrev', 'Newsletter') ?><b><?= $activeSubs ?></b></a></div>
<form method="post" data-bulk><?= csrf_field() ?>
<div class="bulk" hidden><b data-bulk-n>0</b> <?= L('valda', 'selected') ?>
  <select name="act"><?php if ($tab === 'msg'): ?><option value="read"><?= L('Markera som läst', 'Mark as read') ?></option><option value="unread"><?= L('Markera som oläst', 'Mark as unread') ?></option><?php else: ?><option value="off"><?= L('Avregistrera', 'Unsubscribe') ?></option><option value="on"><?= L('Aktivera', 'Activate') ?></option><?php endif; ?><option value="delete"><?= L('Radera', 'Delete') ?></option></select>
  <button class="b b--sm" data-confirm="<?= L('Utför åtgärden?', 'Apply the action?') ?>"><?= L('Utför', 'Apply') ?></button>
</div>
<?php if ($tab === 'msg'): ?>
  <?php if (!$msgs): ?><div class="card empty"><p class="muted"><?= L('Inga meddelanden ännu. Meddelanden från kontaktformuläret visas här.', 'No messages yet. Messages from the contact form appear here.') ?></p></div><?php endif; ?>
  <?php foreach ($msgs as $m): ?>
  <div class="card" style="padding:14px 18px;margin-bottom:10px;<?= empty($m['read']) ? 'border-left:3px solid var(--red)' : '' ?>">
    <div class="row"><input type="checkbox" name="ids[]" value="<?= e($m['id']) ?>"><b><?= e($m['name']) ?></b><a href="mailto:<?= e($m['email']) ?>?subject=<?= rawurlencode('Re: ' . ($m['product'] ?: 'Ateljé Dantel')) ?>"><?= e($m['email']) ?></a><?php if ($m['phone']): ?><a href="tel:<?= e(preg_replace('/[^\d+]/', '', $m['phone'])) ?>"><?= e($m['phone']) ?></a><?php endif; ?><span class="spacer"></span><small class="muted" title="<?= e(fdate($m['at'])) ?>"><?= e(ago($m['at'])) ?></small></div>
    <?php if (!empty($m['product'])): ?><p class="hint" style="margin:8px 0 0">👗 <?= e($m['product']) ?></p><?php endif; ?>
    <p style="margin:8px 0 0;white-space:pre-line"><?= e($m['message']) ?></p>
  </div>
  <?php endforeach; ?>
<?php else: ?>
  <?php if (!$subs): ?><div class="card empty"><p class="muted"><?= L('Inga prenumeranter ännu.', 'No subscribers yet.') ?></p></div><?php else: ?>
  <div class="card" style="padding:0"><table class="t"><thead><tr><th style="width:30px"><input type="checkbox" data-check-all aria-label="all"></th><th><?= L('E-post', 'Email') ?></th><th><?= L('Språk', 'Language') ?></th><th><?= L('Datum', 'Date') ?></th><th>Status</th></tr></thead><tbody>
  <?php foreach ($subs as $s): ?><tr><td><input type="checkbox" name="ids[]" value="<?= e($s['id']) ?>"></td><td><?= e($s['email']) ?></td><td><?= e(strtoupper($s['lang'])) ?></td><td><?= e(fdate($s['at'], false)) ?></td><td><?= !empty($s['active']) ? '<span class="st st--on">' . L('Aktiv', 'Active') . '</span>' : '<span class="st st--off">' . L('Avregistrerad', 'Unsubscribed') . '</span>' ?></td></tr><?php endforeach; ?>
  </tbody></table></div>
  <p class="hint"><?= L('Exportera listan till Excel/CSV och importera den i ditt utskicksverktyg (t.ex. Mailchimp).', 'Export the list to Excel/CSV and import it into your mailing tool (e.g. Mailchimp).') ?></p>
  <?php endif; ?>
<?php endif; ?>
</form>
<?php
/* opening the inbox marks everything as read (the red line shows what was new on this visit) */
if ($tab === 'msg' && array_filter($msgs, fn($m) => empty($m['read']))) { $GLOBALS['ad_no_undo'] = true; ad_tx('messages', function (&$d) { foreach ($d as &$m) $m['read'] = true; }); $GLOBALS['ad_no_undo'] = false; }
admin_foot(); ?>
