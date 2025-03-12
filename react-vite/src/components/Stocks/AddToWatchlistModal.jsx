// src/components/StockDetail/AddToWatchlistModal.jsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  thunkLoadWatchlists,
  thunkAddStockToWatchlist,
} from "../../redux/watchlists";
import { useModal } from "../../context/Modal"; // import modal context

export default function AddToWatchlistModal({ stockId, onClose }) {
  const dispatch = useDispatch();
  const { closeModal } = useModal();
  // Use onClose if provided; otherwise fallback to closeModal.
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      closeModal();
    }
  };

  const watchlists = useSelector((state) => Object.values(state.watchlists));
  const [selectedWatchlist, setSelectedWatchlist] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(thunkLoadWatchlists());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear any previous errors

    const numericWatchlistId = Number(selectedWatchlist);
    const numericStockId = Number(stockId);

    if (!numericWatchlistId || !numericStockId) {
      setErrors({ general: "Please select a watchlist." });
      return;
    }

    try {
      // Dispatch the thunk to add the stock to the selected watchlist.
      await dispatch(thunkAddStockToWatchlist(numericWatchlistId, numericStockId));
      // Unconditionally close the modal on success.
      handleClose();
    } catch (err) {
      // Handle server or network errors
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
    <div className="add-to-watchlist-modal">
      <h2>Add Stock to Watchlist</h2>
      {errors.general && <p className="error">{errors.general}</p>}
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
        {errors.watchlist && <p className="error">{errors.watchlist}</p>}
        <button type="submit">Add</button>
        <button type="button" onClick={handleClose}>
          Cancel
        </button>
      </form>
    </div>
  );
}
