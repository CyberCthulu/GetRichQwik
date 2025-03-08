// src/components/Portfolios/PortfolioList.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { thunkLoadPortfolios } from "../../redux/portfolios";
import { Link } from "react-router-dom";

export default function PortfolioList() {
  const dispatch = useDispatch();
  const portfolios = useSelector((state) => Object.values(state.portfolios));

  useEffect(() => {
    dispatch(thunkLoadPortfolios());
  }, [dispatch]);

  return (
    <div className="portfolio-list">
      <h1>My Portfolios</h1>
      {portfolios.length === 0 ? (
        <p>You do not have any portfolios yet.</p>
      ) : (
        <ul>
          {portfolios.map((portfolio) => (
            <li key={portfolio.id} className="portfolio-item">
              <Link to={`/portfolios/${portfolio.id}`}>
                <h3>{portfolio.name}</h3>
                <p>Balance: ${portfolio.portfolio_balance.toFixed(2)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
