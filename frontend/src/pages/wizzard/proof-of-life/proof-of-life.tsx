import React, { useState } from 'react';

import styles from './styles.module.scss';
import { DraggableNumberInput } from '../../../components/draggable-number-input';

type ConfiguredAdapter = {
  adapter: Adapters;
  time: number;
  unit: Units;
};

enum Adapters {
  Email = 'email',
  Telegram = 'telegram',
  Twitter = 'twitter',
  Whatsapp = 'whatsapp',
}

const availableAdapters = Object.values(Adapters);

const socialMediaAdapters: typeof availableAdapters = [Adapters.Twitter];

const messageAdapters: typeof availableAdapters = [
  Adapters.Email,
  Adapters.Telegram,
  Adapters.Whatsapp,
];

const isMessageAdapter = (adapter: Adapters) =>
  messageAdapters.includes(adapter);
const isSocialAdapter = (adapter: Adapters) =>
  socialMediaAdapters.includes(adapter);

const getText = ({ adapter }: ConfiguredAdapter) => {
  if (isMessageAdapter(adapter)) {
    return `I don't respond to ${adapter} for`;
  }

  if (isSocialAdapter(adapter)) {
    return `I am not active on ${adapter} for`;
  }

  return '';
};

enum Units {
  Months = 'months',
}

const createItem = (adapter: Adapters, time: number, unit = Units.Months) => ({
  adapter,
  time,
  unit,
});

const list = [
  [createItem(Adapters.Email, 2), createItem(Adapters.Telegram, 2)],
  [createItem(Adapters.Twitter, 2), createItem(Adapters.Whatsapp, 2)],
  [createItem(Adapters.Twitter, 2), createItem(Adapters.Email, 2)],
];

export const ProofOfLife = () => {
  return (
    <div>
      <h2 className={styles.header}>I want the pieces to be send when:</h2>
      <POLList />
    </div>
  );
};

const POLList = () => {
  return (
    <ul className={styles.mainList}>
      {list.map((listOfAdapters, i) => (
        <React.Fragment key={i}>
          <POLSubList items={listOfAdapters} />
          {i < listOfAdapters.length && <li>and</li>}
        </React.Fragment>
      ))}
      <li>+ and</li>
    </ul>
  );
};

const POLSubList = ({ items }: { items: Array<ConfiguredAdapter> }) => {
  return (
    <ul className={styles.subList}>
      {items.map((adapter, i) => (
        <POLSubListItme adapter={adapter} key={i} />
      ))}
      <li>+ or</li>
    </ul>
  );
};

const POLSubListItme = ({ adapter }: { adapter: ConfiguredAdapter }) => {
  const [value, setValue] = useState(adapter.time);

  return (
    <li>
      {getText(adapter)}{' '}
      <DraggableNumberInput
        value={value}
        onChange={setValue}
        max={60}
        min={1}
      />
      {adapter.unit}
    </li>
  );
};
