// src/components/Portfolios/DeletePortfolioModal.jsx
import { useDispatch } from "react-redux";
import { thunkDeletePortfolio } from "../../redux/portfolios";
// import "./DeletePortfolioModal.css"; // see styling below

export default function DeletePortfolioModal({
  portfolioId,
  portfolioName,
  onClose,
  onSuccess,
}) {
  const dispatch = useDispatch();

  const handleConfirm = async () => {
    // 1) Dispatch the thunk to delete the portfolio
    await dispatch(thunkDeletePortfolio(portfolioId));
    // 2) Optionally call onSuccess callback (e.g., to navigate)
    if (typeof onSuccess === "function") {
      onSuccess();
    }
    // 3) Close the modal
    onClose();
  };

  return (
    <div className="delete-portfolio-modal">
      <h2>Confirm Deletion</h2>
      <p>
        Are you sure you want to delete <strong>"{portfolioName}"</strong>?
      </p>
      <p>This action cannot be undone.</p>
      <div className="modal-actions">
        <button onClick={handleConfirm} className="confirm-delete-btn">
          Yes, Delete
        </button>
        <button onClick={onClose} className="cancel-delete-btn">
          Cancel
        </button>
      </div>
    </div>
  );
}
