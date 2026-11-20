<?php
require dirname(__DIR__) . '/inc/core.php';
$m = lm_load('menu');
unset($m['admin']);
json_out($m);
