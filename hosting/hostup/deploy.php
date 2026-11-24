<?php
/**
 * HostUp auto-deploy (one script, many sites).
 * Pulls the deploy branch from GitHub and copies each site's dist/<folder>/ into that site's web root.
 * Run ONLY from cron, e.g. every 5 minutes:
 *   cron downloads this file from GitHub to ~/planet-deploy/ and runs it with php (self-updating)
 * It does nothing unless a new commit exists.
 *
 * To add a site: add one line to $SITES ('dist folder' => 'absolute web root on the server').
 */
if (PHP_SAPI !== 'cli' && isset($_SERVER['REQUEST_METHOD'])) { http_response_code(404); exit; }

$REPO   = 'qadadamo-code/Websites';
$BRANCH = 'claude/project-thread-plh9mw';
$HOME   = getenv('HOME') ?: dirname(__DIR__);
$SITES  = [
    // dist folder => web root
    'tablia' => $HOME . '/tabliacatering.rest',
    'alashi-se' => $HOME . '/alashi.se',
    'barcode' => $HOME . '/barcodecafe.rest',
    'gmsakerhet-com' => $HOME . '/gmsakerhet.com',
    'norraid' => $HOME . '/norraid.com',
];
// Overrides from sites.php next to this file (so the server list can be changed without a code change).
if (is_file(__DIR__ . '/sites.php')) { $SITES = require __DIR__ . '/sites.php'; }

$STATE_DIR = __DIR__ . '/state';
@mkdir($STATE_DIR, 0700, true);
$LOG = $STATE_DIR . '/deploy.log';
function logline($msg) { global $LOG; @file_put_contents($LOG, date('c') . "  $msg\n", FILE_APPEND); }

function fetch($url) {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true, CURLOPT_TIMEOUT => 180,
            CURLOPT_HTTPHEADER => ['User-Agent: planet-deploy', 'Accept: application/vnd.github+json'],
        ]);
        $body = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return $code === 200 ? $body : false;
    }
    $ctx = stream_context_create(['http' => ['header' => "User-Agent: planet-deploy\r\n", 'timeout' => 180]]);
    return @file_get_contents($url, false, $ctx);
}

// Live data the sites write themselves: create it on first deploy, never overwrite it afterwards.
function is_live_data($rel) {
    return (bool) preg_match('#(^|/)(storage|uploads)/#', $rel);
}

$lock = fopen($STATE_DIR . '/.lock', 'c');
if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) exit;

$meta = fetch("https://api.github.com/repos/$REPO/commits/" . rawurlencode($BRANCH));
$sha = $meta ? (json_decode($meta, true)['sha'] ?? '') : '';
if (!preg_match('/^[0-9a-f]{40}$/', $sha)) { logline('could not read latest commit'); exit(1); }

$stateFile = $STATE_DIR . '/deployed_sha';
$sitesKey  = md5(json_encode($SITES));
$current   = @trim(@file_get_contents($stateFile));
if ($current === "$sha $sitesKey" && !in_array('--force', $argv ?? [], true)) exit;

$zipData = fetch("https://codeload.github.com/$REPO/zip/$sha");
if (!$zipData) { logline("download failed for $sha"); exit(1); }
$tmp = tempnam(sys_get_temp_dir(), 'pd');
file_put_contents($tmp, $zipData);
$zip = new ZipArchive();
if ($zip->open($tmp) !== true) { logline('bad zip'); @unlink($tmp); exit(1); }

$root = $zip->getNameIndex(0);
$root = substr($root, 0, strpos($root, '/') + 1);
$ok = true;
foreach ($SITES as $folder => $webroot) {
    $prefix = $root . 'dist/' . trim($folder, '/') . '/';
    if (!is_dir($webroot)) @mkdir($webroot, 0755, true);
    $written = 0;
    for ($i = 0; $i < $zip->numFiles; $i++) {
        $name = $zip->getNameIndex($i);
        if (strpos($name, $prefix) !== 0) continue;
        $rel = substr($name, strlen($prefix));
        if ($rel === '' || strpos($rel, '..') !== false) continue;
        $dest = rtrim($webroot, '/') . '/' . $rel;
        if (substr($name, -1) === '/') { if (!is_dir($dest)) @mkdir($dest, 0755, true); continue; }
        if (is_live_data($rel) && file_exists($dest)) continue;
        if (!is_dir(dirname($dest))) @mkdir(dirname($dest), 0755, true);
        file_put_contents($dest . '.tmp', $zip->getFromIndex($i));
        rename($dest . '.tmp', $dest);
        $written++;
    }
    if ($written < 3) { logline("$folder: only $written files, check dist/$folder"); $ok = false; }
    else logline("$folder: deployed $sha ($written files) -> $webroot");
}
$zip->close();
@unlink($tmp);
if ($ok) file_put_contents($stateFile, "$sha $sitesKey");
