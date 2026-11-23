<?php
/** AJAX image upload for the product editor: returns {files:[...]} */
require __DIR__ . '/inc.php';
header('Content-Type: application/json; charset=utf-8');
if (!me() || !can('products.edit') || !posted()) { http_response_code(403); echo json_encode(['error' => L('Ingen behörighet', 'Not allowed')]); exit; }
$files = []; $bad = 0;
$f = $_FILES['img'] ?? null;
if ($f && is_array($f['tmp_name'])) {
    foreach (array_slice(array_keys($f['tmp_name']), 0, 20) as $i) { $s = save_upload($f, 'products', $i); $s ? $files[] = $s : $bad++; }
}
if ($files) log_act(L('Laddade upp bilder', 'Uploaded images'), (string)count($files));
echo json_encode(['files' => $files, 'error' => $bad ? L("$bad fil(er) kunde inte sparas (endast JPG, PNG, WebP upp till 15 MB)", "$bad file(s) could not be saved (JPG, PNG, WebP up to 15 MB only)") : null]);
