<?php
/** Register a guest for an event invitation. */
require dirname(__DIR__) . '/inc/core.php';
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') json_out(['ok' => false], 405);
if (!rate_ok('rsvp', 6, 600)) json_out(['ok' => false, 'msg' => 'محاولات كثيرة، جرّب بعد قليل'], 429);
$in = read_json_body();
if (!empty($in['website'])) json_out(['ok' => true]);
$ev = find_event((string)($in['event'] ?? ''));
if (!$ev || empty($ev['visible']) || $ev['date'] < today()) json_out(['ok' => false, 'msg' => 'الدعوة غير متاحة'], 404);
if (isset($ev['rsvpOpen']) && !$ev['rsvpOpen']) json_out(['ok' => false, 'msg' => 'التسجيل مغلق لهذه الفعالية'], 409);
$name = clean((string)($in['name'] ?? ''), 80); $phone = clean(digits_en((string)($in['phone'] ?? '')), 30);
$guests = max(1, min((int)($ev['maxPerGuest'] ?? 6) ?: 6, (int)($in['guests'] ?? 1)));
if ($name === '' || $phone === '') json_out(['ok' => false, 'msg' => 'الاسم والموبايل مطلوبين'], 422);
$res = bc_tx('rsvps', function (&$d) use ($ev, $name, $phone, $guests, $in) {
    $taken = 0;
    foreach ($d as $r) {
        if ($r['event'] !== $ev['id'] || ($r['status'] ?? '') === 'cancelled') continue;
        if (preg_replace('/\D/', '', $r['phone']) === preg_replace('/\D/', '', $phone)) return ['dup' => $r['code']];
        $taken += (int)$r['guests'];
    }
    if (!empty($ev['capacity']) && $taken + $guests > (int)$ev['capacity']) return ['full' => max(0, (int)$ev['capacity'] - $taken)];
    $code = 'INV-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 5));
    array_unshift($d, ['id' => bc_id('v'), 'event' => $ev['id'], 'code' => $code, 'at' => now_iso(), 'name' => $name, 'phone' => $phone,
        'guests' => $guests, 'note' => clean((string)($in['note'] ?? ''), 200), 'status' => 'confirmed']);
    return ['code' => $code];
});
if (isset($res['dup'])) json_out(['ok' => true, 'code' => $res['dup'], 'msg' => 'أنت مسجّل بالفعل في هذه الدعوة']);
if (isset($res['full'])) json_out(['ok' => false, 'msg' => $res['full'] ? 'المتبقي ' . $res['full'] . ' أماكن فقط' : 'اكتمل العدد، نأسف!'], 409);
json_out(['ok' => true, 'code' => $res['code'], 'msg' => 'تم تأكيد دعوتك']);
