<?php
require __DIR__ . '/inc.php';
csrf_check();
if (is_post() && me()) audit('logout', 'users:' . me()['user']);
$_SESSION = [];
session_regenerate_id(true);
go('login.php');
