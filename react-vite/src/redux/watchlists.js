// src/redux/watchlists.js
import { csrfFetch } from "./csrf";

/** Action Types **/
const LOAD_WATCHLISTS = "watchlists/loadWatchlists";
const ADD_WATCHLIST = "watchlists/addWatchlist";
const UPDATE_WATCHLIST = "watchlists/updateWatchlist";
const REMOVE_WATCHLIST = "watchlists/removeWatchlist";
const ADD_STOCK_TO_WATCHLIST = "watchlists/addStockToWatchlist";
const REMOVE_STOCK_FROM_WATCHLIST = "watchlists/removeStockFromWatchlist";

/** Action Creators **/
const loadWatchlists = (watchlists) => ({ type: LOAD_WATCHLISTS, watchlists });
const addWatchlist = (watchlist) => ({ type: ADD_WATCHLIST, watchlist });
const updateWatchlistAction = (watchlist) => ({ type: UPDATE_WATCHLIST, watchlist });
const removeWatchlist = (watchlistId) => ({ type: REMOVE_WATCHLIST, watchlistId });
const addStock = (watchlistId, stockId) => ({
  type: ADD_STOCK_TO_WATCHLIST,
  watchlistId,
  stockId,
});
const removeStock = (watchlistId, stockId) => ({
  type: REMOVE_STOCK_FROM_WATCHLIST,
  watchlistId,
  stockId,
});

/** Thunks **/
// GET watchlists for user
export const thunkLoadWatchlists = () => async (dispatch) => {
  const res = await csrfFetch("/api/users/watchlists");
  if (res.ok) {
    const data = await res.json(); // { watchlists: [...] }
    dispatch(loadWatchlists(data.watchlists));
  }
};

// POST create watchlist
export const thunkCreateWatchlist = (payload) => async (dispatch) => {
  const res = await csrfFetch("/api/watchlists", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (res.ok) {
    const data = await res.json(); // { watchlist: {...} }
    dispatch(addWatchlist(data.watchlist));
    return data.watchlist;
  }
};

// PUT update watchlist
export const thunkUpdateWatchlist = (watchlistId, payload) => async (dispatch) => {
  const res = await csrfFetch(`/api/watchlists/${watchlistId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (res.ok) {
    const data = await res.json();
    dispatch(updateWatchlistAction(data.watchlist));
    return data.watchlist;
  }
};

// DELETE watchlist
export const thunkDeleteWatchlist = (watchlistId) => async (dispatch) => {
  const res = await csrfFetch(`/api/watchlists/${watchlistId}`, {
    method: "DELETE",
  });
  if (res.ok) {
    dispatch(removeWatchlist(watchlistId));
  }
};

// POST add stock to watchlist
export const thunkAddStockToWatchlist = (watchlistId, stockId) => async (dispatch) => {
  const res = await csrfFetch(`/api/watchlists/${watchlistId}/stocks`, {
    method: "POST",
    body: JSON.stringify({ stock_id: stockId }),
  });
  if (res.ok) {
    dispatch(addStock(watchlistId, stockId));
  }
};

// DELETE remove stock from watchlist
export const thunkRemoveStockFromWatchlist = (watchlistId, stockId) => async (dispatch) => {
  const res = await csrfFetch(`/api/watchlists/${watchlistId}/stocks/${stockId}`, {
    method: "DELETE",
  });
  if (res.ok) {
    dispatch(removeStock(watchlistId, stockId));
  }
};

/** Reducer **/
export default function watchlistsReducer(state = {}, action) {
  switch (action.type) {
    case LOAD_WATCHLISTS: {
      const newState = {};
      action.watchlists.forEach((wl) => {
        newState[wl.id] = wl;
      });
      return newState;
    }
    case ADD_WATCHLIST:
    case UPDATE_WATCHLIST:
      return { ...state, [action.watchlist.id]: action.watchlist };
    case REMOVE_WATCHLIST: {
      const newState = { ...state };
      delete newState[action.watchlistId];
      return newState;
    }
    case ADD_STOCK_TO_WATCHLIST: {
      const { watchlistId, stockId } = action;
      const watchlist = state[watchlistId];
      if (!watchlist) return state;
      return {
        ...state,
        [watchlistId]: {
          ...watchlist,
          stocks: [...(watchlist.stocks || []), stockId],
        },
      };
    }
    case REMOVE_STOCK_FROM_WATCHLIST: {
      const { watchlistId, stockId } = action;
      const watchlist = state[watchlistId];
      if (!watchlist) return state;
      return {
        ...state,
        [watchlistId]: {
          ...watchlist,
          stocks: (watchlist.stocks || []).filter((id) => id !== stockId),
        },
      };
    }
    default:
      return state;
  }
}
