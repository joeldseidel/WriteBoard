<?php
require dirname(__DIR__) . '/vendor/autoload.php';
use TeamFour\Chat;
use TeamFour\Draw;

$app = new Ratchet\App("18.191.68.244", 8282, "172.31.32.183");
$app->route('/chat', new Chat, array('*'));
$app->route('/draw', new Draw, array('*'));

$app->run();