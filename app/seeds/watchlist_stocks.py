from datetime import datetime
from app.models import db, WatchlistStock, Watchlist, Stock, environment, SCHEMA

def seed_watchlist_stocks():
    # Assume a watchlist exists and a stock (e.g., "TSLA") is in the database
    watchlist = Watchlist.query.first()
    stock = Stock.query.filter_by(ticker_symbol="TSLA").first()
    if watchlist and stock:
        wls = WatchlistStock(
            watchlist_id=watchlist.id,
            stock_id=stock.id,
            created_at=datetime.utcnow()
        )
        db.session.add(wls)
        db.session.commit()

def undo_watchlist_stocks():
    if environment == "production":
        db.session.execute(f"TRUNCATE {SCHEMA}.watchlist_stocks RESTART IDENTITY CASCADE;")
    else:
        db.session.execute("TRUNCATE watchlist_stocks RESTART IDENTITY CASCADE;")
    db.session.commit()