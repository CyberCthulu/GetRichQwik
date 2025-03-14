// src/components/Portfolios/PortfolioList.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { thunkLoadPortfolios } from "../../redux/portfolios";
import { Link } from "react-router-dom";
import { useModal } from "../../context/Modal";
import CreatePortfolioModal from "./CreatePortfolioModal";
import DeletePortfolioModal from "./DeletePortfolioModal";
import { FaPlus } from "react-icons/fa";
import "./PortfolioList.css"; // Updated CSS

export default function PortfolioList() {
  const dispatch = useDispatch();
  const { setModalContent } = useModal();
  const portfolios = useSelector((state) => Object.values(state.portfolios));

  useEffect(() => {
    dispatch(thunkLoadPortfolios());
  }, [dispatch]);

  const openCreatePortfolioModal = () => {
    setModalContent(<CreatePortfolioModal onClose={() => setModalContent(null)} />);
  };

  const openDeleteModal = (portfolio) => {
    setModalContent(
      <DeletePortfolioModal
        portfolioId={portfolio.id}
        portfolioName={portfolio.name}
        onClose={() => setModalContent(null)}
      />
    );
  };

  return (
    // 1) A top-level container .portfolios-page, similar to .watchlists-page
    <div className="portfolios-page">
      <div className="portfolio-header">
        <h1>Portfolios</h1>
        <button onClick={openCreatePortfolioModal} className="add-portfolio-btn">
          <FaPlus />
        </button>
      </div>

      {portfolios.length === 0 ? (
        <p>You do not have any portfolios yet.</p>
      ) : (
        // 2) A UL container for items
        <ul className="portfolio-list-container">
          {portfolios.map((portfolio) => (
            <li key={portfolio.id} className="portfolio-item">
              <Link to={`/portfolios/${portfolio.id}`} className="portfolio-link">
                <h3>{portfolio.name}</h3>
                <p>Balance: ${portfolio.portfolio_balance.toFixed(2)}</p>
              </Link>
              <button
                className="delete-portfolio-row-btn"
                onClick={() => openDeleteModal(portfolio)}
              >
                Delete Portfolio
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
