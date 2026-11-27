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
const DATA_VERSION = 29;

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
    if ($v < 4) {
        // 2026-11-20: full sons and grandsons of Mohammed Mustafa's three branches (family tree images sent by the family)
        $norm = fn($x) => str_replace(['أ', 'إ', 'آ', 'ة', 'ى'], ['ا', 'ا', 'ا', 'ه', 'ي'], trim((string)$x));
        $kids = function (string $parent, array $names, string $prefix) use (&$M, $add, $norm) {
            if (find_index($M, $parent) < 0) return;
            foreach ($names as $k => $n) {
                $dup = false;
                foreach ($M as $x) if (($x['parent'] ?? '') === $parent && $norm($x['name']) === $norm($n)) { $dup = true; break; }
                if (!$dup) $add(['id' => $prefix . ($k + 1), 'parent' => $parent, 'name' => $n]);
            }
        };
        $childId = function (string $parent, string $name) use (&$M, $norm) {
            foreach ($M as $x) if (($x['parent'] ?? '') === $parent && $norm($x['name']) === $norm($name)) return $x['id'];
            return null;
        };
        // Saeed's sons (Mohammed and Ghaleb already exist), then grandsons
        $kids('m15', ['محمد', 'غالب', 'زهير', 'سهيل', 'سعد', 'سعدو', 'نافذ', 'ناصر', 'زكي', 'فرج'], 's');
        $g = [
            'غالب' => ['محمد', 'محمود', 'أحمد', 'فايز', 'كريم', 'سميح'],
            'سهيل' => ['سامح', 'توفيق', 'منذر', 'سامي', 'بشار'],
            'سعد'  => ['فاروق', 'سعيد'],
            'سعدو' => ['سعيد'],
            'نافذ' => ['أحمد', 'هشام'],
            'ناصر' => ['نائل', 'وائل'],
            'زكي'  => ['محمد'],
            'فرج'  => ['محمد', 'سعيد'],
        ];
        $i = 0;
        foreach ($g as $son => $names) { $i++; if ($sid = $childId('m15', $son)) $kids($sid, $names, "s{$i}x"); }
        // Abd's grandsons
        $g = ['عدنان' => ['عبد'], 'عادل' => ['رائد', 'محمد', 'رأفت'], 'زياد' => ['إيهاب', 'محمد'], 'عماد' => ['محمود'], 'أسامة' => ['رامي']];
        $i = 0;
        foreach ($g as $son => $names) { $i++; if ($sid = $childId('m13', $son)) $kids($sid, $names, "a{$i}x"); }
        // Ghattas' grandsons
        $g = ['أحمد' => ['جمال', 'مصطفى', 'طلال', 'حكيم', 'حسام'], 'محمود' => ['خالد', 'طارق', 'هشام'], 'سليم' => ['إبراهيم'],
              'حسن' => ['شادي', 'محمد', 'أحمد'], 'خليل' => ['إبراهيم', 'طلعت', 'بهجت', 'بهاء', 'محمد']];
        $i = 0;
        foreach ($g as $son => $names) { $i++; if ($sid = $childId('m14', $son)) $kids($sid, $names, "g{$i}x"); }
        // Mustafa Ghattas' grandsons
        $kids('m32', ['مصطفى'], 'n32x');   // Nabil
        $kids('m37', ['محمد'], 'n37x');    // Samir
        $kids('m33', ['جلال', 'نضال', 'محمد', 'أحمد'], 'n33x'); // Tayseer
        if ($tm = $childId('m33', 'محمد')) $kids($tm, ['آدم'], 'n33m');
        $kids('m36', ['سامر', 'تامر', 'نادر', 'مصطفى'], 'n36x'); // Mohammed
        // Helmi: Hussein has daughters only, so drop the old "no children" wording; محمد's son is سميح
        $patch('h3', ['note' => 'حسين حلمي حسين مصطفى قدادة.']);
    }
    if ($v < 5) {
        // 2026-11-20 corrections to Saeed's branch from the family
        $norm = fn($x) => str_replace(['أ', 'إ', 'آ', 'ة', 'ى'], ['ا', 'ا', 'ا', 'ه', 'ي'], trim((string)$x));
        $cid = function (string $parent, string $name) use (&$M, $norm) {
            foreach ($M as $x) if (($x['parent'] ?? '') === $parent && $norm($x['name']) === $norm($name)) return $x['id'];
            return null;
        };
        $kidsOf = function (string $parent) use (&$M) { $o = []; foreach ($M as $x) if (($x['parent'] ?? '') === $parent) $o[] = $x['id']; return $o; };
        $delLeaf = function (?string $id) use (&$M, $kidsOf) {
            if (!$id || $kidsOf($id)) return;
            $i = find_index($M, $id); if ($i >= 0) array_splice($M, $i, 1);
        };
        $reparent = function (string $id, string $to) use (&$M) {   // moves to the end so order follows the call order
            $i = find_index($M, $id); if ($i < 0) return;
            $m = $M[$i]; array_splice($M, $i, 1); $m['parent'] = $to; $M[] = $m;
        };
        $ghaleb = $cid('m15', 'غالب'); $zuhair = $cid('m15', 'زهير'); $suhail = $cid('m15', 'سهيل');
        $saad = $cid('m15', 'سعد'); $saado = $cid('m15', 'سعدو'); $nafez = $cid('m15', 'نافذ') ?? $cid('m15', 'نافز');
        if ($nafez) $patch($nafez, ['name' => 'نافذ']);
        // Ghaleb's listed sons belong to Zuhair; Ghaleb's sons are Saeed, Mahmoud, Yasser
        if ($ghaleb && $zuhair) {
            foreach ($kidsOf($ghaleb) as $k) $reparent($k, $zuhair);
            foreach ([['s1y1', 'سعيد'], ['s1y2', 'محمود'], ['s1y3', 'ياسر']] as [$id, $n]) $add(['id' => $id, 'parent' => $ghaleb, 'name' => $n]);
        }
        // Nafez's sons: Ahmad, Sami, Tawfiq, Munther, Bashar (the list shown under Suhail); Hisham removed, duplicate Sami removed
        if ($nafez && $suhail) {
            $delLeaf($cid($nafez, 'هشام'));
            $delLeaf($cid($suhail, 'سامح'));
            if ($ah = $cid($nafez, 'أحمد')) $reparent($ah, $nafez);
            foreach (['سامي', 'توفيق', 'منذر', 'بشار'] as $n) if ($k = $cid($suhail, $n)) $reparent($k, $nafez);
        }
        if ($saado) $delLeaf($cid($saado, 'سعيد'));
        if ($saad) $delLeaf($cid($saad, 'سعيد'));
    }
    if ($v < 6) {
        // photo of Hajj Saeed Mohammed Mustafa
        $i = find_index($M, 'm15');
        if ($i >= 0 && empty($M[$i]['photo'])) $M[$i]['photo'] = 'assets/img/saeed.webp';
        $patch('m15', ['note' => 'الحاج سعيد محمد مصطفى قدادة، ابن الحاج محمد مصطفى وأخو الحاج غطاس وعبد.']);
    }
    if ($v < 7) {
        // Hussein bin Mustafa has one son, Helmi; Helmi's sons are Hussein, Mohammed, Ibrahim (in that order)
        $norm = fn($x) => str_replace(['أ', 'إ', 'آ', 'ة', 'ى'], ['ا', 'ا', 'ا', 'ه', 'ي'], trim((string)$x));
        $kidsOf = function (string $parent) use (&$M) { $o = []; foreach ($M as $x) if (($x['parent'] ?? '') === $parent) $o[] = $x['id']; return $o; };
        $toEnd = function (string $id, string $parent) use (&$M) {
            $i = find_index($M, $id); if ($i < 0) return;
            $m = $M[$i]; array_splice($M, $i, 1); $m['parent'] = $parent; $M[] = $m;
        };
        $map = ['m19' => 'h3', 'm20' => 'h1', 'm21' => 'h2'];  // old wrong entries under Hussein -> Helmi's real sons
        foreach ($map as $old => $new) {
            if (find_index($M, $old) < 0) continue;
            if (find_index($M, $new) >= 0) foreach ($kidsOf($old) as $k) $toEnd($k, $new);
            if (!$kidsOf($old)) { $i = find_index($M, $old); array_splice($M, $i, 1); }
        }
        foreach (['h3', 'h1', 'h2'] as $id) $toEnd($id, 'm22');
        foreach (['h11', 'h12', 'h13', 'h15', 'h21', 'h22'] as $id) { $i = find_index($M, $id); if ($i >= 0) { $p = $M[$i]['parent']; $toEnd($id, $p); } }
        // Mohammed Helmi's sons per the family's tree image: Ahmad, Sami, Sameeh, Samer
        $i = find_index($M, 'h14');
        if ($i >= 0 && !$kidsOf('h14') && $norm($M[$i]['name']) === 'عماد') array_splice($M, $i, 1);
    }
    if ($v < 8) {
        // Hussein is Mustafa's brother (both sons of the common grandfather), not his son
        $i = find_index($M, 'm18'); $j = find_index($M, 'm10');
        if ($i >= 0 && $j >= 0 && ($M[$i]['parent'] ?? '') === 'm10') {
            $M[$i]['parent'] = $M[$j]['parent'];
            $h = $M[$i]; array_splice($M, $i, 1);
            $j = find_index($M, 'm10'); array_splice($M, $j + 1, 0, [$h]);
        }
    }
    if ($v < 9) {
        // confirmed by the family: «محمد حلمي حسين مصطفى», so Hussein is Mustafa's son (brother of Hajj Mohammed)
        $i = find_index($M, 'm18');
        if ($i >= 0 && find_index($M, 'm10') >= 0 && ($M[$i]['parent'] ?? '') !== 'm10') {
            $h = $M[$i]; $h['parent'] = 'm10'; array_splice($M, $i, 1);
            $j = find_index($M, 'm12'); array_splice($M, $j >= 0 ? $j + 1 : count($M), 0, [$h]);
        }
    }
    if ($v < 10) {
        // Zuhair's sons: كريم is أكرم, سميح comes before him, and a brother فضل
        $norm = fn($x) => str_replace(['أ', 'إ', 'آ', 'ة', 'ى'], ['ا', 'ا', 'ا', 'ه', 'ي'], trim((string)$x));
        $cid = function (string $parent, string $name) use (&$M, $norm) {
            foreach ($M as $x) if (($x['parent'] ?? '') === $parent && $norm($x['name']) === $norm($name)) return $x['id'];
            return null;
        };
        $toEnd = function (?string $id) use (&$M) { if (!$id) return; $i = find_index($M, $id); if ($i < 0) return; $m = $M[$i]; array_splice($M, $i, 1); $M[] = $m; };
        if ($z = $cid('m15', 'زهير')) {
            if ($k = $cid($z, 'كريم')) $patch($k, ['name' => 'أكرم']);
            foreach (['محمد', 'محمود', 'أحمد', 'فايز', 'سميح', 'أكرم'] as $n) $toEnd($cid($z, $n));
            if (!$cid($z, 'فضل')) $add(['id' => 'z1f', 'parent' => $z, 'name' => 'فضل']);
        }
    }
    if ($v < 11) {
        // 2026-11-20: Ahmad bin Ghattas has a son سمير after حسام; Salim's and Mahmoud's sons were swapped
        $norm = fn($x) => str_replace(['أ', 'إ', 'آ', 'ة', 'ى'], ['ا', 'ا', 'ا', 'ه', 'ي'], trim((string)$x));
        $cid = function (string $parent, string $name) use (&$M, $norm) {
            foreach ($M as $x) if (($x['parent'] ?? '') === $parent && $norm($x['name']) === $norm($name)) return $x['id'];
            return null;
        };
        $kidsOf = function (string $parent) use (&$M) { $o = []; foreach ($M as $x) if (($x['parent'] ?? '') === $parent) $o[] = $x['id']; return $o; };
        $reparent = function (string $id, string $to) use (&$M) {
            $i = find_index($M, $id); if ($i < 0) return;
            $m = $M[$i]; array_splice($M, $i, 1); $m['parent'] = $to; $M[] = $m;
        };
        if (($ahmad = $cid('m14', 'أحمد')) && !$cid($ahmad, 'سمير')) {
            $add(['id' => 'g1s', 'parent' => $ahmad, 'name' => 'سمير'], $cid($ahmad, 'حسام'));
        }
        // Hasan's sons: شادي، فادي، محمد، أحمد، محمود
        if ($has = $cid('m14', 'حسن')) {
            if (!$cid($has, 'فادي')) $add(['id' => 'g4f', 'parent' => $has, 'name' => 'فادي'], $cid($has, 'شادي'));
            if (!$cid($has, 'محمود')) $add(['id' => 'g4m', 'parent' => $has, 'name' => 'محمود'], $cid($has, 'أحمد'));
        }
        $mah = $cid('m14', 'محمود'); $sal = $cid('m14', 'سليم');
        if ($mah && $sal) {
            $a = $kidsOf($mah); $b = $kidsOf($sal);
            foreach ($a as $id) $reparent($id, $sal);
            foreach ($b as $id) $reparent($id, $mah);
        }
    }
    if ($v < 12) {
        // 2026-11-20: Khalil bin Ghattas' grandsons
        $norm = fn($x) => str_replace(['أ', 'إ', 'آ', 'ة', 'ى'], ['ا', 'ا', 'ا', 'ه', 'ي'], trim((string)$x));
        $cid = function (string $parent, string $name) use (&$M, $norm) {
            foreach ($M as $x) if (($x['parent'] ?? '') === $parent && $norm($x['name']) === $norm($name)) return $x['id'];
            return null;
        };
        if ($kh = $cid('m14', 'خليل')) {
            $g = ['إبراهيم' => ['محمد', 'أحمد', 'عمر'], 'طلعت' => ['خميس'], 'بهجت' => ['خليل', 'يزن', 'كنان'], 'بهاء' => ['شيراز', 'تيم']];
            $i = 0;
            foreach ($g as $son => $names) {
                $i++;
                if (!($sid = $cid($kh, $son))) continue;
                foreach ($names as $k => $n) if (!$cid($sid, $n)) $add(['id' => "k{$i}x" . ($k + 1), 'parent' => $sid, 'name' => $n]);
            }
        }
    }
    if ($v < 13) {
        // 2026-11-20: Jalal bin Tayseer's sons
        $norm = fn($x) => str_replace(['أ', 'إ', 'آ', 'ة', 'ى'], ['ا', 'ا', 'ا', 'ه', 'ي'], trim((string)$x));
        $cid = function (string $parent, string $name) use (&$M, $norm) {
            foreach ($M as $x) if (($x['parent'] ?? '') === $parent && $norm($x['name']) === $norm($name)) return $x['id'];
            return null;
        };
        if ($j = $cid('m33', 'جلال'))
            foreach (['تيسير', 'ياسين'] as $k => $n) if (!$cid($j, $n)) $add(['id' => 'n33j' . ($k + 1), 'parent' => $j, 'name' => $n]);
    }
    if ($v < 14) {
        // 2026-11-20: Amin bin Mustafa Ghattas' son
        $norm = fn($x) => str_replace(['أ', 'إ', 'آ', 'ة', 'ى'], ['ا', 'ا', 'ا', 'ه', 'ي'], trim((string)$x));
        $cid = function (string $parent, string $name) use (&$M, $norm) {
            foreach ($M as $x) if (($x['parent'] ?? '') === $parent && $norm($x['name']) === $norm($name)) return $x['id'];
            return null;
        };
        if (($a = $cid('m30', 'أمين')) && !$cid($a, 'تامر')) $add(['id' => 'n30a1', 'parent' => $a, 'name' => 'تامر']);
    }
    if ($v < 15) {
        // 2026-11-20: Hussein Helmi's photo; the elders shown with photos carry «الحاج»
        $patch('h3', ['photo' => 'assets/img/hussein-helmi.webp']);
        foreach (['h1', 'h2', 'h3'] as $id) { $i = find_index($M, $id); if ($i >= 0 && empty($M[$i]['title'])) $M[$i]['title'] = 'الحاج'; }
    }
    if ($v < 16) {
        // 2026-11-20: Ahmad bin Mohammed Helmi's sons and grandsons
        $norm = fn($x) => str_replace(['أ', 'إ', 'آ', 'ة', 'ى'], ['ا', 'ا', 'ا', 'ه', 'ي'], trim((string)$x));
        $cid = function (string $parent, string $name) use (&$M, $norm) {
            foreach ($M as $x) if (($x['parent'] ?? '') === $parent && $norm($x['name']) === $norm($name)) return $x['id'];
            return null;
        };
        $kids = function (?string $parent, array $names, string $prefix) use (&$M, $add, $cid) {
            if (!$parent) return;
            foreach ($names as $k => $n) if (!$cid($parent, $n)) $add(['id' => $prefix . ($k + 1), 'parent' => $parent, 'name' => $n]);
        };
        if ($ah = $cid('h1', 'أحمد')) {
            $kids($ah, ['محمد', 'محمود', 'مهند', 'مؤيد', 'أنس'], 'h11x');
            $kids($cid($ah, 'محمد'), ['أحمد', 'حمزة'], 'h11m');
            $kids($cid($ah, 'محمود'), ['مهند', 'هاشم'], 'h11d');
        }
    }
    if ($v < 17) {
        // 2026-11-20: the family says these three were not mukhtars; no «مختار/المخترة» anywhere in the data
        $patch('m12', ['title' => 'الحاج', 'note' => 'الحاج محمد مصطفى محمد قدادة، رحمه الله. أبناؤه: غطاس وسعيد وعبد.']);
        $patch('m14', ['title' => 'الحاج', 'note' => 'الحاج غطاس محمد قدادة، رحمه الله، ووالد الحاج مصطفى. ويرد اسمه «غطاس محمد قدادة» في وثيقة مؤرخة عام 1953. أبناؤه: مصطفى وأحمد ومحمود وسليم وحسن وخليل.']);
        $patch('m30', ['title' => 'الحاج', 'note' => 'الحاج مصطفى غطاس قدادة، رحمه الله، كبير العائلة.']);
        foreach ($M as &$mm) {
            foreach (['title', 'note'] as $k) if (isset($mm[$k]) && is_string($mm[$k]) && preg_match('/مخت/u', $mm[$k]))
                $mm[$k] = $k === 'title' ? 'الحاج' : trim(preg_replace('/،?\s*[^،.]*مخت[^،.]*/u', '', $mm[$k]));
        }
        unset($mm);
    }
    if ($v < 18) {
        // 2026-11-20: Hasan bin Ghattas' grandsons
        $norm = fn($x) => str_replace(['أ', 'إ', 'آ', 'ة', 'ى'], ['ا', 'ا', 'ا', 'ه', 'ي'], trim((string)$x));
        $cid = function (string $parent, string $name) use (&$M, $norm) {
            foreach ($M as $x) if (($x['parent'] ?? '') === $parent && $norm($x['name']) === $norm($name)) return $x['id'];
            return null;
        };
        if ($has = $cid('m14', 'حسن')) {
            if (($s = $cid($has, 'شادي')) && !$cid($s, 'حسن')) $add(['id' => 'g4s1', 'parent' => $s, 'name' => 'حسن']);
            if (($m = $cid($has, 'محمد')) && !$cid($m, 'كريم')) $add(['id' => 'g4d1', 'parent' => $m, 'name' => 'كريم']);
        }
    }
    if ($v < 19) {
        // 2026-11-20: Mohammed Helmi's sons' children; عماد is back between سميح and سامر
        $norm = fn($x) => str_replace(['أ', 'إ', 'آ', 'ة', 'ى'], ['ا', 'ا', 'ا', 'ه', 'ي'], trim((string)$x));
        $cid = function (string $parent, string $name) use (&$M, $norm) {
            foreach ($M as $x) if (($x['parent'] ?? '') === $parent && $norm($x['name']) === $norm($name)) return $x['id'];
            return null;
        };
        $kids = function (?string $parent, array $names, string $prefix) use (&$M, $add, $cid) {
            if (!$parent) return;
            foreach ($names as $k => $n) if (!$cid($parent, $n)) $add(['id' => $prefix . ($k + 1), 'parent' => $parent, 'name' => $n]);
        };
        if (find_index($M, 'h1') >= 0) {
            if (!$cid('h1', 'عماد')) $add(['id' => 'h14', 'parent' => 'h1', 'name' => 'عماد'], $cid('h1', 'سميح'));
            $sami = $cid('h1', 'سامي');
            $kids($sami, ['خالد', 'محمد', 'صبحي'], 'h12x');
            if ($sami) $kids($cid($sami, 'خالد'), ['سامي', 'زين', 'عزمي'], 'h12k');
            $sameeh = $cid('h1', 'سميح');
            $kids($sameeh, ['محمد', 'مصطفى', 'معتصم'], 'h13x');
            if ($sameeh) $kids($cid($sameeh, 'مصطفى'), ['سميح'], 'h13m');
            $kids($cid('h1', 'عماد'), ['إياد', 'محمد', 'حاتم'], 'h14x');
            $samer = $cid('h1', 'سامر');
            $kids($samer, ['عبدالله', 'حلمي', 'محمد'], 'h15x');
            if ($samer) $kids($cid($samer, 'عبدالله'), ['سامر'], 'h15a');
        }
    }
    if ($v < 20) {
        // 2026-11-20: Ibrahim Helmi's grandsons
        $norm = fn($x) => str_replace(['أ', 'إ', 'آ', 'ة', 'ى'], ['ا', 'ا', 'ا', 'ه', 'ي'], trim((string)$x));
        $cid = function (string $parent, string $name) use (&$M, $norm) {
            foreach ($M as $x) if (($x['parent'] ?? '') === $parent && $norm($x['name']) === $norm($name)) return $x['id'];
            return null;
        };
        $kids = function (?string $parent, array $names, string $prefix) use (&$M, $add, $cid) {
            if (!$parent) return;
            foreach ($names as $k => $n) if (!$cid($parent, $n)) $add(['id' => $prefix . ($k + 1), 'parent' => $parent, 'name' => $n]);
        };
        if (find_index($M, 'h2') >= 0) {
            $kids($cid('h2', 'محمد'), ['إبراهيم', 'عبد الرحمن', 'خالد'], 'h21x');
            $kids($cid('h2', 'سعيد'), ['إبراهيم', 'أحمد', 'يوسف'], 'h22x');
        }
    }
    if ($v < 21) {
        // 2026-11-20: no professional titles for anyone; only تيسير بن مصطفى غطاس keeps الأستاذ
        $norm = fn($x) => str_replace(['أ', 'إ', 'آ', 'ة', 'ى'], ['ا', 'ا', 'ا', 'ه', 'ي'], trim((string)$x));
        foreach ($M as &$mm) {
            $tt = (string)($mm['title'] ?? '');
            if ($tt === '') continue;
            $isTayseer = ($mm['parent'] ?? '') === 'm30' && $norm($mm['name']) === 'تيسير';
            if ($isTayseer) { $mm['title'] = 'الأستاذ'; continue; }
            if (preg_match('/لواء|مهندس|م\.|دكتور|د\.|عميد|عقيد|عسكري|ضابط|السيد|الأستاذ|الاستاذ|المحامي|الشيخ/u', $tt)) $mm['title'] = '';
        }
        unset($mm);
    }
    if ($v < 22) {
        // 2026-11-20: the user wants facts only, no doubt wording anywhere
        foreach ($M as &$mm) {
            $mm['status'] = 'confirmed';
            if (($mm['title'] ?? '') === 'الجد المشترك بحسب الرواية العائلية') $mm['title'] = 'الجد الجامع';
            $n = (string)($mm['note'] ?? '');
            if ($n === '') continue;
            $n = str_replace(
                ['تتفرع منه ذرية العائلة في غزة ويافا. اسم والده غير معروف حتى الآن.', 'بحسب الشهادة العائلية المنشورة في 5 ديسمبر 2025.', 'الجد المذكور في الرواية العائلية لفرع غزة.', 'لم تُستكمل ذريته بعد.', 'بحسب المعلومات العائلية، أنجب محمدًا وغالبًا.', ' موضعه في الشجرة مقترح بحسب تسلسل الاسم، وينتظر تأكيد العائلة.'],
                ['تتفرع منه ذرية العائلة في غزة ويافا.', 'جدّ فرع يافا.', 'جدّ فرع غزة.', '', 'أنجب محمدًا وغالبًا.', ''],
                $n);
            $mm['note'] = trim($n);
        }
        unset($mm);
    }
    if ($v < 23) {
        // 2026-11-23: هاني بن سعيد after سعدو, with his sons
        $norm = fn($x) => str_replace(['أ', 'إ', 'آ', 'ة', 'ى'], ['ا', 'ا', 'ا', 'ه', 'ي'], trim((string)$x));
        $cid = function (string $parent, string $name) use (&$M, $norm) {
            foreach ($M as $x) if (($x['parent'] ?? '') === $parent && $norm($x['name']) === $norm($name)) return $x['id'];
            return null;
        };
        if (find_index($M, 'm15') >= 0) {
            if (!$cid('m15', 'هاني')) $add(['id' => 's15h', 'parent' => 'm15', 'name' => 'هاني'], $cid('m15', 'سعدو'));
            if ($hani = $cid('m15', 'هاني'))
                foreach (['سعيد', 'محمد', 'كريم'] as $k => $n) if (!$cid($hani, $n)) $add(['id' => 's15h' . ($k + 1), 'parent' => $hani, 'name' => $n]);
        }
    }
    if ($v < 24) {
        // 2026-11-23: Hasan bin Ghattas' grandsons; مصطفى بن مصطفى محمود's sons
        $norm = fn($x) => str_replace(['أ', 'إ', 'آ', 'ة', 'ى'], ['ا', 'ا', 'ا', 'ه', 'ي'], trim((string)$x));
        $cid = function (string $parent, string $name) use (&$M, $norm) {
            foreach ($M as $x) if (($x['parent'] ?? '') === $parent && $norm($x['name']) === $norm($name)) return $x['id'];
            return null;
        };
        $kids = function (?string $parent, array $names, string $prefix) use (&$M, $add, $cid) {
            if (!$parent) return;
            foreach ($names as $k => $n) if (!$cid($parent, $n)) $add(['id' => $prefix . ($k + 1), 'parent' => $parent, 'name' => $n]);
        };
        if ($has = $cid('m14', 'حسن')) {
            $kids($cid($has, 'شادي'), ['حسن'], 'g4sh');
            $kids($cid($has, 'فادي'), ['حسن'], 'g4fa');
            $kids($cid($has, 'محمد'), ['كريم', 'أحمد'], 'g4mo');
            $kids($cid($has, 'محمود'), ['أمير'], 'g4md');
        }
        if (find_index($M, 'mm2') >= 0) $kids($cid('mm2', 'مصطفى'), ['محمود', 'أحمد'], 'mm23x');
    }
    if ($v < 25) {
        // 2026-11-23: the fez photo is محمود أحمد علي قدادة himself (not his son مصطفى); his sons are أحمد، محمد، مصطفى، فوزي، فؤاد
        $i1 = find_index($M, 'mm1'); $i2 = find_index($M, 'mm2');
        if ($i1 >= 0 && $i2 >= 0 && ($M[$i2]['parent'] ?? '') === 'mm1') {
            $M[$i1]['photo'] = $M[$i2]['photo'] ?? 'assets/img/mustafa-mahmoud.webp';
            $M[$i1]['deceased'] = true;
            $M[$i1]['title'] = 'الحاج';
            $M[$i1]['note'] = 'الحاج محمود أحمد علي قدادة، رحمه الله. أبناؤه: أحمد ومحمد ومصطفى وفوزي وفؤاد.';
            foreach ($M as &$mm) if (($mm['parent'] ?? '') === 'mm2') $mm['parent'] = 'mm1';
            unset($mm);
            array_splice($M, find_index($M, 'mm2'), 1);
        }
    }
    if ($v < 26) {
        // 2026-11-27: sons and grandsons of الحاج عبد (أبو عدنان) from the family's list; his son is جهاد (not عماد)
        $norm = fn($x) => str_replace(['أ', 'إ', 'آ', 'ة', 'ى'], ['ا', 'ا', 'ا', 'ه', 'ي'], trim((string)$x));
        $cid = function (string $parent, string $name) use (&$M, $norm) {
            foreach ($M as $x) if (($x['parent'] ?? '') === $parent && $norm($x['name']) === $norm($name)) return $x['id'];
            return null;
        };
        $order = function (?string $parent, array $names) use (&$M, $norm) {
            if (!$parent) return;
            $slots = []; $byName = [];
            foreach ($M as $i => $x) if (($x['parent'] ?? '') === $parent) { $slots[] = $i; $byName[$norm($x['name'])] = $x; }
            $seq = [];
            foreach ($names as $n) if (isset($byName[$norm($n)])) { $seq[] = $byName[$norm($n)]; unset($byName[$norm($n)]); }
            foreach ($byName as $x) $seq[] = $x;
            foreach ($slots as $k => $i) $M[$i] = $seq[$k];
        };
        $kids = function (?string $parent, array $names, string $prefix) use (&$M, $add, $cid, $order) {
            if (!$parent) return;
            foreach ($names as $k => $n) if (!$cid($parent, $n)) $add(['id' => $prefix . ($k + 1), 'parent' => $parent, 'name' => $n]);
            $order($parent, $names);
        };
        if (find_index($M, 'm13') >= 0) {
            if (!$cid('m13', 'جهاد') && ($e = $cid('m13', 'عماد'))) { $i = find_index($M, $e); $M[$i]['name'] = 'جهاد'; }
            $kids('m13', ['عدنان', 'عادل', 'زياد', 'جهاد', 'أسامة'], 'a26s');
            $adn = $cid('m13', 'عدنان');
            $kids($adn, ['عبد'], 'a26a');
            if ($adn) $kids($cid($adn, 'عبد'), ['عدنان', 'محمود'], 'a26aa');
            $adl = $cid('m13', 'عادل');
            $kids($adl, ['رائد', 'رأفت', 'محمد'], 'a26b');
            if ($adl) {
                $kids($cid($adl, 'رائد'), ['عادل', 'عبدالله'], 'a26br');
                $kids($cid($adl, 'رأفت'), ['محمد'], 'a26bf');
                $mo = $cid($adl, 'محمد');
                $kids($mo, ['كرم', 'عادل'], 'a26bm');
                if ($mo && ($k = $cid($mo, 'كرم'))) { $i = find_index($M, $k); $M[$i]['title'] = 'الشهيد'; $M[$i]['deceased'] = true; }
            }
            $kids($cid('m13', 'زياد'), ['إيهاب', 'محمد'], 'a26c');
            $jh = $cid('m13', 'جهاد');
            $kids($jh, ['محمود', 'أحمد', 'محمد'], 'a26d');
            if ($jh) {
                $kids($cid($jh, 'محمود'), ['جهاد'], 'a26dm');
                $kids($cid($jh, 'محمد'), ['عماد'], 'a26dd');
            }
            $os = $cid('m13', 'أسامة');
            $kids($os, ['رامي', 'محمد'], 'a26e');
            if ($os) $kids($cid($os, 'رامي'), ['أسامة'], 'a26er');
        }
    }
    if ($v < 27) {
        // 2026-11-27: إبراهيم بن خليل بن غطاس's son is أمير, not عمر
        $norm = fn($x) => str_replace(['أ', 'إ', 'آ', 'ة', 'ى'], ['ا', 'ا', 'ا', 'ه', 'ي'], trim((string)$x));
        $cid = function (string $parent, string $name) use (&$M, $norm) {
            foreach ($M as $x) if (($x['parent'] ?? '') === $parent && $norm($x['name']) === $norm($name)) return $x['id'];
            return null;
        };
        if (($kh = $cid('m14', 'خليل')) && ($ib = $cid($kh, 'إبراهيم')) && !$cid($ib, 'أمير') && ($o = $cid($ib, 'عمر'))) {
            $i = find_index($M, $o); $M[$i]['name'] = 'أمير';
        }
    }
    if ($v < 28) {
        // 2026-11-27: Jaffa branch expansion (أحمد بن علي → حسن و علي) from the family chart and Walid Sobhi's messages
        $norm = fn($x) => str_replace(['أ', 'إ', 'آ', 'ة', 'ى'], ['ا', 'ا', 'ا', 'ه', 'ي'], trim((string)$x));
        $cid = function (string $parent, string $name) use (&$M, $norm) {
            foreach ($M as $x) if (($x['parent'] ?? '') === $parent && $norm($x['name']) === $norm($name)) return $x['id'];
            return null;
        };
        $seq = 0;
        $order = function (string $parent, array $names) use (&$M, $norm) {
            $slots = []; $byName = [];
            foreach ($M as $i => $x) if (($x['parent'] ?? '') === $parent) { $slots[] = $i; $byName[$norm($x['name'])][] = $x; }
            $out = [];
            foreach ($names as $n) if (!empty($byName[$norm($n)])) $out[] = array_shift($byName[$norm($n)]);
            foreach ($byName as $rows) foreach ($rows as $x) $out[] = $x;
            foreach ($slots as $k => $i) $M[$i] = $out[$k];
        };
        $build = function (string $parent, array $spec) use (&$build, &$M, &$seq, $add, $cid, $order) {
            $names = [];
            foreach ($spec as $k => $v) {
                $name = is_int($k) ? $v : $k;
                $names[] = $name;
                $id = $cid($parent, $name);
                if (!$id) { $id = 'y28_' . (++$seq); $add(['id' => $id, 'parent' => $parent, 'name' => $name, 'branch' => 'يافا']); }
                if (!is_int($k) && is_array($v)) $build($id, $v);
            }
            $order($parent, $names);
        };
        if (find_index($M, 'm3') >= 0) {
            $build('m3', [
                'حسن' => [
                    'صبحي' => [
                        'وليد' => ['صبحي', 'وسيم', 'باسل', 'أمجد', 'أحمد', 'محمد'],
                        'محمد' => ['عبدالله', 'مهند'],
                        'نبيل' => ['محمد'],
                        'سامر' => ['هاني', 'عمر'],
                    ],
                    'أحمد' => [
                        'حسن',
                        'محمد' => ['عبد الكريم', 'محمود', 'مصطفى', 'أحمد'],
                        'خليل' => ['أحمد'],
                        'حمزة', 'أنس', 'عمر',
                    ],
                ],
                'علي' => [
                    'رجب',
                    'موسى' => ['طارق' => ['معاذ'], 'معاذ' => ['موسى', 'عمران']],
                    'حسين',
                    'نايف' => [
                        'رجب' => ['عمرو', 'محمد', 'رضوان', 'نايف', 'آدم', 'رجب'],
                        'رضوان' => ['إبراهيم'],
                        'مجدي' => ['سيف الدين'],
                        'ضياء' => ['أمير', 'فارس'],
                        'محمد' => ['كريم'],
                        'أحمد',
                        'فادي' => ['عبدالله'],
                    ],
                    'جبريل' => [
                        'خالد' => ['جبريل', 'محمود'],
                        'عامر' => ['أحمد', 'محمد', 'زيد'],
                        'محمد',
                        'صلاح' => ['آدم'],
                        'علي', 'بشار',
                    ],
                ],
            ]);
            // حسن first under أحمد بن علي
            $h = $cid('m3', 'حسن');
            if ($h) { $i = find_index($M, $h); $row = $M[$i]; array_splice($M, $i, 1); $j = find_index($M, $cid('m3', 'علي')); if ($j >= 0) array_splice($M, $j, 0, [$row]); else $M[] = $row; }
            // نبيل بن صبحي is deceased
            if (($s = $cid($h ?? '', 'صبحي')) && ($n = $cid($s, 'نبيل'))) { $i = find_index($M, $n); $M[$i]['deceased'] = true; $M[$i]['title'] = 'المرحوم'; }
        }
    }
    if ($v < 29) {
        // 2026-11-27: photo of الحاج علي بن أحمد بن علي (Jaffa)
        $i = find_index($M, 'm4');
        if ($i >= 0) { $M[$i]['photo'] = 'assets/img/ali-ahmad.webp'; $M[$i]['title'] = 'الحاج'; $M[$i]['deceased'] = true; $M[$i]['featured'] = true;
            if (empty($M[$i]['note'])) $M[$i]['note'] = 'الحاج علي أحمد علي قدادة، رحمه الله، من يافا.'; }
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
