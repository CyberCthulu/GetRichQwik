// src/components/Watchlists/RemoveStockConfirmationModal.jsx
import { useDispatch } from "react-redux";
import { thunkRemoveStockFromWatchlist } from "../../redux/watchlists";

export default function RemoveStockConfirmationModal({ watchlistId, stockId, onClose }) {
  const dispatch = useDispatch();

  const handleConfirm = async () => {
    await dispatch(thunkRemoveStockFromWatchlist(watchlistId, stockId));
    onClose();
  };

  return (
    <div className="remove-stock-modal">
      <h2>Confirm Removal</h2>
      <p>Are you sure you want to remove stock {stockId} from this watchlist?</p>
      <div className="modal-actions">
        <button onClick={handleConfirm}>Yes, Remove</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
