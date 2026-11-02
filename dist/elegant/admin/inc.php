<?php
/** Dashboard core: auth, layout, small helpers. The dashboard is Arabic-only and always RTL. */
require dirname(__DIR__) . '/inc/bootstrap.php';
require dirname(__DIR__) . '/inc/orders.php';
header('X-Robots-Tag: noindex');
header('X-Frame-Options: SAMEORIGIN');

function admin_file(): string { return EB_STORAGE . '/admin.json'; }
function admin_exists(): bool { return is_file(admin_file()); }
function is_admin(): bool { return !empty($_SESSION['eb_admin']) && ($_SESSION['eb_admin_ip'] ?? '') === ($_SERVER['REMOTE_ADDR'] ?? ''); }
function require_admin(): void {
    if (!admin_exists() || !is_admin()) { header('Location: login.php'); exit; }
}
function post_ok(): bool {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') return false;
    if (!csrf_ok()) { flash('انتهت الجلسة، حاول تاني', 'bad'); return false; }
    return true;
}
function flash(?string $msg = null, string $type = 'ok') {
    if ($msg !== null) { $_SESSION['flash'] = [$msg, $type]; return null; }
    $f = $_SESSION['flash'] ?? null; unset($_SESSION['flash']); return $f;
}
function back(string $to): void { header('Location: ' . $to); exit; }
function img_src(string $p): string { return preg_match('~^https?://~', $p) ? $p : '../' . ltrim($p, '/'); }
function egp($n): string { return number_format((float)$n) . ' ج.م'; }
function status_badge(string $s): string { return '<span class="st st--' . e($s) . '">' . e(status_label($s)) . '</span>'; }
function fmt_date(string $iso): string { return date('d/m/Y · H:i', strtotime($iso)); }

/** Save an uploaded image (jpg/png/webp) into uploads/products, resized to max 1400px when GD is available. */
function save_upload(array $f): ?string {
    if (empty($f['tmp_name']) || !is_uploaded_file($f['tmp_name']) || $f['size'] > 10 * 1024 * 1024) return null;
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);
    $ext = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'][$mime] ?? null;
    if (!$ext) return null;
    $name = date('ymd') . '-' . bin2hex(random_bytes(5));
    $dest = EB_UPLOADS . '/products/' . $name;
    if (function_exists('imagecreatefromstring') && function_exists('imagewebp')) {
        $im = @imagecreatefromstring((string)file_get_contents($f['tmp_name']));
        if ($im) {
            $w = imagesx($im); $h = imagesy($im); $max = 1400;
            if (max($w, $h) > $max) { $r = $max / max($w, $h); $im2 = imagescale($im, (int)($w * $r), (int)($h * $r)); imagedestroy($im); $im = $im2; }
            imagepalettetotruecolor($im); imagealphablending($im, true); imagesavealpha($im, true);
            imagewebp($im, $dest . '.webp', 84); imagedestroy($im);
            return 'uploads/products/' . $name . '.webp';
        }
    }
    move_uploaded_file($f['tmp_name'], $dest . '.' . $ext);
    return 'uploads/products/' . $name . '.' . $ext;
}

function slugify(string $s): string {
    $s = strtolower(trim(preg_replace('/[^A-Za-z0-9]+/', '-', $s), '-'));
    return $s !== '' ? $s : 'p-' . bin2hex(random_bytes(3));
}

function admin_head(string $title, string $active = ''): void {
    $newCount = count(array_filter(eb_load('orders'), fn($o) => $o['status'] === 'new'));
    $nav = [
        'index' => ['الرئيسية', 'M3 12l9-8 9 8M5 10v10h14V10'],
        'orders' => ['الطلبات', 'M5 8h14l-1.2 12H6.2zM9 8V6.5a3 3 0 0 1 6 0V8'],
        'products' => ['المنتجات', 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5'],
        'categories' => ['المجموعات', 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'],
        'coupons' => ['أكواد الخصم', 'M4 8h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4zM10 8v10'],
        'shipping' => ['الشحن', 'M3 7h11v9H3zM14 10h4l3 3v3h-7z'],
        'subscribers' => ['المشتركات', 'M4 6h16v12H4zM4 7l8 6 8-6'],
        'settings' => ['الإعدادات', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM19 12l2-1-1-3-2 .3-1.3-1.3.3-2-3-1-1 2h-2l-1-2-3 1 .3 2L5.7 7.3 4 7 3 10l2 1v2l-2 1 1 3 2-.3 1.3 1.3-.3 2 3 1 1-2h2l1 2 3-1-.3-2 1.3-1.3 2 .3 1-3-2-1z'],
    ];
    ?><!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title><?= e($title) ?> · لوحة إليجانس</title>
<link rel="icon" href="../assets/img/brand/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="admin.css?v=<?= EB_VERSION ?>">
</head><body>
<aside class="side" data-side>
  <a class="side__brand" href="index.php"><img src="../assets/img/brand/logo-gold.png" alt=""><span>لوحة التحكم<small>Elegance Boutique</small></span></a>
  <nav>
    <?php foreach ($nav as $k => [$label, $d]): ?>
      <a href="<?= $k ?>.php" class="<?= $active === $k ? 'is-on' : '' ?>"><svg viewBox="0 0 24 24"><path d="<?= $d ?>"/></svg><?= $label ?><?php if ($k === 'orders' && $newCount): ?><b class="pill"><?= $newCount ?></b><?php endif; ?></a>
    <?php endforeach; ?>
  </nav>
  <div class="side__foot">
    <a href="../" target="_blank">↗ فتح المتجر</a>
    <a href="logout.php">تسجيل الخروج</a>
  </div>
</aside>
<div class="main">
  <header class="top">
    <button class="top__burger" onclick="document.querySelector('[data-side]').classList.toggle('is-open')" aria-label="القائمة">☰</button>
    <h1><?= e($title) ?></h1>
  </header>
  <?php if ($f = flash()): ?><div class="flash flash--<?= e($f[1]) ?>"><?= e($f[0]) ?></div><?php endif; ?>
<?php
}

function admin_foot(): void { ?>
</div>
<script>
document.querySelectorAll('[data-confirm]').forEach(el => el.addEventListener('click', e => { if (!confirm(el.dataset.confirm)) e.preventDefault(); }));
</script>
</body></html>
<?php }
