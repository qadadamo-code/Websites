<?php
require __DIR__ . '/_lib.php';
guard();

$name = clean('name', 120);
$phone = clean('phone', 40);
if ($name === '' || $phone === '') fail(422, 'required');
$files = collect_files('receipt');
if (!$files) fail(422, 'receipt');

$rows = [
  'Name' => $name,
  'Phone' => $phone,
  'Amount' => clean('amount', 40),
  'Method' => clean('method', 60),
  'Language' => clean('locale', 5),
];
log_row('receipts.csv', $rows);
$ok = send_mail("Payment receipt: $name", $rows, $files);
echo json_encode(['ok' => true, 'mailed' => $ok]);
