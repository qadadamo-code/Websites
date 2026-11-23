<?php
/** Undo (or redo) one dashboard action: puts back exactly the records that action changed. */
require __DIR__ . '/inc.php';
require_admin();
$raw = (string)($_POST['back'] ?? '');
$path = basename((string)parse_url($raw, PHP_URL_PATH));
$q = (string)parse_url($raw, PHP_URL_QUERY);
$back = preg_match('/^[a-z]+\.php$/', $path) && $path !== 'undo.php' ? $path . ($q !== '' ? '?' . preg_replace('/[\r\n]/', '', $q) : '') : 'log.php';
if (!posted()) go($back);
$req = preg_replace('/[^0-9a-f]/', '', (string)($_POST['req'] ?? ''));
if (!undo_ok($req)) { flash('مينفعش التراجع عن العملية دي (اتراجعت قبل كده أو مش ضمن صلاحياتك)', 'bad'); go($back); }
$label = 'عملية'; foreach (bc_load('log') as $r) if (($r['req'] ?? '') === $req) { $label = $r['action'] . ($r['detail'] ? ' · ' . $r['detail'] : ''); break; }
$n = bc_undo($req);
log_act('تراجع', $label);
flash($n ? 'تم التراجع عن: ' . mb_substr($label, 0, 90) . '. لو غيرت رأيك دوس «تراجع» تاني' : 'مفيش حاجة اترجعت', $n ? 'ok' : 'bad');
go($back);
