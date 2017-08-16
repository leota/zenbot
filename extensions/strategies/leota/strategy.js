var z = require('zero-fill')
  , n = require('numbro')
  , highest, lowest

module.exports = function container (get, set, clear) {
  return {
    name: 'leota',
    description: 'Attempts to buy lower than last sold price and sell higher then last bought price',

    getOptions: function () {
      this.option('period', 'period length', String, '2m')
      this.option('margin', 'buy/sell margin size', Number, 5)
      this.option('panic', 'panic size', String, 'none')

    },

    calculate: function (s) {

    },

    onPeriod: function (s, cb) {
      if (s.in_preroll) return cb()
      
      if(s.my_trades.length == 0) {
        s.signal = 'buy'
      } else {
        var my_last_trade = s.my_trades[s.my_trades.length -1]
        var my_last_trade_price = parseFloat(my_last_trade.price)
        // Sell logic
        if(my_last_trade.type !== 'sell') {
          if(highest == undefined) {
            highest = s.period.high
          } 
          if(s.period.high > highest) {
            highest = s.period.high
          }
          // Panic sell
          if(typeof(s.options.panic) == 'number' && s.period.high < my_last_trade_price - s.options.panic) {
            console.log('****************************************')
            console.log('PANIC SELL')
            console.log('****************************************')
            s.signal = 'sell'
          }
          console.log('high: ', s.period.high, 'highest: ', highest, 'last_trade: ', my_last_trade_price, 'goal: ', (my_last_trade_price + s.options.margin))
          if(s.period.high < highest && s.period.high > my_last_trade_price + s.options.margin) {
            lowest = s.period.high
            s.signal = 'sell'
          }
        }
        // Buy logic
        if(my_last_trade.type !== 'buy') {
          if(lowest == undefined) {
            lowest = s.period.low
          } 
          if(s.period.low < lowest) {
            lowest = s.period.low
          }
          // Panic buy
          if(typeof(s.options.panic) == 'number' && s.period.low > my_last_trade_price + s.options.panic) {
            console.log('****************************************')
            console.log('PANIC BUY')
            console.log('****************************************')
            s.signal = 'buy'
          }
          console.log('low: ', s.period.low, 'lowest: ', lowest, 'last_trade: ', my_last_trade_price, 'goal: ', (my_last_trade_price - s.options.margin))
          if(s.period.low > lowest && s.period.low < my_last_trade_price - s.options.margin) {
            highest = s.period.low
            s.signal = 'buy'
          }
        }

      }
      
      cb()
    },

    onReport: function (s) {
      var cols = []
      if (typeof s.period.rsi === 'number') {
        var color = 'grey'
        if (s.period.rsi <= s.options.oversold_rsi) {
          color = 'green'
        }
        cols.push(z(4, n(s.period.rsi).format('0'), ' ')[color])
      }
      return cols
    }
  }
}