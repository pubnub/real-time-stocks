(function() {
  'use strict';

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  //
  // Setup Variables and Objects
  //
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  var stocks          = new Map(),
      disabledTickers = new Set(),
      stockTickers    = PUBNUB.$('stock-tickers'),
      stockTemplate   = PUBNUB.$('stock-template').innerHTML,
      pubnub          = PUBNUB.init({
        noleave: true,
        windowing: 200,
        timeout: 2000,
        subscribe_key: 'demo',// jscs:ignore requireCamelCaseOrUpperCaseIdentifiers
      });

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  //
  // Main - Load Bootstrap or attempt the fall-back default.
  //
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  main();

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  //
  // Chat
  //
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  (function() {
    var pubnub  = PUBNUB.init({
          noleave: true,
          subscribe_key: 'demo',// jscs:ignore requireCamelCaseOrUpperCaseIdentifiers
          publish_key: 'demo',// jscs:ignore requireCamelCaseOrUpperCaseIdentifiers
        }),
        input   = pubnub.$('chat-input'),
        output  = pubnub.$('chat-output'),
        cname   = pubnub.$('chat-name'),
        channel = 'stock-chat';

    // Send Chat Message
    function send() {
      if (!input.value) return;

      return pubnub.publish({
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
    function chat(message) {
      // Default Name
      if (!('name' in message)) message.name = 'Robert';
      message.name = message.name.slice(0, 10);

      // Clean Precaution
      message.text = clean(message.text);

      // Don't Show Blank Messages
      if (!message.text.replace(/\s/g, '')) return;

      // Ouptut to Screen
      output.innerHTML = pubnub.supplant(
          '<strong class=chat-time>{time}</strong> ' +
          '<strong class=chat-name>( {name} )</strong> | &nbsp;' +
          '\'\'{text}\'\'<br>', message
        ) + output.innerHTML;
    }

    // On Connect we can Load History
    function connect() {
      pubnub.history({
        channel: channel,
        limit: 50,
        callback: function(msgs) {
          if (msgs.length > 1) {
            pubnub.each(msgs[0], chat);
          }
        },
      });
    }

    // Receive Chat Message
    pubnub.subscribe({
      channel: channel,
      connect: connect,
      callback: chat,
    });

    pubnub.bind('keyup', input, function(e) {
      (e.keyCode || e.charCode) === 13 && send();
    });

  })();

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
      var div = pubnub.create('div');

      stock = {};

      // Remember Ticker ID
      data.ticker = data.id = ticker;
      div.innerHTML = pubnub.supplant(stockTemplate, data);

      // Populate UI
      stockTickers.insertBefore(div, firstDiv(stockTickers));

      // Update References
      stock.box    = pubnub.$('stock-id-'     + ticker);
      stock.name   = pubnub.$('stock-name-'   + ticker);
      stock.time   = pubnub.$('stock-time-'   + ticker);
      stock.price  = pubnub.$('stock-price-'  + ticker);
      stock.delta  = pubnub.$('stock-delta-'  + ticker);
      stock.perc   = pubnub.$('stock-perc-'   + ticker);
      stock.vol    = pubnub.$('stock-vol-'    + ticker);
      stock.switch = pubnub.$('stock-switch-' + ticker);

      // Add Flipswitch
      flipswitch(ticker, function(on, off) {
        if (on)  enableStream(ticker);
        if (off) disableStream(ticker);
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

    pubnub.css(stock.box, {
      background: delta > 0 ? '#2ecc71' : '#e74c3c',
    });
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  //
  // Flip Switch ON/OFF
  //
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  function flipswitch(id, callback) {
    var ticker        = pubnub.$('stock-id-' + id),
        trackerSwitch = pubnub.$('stock-switch-' + id);

    pubnub.bind('mousedown,touchstart', ticker, function() {
      var on        = pubnub.attr(ticker, 'data-on'),
          state     = on == 'on',
          onOff     = (state ? 'off' : 'on'),
          classname = 'switch-' + onOff + ' switch-animate';

      // Flip For Later Switching
      pubnub.attr(ticker, 'data-on', onOff);

      // Update UI
      pubnub.attr(trackerSwitch, 'class', classname);
      trackerSwitch.className = classname;

      // Run User Callback
      callback(!state, state);

      return false;
    });
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  //
  // Start and Stop Streams
  //
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  function main() {
    var channelGroup = 'stockblast';

    pubnub.subscribe({
      backfill: true,
      channel_group: channelGroup,// jscs:ignore requireCamelCaseOrUpperCaseIdentifiers
      message: updateStock,
    });
  }

  function enableStream(id) {
    disabledTickers.delete(id);
  }

  function disableStream(id) {
    pubnub.css(pubnub.$('stock-id-' + id), { background: '#ecf0f1' });
    disabledTickers.add(id);
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  //
  // Load History Example Code
  //
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  var loadHistoryBtn = pubnub.$('load-history-example'),
      historyOut     = pubnub.$('output-history-example');

  pubnub.bind('mousedown,touchstart', loadHistoryBtn, function() {
    pubnub.history({
      limit: 5,
      channel: 'MSFT',
      callback: function(msgs) {
        historyOut.innerHTML = JSON.stringify(msgs[0]);
      },
    });

    return false;
  });

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

    return pubnub.supplant('{hours}:{minutes}<sup>{pmam}</sup>', {
      hours: zeropad(hrs > 12 ? (hrs - 12) || 1 : hrs || 1),
      minutes: zeropad(min),
      pmam: hrs > 11 ? 'pm' : 'am',
    });
  }

})();
