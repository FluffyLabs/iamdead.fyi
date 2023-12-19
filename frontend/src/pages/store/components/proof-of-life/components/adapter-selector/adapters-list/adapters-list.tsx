import { useCallback } from 'react';
import { Adapter } from '../../../../../services/adapters';
import { Button, Group, majorScale } from 'evergreen-ui';
import { UserAdapter, useAdapters } from '../../../../../../../hooks/user/use-adapters';

type Props = {
  adapters: Adapter[];
  onClick: (value: Adapter) => void;
  short?: boolean;
};

export const AdaptersList = ({ adapters, onClick, short }: Props) => {
  const configuredAdapters = useAdapters().adapters;

  function getHandle(configuredAdapters: UserAdapter[], adapter: Adapter) {
    return configuredAdapters.find((x) => x.kind === adapter.kind)?.handle;
  }

  const items = adapters.map((adapter: Adapter) => (
    <AdapterItem
      key={adapter.kind}
      short={short}
      onClick={onClick}
      adapter={adapter}
      adapterHandle={getHandle(configuredAdapters, adapter)}
    />
  ));

  if (short) {
    return <Group>{items}</Group>;
  }

  return items;
};

type ItemProps = {
  onClick: (value: Adapter) => void;
  adapter: Adapter;
  short?: boolean;
  adapterHandle?: string;
};

export const AdapterItem = ({ adapter, onClick, short, adapterHandle }: ItemProps) => {
  const handleClick = useCallback(() => onClick(adapter), [adapter, onClick]);
  const name = adapterHandle ? `${adapter.name} (${adapterHandle})` : `${adapter.name} (not configured)`;
  const text = short ? adapter.name : `${adapter.text} ${name}`;

  const content = adapterHandle ? text : <em>{text}</em>;

  return (
    <Button
      iconBefore={adapter.icon}
      onClick={handleClick}
      marginY={majorScale(1)}
      width="100%"
      title={adapterHandle}
    >
      {content}
    </Button>
  );
};
