<?php
// One-time helper: pulls the client's own photos from their current WordPress (same server)
// and stores resized WebP copies next to this file. Key-gated, fixed list, never overwrites.
if (($_GET['k'] ?? '') !== 'gms-2611') { http_response_code(404); exit; }
header('Content-Type: text/plain; charset=utf-8');
$base = 'https://gmsakerhet.com/wp-content/uploads/';
$list = [
  'team-event'   => '2026/07/23012-1542x2048.jpg',
  'car-poster'   => '2026/07/Screenshot_20260422-1805232.jpg',
  'shop-door'    => '2026/07/Screenshot_20260712-0032472.jpg',
  'supermarket'  => '2026/07/PXL_20260508_192826841.MP_-1542x2048.jpg',
  'cctv-poster'  => '2026/07/Screenshot_20260712-0034542.jpg',
  'garage-poster'=> '2026/07/Screenshot_20260712-0032162.jpg',
  'parking-poster'=>'2026/07/Screenshot_20260712-0330472.jpg',
  'lounge'       => '2026/07/PXL_20260404_193611956.jpg',
  'host-poster'  => '2026/07/Screenshot_20260712-0034162.jpg',
  'team-street'  => '2026/07/23015.jpg',
  'patrol'       => '2026/07/23011.jpg',
  'guard-phone'  => '2026/07/21767.jpg',
  'mall-duo'     => '2026/07/16839.jpg',
  'logo-orig'    => '2025/10/secur.bd83bcd23190c445b099.webp',
];
$fallback = ['supermarket' => '2026/07/PXL_20260508_192826841.MP_-771x1024.jpg', 'lounge' => '2026/07/PXL_20260404_193611956-771x1024.jpg',
  'team-street' => '2026/07/23015-771x1024.jpg', 'patrol' => '2026/07/23011-576x1024.jpg', 'mall-duo' => '2026/07/16839-771x1024.jpg',
  'garage-poster' => '2026/07/Screenshot_20260712-0032162-838x1024.jpg', 'parking-poster' => '2026/07/Screenshot_20260712-0330472-790x1024.jpg'];
function get($u) {
  $c = curl_init($u);
  curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => 1, CURLOPT_FOLLOWLOCATION => 1, CURLOPT_TIMEOUT => 40, CURLOPT_USERAGENT => 'Mozilla/5.0 PlanetDeploy']);
  $d = curl_exec($c); $code = curl_getinfo($c, CURLINFO_HTTP_CODE); curl_close($c);
  return $code === 200 ? $d : false;
}
foreach ($list as $name => $path) {
  $out = __DIR__ . "/$name.webp";
  if (file_exists($out) && empty($_GET['force'])) { echo "skip $name\n"; continue; }
  $data = get($base . $path);
  if (!$data && isset($fallback[$name])) $data = get($base . $fallback[$name]);
  if (!$data) { echo "FAIL $name\n"; continue; }
  $im = @imagecreatefromstring($data);
  if (!$im) { echo "BADIMG $name\n"; continue; }
  $w = imagesx($im); $h = imagesy($im); $max = $name === 'logo-orig' ? 1024 : 1500;
  $s = min(1, $max / max($w, $h));
  $nw = (int)round($w * $s); $nh = (int)round($h * $s);
  $dst = imagecreatetruecolor($nw, $nh);
  imagecopyresampled($dst, $im, 0, 0, 0, 0, $nw, $nh, $w, $h);
  imagewebp($dst, $out, 80);
  echo "ok $name {$nw}x{$nh} " . filesize($out) . "\n";
}
