from flask import Blueprint, request, jsonify
from sqlalchemy import or_
from app.models import Stock

stock_routes = Blueprint('stocks', __name__)

@stock_routes.route('/', methods=['GET'])
def get_stocks():
    """
    Retrieves a list of stocks.
    Supports optional query parameters for filtering by ticker symbol or company name.
    
    Successful Response:
      - Status Code: 200
      - Body: {"stocks": [ {stock data}, ... ]}
      
    Error Response (No Stocks Found):
      - Status Code: 404
      - Body: {"message": "No stocks found"}
    """
    ticker = request.args.get("ticker")
    company = request.args.get("company")

    query = Stock.query
    if ticker and company:
        # Use OR so that either the ticker OR the company name can match the search term
        query = query.filter(
            or_(
                Stock.ticker_symbol.ilike(f"%{ticker}%"),
                Stock.company_name.ilike(f"%{company}%")
            )
        )
    elif ticker:
        query = query.filter(Stock.ticker_symbol.ilike(f"%{ticker}%"))
    elif company:
        query = query.filter(Stock.company_name.ilike(f"%{company}%"))
    
    stocks = query.all()

    if not stocks:
        return jsonify({"message": "No stocks found"}), 404

    return jsonify({"stocks": [stock.to_dict() for stock in stocks]}), 200

@stock_routes.route('/<int:stock_id>', methods=['GET'])
def get_stock_details(stock_id):
    """
    Retrieves detailed information for a specific stock.
    
    Successful Response:
      - Status Code: 200
      - Body: {"stock": {stock data}}
      
    Error Response:
      - Status Code: 404
      - Body: {"message": "Stock not found"}
    """
    stock = Stock.query.get(stock_id)
    if not stock:
        return jsonify({"message": "Stock not found"}), 404
    return jsonify({"stock": stock.to_dict()}), 200
