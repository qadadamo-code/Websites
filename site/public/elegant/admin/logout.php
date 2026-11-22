<?php
require __DIR__ . '/inc.php';
unset($_SESSION['eb_admin'], $_SESSION['eb_admin_ip']);
session_regenerate_id(true);
back('login.php');
