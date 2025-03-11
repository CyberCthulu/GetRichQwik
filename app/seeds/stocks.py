# app/seeds/seed_stocks.py
from datetime import datetime
from app.models import db, Stock

def seed_stocks():
    # List of curated stocks – add or remove entries as desired.
    stocks_data = [
        {"ticker_symbol": "AAPL", "company_name": "Apple Inc.", "sector": "Technology", "market_price": 150.00},
        {"ticker_symbol": "MSFT", "company_name": "Microsoft Corporation", "sector": "Technology", "market_price": 280.00},
        {"ticker_symbol": "GOOGL", "company_name": "Alphabet Inc.", "sector": "Technology", "market_price": 2800.00},
        {"ticker_symbol": "AMZN", "company_name": "Amazon.com, Inc.", "sector": "Consumer Discretionary", "market_price": 3400.00},
        {"ticker_symbol": "FB", "company_name": "Meta Platforms, Inc.", "sector": "Communication Services", "market_price": 330.00},
        {"ticker_symbol": "TSLA", "company_name": "Tesla, Inc.", "sector": "Consumer Discretionary", "market_price": 700.00},
        {"ticker_symbol": "BRK.B", "company_name": "Berkshire Hathaway Inc.", "sector": "Financials", "market_price": 290.00},
        {"ticker_symbol": "JNJ", "company_name": "Johnson & Johnson", "sector": "Health Care", "market_price": 165.00},
        {"ticker_symbol": "V", "company_name": "Visa Inc.", "sector": "Information Technology", "market_price": 225.00},
        {"ticker_symbol": "WMT", "company_name": "Walmart Inc.", "sector": "Consumer Staples", "market_price": 145.00},
        {"ticker_symbol": "JPM", "company_name": "JPMorgan Chase & Co.", "sector": "Financials", "market_price": 160.00},
        {"ticker_symbol": "MA", "company_name": "Mastercard Incorporated", "sector": "Information Technology", "market_price": 350.00},
        {"ticker_symbol": "PG", "company_name": "Procter & Gamble Co.", "sector": "Consumer Staples", "market_price": 140.00},
        {"ticker_symbol": "NVDA", "company_name": "NVIDIA Corporation", "sector": "Information Technology", "market_price": 220.00},
        {"ticker_symbol": "DIS", "company_name": "The Walt Disney Company", "sector": "Communication Services", "market_price": 110.00},
        {"ticker_symbol": "HD", "company_name": "The Home Depot, Inc.", "sector": "Consumer Discretionary", "market_price": 320.00},
        {"ticker_symbol": "BAC", "company_name": "Bank of America Corporation", "sector": "Financials", "market_price": 40.00},
        {"ticker_symbol": "XOM", "company_name": "Exxon Mobil Corporation", "sector": "Energy", "market_price": 65.00},
        {"ticker_symbol": "KO", "company_name": "The Coca-Cola Company", "sector": "Consumer Staples", "market_price": 55.00},
        {"ticker_symbol": "PFE", "company_name": "Pfizer Inc.", "sector": "Health Care", "market_price": 45.00},
        {"ticker_symbol": "INTC", "company_name": "Intel Corporation", "sector": "Technology", "market_price": 50.00},
        {"ticker_symbol": "CSCO", "company_name": "Cisco Systems, Inc.", "sector": "Technology", "market_price": 55.00},
        {"ticker_symbol": "ORCL", "company_name": "Oracle Corporation", "sector": "Technology", "market_price": 90.00},
        {"ticker_symbol": "CRM", "company_name": "Salesforce.com Inc.", "sector": "Technology", "market_price": 250.00},
        {"ticker_symbol": "NFLX", "company_name": "Netflix, Inc.", "sector": "Communication Services", "market_price": 500.00},
        {"ticker_symbol": "ADBE", "company_name": "Adobe Inc.", "sector": "Technology", "market_price": 520.00},
        {"ticker_symbol": "NKE", "company_name": "NIKE, Inc.", "sector": "Consumer Discretionary", "market_price": 130.00},
        {"ticker_symbol": "LLY", "company_name": "Eli Lilly and Company", "sector": "Health Care", "market_price": 240.00},
        {"ticker_symbol": "T", "company_name": "AT&T Inc.", "sector": "Communication Services", "market_price": 20.00},
        {"ticker_symbol": "VZ", "company_name": "Verizon Communications Inc.", "sector": "Communication Services", "market_price": 55.00},
        # ... add additional stocks as needed ...
    ]
    
    now = datetime.utcnow()
    for stock_data in stocks_data:
        # Check if the stock already exists; update if it does, create if not.
        stock = Stock.query.filter_by(ticker_symbol=stock_data["ticker_symbol"]).first()
        if stock:
            stock.company_name = stock_data["company_name"]
            stock.sector = stock_data["sector"]
            stock.market_price = stock_data["market_price"]
            stock.updated_at = now
        else:
            stock = Stock(
                ticker_symbol=stock_data["ticker_symbol"],
                company_name=stock_data["company_name"],
                sector=stock_data["sector"],
                market_price=stock_data["market_price"],
                last_updated=now,
                created_at=now,
                updated_at=now
            )
            db.session.add(stock)
    db.session.commit()

def undo_stocks():
    db.session.execute("DELETE FROM stocks;")
    db.session.commit()
