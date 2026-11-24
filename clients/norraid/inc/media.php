<?php
/**
 * Local copies of licensed photos. The site first hotlinks the Wikimedia Commons thumbnails (allowed, credited);
 * this stores a local 1600px + 960px copy so the site no longer depends on Commons. Runs from the admin, and
 * automatically in the background after page views (a few images at a time) until every photo is local.
 */
function media_fetch_bytes(string $url): ?string {
    if (!preg_match('~^https://(upload|thumb)\.wikimedia\.org/~', $url) && !preg_match('~^https://~', $url)) return null;
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true, CURLOPT_MAXREDIRS => 3, CURLOPT_TIMEOUT => 25, CURLOPT_CONNECTTIMEOUT => 8,
            CURLOPT_PROTOCOLS => CURLPROTO_HTTPS, CURLOPT_USERAGENT => 'NORRAID-site/1.0 (photo cache; credited CC images)']);
        $b = curl_exec($ch);
        $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return ($b !== false && $code === 200 && strlen((string)$b) < 25 * 1024 * 1024) ? (string)$b : null;
    }
    $ctx = stream_context_create(['http' => ['timeout' => 25, 'header' => "User-Agent: NORRAID-site/1.0 (photo cache)\r\n"]]);
    $b = @file_get_contents($url, false, $ctx);
    return $b === false ? null : $b;
}

/** Resize to max width and save as JPEG. Returns [w, h] or null. */
function media_save_resized($im, string $path, int $maxW): ?array {
    $w = imagesx($im); $h = imagesy($im);
    if ($w > $maxW) { $nh = (int)round($h * $maxW / $w); $dst = imagecreatetruecolor($maxW, $nh); imagecopyresampled($dst, $im, 0, 0, 0, 0, $maxW, $nh, $w, $h); }
    else $dst = $im;
    $ok = imagejpeg($dst, $path, 82);
    $r = $ok ? [imagesx($dst), imagesy($dst)] : null;
    if ($dst !== $im) imagedestroy($dst);
    return $r;
}

/** Store image bytes for a media id. Returns the fields to merge into the media row, or null. */
function media_store_bytes(string $id, string $bytes): ?array {
    if (!function_exists('imagecreatefromstring')) return null;
    $info = @getimagesizefromstring($bytes);
    if (!$info || !in_array($info[2], [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP], true)) return null;
    $im = @imagecreatefromstring($bytes);
    if (!$im) return null;
    $name = preg_replace('/[^a-z0-9_-]/', '', strtolower($id)) . '-' . bin2hex(random_bytes(3)) . '.jpg';
    $dir = NR_UPLOADS . '/media/';
    if (!is_dir($dir)) @mkdir($dir, 0755, true);
    $big = media_save_resized($im, $dir . $name, 1600);
    media_save_resized($im, $dir . 'sm-' . $name, 960);
    imagedestroy($im);
    return $big ? ['file' => $name, 'w' => $big[0], 'h' => $big[1]] : null;
}

function media_import_one(string $id): bool {
    $m = media($id);
    if (!$m || empty($m['src'])) return false;
    $bytes = media_fetch_bytes((string)$m['src']);
    $res = $bytes ? media_store_bytes($id, $bytes) : null;
    nr_tx('media', function (&$l) use ($id, $res) {
        foreach ($l as &$r) if ($r['id'] === $id) {
            if ($res) { $old = $r['file'] ?? ''; $r = array_merge($r, $res); if ($old && $old !== $res['file']) { @unlink(NR_UPLOADS . '/media/' . basename($old)); @unlink(NR_UPLOADS . '/media/sm-' . basename($old)); } }
            else $r['import_failed'] = now_iso();
        }
    });
    return (bool)$res;
}

/** Background: after the response is sent, import up to $n missing photos (at most once every 10 minutes). */
function media_autoimport(int $n = 3): void {
    $pending = array_values(array_filter(media_all(), fn($m) => empty($m['file']) && !empty($m['src']) && (empty($m['import_failed']) || strtotime((string)$m['import_failed']) < time() - 6 * 3600)));
    if (!$pending) return;
    $stamp = NR_STORAGE . '/.media-import';
    if (is_file($stamp) && time() - (int)filemtime($stamp) < 600) return;
    @touch($stamp);
    register_shutdown_function(function () use ($pending, $n) {
        if (function_exists('fastcgi_finish_request')) fastcgi_finish_request();
        elseif (function_exists('litespeed_finish_request')) litespeed_finish_request();
        else $n = 1; // response cannot be detached: keep the delay for this visitor small
        @set_time_limit(120);
        foreach (array_slice($pending, 0, $n) as $m) media_import_one($m['id']);
    });
}
