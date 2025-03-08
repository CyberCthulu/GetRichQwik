// src/components/Profile/UpdateCashBalanceModal.jsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import { thunkUpdateUser } from "../../redux/users";

export default function UpdateCashBalanceModal({ user, onClose }) {
  const dispatch = useDispatch();

  // We'll store the "amount to add" rather than the full new balance.
  const [amountToAdd, setAmountToAdd] = useState("0.00");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Convert user.cash_balance (string) and amountToAdd to numbers
    const currentBalance = parseFloat(user.cash_balance) || 0;
    const addAmount = parseFloat(amountToAdd) || 0;

    // Disallow negative or zero amounts
    if (addAmount <= 0) {
      setErrors({ general: "Please enter a positive amount." });
      return;
    }

    // New total is the sum of the current balance and the entered amount
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
    <div className="update-cash-balance-modal">
      <h2>Increase Cash Balance</h2>
      {errors.general && <p className="error">{errors.general}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Amount to Add</label>
          <input
            type="number"
            step="0.01"
            value={amountToAdd}
            onChange={(e) => setAmountToAdd(e.target.value)}
            min="0.01" // Basic HTML validation
            required
          />
        </div>
        <button type="submit">Add Funds</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
}
