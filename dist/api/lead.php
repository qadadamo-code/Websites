<?php
require __DIR__ . '/_lib.php';
guard();

$name = clean('name', 120);
$phone = clean('phone', 40);
if ($name === '' || $phone === '') fail(422, 'required');

$rows = [
  'Name' => $name,
  'Business' => clean('company', 160),
  'Phone' => $phone,
  'Email' => clean('email', 160),
  'Industry' => clean('sector', 120),
  'Current site' => clean('current_site', 300),
  'Goal' => clean('goal'),
  'Add-ons' => clean('addons', 1000),
  'References' => clean('references'),
  'Template' => clean('template', 60),
  'Contact by' => clean('contact_way', 60),
  'Notes' => clean('notes'),
  'Language' => clean('locale', 5),
];
$files = collect_files('files');
log_row('leads.csv', $rows);
$ok = send_mail("New website brief: $name", $rows, $files, $rows['Email']);
echo json_encode(['ok' => true, 'mailed' => $ok]);
