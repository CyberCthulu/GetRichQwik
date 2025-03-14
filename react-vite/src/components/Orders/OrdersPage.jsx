import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { thunkLoadOrdersForPortfolio, thunkDeleteOrder } from '../../redux/orders';
import { thunkLoadPortfolios } from '../../redux/portfolios';
import "./OrdersPage.css";


export default function OrdersPage() {
  const dispatch = useDispatch();
  const orders = useSelector((state) => Object.values(state.orders));
  const portfolios = useSelector((state) => Object.values(state.portfolios));

  // Track which portfolio orders have been fetched
  const loadedPortfolioIds = useRef(new Set());

  // Load portfolios on mount
  useEffect(() => {
    dispatch(thunkLoadPortfolios());
  }, [dispatch]);

  // Load orders for each portfolio only once
  useEffect(() => {
    if (portfolios.length > 0) {
      portfolios.forEach((portfolio) => {
        if (!loadedPortfolioIds.current.has(portfolio.id)) {
          loadedPortfolioIds.current.add(portfolio.id);
          dispatch(thunkLoadOrdersForPortfolio(portfolio.id));
        }
      });
    }
  }, [portfolios, dispatch]);

  // Group orders by status
  const pendingOrders = orders.filter((order) => order.status === 'pending');
  const executedOrders = orders.filter((order) => order.status === 'executed');
  const cancelledOrders = orders.filter((order) => order.status === 'cancelled');

  const handleCancelOrder = (orderId) => {
    dispatch(thunkDeleteOrder(orderId));
  };

  return (
    <div className="orders-page">
      <h1>Orders</h1>
      <div className="orders-container">
        {/* Pending Orders Card */}
        <div className="orders-card">
          <h2>Pending Orders</h2>
          {pendingOrders.length === 0 ? (
            <p>No pending orders.</p>
          ) : (
            pendingOrders.map((order) => (
              <div key={order.id} className="order-item">
                <p><strong>Order ID:</strong> {order.id}</p>
                <p>
                  <strong>Ticker:</strong>{" "}
                  {order.stock ? order.stock.ticker_symbol : '-'}
                </p>
                <p>
                  <strong>Name:</strong>{" "}
                  {order.stock ? order.stock.company_name : '-'}
                </p>
                <p><strong>Type:</strong> {order.order_type}</p>
                <p><strong>Quantity:</strong> {order.quantity}</p>
                <p>
                  <strong>Target Price:</strong> {order.target_price ? order.target_price : '-'}
                </p>
                <p>
                  <strong>Scheduled:</strong>{" "}
                  {order.scheduled_time
                    ? new Date(order.scheduled_time).toLocaleString()
                    : 'Immediate'}
                </p>
                <button onClick={() => handleCancelOrder(order.id)}>
                  Cancel Order
                </button>
              </div>
            ))
          )}
        </div>

        {/* Executed Orders Card */}
        <div className="orders-card">
          <h2>Executed Orders</h2>
          {executedOrders.length === 0 ? (
            <p>No executed orders.</p>
          ) : (
            executedOrders.map((order) => (
              <div key={order.id} className="order-item">
                <p><strong>Order ID:</strong> {order.id}</p>
                <p>
                  <strong>Ticker:</strong>{" "}
                  {order.stock ? order.stock.ticker_symbol : '-'}
                </p>
                <p>
                  <strong>Name:</strong>{" "}
                  {order.stock ? order.stock.company_name : '-'}
                </p>
                <p><strong>Type:</strong> {order.order_type}</p>
                <p><strong>Quantity:</strong> {order.quantity}</p>
                <p>
                  <strong>Executed Price:</strong> {order.executed_price ? order.executed_price : '-'}
                </p>
                <p>
                  <strong>Executed At:</strong>{" "}
                  {order.executed_at
                    ? new Date(order.executed_at).toLocaleString()
                    : '-'}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Cancelled Orders Card */}
        <div className="orders-card">
          <h2>Cancelled Orders</h2>
          {cancelledOrders.length === 0 ? (
            <p>No cancelled orders.</p>
          ) : (
            cancelledOrders.map((order) => (
              <div key={order.id} className="order-item">
                <p><strong>Order ID:</strong> {order.id}</p>
                <p>
                  <strong>Ticker:</strong>{" "}
                  {order.stock ? order.stock.ticker_symbol : '-'}
                </p>
                <p>
                  <strong>Name:</strong>{" "}
                  {order.stock ? order.stock.company_name : '-'}
                </p>
                <p><strong>Type:</strong> {order.order_type}</p>
                <p><strong>Quantity:</strong> {order.quantity}</p>
                <p>
                  <strong>Cancelled At:</strong>{" "}
                  {order.updated_at
                    ? new Date(order.updated_at).toLocaleString()
                    : '-'}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
