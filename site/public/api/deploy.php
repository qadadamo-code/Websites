<?php
/**
 * Auto-deploy: pulls the latest built site (the dist/ folder) from GitHub and copies it here.
 * Runs only from the command line (cPanel cron), never from the browser:
 *   php /home/vbkug/web.theplanetco.com/api/deploy.php
 * It does nothing unless a new commit exists, so running it every 5 minutes is cheap.
 */
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }

$REPO   = 'qadadamo-code/Websites';
$BRANCH = 'claude/project-thread-plh9mw';
$ROOT   = dirname(__DIR__);
$STATE  = __DIR__ . '/uploads/.deployed_sha';
$LOG    = __DIR__ . '/uploads/deploy.log';

function logline($msg) { global $LOG; @file_put_contents($LOG, date('c') . "  $msg\n", FILE_APPEND); }

function fetch($url) {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true, CURLOPT_TIMEOUT => 120,
            CURLOPT_HTTPHEADER => ['User-Agent: planet-deploy', 'Accept: application/vnd.github+json'],
        ]);
        $body = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return $code === 200 ? $body : false;
    }
    $ctx = stream_context_create(['http' => ['header' => "User-Agent: planet-deploy\r\n", 'timeout' => 120]]);
    return @file_get_contents($url, false, $ctx);
}

$lock = fopen(__DIR__ . '/uploads/.deploy.lock', 'c');
if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) exit;

$meta = fetch("https://api.github.com/repos/$REPO/commits/" . rawurlencode($BRANCH));
$sha = $meta ? (json_decode($meta, true)['sha'] ?? '') : '';
if (!preg_match('/^[0-9a-f]{40}$/', $sha)) { logline('could not read latest commit'); exit(1); }

$current = @trim(@file_get_contents($STATE));
if ($current === $sha) exit;

$zipData = fetch("https://codeload.github.com/$REPO/zip/$sha");
if (!$zipData) { logline("download failed for $sha"); exit(1); }
$tmp = tempnam(sys_get_temp_dir(), 'pd');
file_put_contents($tmp, $zipData);

$zip = new ZipArchive();
if ($zip->open($tmp) !== true) { logline('bad zip'); @unlink($tmp); exit(1); }

$prefix = null;
$written = 0;
for ($i = 0; $i < $zip->numFiles; $i++) {
    $name = $zip->getNameIndex($i);
    if ($prefix === null) { $prefix = substr($name, 0, strpos($name, '/') + 1) . 'dist/'; }
    if (strpos($name, $prefix) !== 0) continue;
    $rel = substr($name, strlen($prefix));
    if ($rel === '' || strpos($rel, '..') !== false) continue;
    if (strpos($rel, 'api/uploads/') === 0) continue; // never touch saved receipts and logs
    $dest = $ROOT . '/' . $rel;
    if (substr($name, -1) === '/') { if (!is_dir($dest)) @mkdir($dest, 0755, true); continue; }
    if (!is_dir(dirname($dest))) @mkdir(dirname($dest), 0755, true);
    file_put_contents($dest . '.tmp', $zip->getFromIndex($i));
    rename($dest . '.tmp', $dest);
    $written++;
}
$zip->close();
@unlink($tmp);

if ($written < 10) { logline("only $written files found, skipped marking $sha"); exit(1); }
file_put_contents($STATE, $sha);
logline("deployed $sha ($written files)");
