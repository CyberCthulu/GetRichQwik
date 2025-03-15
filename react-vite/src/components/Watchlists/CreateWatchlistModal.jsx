// src/components/Watchlists/CreateWatchlistModal.jsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import { thunkCreateWatchlist } from "../../redux/watchlists";

export default function CreateWatchlistModal({ onClose }) {
  const dispatch = useDispatch();
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // dispatch the thunk
    await dispatch(thunkCreateWatchlist({ name }));
    onClose();
  };

  return (
    <div className="create-watchlist-modal">
      <h2>Create New Watchlist</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Watchlist Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <div className="modal-actions">
          <button type="submit">Create</button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
