import os
import json
import websocket
import threading
import time
from datetime import datetime
from app.models import db, Stock  # Ensure your models are properly defined
from flask import current_app

FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY")
# Change the update interval to 3 seconds (adjust as needed)
UPDATE_INTERVAL_SECONDS = 3

# Global dictionary to hold the latest update for each ticker.
# Each key is the ticker symbol, and the value is a tuple (price, update_time)
stock_updates = {}
# Lock to synchronize access to stock_updates
stock_updates_lock = threading.Lock()

def run_finnhub_ws(app):
    """
    Connect to Finnhub's WebSocket, subscribe to all symbols in the DB,
    collect stock price updates, and trigger live UI updates in batches.
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
                        # Store/update the latest price for the ticker in our shared dictionary.
                        with stock_updates_lock:
                            stock_updates[ticker] = (price, trade_time)
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
            # Subscribe to all ticker symbols from the DB.
            all_stocks = Stock.query.all()
            for stock in all_stocks:
                symbol = stock.ticker_symbol
                subscribe_message = json.dumps({"type": "subscribe", "symbol": symbol})
                ws.send(subscribe_message)
                print(f"Subscribed to {symbol}")

        # Function that will run in a separate thread to process batched updates.
        def process_stock_updates():
            while True:
                # Wait for the defined interval (3 seconds) before processing updates.
                time.sleep(UPDATE_INTERVAL_SECONDS)
                # Use the app context because we're doing DB operations.
                with app.app_context():
                    # Retrieve and clear the updates atomically.
                    with stock_updates_lock:
                        updates = stock_updates.copy()
                        stock_updates.clear()
                    for ticker, (price, update_time) in updates.items():
                        stock = Stock.query.filter_by(ticker_symbol=ticker).first()
                        if stock:
                            # Only update if the price has changed.
                            if stock.market_price != price:
                                stock.market_price = price
                                stock.last_updated = datetime.utcnow()
                                db.session.commit()
                                print(f"WS Updated {ticker} to {price} at {update_time}")
                                # Emit a 'stock_update' event for live UI updates.
                                socketio = app.config.get("socketio")
                                if socketio:
                                    socketio.emit("stock_update", stock.to_dict())
                        else:
                            print(f"Ignored update for unseeded ticker: {ticker}")

        # Start the thread for processing updates.
        updater_thread = threading.Thread(target=process_stock_updates, daemon=True)
        updater_thread.start()

        # Setup the WebSocketApp.
        ws_app = websocket.WebSocketApp(
            finnhub_ws_url,
            on_message=on_message,
            on_error=on_error,
            on_close=on_close,
        )
        ws_app.on_open = on_open

        # Implement a reconnection loop.
        while True:
            try:
                ws_app.run_forever(ping_interval=30, ping_timeout=10)
            except Exception as e:
                print("WebSocket encountered exception:", e)
            print("Reconnecting in 5 seconds...")
            time.sleep(5)
