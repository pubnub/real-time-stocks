# Real-time Stocks with PHP and JavaScript

### [TRY IT NOW! - http://rtstock.co](http://rtstock.co)

You are looking at a **real-time stock** app that sends data from a
**PHP Server Process** to an **HTML5 JavaScript** app in real-time.
Stock Quotes are broadcast from the PHP Server 
into the PubNub Network where the HTML5 JavaScript app
will receive quotes data and display it in real-time.

This is a brief walkthrough of how we built the Real-time Stock
Streaming application using PHP and JavaScript leveraging the
PubNub Real-time Network as the Data Channel broker.

The PHP Process can be run in parallel with other PHP processes
which allows publishing of real-time quote data into the PubNub Cloud.
The JavaScript HTML5 App is able to receive a user-selected
variety of symbols.

This application is based on Channel Groups, History and Access Manager features.
All of them can be enabled in your [PubNub Admin Console](http://admin.pubnub.com/).

![Real-time Stock Feed PHP JavaScript](http://pubnub-demo.s3.amazonaws.com/real-time-stock/real-time-stock-feed-php-javascript.png "Real-time Stock Feed PHP JavaScript")


## Data Stream Controller
Data Stream Controller feature provides PubNub developers the ability
to efficiently subscribe to multiple channels via Channel Multiplexing
(MXing) and Channel Groups.

With Stream Controller your app can efficiently and effectively
stream many symbols at the same time over a single
TCP Socket Connection using Channel Groups or Channel Multiplexing features.

Without Stream Controller capability, streaming data from a group of symbols
would be impractical and impossible because each symbol would require
a dedicated TCP Socket; this does not scale.

### Channel Groups

Channel Groups allows PubNub developers to bundle thousands of channels into
a "group" that can be identified by name. These Channel Groups can then be
subscribed to, receiving data from the many backend-channels
the channel group contains.

In this app all ticker(stock) names are collected inside a "stockblast" group
by server-side logic inside `bootstrap.php` script.
All you need is to subscribe to this group
on client-side by specifying it's name only. All messages from channels,
included into this group, will be received inside `receiver` callback handler.

##### Example Channel Group Scenario in JavaScript

```javascript
// Subscribe to Channel Group
pubnub.subscribe({
    channel_group: 'stockblast',
    message : receiver
});

// The Receiver Function
function receiver(update, envelope, group, latency, channel) {
    // Ignore disabled tickers
    if (disabledTickers.has(channel)) {
        return;
    } else {
        console.log(update)
    }
}
```
 
In CG it's impossible to disable data transmission for a specific channel,
you may only ignore these data in your code logic. If you need to have
a strict control of what data should be transmitted or what not,
look for Channels Multiplexing feature.

### Multiplexing

This is an another way to subscribe to tickers, especially useful
if the most of your clients are mobile devices.
Channel Multiplexing can help you to reduce network and battery usage.
With the PubNub JavaScript SDK, Multiplexing is always enabled and
auto-optimizes the connection for each subscription issued.

##### Example Multiplexing Scenario in JavaScript

```javascript
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
function receiver(update) {
    console.log(update)
}
```

If you have Data Stream feature enabled you can keep channels list synchronized via
channel group but do not subscribe to the whole group (using `channel_group` field).
Fetch the list of group's channels using `channel_group_list_channels` function
and subscribe to them as usual channels array using Channels Multiplexing.

If Data Stream feature is disabled, it's up to you where to store a channels list.
One solution is to store the list as the last message of some channel and fetch
it via `history()` call when needed. Another option is to store this list in
external storage, DB, etc, but you should keep in mind that both server
and client should have access to this storage.

In all of above cases the subscription is done using Channel Multiplexing feature,
the fetched channels are passed to the `subscribe()` function via `channel` field as an array.

##### Example Multiplexing Scenario in JavaScript
```javascript
// Option #1. Fetch channels list from channel group
pubnub.channel_group_list_channels({
    channel_group: 'stockblast',
    callback: function (response) {
        subscribeToStock(response.channels)
    }
});

// Option #2. Fetch channels list as the last message using history
pubnub.history({
    channel: "stockblast-channels",
    count: 1,
    callback: function (response) {
        subscribeToStock(response[0])
    }
});

// Option #3. Fetch channels from an external storage
externalStorage.getChannels(function (channels) {
    subscribeToStock(channels);
});

function subscribeToStock(channelsList) {
    pubnub.subscribe({
        channel: channelsList,
        message : receiver
    });
}

function receiver(update, envelope, group, latency, channel) {
    // TODO: handle update
}
```

If you don't need some channel anymore, you are able to unsubscribe from it
and messages on this channel will no longer be transmitted. To enable channel
again, just invoke another subscribe call and pass a channel name to the `channel` field.

##### Example of enabling/disabling specific channel subscription in JavaScript
```javascript
function weDontNeedThisChannelMore(channel) {
    pubnub.unsubscribe({
        channel: channel
    });
}

function weNeedUnsubscribedChannelAgain(channel) {
    pubnub.subscribe({
        channel: channel,
        callback: receiver
    })
}
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


## PubNub Keys

Along with demo keys you can specify the custom ones. For Real Time Stocks app
there are two places where you should put them.

First, export an environment variables to your server console session from which
you will run bootstrap.sh and go.sh scripts. There is a bootstrapped `.env` file
inside `php-bootstrapping` folder that helps to do it. Replace environment
variables in this file with yours and source this file with `. .env` console command.

##### Example of `.env` file
```env
PUBNUB_PUB_KEY="demo"
PUBNUB_SUB_KEY="demo"
PUBNUB_SECRET_KEY="demo"
PUBNUB_AUTH_KEY="my_secret_auth"
```

You can provide PubNub keys to JS client by the way you want, even just hardcode
them inside your HTML, JS code. The current example app uses Apache server
and PHP to share these keys sharing them as a JSON object like
`{"publish_key": "your_pub_key", "subscribe_key": "your_sub_key"}`.
To not publish PubNub keys inside source code control system, it's better to
keep it inside Apache .htaccess or similar env variables storage for other servers.

##### Example of `.htaccess` file
```apacheconf
SetEnv PUBNUB_PUB_KEY demo
SetEnv PUBNUB_SUB_KEY demo
```

The reason is that your source control system should ignore this file.

According to client-side logic, if web server is down or other HTTP error
is happened, client will fall back to the default `demo/demo` keys,
so serving PubNub keys via dynamic web-server is not necessarily.

## PHP Server Broadcaster

The PHP server code included in the `php-broadcaster` directory.
To get started you'll execute the server logic as follows:

##### PHP Example with `MSFT` stock
```php
screen -dmS MSFT php stock.php MSFT 102.67 250000 2500000 100 25
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

PUB=$PUBNUB_PUB_KEY
SUB=$PUBNUB_SUB_KEY
AUTH=$PUBNUB_AUTH_KEY

screen -d -m -S bidu php stock.php BIDU 102.67 250000 2500000 25 0 $PUB $SUB $AUTH
screen -d -m -S cbs  php stock.php CBS   48.03 250000 2500000 25 0 $PUB $SUB $AUTH
screen -d -m -S ea   php stock.php EA    23.61 250000 2500000 25 0 $PUB $SUB $AUTH
screen -d -m -S fb   php stock.php FB    23.29 250000 2500000 25 0 $PUB $SUB $AUTH
screen -d -m -S goog php stock.php GOOG 879.73 250000 2500000 25 0 $PUB $SUB $AUTH
screen -d -m -S lnkd php stock.php LNKD 170.70 250000 2500000 25 0 $PUB $SUB $AUTH
screen -d -m -S msft php stock.php MSFT  35.67 250000 2500000 25 0 $PUB $SUB $AUTH
screen -d -m -S orcl php stock.php ORCL  33.81 250000 2500000 25 0 $PUB $SUB $AUTH
screen -d -m -S tri  php stock.php TRI    3.77 250000 2500000 25 0 $PUB $SUB $AUTH
screen -d -m -S yhoo php stock.php YHOO  27.04 250000 2500000 25 0 $PUB $SUB $AUTH
screen -d -m -S znga php stock.php ZNGA   2.84 250000 2500000 25 0 $PUB $SUB $AUTH
```

##### Non-screen Example

```php
php stock.php GOOG 879.73 250000 2500000 100 25
```

This is a simple non-GNU-screen example of running the PHP Process.


## HTML5 Client Bootstrapping 

For the server which is providing all the quote streams, you can use
the `bootstrap.sh` file in the `php-broadcaster` directory
to bootstrap the available symbol streams. Shell script is a wrapper
that adds PubNub credentials from .env file to `bootstrap.php` call.
Just execute the script after you've launched or changed new PHP Streams:

```php
cd php-broadcaster
./bootstrap.sh
```

This will look for all running `stock.php` processes and add their names
into `stockblast` channel group. HTML5 app will subscribe this group later.

>NOTE: You must have running `stock.php` processes on the same machine.

The client HTML5 JavaScript App will execute:

```javascript
pubnubStocks.subscribe({
    backfill: true,
    channel_group: channelGroup,
    message: updateStock,
});
```

This will bootstrap the client based on what was running on your server
at the time of running `./bootstrap.php` command.


## History

This application uses a `pubnub.history()` call to load
the history of the chat conversations.


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
source code currently inside `script.js` JavaScript source file.


Here is the full source code for the chat example:

```html
<!-- =========== -->
<!-- PANEL: CHAT -->
<!-- =========== -->
<div class="row row-margin">
    <form class="form">
        <div class="col-lg-8 form-group">
            <input type="text"
                   id="chat-input"
                   value=""
                   placeholder="Chat Here"
                   class="col-lg-12 form-control">
        </div>
        <div class="col-lg-3 col-lg-offset-1 form-group">
            <div class="input-group">
                <input type="text"
                       id="chat-name"
                       value="Todd"
                       class="form-control">
                <span class="input-group-addon">
                <span class="fui-user"></span>
                </span>
            </div>
        </div>
        <div id="chat-output" class="col-lg-12">
            <!-- CHAT OUTPUT HERE -->
        </div>
    </form>
</div>
```

Followed by the JavaScript code which uses the `id=` fields
to bind user events and as display output blocks on the screen:

```javascript
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
//
// Initialize Chat
//
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
function initializeChat() {
  var pubnubChat  = PUBNUB.init($.extend({
        noleave: true,
      }, credentials)),
      input   = pubnubChat.$('chat-input'),
      output  = pubnubChat.$('chat-output'),
      cname   = pubnubChat.$('chat-name'),
      channel = 'stock-chat';

  // Send Chat Message
  function sendMessage() {
    if (!input.value) return;
     return pubnubChat.publish({
      channel: channel,
      message: {
        name: clean(cname.value),
        text: clean(input.value),
        time: dateOut(),
      },
      x: (input.value = ''),
    });
  }

  // Append Chat Message
  function appendMessageToChat(message) {
    // Default Name
    if (!('name' in message)) message.name = 'Robert';
    message.name = message.name.slice(0, 10);

    // Clean Precaution
    message.text = clean(message.text);

    // Don't Show Blank Messages
    if (!message.text.replace(/\s/g, '')) return;

    // Ouptut to Screen
    output.innerHTML = pubnubChat.supplant(
        '<strong class=chat-time>{time}</strong> ' +
        '<strong class=chat-name>( {name} )</strong> | &nbsp;' +
        '\'\'{text}\'\'<br>', message
      ) + output.innerHTML;
  }

  // On Connect we can Load History
  function connect() {
    pubnubChat.history({
      channel: channel,
      limit: 50,
      callback: function(msgs) {
        if (msgs.length > 1) {
          pubnubChat.each(msgs[0], appendMessageToChat);
        }
      },
    });
  }

  // Receive Chat Message
  pubnubChat.subscribe({
    channel: channel,
    connect: connect,
    callback: appendMessageToChat,
  });

  pubnubChat.bind('keyup', input, function(e) {
    (e.keyCode || e.charCode) === 13 && sendMessage();
  });

}
```

## PubNub Access Management

PubNub provides builtin enterprise-grade security with fine-grained access control to all
of your PubNub applications with PubNub Access Manager, Message Layer encryption with AES256,
and Transport Layer Security with TLS and SSL. Before using this feature it must be enabled
in the PubNub Admin Console.

Real-Time Stocks app uses this feature to control access to channels and channel groups.
Permissions for stock tickers and front-end client are assigned inside `bootstrap.php` script.

The `stockblast` channel group should be accessible for listening for all unauthorized
users, but only the server-side bootstrapping script (`bootstrap.php`) should have permissions
to manage this group, i.e. adding or removing channels from it.

```php
// All unauthorized users can listen for this group
$response = $pubnub->pamGrantChannelGroup(1, 0, $group);

// Channel group management permissions
$response = $pubnub->pamGrantChannelGroup(0, 1, $group, $bootstrap_auth);
```

If you use Channel Multiplexing instead of Channels groups, you need to grant read permissions
on a ticker channels (like 'GOOG', 'FB', etc.) for all unidentified users and leave off granting
permissions for the `stockblast` channel group. 

```php
// Unauthorized listeners
$response = $pubnub->grant(1, 0, join(",", $channels));
```

The write permissions should be granted on the same channels for tickers (`stock.php`)
with pre-defined in environment variables auth_key.

```php
// Tickers:
$response = $pubnub->grant(0, 1, join(",", $channels), $auth_key);
```

On the main page of Real-Time Stocks example you can also find history and chat examples.
To load history you need only read permissions while for chatting app all unauthorized
users should be able both to read and to write.

```php
// History
$response = $pubnub->grant(1, 0, $history);

// Chat
$response = $pubnub->grant(1, 1, $chat);
```
 
 
## The PubNub Real-Time Network
##### Build real-time apps quickly and scale them globally.

The only global network for real-time data.

Thousands of mobile, web, and desktop apps rely on PubNub's real-time network to deliver highly scalable real-time data to tens of millions of users worldwide.
From innovative start-ups to globally recognized brands around the world, PubNub is powering a broad variety of apps: effective real-time advertising campaigns, global telecommunications apps, immersive Massively Multiplayer Online Games (MMOGs), responsive social apps, real-time ecommerce applications and a variety of business collaborative solutions.

 - Hosted in the Cloud: no deployment, scaling, or pricing hassles
 - Deployed in 11 data centers globally
 - 1000's of customers, millions of messages per second

