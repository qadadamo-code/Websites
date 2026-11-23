<?php
/** Dashboard core: session, auth, CSRF, layout and small helpers. Arabic, RTL. */
require dirname(__DIR__) . '/inc/core.php';
if (session_status() === PHP_SESSION_NONE) {
    session_name('bc_admin');
    session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax', 'secure' => !empty($_SERVER['HTTPS'])]);
    session_start();
}
header('X-Robots-Tag: noindex, nofollow');
header('X-Frame-Options: SAMEORIGIN');
header('Cache-Control: no-store');

function admin_data(): array { return bc_load('admin'); }
function is_admin(): bool { return !empty($_SESSION['bc_admin']); }
function require_admin(): void { if (!is_admin()) { header('Location: login.php'); exit; } }
function csrf(): string { if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(16)); return $_SESSION['csrf']; }
function csrf_field(): string { return '<input type="hidden" name="_t" value="' . csrf() . '">'; }
function posted(): bool {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') return false;
    if (!hash_equals(csrf(), (string)($_POST['_t'] ?? ''))) { flash('انتهت الجلسة، حاول مرة أخرى', 'bad'); return false; }
    return true;
}
function flash(?string $msg = null, string $type = 'ok') {
    if ($msg !== null) { $_SESSION['flash'] = [$msg, $type]; return null; }
    $f = $_SESSION['flash'] ?? null; unset($_SESSION['flash']); return $f;
}
function go(string $to): void { header('Location: ' . $to); exit; }
function egp($n): string { return number_format((float)$n) . ' ج.م'; }
function src(string $p): string { return $p === '' ? '' : (preg_match('~^https?://~', $p) ? $p : '../' . ltrim($p, '/')); }
function fdate(string $iso, bool $time = true): string { return $iso ? date($time ? 'd/m/Y · H:i' : 'd/m/Y', strtotime($iso)) : '—'; }
function ago(string $iso): string {
    $d = time() - strtotime($iso);
    if ($d < 60) return 'الآن';
    if ($d < 3600) return 'منذ ' . floor($d / 60) . ' د';
    if ($d < 86400) return 'منذ ' . floor($d / 3600) . ' س';
    return fdate($iso, false);
}
function p(string $k, string $def = ''): string { return trim((string)($_POST[$k] ?? $def)); }
function pdate(string $k): string { $v = p($k); return preg_match('/^\d{4}-\d{2}-\d{2}$/', $v) ? $v : ''; }
function ptime(string $k): string { $v = p($k); return preg_match('/^\d{2}:\d{2}$/', $v) ? $v : ''; }
function checked($v): string { return !empty($v) ? 'checked' : ''; }
function sel($a, $b): string { return (string)$a === (string)$b ? 'selected' : ''; }
function slugify(string $s): string {
    $s = strtolower(trim(preg_replace('/[^A-Za-z0-9]+/', '-', $s), '-'));
    return $s !== '' ? substr($s, 0, 40) : 'ev-' . bin2hex(random_bytes(3));
}
function seq_options(): array {
    $out = [];
    foreach (glob(BC_ROOT . '/assets/seq/*', GLOB_ONLYDIR) ?: [] as $d) if (is_file($d . '/001.jpg')) $out[] = basename($d);
    sort($out);
    return $out;
}
const SEQ_LABELS = ['espresso' => 'إسبريسو', 'latte' => 'لاتيه', 'iced' => 'آيس كوفي', 'shake' => 'ميلك شيك', 'juice' => 'عصير', 'mojito' => 'موهيتو', 'pizza' => 'بيتزا', 'pasta' => 'باستا', 'dessert' => 'حلويات'];
const ORDER_ST = ['new' => 'جديد', 'preparing' => 'قيد التحضير', 'done' => 'تم التسليم', 'cancelled' => 'ملغي'];
const RES_ST = ['new' => 'جديد', 'confirmed' => 'مؤكد', 'seated' => 'حضر', 'cancelled' => 'ملغي'];
function badge(string $st, array $labels): string { return '<span class="st st--' . e($st) . '">' . e($labels[$st] ?? $st) . '</span>'; }

/** Save an uploaded image into uploads/<dir>, resized (max 1600px) and converted to webp when GD allows. */
function save_upload(array $f, string $dir): ?string {
    if (empty($f['tmp_name']) || !is_uploaded_file($f['tmp_name']) || $f['size'] > 12 * 1024 * 1024) return null;
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);
    $ext = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'][$mime] ?? null;
    if (!$ext) return null;
    $name = date('ymd') . '-' . bin2hex(random_bytes(5));
    $dest = BC_UPLOADS . "/$dir/" . $name;
    if (function_exists('imagecreatefromstring') && function_exists('imagewebp')) {
        $im = @imagecreatefromstring((string)file_get_contents($f['tmp_name']));
        if ($im) {
            $w = imagesx($im); $h = imagesy($im); $max = 1600;
            if (max($w, $h) > $max) { $r = $max / max($w, $h); $im2 = imagescale($im, (int)($w * $r), (int)($h * $r)); imagedestroy($im); $im = $im2; }
            imagepalettetotruecolor($im); imagealphablending($im, true); imagesavealpha($im, true);
            imagewebp($im, $dest . '.webp', 82); imagedestroy($im);
            return "uploads/$dir/$name.webp";
        }
    }
    move_uploaded_file($f['tmp_name'], $dest . '.' . $ext);
    return "uploads/$dir/$name.$ext";
}
function csv_download(string $name, array $head, array $rows): void {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $name . '-' . date('Y-m-d') . '.csv"');
    $o = fopen('php://output', 'w');
    fwrite($o, "\xEF\xBB\xBF");
    fputcsv($o, $head);
    foreach ($rows as $r) fputcsv($o, $r);
    exit;
}

function icon(string $name): string {
    $d = [
        'home' => 'M3 11.5 12 4l9 7.5M5.5 10v10h13V10',
        'items' => 'M7 3h10l-1 18H8zM6 7h12M10 3v4M14 3v4',
        'cats' => 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
        'disc' => 'M4 8h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4zM10 8v10M15 11l-3 3',
        'events' => 'M4 6h16v14H4zM4 10h16M8 3v5M16 3v5M12 14l1 2 2 .3-1.5 1.4.4 2.1-1.9-1-1.9 1 .4-2.1L9 16.3l2-.3z',
        'orders' => 'M6 2h12v20l-3-2-3 2-3-2-3 2zM9 7h6M9 11h6M9 15h3',
        'res' => 'M3 10h18M5 10v9M19 10v9M7 6h10l2 4H5zM9 19h6',
        'settings' => 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1-2 3.4-.2-.1a1.6 1.6 0 0 0-1.8.1 1.6 1.6 0 0 0-.8 1.4V22h-4v-.3a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1-2-3.4.2-.1A1.6 1.6 0 0 0 4.6 15 1.6 1.6 0 0 0 3.1 14H3v-4h.3a1.6 1.6 0 0 0 1.4-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1 2-3.4.2.1a1.6 1.6 0 0 0 1.8-.1A1.6 1.6 0 0 0 9 2.3V2h4v.3a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1 2 3.4-.2.1a1.6 1.6 0 0 0-.3 1.8 1.6 1.6 0 0 0 1.5 1h.1v4h-.3a1.6 1.6 0 0 0-1.3.9z',
        'plus' => 'M12 5v14M5 12h14', 'eye' => 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
        'out' => 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10', 'ext' => 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
        'wa' => 'M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z', 'search' => 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
        'trash' => 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13', 'edit' => 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4', 'copy' => 'M8 8h12v12H8zM4 16V4h12',
        'down' => 'M12 4v12M6 11l6 6 6-6M4 20h16',
    ][$name] ?? '';
    return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="' . $d . '"/></svg>';
}

function admin_head(string $title, string $active = '', string $actions = ''): void {
    $newOrders = count(array_filter(bc_load('orders'), fn($o) => ($o['status'] ?? '') === 'new'));
    $newRes = count(array_filter(bc_load('reservations'), fn($r) => ($r['status'] ?? '') === 'new'));
    $nav = [
        'index' => ['الرئيسية', 'home', 0], 'orders' => ['الطلبات', 'orders', $newOrders], 'reservations' => ['الحجوزات', 'res', $newRes],
        'items' => ['الأصناف', 'items', 0], 'categories' => ['الأقسام', 'cats', 0], 'discounts' => ['الخصومات', 'disc', 0],
        'events' => ['الفعاليات والدعوات', 'events', 0], 'settings' => ['الإعدادات', 'settings', 0],
    ];
    ?><!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#140A04">
<title><?= e($title) ?> · لوحة باركود</title>
<link rel="icon" type="image/png" href="../assets/brand/favicon.png">
<link href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&family=Didact+Gothic&display=swap" rel="stylesheet">
<link rel="stylesheet" href="admin.css?v=<?= BC_VERSION ?>">
</head><body>
<aside class="side" id="side">
  <a class="side__brand" href="index.php"><img src="../assets/brand/roundel-cream.png" alt=""><span>لوحة التحكم<small class="latin">BARCODE · CAFE</small></span></a>
  <nav class="side__nav">
    <?php foreach ($nav as $k => [$label, $ic, $n]): ?>
      <a href="<?= $k ?>.php" class="<?= $active === $k ? 'is-on' : '' ?>"><?= icon($ic) ?><span><?= $label ?></span><?php if ($n): ?><b class="pill"><?= $n ?></b><?php endif; ?></a>
    <?php endforeach; ?>
  </nav>
  <div class="side__foot">
    <a href="../" target="_blank"><?= icon('ext') ?> فتح الموقع</a>
    <a href="logout.php"><?= icon('out') ?> تسجيل الخروج</a>
  </div>
</aside>
<div class="scrim" onclick="document.body.classList.remove('nav-open')"></div>
<div class="main">
  <header class="top">
    <button class="top__burger" onclick="document.body.classList.toggle('nav-open')" aria-label="القائمة">☰</button>
    <h1><?= e($title) ?></h1>
    <div class="top__actions"><?= $actions ?></div>
  </header>
  <?php if ($f = flash()): ?><div class="flash flash--<?= e($f[1]) ?>"><?= e($f[0]) ?></div><?php endif; ?>
<?php
}

function admin_foot(): void { ?>
</div>
<script src="admin.js?v=<?= BC_VERSION ?>"></script>
</body></html>
<?php }
