import axios from 'axios';
import setAuthToken from '../utils/setAuthToken';
import {GET_ERRORS, SET_CURRENT_USER} from './types';
import jwt_decode from 'jwt-decode';


//Register User
export const registerUser = (userData, history) => dispatch => {
axios.post('/api/users/register', userData)
  .then(res => history.push('/login'))
  .catch(err =>
    dispatch({
      type: GET_ERRORS,
      payload: err.response.data
    })
  );
};


//Login user
export const loginUser = userData => dispatch => {
  axios.post('/api/users/login', userData)
    .then(res => {
      //Save to localStorage
      const {token} = res.data;
      //set token to localStorage
      localStorage.setItem('jwtToken', token);
      //set token to auth Header
      setAuthToken(token);
      //decode token to get user Data
      const decoded = jwt_decode(token);
      //set current user
      dispatch(setCurrentUser(decoded));
    })
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

//set logged in users
export const setCurrentUser = (decoded) => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  }
}

// Log user out
export const logoutUser = () => dispatch => {
  //Remove token from localStorage
  localStorage.removeItem('jwtToken');

  //Remove auth header for future requests
  setAuthToken(false);

  //set current user to {} which turns isAuthenticated to false
  dispatch(setCurrentUser({}));
}