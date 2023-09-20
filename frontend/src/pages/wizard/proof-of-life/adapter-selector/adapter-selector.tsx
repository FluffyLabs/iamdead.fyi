import { AdaptersSection } from './adapters-section';
import { AdapterItem } from './types';

import { Adapters } from '../../wizard-context/proof-of-life';
import { ChangeEvent, useCallback, useState } from 'react';
import { capitalize } from '../../../../utils/string';
import { Button, TextInput } from 'evergreen-ui';

import styles from './styles.module.scss';

type Props = {
  adapters: {
    socialMediaAdapters: Array<AdapterItem>;
    messageAdapters: Array<AdapterItem>;
  };
  onChange: (value: { adapter: Adapters; adapterId: string }) => void;
};

export const AdapterSelector = ({ adapters, onChange }: Props) => {
  const [selectedAdapter, setSelectedAdapter] = useState<null | Adapters>(null);
  const [adapterId, setAdapterId] = useState<string>('');
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setAdapterId(event.target.value),
    [setAdapterId],
  );
  const changeAdapter = useCallback(() => {
    setAdapterId('');
    setSelectedAdapter(null);
  }, [setSelectedAdapter]);

  const onConfirm = useCallback(() => {
    if (selectedAdapter && adapterId) {
      return onChange({ adapter: selectedAdapter, adapterId });
    }
  }, [onChange, selectedAdapter, adapterId]);
  return (
    <div className={styles.container}>
      {!selectedAdapter && (
        <>
          <h1 className={styles.title}>Select an adapter</h1>
          <AdaptersSection
            title="Social media adapters"
            adapters={adapters.socialMediaAdapters}
            onClick={setSelectedAdapter}
          />
          <AdaptersSection title="Message adapters" adapters={adapters.messageAdapters} onClick={setSelectedAdapter} />
        </>
      )}

      {selectedAdapter && (
        <>
          <h1 className={styles.title}>Selected adapter: {capitalize(selectedAdapter)}</h1>
          <TextInput name="adapter-id" placeholder="Adapter id" onChange={handleChange} value={adapterId} />
          <div className={styles.buttons}>
            <Button marginRight={16} onClick={changeAdapter}>
              Change adapter
            </Button>
            <Button appearance="primary" onClick={onConfirm}>
              Confirm
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
