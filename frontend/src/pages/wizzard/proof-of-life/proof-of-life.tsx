import React, { useCallback } from 'react';

import styles from './styles.module.scss';
import { DraggableNumberInput } from '../../../components/draggable-number-input';
import { Adapters, ConfiguredAdapter, createAdapter } from '../wizzard-context/proof-of-life';
import { useWizzard } from '../wizzard-context';

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

export const ProofOfLife = () => {
  return (
    <div>
      <h2 className={styles.header}>I want the pieces to be send when:</h2>
      <POLList />
    </div>
  );
};

const POLList = () => {
  const { proofOfLife } = useWizzard();
  
  return (
    <ul className={styles.mainList}>
      {proofOfLife.listOfAdapters.map((listOfAdapters, i) => (
        <React.Fragment key={i}>
          <POLSubList items={listOfAdapters} groupIndex={i} />
          {i < listOfAdapters.length && <li>and</li>}
        </React.Fragment>
      ))}
      <li><button className={styles.button}>+ and</button></li>
    </ul>
  );
};

const POLSubList = ({ items, groupIndex }: { items: Array<ConfiguredAdapter>, groupIndex: number }) => {
  return (
    <ul className={styles.subList}>
      {items.map((adapter, i) => (
        <POLSubListItme adapter={adapter} itemIndex={i} groupIndex={groupIndex} key={i} />
      ))}
      <li><button className={styles.button}>+ or</button></li>
    </ul>
  );
};

const POLSubListItme = ({ adapter, itemIndex, groupIndex }: { adapter: ConfiguredAdapter, itemIndex: number, groupIndex: number }) => {
  const { proofOfLife } = useWizzard();

  const item = proofOfLife.listOfAdapters[groupIndex][itemIndex];

  const handleChange = useCallback((newValue: number) => {
      const newItem = createAdapter(item.adapter, newValue, item.unit);
      proofOfLife.updateGroupItem(newItem, groupIndex, itemIndex);
  }, [proofOfLife, item, groupIndex, itemIndex]);

  return (
    <li>
      {itemIndex > 0 && 'or '}
      {getText(adapter)}{' '}
      <DraggableNumberInput
        value={item.time}
        onChange={handleChange}
        max={60}
        min={1}
      />
      {adapter.unit}
    </li>
  );
};
