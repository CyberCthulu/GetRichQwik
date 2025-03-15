// src/components/Orders/OrdersPage.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { thunkLoadAllOrders, thunkDeleteOrder } from '../../redux/orders';
import { thunkLoadPortfolios } from '../../redux/portfolios';
import "./OrdersPage.css";

export default function OrdersPage() {
  const dispatch = useDispatch();
  const orders = useSelector((state) => Object.values(state.orders));
  const portfolios = useSelector((state) => Object.values(state.portfolios));

  // 1) (Optional) Load portfolios on mount, so you can display portfolio names
  useEffect(() => {
    dispatch(thunkLoadPortfolios());
  }, [dispatch]);

  // 2) Load all orders on mount
  useEffect(() => {
    dispatch(thunkLoadAllOrders());
  }, [dispatch]);

  // 3) (Optional) Poll for updated orders every 5 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      dispatch(thunkLoadAllOrders());
    }, 5000);
    return () => clearInterval(intervalId);
  }, [dispatch]);

  // Group orders by status
  const pendingOrders = orders.filter((order) => order.status === 'pending');
  const executedOrders = orders.filter((order) => order.status === 'executed');
  const cancelledOrders = orders.filter((order) => order.status === 'cancelled');

  // Sort executed orders by executed_at (most recent first)
  const sortedExecutedOrders = [...executedOrders].sort(
    (a, b) => new Date(b.executed_at) - new Date(a.executed_at)
  );

  // Sort cancelled orders by updated_at (most recent first)
  const sortedCancelledOrders = [...cancelledOrders].sort(
    (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
  );

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
            pendingOrders.map((order) => {
              // If you want portfolio name:
              const portfolio = portfolios[order.portfolio_id];
              const portfolioName = portfolio ? portfolio.name : `Portfolio #${order.portfolio_id}`;

              return (
                <div key={order.id} className="order-item">
                  <p><strong>Order ID:</strong> {order.id}</p>
                  <p><strong>Portfolio:</strong> {portfolioName}</p>
                  <p><strong>Ticker:</strong> {order.stock?.ticker_symbol || '-'}</p>
                  <p><strong>Name:</strong> {order.stock?.company_name || '-'}</p>
                  <p><strong>Type:</strong> {order.order_type}</p>
                  <p><strong>Quantity:</strong> {order.quantity}</p>
                  <p><strong>Target Price:</strong> {order.target_price || '-'}</p>
                  <p>
                    <strong>Scheduled:</strong>{' '}
                    {order.scheduled_time
                      ? new Date(order.scheduled_time).toLocaleString()
                      : 'Immediate'}
                  </p>
                  <button onClick={() => handleCancelOrder(order.id)}>
                    Cancel Order
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Executed Orders Card */}
        <div className="orders-card">
          <h2>Executed Orders</h2>
          {sortedExecutedOrders.length === 0 ? (
            <p>No executed orders.</p>
          ) : (
            sortedExecutedOrders.map((order) => {
              const portfolio = portfolios[order.portfolio_id];
              const portfolioName = portfolio ? portfolio.name : `Portfolio #${order.portfolio_id}`;

              return (
                <div key={order.id} className="order-item">
                  <p><strong>Order ID:</strong> {order.id}</p>
                  <p><strong>Portfolio:</strong> {portfolioName}</p>
                  <p><strong>Ticker:</strong> {order.stock?.ticker_symbol || '-'}</p>
                  <p><strong>Name:</strong> {order.stock?.company_name || '-'}</p>
                  <p><strong>Type:</strong> {order.order_type}</p>
                  <p><strong>Quantity:</strong> {order.quantity}</p>
                  <p>
                    <strong>Executed Price:</strong>{' '}
                    {order.executed_price ?? '-'}
                  </p>
                  <p>
                    <strong>Executed At:</strong>{' '}
                    {order.executed_at
                      ? new Date(order.executed_at).toLocaleString()
                      : '-'}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Cancelled Orders Card */}
        <div className="orders-card">
          <h2>Cancelled Orders</h2>
          {sortedCancelledOrders.length === 0 ? (
            <p>No cancelled orders.</p>
          ) : (
            sortedCancelledOrders.map((order) => {
              const portfolio = portfolios[order.portfolio_id];
              const portfolioName = portfolio ? portfolio.name : `Portfolio #${order.portfolio_id}`;

              return (
                <div key={order.id} className="order-item">
                  <p><strong>Order ID:</strong> {order.id}</p>
                  <p><strong>Portfolio:</strong> {portfolioName}</p>
                  <p><strong>Ticker:</strong> {order.stock?.ticker_symbol || '-'}</p>
                  <p><strong>Name:</strong> {order.stock?.company_name || '-'}</p>
                  <p><strong>Type:</strong> {order.order_type}</p>
                  <p><strong>Quantity:</strong> {order.quantity}</p>
                  <p>
                    <strong>Cancelled At:</strong>{' '}
                    {order.updated_at
                      ? new Date(order.updated_at).toLocaleString()
                      : '-'}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
