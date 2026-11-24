<?php
/** Fitting appointment from boka.php. Times are re-checked under a lock so two people can't take the same slot. */
require dirname(__DIR__) . '/inc/core.php';
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || !same_origin()) json_out(['ok' => false], 405);
$d = read_json_body();
if (!empty($d['website'])) json_out(['ok' => true]);
if (!rate_ok('book', 6, 3600)) json_out(['ok' => false, 'msg' => t('f.rate')], 429);
$b = booking_cfg();
if (empty($b['enabled'])) json_out(['ok' => false, 'msg' => t('f.err')], 403);
$type = preg_replace('/[^a-z0-9_-]/', '', (string)($d['type'] ?? ''));
$ty = null; foreach ((array)($b['types'] ?? []) as $x) if ($x['id'] === $type) $ty = $x;
$date = (string)($d['date'] ?? ''); $time = (string)($d['time'] ?? '');
$name = clean((string)($d['name'] ?? ''), 80); $email = strtolower(clean((string)($d['email'] ?? ''), 120)); $phone = clean((string)($d['phone'] ?? ''), 30);
$err = [];
if (!$ty) $err['type'] = t('f.req');
if ($name === '') $err['name'] = t('f.req');
if (!valid_email($email)) $err['email'] = t('f.email');
if (strlen(preg_replace('/\D/', '', $phone)) < 7) $err['phone'] = t('f.req');
if ($type === 'skradd' && mb_strlen(trim((string)($d['note'] ?? ''))) < 3) $err['note'] = t('bk.noteReq');
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) || !preg_match('/^\d{2}:\d{2}$/', $time)) $err['time'] = t('f.req');
if ($err) json_out(['ok' => false, 'errors' => $err, 'msg' => t('co.err')], 422);
$wish = array_values(array_filter(array_map(fn($x) => preg_replace('/[^a-z0-9]/i', '', (string)$x), (array)($d['wish'] ?? [])))) ;
$titles = []; foreach (products() as $p) if (in_array($p['id'], $wish, true)) $titles[] = tr($p['title']);
$row = null;
$ok = ad_tx('bookings', function (&$all) use ($date, $time, $type, $ty, $name, $email, $phone, $d, $titles, &$row) {
    if (!in_array($time, booking_slots($date, $type), true)) return false;
    $row = ['id' => ad_id('b'), 'ref' => 'B' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 5)), 'type' => $type, 'typeName' => $ty['name']['sv'] ?? $type, 'min' => (int)$ty['min'],
        'date' => $date, 'time' => $time, 'name' => $name, 'email' => $email, 'phone' => $phone,
        'guests' => max(1, min(8, (int)($d['guests'] ?? 1))), 'event' => preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)($d['event'] ?? '')) ? $d['event'] : '',
        'note' => clean((string)($d['note'] ?? ''), 800), 'wish' => $titles, 'lang' => lang(), 'status' => 'new', 'at' => now_iso(), 'staffNote' => ''];
    $all[] = $row;
    return true;
});
if (!$ok) json_out(['ok' => false, 'msg' => t('bk.taken'), 'taken' => true], 409);
customer_touch($email, ['name' => $name, 'phone' => $phone], 'booking');
$s = settings();
$when = date('Y-m-d', strtotime($date)) . ' ' . $time;
$typeName = tr($ty['name']);
ad_mail($s['orderEmail'] ?? $s['email'], "Ny bokning {$row['ref']}: $when – $name",
    "Ny bokning från webbplatsen\n\nTyp: {$ty['name']['sv']} ({$ty['min']} min)\nTid: $when\nNamn: $name\nE-post: $email\nTelefon: $phone\nPersoner: {$row['guests']}\n" . ($row['event'] ? "Datum för bröllop/bal: {$row['event']}\n" : '') . ($titles ? 'Vill prova: ' . implode(', ', $titles) . "\n" : '') . ($row['note'] ? "Meddelande: {$row['note']}\n" : ''), $email);
ad_mail($email, (lang() === 'en' ? 'Your fitting at Ateljé Dantel – ' : 'Din provning hos Ateljé Dantel – ') . $when,
    (lang() === 'en' ? "Hi $name,\n\nThank you for your booking. We look forward to seeing you!\n\n" : "Hej $name,\n\nTack för din bokning. Vi ser fram emot att träffa dig!\n\n")
    . "$typeName\n$when\n\nAteljé Dantel\n{$s['address']}, {$s['city']}\n{$s['phone']} · {$s['email']}\n\n" . (lang() === 'en' ? 'Need to change or cancel? Just reply to this email or call us.' : 'Behöver du ändra eller avboka? Svara på detta mejl eller ring oss.'));
json_out(['ok' => true, 'ref' => $row['ref'], 'when' => $when]);
