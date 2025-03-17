// src/components/Portfolios/PortfolioDetail.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { thunkLoadOnePortfolio } from "../../redux/portfolios";
import { thunkLoadHoldingsForPortfolio } from "../../redux/holdings";
import { useModal } from "../../context/Modal";
import DeletePortfolioModal from "./DeletePortfolioModal";
import BuyOrderModal from "./BuyOrderModal";
import SellOrderModal from "./SellOrderModal";
// Removed the websocket import since we’re not using WS updates here
// import socket from "../../socket";
import "./PortfolioDetail.css";

export default function PortfolioDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { setModalContent } = useModal();

  const portfolio = useSelector((state) => state.portfolios[id]);
  const holdings = useSelector((state) =>
    Object.values(state.holdings).filter(
      (holding) => holding.portfolio_id === Number(id)
    )
  );

  // Initial HTTP load of portfolio and holdings.
  useEffect(() => {
    dispatch(thunkLoadOnePortfolio(id));
    dispatch(thunkLoadHoldingsForPortfolio(id));
  }, [dispatch, id]);

  // Polling: re-fetch portfolio and holdings every 5 seconds.
  useEffect(() => {
    const intervalId = setInterval(() => {
      dispatch(thunkLoadOnePortfolio(id));
      dispatch(thunkLoadHoldingsForPortfolio(id));
    }, 1000); // adjust the interval as needed (e.g., 5000ms = 5 seconds)
    return () => clearInterval(intervalId);
  }, [dispatch, id]);

  // (Removed WS subscription for portfolio updates)

  if (!portfolio) return <p>Loading portfolio...</p>;

  const openBuyModal = (holding) => {
    setModalContent(
      <BuyOrderModal
        stockId={holding.stock_id}
        onClose={() => setModalContent(null)}
      />
    );
  };

  const openSellModal = (holding) => {
    setModalContent(
      <SellOrderModal
        stockId={holding.stock_id}
        portfolioId={portfolio.id}
        onClose={() => setModalContent(null)}
      />
    );
  };

  const openDeleteModal = () => {
    setModalContent(
      <DeletePortfolioModal
        portfolioId={portfolio.id}
        portfolioName={portfolio.name}
        onClose={() => setModalContent(null)}
        onSuccess={() => navigate("/portfolios")}
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
                <strong>Stock Ticker:</strong>{" "}
                {holding.stock?.ticker_symbol}
              </p>
              <p>
                <strong>Company Name:</strong>{" "}
                {holding.stock?.company_name}
              </p>
              <p>
                <strong>Quantity:</strong> {holding.quantity}
              </p>
              <p>
                <strong>Current Price:</strong>{" "}
                ${Number(holding.stock.market_price).toFixed(2)}
              </p>
              <div className="holding-actions">
                <button onClick={() => openBuyModal(holding)}>Buy</button>
                <button onClick={() => openSellModal(holding)}>Sell</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
