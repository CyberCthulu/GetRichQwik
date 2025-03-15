// src/components/Profile/UpdateCashBalanceModal.jsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import { thunkUpdateUser } from "../../redux/users";
import "./UpdateCashBalanceModal.css"; // Shared modal styles

export default function UpdateCashBalanceModal({ user, onClose }) {
  const dispatch = useDispatch();
  const [amountToAdd, setAmountToAdd] = useState("0.00");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const currentBalance = parseFloat(user.cash_balance) || 0;
    const addAmount = parseFloat(amountToAdd) || 0;

    if (addAmount <= 0) {
      setErrors({ general: "Please enter a positive amount." });
      return;
    }

    const newBalance = currentBalance + addAmount;

    try {
      const updatedUser = await dispatch(
        thunkUpdateUser(user.id, { cash_balance: newBalance })
      );
      if (updatedUser) {
        onClose();
      }
    } catch (err) {
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
    <div className="modal-container update-cash-balance-modal">
      <h2>Increase Cash Balance</h2>
      {errors.general && <p className="error">{errors.general}</p>}
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-group">
          <label>Amount to Add</label>
          <div className="input-wrapper">
            <span className="dollar-sign">$</span>
            <input
              type="number"
              step="0.01"
              value={amountToAdd}
              onChange={(e) => setAmountToAdd(e.target.value)}
              min="0.01"
              required
            />
          </div>
        </div>
        <div className="modal-actions">
          <button type="submit" className="modal-submit-btn">Add Funds</button>
          <button type="button" className="modal-cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
