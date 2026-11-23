<?php
require __DIR__ . '/inc.php';
require_admin();
$back = (string)($_POST['back'] ?? 'log.php');
if (!preg_match('~^(/(?![/\\])|[a-z0-9_-]+\.php)[^\\:]*$~i', $back)) $back = 'log.php';
if (posted()) {
    $req = (string)($_POST['req'] ?? '');
    if (!undo_ok($req)) flash(L('Kan inte ångra den ändringen', 'That change cannot be undone'), 'bad');
    else { $n = ad_undo($req); log_act(L('Ångrade en ändring', 'Undid a change'), $req); flash(L('Ändringen är ångrad', 'The change has been undone') . " ($n)"); unset($_SESSION['undo_req']); }
}
go($back);
