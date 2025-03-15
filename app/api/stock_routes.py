from flask import Blueprint, request, jsonify
from sqlalchemy import or_
from app.models import Stock, db
from app.services.finnhub_api import finnhub_client 

stock_routes = Blueprint('stocks', __name__)

@stock_routes.route('/search', methods=['GET'])
def search_stocks():
    """
    Searches the local stocks database for matches based on a query string.
    
    Query Parameter:
      - q: the search query (e.g., 'Apple')
    
    Successful Response (200):
      {
        "stocks": [
          { "id": 1, "ticker_symbol": "AAPL", "company_name": "Apple Inc.", ... },
          ...
        ]
      }
    
    Error Responses:
      - 400 if the query parameter is missing
      - 404 if no matching stocks are found
    """
    query_str = request.args.get("q")
    if not query_str:
        return jsonify({"message": "Query parameter 'q' is required."}), 400

    results = Stock.query.filter(
        or_(
            Stock.ticker_symbol.ilike(f"%{query_str}%"),
            Stock.company_name.ilike(f"%{query_str}%")
        )
    ).all()

    if not results:
        return jsonify({"message": "No stocks found"}), 404

    return jsonify({"stocks": [stock.to_dict() for stock in results]}), 200


@stock_routes.route('/<int:stock_id>', methods=['GET'])
def get_stock_details(stock_id):
    """
    Retrieves detailed information for a specific stock by its numeric ID.
    """
    stock = Stock.query.get(stock_id)
    if not stock:
        return jsonify({"message": "Stock not found"}), 404
    return jsonify({"stock": stock.to_dict()}), 200

@stock_routes.route('/recent', methods=['GET'])
def get_recent_stocks():
    """
    Retrieves a list of recently searched stocks for the current user.
    For this example, we're using the Flask session to store recently searched stock IDs.
    Response:
      {
        "stocks": [
          { "id": 1, "ticker_symbol": "AAPL", "company_name": "Apple Inc.", ... },
          ...
        ]
      }
    """
    recent_ids = session.get("recent_stock_ids", [])
    if not recent_ids:
        return jsonify({"stocks": []}), 200

    # Query stocks based on the list of recent IDs.
    stocks = Stock.query.filter(Stock.id.in_(recent_ids)).all()
    # Create a dictionary keyed by ID for ordering.
    stocks_dict = {stock.id: stock for stock in stocks}
    # Order the stocks as stored in the session.
    ordered_stocks = [stocks_dict[stock_id] for stock_id in recent_ids if stock_id in stocks_dict]

    return jsonify({"stocks": [stock.to_dict() for stock in ordered_stocks]}), 200