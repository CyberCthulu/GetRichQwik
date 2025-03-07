// src/redux/holdings.js
import { csrfFetch } from "./csrf";

// ----------------- Action Types ------------------
const LOAD_HOLDINGS = "holdings/LOAD_HOLDINGS";
const ADD_HOLDING = "holdings/ADD_HOLDING";
const UPDATE_HOLDING = "holdings/UPDATE_HOLDING";
const REMOVE_HOLDING = "holdings/REMOVE_HOLDING";

// ----------------- Action Creators --------------
const loadHoldings = (holdings) => ({
  type: LOAD_HOLDINGS,
  holdings,
});

const addHolding = (holding) => ({
  type: ADD_HOLDING,
  holding,
});

const updateHoldingAction = (holding) => ({
  type: UPDATE_HOLDING,
  holding,
});

const removeHolding = (holdingId) => ({
  type: REMOVE_HOLDING,
  holdingId,
});

// ----------------- Thunks ------------------------

// GET holdings for a portfolio
export const thunkLoadHoldingsForPortfolio = (portfolioId) => async (dispatch) => {
    const res = await csrfFetch(`/api/portfolios/${portfolioId}/holdings`);
    if (res.ok) {
      const data = await res.json(); // { holdings: [...] }
      dispatch(loadHoldings(data.holdings));
    }
  };


// POST create a holding
export const thunkCreateHolding = (portfolioId, payload) => async (dispatch) => {
  const res = await csrfFetch(`/api/portfolios/${portfolioId}/holdings`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (res.ok) {
    const data = await res.json(); // { holding: {...} }
    dispatch(addHolding(data.holding));
    return data.holding;
  }
};


// PUT update holding
export const thunkUpdateHolding = (holdingId, payload) => async (dispatch) => {
    const res = await csrfFetch(`/api/holdings/${holdingId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      dispatch(updateHoldingAction(data.holding));
      return data.holding;
    }
  };

// DELETE holding
export const thunkDeleteHolding = (holdingId) => async (dispatch) => {
    const res = await csrfFetch(`/api/holdings/${holdingId}`, { method: "DELETE" });
    if (res.ok) {
      dispatch(removeHolding(holdingId));
    }
  };

// ----------------- Initial State & Reducer -------
export default function holdingsReducer(state = {}, action) {
  switch (action.type) {
    case LOAD_HOLDINGS: {
      const newState = {};
      action.holdings.forEach((h) => {
        newState[h.id] = h;
      });
      return newState;
    }
    case ADD_HOLDING: {
      return {
        ...state,
        [action.holding.id]: action.holding,
      };
    }
    case UPDATE_HOLDING: {
      return {
        ...state,
        [action.holding.id]: action.holding,
      };
    }
    case REMOVE_HOLDING: {
      const newState = { ...state };
      delete newState[action.holdingId];
      return newState;
    }
    default:
      return state;
  }
}
