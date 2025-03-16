
// src/components/Portfolios/PortfolioDetail.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { thunkLoadOnePortfolio, thunkDeletePortfolio } from "../../redux/portfolios";
import { thunkLoadHoldingsForPortfolio } from "../../redux/holdings";
import { useModal } from "../../context/Modal";
import DeletePortfolioModal from "./DeletePortfolioModal";
import socket from "../../socket"; // Shared Socket.IO instance
import "./PortfolioDetail.css";
// import BuySellModal from "./BuySellModal";

export default function PortfolioDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { setModalContent } = useModal();

  // Get the portfolio and its holdings from Redux
  const portfolio = useSelector((state) => state.portfolios[id]);
  const holdings = useSelector((state) =>
    Object.values(state.holdings).filter(
      (holding) => holding.portfolio_id === Number(id)
    )
  );

  // Initial HTTP load on mount
  useEffect(() => {
    dispatch(thunkLoadOnePortfolio(id));
    dispatch(thunkLoadHoldingsForPortfolio(id));
  }, [dispatch, id]);

  // Subscribe to live portfolio updates via WebSocket.
  useEffect(() => {
    // Emit a subscription event for this portfolio
    socket.emit("subscribe_portfolio", { portfolio_id: id });
    // Listen for updates from the backend.
    socket.on("portfolio_update", (data) => {
      if (data.id === Number(id)) {
        dispatch({ type: "UPDATE_PORTFOLIO", payload: data });
      }
    });
    return () => {
      socket.off("portfolio_update");
    };
  }, [dispatch, id]);

  if (!portfolio) return <p>Loading portfolio...</p>;

  // Opens the buy/sell modal (placeholder; adjust as needed)
  const openBuySellModal = (holding, actionType) => {
    setModalContent(
      // Uncomment and use your BuySellModal when ready:
      // <BuySellModal
      //   holding={holding}
      //   actionType={actionType}
      //   onClose={() => setModalContent(null)}
      // />
      <div>Buy/Sell Modal Placeholder</div>
    );
  };

  const openDeleteModal = () => {
    setModalContent(
      <DeletePortfolioModal
        portfolioId={portfolio.id}
        portfolioName={portfolio.name}
        onClose={() => setModalContent(null)}
        onSuccess={() => {
          // After deletion, navigate back to the portfolio list.
          navigate("/portfolios");
        }}
      />
    );
  };

  return (
    <div className="portfolio-detail">
      <div className="portfolio-header">
        <h1>{portfolio.name}</h1>
        <button onClick={openDeleteModal} className="delete-portfolio-btn">
          Delete Portfolio
        </button>
      </div>
      <p>Total Portfolio Value: ${portfolio.portfolio_value.toFixed(2)}</p>
      <p>Portfolio Balance: ${portfolio.portfolio_balance.toFixed(2)}</p>
      <p>Gains/Losses: ${Number(portfolio.gains_loss).toFixed(2)}</p>

      <h2>Holdings</h2>
      {holdings.length === 0 ? (
        <p>No holdings available in this portfolio.</p>
      ) : (
        <ul>
          {holdings.map((holding) => (
            <li key={holding.id} className="holding-item">
              <p>
                <strong>Stock Ticker:</strong> {holding.stock?.ticker_symbol}
              </p>
              <p>
                <strong>Company Name:</strong> {holding.stock?.company_name}
              </p>
              <p>
                <strong>Stock ID:</strong> {holding.stock_id}
              </p>
              <p>
                <strong>Quantity:</strong> {holding.quantity}
              </p>
              <p>
                <strong>Current Price:</strong> $
                {holding.stock
                  ? Number(holding.stock.market_price).toFixed(2)
                  : "N/A"}
              </p>
              <div className="holding-actions">
                <button onClick={() => openBuySellModal(holding, "buy")}>
                  Buy
                </button>
                <button onClick={() => openBuySellModal(holding, "sell")}>
                  Sell
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
