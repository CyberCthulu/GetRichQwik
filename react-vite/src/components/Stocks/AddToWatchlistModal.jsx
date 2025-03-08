// src/components/StockDetail/AddToWatchlistModal.jsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { thunkLoadWatchlists, thunkAddStockToWatchlist } from "../../redux/watchlists";

export default function AddToWatchlistModal({ stockId, onClose }) {
  const dispatch = useDispatch();
  const watchlists = useSelector((state) => Object.values(state.watchlists));
  const [selectedWatchlist, setSelectedWatchlist] = useState("");

  useEffect(() => {
    dispatch(thunkLoadWatchlists());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert selectedWatchlist and stockId to numbers before dispatching.
    const numericWatchlistId = Number(selectedWatchlist);
    const numericStockId = Number(stockId);

    if (!numericWatchlistId || !numericStockId) {
      // In case conversion fails or no watchlist is selected.
      return;
    }

    dispatch(thunkAddStockToWatchlist(numericWatchlistId, numericStockId));
    if (onClose) onClose();
  };

  return (
    <div className="add-to-watchlist-modal">
      <h2>Add Stock to Watchlist</h2>
      <form onSubmit={handleSubmit}>
        <label>Select Watchlist:</label>
        <select
          value={selectedWatchlist}
          onChange={(e) => setSelectedWatchlist(e.target.value)}
          required
        >
          <option value="">--Choose Watchlist--</option>
          {watchlists.map((wl) => (
            <option key={wl.id} value={wl.id}>
              {wl.name}
            </option>
          ))}
        </select>
        <button type="submit">Add</button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
}
