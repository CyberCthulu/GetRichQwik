// src/components/Watchlists/RemoveWatchlistConfirmationModal.jsx
import { useDispatch } from "react-redux";
import { thunkDeleteWatchlist } from "../../redux/watchlists";

export default function RemoveWatchlistConfirmationModal({ watchlistId, watchlistName, onClose }) {
  const dispatch = useDispatch();

  const handleConfirm = async () => {
    await dispatch(thunkDeleteWatchlist(watchlistId));
    onClose();
  };

  return (
    <div className="remove-watchlist-modal">
      <h2>Confirm Deletion</h2>
      <p>Are you sure you want to delete the watchlist "{watchlistName}"?</p>
      <div className="modal-actions">
        <button onClick={handleConfirm}>Yes, Delete</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
