<?php
require dirname(__DIR__) . '/inc/core.php';
const LM_DEFAULT_USER = 'lamma';
const LM_DEFAULT_HASH = '$2y$10$AhsSF66q3/xDAOFkKAyxsOpMLUJUVw.NO0LhU88s2.SUjlvhkulea';
function start_session(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_name('lm_sess');
        session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax', 'secure' => !empty($_SERVER['HTTPS']), 'path' => '/']);
        session_start();
    }
}
function admin_cred(): array {
    $a = lm_load('admin');
    return $a ?: ['user' => LM_DEFAULT_USER, 'hash' => LM_DEFAULT_HASH];
}
function is_admin(): bool { start_session(); return !empty($_SESSION['lm_admin']); }
function require_admin(): void { if (!is_admin()) { header('Location: login.php'); exit; } }
function csrf(): string { start_session(); if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(16)); return $_SESSION['csrf']; }
function csrf_ok(): bool { start_session(); return isset($_POST['csrf'], $_SESSION['csrf']) && hash_equals($_SESSION['csrf'], (string)$_POST['csrf']); }
function flash(string $m): void { start_session(); $_SESSION['flash'] = $m; }
function take_flash(): string { start_session(); $m = $_SESSION['flash'] ?? ''; unset($_SESSION['flash']); return $m; }
function back(string $to): void { header('Location: ' . $to); exit; }
const LM_IMAGES = ['mahshi'=>'محشي','warak'=>'ورق عنب','mombar'=>'ممبار','soup'=>'شوربة','peas'=>'خضار','okra'=>'بامية/طاجن','bechamel'=>'بشاميل','golash'=>'جلاش','grill'=>'مشويات','chicken'=>'فراخ','pigeon'=>'حمام','fatta'=>'فتة','meammar'=>'أرز معمر','rice'=>'أرز','pasta'=>'مكرونة','apps'=>'مقبلات'];
function img_src(string $k): string { return str_starts_with($k, 'uploads/') ? '../' . $k : '../assets/img/' . $k . '-s.webp'; }
/** Save an uploaded photo; returns 'uploads/…' or '' */
function save_upload(string $field): string {
    if (empty($_FILES[$field]['tmp_name']) || ($_FILES[$field]['error'] ?? 1) !== UPLOAD_ERR_OK) return '';
    if ($_FILES[$field]['size'] > 6 * 1024 * 1024) return '';
    $info = @getimagesize($_FILES[$field]['tmp_name']);
    $types = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp'];
    if (!$info || !isset($types[$info[2]])) return '';
    $name = 'item-' . date('ymdHis') . '-' . bin2hex(random_bytes(3));
    if (function_exists('imagecreatefromstring') && function_exists('imagewebp')) {
        $src = @imagecreatefromstring((string)file_get_contents($_FILES[$field]['tmp_name']));
        if ($src) {
            $w = imagesx($src); $h = imagesy($src); $s = min($w, $h); $size = min(900, $s);
            $dst = imagecreatetruecolor($size, $size);
            imagecopyresampled($dst, $src, 0, 0, (int)(($w - $s) / 2), (int)(($h - $s) / 2), $size, $size, $s, $s);
            imagewebp($dst, LM_UPLOADS . "/$name.webp", 82);
            return "uploads/$name.webp";
        }
    }
    $ext = $types[$info[2]];
    return move_uploaded_file($_FILES[$field]['tmp_name'], LM_UPLOADS . "/$name.$ext") ? "uploads/$name.$ext" : '';
}
