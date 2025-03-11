# app/services/finnhub_ws.py
import os
import json
import websocket
from datetime import datetime
from threading import Thread
from contextlib import contextmanager
from app.models import db, Stock

FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY")

def run_finnhub_ws(app):
    """
    Connects to Finnhub's WebSocket, subscribes to symbols,
    and updates the price and last_updated for stocks that are already seeded in the database.
    """
    # Use the app context so SQLAlchemy (db) can be used safely
    with app.app_context():
        finnhub_ws_url = f"wss://ws.finnhub.io?token={FINNHUB_API_KEY}"

        def on_message(ws, message):
            data = json.loads(message)
            # Example Finnhub message:
            # {"data":[{"p":117.82,"s":"AAPL","t":1582641900284,"v":100}], "type":"trade"}
            if data.get("data"):
                for trade in data["data"]:
                    ticker = trade.get("s")
                    price = trade.get("p")
                    # Convert milliseconds to seconds
                    trade_timestamp = trade.get("t") / 1000.0
                    trade_time = datetime.utcfromtimestamp(trade_timestamp)

                    # Update only if the stock is already seeded in the database
                    stock = Stock.query.filter_by(ticker_symbol=ticker).first()
                    if stock:
                        stock.market_price = price
                        stock.last_updated = trade_time
                        print(f"Updated {ticker}: {price} at {trade_time}")
                    else:
                        print(f"Ignored update for unseeded ticker: {ticker}")
                db.session.commit()
            else:
                print("Received non-trade message:", data)

        def on_error(ws, error):
            print("WebSocket error:", error)

        def on_close(ws, close_status_code, close_msg):
            print("WebSocket closed:", close_status_code, close_msg)

        def on_open(ws):
            print("WebSocket connection opened")
            # Subscribe to only those symbols that are seeded in your DB
            # For example, if you seeded AAPL, TSLA, and GOOGL, subscribe to these:
            symbols = ["AAPL", "TSLA", "GOOGL"]
            for symbol in symbols:
                subscribe_message = json.dumps({"type": "subscribe", "symbol": symbol})
                ws.send(subscribe_message)
                print(f"Subscribed to {symbol}")

        ws = websocket.WebSocketApp(
            finnhub_ws_url,
            on_message=on_message,
            on_error=on_error,
            on_close=on_close
        )
        ws.on_open = on_open
        ws.run_forever()
