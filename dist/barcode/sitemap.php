<?php
/** XML sitemap: the home page plus every visible upcoming event invitation. */
require __DIR__ . '/inc/core.php';
$https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
$base = ($https ? 'https' : 'http') . '://' . preg_replace('/[^A-Za-z0-9.:-]/', '', $_SERVER['HTTP_HOST'] ?? 'localhost') . rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/')), '/') . '/';
header('Content-Type: application/xml; charset=utf-8');
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n" . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
echo '<url><loc>' . e($base) . '</loc><changefreq>daily</changefreq><priority>1.0</priority></url>' . "\n";
foreach (bc_load('events') as $ev) if (!empty($ev['visible']) && ($ev['date'] ?? '') >= today()) echo '<url><loc>' . e($base . 'event.php?e=' . rawurlencode($ev['slug'])) . '</loc><changefreq>weekly</changefreq></url>' . "\n";
echo '</urlset>';
