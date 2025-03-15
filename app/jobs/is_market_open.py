# app/jobs/is_market_open.py
import pytz
from datetime import datetime, time

def is_market_open_now():
    """
    Simple check: Monday–Friday, 9:30am–4:00pm US/Eastern (no holiday checks).
    """
    eastern = pytz.timezone("US/Eastern")
    now_et = datetime.now(eastern)

    # Monday=0, Tuesday=1, ... Sunday=6
    if now_et.weekday() >= 5:  # Saturday or Sunday
        return False

    market_open = time(9, 30)  # 9:30 AM
    market_close = time(16, 0) # 4:00 PM
    current_time = now_et.time()

    return (market_open <= current_time <= market_close)
