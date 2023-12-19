import Axios from 'axios';
import Cookies from 'js-cookie';

export const axios = Axios.create({
  headers: {
    'Content-type': 'application/json',
  },
});

axios.interceptors.request.use((req) => {
  const token = Cookies.get('token');

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

axios.interceptors.response.use(
  (res) => res,
  (error) => {
    const isUnauthorized = error.response.status === 401;
    const wasTokenSent = !!error.request.headers?.Authorization;
    if (isUnauthorized && wasTokenSent) {
      Cookies.remove('token');
    }
    return error;
  },
);
