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
