import { csrfFetch } from "./csrf";

// ----------------- Action Types ------------------
const LOAD_PORTFOLIOS = "portfolios/LOAD_PORTFOLIOS";
const LOAD_ONE_PORTFOLIO = "portfolios/loadOnePortfolio";
const ADD_PORTFOLIO = "portfolios/ADD_PORTFOLIO";
const UPDATE_PORTFOLIO = "portfolios/UPDATE_PORTFOLIO";
const REMOVE_PORTFOLIO = "portfolios/REMOVE_PORTFOLIO";

// ----------------- Action Creators --------------
const loadPortfolios = (portfolios) => ({
  type: LOAD_PORTFOLIOS,
  portfolios,
});

const loadOnePortfolio = (portfolio) => ({
  type: LOAD_ONE_PORTFOLIO,
  portfolio,
});

const addPortfolio = (portfolio) => ({
  type: ADD_PORTFOLIO,
  portfolio,
});

const updatePortfolioAction = (portfolio) => ({
  type: UPDATE_PORTFOLIO,
  portfolio,
});

const removePortfolio = (portfolioId) => ({
  type: REMOVE_PORTFOLIO,
  portfolioId,
});

// ----------------- Thunks ------------------------

// GET all portfolios (for current user)
export const thunkLoadPortfolios = () => async (dispatch) => {
  const res = await csrfFetch("/api/users/portfolios");
  if (res.ok) {
    const data = await res.json(); // { portfolios: [...] }
    dispatch(loadPortfolios(data.portfolios));
  }
};

// GET one portfolio by id
export const thunkLoadOnePortfolio = (portfolioId) => async (dispatch) => {
  const res = await csrfFetch(`/api/portfolios/${portfolioId}`);
  if (res.ok) {
    const data = await res.json(); // { portfolio: {...} }
    dispatch(loadOnePortfolio(data.portfolio));
  }
};

// POST create a new portfolio
export const thunkCreatePortfolio = (payload) => async (dispatch) => {
  const res = await csrfFetch("/api/portfolios/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (res.ok) {
    const data = await res.json();
    dispatch(addPortfolio(data.portfolio));
    return data.portfolio;
  }
};

// PUT update a portfolio
export const thunkUpdatePortfolio = (portfolioId, payload) => async (dispatch) => {
  const res = await csrfFetch(`/api/portfolios/${portfolioId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (res.ok) {
    const data = await res.json();
    dispatch(updatePortfolioAction(data.portfolio));
    return data.portfolio;
  }
};

// DELETE a portfolio
// src/redux/portfolios.js
export const thunkDeletePortfolio = (portfolioId) => async (dispatch) => {
  const res = await csrfFetch(`/api/portfolios/${portfolioId}`, {
    method: "DELETE",
  });
  if (res.ok) {
    const data = await res.json();
    dispatch(removePortfolio(portfolioId));
    return data;
  } else {
    const errorData = await res.json();
    throw errorData;
  }
};


// ----------------- Reducer -----------------------
export default function portfoliosReducer(state = {}, action) {
  switch (action.type) {
    case LOAD_PORTFOLIOS: {
      const newState = {};
      action.portfolios.forEach((pf) => {
        newState[pf.id] = pf;
      });
      return newState;
    }
    case LOAD_ONE_PORTFOLIO:
    case ADD_PORTFOLIO:
    case UPDATE_PORTFOLIO:
      return { ...state, [action.portfolio.id]: action.portfolio };
    case REMOVE_PORTFOLIO: {
      const newState = { ...state };
      delete newState[action.portfolioId];
      return newState;
    }
    default:
      return state;
  }
}
