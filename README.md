# Real-time Stocks with PHP and JavaScript

You are looking at a **real-time stock** app that sends data from a
**PHP Server Script** to an **HTML5 JavaScript** app.
Data is broadcast from the PHP Server and the HTML5 JavaScript app
will receive the **websocket data** and display it in real-time.

Each stock quote symbol may be subscribed individually or as a group.
This means that you are receiving only the data that you need and
are interested in, saving on bandwidth.

![Real-time Stock Feed PHP JavaScript](http://pubnub-demo.s3.amazonaws.com/real-time-stock/real-time-stock-feed-php-javascript.png "Real-time Stock Feed PHP JavaScript")

## Multiplexing

This application heavily utilizes Stream Multiplexing.
Multiplexing is **vital for any stock/ticker streaming**.
With Multiplexing your app can efficiently and effectively
stream many symbols at the same time over a single
TCP Socket Connection utilizing the **WebSocket Protocol**.

Without Multiplexing capability, streaming data from a group of symbols
would be impractical and impossible because each symbol would require
a dedicated TCP Socket; this does not scale.

With the PubNub JavaScript SDK, Multiplexing is always enabled and
auto-optimizes the connection for each subscription issued.

##### Example Multiplexing Scenario in JavaScript

```html
<script src="https://cdn.pubnub.com/pubnub-3.5.1.min.js"></script>
<script>(function(){
    // Example JavaScript Multiplexing with Three Symbols
    pubnub.subscribe({
        channel : ['MSFT', 'YHOO', 'ORCL'],
        message : receiver
    })

    // Add Three More Symbols (Automatic Multiplexes into the TCP Stream)
    pubnub.subscribe({
        channel : ['AAPL', 'F', 'GOOG'],
        message : receiver
    })

    // The Receiver Function
    function receiver(update) { console.log(update) }
})();</script>
```

## Windowing and Gzip Compression and Tuning

There are two important tuning levers available to you with the
PubNub JavaScript SDK for improved performance vs reduced bandwidth.
Consider the compression ratio savings to latency opportunity.
With `windowing` you receive the opportunity to reduce bandwidth consumption
drastically by allowing message bundling.

This *Bundle of Messages* that is allowed to accumulate on the network buffer
before the client receives is a good thing as we have the opportunity now to 
highly compress the data using streaming GZIP.
This combination of windowing and gzip compressing  provides high throughput
at low bandwidth costs; saving
you and your end-consumers a lot of bandwidth.

Here follows the details on how to access this windowing feature
along with a general expected rate of messages per second.

```javascript
var pubnub = PUBNUB.init({
    windowing     : 200,
    timeout       : 2000,  // Expected to receive at least 1 message
    subscribe_key : 'demo'
});
```

Here is a table of recommended values based on messages per second.

## PHP Server Broadcaster

The PHP server code included in the `php-broadcaster` directory.
To get started you'll execute the server logic as follows:

##### PHP Example with `MSFT` stock
```php
screen -d -m -S MSFT php stock.php MSFT 102.67 250000 2500000 100
```

This example launches the stock streamer with default starting values:

 - TICKER ID:                           MSFT
 - PRICE:                               102.67
 - MIN TRADE FREQUENCY (microseconds):  250000
 - MAX TRADE FREQUENCY (microseconds):  250000
 - VOLATILITY:                          100

```php
screen -d -m -S MSFT php stock.php MSFT 102.67 250000 2500000 100
```

This example will launch the PHP process in a screen session which
starts transmitting randomized variants based on the starting args.
This is a good starting point for you and easy to see where
you can easily begin to insert other types of data or
even an alternative stock stream source.

For further details on how we run this PHP code, you can review our
`go.sh` bash shell script which runs multiple instances of the
PHP process for each stock ticker:

```php
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

##### Non-screen Example

```php
php stock.php GOOG 879.73 250000 2500000 100
```

This is a simple non-GNU-screen example of running the PHP Process.


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

