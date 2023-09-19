import React, { useCallback } from 'react';

import { DraggableNumberInput } from '../../../components/draggable-number-input';
import { Adapters, ConfiguredAdapter, Units, createAdapter } from '../wizzard-context/proof-of-life';
import { useWizzardContext } from '../wizzard-context';
import { AdapterSelector } from './adapter-selector';
import { AdapterItem } from './adapter-selector/types';
import { capitalize } from '../../../utils/string';
import { NewAdapterPopover } from './new-adapter-popover/new-adapter-popover';

import telegramImage from './adapter-selector/images/telegram.svg';
import whatsappImage from './adapter-selector/images/whatsapp.png';
import twitterImage from './adapter-selector/images/twitter.png';
import emailImage from './adapter-selector/images/email.png';

import styles from './styles.module.scss';

const availableAdapters = Object.values(Adapters);

const socialMediaAdapters: typeof availableAdapters = [Adapters.Twitter];

const messageAdapters: typeof availableAdapters = [Adapters.Email, Adapters.Telegram, Adapters.Whatsapp];

const isMessageAdapter = (adapter: Adapters) => messageAdapters.includes(adapter);
const isSocialAdapter = (adapter: Adapters) => socialMediaAdapters.includes(adapter);

const createAdapterItem = (adapter: Adapters, image: string): AdapterItem => ({
  value: adapter,
  image,
  name: capitalize(adapter),
});

const socialMediaAdapterItems = [createAdapterItem(Adapters.Twitter, twitterImage)];

const messageAdapterItems = [
  createAdapterItem(Adapters.Telegram, telegramImage),
  createAdapterItem(Adapters.Whatsapp, whatsappImage),
  createAdapterItem(Adapters.Email, emailImage),
];

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
  const { proofOfLife } = useWizzardContext();
  const addNewAdapterGroup = useCallback(
    ({ adapter }: { adapter: Adapters }) => {
      proofOfLife.addNewGroup({ adapter, time: 5, unit: Units.Months });
    },
    [proofOfLife],
  );

  return (
    <div>
      {proofOfLife.listOfAdapters.length > 0 && (
        <>
          <h2 className={styles.header}>I want the pieces to be send when:</h2>
          <POLList />
        </>
      )}
      {proofOfLife.listOfAdapters.length === 0 && (
        <AdapterSelector
          adapters={{
            socialMediaAdapters: socialMediaAdapterItems,
            messageAdapters: messageAdapterItems,
          }}
          onChange={addNewAdapterGroup}
        />
      )}
    </div>
  );
};

const POLList = () => {
  const { proofOfLife } = useWizzardContext();

  const addNewAdapterGroup = useCallback(
    ({ adapter }: { adapter: Adapters }) => {
      proofOfLife.addNewGroup({ adapter, time: 5, unit: Units.Months });
    },
    [proofOfLife],
  );

  return (
    <ul className={styles.mainList}>
      {proofOfLife.listOfAdapters.map((group, i) => (
        <React.Fragment key={i}>
          <POLSubList items={group} groupIndex={i} />
          {i < proofOfLife.listOfAdapters.length - 1 && <li>and</li>}
        </React.Fragment>
      ))}
      <li>
        <NewAdapterPopover
          adapters={{
            socialMediaAdapters: socialMediaAdapterItems,
            messageAdapters: messageAdapterItems,
          }}
          onNewAdapter={addNewAdapterGroup}
        >
          <button className={styles.button}>+ and</button>
        </NewAdapterPopover>
      </li>
    </ul>
  );
};

const POLSubList = ({ items, groupIndex }: { items: Array<ConfiguredAdapter>; groupIndex: number }) => {
  const { proofOfLife } = useWizzardContext();

  const addNewAdapter = useCallback(
    ({ adapter }: { adapter: Adapters }) => {
      proofOfLife.addToGroup({ adapter, time: 5, unit: Units.Months }, groupIndex);
    },
    [proofOfLife, groupIndex],
  );
  return (
    <ul className={styles.subList}>
      {items.map((adapter, i) => (
        <POLSubListItem adapter={adapter} itemIndex={i} groupIndex={groupIndex} key={i} />
      ))}
      <li>
        <NewAdapterPopover
          adapters={{
            socialMediaAdapters: socialMediaAdapterItems,
            messageAdapters: messageAdapterItems,
          }}
          onNewAdapter={addNewAdapter}
        >
          <button className={styles.button}>+ or</button>
        </NewAdapterPopover>
      </li>
    </ul>
  );
};

const POLSubListItem = ({
  adapter,
  itemIndex,
  groupIndex,
}: {
  adapter: ConfiguredAdapter;
  itemIndex: number;
  groupIndex: number;
}) => {
  const { proofOfLife } = useWizzardContext();

  const item = proofOfLife.listOfAdapters[groupIndex][itemIndex];

  const handleChange = useCallback(
    (newValue: number) => {
      const newItem = createAdapter(item.adapter, newValue, item.unit);
      proofOfLife.updateGroupItem(newItem, groupIndex, itemIndex);
    },
    [proofOfLife, item, groupIndex, itemIndex],
  );

  return (
    <li>
      {itemIndex > 0 && 'or '}
      {getText(adapter)} <DraggableNumberInput value={item.time} onChange={handleChange} max={60} min={1} />
      {adapter.unit}
    </li>
  );
};
