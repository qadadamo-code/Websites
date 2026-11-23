<?php
/**
 * Download every menu photo as one .zip: one folder per category ("01 - القهوة"),
 * each file named "NN - item name.jpg". Photos are converted to JPG when the server can,
 * otherwise kept in their original format. Pure PHP zip writer (no ZipArchive needed).
 */
require __DIR__ . '/inc.php';
require_perm('items.edit');
@set_time_limit(180);
$cats = sort_by_order(bc_load('categories'));
$items = sort_by_order(bc_load('items'));
$safe = fn(string $s) => trim(preg_replace('/[\\\\\/:*?"<>|\x00-\x1F]+/u', '-', $s)) ?: 'item';

$files = []; // [path in zip, bytes]
$toJpg = function (string $abs): ?string {
    $ext = strtolower(pathinfo($abs, PATHINFO_EXTENSION));
    if ($ext === 'jpg' || $ext === 'jpeg') return file_get_contents($abs);
    if (!function_exists('imagejpeg')) return null;
    $im = null;
    if ($ext === 'webp' && function_exists('imagecreatefromwebp')) $im = @imagecreatefromwebp($abs);
    elseif ($ext === 'png' && function_exists('imagecreatefrompng')) $im = @imagecreatefrompng($abs);
    if (!$im) return null;
    $w = imagesx($im); $h = imagesy($im);
    $bg = imagecreatetruecolor($w, $h); imagefill($bg, 0, 0, imagecolorallocate($bg, 253, 245, 209)); // cream behind transparency
    imagecopy($bg, $im, 0, 0, 0, 0, $w, $h);
    ob_start(); imagejpeg($bg, null, 92); $b = ob_get_clean();
    imagedestroy($im); imagedestroy($bg);
    return $b;
};
foreach ($cats as $ci => $c) {
    $folder = sprintf('%02d', $ci + 1) . ' - ' . $safe($c['title']);
    $n = 0;
    foreach ($items as $it) {
        if (($it['cat'] ?? '') !== $c['id']) continue;
        $n++;
        $rel = item_image($it); if ($rel === '') continue;
        $abs = BC_ROOT . '/' . ltrim($rel, '/');
        if (!is_file($abs) || strpos(realpath($abs), realpath(BC_ROOT)) !== 0) continue;
        $jpg = $toJpg($abs);
        $ext = $jpg !== null ? 'jpg' : strtolower(pathinfo($abs, PATHINFO_EXTENSION));
        $files[] = [$folder . '/' . sprintf('%02d', $n) . ' - ' . $safe($it['name']) . '.' . $ext, $jpg ?? file_get_contents($abs)];
    }
}
if (!$files) { flash('مفيش صور أصناف لسه', 'bad'); go('items.php'); }

// ---- stored (no compression) zip with UTF-8 names ----
$out = fopen('php://temp', 'w+b'); $central = ''; $off = 0;
[$dt, $dd] = (function () { $t = getdate(); return [($t['hours'] << 11) | ($t['minutes'] << 5) | intdiv($t['seconds'], 2), (($t['year'] - 1980) << 9) | ($t['mon'] << 5) | $t['mday']]; })();
foreach ($files as [$name, $data]) {
    $crc = crc32($data); $len = strlen($data); $nl = strlen($name);
    $local = pack('VvvvvvVVVvv', 0x04034b50, 20, 0x0800, 0, $dt, $dd, $crc, $len, $len, $nl, 0) . $name;
    fwrite($out, $local); fwrite($out, $data);
    $central .= pack('VvvvvvvVVVvvvvvVV', 0x02014b50, 20, 20, 0x0800, 0, $dt, $dd, $crc, $len, $len, $nl, 0, 0, 0, 0, 32, $off) . $name;
    $off += strlen($local) + $len;
}
fwrite($out, $central);
fwrite($out, pack('VvvvvVVv', 0x06054b50, 0, 0, count($files), count($files), strlen($central), $off, 0));
log_act('تحميل صور المنيو', count($files) . ' صورة');
$size = ftell($out); rewind($out);
$fname = 'tablia-menu-photos-' . date('Y-m-d') . '.zip';
header('Content-Type: application/zip');
header('Content-Disposition: attachment; filename="' . $fname . '"; filename*=UTF-8\'\'' . rawurlencode('صور منيو طبلية.zip'));
header('Content-Length: ' . $size);
fpassthru($out);
