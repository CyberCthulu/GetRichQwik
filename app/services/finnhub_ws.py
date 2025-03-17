import os
import json
import websocket
from datetime import datetime
from app.models import db, Stock, Holding  # Ensure your models are properly defined
from flask import current_app

# Global dictionary to track the last update time for each ticker
last_update_time = {}
# Throttle threshold in seconds (adjust as needed)
THROTTLE_SECONDS = 1

FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY")

def run_finnhub_ws(app):
    """
    Connect to Finnhub's WebSocket, subscribe to all symbols in the DB,
    update stock prices, and trigger live UI updates.
    """
    with app.app_context():
        finnhub_ws_url = f"wss://ws.finnhub.io?token={FINNHUB_API_KEY}"

        def on_message(ws, message):
            try:
                data = json.loads(message)
                if data.get("data"):
                    for trade in data["data"]:
                        ticker = trade.get("s")
                        price = trade.get("p")
                        trade_timestamp = trade.get("t") / 1000.0
                        trade_time = datetime.utcfromtimestamp(trade_timestamp)

                        # Throttle: skip update if last update was within THROTTLE_SECONDS
                        last_time = last_update_time.get(ticker)
                        if last_time and (trade_time - last_time).total_seconds() < THROTTLE_SECONDS:
                            continue

                        stock = Stock.query.filter_by(ticker_symbol=ticker).first()
                        if stock:
                            # Only update if the price has changed
                            if stock.market_price != price:
                                stock.market_price = price
                                stock.last_updated = datetime.utcnow()
                                db.session.commit()

                                # Record the update time
                                last_update_time[ticker] = trade_time
                                print(f"WS Updated {ticker} to {price} at {trade_time}")

                                # Emit a 'stock_update' event for live UI updates
                                socketio = app.config.get("socketio")
                                if socketio:
                                    socketio.emit("stock_update", stock.to_dict())
                        else:
                            print(f"Ignored update for unseeded ticker: {ticker}")
                else:
                    print("Received non-trade message:", data)
            except Exception as e:
                print("WebSocket processing error:", e)

        def on_error(ws, error):
            print("WebSocket error:", error)

        def on_close(ws, close_status_code, close_msg):
            print("WebSocket closed:", close_status_code, close_msg)

        def on_open(ws):
            print("Global WS connection opened")
            # Dynamically fetch all ticker symbols from the DB and subscribe to each.
            all_stocks = Stock.query.all()
            for stock in all_stocks:
                symbol = stock.ticker_symbol
                subscribe_message = json.dumps({"type": "subscribe", "symbol": symbol})
                ws.send(subscribe_message)
                print(f"Subscribed to {symbol}")

        ws = websocket.WebSocketApp(
            finnhub_ws_url,
            on_message=on_message,
            on_error=on_error,
            on_close=on_close,
        )
        ws.on_open = on_open
        ws.run_forever()
