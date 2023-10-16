import { useCallback } from 'react';
import { Adapter } from '../../../../../../services/adapters';
import { Button, Group, majorScale } from 'evergreen-ui';

type Props = {
  adapters: Adapter[];
  onClick: (value: Adapter) => void;
  short?: boolean;
};

export const AdaptersList = ({ adapters, onClick, short }: Props) => {
  const items = adapters.map((adapter: Adapter) => (
    <AdapterItem
      key={adapter.id}
      short={short}
      adapter={adapter}
      onClick={onClick}
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
};

export const AdapterItem = ({ adapter, onClick, short }: ItemProps) => {
  const handleClick = useCallback(() => onClick(adapter), [adapter, onClick]);
  return (
    <Button
      iconBefore={adapter.icon}
      onClick={handleClick}
      marginY={majorScale(1)}
      width="100%"
    >
      {short ? adapter.name : `${adapter.text} ${adapter.name}`}
    </Button>
  );
};
