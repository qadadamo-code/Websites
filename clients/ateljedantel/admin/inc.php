<?php
/** Dashboard core: session, users and roles, CSRF, undo, activity log, layout. Swedish first, English toggle. */
require dirname(__DIR__) . '/inc/core.php';
if (session_status() === PHP_SESSION_NONE) {
    $https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    session_name($https ? '__Secure-ad_admin' : 'ad_admin');
    $cookiePath = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/')), '/') . '/';
    session_set_cookie_params(['lifetime' => 0, 'path' => $cookiePath, 'httponly' => true, 'samesite' => 'Strict', 'secure' => $https]);
    session_start();
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
header("Content-Security-Policy: default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'self'; object-src 'none'");

/* ---------- dashboard language ---------- */
if (isset($_GET['alang']) && in_array($_GET['alang'], ['sv', 'en'], true)) { $_SESSION['alang'] = $_GET['alang']; }
function alang(): string { return ($_SESSION['alang'] ?? 'sv') === 'en' ? 'en' : 'sv'; }
/** Inline translation: L('Spara', 'Save') */
function L(string $sv, string $en): string { return alang() === 'en' ? $en : $sv; }

/* ---------- users, roles, permissions ---------- */
function ROLES(): array { return [
    'owner' => [L('Ägare', 'Owner'), L('Allt, inklusive användare och säkerhet', 'Everything, including users and security')],
    'manager' => [L('Butikschef', 'Store manager'), L('Allt utom användarhantering', 'Everything except user management')],
    'sales' => [L('Säljare', 'Sales'), L('Ordrar, bokningar och kunder', 'Orders, bookings and customers')],
    'editor' => [L('Innehållsredaktör', 'Content editor'), L('Produkter, kategorier, bilder och texter', 'Products, categories, images and texts')],
    'marketing' => [L('Marknadsföring', 'Marketing'), L('Rabattkoder, nyhetsbrev, texter och rapporter', 'Discount codes, newsletter, texts and reports')],
    'accountant' => [L('Ekonomi', 'Accounting'), L('Ordrar, rapporter och export', 'Orders, reports and export')],
    'custom' => [L('Anpassad', 'Custom'), L('Välj behörigheter en och en', 'Pick permissions one by one')],
]; }
function PERMS(): array { return [
    'orders.view' => L('Se ordrar', 'View orders'), 'orders.edit' => L('Hantera ordrar (status, betalning)', 'Manage orders (status, payment)'), 'orders.delete' => L('Radera ordrar', 'Delete orders'),
    'bookings.view' => L('Se bokningar', 'View bookings'), 'bookings.edit' => L('Hantera bokningar', 'Manage bookings'), 'bookings.delete' => L('Radera bokningar', 'Delete bookings'),
    'customers.view' => L('Se kunder', 'View customers'), 'customers.edit' => L('Redigera och radera kunder', 'Edit and delete customers'),
    'products.edit' => L('Lägg till och redigera produkter och kategorier', 'Add and edit products and categories'), 'products.delete' => L('Radera produkter och kategorier', 'Delete products and categories'),
    'coupons.edit' => L('Rabattkoder', 'Discount codes'), 'content.edit' => L('Texter, FAQ och prislista', 'Texts, FAQ and price list'), 'news.view' => L('Nyhetsbrev och meddelanden', 'Newsletter and messages'),
    'reports.view' => L('Rapporter', 'Reports'), 'export' => L('Exportera till Excel', 'Export to Excel'),
    'settings.edit' => L('Inställningar (kontakt, frakt, betalning, bokning)', 'Settings (contact, shipping, payment, booking)'),
    'log.view' => L('Aktivitetslogg', 'Activity log'), 'undo.all' => L('Ångra andras ändringar', 'Undo other people\'s changes'), 'backup.manage' => L('Säkerhetskopior och återställning', 'Backups and restore'), 'users.manage' => L('Användare och behörigheter', 'Users and permissions'),
]; }
const ROLE_PERMS = [
    'manager' => ['orders.view', 'orders.edit', 'orders.delete', 'bookings.view', 'bookings.edit', 'bookings.delete', 'customers.view', 'customers.edit', 'products.edit', 'products.delete', 'coupons.edit', 'content.edit', 'news.view', 'reports.view', 'export', 'settings.edit', 'log.view', 'undo.all', 'backup.manage'],
    'sales' => ['orders.view', 'orders.edit', 'bookings.view', 'bookings.edit', 'customers.view', 'customers.edit', 'news.view'],
    'editor' => ['products.edit', 'products.delete', 'content.edit'],
    'marketing' => ['coupons.edit', 'content.edit', 'news.view', 'reports.view', 'export', 'customers.view'],
    'accountant' => ['orders.view', 'orders.edit', 'reports.view', 'export', 'customers.view', 'log.view'],
];
function users_all(): array { return ad_load('users'); }
function me(): ?array {
    static $me = false;
    if ($me !== false) return $me;
    $me = null; $uid = $_SESSION['uid'] ?? '';
    if ($uid !== '') foreach (users_all() as $u) if ($u['id'] === $uid && !empty($u['active'])) $me = $u;
    return $me;
}
function user_perms(array $u): array {
    if (($u['role'] ?? '') === 'owner') return array_keys(PERMS());
    if (($u['role'] ?? '') === 'custom') return array_values(array_intersect((array)($u['perms'] ?? []), array_keys(PERMS())));
    return ROLE_PERMS[$u['role'] ?? ''] ?? [];
}
function can(string ...$perms): bool {
    $u = me(); if (!$u) return false;
    $mine = user_perms($u);
    foreach ($perms as $p) if (in_array($p, $mine, true)) return true;
    return false;
}
function require_admin(): void { if (!me()) { header('Location: login.php' . (!empty($_SESSION['expired']) ? '?expired=1' : '')); exit; } }
function require_perm(string ...$perms): void {
    require_admin();
    if (can(...$perms)) return;
    admin_head(L('Ingen behörighet', 'No access'));
    echo '<section class="card empty"><h3>' . L('Den här sidan ingår inte i dina behörigheter', 'This page is not part of your permissions') . '</h3><p class="muted">' . L('Be ägaren att ändra din roll under Användare.', 'Ask the owner to change your role under Users.') . '</p><a class="b" href="index.php">' . L('Till översikten', 'To the overview') . '</a></section>';
    admin_foot(); exit;
}
function need(string ...$perms): void { if (!can(...$perms)) { flash(L('Den åtgärden ingår inte i dina behörigheter', 'That action is not part of your permissions'), 'bad'); go($_SERVER['REQUEST_URI'] ?? 'index.php'); } }
function weak_pass(string $p): ?string {
    if (strlen($p) < 10) return L('Lösenordet måste ha minst 10 tecken', 'The password must have at least 10 characters');
    if (!preg_match('/[A-Za-zÅÄÖåäö]/u', $p) || !preg_match('/\d/', $p)) return L('Lösenordet måste innehålla både bokstäver och siffror', 'The password must contain both letters and digits');
    if (preg_match('/^(.)\1+$/', $p) || in_array(strtolower($p), ['password123', '1234567890', 'qwerty1234', 'dantel12345', 'admin12345', 'ateljedantel1'], true)) return L('Lösenordet är för enkelt', 'The password is too simple');
    return null;
}
function role_label(array $u): string { return ROLES()[$u['role'] ?? ''][0] ?? ($u['role'] ?? ''); }

/* ---------- undo: every dashboard write keeps the records it changed, grouped per request ---------- */
const UNDO_SKIP = ['log', 'undo', 'migrations', 'users', 'ratelimit', 'logins'];
function ad_req(): string { static $r = null; if ($r === null) $r = bin2hex(random_bytes(6)); return $r; }
function ad_is_id_list($a): bool {
    if (!is_array($a)) return false;
    if (!$a) return true;
    if (array_keys($a) !== range(0, count($a) - 1)) return false;
    foreach ($a as $r) if (!is_array($r) || !isset($r['id'])) return false;
    return true;
}
function ad_diff($old, $new): array {
    if (json_encode($old) === json_encode($new)) return [];
    if (ad_is_id_list($old) && ad_is_id_list($new) && count($old) + count($new) > 0) {
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
function ad_on_change(string $name, $old, $new): void {
    if (in_array($name, UNDO_SKIP, true) || !empty($GLOBALS['ad_no_undo']) || session_status() !== PHP_SESSION_ACTIVE) return;
    $u = me(); if (!$u) return;
    $ch = ad_diff($old, $new); if (!$ch) return;
    $row = ['req' => ad_req(), 'at' => now_iso(), 'uid' => $u['id'], 'file' => $name, 'ch' => $ch];
    $GLOBALS['ad_no_undo'] = true;
    ad_tx('undo', function (&$d) use ($row) { array_unshift($d, $row); if (count($d) > 600) $d = array_slice($d, 0, 600); });
    $GLOBALS['ad_no_undo'] = false;
    $_SESSION['undo_req'] = ad_req();
}
function ad_undo(string $req): int {
    $rows = array_values(array_filter(ad_load('undo'), fn($r) => $r['req'] === $req && empty($r['undone'])));
    $GLOBALS['ad_no_undo'] = true;
    foreach ($rows as $row) {
        ad_tx($row['file'], function (&$d) use ($row) {
            foreach (array_reverse($row['ch']) as $c) {
                if ($c['t'] === 'all') { $d = $c['before']; continue; }
                if (!is_array($d)) $d = [];
                $idx = null; foreach ($d as $i => $x) if ((string)($x['id'] ?? '') === $c['id']) { $idx = $i; break; }
                if ($c['t'] === 'add') { if ($idx !== null) array_splice($d, $idx, 1); }
                elseif ($c['t'] === 'mod') { if ($idx !== null) $d[$idx] = $c['before']; else array_unshift($d, $c['before']); }
                elseif ($c['t'] === 'del' && $idx === null) array_splice($d, min((int)$c['pos'], count($d)), 0, [$c['before']]);
            }
            $d = is_array($d) && ad_is_id_list($d) ? array_values($d) : $d;
        });
    }
    if ($rows) ad_tx('undo', function (&$d) use ($req) { foreach ($d as &$r) if ($r['req'] === $req) $r['undone'] = now_iso(); });
    $GLOBALS['ad_no_undo'] = false;
    return count($rows);
}
function undo_ok(string $req): bool {
    if ($req === '') return false;
    foreach (ad_load('undo') as $r) if ($r['req'] === $req && empty($r['undone'])) return $r['uid'] === (me()['id'] ?? '') || can('undo.all');
    return false;
}

/* ---------- activity log ---------- */
function log_act(string $action, string $detail = ''): void {
    $u = me();
    $row = ['at' => now_iso(), 'uid' => $u['id'] ?? '', 'name' => $u['name'] ?? ($u['user'] ?? 'System'), 'action' => $action, 'detail' => mb_substr($detail, 0, 300), 'req' => ad_req(), 'ip' => substr(hash('sha256', (string)($_SERVER['REMOTE_ADDR'] ?? '')), 0, 10)];
    $GLOBALS['ad_no_undo'] = true;
    ad_tx('log', function (&$d) use ($row) { array_unshift($d, $row); if (count($d) > 5000) $d = array_slice($d, 0, 5000); });
    $GLOBALS['ad_no_undo'] = false;
}
function csrf(): string { if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(16)); return $_SESSION['csrf']; }
function csrf_field(): string { return '<input type="hidden" name="_t" value="' . csrf() . '">'; }
function posted(): bool {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') return false;
    if (!hash_equals(csrf(), (string)($_POST['_t'] ?? ''))) { flash(L('Sessionen har gått ut, försök igen', 'The session expired, please try again'), 'bad'); return false; }
    return true;
}
function flash(?string $msg = null, string $type = 'ok') {
    if ($msg !== null) { $_SESSION['flash'] = [$msg, $type]; return null; }
    $f = $_SESSION['flash'] ?? null; unset($_SESSION['flash']); return $f;
}
function go(string $to): void { header('Location: ' . $to); exit; }
function src(string $p): string { return $p === '' ? '' : (preg_match('~^https?://~', $p) ? $p : '../' . ltrim($p, '/')); }
function fdate(string $iso, bool $time = true): string { return $iso ? date($time ? 'Y-m-d H:i' : 'Y-m-d', strtotime($iso)) : '—'; }
function ago(string $iso): string {
    $d = time() - strtotime($iso);
    if ($d < 60) return L('nyss', 'just now');
    if ($d < 3600) return floor($d / 60) . ' min';
    if ($d < 86400) return floor($d / 3600) . ' h';
    return fdate($iso, false);
}
function p(string $k, string $def = ''): string { $v = $_POST[$k] ?? $def; return is_string($v) ? trim($v) : $def; }
function pnum(string $k, float $def = 0): float { $v = str_replace([' ', "\u{00A0}", ','], ['', '', '.'], p($k)); return is_numeric($v) ? (float)$v : $def; }
function pdate(string $k): string { $v = p($k); return preg_match('/^\d{4}-\d{2}-\d{2}$/', $v) ? $v : ''; }
function checked($v): string { return !empty($v) ? 'checked' : ''; }
function sel($a, $b): string { return (string)$a === (string)$b ? 'selected' : ''; }
function slugify(string $s): string {
    $s = strtr(mb_strtolower($s), ['å' => 'a', 'ä' => 'a', 'ö' => 'o', 'é' => 'e', 'ü' => 'u', '&' => 'och']);
    $s = trim(preg_replace('/[^a-z0-9]+/', '-', $s), '-');
    return $s !== '' ? substr($s, 0, 70) : 'produkt-' . bin2hex(random_bytes(3));
}
function ORDER_ST(): array { return ['new' => L('Ny', 'New'), 'confirmed' => L('Bekräftad', 'Confirmed'), 'paid' => L('Betald', 'Paid'), 'shipped' => L('Skickad', 'Shipped'), 'ready' => L('Klar att hämta', 'Ready for pickup'), 'done' => L('Slutförd', 'Completed'), 'cancelled' => L('Avbruten', 'Cancelled')]; }
function BOOK_ST(): array { return ['new' => L('Ny', 'New'), 'confirmed' => L('Bekräftad', 'Confirmed'), 'done' => L('Genomförd', 'Done'), 'noshow' => L('Uteblev', 'No-show'), 'cancelled' => L('Avbokad', 'Cancelled')]; }
function PAY_NAMES(): array { return ['swish' => 'Swish', 'bank' => L('Banköverföring', 'Bank transfer'), 'store' => L('Betala i butiken', 'Pay in store'), 'stripe' => L('Kort (betallänk)', 'Card (payment link)')]; }
function badge(string $st, array $labels): string { return '<span class="st st--' . e($st) . '">' . e($labels[$st] ?? $st) . '</span>'; }
function money($n): string { return kr($n); }

/** Save an uploaded image into uploads/<dir>, resized (max 1800px) and converted to webp when GD allows. */
function save_upload(array $f, string $dir, int $i = -1): ?string {
    $tmp = $i >= 0 ? ($f['tmp_name'][$i] ?? '') : ($f['tmp_name'] ?? '');
    $size = $i >= 0 ? ($f['size'][$i] ?? 0) : ($f['size'] ?? 0);
    if (!$tmp || !is_uploaded_file($tmp) || $size > 15 * 1024 * 1024) return null;
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($tmp);
    $ext = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'][$mime] ?? null;
    if (!$ext) return null;
    if (!is_dir(AD_UPLOADS . "/$dir")) @mkdir(AD_UPLOADS . "/$dir", 0755, true);
    $name = date('ymd') . '-' . bin2hex(random_bytes(5));
    $dest = AD_UPLOADS . "/$dir/" . $name;
    if (function_exists('imagecreatefromstring') && function_exists('imagewebp')) {
        $im = @imagecreatefromstring((string)file_get_contents($tmp));
        if ($im) {
            $w = imagesx($im); $h = imagesy($im); $max = 1800;
            if (max($w, $h) > $max) { $r = $max / max($w, $h); $im2 = imagescale($im, (int)($w * $r), (int)($h * $r)); imagedestroy($im); $im = $im2; }
            imagepalettetotruecolor($im); imagealphablending($im, true); imagesavealpha($im, true);
            imagewebp($im, $dest . '.webp', 82); imagedestroy($im);
            return "uploads/$dir/$name.webp";
        }
    }
    move_uploaded_file($tmp, $dest . '.' . $ext);
    return "uploads/$dir/$name.$ext";
}

/** Export: real Excel workbook (SpreadsheetML 2003, opens in Excel/Numbers/LibreOffice) or CSV with ; for Swedish Excel. */
function export_rows(string $name, array $head, array $rows, string $fmt = 'xls'): void {
    log_act(L('Export', 'Export'), "$name ($fmt, " . count($rows) . ')');
    $file = $name . '-' . date('Y-m-d');
    if ($fmt === 'csv') {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $file . '.csv"');
        $o = fopen('php://output', 'w'); fwrite($o, "\xEF\xBB\xBF");
        fputcsv($o, $head, ';'); foreach ($rows as $r) fputcsv($o, array_map(fn($v) => is_float($v) ? str_replace('.', ',', (string)$v) : $v, $r), ';');
        exit;
    }
    header('Content-Type: application/vnd.ms-excel; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $file . '.xls"');
    $x = fn($v) => htmlspecialchars((string)$v, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n" . '<?mso-application progid="Excel.Sheet"?>' . "\n";
    echo '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="h"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#17110F" ss:Pattern="Solid"/></Style></Styles>';
    echo '<Worksheet ss:Name="' . $x(mb_substr($name, 0, 30)) . '"><Table>';
    echo '<Row>'; foreach ($head as $h) echo '<Cell ss:StyleID="h"><Data ss:Type="String">' . $x($h) . '</Data></Cell>'; echo '</Row>';
    foreach ($rows as $r) { echo '<Row>'; foreach ($r as $v) echo (is_int($v) || is_float($v)) ? '<Cell><Data ss:Type="Number">' . $v . '</Data></Cell>' : '<Cell><Data ss:Type="String">' . $x($v) . '</Data></Cell>'; echo '</Row>'; }
    echo '</Table></Worksheet></Workbook>';
    exit;
}
function export_buttons(string $base): string {
    if (!can('export')) return '';
    $sep = strpos($base, '?') === false ? '?' : '&';
    return '<a class="b b--ghost" href="' . e($base . $sep . 'export=xls') . '">' . icon('down') . ' Excel</a><a class="b b--ghost" href="' . e($base . $sep . 'export=csv') . '">CSV</a>';
}

function icon(string $name): string {
    $d = [
        'home' => 'M3 11.5 12 4l9 7.5M5.5 10v10h13V10', 'dress' => 'M9 3h6l-1 4 4 13H6l4-13zM9 3c1 2 5 2 6 0',
        'cats' => 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', 'tag' => 'M3 12V4h8l10 10-8 8zM7.5 7.5h.01',
        'orders' => 'M6 2h12v20l-3-2-3 2-3-2-3 2zM9 7h6M9 11h6M9 15h3', 'cal' => 'M4 5h16v15H4zM4 10h16M8 3v4M16 3v4',
        'users' => 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a6 6 0 0 1 12 0v1M16 3.5a4 4 0 0 1 0 7M18 14a6 6 0 0 1 4 6v1',
        'person' => 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21v-1a8 8 0 0 1 16 0v1', 'text' => 'M4 6h16M4 12h10M4 18h13', 'mail' => 'M3 5h18v14H3zM3 6l9 7 9-7',
        'chart' => 'M4 20V10M10 20V4M16 20v-7M22 20H2', 'log' => 'M12 7v5l3 2M12 3a9 9 0 1 0 9 9', 'shield' => 'M12 3 4 6v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V6zM9 12l2 2 4-4',
        'settings' => 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1',
        'plus' => 'M12 5v14M5 12h14', 'eye' => 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
        'out' => 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10', 'ext' => 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6', 'search' => 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
        'trash' => 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13', 'edit' => 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4', 'copy' => 'M8 8h12v12H8zM4 16V4h12', 'down' => 'M12 4v12M6 11l6 6 6-6M4 20h16',
        'undo' => 'M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11', 'print' => 'M6 9V3h12v6M6 18H4v-7h16v7h-2M8 14h8v7H8z', 'up' => 'M12 20V8M6 13l6-6 6 6',
        'check' => 'm5 12.5 4.5 4.5L19 7.5', 'x' => 'M6 6l12 12M18 6 6 18', 'img' => 'M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4M15 9h.01', 'drag' => 'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01',
        'globe' => 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z',
    ][$name] ?? '';
    return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="' . $d . '"/></svg>';
}

function admin_head(string $title, string $active = '', string $actions = ''): void {
    $newOrders = can('orders.view') ? count(array_filter(ad_load('orders'), fn($o) => ($o['status'] ?? '') === 'new')) : 0;
    $newBook = can('bookings.view') ? count(array_filter(ad_load('bookings'), fn($b) => ($b['status'] ?? '') === 'new')) : 0;
    $unread = can('news.view') ? count(array_filter(ad_load('messages'), fn($m) => empty($m['read']))) : 0;
    $groups = [
        '' => ['index' => [L('Översikt', 'Overview'), 'home', 0, []]],
        L('Försäljning', 'Sales') => ['orders' => [L('Ordrar', 'Orders'), 'orders', $newOrders, ['orders.view']], 'bookings' => [L('Bokningar', 'Bookings'), 'cal', $newBook, ['bookings.view']], 'customers' => [L('Kunder', 'Customers'), 'person', 0, ['customers.view']]],
        L('Butik', 'Shop') => ['products' => [L('Produkter', 'Products'), 'dress', 0, ['products.edit']], 'categories' => [L('Kategorier', 'Categories'), 'cats', 0, ['products.edit']], 'coupons' => [L('Rabattkoder', 'Discount codes'), 'tag', 0, ['coupons.edit']]],
        L('Innehåll', 'Content') => ['content' => [L('Texter & FAQ', 'Texts & FAQ'), 'text', 0, ['content.edit']], 'messages' => [L('Meddelanden & nyhetsbrev', 'Messages & newsletter'), 'mail', $unread, ['news.view']]],
        L('Administration', 'Administration') => ['reports' => [L('Rapporter', 'Reports'), 'chart', 0, ['reports.view']], 'log' => [L('Logg & ångra', 'Log & undo'), 'log', 0, ['log.view']], 'backups' => [L('Säkerhetskopior', 'Backups'), 'shield', 0, ['backup.manage']], 'users' => [L('Användare & roller', 'Users & roles'), 'users', 0, ['users.manage']], 'settings' => [L('Inställningar', 'Settings'), 'settings', 0, ['settings.edit']]],
    ];
    $me = me();
    $q = $_GET; $q['alang'] = alang() === 'en' ? 'sv' : 'en';
    ?><!doctype html>
<html lang="<?= alang() ?>"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#17110F">
<title><?= e($title) ?> · Ateljé Dantel Admin</title>
<link rel="icon" type="image/png" href="../assets/brand/favicon.png">
<link rel="stylesheet" href="admin.css?v=<?= AD_VERSION . '-' . substr(md5((string)@filemtime(__DIR__ . '/admin.css')), 0, 6) ?>">
<script>try{if(localStorage.getItem('ad_admin_theme')==='dark')document.documentElement.dataset.theme='dark'}catch(e){}</script>
</head><body<?= can('orders.view', 'bookings.view') ? ' data-notify="1"' : '' ?>>
<aside class="side" id="side">
  <a class="side__brand" href="index.php"><img src="../assets/brand/mark-light.svg" alt=""><span>Ateljé Dantel<small>Admin</small></span></a>
  <nav class="side__nav">
    <?php foreach ($groups as $g => $links): $links = array_filter($links, fn($l) => !$l[3] || can(...$l[3])); if (!$links) continue; ?>
      <?php if ($g !== ''): ?><div class="side__group"><?= e($g) ?></div><?php endif; ?>
      <?php foreach ($links as $k => [$label, $ic, $n]): ?>
        <a href="<?= $k ?>.php" class="<?= $active === $k ? 'is-on' : '' ?>" data-nav="<?= $k ?>"><?= icon($ic) ?><span><?= e($label) ?></span><b class="pill"<?= $n ? '' : ' hidden' ?>><?= $n ?></b></a>
      <?php endforeach; ?>
    <?php endforeach; ?>
  </nav>
  <div class="side__foot">
    <?php if ($me): ?><a class="side__me <?= $active === 'account' ? 'is-on' : '' ?>" href="account.php"><i><?= e(mb_strtoupper(mb_substr($me['name'] ?: $me['user'], 0, 1))) ?></i><span><?= e($me['name'] ?: $me['user']) ?><small><?= e(role_label($me)) ?></small></span></a><?php endif; ?>
    <div class="side__row">
      <a href="?<?= e(http_build_query($q)) ?>" title="Language"><?= icon('globe') ?> <?= alang() === 'en' ? 'Svenska' : 'English' ?></a>
      <button type="button" data-theme title="<?= L('Mörkt läge', 'Dark mode') ?>">◐</button>
    </div>
    <a href="../" target="_blank"><?= icon('ext') ?> <?= L('Öppna webbplatsen', 'Open website') ?></a>
    <a href="logout.php"><?= icon('out') ?> <?= L('Logga ut', 'Log out') ?></a>
  </div>
</aside>
<div class="scrim" data-nav-close></div>
<div class="main">
  <header class="top">
    <button class="top__burger" type="button" data-nav-open aria-label="Menu">☰</button>
    <h1><?= e($title) ?></h1>
    <div class="top__actions"><?= $actions ?></div>
  </header>
  <?php if ($f = flash()): $ur = $_SESSION['undo_req'] ?? ''; unset($_SESSION['undo_req']); ?><div class="flash flash--<?= e($f[1]) ?>"><span><?= e($f[0]) ?></span><?php if ($f[1] === 'ok' && undo_ok($ur)): ?><form method="post" action="undo.php" class="flash__undo"><?= csrf_field() ?><input type="hidden" name="req" value="<?= e($ur) ?>"><input type="hidden" name="back" value="<?= e($_SERVER['REQUEST_URI'] ?? '') ?>"><button class="b b--sm"><?= icon('undo') ?> <?= L('Ångra', 'Undo') ?></button></form><?php endif; ?></div><?php endif; ?>
<?php
}

function admin_foot(): void { ?>
</div>
<div class="confirm" id="confirm" hidden><div class="confirm__box"><p id="confirmText"></p><div class="confirm__btns"><button type="button" class="b b--ghost" data-c="0"><?= L('Avbryt', 'Cancel') ?></button><button type="button" class="b b--danger" data-c="1"><?= L('Ja, fortsätt', 'Yes, continue') ?></button></div></div></div>
<script>window.ADM={lang:<?= json_encode(alang()) ?>,t:{saved:<?= json_encode(L('Ändringar ej sparade – lämna sidan ändå?', 'Unsaved changes – leave anyway?')) ?>,newOrder:<?= json_encode(L('Ny order!', 'New order!')) ?>,newBooking:<?= json_encode(L('Ny bokning!', 'New booking!')) ?>}};</script>
<script src="admin.js?v=<?= AD_VERSION . '-' . substr(md5((string)@filemtime(__DIR__ . '/admin.js')), 0, 6) ?>"></script>
</body></html>
<?php }

/** Pager for long lists: returns [slice, html]. */
function paginate(array $rows, int $per = 50): array {
    $n = count($rows); $pages = max(1, (int)ceil($n / $per)); $pg = max(1, min($pages, (int)($_GET['pg'] ?? 1)));
    $html = '';
    if ($pages > 1) {
        $q = $_GET; $html = '<nav class="pager">';
        for ($i = 1; $i <= $pages; $i++) { $q['pg'] = $i; $html .= '<a href="?' . e(http_build_query($q)) . '" class="' . ($i === $pg ? 'on' : '') . '">' . $i . '</a>'; }
        $html .= '</nav>';
    }
    return [array_slice($rows, ($pg - 1) * $per, $per), $html];
}

/* ---------- orders: status change with stock handling ---------- */
/** Change status of one order. Cancelling puts reserved stock back; re-opening a cancelled order reserves it again. */
function order_set_status(string $oid, string $st, bool $notify = false): ?array {
    if (!isset(ORDER_ST()[$st])) return null;
    $me = me(); $res = null; $stockMove = 0;
    ad_tx('orders', function (&$all) use ($oid, $st, $me, &$res, &$stockMove) {
        foreach ($all as &$o) if ($o['id'] === $oid) {
            if ($o['status'] === $st) { $res = $o; return; }
            if ($st === 'cancelled' && empty($o['restocked'])) { $o['restocked'] = true; $stockMove = 1; }
            elseif ($o['status'] === 'cancelled' && !empty($o['restocked'])) { $o['restocked'] = false; $stockMove = -1; }
            $o['status'] = $st;
            $o['history'][] = ['at' => now_iso(), 'st' => $st, 'by' => $me['name'] ?? ($me['user'] ?? '')];
            $res = $o; return;
        }
    });
    if ($res && $stockMove) {
        ad_tx('products', function (&$prods) use ($res, $stockMove) {
            foreach ($res['items'] as $l) { if (empty($l['reserved'])) continue;
                foreach ($prods as &$p) foreach ($p['variants'] as &$v) if ($v['id'] === $l['vid']) $v['stock'] = (int)$v['stock'] + $stockMove * (int)$l['q'];
                unset($p, $v);
            }
        });
    }
    if ($res && $notify && in_array($st, ['confirmed', 'paid', 'shipped', 'ready', 'cancelled'], true)) {
        $en = ($res['lang'] ?? 'sv') === 'en';
        $txt = [
            'confirmed' => [$en ? 'Your order is confirmed. We will contact you about payment if needed.' : 'Din order är bekräftad. Vi hör av oss om betalningen vid behov.'],
            'paid' => [$en ? 'We have received your payment – thank you!' : 'Vi har tagit emot din betalning – tack!'],
            'shipped' => [$en ? 'Your order has been shipped with PostNord.' : 'Din order har skickats med PostNord.'],
            'ready' => [$en ? 'Your order is ready to collect at MVG-gallerian, Kungsgatan 52–54, Umeå.' : 'Din order är klar att hämta i MVG-gallerian, Kungsgatan 52–54, Umeå.'],
            'cancelled' => [$en ? 'Your order has been cancelled. Contact us if you have any questions.' : 'Din order har avbrutits. Kontakta oss om du har frågor.'],
        ][$st][0];
        $s = settings();
        ad_mail($res['customer']['email'], ($en ? 'Order ' : 'Order ') . $res['ref'] . ' – Ateljé Dantel', ($en ? 'Hello ' : 'Hej ') . $res['customer']['name'] . ",\n\n$txt\n\n" . ($en ? 'Order' : 'Order') . ": {$res['ref']}\n" . ($en ? 'Total' : 'Summa') . ': ' . kr($res['total']) . "\n\nAteljé Dantel\n{$s['address']}, {$s['city']}\n{$s['phone']} · {$s['email']}\n");
    }
    return $res;
}
