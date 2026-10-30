<?php
require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function fail(int $code, string $msg) {
  http_response_code($code);
  echo json_encode(['ok' => false, 'error' => $msg]);
  exit;
}

function clean(string $key, int $max = 2000): string {
  $v = isset($_POST[$key]) ? (string)$_POST[$key] : '';
  $v = trim(str_replace(["\r", "\0"], '', $v));
  return mb_substr($v, 0, $max);
}

function guard(): void {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail(405, 'method');
  if (!empty($_POST['website'])) { echo json_encode(['ok' => true]); exit; } // honeypot: pretend success
  // Simple rate limit: 5 submissions per IP per 10 minutes
  $dir = __DIR__ . '/uploads';
  if (!is_dir($dir)) mkdir($dir, 0750, true);
  $ip = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'x');
  $f = "$dir/.rate-$ip";
  $hits = is_file($f) ? array_filter(explode(',', file_get_contents($f)), fn($t) => $t > time() - 600) : [];
  if (count($hits) >= 5) fail(429, 'rate');
  $hits[] = time();
  file_put_contents($f, implode(',', $hits));
}

/** Collect uploaded files from a field (single or multiple). Returns [[name, path, mime], ...]. */
function collect_files(string $field): array {
  if (empty($_FILES[$field])) return [];
  $f = $_FILES[$field];
  $names = (array)$f['name']; $tmps = (array)$f['tmp_name']; $errs = (array)$f['error']; $sizes = (array)$f['size'];
  $out = [];
  $dir = __DIR__ . '/uploads';
  foreach ($names as $i => $name) {
    if ($errs[$i] !== UPLOAD_ERR_OK || $sizes[$i] > PLANET_MAX_FILE) continue;
    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    if (!in_array($ext, PLANET_ALLOWED, true)) continue;
    $safe = date('Ymd-His') . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
    if (move_uploaded_file($tmps[$i], "$dir/$safe")) {
      $mime = function_exists('mime_content_type') ? (mime_content_type("$dir/$safe") ?: 'application/octet-stream') : 'application/octet-stream';
      $out[] = [basename($name), "$dir/$safe", $mime];
    }
    if (count($out) >= 5) break;
  }
  return $out;
}

function send_mail(string $subject, array $rows, array $files, string $replyTo = ''): bool {
  $boundary = 'b' . bin2hex(random_bytes(8));
  $html = '<div dir="auto" style="font-family:Arial,sans-serif"><table cellpadding="6" style="border-collapse:collapse">';
  foreach ($rows as $k => $v) {
    if ($v === '') continue;
    $html .= '<tr><td style="color:#666;vertical-align:top"><b>' . htmlspecialchars($k) . '</b></td><td>' . nl2br(htmlspecialchars($v)) . '</td></tr>';
  }
  $html .= '</table></div>';
  $headers = "From: Planet Web <" . PLANET_FROM . ">\r\nMIME-Version: 1.0\r\n";
  if ($replyTo && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) $headers .= "Reply-To: $replyTo\r\n";
  $headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";
  $body = "--$boundary\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($html));
  foreach ($files as [$name, $path, $mime]) {
    $body .= "--$boundary\r\nContent-Type: $mime; name=\"=?UTF-8?B?" . base64_encode($name) . "?=\"\r\nContent-Transfer-Encoding: base64\r\nContent-Disposition: attachment; filename=\"=?UTF-8?B?" . base64_encode($name) . "?=\"\r\n\r\n" . chunk_split(base64_encode(file_get_contents($path)));
  }
  $body .= "--$boundary--";
  return mail(PLANET_TO, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers);
}

function log_row(string $file, array $row): void {
  $f = fopen(__DIR__ . "/uploads/$file", 'a');
  if ($f) { fputcsv($f, array_merge([date('c')], array_values($row))); fclose($f); }
}
