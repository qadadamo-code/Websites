<?php
/**
 * Planet one-file installer/updater for sites on hosts without cron or git (e.g. One.com).
 * Upload this file to the web root and open it in a browser: it pulls dist/<SITE> from GitHub,
 * file by file, only what changed since the last run. Live data (storage/, uploads/) is created
 * once and never overwritten. On the very first run, whatever was in the web root before is moved
 * into _old_site_<date>/ (closed to visitors), nothing is deleted.
 * Re-open it (or ?json=1) after each change to publish the newest version.
 */
const REPO   = 'qadadamo-code/Websites';
const BRANCH = 'claude/project-thread-plh9mw';
const SITE   = 'ateljedantel';
const BUDGET = 20; // seconds of work per request; the page continues by itself

@set_time_limit(60);
$root  = __DIR__;
$self  = basename(__FILE__);
$json  = isset($_GET['json']);
$t0    = microtime(true);
$stDir = $root . '/storage';
if (!is_dir($stDir)) @mkdir($stDir, 0750, true);
if (!is_file($stDir . '/.htaccess')) @file_put_contents($stDir . '/.htaccess', "Require all denied\nDeny from all\n");
$dpDir = $stDir . '/deploy'; if (!is_dir($dpDir)) @mkdir($dpDir, 0750, true);
$manF  = $dpDir . '/state.json';
$logF  = $dpDir . '/deploy.log';

function out($ok, $msg, $more = false) {
    global $json;
    if ($json) { header('Content-Type: application/json'); echo json_encode(['ok' => $ok, 'msg' => $msg, 'more' => $more]); exit; }
    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><meta name="viewport" content="width=device-width"><title>Update</title>'
        . ($more ? '<meta http-equiv="refresh" content="1">' : '')
        . '<body style="font:16px system-ui;padding:40px;max-width:640px;margin:auto"><h2>' . ($ok ? ($more ? '⏳' : '✅') : '⚠️') . ' ' . htmlspecialchars($msg) . '</h2>'
        . ($more ? '<p>Continuing…</p>' : ($ok ? '<p><a href="./">Open the site →</a></p>' : '')) . '</body>';
    exit;
}
function logl($m) { global $logF; @file_put_contents($logF, date('c') . "  $m\n", FILE_APPEND); }
function get($url, $api = false) {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true, CURLOPT_TIMEOUT => 60, CURLOPT_CONNECTTIMEOUT => 15,
            CURLOPT_HTTPHEADER => array_merge(['User-Agent: planet-update'], $api ? ['Accept: application/vnd.github+json'] : [])]);
        $b = curl_exec($ch); $c = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
        return $c === 200 ? $b : false;
    }
    $ctx = stream_context_create(['http' => ['header' => "User-Agent: planet-update\r\n" . ($api ? "Accept: application/vnd.github+json\r\n" : ''), 'timeout' => 60]]);
    return @file_get_contents($url, false, $ctx);
}

$lock = fopen($dpDir . '/run.lock', 'c');
if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) out(true, 'An update is already running', true);

$man = is_file($manF) ? (json_decode((string)file_get_contents($manF), true) ?: []) : [];
$man += ['sha' => '', 'target' => '', 'files' => [], 'todo' => null];

/* first run: park the old site */
if (empty($man['files']) && empty($man['todo']) && empty($man['parked'])) {
    $old = '_old_site_' . date('Ymd-His');
    $moved = 0;
    foreach (scandir($root) as $f) {
        if ($f === '.' || $f === '..' || $f === $self || $f === 'storage' || $f === 'uploads' || strpos($f, '_old_site_') === 0) continue;
        if (!is_dir("$root/$old")) { @mkdir("$root/$old", 0755); @file_put_contents("$root/$old/.htaccess", "Require all denied\nDeny from all\n"); }
        if (@rename("$root/$f", "$root/$old/$f")) $moved++;
    }
    $man['parked'] = $moved ? $old : '-';
    logl("first run: moved $moved old entries to $old");
    file_put_contents($manF, json_encode($man));
}

/* new commit? build the to-do list */
if ($man['todo'] === null || $man['todo'] === []) {
    $c = get('https://api.github.com/repos/' . REPO . '/commits/' . rawurlencode(BRANCH), true);
    $sha = $c ? (json_decode($c, true)['sha'] ?? '') : '';
    if (!preg_match('/^[0-9a-f]{40}$/', $sha)) out(false, 'Could not reach GitHub, try again in a minute');
    if ($sha === $man['sha'] && !isset($_GET['force'])) out(true, 'Already up to date (' . substr($sha, 0, 7) . ')');
    $d = get('https://api.github.com/repos/' . REPO . '/contents/dist?ref=' . $sha, true);
    $dirSha = '';
    foreach ((array)json_decode((string)$d, true) as $e) if (($e['name'] ?? '') === SITE && ($e['type'] ?? '') === 'dir') $dirSha = $e['sha'];
    if (!$dirSha) out(false, 'Site folder not found on GitHub');
    $t = json_decode((string)get('https://api.github.com/repos/' . REPO . '/git/trees/' . $dirSha . '?recursive=1', true), true);
    if (empty($t['tree'])) out(false, 'Could not read the file list');
    $todo = [];
    foreach ($t['tree'] as $e) {
        if (($e['type'] ?? '') !== 'blob') continue;
        $p = $e['path'];
        if (strpos($p, '..') !== false) continue;
        if (($man['files'][$p] ?? '') === $e['sha'] && is_file("$root/$p")) continue;
        $todo[$p] = $e['sha'];
    }
    $man['target'] = $sha; $man['todo'] = $todo;
    file_put_contents($manF, json_encode($man));
    logl('commit ' . substr($sha, 0, 7) . ': ' . count($todo) . ' files to update');
}

/* download in slices */
$done = 0; $fail = 0;
foreach ($man['todo'] as $p => $blob) {
    if (microtime(true) - $t0 > BUDGET) break;
    $dest = "$root/$p";
    $live = (bool)preg_match('#^(storage|uploads)/#', $p);
    if (!($live && file_exists($dest))) {
        $url = 'https://raw.githubusercontent.com/' . REPO . '/' . $man['target'] . '/dist/' . SITE . '/' . implode('/', array_map('rawurlencode', explode('/', $p)));
        $body = get($url);
        if ($body === false) { $fail++; if ($fail > 5) break; continue; }
        if (!is_dir(dirname($dest))) @mkdir(dirname($dest), 0755, true);
        file_put_contents("$dest.tmp", $body);
        rename("$dest.tmp", $dest);
    }
    $man['files'][$p] = $blob;
    unset($man['todo'][$p]);
    $done++;
}
$left = count($man['todo']);
if (!$left) { $man['sha'] = $man['target']; logl('done ' . substr($man['sha'], 0, 7)); }
file_put_contents($manF, json_encode($man));
if ($left) out(true, "Updating… $left files left", true);
out(true, 'Site updated (' . substr($man['sha'], 0, 7) . ')');
