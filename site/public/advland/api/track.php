<?php
/** GET ref & phone → booking status (phone must match, so refs can't be enumerated). */
require dirname(__DIR__) . '/inc/core.php';
if (!rate_ok('track', 30, 3600)) json_out(['ok' => false, 'error' => 'rate'], 429);
$ref = strtoupper(clean_str($_GET['ref'] ?? '', 12));
$phone = preg_replace('/\D+/', '', clean_phone($_GET['phone'] ?? ''));
foreach (al_load('bookings') as $b) {
    if ($b['ref'] === $ref && $phone !== '' && substr(preg_replace('/\D+/', '', $b['phone']), -8) === substr($phone, -8)) {
        json_out(['ok' => true, 'booking' => [
            'ref' => $b['ref'], 'type' => $b['type'], 'status' => $b['status'], 'date' => $b['date'], 'time' => $b['time'],
            'branch' => $b['branch'], 'package' => $b['package'], 'items' => $b['items'], 'estimate' => $b['estimate'],
        ]]);
    }
}
json_out(['ok' => false, 'error' => 'not_found'], 404);
