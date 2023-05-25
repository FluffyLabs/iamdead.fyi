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
    console.log('set token')
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

axios.interceptors.response.use((res) => res, (error) => {
  if (error.response.status === 401) {
    Cookies.remove('token');
  }
  return error;
});
