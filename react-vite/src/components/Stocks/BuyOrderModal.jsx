// src/components/StockDetail/BuyOrderModal.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { thunkCreateOrder } from "../../redux/orders";
import { thunkLoadPortfolios } from "../../redux/portfolios";
import { useModal } from "../../context/Modal";

export default function BuyOrderModal({ stockId, onClose }) {
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  const [quantity, setQuantity] = useState(1);
  const [isLimitOrder, setIsLimitOrder] = useState(false);
  const [limitPrice, setLimitPrice] = useState("");
  const [selectedPortfolio, setSelectedPortfolio] = useState("");
  const [errors, setErrors] = useState({});

  // Get portfolios and session user from Redux
  const portfolios = useSelector((state) => Object.values(state.portfolios));
  const sessionUser = useSelector((state) => state.session.user);

  // Load portfolios when the modal mounts
  useEffect(() => {
    if (sessionUser) {
      dispatch(thunkLoadPortfolios());
    }
  }, [dispatch, sessionUser]);

  // Use the passed onClose prop if available; otherwise fallback to closeModal.
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      closeModal();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors

    if (!selectedPortfolio) {
      alert("Please select a portfolio.");
      return;
    }

    // Construct payload: Always use "buy" for order_type.
    const payload = {
      portfolio_id: Number(selectedPortfolio),
      stock_id: Number(stockId),
      order_type: "buy",
      quantity: parseFloat(quantity),
      target_price: isLimitOrder ? parseFloat(limitPrice) : null,
      scheduled_time: null, // Extend as needed
    };

    try {
      const response = await dispatch(thunkCreateOrder(payload));

      if (response?.errors) {
        setErrors(response.errors);
      } else if (response?.message) {
        setErrors({ server: response.message });
      } else {
        // Success, close modal
        handleClose();
      }
    } catch (error) {
      console.error("Order creation error:", error);
      if (error?.message) {
        setErrors({ server: error.message });
      } else if (error?.errors) {
        setErrors(error.errors);
      } else {
        setErrors({ server: "Unexpected error. Please try again." });
      }
    }
  };

  return (
    <div className="buy-order-modal">
      <h2>Review Order</h2>
      {/* Display server-level error if any */}
      {errors.server && <p className="error-message">{errors.server}</p>}
      
      <form onSubmit={handleSubmit}>
        <label>Quantity:</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="1"
          required
        />
        {errors.quantity && <p className="error-message">{errors.quantity}</p>}

        <label>Order Type:</label>
        <select
          value={isLimitOrder ? "limit" : "market"}
          onChange={(e) => setIsLimitOrder(e.target.value === "limit")}
        >
          <option value="market">Market</option>
          <option value="limit">Limit</option>
        </select>

        {isLimitOrder && (
          <>
            <label>Limit Price:</label>
            <input
              type="number"
              step="0.01"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              required
            />
            {errors.limitPrice && (
              <p className="error-message">{errors.limitPrice}</p>
            )}
          </>
        )}

        <label>Portfolio:</label>
        <select
          value={selectedPortfolio}
          onChange={(e) => setSelectedPortfolio(e.target.value)}
          required
        >
          <option value="">-- Select a Portfolio --</option>
          {portfolios.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (Balance: ${Number(p.portfolio_balance).toFixed(2)})
            </option>
          ))}
        </select>

        <button type="submit">Place Order</button>
        <button type="button" onClick={handleClose}>
          Cancel
        </button>
      </form>
    </div>
  );
}
