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
import CreateWatchlistModal from "./CreateWatchlistModal"; // <-- Import the real component here
import { FaCaretUp, FaCaretDown, FaPlus } from "react-icons/fa";
import "./WatchlistsPage.css";

// A confirm-deletion modal for the entire watchlist
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

export default function WatchlistsPage() {
  const dispatch = useDispatch();
  const watchlists = useSelector((state) => Object.values(state.watchlists));
  const { setModalContent } = useModal();

  // Track expanded/collapsed watchlists
  const [expanded, setExpanded] = useState({});

  // Load all watchlists on mount
  useEffect(() => {
    dispatch(thunkLoadWatchlists());
  }, [dispatch]);

  // Expand/collapse a watchlist; if expanding, load its details
  const toggleWatchlist = async (watchlistId) => {
    setExpanded((prev) => ({ ...prev, [watchlistId]: !prev[watchlistId] }));
    if (!expanded[watchlistId]) {
      await dispatch(thunkLoadOneWatchlist(watchlistId));
    }
  };

  // Show modal to confirm watchlist deletion
  const handleDeleteWatchlist = (watchlistId) => {
    setModalContent(
      <ConfirmWatchlistDeletionModal
        watchlistId={watchlistId}
        onClose={() => setModalContent(null)}
      />
    );
  };

  // Show modal to remove a single stock from a watchlist
  const handleRemoveStock = (watchlistId, stock) => {
    setModalContent(
      <RemoveStockConfirmationModal
        watchlistId={watchlistId}
        stock={stock}
        onClose={() => setModalContent(null)}
      />
    );
  };

  // Show the real CreateWatchlistModal (which calls thunkCreateWatchlist)
  const handleCreateWatchlist = () => {
    setModalContent(<CreateWatchlistModal onClose={() => setModalContent(null)} />);
  };

  return (
    <div className="watchlists-page">
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
              {/* Watchlist name on the left */}
              <h2 className="watchlist-name">{wl.name}</h2>

              {/* Delete & toggle on the right */}
              <div className="watchlist-actions">
                <button
                  className="delete-watchlist-btn"
                  onClick={() => handleDeleteWatchlist(wl.id)}
                >
                  Delete Watchlist
                </button>
                <button
                  className="toggle-button"
                  onClick={() => toggleWatchlist(wl.id)}
                >
                  {expanded[wl.id] ? <FaCaretUp /> : <FaCaretDown />}
                </button>
              </div>
            </div>

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
