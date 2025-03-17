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
import socket from "../../socket"; // Shared Socket.IO instance
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

  useEffect(() => {
    dispatch(thunkLoadOnePortfolio(id));
    dispatch(thunkLoadHoldingsForPortfolio(id));
  }, [dispatch, id]);

  useEffect(() => {
    socket.emit("subscribe_portfolio", { portfolio_id: id });
    socket.on("portfolio_update", (data) => {
      if (data.id === Number(id)) {
        dispatch({ type: "UPDATE_PORTFOLIO", payload: data });
      }
    });
    return () => socket.off("portfolio_update");
  }, [dispatch, id]);

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
              <p><strong>Stock Ticker:</strong> {holding.stock?.ticker_symbol}</p>
              <p><strong>Company Name:</strong> {holding.stock?.company_name}</p>
              <p><strong>Quantity:</strong> {holding.quantity}</p>
              <p><strong>Current Price:</strong> ${Number(holding.stock.market_price).toFixed(2)}</p>
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
