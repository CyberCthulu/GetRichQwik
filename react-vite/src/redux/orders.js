// src/redux/orders.js

import { csrfFetch } from "./csrf";

/** ------------------ Action Types ------------------ **/
const LOAD_ORDERS = "orders/LOAD_ORDERS";
const ADD_ORDER = "orders/ADD_ORDER";
const UPDATE_ORDER = "orders/UPDATE_ORDER";
const REMOVE_ORDER = "orders/REMOVE_ORDER";

/** ------------------ Action Creators ------------------ **/
const loadOrdersAction = (orders) => ({
  type: LOAD_ORDERS,
  orders,
});

const addOrderAction = (order) => ({
  type: ADD_ORDER,
  order,
});

const updateOrderAction = (order) => ({
  type: UPDATE_ORDER,
  order,
});

const removeOrderAction = (orderId) => ({
  type: REMOVE_ORDER,
  orderId,
});

/** ------------------ Thunks ------------------ **/

/**
 * Fetch ALL orders for the current user (across all portfolios).
 * Calls your GET /api/orders endpoint.
 */
export const thunkLoadAllOrders = () => async (dispatch) => {
  const response = await csrfFetch("/api/orders");
  if (response.ok) {
    const orders = await response.json(); // An array of all orders
    dispatch(loadOrdersAction(orders));
  }
};

/**
 * Create a new order (POST /api/orders).
 * Returns the created order on success.
 */
export const thunkCreateOrder = (payload) => async (dispatch) => {
  const response = await csrfFetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    const data = await response.json(); // { order: {...} }
    dispatch(addOrderAction(data.order));
    return data.order;
  } else {
    // Handle errors if needed
    const errorData = await response.json();
    throw errorData;
  }
};

/**
 * Update an existing order (PUT /api/orders/:orderId).
 * Returns the updated order on success.
 */
export const thunkUpdateOrder = (orderId, payload) => async (dispatch) => {
  const response = await csrfFetch(`/api/orders/${orderId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    const data = await response.json(); // { order: {...} }
    dispatch(updateOrderAction(data.order));
    return data.order;
  } else {
    // Handle errors if needed
    const errorData = await response.json();
    throw errorData;
  }
};

/**
 * Delete (cancel) an existing order (DELETE /api/orders/:orderId).
 * Returns the updated/cancelled order on success.
 */
export const thunkDeleteOrder = (orderId) => async (dispatch) => {
  const response = await csrfFetch(`/api/orders/${orderId}`, {
    method: "DELETE",
  });

  if (response.ok) {
    const data = await response.json(); // { order: {...}, message: "Order canceled successfully" }
    // Because your backend sets order.status to "cancelled" instead of removing it,
    // we can just update that order in the store rather than removing it entirely.
    dispatch(updateOrderAction(data.order));
    return data.order;
  } else {
    // Handle errors if needed
    const errorData = await response.json();
    throw errorData;
  }
};

/** ------------------ Reducer ------------------ **/

export default function ordersReducer(state = {}, action) {
  switch (action.type) {
    case LOAD_ORDERS: {
      // Replace state with a new normalized object of all orders
      const newState = {};
      action.orders.forEach((order) => {
        newState[order.id] = order;
      });
      return newState;
    }

    case ADD_ORDER:
    case UPDATE_ORDER: {
      // Add or update a single order in state
      const newState = { ...state };
      newState[action.order.id] = action.order;
      return newState;
    }

    case REMOVE_ORDER: {
      // Remove a single order from state (if you ever decide to fully delete it)
      const newState = { ...state };
      delete newState[action.orderId];
      return newState;
    }

    default:
      return state;
  }
}
