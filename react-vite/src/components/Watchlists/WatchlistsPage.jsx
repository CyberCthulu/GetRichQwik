// src/components/Watchlists/WatchlistsPage.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { thunkLoadWatchlists, thunkLoadOneWatchlist } from "../../redux/watchlists";
import { useModal } from "../../context/Modal";
import RemoveStockConfirmationModal from "./RemoveStockConfirmationModal";
import { FaCaretUp, FaCaretDown } from "react-icons/fa";
// import "./WatchlistsPage.css";

export default function WatchlistsPage() {
  const dispatch = useDispatch();
  const watchlists = useSelector((state) => Object.values(state.watchlists));
  const { setModalContent } = useModal();
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    dispatch(thunkLoadWatchlists());
  }, [dispatch]);

  const toggleWatchlist = async (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    // If expanding, load detailed data for the watchlist:
    if (!expanded[id]) {
      await dispatch(thunkLoadOneWatchlist(id));
    }
  };

  const handleRemoveStock = (watchlistId, stockId) => {
    setModalContent(
      <RemoveStockConfirmationModal
        watchlistId={watchlistId}
        stockId={stockId}
        onClose={() => setModalContent(null)}
      />
    );
  };

  return (
    <div className="watchlists-page">
      <h1>My Watchlists</h1>
      {watchlists.length === 0 ? (
        <p>You do not have any watchlists yet.</p>
      ) : (
        watchlists.map((wl) => (
          <div key={wl.id} className="watchlist-item">
            <div className="watchlist-header" onClick={() => toggleWatchlist(wl.id)}>
              <h2>{wl.name}</h2>
              <button className="toggle-button">
                {expanded[wl.id] ? <FaCaretUp /> : <FaCaretDown />}
              </button>
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
                        onClick={() => handleRemoveStock(wl.id, stock.id)}
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
