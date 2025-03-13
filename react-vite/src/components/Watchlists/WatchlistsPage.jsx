// src/components/Watchlists/WatchlistsPage.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  thunkLoadWatchlists,
  thunkLoadOneWatchlist,
  thunkDeleteWatchlist,
} from "../../redux/watchlists";
import { useModal } from "../../context/Modal";
import RemoveStockConfirmationModal from "./RemoveStockConfirmationModal";
// Example icons from react-icons
import { FaCaretUp, FaCaretDown, FaPlus, FaTimes } from "react-icons/fa";
// import "./WatchlistsPage.css"; // If you have styles

// EXAMPLE: a confirm deletion modal for the watchlist
function ConfirmWatchlistDeletionModal({ watchlistId, onClose }) {
  const dispatch = useDispatch();

  const handleConfirm = async () => {
    await dispatch(thunkDeleteWatchlist(watchlistId));
    onClose();
  };

  return (
    <div className="confirm-watchlist-deletion-modal">
      <h2>Delete Watchlist</h2>
      <p>Are you sure you want to delete this entire watchlist?</p>
      <div className="modal-actions">
        <button onClick={handleConfirm}>Yes, Delete</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

// EXAMPLE: a create watchlist modal
function CreateWatchlistModal({ onClose }) {
  const dispatch = useDispatch();
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // e.g. dispatch a thunk to create the watchlist
    // then close the modal
    // await dispatch(thunkCreateWatchlist({ name }));
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
          <button onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default function WatchlistsPage() {
  const dispatch = useDispatch();
  const watchlists = useSelector((state) => Object.values(state.watchlists));
  const { setModalContent } = useModal();

  // Keep track of which watchlists are expanded
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    dispatch(thunkLoadWatchlists());
  }, [dispatch]);

  // Toggle a watchlist open/closed
  const toggleWatchlist = async (watchlistId) => {
    setExpanded((prev) => ({ ...prev, [watchlistId]: !prev[watchlistId] }));
    // If we’re expanding, load the full data for that watchlist
    if (!expanded[watchlistId]) {
      await dispatch(thunkLoadOneWatchlist(watchlistId));
    }
  };

  // Show a modal to confirm entire watchlist deletion
  const handleDeleteWatchlist = (watchlistId) => {
    setModalContent(
      <ConfirmWatchlistDeletionModal
        watchlistId={watchlistId}
        onClose={() => setModalContent(null)}
      />
    );
  };

  // Show a modal to remove a single stock
  const handleRemoveStock = (watchlistId, stock) => {
    setModalContent(
      <RemoveStockConfirmationModal
        watchlistId={watchlistId}
        stock={stock}
        onClose={() => setModalContent(null)}
      />
    );
  };

  // Show a modal to create a new watchlist
  const handleCreateWatchlist = () => {
    setModalContent(
      <CreateWatchlistModal
        onClose={() => setModalContent(null)}
      />
    );
  };

  return (
    <div className="watchlists-page">
      {/* Header with “My Watchlists” and a “+” button */}
      <div className="watchlists-header">
        <h1>My Watchlists</h1>
        <button className="create-watchlist-btn" onClick={handleCreateWatchlist}>
          <FaPlus />
        </button>
      </div>

      {watchlists.length === 0 ? (
        <p>You do not have any watchlists yet.</p>
      ) : (
        watchlists.map((wl) => (
          <div key={wl.id} className="watchlist-item">
            <div className="watchlist-header">
              {/* Title + caret toggler */}
              <div className="watchlist-name" onClick={() => toggleWatchlist(wl.id)}>
                <h2>{wl.name}</h2>
                <button className="toggle-button">
                  {expanded[wl.id] ? <FaCaretUp /> : <FaCaretDown />}
                </button>
              </div>

              {/* X button to delete entire watchlist */}
              <button
                className="delete-watchlist-btn"
                onClick={() => handleDeleteWatchlist(wl.id)}
              >
                <FaTimes />
              </button>
            </div>

            {/* Expand/collapse the watchlist’s stocks */}
            {expanded[wl.id] && (
              <ul className="watchlist-stocks">
                {wl.stocks && wl.stocks.length > 0 ? (
                  wl.stocks.map((stock) => (
                    <li key={stock.id} className="watchlist-stock-item">
                      <span>
                        {stock.ticker_symbol} / {stock.company_name}
                      </span>
                      <button
                        onClick={() => handleRemoveStock(wl.id, stock)}
                        className="remove-stock-btn"
                      >
                        Remove
                      </button>
                    </li>
                  ))
                ) : (
                  <p>No stocks in this watchlist.</p>
                )}
              </ul>
            )}
          </div>
        ))
      )}
    </div>
  );
}
