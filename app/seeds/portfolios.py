from datetime import datetime
from app.models import db, Portfolio, User, environment, SCHEMA
from decimal import Decimal


def seed_portfolios():
    # Get users from the database
    demo = User.query.filter_by(username="Demo").first()
    marnie = User.query.filter_by(username="marnie").first()

    # For example, load $5000 into Demo's portfolio and $2000 into Marnie's portfolio.
    if demo:
        portfolio_demo = Portfolio(
            user_id=demo.id,
            name="Demo's Investment Portfolio",
            portfolio_balance=Decimal("5000.00"),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        # Simulate transferring funds from the user's cash balance
        demo.cash_balance = demo.cash_balance - Decimal("5000.00")
        db.session.add(portfolio_demo)

    if marnie:
        portfolio_marnie = Portfolio(
            user_id=marnie.id,
            name="Marnie's Portfolio",
            portfolio_balance=Decimal("2000.00"),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        marnie.cash_balance = marnie.cash_balance - Decimal("2000.00")
        db.session.add(portfolio_marnie)

    db.session.commit()

def undo_portfolios():
    if environment == "production":
        db.session.execute(f"TRUNCATE {SCHEMA}.portfolios RESTART IDENTITY CASCADE;")
    else:
        db.session.execute("TRUNCATE portfolios RESTART IDENTITY CASCADE;")
    db.session.commit()