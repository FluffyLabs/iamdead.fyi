import { useCallback } from 'react';

import { AdaptersList } from './adapters-list';
import { Adapter } from '../../../../../services/adapters';

import { useAdapters } from '../../hooks/use-adapters';

type Props = {
  short?: boolean;
  filterOut?: (adapter: Adapter) => boolean;
  onChange: (value: { adapter: Adapter }) => void;
};

export const AdapterSelector = ({ short, filterOut, onChange }: Props) => {
  const { adapters } = useAdapters();

  const onConfirm = useCallback(
    (adapter: Adapter) => {
      return onChange({ adapter });
    },
    [onChange],
  );

  if (!adapters) {
    return null;
  }

  const filteredAdapters = filterOut ? adapters.filter((x) => !filterOut(x)) : adapters;
  // TODO [ToDr] don't display adapters already configured in section.
  return <AdaptersList short={short} adapters={filteredAdapters} onClick={onConfirm} />;
};
