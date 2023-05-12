import Axios from 'axios';

export const axios = Axios.create({
  headers: {
    'Content-type': 'application/json',
  },
});
