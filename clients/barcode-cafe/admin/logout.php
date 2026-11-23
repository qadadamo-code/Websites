<?php
require __DIR__ . '/inc.php';
$_SESSION = [];
session_destroy();
go('login.php');
