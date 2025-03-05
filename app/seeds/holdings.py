from datetime import datetime
from app.models import db, Holding, Portfolio, Stock, environment, SCHEMA

def seed_holdings():
    # Get the first portfolio and attempt to find a stock record, for example, "AAPL"
    portfolio = Portfolio.query.first()
    stock = Stock.query.filter_by(ticker_symbol="AAPL").first()
    if portfolio and stock:
        holding = Holding(
            portfolio_id=portfolio.id,
            stock_id=stock.id,
            quantity=10,  # Example: 10 shares
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.session.add(holding)
        db.session.commit()

def undo_holdings():
    if environment == "production" and SCHEMA:
        # Use TRUNCATE to also reset identities and cascade deletes
        db.session.execute(f"TRUNCATE TABLE {SCHEMA}.holdings RESTART IDENTITY CASCADE;")
    else:
        db.session.execute("TRUNCATE TABLE holdings RESTART IDENTITY CASCADE;")
    db.session.commit()