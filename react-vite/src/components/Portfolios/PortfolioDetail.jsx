// src/components/Portfolios/PortfolioDetail.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { thunkLoadOnePortfolio } from "../../redux/portfolios";
import { thunkLoadHoldingsForPortfolio } from "../../redux/holdings";
import { useModal } from "../../context/Modal";
// import BuySellModal from "./BuySellModal";

export default function PortfolioDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { setModalContent } = useModal();

  // Get the portfolio and holdings from Redux
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

  if (!portfolio) return <p>Loading portfolio...</p>;

  // Opens the buy/sell modal with the specified action ("buy" or "sell")
  const openBuySellModal = (holding, actionType) => {
    setModalContent(
      <BuySellModal
        holding={holding}
        actionType={actionType}
        onClose={() => setModalContent(null)}
      />
    );
  };

  return (
    <div className="portfolio-detail">
      <h1>{portfolio.name}</h1>
      <p>
        Portfolio Balance: ${portfolio.portfolio_balance.toFixed(2)}
      </p>
      
      <h2>Holdings</h2>
      {holdings.length === 0 ? (
        <p>No holdings available in this portfolio.</p>
      ) : (
        <ul>
          {holdings.map((holding) => (
            <li key={holding.id} className="holding-item">
              <p>
                <strong>Stock ID:</strong> {holding.stock_id}
              </p>
              <p>
                <strong>Quantity:</strong> {holding.quantity}
              </p>
              <p>
                <strong>Avg. Purchase Price:</strong> $
                {holding.average_purchase_price.toFixed(2)}
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
