// jscs:disable requireCamelCaseOrUpperCaseIdentifiers

$(function() {
  'use strict';

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  //
  // Setup Variables and Objects
  //
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  var stocks          = new Map(),
      disabledTickers = new Set(),
      channelGroup = 'stockblast',
      credentials,
      pubnubStocks,
      stockTickers,
      stockTemplate,
      loadHistoryBtn,
      historyOut,
      options;

  options = {
    noleave: true,
    windowing: 200,
    timeout: 2000,
  };

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  //
  // Initialize Stock subscription
  //
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  function initializeStock() {
    pubnubStocks = PUBNUB.init($.extend({}, options, { subscribe_key: credentials.subscribe_key }));

    stockTickers    = PUBNUB.$('stock-tickers');
    stockTemplate   = pubnubStocks.$('stock-template').innerHTML;
    loadHistoryBtn  = document.getElementById('load-history-example');
    historyOut      = $('#output-history-example')[0];

    pubnubStocks.subscribe({
      backfill: true,
      channel_group: channelGroup,
      message: updateStock,
    });
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  //
  // Update a Ticker Value on Screen
  //
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  function updateStock(data, env, group, latency, ticker) {
    var stock;

    // Add Name
    data.name = ticker;

    // Setup Ticker Display
    stock = stocks.get(ticker);

    if (typeof stock === 'undefined') {
      var div = pubnubStocks.create('div');

      stock = {};

      // Remember Ticker ID
      data.ticker = data.id = ticker;
      div.innerHTML = pubnubStocks.supplant(stockTemplate, data);

      // Populate UI
      stockTickers.insertBefore(div, firstDiv(stockTickers));

      // Update References
      stock.box    = pubnubStocks.$('stock-id-'     + ticker);
      stock.name   = pubnubStocks.$('stock-name-'   + ticker);
      stock.time   = pubnubStocks.$('stock-time-'   + ticker);
      stock.price  = pubnubStocks.$('stock-price-'  + ticker);
      stock.delta  = pubnubStocks.$('stock-delta-'  + ticker);
      stock.perc   = pubnubStocks.$('stock-perc-'   + ticker);
      stock.vol    = pubnubStocks.$('stock-vol-'    + ticker);
      stock.switch = pubnubStocks.$('stock-switch-' + ticker);

      $('#stock-switch-' + ticker).bootstrapSwitch().on('switchChange.bootstrapSwitch', function(event, state) {
        state ? enableStream(ticker) : disableStream(ticker);
      });

      $('#stock-id-' + ticker).on('click', function() {
        $('#stock-switch-' + ticker).bootstrapSwitch('toggleState');
      });

      // Set created value
      stocks.set(ticker, stock);
    }

    // Update UIstock
    updateStockDisplay(data, stock);
  }

  function updateStockDisplay(data, stock) {
    // Ignore if ticker was explicitly removed from active
    if (disabledTickers.has(data.name)) {
      return;
    }

    var delta = data.delta;

    stock.time.innerHTML  = data.time;
    stock.price.innerHTML = '$' + data.price;
    stock.delta.innerHTML = (delta > 0 ? '+' : '') + delta;
    stock.perc.innerHTML  = '(' + data.perc + '%)';
    stock.vol.innerHTML   = 'Vol: ' + data.vol;

    pubnubStocks.css(stock.box, {
      background: delta > 0 ? '#2ecc71' : '#e74c3c',
    });
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  //
  // Enable and Disable parsing messages on specific channels
  //
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  function enableStream(id) {
    disabledTickers.delete(id);
  }

  function disableStream(id) {
    pubnubStocks.css(pubnubStocks.$('stock-id-' + id), { background: '#ecf0f1' });
    disabledTickers.add(id);
  }

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

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  //
  // Initialize History Example Code
  //
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  function initializeHistoryExample() {
    pubnubStocks.bind('mousedown,touchstart', loadHistoryBtn, function() {
      pubnubStocks.history({
        limit: 5,
        channel: 'MSFT',
        callback: function(msgs) {
          historyOut.innerHTML = JSON.stringify(msgs[0]);
        },
      });

      return false;
    });
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  //
  // General Utility Functions
  //
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  function clean(text) {
    return ('' + text).replace(/[<>]/g, '');
  }

  function firstDiv(elm) {
    return elm.getElementsByTagName('div')[0];
  }

  function zeropad(num) {
    return ('' + num).length > 1 ? '' + num : '0' + num;
  }

  function dateOut() {
    var now = new Date(),
        min = now.getMinutes(),
        hrs = now.getHours();

    return pubnubStocks.supplant('{hours}:{minutes}<sup>{pmam}</sup>', {
      hours: zeropad(hrs > 12 ? (hrs - 12) || 1 : hrs || 1),
      minutes: zeropad(min),
      pmam: hrs > 11 ? 'pm' : 'am',
    });
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  //
  // Run initializers
  //
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  function initialize() {
    initializeStock();
    initializeChat();
    initializeHistoryExample();
  }

  function main() {
    $.get('get_configs.php')
      .done(function(response) {
        credentials = response;
        initialize();
      })
      .fail(function(error) {
        console.warn('Failed to fetch server-side configs. Falling back to the "demo/demo" keys');

        credentials = { publish_key: 'demo', subscribe_key: 'demo' };
        initialize();
      });
  }

  main();
});
