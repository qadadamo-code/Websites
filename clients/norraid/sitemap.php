<?php
/** XML sitemap: every page in every language, with hreflang alternates. */
declare(strict_types=1);
require __DIR__ . '/inc/core.php';
require __DIR__ . '/inc/i18n.php';
require __DIR__ . '/inc/data.php';
header('Content-Type: application/xml; charset=utf-8');
$paths = ['', 'mission', 'countries', 'sudan', 'drc', 'south-sudan', 'stories', 'impact', 'donate', 'transparency', 'about', 'contact', 'faq', 'sources',
    'privacy', 'cookies', 'terms', 'donation-policy', 'accessibility'];
foreach (stories() as $s) $paths[] = 'stories/' . $s['slug'];
$o = nr_origin();
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n" . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' . "\n";
foreach ($paths as $p) {
    foreach (array_keys(LOCALES) as $l) {
        echo '<url><loc>' . e($o . u($p, $l)) . '</loc>';
        foreach (array_keys(LOCALES) as $alt) echo '<xhtml:link rel="alternate" hreflang="' . $alt . '" href="' . e($o . u($p, $alt)) . '"/>';
        echo '<xhtml:link rel="alternate" hreflang="x-default" href="' . e($o . u($p, 'en')) . '"/></url>' . "\n";
    }
}
echo '</urlset>';
