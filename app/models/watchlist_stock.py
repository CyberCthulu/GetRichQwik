from datetime import datetime
from .db import db, environment, SCHEMA, add_prefix_for_prod
from .stock import Stock 


class WatchlistStock(db.Model):
    __tablename__ = 'watchlist_stocks'
    if environment == "production":
        __table_args__ = (
            db.UniqueConstraint('watchlist_id', 'stock_id', name='uix_watchlist_stock'),
            {'schema': SCHEMA}
        )
    else:
        __table_args__ = (
            db.UniqueConstraint('watchlist_id', 'stock_id', name='uix_watchlist_stock'),
        )

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    watchlist_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('watchlists.id')), nullable=False)
    stock_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('stocks.id')), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship to Stock

    def to_dict(self):
        return {
            "id": self.id,
            "watchlist_id": self.watchlist_id,
            "stock_id": self.stock_id,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
