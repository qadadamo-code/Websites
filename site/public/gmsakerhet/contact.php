<?php
// GMS Säkerhet contact form -> info@gmsumea.se
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo '{"ok":false}'; exit; }
if (!empty($_POST['website'])) { echo '{"ok":true}'; exit; } // honeypot
function f($k, $max = 200) { $v = trim((string)($_POST[$k] ?? '')); $v = str_replace(["\r", "\0"], '', $v); return mb_substr($v, 0, $max); }
$name = f('name', 120); $email = f('email', 160); $phone = f('phone', 40); $company = f('company', 160);
$service = f('service', 120); $message = f('message', 4000); $lang = f('lang', 2) === 'en' ? 'en' : 'sv';
$callback = !empty($_POST['callback']);
if ($name === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) { http_response_code(422); echo '{"ok":false}'; exit; }
// simple rate limit per IP (1 per 30 s)
$rl = sys_get_temp_dir() . '/gms_' . md5($_SERVER['REMOTE_ADDR'] ?? '');
if (file_exists($rl) && time() - filemtime($rl) < 30) { http_response_code(429); echo '{"ok":false}'; exit; }
@touch($rl);
$to = 'info@gmsumea.se';
$subject = '=?UTF-8?B?' . base64_encode('Ny förfrågan via webbplatsen: ' . ($service ?: 'Allmän')) . '?=';
$body = "Namn: $name\nFöretag: $company\nE-post: $email\nTelefon: $phone\nTjänst: " . ($service ?: '-') .
        "\nRing upp: " . ($callback ? 'Ja' : 'Nej') . "\nSpråk: $lang\n\nMeddelande:\n$message\n";
$host = preg_replace('/[^a-z0-9.\-]/i', '', $_SERVER['HTTP_HOST'] ?? 'web.theplanetco.com');
$headers = "From: GMS Webb <no-reply@$host>\r\nReply-To: " . str_replace(["\n", "\r"], '', $email) .
           "\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit";
$ok = @mail($to, $subject, $body, $headers);
echo json_encode(['ok' => (bool)$ok]);
