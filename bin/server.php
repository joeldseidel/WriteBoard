<?php
require dirname(__DIR__) . '/vendor/autoload.php';
use TeamFour\Chat;

$app = new Ratchet\App("localhost", 8080, '0.0.0.0');
$app->route('/chat', new Chat, array('*'));
//$app->route('/draw', new Draw, array('*'));

$app->run();