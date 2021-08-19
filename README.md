# Binance-trading-bot-server (BTB-server)
This is a bot using Binance API to trade and saves them to DB.

[API and explorer](https://binance-trading-bot-server.herokuapp.com/)



## What this application does
At every 5 minutes 
- Get latest executed trade from DB
- Get candlestick data with 5m intervals from Binance API for AVAXUSDT
- Calculate SMA (simple moving average) for 7 and 25 periods.
- Decide to buy, sell or do nothing with SMAs and latestTrade
- Get account balance and calculate quantity of AVAX that will be traded.   
- Check if trading volume is higher than the minimum amount (currently 10 usdt)
- Create order via Binance API and write the trade to DB
- Calculate total balance in terms of USDT and write it to DB
- Send a Telegram message about executed trade and current account balance

### How to run the application
Step 1
```sh
npm i
```
Step 2
```
npm start
```
