# import os
# import json
# import websocket
# from datetime import datetime
# from app.models import db, Stock
# from flask import current_app

# FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY")

# def run_finnhub_ws(app):
#     """
#     Connects to Finnhub's WebSocket, subscribes to desired symbols,
#     and updates the corresponding stock price in the DB using WS data.
#     """
#     with app.app_context():
#         finnhub_ws_url = f"wss://ws.finnhub.io?token={FINNHUB_API_KEY}"

#         def on_message(ws, message):
#             try:
#                 data = json.loads(message)
#                 if data.get("data"):
#                     # Open an app context for DB updates
#                     with app.app_context():
#                         for trade in data["data"]:
#                             ticker = trade.get("s")
#                             price = trade.get("p")
#                             trade_timestamp = trade.get("t") / 1000.0
#                             trade_time = datetime.utcfromtimestamp(trade_timestamp)
                            
#                             # Fetch the stock record based on the ticker symbol
#                             stock = Stock.query.filter_by(ticker_symbol=ticker).first()
#                             if stock:
#                                 # Only update if the price differs (you can add thresholds if desired)
#                                 if stock.market_price != price:
#                                     stock.market_price = price
#                                     stock.last_updated = datetime.utcnow()
#                                     db.session.commit()
#                                     print(f"WS Updated {ticker} to {price} at {trade_time}")
#                 else:
#                     print("Received non-trade message:", data)
#             except Exception as e:
#                 print("WebSocket processing error:", e)

#         def on_error(ws, error):
#             print("WebSocket error:", error)

#         def on_close(ws, close_status_code, close_msg):
#             print("WebSocket closed:", close_status_code, close_msg)

#         def on_open(ws):
#             print("Global WS connection opened")
#             # Subscribe to all symbols you care about; for example:
#             symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "FB", "BRK.B", "JNJ", "V", "WMT", "JPM", "MA", "PG", "NVDA", "DIS", "HD", "BAC", "XOM"]
#             for symbol in symbols:
#                 subscribe_message = json.dumps({"type": "subscribe", "symbol": symbol})
#                 ws.send(subscribe_message)
#                 print(f"Subscribed to {symbol}")

#         ws = websocket.WebSocketApp(
#             finnhub_ws_url,
#             on_message=on_message,
#             on_error=on_error,
#             on_close=on_close,
#         )
#         ws.on_open = on_open
#         ws.run_forever()


# app/services/finnhub_ws.py
import os
import json
import websocket
from datetime import datetime
from app.models import db, Stock, Holding  # Ensure your Holding model is properly defined
from flask import current_app

FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY")

def recalc_and_emit_portfolio_update(app, ticker):
    """
    For a given ticker, find all holdings that include it.
    For each associated portfolio, call its to_dict() (which recalculates current values)
    and emit the update via SocketIO.
    """
    socketio = app.config.get("socketio")
    holdings = Holding.query.join(Stock).filter(Stock.ticker_symbol == ticker).all()
    updated_portfolio_ids = set()
    for holding in holdings:
        portfolio = holding.portfolio  # Assumes relationship exists.
        if portfolio and portfolio.id not in updated_portfolio_ids:
            updated_data = portfolio.to_dict()  # This recalculates portfolio values.
            updated_portfolio_ids.add(portfolio.id)
            socketio.emit("portfolio_update", updated_data)
            print(f"Emitted update for portfolio {portfolio.id}: {updated_data}")

def run_finnhub_ws(app):
    """
    Connect to Finnhub's WebSocket, subscribe to desired symbols,
    update stock prices, and trigger portfolio updates.
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
                        
                        stock = Stock.query.filter_by(ticker_symbol=ticker).first()
                        if stock:
                            if stock.market_price != price:
                                stock.market_price = price
                                stock.last_updated = datetime.utcnow()
                                db.session.commit()
                                print(f"WS Updated {ticker} to {price} at {trade_time}")
                                recalc_and_emit_portfolio_update(app, ticker)
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
            symbols = [
                "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "FB",
                "BRK.B", "JNJ", "V", "WMT", "JPM", "MA",
                "PG", "NVDA", "DIS", "HD", "BAC", "XOM"
            ]
            for symbol in symbols:
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
