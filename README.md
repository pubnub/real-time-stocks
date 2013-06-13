# Real-time Stocks with PHP and JavaScript

### [TRY IT NOW! - http://rtstock.co](http://rtstock.co)

You are looking at a **real-time stock** app that sends data from a
**PHP Server Process** to an **HTML5 JavaScript** app in real-time.
Stock Quotes are broadcast from the PHP Server 
into the PubNub Network where the HTML5 JavaScript app
will receive the **websocket data** and display it in real-time.

This is a brief walkthrough of how we built the Real-time Stock
Streaming application using PHP and JavaScript leveraging the
PubNub Real-time Network as the Data Channel broker.

The PHP Process can be run in parallel with other PHP processes
which allows publishing of real-time quote data into the PubNub Cloud.
The JavaScript HTML5 App is able to receive a user-selected
variety of symbols.

Each stock quote symbol may be subscribed individually or as a group.
This means that you are receiving only the data that you request and
are interested in, saving on bandwidth and not receiving data that
you are disinterested in.
This application would not be possible without PubNub Multiplexing.
Multiplexing will be covered in the following section.

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
With `windowing` you receive the opportunity to reduce bandwidth consumed
drastically by allowing messages to be bundled.

This *Bundle of Messages* is allowed to accumulate on the network buffer
before the client receives an update.
This is a good thing as we have the opportunity now to 
highly compress the data using streaming GZIP compression.
This combination of windowing and gzip compressing provides high throughput
at low bandwidth costs; saving
you and your end-consumers a lot of bandwidth.

Here follows the details on how to access this windowing feature
along with a general expected rate of messages per second.

```javascript
var pubnub = PUBNUB.init({
    windowing     : 1000,  // Allow 1 Second to Buffer and Construct each bundle.
    timeout       : 2000,  // Expected to receive at least 1 message each 2 Second.
    subscribe_key : 'demo'
});
```

Note that the lower the `windowing` value the less compression opportunity
and the higher the value the more latency is allowed for bundled messages
with high compression ratios.
The provided numbers above are recommended for streaming stock symbols.


## PHP Server Broadcaster

The PHP server code included in the `php-broadcaster` directory.
To get started you'll execute the server logic as follows:

##### PHP Example with `MSFT` stock
```php
screen -d -m -S MSFT php stock.php MSFT 102.67 250000 2500000 100 25
```

This example launches the stock streamer with default starting values:

```
 - TICKER ID:                           MSFT
 - PRICE:                               102.67
 - MIN TRADE FREQUENCY (microseconds):  250000
 - MAX TRADE FREQUENCY (microseconds):  250000
 - VOLATILITY:                          100
 - MAX DELTA PERCENT (before reset):    25
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
screen -d -m -S bidu php stock.php BIDU 102.67 250000 2500000 100 25
screen -d -m -S cbs  php stock.php CBS   48.03 250000 2500000 100 25
screen -d -m -S ea   php stock.php EA    23.61 250000 2500000 100 25
screen -d -m -S fb   php stock.php FB    23.29 250000 2500000 100 25
screen -d -m -S goog php stock.php GOOG 879.73 250000 2500000 100 25
screen -d -m -S lnkd php stock.php LNKD 170.70 250000 2500000 100 25
screen -d -m -S msft php stock.php MSFT  35.67 250000 2500000 100 25
screen -d -m -S orcl php stock.php ORCL  33.81 250000 2500000 100 25
screen -d -m -S tri  php stock.php TRI    3.77 250000 2500000 100 25
screen -d -m -S yhoo php stock.php YHOO  27.04 250000 2500000 100 25
screen -d -m -S znga php stock.php ZNGA   2.84 250000 2500000 100 25
```

##### Non-screen Example

```php
php stock.php GOOG 879.73 250000 2500000 100 25
```

This is a simple non-GNU-screen example of running the PHP Process.


## HTML5 Client Bootstrapping 

For the server which is providing all the quote streams, you can use
the `bootstrap.php` file in the `php-broadcaster` directory
to bootstrap the available symbol streams.
Just execute the script after you've launched or changed new PHP Streams:

```php
cd php-broadcaster
php bootstrap.php
```

This will look for all running `stock.php` processes and join the result
into a comma separated list which is published for client HTML5 app
to bootstrap when it is loaded.

>NOTE: You must have running `stock.php` processes on the same machine.

The client HTML5 JavaScript App will execute:

```javascript
pubnub.history({
    channel  : 'stockblast',
    callback : function(msgs) { start_stream(msgs[0]) }
});
```

This will bootstrap the client based on what was running on your server
at the time of running `php bootstrap.php` command.


## History

This application uses a `pubnub.history()` call for several purposes.
One is to bootstrap the HTML5 client app.
Another is to load the history of the chat conversations.


## Backfill

This application also demonstrates the capability to opportunistically preload
a message bundled with most recently streamed symbol updates.
This is an optimization and also makes it easier to pre-load data from the
multiplexed stream very quickly rather than waiting for updates
to piece together the stream one-by-one which causes the UI to stagger for a
few moments as it builds the display.
Therefor Backfill is a great optimization in performance and usability!


## Simple Embedded Chat Application

Also provided here in this stock demo is a basic chat which allows
you to communicate with a group of collaborators in real-time.
The chat stream is separate from the stock symbol ticker stream.

![Real-time Stock Feed PHP JavaScript Chat](http://pubnub-demo.s3.amazonaws.com/real-time-stock/real-time-stock-php-javascript-with-chat.png "Real-time Stock Feed PHP JavaScript Chat")

>NOTE: This is a basic chat where you can find the integrated
source code currently inside `app.js` JavaScript source file.


Here is the full source code for the chat example:

```html
<!-- =========== -->
<!-- PANEL: CHAT -->
<!-- =========== -->
<div class="row row-margin">
    <div class="span9">
        <input type="text"
               id="chat-input"
               value=""
               placeholder="Chat Here"
               class="span9">
    </div>
    <div class="span3">
        <input type="text"
               id="chat-name"
               value="Todd"
               class="span2">
        &nbsp;<span class="fui-user"></span>
    </div>
    <div id="chat-output" class="span11">
        <!-- CHAT OUTPUT HERE -->
    </div>
</div>
```

Followed by the JavaScript code which uses the `id=` fields
to bind user events and as display output blocks on the screen:

```html
<script>(function(){
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Chat
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

var pubnub  = PUBNUB.init({
    subscribe_key : 'demo',
    publish_key   : 'demo'
});

var input   = pubnub.$('chat-input')
,   output  = pubnub.$('chat-output')
,   cname   = pubnub.$('chat-name')
,   channel = 'stock-chat';

// Send Chat Message
function send() {
    if (!input.value) return;

    return pubnub.publish({
        channel : channel,
        message : {
            name : clean(cname.value),
            text : clean(input.value),
            time : date_out()
        },
        x : (input.value='')
    });
}

// Append Chat Message
function chat(message) {
    // Default Name
    if (!('name' in message)) message.name = "Robert";
    message.name = message.name.slice( 0, 10 );

    // Clean Precaution
    message.text = clean(message.text);

    // Ouptut to Screen
    output.innerHTML = pubnub.supplant(
        "<strong class=chat-time>{time}</strong> "+
        "<strong class=chat-name>( {name} )</strong> | &nbsp;"+
        "{text}<br>", message
    ) + output.innerHTML;
}

// On Connect we can Load History
function connect() {
    pubnub.history({
        channel  : channel,
        limit    : 50,
        callback : function(msgs) {
            if (msgs.length > 1)
                pubnub.each( msgs[0], chat );
        }
    })
}

// Receive Chat Message
pubnub.subscribe({
    channel  : channel,
    connect  : connect,
    callback : chat
});

pubnub.bind( 'keyup', input, function(e) {
   (e.keyCode || e.charCode) === 13 && send();
});
    
})();</script>
```


## The PubNub Real-Time Network
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

