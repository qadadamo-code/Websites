<?php
/* عائلة قدادة — family tree API (JSON storage, no database). */
declare(strict_types=1);

const STORE_DIR   = __DIR__ . '/storage';
const TREE_FILE   = STORE_DIR . '/tree.json';
const AUTH_FILE   = STORE_DIR . '/auth.json';
const PEND_FILE   = STORE_DIR . '/pending.json';
const RATE_FILE   = STORE_DIR . '/rate.json';
const SEED_FILE   = __DIR__ . '/data/seed.json';
const UPLOAD_DIR  = __DIR__ . '/uploads/members';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

session_name('qadada_sid');
session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'secure'   => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();
if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(16));

function out(array $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
function fail(string $msg, int $code = 400): void { out(['ok' => false, 'error' => $msg], $code); }

function ensure_store(): void {
    if (!is_dir(STORE_DIR)) @mkdir(STORE_DIR, 0755, true);
    if (!file_exists(STORE_DIR . '/.htaccess')) {
        @file_put_contents(STORE_DIR . '/.htaccess', "Require all denied\n<IfModule !mod_authz_core.c>\nDeny from all\n</IfModule>\n");
    }
    if (!file_exists(TREE_FILE)) {
        $seed = @file_get_contents(SEED_FILE);
        @file_put_contents(TREE_FILE, $seed ?: '{"members":[]}', LOCK_EX);
    }
}
function read_json(string $file, array $default): array {
    if (!file_exists($file)) return $default;
    $fh = fopen($file, 'r');
    if (!$fh) return $default;
    flock($fh, LOCK_SH);
    $raw = stream_get_contents($fh);
    flock($fh, LOCK_UN);
    fclose($fh);
    $d = json_decode((string)$raw, true);
    return is_array($d) ? $d : $default;
}
function write_json(string $file, array $data): void {
    $tmp = $file . '.tmp' . bin2hex(random_bytes(3));
    file_put_contents($tmp, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX);
    rename($tmp, $file);
}
/** Run a read-modify-write on a JSON file under an exclusive lock. */
function mutate(string $file, array $default, callable $fn) {
    $lock = fopen($file . '.lock', 'c');
    flock($lock, LOCK_EX);
    $data = read_json($file, $default);
    $result = $fn($data);
    write_json($file, $data);
    flock($lock, LOCK_UN);
    fclose($lock);
    return $result;
}

function is_admin(): bool { return !empty($_SESSION['qadada_admin']); }
function need_admin(): void { if (!is_admin()) fail('يلزم تسجيل الدخول للإدارة', 403); }
function need_csrf(): void {
    $t = $_SERVER['HTTP_X_CSRF'] ?? '';
    if (!is_string($t) || !hash_equals($_SESSION['csrf'], $t)) fail('انتهت الجلسة، حدّث الصفحة وحاول مجددًا', 419);
}
function clean(?string $s, int $max): string {
    $s = trim((string)$s);
    $s = preg_replace('/[\x00-\x1F\x7F]/u', ' ', $s) ?? '';
    return mb_substr($s, 0, $max);
}
function clean_year($v): string {
    $v = trim((string)$v);
    return preg_match('/^[0-9]{1,4}$/', $v) ? $v : '';
}
const STATUSES = ['confirmed', 'documented', 'narrative', 'proposed'];

function member_from_input(array $in, array $base = []): array {
    $m = $base;
    $m['name']     = clean($in['name'] ?? ($base['name'] ?? ''), 60);
    $m['title']    = clean($in['title'] ?? '', 60);
    $m['gender']   = (($in['gender'] ?? 'm') === 'f') ? 'f' : 'm';
    $m['born']     = clean_year($in['born'] ?? '');
    $m['died']     = clean_year($in['died'] ?? '');
    $m['deceased'] = !empty($in['deceased']) || $m['died'] !== '';
    $m['place']    = clean($in['place'] ?? '', 40);
    $m['branch']   = clean($in['branch'] ?? ($base['branch'] ?? ''), 30);
    $m['note']     = clean($in['note'] ?? '', 600);
    $st = $in['status'] ?? ($base['status'] ?? 'confirmed');
    $m['status']   = in_array($st, STATUSES, true) ? $st : 'confirmed';
    if ($m['name'] === '') fail('الاسم مطلوب');
    return $m;
}
function find_index(array $members, string $id): int {
    foreach ($members as $i => $m) if (($m['id'] ?? '') === $id) return $i;
    return -1;
}
function rate_ok(string $key, int $limit): bool {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'x';
    $day = date('Y-m-d');
    return mutate(RATE_FILE, [], function (array &$r) use ($ip, $day, $key, $limit) {
        foreach ($r as $k => $_) if (strpos($k, $day) === false) unset($r[$k]);
        $k = "$day|$key|" . hash('sha256', $ip);
        $r[$k] = ($r[$k] ?? 0) + 1;
        return $r[$k] <= $limit;
    });
}

ensure_store();
$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$in = [];
if ($method === 'POST') {
    $ct = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($ct, 'application/json') !== false) {
        $in = json_decode((string)file_get_contents('php://input'), true) ?: [];
    } else {
        $in = $_POST;
    }
    need_csrf();
}

switch ($action) {

case 'tree': {
    $tree = read_json(TREE_FILE, ['members' => []]);
    $auth = read_json(AUTH_FILE, []);
    $res = [
        'ok'      => true,
        'members' => $tree['members'] ?? [],
        'admin'   => is_admin(),
        'setup'   => empty($auth['hash']),
        'csrf'    => $_SESSION['csrf'],
    ];
    if (is_admin()) $res['pending'] = count(read_json(PEND_FILE, ['items' => []])['items'] ?? []);
    out($res);
}

case 'setup': {
    if ($method !== 'POST') fail('bad method', 405);
    $pw = (string)($in['password'] ?? '');
    if (mb_strlen($pw) < 8) fail('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
    $done = mutate(AUTH_FILE, [], function (array &$a) use ($pw) {
        if (!empty($a['hash'])) return false;
        $a['hash'] = password_hash($pw, PASSWORD_DEFAULT);
        $a['created'] = date('c');
        return true;
    });
    if (!$done) fail('تم إعداد كلمة المرور مسبقًا', 409);
    session_regenerate_id(true);
    $_SESSION['qadada_admin'] = true;
    out(['ok' => true, 'csrf' => $_SESSION['csrf']]);
}

case 'login': {
    if ($method !== 'POST') fail('bad method', 405);
    if (!rate_ok('login', 30)) fail('محاولات كثيرة، حاول لاحقًا', 429);
    $auth = read_json(AUTH_FILE, []);
    $pw = (string)($in['password'] ?? '');
    if (empty($auth['hash']) || !password_verify($pw, $auth['hash'])) {
        usleep(400000);
        fail('كلمة المرور غير صحيحة', 401);
    }
    session_regenerate_id(true);
    $_SESSION['qadada_admin'] = true;
    out(['ok' => true, 'csrf' => $_SESSION['csrf']]);
}

case 'logout': {
    if ($method !== 'POST') fail('bad method', 405);
    $_SESSION['qadada_admin'] = false;
    out(['ok' => true]);
}

case 'password': {
    if ($method !== 'POST') fail('bad method', 405);
    need_admin();
    $pw = (string)($in['password'] ?? '');
    if (mb_strlen($pw) < 8) fail('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
    mutate(AUTH_FILE, [], function (array &$a) use ($pw) { $a['hash'] = password_hash($pw, PASSWORD_DEFAULT); });
    out(['ok' => true]);
}

case 'save': {
    if ($method !== 'POST') fail('bad method', 405);
    need_admin();
    $id = clean($in['id'] ?? '', 20);
    $parent = clean($in['parent'] ?? '', 20);
    $saved = mutate(TREE_FILE, ['members' => []], function (array &$t) use ($in, $id, $parent) {
        $members = $t['members'] ?? [];
        if ($id !== '') {
            $i = find_index($members, $id);
            if ($i < 0) fail('الفرد غير موجود', 404);
            $members[$i] = member_from_input($in, $members[$i]);
            $res = $members[$i];
        } else {
            if ($parent !== '' && find_index($members, $parent) < 0) fail('الأب غير موجود', 404);
            if ($parent === '' && count($members) > 0) fail('اختر الأب أو الأم');
            $m = member_from_input($in);
            $m['id'] = 'm' . base_convert((string)(int)(microtime(true) * 1000), 10, 36) . bin2hex(random_bytes(2));
            $m['parent'] = $parent === '' ? null : $parent;
            if ($m['branch'] === '' && $parent !== '') $m['branch'] = $members[find_index($members, $parent)]['branch'] ?? '';
            $members[] = $m;
            $res = $m;
        }
        $t['members'] = $members;
        return $res;
    });
    out(['ok' => true, 'member' => $saved]);
}

case 'delete': {
    if ($method !== 'POST') fail('bad method', 405);
    need_admin();
    $id = clean($in['id'] ?? '', 20);
    mutate(TREE_FILE, ['members' => []], function (array &$t) use ($id) {
        $members = $t['members'] ?? [];
        foreach ($members as $m) if (($m['parent'] ?? null) === $id) fail('لا يمكن حذف فرد له أبناء في الشجرة، احذف الأبناء أولًا');
        $i = find_index($members, $id);
        if ($i < 0) fail('الفرد غير موجود', 404);
        array_splice($members, $i, 1);
        $t['members'] = $members;
    });
    out(['ok' => true]);
}

case 'photo': {
    if ($method !== 'POST') fail('bad method', 405);
    need_admin();
    $id = clean($_POST['id'] ?? '', 20);
    $f = $_FILES['photo'] ?? null;
    if (!$f || ($f['error'] ?? 1) !== UPLOAD_ERR_OK) fail('تعذر رفع الصورة');
    if ($f['size'] > 6 * 1024 * 1024) fail('حجم الصورة أكبر من 6 ميجابايت');
    $info = @getimagesize($f['tmp_name']);
    $types = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp'];
    if (!$info || !isset($types[$info[2]])) fail('الصيغ المسموحة: JPG أو PNG أو WEBP');
    if (!is_dir(UPLOAD_DIR)) @mkdir(UPLOAD_DIR, 0755, true);
    $name = preg_replace('/[^a-z0-9]/', '', $id) . '-' . bin2hex(random_bytes(4));
    $saved = false;
    if (function_exists('imagecreatefromstring')) {
        $img = @imagecreatefromstring((string)file_get_contents($f['tmp_name']));
        if ($img) {
            $w = imagesx($img); $h = imagesy($img); $max = 900;
            $s = min(1, $max / max($w, $h));
            $dst = imagecreatetruecolor((int)($w * $s), (int)($h * $s));
            imagecopyresampled($dst, $img, 0, 0, 0, 0, (int)($w * $s), (int)($h * $s), $w, $h);
            $saved = imagejpeg($dst, UPLOAD_DIR . "/$name.jpg", 84);
            $ext = 'jpg';
        }
    }
    if (!$saved) {
        $ext = $types[$info[2]];
        $saved = move_uploaded_file($f['tmp_name'], UPLOAD_DIR . "/$name.$ext");
    }
    if (!$saved) fail('تعذر حفظ الصورة', 500);
    $path = "uploads/members/$name.$ext";
    mutate(TREE_FILE, ['members' => []], function (array &$t) use ($id, $path) {
        $i = find_index($t['members'] ?? [], $id);
        if ($i < 0) fail('الفرد غير موجود', 404);
        $t['members'][$i]['photo'] = $path;
    });
    out(['ok' => true, 'photo' => $path]);
}

case 'suggest': {
    if ($method !== 'POST') fail('bad method', 405);
    if (!empty($in['website'])) out(['ok' => true]); // honeypot
    if (!rate_ok('suggest', 15)) fail('وصلت للحد اليومي من الاقتراحات، شكرًا لك', 429);
    $tree = read_json(TREE_FILE, ['members' => []]);
    $parent = clean($in['parent'] ?? '', 20);
    if (find_index($tree['members'] ?? [], $parent) < 0) fail('اختر الأب أو الأم من الشجرة');
    $m = member_from_input($in);
    $m['status'] = 'narrative';
    $item = [
        'pid'       => 'p' . bin2hex(random_bytes(5)),
        'parent'    => $parent,
        'member'    => $m,
        'by'        => clean($in['by'] ?? '', 60),
        'contact'   => clean($in['contact'] ?? '', 60),
        'at'        => date('c'),
    ];
    mutate(PEND_FILE, ['items' => []], function (array &$p) use ($item) {
        if (count($p['items'] ?? []) > 500) fail('قائمة الاقتراحات ممتلئة حاليًا', 503);
        $p['items'][] = $item;
    });
    out(['ok' => true]);
}

case 'pending': {
    need_admin();
    out(['ok' => true, 'items' => read_json(PEND_FILE, ['items' => []])['items'] ?? []]);
}

case 'review': {
    if ($method !== 'POST') fail('bad method', 405);
    need_admin();
    $pid = clean($in['pid'] ?? '', 20);
    $approve = !empty($in['approve']);
    $item = mutate(PEND_FILE, ['items' => []], function (array &$p) use ($pid) {
        foreach ($p['items'] ?? [] as $i => $it) {
            if ($it['pid'] === $pid) { array_splice($p['items'], $i, 1); return $it; }
        }
        fail('الاقتراح غير موجود', 404);
    });
    if ($approve) {
        mutate(TREE_FILE, ['members' => []], function (array &$t) use ($item) {
            $pi = find_index($t['members'] ?? [], $item['parent']);
            if ($pi < 0) fail('الأب لم يعد موجودًا في الشجرة', 404);
            $m = $item['member'];
            $m['id'] = 'm' . base_convert((string)(int)(microtime(true) * 1000), 10, 36) . bin2hex(random_bytes(2));
            $m['parent'] = $item['parent'];
            if (($m['branch'] ?? '') === '') $m['branch'] = $t['members'][$pi]['branch'] ?? '';
            $t['members'][] = $m;
        });
    }
    out(['ok' => true]);
}

case 'export': {
    need_admin();
    header('Content-Disposition: attachment; filename="qadada-tree-' . date('Y-m-d') . '.json"');
    echo json_encode(read_json(TREE_FILE, ['members' => []]), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

default:
    fail('unknown action', 404);
}
