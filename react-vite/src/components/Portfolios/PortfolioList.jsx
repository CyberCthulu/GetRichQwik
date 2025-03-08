// src/components/Portfolios/PortfolioList.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { thunkLoadPortfolios } from "../../redux/portfolios";
import { Link } from "react-router-dom";
import { useModal } from "../../context/Modal";
import CreatePortfolioModal from "./CreatePortfolioModal";

export default function PortfolioList() {
  const dispatch = useDispatch();
  const { setModalContent } = useModal();


  const portfolios = useSelector((state) => Object.values(state.portfolios));

  useEffect(() => {
    dispatch(thunkLoadPortfolios());
  }, [dispatch]);

  const openCreatePortfolioModal = () => {
    setModalContent(
      <CreatePortfolioModal onClose={() => setModalContent(null)} />
    );
  };

  return (
    <div className="portfolio-list">
      <div className="portfolio-header">
        <h1>Portfolios</h1>
        <button onClick={openCreatePortfolioModal} className="add-portfolio-btn">
          +
        </button>
      </div>
        
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
    </div>
  );
}
