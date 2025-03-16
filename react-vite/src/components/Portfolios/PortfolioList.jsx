// src/components/Portfolios/PortfolioList.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { thunkLoadPortfolios } from "../../redux/portfolios";
import { Link } from "react-router-dom";
import { useModal } from "../../context/Modal";
import CreatePortfolioModal from "./CreatePortfolioModal";
import DeletePortfolioModal from "./DeletePortfolioModal";
import { FaPlus } from "react-icons/fa";
import socket from "../../socket"; // Shared Socket.IO instance
import "./PortfolioList.css";

export default function PortfolioList() {
  const dispatch = useDispatch();
  const { setModalContent } = useModal();
  const portfolios = useSelector((state) => Object.values(state.portfolios));

  // Initial HTTP load on mount
  useEffect(() => {
    dispatch(thunkLoadPortfolios());
  }, [dispatch]);

  // Subscribe to live portfolio list updates via WebSocket.
  useEffect(() => {
    socket.emit("subscribe_portfolio_list");
    socket.on("portfolio_list_update", (data) => {
      // Dispatch an action to update the portfolios in Redux.
      dispatch({ type: "UPDATE_PORTFOLIOS", payload: data });
    });
    return () => {
      socket.off("portfolio_list_update");
    };
  }, [dispatch]);

  const openCreatePortfolioModal = () => {
    setModalContent(
      <CreatePortfolioModal onClose={() => setModalContent(null)} />
    );
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
        <ul className="portfolio-list-container">
          {portfolios.map((portfolio) => (
            <li key={portfolio.id} className="portfolio-item">
              <Link to={`/portfolios/${portfolio.id}`} className="portfolio-link">
                <h3>{portfolio.name}</h3>
                <p>Total Portfolio Value: ${portfolio.portfolio_value.toFixed(2)}</p>
                <p>Balance: ${portfolio.portfolio_balance.toFixed(2)}</p>
                <p>
                  Gains/Losses: $
                  {portfolio.gains_loss !== undefined
                    ? Number(portfolio.gains_loss).toFixed(2)
                    : "0.00"}
                </p>
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
