<?php
require_once('../vendor/autoload.php');

## ---------------------------------------------------------------------------
## STANDARD USAGE
## ---------------------------------------------------------------------------
## php stock.php <TICKER_ID> <PRICE> <MIN_TRADE> <MAX_TRADE> <VOLATILITY> <D>

## ---------------------------------------------------------------------------
## EXAMPLE
## ---------------------------------------------------------------------------
## screen -d -m -S MSFT php stock.php MSFT 102.67 250000 2500000 100 25

## ---------------------------------------------------------------------------
## PARAMATERS AND SETTINGS
## ---------------------------------------------------------------------------
## screen -d -m -S <TICK> php stock.php <TICK> <PRICE> <MIN> <MAX> <VOL> <D>

## ---------------------------------------------------------------------------
## Timezone
## ---------------------------------------------------------------------------
date_default_timezone_set('America/New_York');
setlocale(LC_MONETARY, "en_US");

## Capture Publish and Subscribe Keys from Command Line
$publish_key   = isset($argv[7]) ? $argv[7]   : 'demo';
$subscribe_key = isset($argv[8]) ? $argv[8]   : 'demo';
$auth_key      = isset($argv[9]) ? $argv[9]   : '';

## ---------------------------------------------------------------------------
## Create Pubnub Object
## ---------------------------------------------------------------------------
$pubnub = new Pubnub\Pubnub([
    'publish_key' => $publish_key,
    'subscribe_key' => $subscribe_key,
    'auth_key' => $auth_key
]);

## ---------------------------------------------------------------------------
## Define Stock Ticker Setup
## ---------------------------------------------------------------------------
$channel    = $argv[1];
$sPrice     = $argv[2];
$minTrade   = $argv[3];
$maxTrade   = $argv[4];
$volatility = $argv[5];
$maxDelta   = $argv[6];

echo($channel."\n");
echo($sPrice."\n");

## ---------------------------------------------------------------------------
## Publish Example
## ---------------------------------------------------------------------------
echo("Running publish\r\n");

$currPrice = $sPrice;

while (1) {
    $t         = time() . "";
    $now       = new DateTime();
    $change    = (rand(0,$volatility)-($volatility/2))/100;
    $vol       = (rand(100,1000))*10;
    $currPrice = $currPrice + $change;
    $delta     = $currPrice - $sPrice;
    $perc      = round( (1 - ($sPrice / $currPrice ) ) * 100, 2 );
    $stream    = array(
        "time"  => $now->format("g:i:sa"),
        "price" => number_format( $currPrice, 2, '.', '' ),
        "delta" => number_format( $delta,     2, '.', '' ),
        "perc"  => number_format( $perc,      2, '.', '' ),
        "vol"   => $vol
    );

    $publish_success = $pubnub->publish($channel, $stream);

    echo($t . " " . $publish_success[0] . " " . $publish_success[1]);
    echo("\r\n");

    $slptime = rand( $minTrade, $maxTrade );

    // Rest Price if Detla is greater than 25%.
    // This is because it is fake data anyway and
    // we want the stock price to run forever
    // randomly in a working demo state.
    if (abs($perc) > ($maxDelta / 100)) $currPrice = $sPrice;
    usleep($slptime);
}
