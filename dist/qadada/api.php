<?php
/* عائلة قدادة — family tree API (JSON storage, no database).
   Roles: admin (whole tree) and branch editors (one member and all their descendants). */
declare(strict_types=1);

const STORE_DIR   = __DIR__ . '/storage';
const TREE_FILE   = STORE_DIR . '/tree.json';
const AUTH_FILE   = STORE_DIR . '/auth.json';
const USERS_FILE  = STORE_DIR . '/users.json';
const PEND_FILE   = STORE_DIR . '/pending.json';
const RATE_FILE   = STORE_DIR . '/rate.json';
const SEED_FILE   = __DIR__ . '/data/seed.json';
const UPLOAD_DIR  = __DIR__ . '/uploads/members';
const DATA_VERSION = 3;

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

session_name('qadada_sid');
session_set_cookie_params([
    'lifetime' => 60 * 60 * 24 * 30,
    'path'     => '/',
    'secure'   => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    'httponly' => true,
    'samesite' => 'Lax',
]);
ini_set('session.gc_maxlifetime', (string)(60 * 60 * 24 * 30));
session_start();
if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(16));

function out(array $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
function fail(string $msg, int $code = 400): void { out(['ok' => false, 'error' => $msg], $code); }

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
/** Read-modify-write a JSON file under an exclusive lock. */
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
function find_index(array $members, string $id): int {
    foreach ($members as $i => $m) if (($m['id'] ?? '') === $id) return $i;
    return -1;
}

/* ---------- one-time data updates for the live tree (never removes family edits) ---------- */
function migrate(array &$t): void {
    $v = (int)($t['v'] ?? 1);
    if ($v >= DATA_VERSION) return;
    $M = $t['members'] ?? [];
    $patch = function (string $id, array $fields, array $unset = []) use (&$M) {
        $i = find_index($M, $id);
        if ($i < 0) return;
        foreach ($fields as $k => $val) $M[$i][$k] = $val;
        foreach ($unset as $k) unset($M[$i][$k]);
    };
    $add = function (array $m, ?string $after = null) use (&$M) {
        if (find_index($M, $m['id']) >= 0) return;
        if (find_index($M, $m['parent']) < 0) return;
        $m += ['gender' => 'm', 'status' => 'confirmed', 'branch' => 'غزة'];
        $pos = $after !== null ? find_index($M, $after) : -1;
        if ($pos >= 0) array_splice($M, $pos + 1, 0, [$m]); else $M[] = $m;
    };
    if ($v < 2) {
        // the keffiyeh portrait is the mukhtar Mohammed Mustafa, father of Ghattas
        $patch('m12', ['title' => 'مختار العائلة', 'status' => 'confirmed', 'deceased' => true, 'featured' => true,
            'photo' => 'assets/img/mohammed-mustafa.webp',
            'note' => 'المختار الحاج محمد مصطفى محمد قدادة، رحمه الله. أبناؤه: غطاس وسعيد وعبد.']);
        $i = find_index($M, 'm14');
        if ($i >= 0 && (($M[$i]['photo'] ?? '') === 'assets/img/ghattas.webp')) unset($M[$i]['photo']);
        $patch('m14', ['title' => 'مختار العائلة', 'status' => 'confirmed', 'deceased' => true, 'featured' => true,
            'note' => 'المختار غطاس محمد قدادة، رحمه الله، خلف والده في المخترة، ووالد المختار الكبير مصطفى. ويرد اسمه «غطاس محمد قدادة» في وثيقة مؤرخة عام 1953.']);
        $patch('m30', ['status' => 'confirmed', 'featured' => true,
            'note' => 'المختار الكبير مصطفى غطاس قدادة، رحمه الله، خلف والده غطاس وجده محمد في المخترة.']);
        $patch('m13', ['status' => 'confirmed', 'deceased' => true, 'photo' => 'assets/img/abd.webp', 'title' => 'أبو عدنان',
            'note' => 'عبد محمد مصطفى قدادة (أبو عدنان)، رحمه الله.']);
        $patch('m15', ['status' => 'confirmed']);
        $patch('m10', ['status' => 'confirmed']);
        $patch('m18', ['status' => 'confirmed']);
        $patch('m22', ['status' => 'confirmed']);
        // order of Mohammed Mustafa's sons: Ghattas, Saeed, Abd
        $i = find_index($M, 'm13');
        if ($i >= 0) { $abd = $M[$i]; array_splice($M, $i, 1); $j = find_index($M, 'm15'); array_splice($M, $j + 1, 0, [$abd]); }
        // Ghattas' sons after Mustafa
        foreach ([['g1', 'أحمد'], ['g2', 'محمود'], ['g3', 'سليم'], ['g4', 'حسن'], ['g5', 'خليل']] as [$id, $n])
            $add(['id' => $id, 'parent' => 'm14', 'name' => $n]);
        // Mukhtar Mustafa's sons: Samir goes after Nabil
        $add(['id' => 'm37', 'parent' => 'm30', 'name' => 'سمير', 'title' => 'المرحوم', 'deceased' => true], 'm32');
        // Abd's sons
        foreach ([['a1', 'عدنان'], ['a2', 'عادل'], ['a3', 'زياد'], ['a4', 'عماد'], ['a5', 'أسامة']] as [$id, $n])
            $add(['id' => $id, 'parent' => 'm13', 'name' => $n]);
        // Helmi Hussein's sons and grandsons
        $add(['id' => 'h1', 'parent' => 'm22', 'name' => 'محمد', 'photo' => 'assets/img/m-helmi.webp', 'note' => 'محمد حلمي حسين مصطفى قدادة.']);
        $add(['id' => 'h2', 'parent' => 'm22', 'name' => 'إبراهيم', 'photo' => 'assets/img/ibrahim-helmi.webp', 'note' => 'إبراهيم حلمي حسين مصطفى قدادة.']);
        $add(['id' => 'h3', 'parent' => 'm22', 'name' => 'حسين', 'note' => 'حسين حلمي حسين مصطفى قدادة، ولا أولاد له.']);
        foreach ([['h11', 'أحمد'], ['h12', 'سامي'], ['h13', 'سميح'], ['h14', 'عماد'], ['h15', 'سامر']] as [$id, $n])
            $add(['id' => $id, 'parent' => 'h1', 'name' => $n]);
        foreach ([['h21', 'محمد'], ['h22', 'سعيد']] as [$id, $n])
            $add(['id' => $id, 'parent' => 'h2', 'name' => $n]);
        // Mustafa Mahmoud Ahmad Ali — placed under Ahmad bin Ali (position to be confirmed by the family)
        $add(['id' => 'mm1', 'parent' => 'm3', 'name' => 'محمود', 'status' => 'proposed',
            'note' => 'محمود بن أحمد بن علي، والد مصطفى محمود. موضعه في الشجرة مقترح بحسب تسلسل الاسم، وينتظر تأكيد العائلة.']);
        $add(['id' => 'mm2', 'parent' => 'mm1', 'name' => 'مصطفى', 'photo' => 'assets/img/mustafa-mahmoud.webp', 'deceased' => true,
            'note' => 'مصطفى محمود أحمد علي قدادة، رحمه الله. أبناؤه: أحمد ومحمد ومصطفى وفوزي وفؤاد.']);
        foreach ([['mm21', 'أحمد'], ['mm22', 'محمد'], ['mm23', 'مصطفى'], ['mm24', 'فوزي'], ['mm25', 'فؤاد']] as [$id, $n])
            $add(['id' => $id, 'parent' => 'mm2', 'name' => $n]);
    }
    if ($v < 3) {
        // 2026-11-18: real photos of Ghattas and Mustafa Ghattas; the family uses «الحاج» instead of «المختار» in names
        $patch('m14', ['photo' => 'assets/img/ghattas-photo.webp']);
        $i = find_index($M, 'm30');
        if ($i >= 0 && in_array($M[$i]['photo'] ?? '', ['', 'assets/img/mustafa.webp'], true)) $M[$i]['photo'] = 'assets/img/mustafa-ghattas.webp';
        foreach (['m12', 'm14', 'm30', 'm15'] as $id) $patch($id, ['title' => 'الحاج']);
        foreach ($M as &$mm) {
            foreach (['title', 'note', 'name'] as $k)
                if (isset($mm[$k]) && is_string($mm[$k])) $mm[$k] = str_replace(['المختار الكبير', 'المختار'], ['الحاج', 'الحاج'], $mm[$k]);
        }
        unset($mm);
        $patch('m12', ['note' => 'الحاج محمد مصطفى محمد قدادة، رحمه الله، مختار العائلة. أبناؤه: غطاس وسعيد وعبد.']);
        $patch('m14', ['note' => 'الحاج غطاس محمد قدادة، رحمه الله، خلف والده في المخترة، ووالد الحاج مصطفى. ويرد اسمه «غطاس محمد قدادة» في وثيقة مؤرخة عام 1953. أبناؤه: مصطفى وأحمد ومحمود وسليم وحسن وخليل.']);
        $patch('m30', ['note' => 'الحاج مصطفى غطاس قدادة، رحمه الله، مختار العائلة الكبير، خلف والده غطاس وجده محمد في المخترة.']);
    }
    $t['members'] = $M;
    $t['v'] = DATA_VERSION;
}

function ensure_store(): void {
    if (!is_dir(STORE_DIR)) @mkdir(STORE_DIR, 0755, true);
    if (!file_exists(STORE_DIR . '/.htaccess')) {
        @file_put_contents(STORE_DIR . '/.htaccess', "Require all denied\n<IfModule !mod_authz_core.c>\nDeny from all\n</IfModule>\n");
    }
    if (!file_exists(TREE_FILE)) {
        $seed = json_decode((string)@file_get_contents(SEED_FILE), true) ?: ['members' => []];
        write_json(TREE_FILE, $seed);
    }
    $t = read_json(TREE_FILE, ['members' => []]);
    if ((int)($t['v'] ?? 1) < DATA_VERSION) mutate(TREE_FILE, ['members' => []], function (array &$t) { migrate($t); });
}

/* ---------- auth & permissions ---------- */
function is_admin(): bool { return !empty($_SESSION['qadada_admin']); }
function branch_root(): ?string { return $_SESSION['qadada_root'] ?? null; }
function logged_in(): bool { return is_admin() || branch_root() !== null; }
function need_login(): void { if (!logged_in()) fail('يلزم تسجيل الدخول', 403); }
function need_admin(): void { if (!is_admin()) fail('هذه العملية للمدير فقط', 403); }
function need_csrf(): void {
    $t = $_SERVER['HTTP_X_CSRF'] ?? '';
    if (!is_string($t) || !hash_equals($_SESSION['csrf'], $t)) fail('انتهت الجلسة، حدّث الصفحة وحاول مجددًا', 419);
}
/** Can the current session edit this member? Admin: everything. Branch editor: their root and its descendants. */
function can_edit(array $members, string $id): bool {
    if (is_admin()) return true;
    $root = branch_root();
    if ($root === null) return false;
    $byId = [];
    foreach ($members as $m) $byId[$m['id']] = $m;
    $seen = 0;
    while ($id !== '' && isset($byId[$id]) && $seen++ < 200) {
        if ($id === $root) return true;
        $id = (string)($byId[$id]['parent'] ?? '');
    }
    return false;
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
    $m['note']     = clean($in['note'] ?? '', 1200);
    $st = $in['status'] ?? ($base['status'] ?? 'confirmed');
    $m['status']   = in_array($st, STATUSES, true) ? $st : 'confirmed';
    if (!is_admin() && isset($base['featured'])) $m['featured'] = $base['featured'];
    if ($m['name'] === '') fail('الاسم مطلوب');
    return $m;
}
function new_id(): string { return 'm' . base_convert((string)(int)(microtime(true) * 1000), 10, 36) . bin2hex(random_bytes(2)); }
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
function public_users(): array {
    $list = [];
    foreach (read_json(USERS_FILE, ['users' => []])['users'] ?? [] as $u)
        $list[] = ['u' => $u['u'], 'root' => $u['root'], 'label' => $u['label'] ?? '', 'created' => $u['created'] ?? ''];
    return $list;
}

ensure_store();
$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$in = [];
if ($method === 'POST') {
    $ct = $_SERVER['CONTENT_TYPE'] ?? '';
    $in = stripos($ct, 'application/json') !== false ? (json_decode((string)file_get_contents('php://input'), true) ?: []) : $_POST;
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
        'user'    => branch_root() !== null ? ['u' => $_SESSION['qadada_user'] ?? '', 'root' => branch_root()] : null,
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
    unset($_SESSION['qadada_root'], $_SESSION['qadada_user']);
    out(['ok' => true, 'csrf' => $_SESSION['csrf']]);
}

case 'login': {
    if ($method !== 'POST') fail('bad method', 405);
    if (!rate_ok('login', 40)) fail('محاولات كثيرة، حاول لاحقًا', 429);
    $user = mb_strtolower(clean($in['username'] ?? '', 40));
    $pw = (string)($in['password'] ?? '');
    $okAdmin = false; $branch = null;
    if ($user === '' || $user === 'admin') {
        $auth = read_json(AUTH_FILE, []);
        $okAdmin = !empty($auth['hash']) && password_verify($pw, $auth['hash']);
    } else {
        foreach (read_json(USERS_FILE, ['users' => []])['users'] ?? [] as $u) {
            if ($u['u'] === $user && password_verify($pw, $u['hash'])) { $branch = $u; break; }
        }
    }
    if (!$okAdmin && !$branch) { usleep(400000); fail('اسم المستخدم أو كلمة المرور غير صحيحة', 401); }
    session_regenerate_id(true);
    $_SESSION['qadada_admin'] = $okAdmin;
    if ($branch) { $_SESSION['qadada_root'] = $branch['root']; $_SESSION['qadada_user'] = $branch['u']; }
    else unset($_SESSION['qadada_root'], $_SESSION['qadada_user']);
    out(['ok' => true, 'csrf' => $_SESSION['csrf']]);
}

case 'logout': {
    if ($method !== 'POST') fail('bad method', 405);
    $_SESSION['qadada_admin'] = false;
    unset($_SESSION['qadada_root'], $_SESSION['qadada_user']);
    out(['ok' => true]);
}

case 'password': {
    if ($method !== 'POST') fail('bad method', 405);
    need_login();
    $pw = (string)($in['password'] ?? '');
    $min = is_admin() ? 8 : 6;
    if (mb_strlen($pw) < $min) fail("كلمة المرور يجب أن تكون $min أحرف على الأقل");
    if (is_admin()) {
        mutate(AUTH_FILE, [], function (array &$a) use ($pw) { $a['hash'] = password_hash($pw, PASSWORD_DEFAULT); });
    } else {
        $me = $_SESSION['qadada_user'] ?? '';
        mutate(USERS_FILE, ['users' => []], function (array &$d) use ($pw, $me) {
            foreach ($d['users'] as &$u) if ($u['u'] === $me) $u['hash'] = password_hash($pw, PASSWORD_DEFAULT);
        });
    }
    out(['ok' => true]);
}

case 'save': {
    if ($method !== 'POST') fail('bad method', 405);
    need_login();
    $id = clean($in['id'] ?? '', 20);
    $parent = clean($in['parent'] ?? '', 20);
    $saved = mutate(TREE_FILE, ['members' => []], function (array &$t) use ($in, $id, $parent) {
        $members = $t['members'] ?? [];
        if ($id !== '') {
            $i = find_index($members, $id);
            if ($i < 0) fail('الفرد غير موجود', 404);
            if (!can_edit($members, $id)) fail('ليست لديك صلاحية على هذا الفرع', 403);
            $members[$i] = member_from_input($in, $members[$i]);
            $res = $members[$i];
        } else {
            $pi = find_index($members, $parent);
            if ($pi < 0) fail('الأب أو الأم غير موجود في الشجرة', 404);
            if (!can_edit($members, $parent)) fail('ليست لديك صلاحية على هذا الفرع', 403);
            $m = member_from_input($in);
            $m['id'] = new_id();
            $m['parent'] = $parent;
            if ($m['branch'] === '') $m['branch'] = $members[$pi]['branch'] ?? '';
            $members[] = $m;
            $res = $m;
        }
        $t['members'] = $members;
        return $res;
    });
    out(['ok' => true, 'member' => $saved]);
}

case 'bulk': {
    if ($method !== 'POST') fail('bad method', 405);
    need_login();
    $parent = clean($in['parent'] ?? '', 20);
    $names = preg_split('/[\r\n،,]+/u', (string)($in['names'] ?? '')) ?: [];
    $names = array_values(array_filter(array_map(fn($n) => clean($n, 60), $names), fn($n) => $n !== ''));
    if (!$names) fail('اكتب اسمًا واحدًا على الأقل');
    if (count($names) > 40) fail('الحد الأقصى 40 اسمًا في المرة الواحدة');
    $gender = (($in['gender'] ?? 'm') === 'f') ? 'f' : 'm';
    $place = clean($in['place'] ?? '', 40);
    $added = mutate(TREE_FILE, ['members' => []], function (array &$t) use ($parent, $names, $gender, $place) {
        $pi = find_index($t['members'] ?? [], $parent);
        if ($pi < 0) fail('الأب أو الأم غير موجود في الشجرة', 404);
        if (!can_edit($t['members'], $parent)) fail('ليست لديك صلاحية على هذا الفرع', 403);
        $out = [];
        foreach ($names as $n) {
            $m = ['id' => new_id(), 'parent' => $parent, 'name' => $n, 'gender' => $gender, 'status' => 'confirmed',
                  'branch' => $t['members'][$pi]['branch'] ?? ''];
            if ($place !== '') $m['place'] = $place;
            usleep(1500);
            $t['members'][] = $m;
            $out[] = $m;
        }
        return $out;
    });
    out(['ok' => true, 'added' => $added]);
}

case 'delete': {
    if ($method !== 'POST') fail('bad method', 405);
    need_login();
    $id = clean($in['id'] ?? '', 20);
    if (!is_admin() && $id === branch_root()) fail('لا يمكنك حذف رأس الفرع الخاص بك');
    mutate(TREE_FILE, ['members' => []], function (array &$t) use ($id) {
        $members = $t['members'] ?? [];
        if (!can_edit($members, $id)) fail('ليست لديك صلاحية على هذا الفرع', 403);
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
    need_login();
    $id = clean($_POST['id'] ?? '', 20);
    if (!can_edit(read_json(TREE_FILE, ['members' => []])['members'] ?? [], $id)) fail('ليست لديك صلاحية على هذا الفرع', 403);
    $f = $_FILES['photo'] ?? null;
    if (!$f || ($f['error'] ?? 1) !== UPLOAD_ERR_OK) fail('تعذّر رفع الصورة');
    if ($f['size'] > 12 * 1024 * 1024) fail('حجم الصورة أكبر من 12 ميجابايت');
    $info = @getimagesize($f['tmp_name']);
    $types = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp'];
    if (!$info || !isset($types[$info[2]])) fail('الصيغ المسموحة: JPG أو PNG أو WEBP');
    if (!is_dir(UPLOAD_DIR)) @mkdir(UPLOAD_DIR, 0755, true);
    $name = preg_replace('/[^a-z0-9]/', '', $id) . '-' . bin2hex(random_bytes(4));
    $saved = false; $ext = 'jpg';
    if (function_exists('imagecreatefromstring')) {
        $img = @imagecreatefromstring((string)file_get_contents($f['tmp_name']));
        if ($img) {
            // honour phone camera orientation
            if ($info[2] === IMAGETYPE_JPEG && function_exists('exif_read_data')) {
                $o = (int)(@exif_read_data($f['tmp_name'])['Orientation'] ?? 1);
                if ($o === 3) $img = imagerotate($img, 180, 0);
                if ($o === 6) $img = imagerotate($img, -90, 0);
                if ($o === 8) $img = imagerotate($img, 90, 0);
            }
            $w = imagesx($img); $h = imagesy($img); $max = 1000;
            $s = min(1, $max / max($w, $h));
            $dst = imagecreatetruecolor((int)($w * $s), (int)($h * $s));
            imagecopyresampled($dst, $img, 0, 0, 0, 0, (int)($w * $s), (int)($h * $s), $w, $h);
            $saved = imagejpeg($dst, UPLOAD_DIR . "/$name.jpg", 86);
        }
    }
    if (!$saved) {
        $ext = $types[$info[2]];
        $saved = move_uploaded_file($f['tmp_name'], UPLOAD_DIR . "/$name.$ext");
    }
    if (!$saved) fail('تعذّر حفظ الصورة', 500);
    $path = "uploads/members/$name.$ext";
    mutate(TREE_FILE, ['members' => []], function (array &$t) use ($id, $path) {
        $i = find_index($t['members'] ?? [], $id);
        if ($i < 0) fail('الفرد غير موجود', 404);
        $t['members'][$i]['photo'] = $path;
    });
    out(['ok' => true, 'photo' => $path]);
}

case 'unphoto': {
    if ($method !== 'POST') fail('bad method', 405);
    need_login();
    $id = clean($in['id'] ?? '', 20);
    mutate(TREE_FILE, ['members' => []], function (array &$t) use ($id) {
        if (!can_edit($t['members'] ?? [], $id)) fail('ليست لديك صلاحية على هذا الفرع', 403);
        $i = find_index($t['members'], $id);
        if ($i >= 0) unset($t['members'][$i]['photo']);
    });
    out(['ok' => true]);
}

/* ----- branch accounts (admin) ----- */
case 'users': {
    need_admin();
    out(['ok' => true, 'users' => public_users()]);
}

case 'user_save': {
    if ($method !== 'POST') fail('bad method', 405);
    need_admin();
    $u = mb_strtolower(clean($in['u'] ?? '', 40));
    if (!preg_match('/^[a-z0-9._-]{3,40}$/', $u) || $u === 'admin') fail('اسم المستخدم بالإنجليزية فقط (حروف وأرقام، 3 أحرف على الأقل)');
    $root = clean($in['root'] ?? '', 20);
    $pw = (string)($in['password'] ?? '');
    $label = clean($in['label'] ?? '', 60);
    if (find_index(read_json(TREE_FILE, ['members' => []])['members'] ?? [], $root) < 0) fail('اختر رأس الفرع من الشجرة');
    mutate(USERS_FILE, ['users' => []], function (array &$d) use ($u, $root, $pw, $label) {
        foreach ($d['users'] as &$x) {
            if ($x['u'] === $u) {
                $x['root'] = $root; $x['label'] = $label;
                if ($pw !== '') { if (mb_strlen($pw) < 6) fail('كلمة المرور 6 أحرف على الأقل'); $x['hash'] = password_hash($pw, PASSWORD_DEFAULT); }
                return;
            }
        }
        if (mb_strlen($pw) < 6) fail('كلمة المرور 6 أحرف على الأقل');
        if (count($d['users']) >= 300) fail('وصلت للحد الأقصى من الحسابات');
        $d['users'][] = ['u' => $u, 'hash' => password_hash($pw, PASSWORD_DEFAULT), 'root' => $root, 'label' => $label, 'created' => date('c')];
    });
    out(['ok' => true, 'users' => public_users()]);
}

case 'user_delete': {
    if ($method !== 'POST') fail('bad method', 405);
    need_admin();
    $u = mb_strtolower(clean($in['u'] ?? '', 40));
    mutate(USERS_FILE, ['users' => []], function (array &$d) use ($u) {
        $d['users'] = array_values(array_filter($d['users'], fn($x) => $x['u'] !== $u));
    });
    out(['ok' => true, 'users' => public_users()]);
}

/* ----- public suggestions ----- */
case 'suggest': {
    if ($method !== 'POST') fail('bad method', 405);
    if (!empty($in['website'])) out(['ok' => true]); // honeypot
    if (!rate_ok('suggest', 15)) fail('وصلت للحد اليومي من الاقتراحات، شكرًا لك', 429);
    $tree = read_json(TREE_FILE, ['members' => []]);
    $parent = clean($in['parent'] ?? '', 20);
    if (find_index($tree['members'] ?? [], $parent) < 0) fail('اختر الأب أو الأم من الشجرة');
    $m = member_from_input($in);
    $m['status'] = 'narrative';
    $item = ['pid' => 'p' . bin2hex(random_bytes(5)), 'parent' => $parent, 'member' => $m,
             'by' => clean($in['by'] ?? '', 60), 'contact' => clean($in['contact'] ?? '', 60), 'at' => date('c')];
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
            $m['id'] = new_id();
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
