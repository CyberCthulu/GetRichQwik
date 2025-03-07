// src/redux/users.js
import { csrfFetch } from "./csrf";

// ----------------- Action Types ------------------
const LOAD_USERS = "users/LOAD_USERS";
const LOAD_ONE_USER = "users/LOAD_ONE_USER";
const UPDATE_USER = "users/UPDATE_USER"
const DELETE_USER = "users/deleteUser"

// ----------------- Action Creators --------------
const loadUsers = (users) => ({
  type: LOAD_USERS,
  payload: users,
});

const loadOneUser = (user) => ({
  type: LOAD_ONE_USER,
  payload: user,
});

const updateUser = (user) => ({
    type: UPDATE_USER,
    payload: user,
});

const removeUser = (userId) => ({
    type: DELETE_USER,
    payload: userId,
});

// ----------------- Thunks ------------------------

// Get all users
export const thunkLoadAllUsers = () => async (dispatch) => {
    const res = await csrfFetch("/api/users");
    if (res.ok) {
      const data = await res.json(); // { users: [...] }
      dispatch(loadUsers(data.users));
    }
  };


// Get a single user by ID
export const thunkLoadOneUser = (userId) => async (dispatch) => {
  const res = await csrfFetch(`/api/users/${userId}`);
  if (res.ok) {
    const data = await res.json(); // { user: {...} }
    dispatch(loadOneUser(data.user));
  }
};

// Update user
export const thunkUpdateUser = (userId, formData) => async (dispatch) => {
    const res = await csrfFetch(`/api/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      const data = await res.json(); // { user: {...} }
      dispatch(updateUser(data.user));
      return data.user;
    }
  };

  export const thunkDeleteUser = (userId) => async (dispatch) => {
    const res = await csrfFetch(`/api/users/${userId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      dispatch(removeUser(userId));
    }
  }; 

// ----------------- Initial State & Reducer -------
const initialState = {
  // shape: { [userId]: userObj }
};


export default function usersReducer(state = {}, action) {
    switch (action.type) {
      case LOAD_USERS: {
        const newState = {};
        action.payload.forEach((u) => {
          newState[u.id] = u;
        });
        return newState;
      }
      case LOAD_ONE_USER:
      case UPDATE_USER: {
        return { ...state, [action.payload.id]: action.payload };
      }
      case DELETE_USER: {
        const newState = { ...state };
        delete newState[action.payload];
        return newState;
      }
      default:
        return state;
    }
  }