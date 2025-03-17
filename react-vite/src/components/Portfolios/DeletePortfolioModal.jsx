// src/components/Portfolios/DeletePortfolioModal.jsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import { thunkDeletePortfolio } from "../../redux/portfolios";

export default function DeletePortfolioModal({
  portfolioId,
  portfolioName,
  onClose,
  onSuccess,
}) {
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});

  const handleConfirm = async () => {
    try {
      // Attempt to delete the portfolio.
      const response = await dispatch(thunkDeletePortfolio(portfolioId));
      // If deletion is successful, call onSuccess (for navigation, etc.)
      if (typeof onSuccess === "function") {
        onSuccess();
      }
      // Close the modal only on success.
      onClose();
    } catch (error) {
      // Log and set errors to display in the modal.
      console.error("Delete portfolio error:", error);
      // We assume error is an object like: { message: "Portfolio deletion error", errors: { holdings: "Please liquidate all holdings ..." } }
      if (error?.message) {
        setErrors({ server: error.message, ...error.errors });
      } else if (error?.errors) {
        setErrors(error.errors);
      } else {
        setErrors({ server: "Unexpected error. Please try again." });
      }
    }
  };

  return (
    <div className="delete-portfolio-modal">
      <h2>Confirm Deletion</h2>
      <p>
        Are you sure you want to delete <strong>"{portfolioName}"</strong>?
      </p>
      <p>This action cannot be undone.</p>
      {/* Display error messages if any */}
      {errors.server && <p className="error-message">{errors.server}</p>}
      {errors.holdings && <p className="error-message">{errors.holdings}</p>}
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
