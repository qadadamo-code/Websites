<?php
/** Dashboard core: auth, layout, schema-driven editors. Arabic, RTL. */
require dirname(__DIR__) . '/inc/core.php';
start_session();
header('X-Robots-Tag: noindex');
header('X-Frame-Options: SAMEORIGIN');
header('Referrer-Policy: same-origin');

function admin_file(): string { return AL_STORAGE . '/admin.json'; }
function admin_exists(): bool { return is_file(admin_file()); }
function is_admin(): bool { return !empty($_SESSION['al_admin']); }
function require_admin(): void { if (!admin_exists() || !is_admin()) { header('Location: login.php'); exit; } }
function flash(?string $msg = null, string $type = 'ok') {
    if ($msg !== null) { $_SESSION['flash'] = [$msg, $type]; return null; }
    $f = $_SESSION['flash'] ?? null; unset($_SESSION['flash']); return $f;
}
function back(string $to): void { header('Location: ' . $to); exit; }
function post_ok(): bool {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') return false;
    if (!csrf_ok()) { flash('انتهت الجلسة، حاول مرة أخرى', 'bad'); return false; }
    return true;
}
function fmt_date(string $iso): string { return $iso ? date('Y/m/d · H:i', strtotime($iso)) : ''; }

const STATUS = [
    'new' => 'جديد', 'contacted' => 'تم التواصل', 'confirmed' => 'مؤكد', 'done' => 'مكتمل', 'cancelled' => 'ملغي',
];
const TYPES = ['party' => 'حفلة', 'rental' => 'تأجير منزلي', 'visit' => 'زيارة', 'contact' => 'رسالة'];

function status_badge(string $s): string { return '<span class="st st--' . e($s) . '">' . e(STATUS[$s] ?? $s) . '</span>'; }

/* ---------- dot-path helpers for the schema editor ---------- */
function path_get(array $a, string $p) {
    foreach (explode('.', $p) as $k) { if (!is_array($a) || !array_key_exists($k, $a)) return null; $a = $a[$k]; }
    return $a;
}
function path_set(array &$a, string $p, $v): void {
    $ref = &$a;
    foreach (explode('.', $p) as $k) { if (!isset($ref[$k]) || !is_array($ref[$k])) $ref[$k] = $ref[$k] ?? []; $ref = &$ref[$k]; }
    $ref = $v;
}

/** Collections editable from the dashboard. Field: [path, label, type]. */
function schemas(): array {
    $bi = fn($p, $l, $t = 'text') => [[$p . '.ar', $l . ' (عربي)', $t], [$p . '.en', $l . ' (English)', $t]];
    return [
        'packages' => ['باقات الحفلات', 'name.ar', array_merge(
            [['id', 'المعرّف (إنجليزي بدون مسافات)', 'id']], $bi('name', 'اسم الباقة'),
            [['price', 'السعر (درهم)', 'number'], ['kids', 'عدد الأطفال المشمول', 'number']], $bi('duration', 'المدة'),
            $bi('includes', 'ماذا تشمل (سطر لكل بند)', 'lines'), [['featured', 'باقة مميزة', 'bool']]
        )],
        'addons' => ['الإضافات', 'name.ar', array_merge(
            [['id', 'المعرّف', 'id']], $bi('name', 'الاسم'), [['price', 'السعر (درهم)', 'number'], ['icon', 'الأيقونة', 'icon']]
        )],
        'rentals' => ['ألعاب التأجير المنزلي', 'name.ar', array_merge(
            [['id', 'المعرّف', 'id']], $bi('name', 'الاسم'), $bi('desc', 'الوصف', 'textarea'),
            [['size', 'المقاس', 'text'], ['price', 'السعر لليوم (درهم)', 'number'], ['img', 'الصورة', 'image']]
        )],
        'zones' => ['مناطق اللعب', 'title.ar', array_merge(
            [['id', 'المعرّف', 'id']], $bi('title', 'الاسم'), $bi('desc', 'الوصف', 'textarea'), $bi('age', 'العمر'), $bi('tag', 'الوسم'),
            [['img', 'الصورة', 'image']]
        )],
        'branches' => ['الفروع وأوقات العمل', 'name.ar', array_merge(
            [['id', 'المعرّف', 'id']], $bi('name', 'اسم الفرع'), $bi('floor', 'الطابق / الموقع'), $bi('city', 'المدينة'),
            [['map', 'رابط خرائط Google', 'text'],
             ['hours.weekday.0', 'أيام الأسبوع: يفتح', 'time'], ['hours.weekday.1', 'أيام الأسبوع: يغلق', 'time'],
             ['hours.weekend.0', 'الخميس إلى السبت: يفتح', 'time'], ['hours.weekend.1', 'الخميس إلى السبت: يغلق', 'time'],
             ['color', 'اللون', 'color']]
        )],
        'reviews' => ['آراء العملاء', 'name.ar', array_merge($bi('name', 'الاسم'), $bi('text', 'الرأي', 'textarea'), [['stars', 'النجوم (1-5)', 'number']])],
        'faq' => ['الأسئلة الشائعة', 'q.ar', array_merge($bi('q', 'السؤال'), $bi('a', 'الإجابة', 'textarea'))],
    ];
}

/** Save an uploaded image into uploads/ (webp when GD exists). Returns the stored path or null. */
function save_upload(array $f): ?string {
    if (empty($f['tmp_name']) || !is_uploaded_file($f['tmp_name']) || $f['size'] > 10 * 1024 * 1024) return null;
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);
    $ext = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'][$mime] ?? null;
    if (!$ext) return null;
    $name = date('ymd') . '-' . bin2hex(random_bytes(5));
    if (function_exists('imagecreatefromstring') && function_exists('imagewebp')) {
        $im = @imagecreatefromstring((string)file_get_contents($f['tmp_name']));
        if ($im) {
            $w = imagesx($im); $h = imagesy($im); $max = 1600;
            if (max($w, $h) > $max) { $r = $max / max($w, $h); $im2 = imagescale($im, (int)($w * $r), (int)($h * $r)); imagedestroy($im); $im = $im2; }
            imagepalettetotruecolor($im); imagealphablending($im, true); imagesavealpha($im, true);
            imagewebp($im, AL_UPLOADS . "/$name.webp", 84); imagedestroy($im);
            return "uploads/$name.webp";
        }
    }
    move_uploaded_file($f['tmp_name'], AL_UPLOADS . "/$name.$ext");
    return "uploads/$name.$ext";
}
function img_src(?string $p): string { $p = (string)$p; return $p === '' ? '' : (str_starts_with($p, 'uploads/') ? '../' . $p : '../img/' . $p); }

function admin_head(string $title, string $active = ''): void {
    $new = count(array_filter(al_load('bookings'), fn($b) => $b['status'] === 'new'));
    $nav = [
        'index' => ['الرئيسية', 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z'],
        'bookings' => ['الحجوزات والطلبات', 'M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z'],
        'c-packages' => ['باقات الحفلات', 'M20 12v8H4v-8M2 7h20v5H2zM12 22V7M12 7S10 3 7.5 3a2 2 0 0 0 0 4M12 7s2-4 4.5-4a2 2 0 0 1 0 4'],
        'c-addons' => ['الإضافات', 'M12 5v14M5 12h14'],
        'c-rentals' => ['التأجير المنزلي', 'M3 21h18M5 21V10l7-6 7 6v11M9 21v-6h6v6'],
        'c-zones' => ['مناطق اللعب', 'M12 2l3 7h7l-5.5 4.5 2 7.5-6.5-4.5L5.5 21l2-7.5L2 9h7z'],
        'c-branches' => ['الفروع والأوقات', 'M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'],
        'c-reviews' => ['آراء العملاء', 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'],
        'c-faq' => ['الأسئلة الشائعة', 'M9 9a3 3 0 1 1 4 2.8c-.6.3-1 .9-1 1.6V14M12 18h.01'],
        'settings' => ['الإعدادات والتواصل', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z'],
    ];
    ?><!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title><?= e($title) ?> · لوحة أرض المغامرات</title>
<link rel="icon" href="../favicon.png"><link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Readex+Pro:wght@500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="admin.css?v=<?= AL_VERSION ?>"></head><body>
<input type="checkbox" id="nav-t" hidden>
<aside class="side">
  <a class="brand" href="index.php"><img src="../img/logo-512.webp" alt=""><span>لوحة التحكم<small>Adventure Land</small></span></a>
  <nav>
  <?php foreach ($nav as $k => [$label, $d]):
      $href = str_starts_with($k, 'c-') ? 'content.php?c=' . substr($k, 2) : "$k.php"; ?>
    <a href="<?= $href ?>" class="<?= $active === $k ? 'on' : '' ?>"><svg viewBox="0 0 24 24"><path d="<?= $d ?>"/></svg><?= $label ?><?php if ($k === 'bookings' && $new): ?><b class="pill"><?= $new ?></b><?php endif; ?></a>
  <?php endforeach; ?>
  </nav>
  <div class="side__foot"><a href="../" target="_blank">عرض الموقع ↗</a><a href="logout.php">تسجيل الخروج</a></div>
</aside>
<main class="main">
<header class="top"><label for="nav-t" class="burger" aria-label="القائمة"><span></span><span></span><span></span></label><h1><?= e($title) ?></h1></header>
<?php if ($f = flash()): ?><div class="flash flash--<?= e($f[1]) ?>"><?= e($f[0]) ?></div><?php endif;
}

function admin_foot(): void { echo "</main></body></html>"; }
