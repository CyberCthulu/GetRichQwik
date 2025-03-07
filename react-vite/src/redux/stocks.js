// src/redux/stocks.js
import { csrfFetch } from "./csrf";

/** Action Types **/
const LOAD_STOCKS = "stocks/loadStocks";
const LOAD_ONE_STOCK = "stocks/loadOneStock";

/** Action Creators **/
const loadStocks = (stocks) => ({ type: LOAD_STOCKS, stocks });
const loadOneStock = (stock) => ({ type: LOAD_ONE_STOCK, stock });

/** Thunks **/
// GET all stocks or optionally search
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

// GET one stock
export const thunkLoadOneStock = (stockId) => async (dispatch) => {
  const res = await csrfFetch(`/api/stocks/${stockId}`);
  if (res.ok) {
    const data = await res.json(); // { stock: {...} }
    dispatch(loadOneStock(data.stock));
  }
};

/** Reducer **/
export default function stocksReducer(state = {}, action) {
  switch (action.type) {
    case LOAD_STOCKS: {
      const newState = {};
      action.stocks.forEach((s) => {
        newState[s.id] = s;
      });
      return newState;
    }
    case LOAD_ONE_STOCK:
      return { ...state, [action.stock.id]: action.stock };
    default:
      return state;
  }
}
