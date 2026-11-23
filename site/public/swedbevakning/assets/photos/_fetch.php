<?php
// One-time helper: pulls the client's own photos from their current site (swedbevakning.se)
// and stores resized WebP copies next to this file. Key-gated, fixed list, never overwrites unless &force=1.
if (($_GET['k'] ?? '') !== 'sb-2311') { http_response_code(404); exit; }
header('Content-Type: text/plain; charset=utf-8');
@set_time_limit(180);
$base = 'https://swedbevakning.se/';
$list = [
  'night'     => ['assets/stockholm-night-BfqWjcZO.jpg', 2000],
  'street'    => ['__l5e/assets-v1/417ae258-651e-466a-b6ed-dc4f6e51ee31/swedbev-hero.jpg', 2000],
  'building'  => ['__l5e/assets-v1/673a3156-44c2-4063-9ade-d587c8ff0b39/swedbev-building-v2.jpg', 1672],
  'guard-car' => ['__l5e/assets-v1/bb84f6c4-4eb2-4230-9536-ce721f30bc21/swedbev-guard.jpg', 1200],
  'event'     => ['__l5e/assets-v1/ced93fb6-59fe-4e5a-be36-7192b4e31150/swedbev-event.jpg', 2000],
  'pano'      => ['__l5e/assets-v1/59ee2896-81cc-45c8-99dc-4e11083c8464/swedbev-stockholm.jpg', 2400],
  'logo-orig' => ['__l5e/assets-v1/4e093d8d-0b6a-4f94-a735-fe457dea77f0/swedbevakning-logo-v2.png', 800],
];
function get($u) {
  $c = curl_init($u);
  curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => 1, CURLOPT_FOLLOWLOCATION => 1, CURLOPT_TIMEOUT => 60, CURLOPT_USERAGENT => 'Mozilla/5.0 PlanetDeploy']);
  $d = curl_exec($c); $code = curl_getinfo($c, CURLINFO_HTTP_CODE); curl_close($c);
  return $code === 200 ? $d : false;
}
foreach ($list as $name => [$path, $max]) {
  $out = __DIR__ . "/$name.webp";
  if (file_exists($out) && empty($_GET['force'])) { echo "skip $name\n"; continue; }
  $data = get($base . $path);
  if (!$data) { echo "FAIL $name\n"; continue; }
  $im = @imagecreatefromstring($data);
  if (!$im) { echo "BADIMG $name\n"; continue; }
  $w = imagesx($im); $h = imagesy($im);
  $s = min(1, $max / max($w, $h));
  $nw = (int)round($w * $s); $nh = (int)round($h * $s);
  $dst = imagecreatetruecolor($nw, $nh);
  imagealphablending($dst, false); imagesavealpha($dst, true);
  imagecopyresampled($dst, $im, 0, 0, 0, 0, $nw, $nh, $w, $h);
  imagewebp($dst, $out, $name === 'logo-orig' ? 90 : 78);
  echo "ok $name {$nw}x{$nh} " . filesize($out) . "\n";
}
