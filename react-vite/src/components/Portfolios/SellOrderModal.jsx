// src/components/Portfolios/SellOrderModal.jsx
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { thunkCreateOrder } from "../../redux/orders";
import { useModal } from "../../context/Modal";

function SellOrderModal({ stockId, portfolioId, onClose }) {
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  const [quantity, setQuantity] = useState(1);
  const [isLimitOrder, setIsLimitOrder] = useState(false);
  const [limitPrice, setLimitPrice] = useState("");
  const [errors, setErrors] = useState({});

  // If you need to load more data here, do so.
  useEffect(() => {
    // For example, if you wanted to load the portfolio or other data
    // dispatch(thunkLoadPortfolios());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // clear previous errors

    // Construct payload using the provided portfolioId
    const payload = {
      portfolio_id: Number(portfolioId),
      stock_id: Number(stockId),
      order_type: "sell",
      quantity: parseFloat(quantity),
      target_price: isLimitOrder ? parseFloat(limitPrice) : null,
      scheduled_time: null,
    };

    try {
      // The thunk may return an object or throw if the response isn't OK
      const response = await dispatch(thunkCreateOrder(payload));

      // If the thunk returns an object with errors or message:
      if (response?.errors) {
        setErrors(response.errors);
      } else if (response?.message) {
        setErrors({ server: response.message });
      } else {
        // If no errors, close the modal
        onClose ? onClose() : closeModal();
      }
    } catch (error) {
      // The thunk throws errorData if the response isn't ok
      console.error("Order creation error:", error);

      // If the backend returns something like { message: "Market is closed..." }
      // handle it here
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
    <div className="sell-order-modal">
      <h2>Sell Stock</h2>

      {/* Display server or field-specific errors */}
      {errors.server && <p className="error-message">{errors.server}</p>}

      <form onSubmit={handleSubmit}>
        <label>
          Quantity:
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </label>
        {errors.quantity && <p className="error-message">{errors.quantity}</p>}

        <label>
          Order Type:
          <select
            value={isLimitOrder ? "limit" : "market"}
            onChange={(e) => setIsLimitOrder(e.target.value === "limit")}
          >
            <option value="market">Market</option>
            <option value="limit">Limit</option>
          </select>
        </label>

        {isLimitOrder && (
          <>
            <label>
              Limit Price:
              <input
                type="number"
                step="0.01"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                required
              />
            </label>
            {errors.limitPrice && (
              <p className="error-message">{errors.limitPrice}</p>
            )}
          </>
        )}

        {/* We removed the portfolio dropdown so we always use portfolioId */}
        <button type="submit">Sell Stock</button>
        <button type="button" onClick={onClose || closeModal}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default SellOrderModal;
