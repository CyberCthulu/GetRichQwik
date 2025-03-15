// src/redux/stocks.js
import { csrfFetch } from "./csrf";

/** Action Types **/
const LOAD_STOCKS = "stocks/loadStocks";
const LOAD_ONE_STOCK = "stocks/loadOneStock";
const LOAD_RECENT_STOCKS = "stocks/loadRecentStocks";

/** Action Creators **/
const loadStocks = (stocks) => ({ type: LOAD_STOCKS, stocks });
const loadOneStock = (stock) => ({ type: LOAD_ONE_STOCK, stock });
const loadRecentStocks = (stocks) => ({ type: LOAD_RECENT_STOCKS, stocks });

/** Thunks **/
// GET all stocks or optionally search (if searchParams exists)
export const thunkLoadStocks = (searchParams) => async (dispatch) => {
  let url = "/api/stocks";
  // e.g. ?ticker=AAPL or ?company=Apple
  if (searchParams) url += `?${new URLSearchParams(searchParams).toString()}`;

  const res = await csrfFetch(url);
  if (res.ok) {
    const data = await res.json(); // { stocks: [...] }
    dispatch(loadStocks(data.stocks));
  }
};

// GET one stock by id
export const thunkLoadOneStock = (stockId) => async (dispatch) => {
  const res = await csrfFetch(`/api/stocks/${stockId}`);
  if (res.ok) {
    const data = await res.json(); // { stock: {...} }
    dispatch(loadOneStock(data.stock));
  }
};

// GET recently searched stocks
export const thunkLoadRecentStocks = () => async (dispatch) => {
  const res = await csrfFetch(`/api/stocks/recent`);
  if (res.ok) {
    const data = await res.json(); // { stocks: [...] }
    dispatch(loadRecentStocks(data.stocks));
  }
};

/** Reducer **/
// The state now holds two keys: 
// - byId: a dictionary mapping stock id to stock data,
// - recent: an array of recently viewed stocks.
const initialState = { byId: {}, recent: [] };

export default function stocksReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_STOCKS: {
      const newById = {};
      action.stocks.forEach((s) => {
        newById[s.id] = s;
      });
      return { ...state, byId: newById };
    }
    case LOAD_ONE_STOCK:
      return {
        ...state,
        byId: { ...state.byId, [action.stock.id]: action.stock },
      };
    case LOAD_RECENT_STOCKS:
      return { ...state, recent: action.stocks };
    default:
      return state;
  }
}
