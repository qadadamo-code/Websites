<?php
/** Public catalogue for the cart, wishlist and instant search. Cached by the browser, refreshed when products change. */
require dirname(__DIR__) . '/inc/core.php';
$f = AD_STORAGE . '/products.json';
$etag = '"' . md5(lang() . '|' . (is_file($f) ? filemtime($f) : 0) . '|' . (is_file(AD_STORAGE . '/categories.json') ? filemtime(AD_STORAGE . '/categories.json') : 0) . AD_VERSION) . '"';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=60, must-revalidate');
header('ETag: ' . $etag);
if (trim((string)($_SERVER['HTTP_IF_NONE_MATCH'] ?? '')) === $etag) { http_response_code(304); exit; }
echo json_encode(catalog_json(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
