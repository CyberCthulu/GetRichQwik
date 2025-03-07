// src/redux/orders.js
import { csrfFetch } from "./csrf";

/** Action Types **/
const LOAD_ORDERS = "orders/loadOrders";
const ADD_ORDER = "orders/addOrder";
const UPDATE_ORDER = "orders/updateOrder";
const REMOVE_ORDER = "orders/removeOrder";

/** Action Creators **/
const loadOrders = (orders) => ({ type: LOAD_ORDERS, orders });
const addOrder = (order) => ({ type: ADD_ORDER, order });
const updateOrderAction = (order) => ({ type: UPDATE_ORDER, order });
const removeOrder = (orderId) => ({ type: REMOVE_ORDER, orderId });

/** Thunks **/
// GET all orders for a portfolio
export const thunkLoadOrdersForPortfolio = (portfolioId) => async (dispatch) => {
  const res = await csrfFetch(`/api/portfolios/${portfolioId}/orders`);
  if (res.ok) {
    const data = await res.json(); // { orders: [...] }
    dispatch(loadOrders(data.orders));
  }
};

// POST create an order
export const thunkCreateOrder = (payload) => async (dispatch) => {
  const res = await csrfFetch("/api/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (res.ok) {
    const data = await res.json(); // { order: {...} }
    dispatch(addOrder(data.order));
    return data.order;
  }
};

// PUT update an order
export const thunkUpdateOrder = (orderId, payload) => async (dispatch) => {
  const res = await csrfFetch(`/api/orders/${orderId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (res.ok) {
    const data = await res.json();
    dispatch(updateOrderAction(data.order));
    return data.order;
  }
};

// DELETE an order
export const thunkDeleteOrder = (orderId) => async (dispatch) => {
  const res = await csrfFetch(`/api/orders/${orderId}`, {
    method: "DELETE",
  });
  if (res.ok) {
    dispatch(removeOrder(orderId));
  }
};

/** Reducer **/
export default function ordersReducer(state = {}, action) {
  switch (action.type) {
    case LOAD_ORDERS: {
      const newState = {};
      action.orders.forEach((o) => {
        newState[o.id] = o;
      });
      return newState;
    }
    case ADD_ORDER:
    case UPDATE_ORDER:
      return { ...state, [action.order.id]: action.order };
    case REMOVE_ORDER: {
      const newState = { ...state };
      delete newState[action.orderId];
      return newState;
    }
    default:
      return state;
  }
}
