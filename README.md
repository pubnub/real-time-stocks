# Real-time Stocks with PHP and JavaScript

You are looking at a **real-time stock** app that sends data from a
**PHP Server Script** to an **HTML5 JavaScript** app.
Data is broadcast from the PHP Server and the HTML5 JavaScript app
will receive the data and display it in real-time.

Each stock quote symbol may be subscribed individually or as a group.
This means that you are receiving only the data that you need and
are interested in, saving on bandwidth.

![Real-time Stock Feed PHP JavaScript](http://pubnub-demo.s3.amazonaws.com/real-time-stock/real-time-stock-feed-php-javascript.png "Real-time Stock Feed PHP JavaScript")


## Multiplexing

## Windowing and Gzip Compressing

## PHP Server Broadcaster

The PHP server code included in the `php-broadcaster` directory.
To get started you'll execute the server logic as follows:

##### PHP Example with `MSFT` stock
```bash
screen -d -m -S bidu php stock.php MSFT 102.67 250000 2500000 100
```

This example launches the stock streamer with default starting values:

 - TICKER ID:  MSFT
 - PRICE:      102.67
 - MIN TRADE:  250000
 - MAX TRADE:  250000
 - VOLATILITY: 100

```bash
screen -d -m -S bidu php stock.php MSFT 102.67 250000 2500000 100
```

This example will launch the PHP process in a screen session which
starts transmitting randomized variants based on the starting args.
This is a good starting point for you and easy to see where
you can easily begin to insert other types of data or
even an alternative stock stream source.

For further details on how we run this PHP code, you can review our
`go.sh` bash shell script which runs multiple instances of the
PHP process for each stock ticker:

```bash
    #!/bin/bash
    screen -d -m -S bidu php stock.php BIDU 102.67 250000 2500000 100 
    screen -d -m -S cbs  php stock.php CBS   48.03 250000 2500000 100
    screen -d -m -S ea   php stock.php EA    23.61 250000 2500000 100
    screen -d -m -S fb   php stock.php FB    23.29 250000 2500000 100
    screen -d -m -S goog php stock.php GOOG 879.73 250000 2500000 100
    screen -d -m -S lnkd php stock.php LNKD 170.70 250000 2500000 100
    screen -d -m -S msft php stock.php MSFT  35.67 250000 2500000 100
    screen -d -m -S orcl php stock.php ORCL  33.81 250000 2500000 100
    screen -d -m -S tri  php stock.php TRI    3.77 250000 2500000 100
    screen -d -m -S yhoo php stock.php YHOO  27.04 250000 2500000 100
    screen -d -m -S znga php stock.php ZNGA   2.84 250000 2500000 100
```

## History

## Server Bootstrapping 

## Simple Embedded Chat Application

## AES256 Cipher Key Cryptography Options




### The PubNub Real-Time Network
##### Build real-time apps quickly and scale them globally.

The Only Global Network For Real-Time Data
Thousands of mobile, web, and desktop apps rely on the PubNub Real-Time
Network to deliver highly scalable real-time experiences to tens of millions
of users worldwide.
Around the world, from innovative start-ups to globally recognized brands,
PubNub is powering a broad variety of apps:
effective real-time advertising campaigns,
global telecommunications apps,
immersive Massively Multiplayer Online Games (MMOGs),
responsive social apps,
real-time ecommerce applications,
and a variety of business collaborative solutions.

 - 100% Cloud, No deployment, scaling, or pricing hassles
 - Deployed in 11 data centers globally
 - 1000's of customers, Millions of messages per second

