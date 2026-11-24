<?php
/**
 * NORRAID admin core: session, users and roles, CSRF, audit log, layout and a small schema-driven CRUD engine.
 * Every write goes through admin_tx() so it is logged with who, what and when.
 */
declare(strict_types=1);
require dirname(__DIR__) . '/inc/core.php';
require dirname(__DIR__) . '/inc/i18n.php';
require dirname(__DIR__) . '/inc/data.php';
require dirname(__DIR__) . '/inc/mail.php';
require dirname(__DIR__) . '/inc/media.php';
set_locale('en');

if (session_status() === PHP_SESSION_NONE) {
    $https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    session_name($https ? '__Secure-nr_admin' : 'nr_admin');
    $cookiePath = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/')), '/') . '/';
    session_set_cookie_params(['lifetime' => 0, 'path' => $cookiePath, 'httponly' => true, 'samesite' => 'Strict', 'secure' => $https]);
    session_start();
    $now = time(); $fp = hash('sha256', (string)($_SERVER['HTTP_USER_AGENT'] ?? ''));
    if (!empty($_SESSION['uid']) && ($now - (int)($_SESSION['seen'] ?? $now) > 7200 || $now - (int)($_SESSION['born'] ?? $now) > 43200 || ($_SESSION['fp'] ?? $fp) !== $fp)) {
        $_SESSION = []; session_regenerate_id(true); $_SESSION['expired'] = 1;
    }
    $_SESSION['seen'] = $now;
}
header_remove('X-Powered-By');
header('X-Robots-Tag: noindex, nofollow');
header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header('Cache-Control: no-store, private');
header("Content-Security-Policy: default-src 'self'; img-src 'self' data: https://upload.wikimedia.org https://thumb.wikimedia.org; style-src 'self'; font-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'self'; object-src 'none'");

/* ---------- roles & permissions ---------- */
const ROLES = [
    'super' => ['Super Admin', 'Everything, including users, settings, legal status and backups.'],
    'editor' => ['Content Editor', 'Countries, statistics, sources, stories and media.'],
    'translator' => ['Translator', 'Translations of the site text in all languages.'],
    'finance' => ['Finance Reviewer', 'Donations, impact data, financial documents and reports.'],
];
const ROLE_PERMS = [
    'editor' => ['content', 'stats', 'stories', 'media', 'messages'],
    'translator' => ['translations'],
    'finance' => ['donations', 'impact', 'documents', 'subscribers'],
];
const ALL_PERMS = ['content', 'stats', 'stories', 'media', 'messages', 'translations', 'donations', 'impact', 'documents', 'subscribers', 'org', 'settings', 'users', 'audit', 'backups'];

function users_all(): array { return nr_load('users'); }
function me(): ?array {
    static $me = false;
    if ($me !== false) return $me;
    $me = null;
    $uid = $_SESSION['uid'] ?? '';
    if ($uid !== '') foreach (users_all() as $u) if (($u['id'] ?? '') === $uid && !empty($u['active'])) $me = $u;
    return $me;
}
function can(string $perm): bool {
    $u = me();
    if (!$u) return false;
    if (($u['role'] ?? '') === 'super') return true;
    return in_array($perm, ROLE_PERMS[$u['role'] ?? ''] ?? [], true);
}
function require_login(): void {
    if (!me()) { header('Location: login.php'); exit; }
    if (!empty(me()['must_change']) && basename($_SERVER['SCRIPT_NAME']) !== 'account.php') { flash('Please choose your own password before you continue.', 'warn'); go('account.php'); }
}
function require_perm(string $perm): void {
    require_login();
    if (can($perm)) return;
    admin_head('Not allowed');
    echo '<section class="card"><h2>This page is not part of your role</h2><p class="muted">Ask a Super Admin to change your role if you need it.</p><a class="btn" href="index.php">Back to dashboard</a></section>';
    admin_foot(); exit;
}
function weak_pass(string $p): ?string {
    if (strlen($p) < 12) return 'Use at least 12 characters.';
    if (!preg_match('/[A-Za-z]/', $p) || !preg_match('/\d/', $p)) return 'Use letters and numbers.';
    if (preg_match('/^(.)\1+$/', $p) || preg_match('/norraid|password|123456|qwerty/i', $p)) return 'This password is too easy to guess.';
    return null;
}

/* ---------- csrf, flash, redirects ---------- */
function csrf(): string { if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(16)); return $_SESSION['csrf']; }
function csrf_field(): string { return '<input type="hidden" name="_csrf" value="' . e(csrf()) . '">'; }
function csrf_check(): void {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') return;
    if (!hash_equals(csrf(), (string)($_POST['_csrf'] ?? ''))) { http_response_code(400); exit('Session expired. Go back, reload the page and try again.'); }
}
function flash(string $msg, string $type = 'ok'): void { $_SESSION['flash'][] = [$type, $msg]; }
function go(string $to): never { header('Location: ' . $to, true, 303); exit; }
function is_post(): bool { return ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST'; }
function p(string $k, $def = '') { return $_POST[$k] ?? $def; }

/* ---------- audit log ---------- */
function audit(string $action, string $target = '', string $detail = ''): void {
    $u = me();
    $row = ['at' => now_iso(), 'user' => $u['user'] ?? ($_POST['user'] ?? '?'), 'role' => $u['role'] ?? '', 'action' => $action, 'target' => $target, 'detail' => mb_substr($detail, 0, 400), 'ip' => ip_hash()];
    nr_tx('audit', function (&$l) use ($row) { array_unshift($l, $row); $l = array_slice($l, 0, 5000); });
}
/** Locked read-modify-write + audit entry. */
function admin_tx(string $store, callable $fn, string $action, string $target = '', string $detail = '') {
    $r = nr_tx($store, $fn);
    audit($action, $store . ($target !== '' ? ':' . $target : ''), $detail);
    return $r;
}

/* ---------- layout ---------- */
const NAV = [
    ['index.php', 'Dashboard', null],
    ['countries.php', 'Countries', 'content'],
    ['crud.php?t=stats', 'Statistics', 'stats'],
    ['crud.php?t=sources', 'Sources', 'stats'],
    ['crud.php?t=stories', 'Stories', 'stories'],
    ['media.php', 'Media', 'media'],
    ['crud.php?t=achievements', 'Impact data', 'impact'],
    ['import.php', 'Impact import', 'impact'],
    ['crud.php?t=donations', 'Donations', 'donations'],
    ['crud.php?t=documents', 'Documents', 'documents'],
    ['org.php', 'Legal status', 'org'],
    ['subscribers.php', 'Subscribers', 'subscribers'],
    ['messages.php', 'Messages', 'messages'],
    ['translations.php', 'Translations', 'translations'],
    ['settings.php', 'Settings', 'settings'],
    ['users.php', 'Users', 'users'],
    ['audit.php', 'Audit log', 'audit'],
    ['backups.php', 'Backups', 'backups'],
];
function admin_head(string $title): void {
    $u = me();
    $cur = basename($_SERVER['SCRIPT_NAME']) . (isset($_GET['t']) ? '?t=' . $_GET['t'] : '');
    ?><!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title><?= e($title) ?> · NORRAID admin</title><meta name="robots" content="noindex,nofollow">
<link rel="icon" href="../assets/brand/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="../assets/fonts/fonts.css"><link rel="stylesheet" href="admin.css?v=<?= NR_VERSION ?>">
</head><body class="adm"><?php if ($u): ?>
<aside class="side" id="side"><a class="side-brand" href="index.php"><img src="../assets/brand/norraid-mark-white.svg" alt="" width="34" height="34"><span><b>NORRAID</b> admin</span></a>
<nav><?php foreach (NAV as [$href, $label, $perm]): if ($perm && !can($perm)) continue; ?><a href="<?= e($href) ?>"<?= $cur === $href ? ' aria-current="page"' : '' ?>><?= e($label) ?></a><?php endforeach; ?></nav>
<div class="side-foot"><a href="../" target="_blank" rel="noopener">View site ↗</a><a href="account.php"><?= e($u['name'] ?: $u['user']) ?> · <?= e(ROLES[$u['role']][0] ?? '') ?></a><form method="post" action="logout.php"><?= csrf_field() ?><button class="linkbtn">Sign out</button></form></div></aside>
<button class="side-toggle" type="button" data-toggle="side" aria-controls="side" aria-expanded="false">Menu</button>
<?php endif; ?><main class="main"><header class="top"><h1><?= e($title) ?></h1></header>
<?php foreach ($_SESSION['flash'] ?? [] as [$t, $m]): ?><p class="flash <?= e($t) ?>" role="status"><?= e($m) ?></p><?php endforeach; unset($_SESSION['flash']);
}
function admin_foot(): void { ?></main><script src="admin.js?v=<?= NR_VERSION ?>"></script></body></html><?php }

/* ---------- small helpers ---------- */
function opts(array $map, $sel, bool $blank = false): string {
    $o = $blank ? '<option value="">—</option>' : '';
    foreach ($map as $k => $v) $o .= '<option value="' . e((string)$k) . '"' . ((string)$k === (string)$sel ? ' selected' : '') . '>' . e((string)$v) . '</option>';
    return $o;
}
function country_opts(): array { $o = []; foreach (COUNTRY_IDS as $c) $o[$c] = country_name($c); return $o; }
function media_opts(): array { $o = []; foreach (media_all() as $id => $m) $o[$id] = $id . ' – ' . mb_strimwidth((string)($m['title'] ?? ''), 0, 60, '…'); return $o; }
function source_opts(): array { $o = []; foreach (sources() as $id => $s) $o[$id] = ($s['org'] ?? '') . ' – ' . mb_strimwidth((string)($s['title'] ?? ''), 0, 70, '…'); return $o; }
function doc_opts(): array { $o = []; foreach (nr_load('documents') as $d) if (!empty($d['file'])) $o[$d['file']] = loc($d['title'] ?? '') ?: $d['file']; return $o; }
function badge(string $s): string { return '<span class="badge b-' . e(preg_replace('/[^a-z_]/', '', $s)) . '">' . e(str_replace('_', ' ', $s)) . '</span>'; }
/** Languages edited inline for multilingual fields. The rest are filled on the Translations page or here under "More languages". */
const MAIN_LANGS = ['en', 'sv', 'ar'];

/** Save an uploaded document (PDF, images, office files) to uploads/docs. Returns the stored file name or null. */
function save_doc_upload(string $field): ?string {
    $f = $_FILES[$field] ?? null;
    if (!$f || ($f['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) return null;
    if ($f['size'] > 20 * 1024 * 1024) { flash('File is larger than 20 MB.', 'bad'); return null; }
    $ext = strtolower(pathinfo((string)$f['name'], PATHINFO_EXTENSION));
    $ok = ['pdf' => 'application/pdf', 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp', 'csv' => 'text/plain', 'xlsx' => 'application/', 'docx' => 'application/'];
    $mime = function_exists('mime_content_type') ? (string)mime_content_type($f['tmp_name']) : '';
    if (!isset($ok[$ext]) || ($mime !== '' && !str_starts_with($mime, $ok[$ext]) && !($ext === 'csv' && str_starts_with($mime, 'text/')) && !in_array($ext, ['xlsx', 'docx'], true))) { flash('This file type is not allowed. Use PDF, JPG, PNG, WEBP, CSV, XLSX or DOCX.', 'bad'); return null; }
    $base = preg_replace('/[^a-z0-9-]+/', '-', strtolower(pathinfo((string)$f['name'], PATHINFO_FILENAME))) ?: 'file';
    $name = substr(trim($base, '-'), 0, 50) . '-' . bin2hex(random_bytes(3)) . '.' . $ext;
    if (!move_uploaded_file($f['tmp_name'], NR_UPLOADS . '/docs/' . $name)) { flash('Upload failed.', 'bad'); return null; }
    return $name;
}

/* ---------- schema-driven CRUD ---------- */
/**
 * Field types: text, textarea, number, date, select (options), check, loc (multilingual short), loclong (multilingual long),
 * list (comma separated), doc (upload into uploads/docs), readonly.
 */
function field_input(string $name, array $f, $val): string {
    $type = $f['type'] ?? 'text';
    $req = !empty($f['required']) ? ' required' : '';
    $help = !empty($f['help']) ? '<small class="help">' . e($f['help']) . '</small>' : '';
    $label = '<span class="lbl">' . e($f['label']) . (!empty($f['required']) ? ' *' : '') . '</span>';
    $id = 'f-' . $name;
    switch ($type) {
        case 'textarea':
            return "<label class=\"f full\" for=\"$id\">$label<textarea id=\"$id\" name=\"$name\" rows=\"5\"$req>" . e((string)$val) . "</textarea>$help</label>";
        case 'select':
            return "<label class=\"f\" for=\"$id\">$label<select id=\"$id\" name=\"$name\"$req>" . opts($f['options'], $val, !empty($f['blank'])) . "</select>$help</label>";
        case 'check':
            return "<label class=\"f chk\"><input type=\"checkbox\" name=\"$name\" value=\"1\"" . (!empty($val) ? ' checked' : '') . "> <span>" . e($f['label']) . "</span>$help</label>";
        case 'number':
            return "<label class=\"f\" for=\"$id\">$label<input id=\"$id\" type=\"number\" step=\"any\" name=\"$name\" value=\"" . e((string)$val) . "\"$req>$help</label>";
        case 'date':
            return "<label class=\"f\" for=\"$id\">$label<input id=\"$id\" type=\"date\" name=\"$name\" value=\"" . e(substr((string)$val, 0, 10)) . "\"$req>$help</label>";
        case 'list':
            return "<label class=\"f full\" for=\"$id\">$label<input id=\"$id\" name=\"$name\" value=\"" . e(implode(', ', (array)$val)) . "\">$help</label>";
        case 'readonly':
            return "<div class=\"f\">$label<div class=\"ro\">" . e(is_array($val) ? json_encode($val) : (string)$val) . "</div></div>";
        case 'doc':
            $cur = $val ? '<a href="../uploads/docs/' . e(rawurlencode((string)$val)) . '" target="_blank" rel="noopener">' . e((string)$val) . '</a>' : '<span class="muted">No file</span>';
            return "<div class=\"f full\">$label<div class=\"ro\">$cur</div><input type=\"file\" name=\"{$name}_file\" accept=\".pdf,.jpg,.jpeg,.png,.webp,.csv,.xlsx,.docx\">"
                . ($f['options'] ?? null ? '<select name="' . $name . '"><option value="">— or choose an uploaded file —</option>' . opts($f['options'], $val) . '</select>' : "<input type=\"hidden\" name=\"$name\" value=\"" . e((string)$val) . "\">") . "$help</div>";
        case 'loc': case 'loclong':
            $val = is_array($val) ? $val : ($val !== '' && $val !== null ? ['en' => (string)$val] : []);
            $h = "<fieldset class=\"f full loc\"><legend>$label</legend>";
            $one = function ($l) use ($name, $type, $val) {
                $v = e((string)($val[$l] ?? ''));
                $dir = LOCALES[$l][1];
                $inp = $type === 'loclong' ? "<textarea name=\"{$name}[$l]\" rows=\"4\" dir=\"$dir\" lang=\"$l\">$v</textarea>" : "<input name=\"{$name}[$l]\" value=\"$v\" dir=\"$dir\" lang=\"$l\">";
                return "<label class=\"lrow\"><span class=\"lc\">" . strtoupper($l) . "</span>$inp</label>";
            };
            foreach (MAIN_LANGS as $l) $h .= $one($l);
            $h .= '<details><summary>More languages</summary>';
            foreach (array_keys(LOCALES) as $l) if (!in_array($l, MAIN_LANGS, true)) $h .= $one($l);
            return $h . "</details>$help</fieldset>";
        default:
            $t = ($f['input'] ?? 'text');
            return "<label class=\"f" . (!empty($f['wide']) ? ' full' : '') . "\" for=\"$id\">$label<input id=\"$id\" type=\"$t\" name=\"$name\" value=\"" . e((string)$val) . "\"$req" . (!empty($f['pattern']) ? ' pattern="' . e($f['pattern']) . '"' : '') . ">$help</label>";
    }
}
function field_value(string $name, array $f, $old) {
    $type = $f['type'] ?? 'text';
    switch ($type) {
        case 'readonly': return $old;
        case 'check': return !empty($_POST[$name]);
        case 'number': $v = trim((string)p($name)); return $v === '' ? null : (float)$v;
        case 'list': return array_values(array_filter(array_map('trim', explode(',', (string)p($name))), 'strlen'));
        case 'loc': case 'loclong':
            $out = [];
            foreach ((array)p($name, []) as $l => $v) if (isset(LOCALES[$l]) && trim((string)$v) !== '') $out[$l] = str_clean($v, $type === 'loc' ? 300 : 8000);
            return $out;
        case 'doc':
            $up = save_doc_upload($name . '_file');
            return $up ?? basename((string)p($name, $old));
        case 'textarea': return str_clean(p($name), 8000);
        case 'select':
            $v = (string)p($name);
            return ($v === '' || isset($f['options'][$v])) ? $v : $old;
        default: return str_clean(p($name), (int)($f['max'] ?? 500));
    }
}
