import { legacy_createStore as createStore, applyMiddleware, compose, combineReducers, } from "redux";
import thunk from "redux-thunk";
import sessionReducer from "./session";
import usersReducer from "./users";
import portfoliosReducer from "./portfolios";
import stocksReducer from "./stocks";
import holdingsReducer from "./holdings";
import watchlistsReducer from "./watchlists";
import ordersReducer from "./orders";


const rootReducer = combineReducers({
  session: sessionReducer,
  users: usersReducer,
  portfolios: portfoliosReducer,
  stocks: stocksReducer,
  holdings: holdingsReducer,
  watchlists: watchlistsReducer,
  orders: ordersReducer,
});

let enhancer;
if (import.meta.env.MODE === "production") {
  enhancer = applyMiddleware(thunk);
} else {
  const logger = (await import("redux-logger")).default;
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}

const configureStore = (preloadedState) => {
  return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;
