<?php
require_once('Pubnub.php');

## ---------------------------------------------------------------------------
## USAGE:
## ---------------------------------------------------------------------------
## php ./bootstrap.php

## Capture Publish and Subscribe Keys from Command Line
$publish_key   = isset($argv[7])  ? $argv[7]  : 'demo';
$subscribe_key = isset($argv[8])  ? $argv[8]  : 'demo';
$secret_key    = isset($argv[9])  ? $argv[9]  : false;
$cipher_key    = isset($argv[10]) ? $argv[10] : false;
$ssl_on        = false;

## ---------------------------------------------------------------------------
## Create Pubnub Object
## ---------------------------------------------------------------------------
$pubnub = new Pubnub(
    $publish_key,
    $subscribe_key,
    $secret_key,
    $cipher_key,
    $ssl_on
);

## ---------------------------------------------------------------------------
## Find all Streams running on this system
## ---------------------------------------------------------------------------
$channel = "stockblast";
$streams = system(implode( ' | ', array(
    'ps a',
    'grep stock.php',
    'grep -v grep',
    'awk "{print \$7}"',
    'tr "\n+" ","'
) ));

$publish_success = $pubnub->publish(array(
    'channel' => $channel,
    'message' => trim( $streams, ',' )
));

?>
