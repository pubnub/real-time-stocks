<?php
require_once('../vendor/autoload.php');

## ---------------------------------------------------------------------------
## USAGE:
## ---------------------------------------------------------------------------
## php ./bootstrap.php

## Capture Publish and Subscribe Keys from Command Line
$publish_key   = isset($argv[1])  ? $argv[1]  : 'demo';
$subscribe_key = isset($argv[2])  ? $argv[2]  : 'demo';
$secret_key    = isset($argv[3])  ? $argv[3]  : false;
$auth_key      = isset($argv[4])  ? $argv[4] :  false;

$group = "stockblast";
$chat  = "stock-chat";
$history = "MSFT";
$bootstrap_auth = $auth_key . "-bootstrap";

## ---------------------------------------------------------------------------
## Create Pubnub Object
## ---------------------------------------------------------------------------
$pubnub = new Pubnub\Pubnub(
    $publish_key,
    $subscribe_key,
    $secret_key
);

$pubnub->setAuthKey($bootstrap_auth);
## ---------------------------------------------------------------------------
## Find all Streams running on this system
## ---------------------------------------------------------------------------
echo "Active stocks: ";

$streams = system(implode( ' | ', array(
    'ps a',
    'grep stock.php',
    'grep -v grep',
    'awk "{print \$7}"',
    'tr "\n+" ","'
) ));

echo "\n";

$channels = explode(",", trim($streams, ","));

## ---------------------------------------------------------------------------
## Grant permissions (will not work for a "demo/demo" credentials)
## ---------------------------------------------------------------------------
## To stocks channel group
$response = $pubnub->pamGrantChannelGroup(1, 0, $group);
validateResponse($response);

## To current instance
$response = $pubnub->pamGrantChannelGroup(0, 1, $group, $bootstrap_auth);
validateResponse($response);

## To chat
$response = $pubnub->grant(1, 1, $chat);
validateResponse($response);

## To history
$response = $pubnub->grant(1, 0, $history);
validateResponse($response);

## To stock tickers
$response = $pubnub->grant(0, 1, join(",", $channels), $auth_key);
validateResponse($response);

## ---------------------------------------------------------------------------
## Cleanup channel group and add current channels to it
## ---------------------------------------------------------------------------
$response = $pubnub->channelGroupRemoveGroup($group);
validateResponse($response);

$response = $pubnub->channelGroupAddChannel($group, $channels);
validateResponse($response);

echo "\n";

## ---------------------------------------------------------------------------
## Helpers
## ---------------------------------------------------------------------------
function validateResponse($res) {
    if (is_array($res) && in_array("error", $res) && $res["error"] == 1) {
        echo $res["service"] . " response code " . $res["status"] . ": " . $res["message"] . "\n";
    }
}
