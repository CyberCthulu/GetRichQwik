// src/components/StockDetail/BuyOrderModal.jsx
import { useState } from "react";
import { useDispatch } from "react-redux";
// import { thunkCreateOrder } from "../../redux/orders";

export default function BuyOrderModal({ stockId, onClose }) {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(0);
  const [orderType, setOrderType] = useState("market");
  const [limitPrice, setLimitPrice] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // dispatch(thunkCreateOrder({ stock_id: stockId, quantity, orderType, limitPrice }));
    if (onClose) onClose();
  };

  return (
    <div className="buy-order-modal">
      <h2>Review Order</h2>
      <form onSubmit={handleSubmit}>
        <label>Quantity:</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="1"
          required
        />

        <label>Order Type:</label>
        <select
          value={orderType}
          onChange={(e) => setOrderType(e.target.value)}
        >
          <option value="market">Market</option>
          <option value="limit">Limit</option>
        </select>

        {orderType === "limit" && (
          <>
            <label>Limit Price:</label>
            <input
              type="number"
              step="0.01"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
            />
          </>
        )}

        <button type="submit">Place Order</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
}
