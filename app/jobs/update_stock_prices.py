import os
from datetime import datetime
from app.models import db, Stock
import finnhub  # Import the finnhub package directly
from flask import current_app

def update_stock_prices():
    """
    Uses Finnhub's REST API to fetch the latest quote for each seeded stock
    and updates the market price and last_updated timestamp in the DB.
    This function must run inside an application context.
    """
    with current_app.app_context():
        print("Running scheduled price update...")
        stocks = Stock.query.all()
        now = datetime.utcnow()
        for stock in stocks:
            try:
                # Reinitialize the client for each call to avoid caching issues.
                api_key = os.getenv("FINNHUB_API_KEY")
                client = finnhub.Client(api_key=api_key)
                quote = client.quote(stock.ticker_symbol)
                print(f"Quote for {stock.ticker_symbol}: {quote}")  # Debug output
                current_price = quote.get("c")
                if current_price is not None:
                    stock.market_price = current_price
                    stock.last_updated = now
                    print(f"Updated {stock.ticker_symbol} to {current_price}")
            except Exception as e:
                print(f"Error updating {stock.ticker_symbol}: {e}")
        db.session.commit()
