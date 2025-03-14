// src/components/Portfolios/CreatePortfolioModal.jsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import { thunkCreatePortfolio } from "../../redux/portfolios";

export default function CreatePortfolioModal({ onClose }) {
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Convert balance to a number; if it's invalid or empty, default to 0.
    const portfolio_balance = Number(balance) || 0;

    // Clear any previous errors
    setErrors({});

    try {
      // Dispatch the create portfolio thunk using the correct endpoint
      // (Assuming your backend POST endpoint is /api/portfolios/ with a trailing slash)
      const newPortfolio = await dispatch(
        thunkCreatePortfolio({ name, portfolio_balance })
      );
      if (newPortfolio) {
        // On success, close the modal.
        onClose();
      }
    } catch (err) {
      // Check if the error is a Response object (i.e. has a .json method)
      if (err && typeof err.json === "function") {
        try {
          const errorResponse = await err.json();
          setErrors(
            errorResponse.errors ||
              { general: errorResponse.message || "An error occurred." }
          );
        } catch (parseError) {
          setErrors({ general: "An unexpected error occurred. Please try again." });
        }
      } else {
        console.error("Network or unknown error:", err);
        setErrors({ general: "A network error occurred. Please try again." });
      }
    }
  };

  return (
    <div className="create-portfolio-modal">
      <h2>Create New Portfolio</h2>
      {errors.general && <p className="error">{errors.general}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="portfolio-name">Portfolio Name</label>
          <input
            id="portfolio-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {errors.name && <p className="error">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="initial-balance">Initial Balance</label>
          <input
            id="initial-balance"
            type="number"
            step="0.01"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            required
          />
          {errors.portfolio_balance && (
            <p className="error">{errors.portfolio_balance}</p>
          )}
        </div>
        <button type="submit">Create Portfolio</button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
}
