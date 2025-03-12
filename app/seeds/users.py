from app.models import db, User, environment, SCHEMA
from sqlalchemy.sql import text


# Adds a demo user, you can add other users here if you want
def seed_users():
    demo = User(
        first_name='Demo', last_name= 'User', username='Demo', email='demo@aa.io', cash_balance=15000.00, password='password')
    marnie = User(
        first_name='marnie', last_name= 'User', username='marnie', email='marnie@aa.io', cash_balance=1000.00, password='password')
    bobbie = User(
        first_name='bobbie', last_name= 'user', username='bobbie', email='bobbie@aa.io', cash_balance=5000.00, password='password')

    db.session.add(demo)
    db.session.add(marnie)
    db.session.add(bobbie)
    db.session.commit()



def undo_users():
    if environment == "production":
        db.session.execute(f"TRUNCATE {SCHEMA}.users RESTART IDENTITY CASCADE;")
    else:
        db.session.execute("TRUNCATE users RESTART IDENTITY CASCADE;")
    db.session.commit()