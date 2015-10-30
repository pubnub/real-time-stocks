<?php

header('Content-Type: application/json');

$publishKey = trim(getenv("PUBNUB_PUB_KEY"));
$subscribeKey = trim(getenv("PUBNUB_SUB_KEY"));

if (empty($publishKey)) {
    $publishKey = "demo";
}

if (empty($subscribeKey)) {
    $subscribeKey = "demo";
}
echo '{"publish_key": "' . $publishKey . '", "subscribe_key": "' . $subscribeKey . '"}';