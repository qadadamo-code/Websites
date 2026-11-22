<?php
require __DIR__ . '/inc.php';
require_admin();
$f = basename((string)($_GET['f'] ?? ''));
$path = EB_STORAGE . '/receipts/' . $f;
if ($f === '' || !is_file($path)) { http_response_code(404); exit('Not found'); }
$mime = (new finfo(FILEINFO_MIME_TYPE))->file($path);
header('Content-Type: ' . $mime);
header('Content-Disposition: inline; filename="' . $f . '"');
header('X-Content-Type-Options: nosniff');
readfile($path);
