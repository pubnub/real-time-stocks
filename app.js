(function(){

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// 
// Setup Variables and Objects
// 
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
var stocks         = {}
,   stock_tickers  = PUBNUB.$("stock-tickers")
,   stock_template = PUBNUB.$("stock-template").innerHTML;
var pubnub         = PUBNUB.init({
    windowing     : 1000,
    subscribe_key : 'demo',
    publish_key   : 'demo'
});


// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// 
// Main Get Started
// 
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
start_stream(pubnub.uuid().slice(-4));
start_stream('BIDU,CBS,EA,FB,GOOG,LNKD,MSFT,ORCL,TRI,YHOO,ZNGA');


// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// 
// Update a Ticker Value on Screen
// 
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
function update_stock( data, env, ticker ) {

    // Add Name
    data['name'] = ticker;

    // Setup Ticker Display
    var stock = stocks[ticker] = ticker in stocks &&
    stocks[ticker] || (function(){
        var div   = pubnub.create('div')
        ,   stock = {};

        // Remember Ticker ID
        data.ticker = data.id = ticker
        div.innerHTML = pubnub.supplant( stock_template, data );

        // Populate UI
        stock_tickers.insertBefore( div, first_div(stock_tickers) );

        // Update References
        stock['box']    = pubnub.$('stock-id-'     + ticker);
        stock['name']   = pubnub.$('stock-name-'   + ticker);
        stock['time']   = pubnub.$('stock-time-'   + ticker);
        stock['price']  = pubnub.$('stock-price-'  + ticker);
        stock['delta']  = pubnub.$('stock-delta-'  + ticker);
        stock['perc']   = pubnub.$('stock-perc-'   + ticker);
        stock['vol']    = pubnub.$('stock-vol-'    + ticker);
        stock['switch'] = pubnub.$('stock-switch-' + ticker);

        // Add Flipswitch
        flipswitch( ticker, function( on, off ) {
            console.log( on, off, ticker );
            if (on)  start_stream(ticker);
            if (off) stop_stream(ticker)
        } );

        // Return References
        return stock;
    })();

    // Update UIstock
    update_stock_display( data, stock );
}

function update_stock_display( data, stock ) {
    var delta = data.delta;

    stock['time'].innerHTML  = data.time;
    stock['price'].innerHTML = "$"+data.price; 
    stock['delta'].innerHTML = (delta > 0 ? "+" : "") + delta;
    stock['perc'].innerHTML  = "("+data.perc+"%)";
    stock['vol'].innerHTML   = "Vol: " + data.vol;

    pubnub.css( stock['box'], {
        background : data.price > 0 ? "#2ecc71" : "#e74c3c"
    } );
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// 
// Flip Switch ON/OFF
// 
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
function flipswitch( id, callback ) {
    var ticker        = pubnub.$('stock-id-' + id)
    ,   ticker_switch = pubnub.$('stock-switch-' + id)

    pubnub.bind( 'mousedown,touchstart', ticker, function() {
        var on        = pubnub.attr( ticker, 'data-on' )
        ,   state     = on=='on'
        ,   on_off    = (state?'off':'on')
        ,   classname = 'switch-'+ on_off +' switch-animate';

        // Flip For Later Switching
        pubnub.attr( ticker, 'data-on', on_off )

        // Update UI
        pubnub.attr( ticker_switch, 'class', classname );
        ticker_switch.className = classname;

        // Run User Callback
        callback( !state, state );

        return false;
    } );
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// 
// Start and Stop Streams
// 
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
function start_stream(id) {
    pubnub.subscribe({
        channel : id,
        message : update_stock
    })
}

function stop_stream(id) {
    pubnub.css( pubnub.$("stock-id-"+id), { background : "#ecf0f1" } );
    pubnub.unsubscribe({ channel : id })
}


// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// 
// Load History Example Code
// 
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
var load_history_btn = pubnub.$('load-history-example')
,   history_out      = pubnub.$('output-history-example');

pubnub.bind( 'mousedown,touchstart', load_history_btn, function() {
    pubnub.history({
        limit    : 5,
        channel  : 'MSFT',
        callback : function(msgs) {
            history_out.innerHTML = JSON.stringify(msgs[0]);
        }
    });

    return false;
} );

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// 
// General Utility Functions
// 
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
function first_div(elm) { return elm.getElementsByTagName('div')[0] }

})();
