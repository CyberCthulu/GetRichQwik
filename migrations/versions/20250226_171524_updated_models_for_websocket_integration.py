"""Updated models for websocket integration

Revision ID: 16691972eafb
Revises: ffdc0a98111c
Create Date: 2025-02-26 17:15:24.942423

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '16691972eafb'
down_revision = 'ffdc0a98111c'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('stocks',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('ticker_symbol', sa.String(length=10), nullable=False),
    sa.Column('company_name', sa.String(length=255), nullable=False),
    sa.Column('sector', sa.String(length=100), nullable=True),
    sa.Column('market_price', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.Column('last_updated', sa.DateTime(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('ticker_symbol')
    )
    with op.batch_alter_table('stocks', schema=None) as batch_op:
        batch_op.create_index('idx_company_name', ['company_name'], unique=False)
        batch_op.create_index('idx_ticker_symbol', ['ticker_symbol'], unique=False)

    op.create_table('portfolios',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('portfolio_balance', sa.Numeric(precision=15, scale=2), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('watchlists',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('holdings',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('portfolio_id', sa.Integer(), nullable=False),
    sa.Column('stock_id', sa.Integer(), nullable=False),
    sa.Column('quantity', sa.Numeric(precision=15, scale=4), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['portfolio_id'], ['portfolios.id'], ),
    sa.ForeignKeyConstraint(['stock_id'], ['stocks.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('portfolio_id', 'stock_id', name='uix_portfolio_stock')
    )
    op.create_table('orders',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('portfolio_id', sa.Integer(), nullable=False),
    sa.Column('stock_id', sa.Integer(), nullable=False),
    sa.Column('order_type', sa.Enum('buy', 'sell', name='ordertypeenum'), nullable=False, comment='buy or sell'),
    sa.Column('quantity', sa.Numeric(precision=15, scale=4), nullable=False),
    sa.Column('target_price', sa.Numeric(precision=10, scale=2), nullable=True),
    sa.Column('scheduled_time', sa.DateTime(), nullable=True),
    sa.Column('status', sa.Enum('pending', 'executed', 'cancelled', name='orderstatusenum'), nullable=True, comment='pending, executed, cancelled'),
    sa.Column('executed_price', sa.Numeric(precision=10, scale=2), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.Column('executed_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['portfolio_id'], ['portfolios.id'], ),
    sa.ForeignKeyConstraint(['stock_id'], ['stocks.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('watchlist_stocks',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('watchlist_id', sa.Integer(), nullable=False),
    sa.Column('stock_id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['stock_id'], ['stocks.id'], ),
    sa.ForeignKeyConstraint(['watchlist_id'], ['watchlists.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('watchlist_id', 'stock_id', name='uix_watchlist_stock')
    )
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('first_name', sa.String(length=50), nullable=False))
        batch_op.add_column(sa.Column('last_name', sa.String(length=50), nullable=False))
        batch_op.add_column(sa.Column('cash_balance', sa.Numeric(precision=15, scale=2), nullable=True))
        batch_op.add_column(sa.Column('created_at', sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column('updated_at', sa.DateTime(), nullable=True))
        batch_op.alter_column('username',
               existing_type=sa.VARCHAR(length=40),
               type_=sa.String(length=50),
               existing_nullable=False)
        batch_op.alter_column('email',
               existing_type=sa.VARCHAR(length=255),
               type_=sa.String(length=100),
               existing_nullable=False)
        batch_op.alter_column('hashed_password',
               existing_type=sa.VARCHAR(length=255),
               type_=sa.Text(),
               existing_nullable=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('hashed_password',
               existing_type=sa.Text(),
               type_=sa.VARCHAR(length=255),
               existing_nullable=False)
        batch_op.alter_column('email',
               existing_type=sa.String(length=100),
               type_=sa.VARCHAR(length=255),
               existing_nullable=False)
        batch_op.alter_column('username',
               existing_type=sa.String(length=50),
               type_=sa.VARCHAR(length=40),
               existing_nullable=False)
        batch_op.drop_column('updated_at')
        batch_op.drop_column('created_at')
        batch_op.drop_column('cash_balance')
        batch_op.drop_column('last_name')
        batch_op.drop_column('first_name')

    op.drop_table('watchlist_stocks')
    op.drop_table('orders')
    op.drop_table('holdings')
    op.drop_table('watchlists')
    op.drop_table('portfolios')
    with op.batch_alter_table('stocks', schema=None) as batch_op:
        batch_op.drop_index('idx_ticker_symbol')
        batch_op.drop_index('idx_company_name')

    op.drop_table('stocks')
    # ### end Alembic commands ###
