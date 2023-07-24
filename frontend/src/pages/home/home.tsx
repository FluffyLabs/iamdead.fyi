import CryptoJs from 'icod-crypto-js';
import { useEffect, useState } from 'react';

export const Home = () => {
  const [val, setVal] = useState(null);

  useEffect(() => {
    const cryptojs = CryptoJs();
    cryptojs
      .then((v) => {
        setVal(v as any);
        console.log(v);
      })
      .catch((e) => {
        console.error(e);
      });
  });
  return <div>Home: {Object.keys(val || {}).join(', ')}</div>;
};
