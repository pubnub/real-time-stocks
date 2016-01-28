#!/bin/bash

# Use ". .env" command to load environment variables from .env file or export them manually

. .env

PUB=$PUBNUB_PUB_KEY
SUB=$PUBNUB_SUB_KEY
AUTH=$PUBNUB_AUTH_KEY

screen -d -m -S bidu php stock.php BIDU 102.67 250000 2500000 100 25 $PUB $SUB $AUTH
screen -d -m -S cbs  php stock.php CBS   48.03 250000 2500000 100 25 $PUB $SUB $AUTH
screen -d -m -S ea   php stock.php EA    23.61 250000 2500000 100 25 $PUB $SUB $AUTH
screen -d -m -S fb   php stock.php FB    23.29 250000 2500000 100 25 $PUB $SUB $AUTH
screen -d -m -S goog php stock.php GOOG 879.73 250000 2500000 100 25 $PUB $SUB $AUTH
screen -d -m -S lnkd php stock.php LNKD 170.70 250000 2500000 100 25 $PUB $SUB $AUTH
screen -d -m -S msft php stock.php MSFT  35.67 250000 2500000 100 25 $PUB $SUB $AUTH
screen -d -m -S orcl php stock.php ORCL  33.81 250000 2500000 100 25 $PUB $SUB $AUTH
screen -d -m -S tri  php stock.php TRI    3.77 250000 2500000 100 25 $PUB $SUB $AUTH
screen -d -m -S yhoo php stock.php YHOO  27.04 250000 2500000 100 25 $PUB $SUB $AUTH
screen -d -m -S znga php stock.php ZNGA   2.84 250000 2500000 100 25 $PUB $SUB $AUTH
