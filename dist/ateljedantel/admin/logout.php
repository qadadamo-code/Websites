<?php
require __DIR__ . '/inc.php';
if (me()) log_act(L('Loggade ut', 'Signed out'));
$_SESSION = []; session_regenerate_id(true); session_destroy();
go('login.php');
