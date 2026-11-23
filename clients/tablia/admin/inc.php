<?php
/** Dashboard core: session, auth, CSRF, layout and small helpers. Arabic, RTL. */
require dirname(__DIR__) . '/inc/core.php';
if (session_status() === PHP_SESSION_NONE) {
    $https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    session_name($https ? '__Secure-bc_admin' : 'bc_admin');
    $cookiePath = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/')), '/') . '/';
    session_set_cookie_params(['lifetime' => 0, 'path' => $cookiePath, 'httponly' => true, 'samesite' => 'Lax', 'secure' => $https]);
    session_start();
    // idle timeout 2h, hard limit 12h, and the session stays tied to the browser that signed in
    $now = time(); $fp = hash('sha256', (string)($_SERVER['HTTP_USER_AGENT'] ?? ''));
    if (!empty($_SESSION['uid'])) {
        if ($now - (int)($_SESSION['seen'] ?? $now) > 7200 || $now - (int)($_SESSION['born'] ?? $now) > 43200 || ($_SESSION['fp'] ?? $fp) !== $fp) {
            $_SESSION = []; session_regenerate_id(true); $_SESSION['expired'] = 1;
        }
    }
    $_SESSION['seen'] = $now;
}
header('X-Robots-Tag: noindex, nofollow');
header('X-Frame-Options: DENY');
header('Cache-Control: no-store, private');
header("Content-Security-Policy: default-src 'self'; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'self'; object-src 'none'");

/* ---------- users, roles, permissions ---------- */
const ROLES = [
    'owner' => ['مدير عام', 'كل الصلاحيات، بما فيها المستخدمين والأمان'],
    'manager' => ['مدير تشغيل', 'كل شيء ما عدا إدارة المستخدمين'],
    'kitchen' => ['شيف / المطبخ', 'خطة المطبخ والطلبات وتغيير حالتها فقط'],
    'accountant' => ['محاسب', 'الطلبات والعزايم والتقارير والتصدير'],
    'editor' => ['محرر المنيو', 'الأصناف والأقسام والباقات والصور'],
    'marketer' => ['مُعلن / تسويق', 'الخصومات والكوبونات والعملاء والشريط والسوشيال والتقارير'],
    'cashier' => ['خدمة العملاء', 'الطلبات والعزايم والعملاء'],
    'custom' => ['صلاحيات مخصصة', 'تختار الصلاحيات واحدة واحدة'],
];
const PERMS = [
    'orders.view' => 'عرض الطلبات', 'orders.edit' => 'إضافة الطلبات وتعديلها وتغيير حالتها', 'orders.delete' => 'حذف الطلبات',
    'res.view' => 'عرض العزايم والمناسبات', 'res.edit' => 'إضافة العزايم وتعديلها والعربون', 'res.delete' => 'حذف العزايم',
    'kitchen.view' => 'خطة المطبخ اليومية',
    'items.edit' => 'إضافة وتعديل الأصناف والأقسام', 'items.delete' => 'حذف الأصناف والأقسام', 'pack.edit' => 'باقات البوفيه والسيت منيو',
    'disc.edit' => 'الخصومات والكوبونات', 'customers.view' => 'العملاء والتواصل معهم',
    'reports.view' => 'التقارير', 'export' => 'تنزيل ملفات Excel',
    'settings.site' => 'بيانات التواصل وخدمات الموقع', 'settings.marketing' => 'الشريط المتحرك والسوشيال وكلمة ماما رحاب',
    'log.view' => 'سجل النشاط', 'undo.all' => 'التراجع عن عمليات الموظفين الآخرين', 'backup.manage' => 'النسخ الاحتياطي والاسترجاع', 'users.manage' => 'إدارة المستخدمين والصلاحيات',
];
const ROLE_PERMS = [
    'manager' => ['orders.view', 'orders.edit', 'orders.delete', 'res.view', 'res.edit', 'res.delete', 'kitchen.view', 'items.edit', 'items.delete', 'pack.edit', 'disc.edit', 'customers.view', 'reports.view', 'export', 'settings.site', 'settings.marketing', 'log.view', 'undo.all'],
    'kitchen' => ['orders.view', 'orders.edit', 'kitchen.view', 'res.view'],
    'accountant' => ['orders.view', 'orders.edit', 'orders.delete', 'res.view', 'res.edit', 'kitchen.view', 'customers.view', 'reports.view', 'export', 'log.view'],
    'editor' => ['items.edit', 'items.delete', 'pack.edit'],
    'marketer' => ['disc.edit', 'customers.view', 'reports.view', 'export', 'settings.marketing'],
    'cashier' => ['orders.view', 'orders.edit', 'res.view', 'res.edit', 'customers.view', 'kitchen.view'],
];
/** users.json; created once from the original single admin account. */
function users_all(): array {
    $u = bc_load('users');
    if (!$u) {
        $a = bc_load('admin');
        if (!empty($a['hash'])) {
            $u = [['id' => 'u1', 'user' => $a['user'] ?? 'admin', 'name' => 'المدير', 'role' => 'owner', 'perms' => [], 'hash' => $a['hash'],
                'active' => true, 'seeded' => !empty($a['seeded']) || empty($a['changed']), 'created' => now_iso(), 'last' => '']];
            bc_save('users', $u);
        }
    }
    return $u;
}
function me(): ?array {
    static $me = false;
    if ($me !== false) return $me;
    $me = null;
    $uid = $_SESSION['uid'] ?? '';
    if ($uid !== '') foreach (users_all() as $u) if ($u['id'] === $uid && !empty($u['active'])) $me = $u;
    return $me;
}
function user_perms(array $u): array {
    if (($u['role'] ?? '') === 'owner') return array_keys(PERMS);
    if (($u['role'] ?? '') === 'custom') return array_values(array_intersect((array)($u['perms'] ?? []), array_keys(PERMS)));
    return ROLE_PERMS[$u['role'] ?? ''] ?? [];
}
function can(string ...$perms): bool {
    $u = me(); if (!$u) return false;
    $mine = user_perms($u);
    foreach ($perms as $p) if (in_array($p, $mine, true)) return true;
    return false;
}
function is_admin(): bool { return me() !== null; }
function require_admin(): void { if (!is_admin()) { header('Location: login.php'); exit; } }
function require_perm(string ...$perms): void {
    require_admin();
    if (can(...$perms)) return;
    admin_head('غير مسموح', '');
    echo '<section class="card denied"><h3>الصفحة دي مش ضمن صلاحياتك</h3><p class="muted">لو محتاج تدخلها، اطلب من المدير العام يعدّل صلاحيات حسابك من صفحة المستخدمين.</p><a class="b" href="index.php">رجوع للرئيسية</a></section>';
    admin_foot(); exit;
}
/** Deny a single action inside a page the user can open. */
function need(string ...$perms): void { if (!can(...$perms)) { flash('العملية دي مش ضمن صلاحياتك', 'bad'); go($_SERVER['REQUEST_URI'] ?? 'index.php'); } }
function weak_pass(string $p): ?string {
    if (strlen($p) < 10) return 'كلمة المرور لازم 10 حروف على الأقل';
    if (!preg_match('/[A-Za-z]/', $p) || !preg_match('/\d/', $p)) return 'كلمة المرور لازم يكون فيها حروف إنجليزي وأرقام';
    if (preg_match('/^(.)\1+$/', $p) || in_array(strtolower($p), ['password123', '1234567890', 'qwerty1234', 'tablia1234', 'admin12345'], true)) return 'كلمة المرور سهلة جدًا';
    return null;
}
function role_label(array $u): string { return ROLES[$u['role'] ?? ''][0] ?? ($u['role'] ?? ''); }

/* ---------- undo: every dashboard write keeps the records it changed, grouped per request ---------- */
const UNDO_SKIP = ['log', 'undo', 'migrations', 'users', 'admin', 'ratelimit', 'invites'];
function bc_req(): string { static $r = null; if ($r === null) $r = bin2hex(random_bytes(6)); return $r; }
function bc_is_id_list($a): bool {
    if (!is_array($a)) return false;
    if (!$a) return true;
    if (array_keys($a) !== range(0, count($a) - 1)) return false;
    foreach ($a as $r) if (!is_array($r) || !isset($r['id'])) return false;
    return true;
}
/** Smallest set of steps that turns $new back into $old. */
function bc_diff($old, $new): array {
    if (json_encode($old) === json_encode($new)) return [];
    if (bc_is_id_list($old) && bc_is_id_list($new) && count($old) + count($new) > 0) {
        $o = []; foreach ($old as $i => $r) $o[(string)$r['id']] = [$i, $r];
        $n = []; foreach ($new as $r) $n[(string)$r['id']] = $r;
        $ch = [];
        foreach ($o as $id => [$i, $r]) {
            if (!isset($n[$id])) $ch[] = ['t' => 'del', 'id' => $id, 'pos' => $i, 'before' => $r];
            elseif (json_encode($n[$id]) !== json_encode($r)) $ch[] = ['t' => 'mod', 'id' => $id, 'before' => $r];
        }
        foreach ($n as $id => $r) if (!isset($o[$id])) $ch[] = ['t' => 'add', 'id' => $id];
        return $ch ?: [['t' => 'all', 'before' => $old]];
    }
    return [['t' => 'all', 'before' => $old]];
}
function bc_on_change(string $name, $old, $new): void {
    if (in_array($name, UNDO_SKIP, true) || !empty($GLOBALS['bc_no_undo']) || session_status() !== PHP_SESSION_ACTIVE) return;
    $u = me(); if (!$u) return;
    $ch = bc_diff($old, $new); if (!$ch) return;
    $row = ['req' => bc_req(), 'at' => now_iso(), 'uid' => $u['id'], 'file' => $name, 'ch' => $ch];
    $GLOBALS['bc_no_undo'] = true;
    bc_tx('undo', function (&$d) use ($row) { array_unshift($d, $row); if (count($d) > 600) $d = array_slice($d, 0, 600); });
    $GLOBALS['bc_no_undo'] = false;
    $_SESSION['undo_req'] = bc_req();
}
/** Put the records of one request back the way they were. Returns the number of files touched. */
function bc_undo(string $req): int {
    $rows = array_values(array_filter(bc_load('undo'), fn($r) => $r['req'] === $req && empty($r['undone'])));
    foreach ($rows as $row) {               // newest first, so steps unwind in reverse order
        bc_tx($row['file'], function (&$d) use ($row) {
            foreach (array_reverse($row['ch']) as $c) {
                if ($c['t'] === 'all') { $d = $c['before']; continue; }
                if (!is_array($d)) $d = [];
                $idx = null; foreach ($d as $i => $x) if ((string)($x['id'] ?? '') === $c['id']) { $idx = $i; break; }
                if ($c['t'] === 'add') { if ($idx !== null) array_splice($d, $idx, 1); }
                elseif ($c['t'] === 'mod') { if ($idx !== null) $d[$idx] = $c['before']; else array_unshift($d, $c['before']); }
                elseif ($c['t'] === 'del' && $idx === null) array_splice($d, min((int)$c['pos'], count($d)), 0, [$c['before']]);
            }
            $d = is_array($d) && bc_is_id_list($d) ? array_values($d) : $d;
        });
    }
    if ($rows) { $GLOBALS['bc_no_undo'] = true; bc_tx('undo', function (&$d) use ($req) { foreach ($d as &$r) if ($r['req'] === $req) $r['undone'] = now_iso(); }); $GLOBALS['bc_no_undo'] = false; }
    return count($rows);
}
function undo_ok(string $req): bool {
    if ($req === '') return false;
    foreach (bc_load('undo') as $r) if ($r['req'] === $req && empty($r['undone'])) return $r['uid'] === (me()['id'] ?? '') || can('undo.all');
    return false;
}

/* ---------- activity log ---------- */
function log_act(string $action, string $detail = ''): void {
    $u = me();
    $row = ['at' => now_iso(), 'uid' => $u['id'] ?? '', 'name' => $u['name'] ?? ($u['user'] ?? 'النظام'), 'action' => $action, 'detail' => mb_substr($detail, 0, 300), 'req' => bc_req()];
    bc_tx('log', function (&$d) use ($row) { array_unshift($d, $row); if (count($d) > 4000) $d = array_slice($d, 0, 4000); });
}
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
const CAT_KINDS = ['meal' => 'وجبات جاهزة (طبلية)', 'kilo' => 'بالكيلو', 'tray' => 'بالصينية / القطعة'];
const ORDER_ST = ['new' => 'جديد', 'preparing' => 'قيد التحضير', 'ready' => 'جاهز', 'done' => 'تم التسليم', 'cancelled' => 'ملغي'];
const ORDER_TYPES = ORDER_TYPES_ALL;
const PAY_METHODS = ['' => 'لم يُدفع بعد', 'cash' => 'كاش', 'card' => 'فيزا', 'instapay' => 'إنستاباي', 'wallet' => 'محفظة إلكترونية'];
const RES_ST = ['new' => 'جديد', 'quoted' => 'اتبعت عرض سعر', 'confirmed' => 'مؤكد (عربون)', 'done' => 'اتنفذ', 'cancelled' => 'ملغي'];
function wa_phone(string $p): string { $d = preg_replace('/\D/', '', digits_en($p)); return strpos($d, '0') === 0 ? '2' . $d : $d; }
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
        'send' => 'M22 2 11 13M22 2l-7 20-4-9-9-4z', 'qr' => 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2zM16 16h2v2h-2z', 'undo' => 'M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11', 'shield' => 'M12 3 4 6v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V6zM9 12l2 2 4-4', 'chart' => 'M4 20V10M10 20V4M16 20v-7M22 20H2', 'users' => 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a6 6 0 0 1 12 0v1M16 3.5a4 4 0 0 1 0 7M18 14a6 6 0 0 1 4 6v1',
        'log' => 'M12 7v5l3 2M12 3a9 9 0 1 0 9 9', 'pot' => 'M4 10h16v3a7 7 0 0 1-7 7h-2a7 7 0 0 1-7-7zM2 10h20M9 6c0-1 1-1.5 1-2.5M13 6c0-1 1-1.5 1-2.5', 'key' => 'M8 14a4 4 0 1 1 3.5-6H21v3h-2v3h-3v-3h-4.5A4 4 0 0 1 8 14z', 'phone' => 'M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z', 'user' => 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21v-1a8 8 0 0 1 16 0v1', 'print' => 'M6 9V3h12v6M6 18H4v-7h16v7h-2M8 14h8v7H8z', 'receipt' => 'M6 2h12v20l-3-2-3 2-3-2-3 2zM9 7h6M9 11h6M9 15h4',
    ][$name] ?? '';
    return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="' . $d . '"/></svg>';
}

function admin_head(string $title, string $active = '', string $actions = ''): void {
    $newOrders = can('orders.view') ? count(array_filter(bc_load('orders'), fn($o) => ($o['status'] ?? '') === 'new')) : 0;
    $newRes = can('res.view') ? count(array_filter(bc_load('reservations'), fn($r) => ($r['status'] ?? '') === 'new')) : 0;
    $today = date('Y-m-d');
    $todayOrders = can('kitchen.view') ? count(array_filter(bc_load('orders'), fn($o) => ($o['day'] ?? '') === $today && !in_array($o['status'] ?? '', ['cancelled', 'done'], true))) : 0;
    $groups = [
        '' => ['index' => ['الرئيسية', 'home', 0, []]],
        'التشغيل' => ['orders' => ['الطلبات', 'orders', $newOrders, ['orders.view']], 'kitchen' => ['خطة المطبخ', 'pot', $todayOrders, ['kitchen.view']], 'reservations' => ['العزايم والمناسبات', 'res', $newRes, ['res.view']], 'customers' => ['العملاء', 'users', 0, ['customers.view']]],
        'المنيو' => ['items' => ['الأصناف والأسعار', 'items', 0, ['items.edit']], 'categories' => ['الأقسام', 'cats', 0, ['items.edit']], 'packages' => ['باقات البوفيه والسيت', 'events', 0, ['pack.edit']], 'discounts' => ['الخصومات والعروض', 'disc', 0, ['disc.edit']], 'charges' => ['التوصيل والرسوم', 'receipt', 0, ['settings.site']]],
        'التسويق' => ['invite' => ['إرسال على واتساب', 'send', 0, ['customers.view', 'disc.edit']], 'photos' => ['صور المنيو', 'down', 0, ['items.edit']]],
        'الإدارة' => ['reports' => ['التقارير', 'chart', 0, ['reports.view']], 'log' => ['سجل النشاط والتراجع', 'log', 0, ['log.view']], 'backups' => ['النسخ الاحتياطي', 'shield', 0, ['backup.manage']], 'users' => ['المستخدمين والصلاحيات', 'key', 0, ['users.manage']], 'settings' => ['الإعدادات', 'settings', 0, ['settings.site', 'settings.marketing']]],
    ];
    $me = me();
    ?><!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#120D0B">
<title><?= e($title) ?> · لوحة طبلية</title>
<link rel="icon" type="image/png" href="../assets/brand/favicon.png">
<link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="admin.css?v=<?= BC_VERSION ?>">
</head><body<?= can('orders.view', 'res.view') ? ' data-notify="1"' : '' ?>>
<aside class="side" id="side">
  <a class="side__brand" href="index.php"><img src="../assets/brand/badge.webp" alt=""><span>لوحة طبلية<small class="latin">TABLIYYA · KITCHEN</small></span></a>
  <nav class="side__nav">
    <?php foreach ($groups as $g => $links): $links = array_filter($links, fn($l) => !$l[3] || can(...$l[3])); if (!$links) continue; ?>
      <?php if ($g !== ''): ?><div class="side__group"><?= $g ?></div><?php endif; ?>
      <?php foreach ($links as $k => [$label, $ic, $n]): ?>
        <a href="<?= $k ?>.php" class="<?= $active === $k ? 'is-on' : '' ?>" data-nav="<?= $k ?>"><?= icon($ic) ?><span><?= $label ?></span><b class="pill"<?= $n ? '' : ' hidden' ?>><?= $n ?></b></a>
      <?php endforeach; ?>
    <?php endforeach; ?>
  </nav>
  <button type="button" class="nbell" id="nbell" hidden><?= icon('send') ?> شغّل تنبيهات الطلبات والعزايم بالصوت</button>
  <div class="side__foot">
    <?php if ($me): ?><a class="side__me <?= $active === 'account' ? 'is-on' : '' ?>" href="account.php"><i><?= e(mb_substr($me['name'] ?: $me['user'], 0, 1)) ?></i><span><?= e($me['name'] ?: $me['user']) ?><small><?= e(role_label($me)) ?></small></span></a><?php endif; ?>
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
  <?php if ($f = flash()): $ur = $_SESSION['undo_req'] ?? ''; unset($_SESSION['undo_req']); ?><div class="flash flash--<?= e($f[1]) ?>"><span><?= e($f[0]) ?></span><?php if ($f[1] === 'ok' && undo_ok($ur)): ?><form method="post" action="undo.php" class="flash__undo"><?= csrf_field() ?><input type="hidden" name="req" value="<?= e($ur) ?>"><input type="hidden" name="back" value="<?= e($_SERVER['REQUEST_URI'] ?? '') ?>"><button class="b b--sm"><?= icon('undo') ?> تراجع</button></form><?php endif; ?></div><?php endif; ?>
<?php
}

function admin_foot(): void { ?>
</div>
<script src="admin.js?v=<?= BC_VERSION ?>"></script>
</body></html>
<?php }
