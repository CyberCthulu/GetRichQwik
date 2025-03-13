// RemoveStockConfirmationModal.jsx
import { useDispatch } from "react-redux";
import { thunkRemoveStockFromWatchlist } from "../../redux/watchlists";

export default function RemoveStockConfirmationModal({ watchlistId, stock, onClose }) {
  const dispatch = useDispatch();

  const handleConfirm = async () => {
    await dispatch(thunkRemoveStockFromWatchlist(watchlistId, stock.id));
    onClose();
  };

  return (
    <div className="remove-stock-modal">
      <h2>Confirm Removal</h2>
      <p>
        Are you sure you want to remove <strong>{stock.company_name}</strong>{" "}
        from this watchlist?
      </p>
      <div className="modal-actions">
        <button onClick={handleConfirm}>Yes, Remove</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
