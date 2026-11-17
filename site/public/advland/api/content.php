<?php
/** GET → the live site content (settings, branches, zones, packages, add-ons, rentals, reviews, FAQ). */
require dirname(__DIR__) . '/inc/core.php';
header('Access-Control-Allow-Origin: *');
$c = al_load('content');
json_out(['ok' => true, 'v' => AL_VERSION, 'content' => $c]);
