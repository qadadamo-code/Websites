<?php
require dirname(__DIR__) . '/inc/core.php';
$b = booking_cfg();
$month = preg_match('/^\d{4}-\d{2}$/', (string)($_GET['month'] ?? '')) ? $_GET['month'] : date('Y-m');
$type = preg_replace('/[^a-z0-9_-]/', '', (string)($_GET['type'] ?? ''));
if (isset($_GET['date'])) json_out(['ok' => true, 'slots' => booking_slots((string)$_GET['date'], $type)]);
// which days in this month have at least one free time
$days = [];
$n = (int)date('t', strtotime($month . '-01'));
for ($i = 1; $i <= $n; $i++) { $d = sprintf('%s-%02d', $month, $i); $days[$d] = count(booking_slots($d, $type)) > 0; }
json_out(['ok' => true, 'days' => $days]);
