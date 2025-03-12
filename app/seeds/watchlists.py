from datetime import datetime
from app.models import db, Watchlist, User, environment, SCHEMA

def seed_watchlists():
    # For example, create a watchlist for the user Demo
    demo = User.query.filter_by(username="Demo").first()
    if demo:
        watchlist = Watchlist(
            user_id=demo.id,
            name="Tech Stocks",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.session.add(watchlist)
        db.session.commit()

def undo_watchlists():
    db.session.execute("TRUNCATE watchlists RESTART IDENTITY CASCADE;")
    db.session.commit()