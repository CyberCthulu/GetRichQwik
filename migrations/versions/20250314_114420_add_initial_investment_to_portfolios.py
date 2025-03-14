"""Add initial_investment to portfolios

Revision ID: 2d5cb6effe1c
Revises: 16691972eafb
Create Date: 2025-03-14 11:44:20.072581

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2d5cb6effe1c'
down_revision = '16691972eafb'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('portfolios', schema=None) as batch_op:
        batch_op.add_column(sa.Column('initial_investment', sa.Numeric(precision=15, scale=2), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('portfolios', schema=None) as batch_op:
        batch_op.drop_column('initial_investment')

    # ### end Alembic commands ###
