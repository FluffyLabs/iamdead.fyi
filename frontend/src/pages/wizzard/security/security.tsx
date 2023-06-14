import { useWizzardContext } from '../wizzard-context';
import { ReactComponent as KeyPerson } from './icons/key-person.svg';
import { ReactComponent as Key } from './icons/key.svg';
import { ReactComponent as Card } from './icons/card.svg';
import { ComponentType, SVGProps, useCallback, useMemo } from 'react';
import { DraggableNumberInput } from '../../../components/draggable-number-input';

import styles from './styles.module.scss';

const MULTIPLICATION_CHAR = '×';
const MIN_NO_OF_RECIPIENTS = 1;
const MAX_NO_OF_RECIPIENTS = 9;
const MIN_NO_OF_ADDITIONAL_PIECES = 0;
const MAX_NO_OF_ADDITIONAL_PIECES = 9;

export const Security = () => {
  const { security } = useWizzardContext();

  return (
    <div>
      <Row
        Icon={KeyPerson}
        counter={
          <>
            {MULTIPLICATION_CHAR}
            <DraggableNumberInput
              value={security.noOfRecipients.value}
              onChange={security.noOfRecipients.setValue}
              min={MIN_NO_OF_RECIPIENTS}
              max={MAX_NO_OF_RECIPIENTS}
            />
          </>
        }
        text={
          <>
            I want any{' '}
            <DraggableNumberInput
              value={security.noOfRecipients.value}
              onChange={security.noOfRecipients.setValue}
              min={MIN_NO_OF_RECIPIENTS}
              max={MAX_NO_OF_RECIPIENTS}
            />
            recipients to come together to read the message
          </>
        }
      />

      <Row
        Icon={Key}
        counter={
          <>
            +
            <DraggableNumberInput
              value={security.noOfAdditionalPieces.value}
              onChange={security.noOfAdditionalPieces.setValue}
            />
          </>
        }
        text={
          <>
            For redundancy I want{' '}
            {security.noOfRecipients.value === 1 && <OneRecipient />}
            {security.noOfRecipients.value > 1 && <ManyRecipients />}
          </>
        }
      />

      <Cards
        quantity={
          security.noOfAdditionalPieces.value + security.noOfRecipients.value
        }
      />
    </div>
  );
};

const Row = ({
  Icon,
  counter,
  text,
}: {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  counter: JSX.Element;
  text: JSX.Element;
}) => {
  return (
    <div className="flex flex-row items-center">
      <span className="flex flex-row w-52 justify-around">
        <Icon style={{ width: '100px', height: '100px' }} />
        <span style={{ fontSize: '50px', marginLeft: '5px' }}>{counter}</span>
      </span>
      <span className="mx-5">{text}</span>
    </div>
  );
};

const Cards = ({ quantity }: { quantity: number }) => {
  const array = useMemo(() => Array.from(Array(quantity).keys()), [quantity]);

  return (
    <div className={styles.cards}>
      {array.map((i) => (
        <CardItem key={i} label={i.toString()} />
      ))}
    </div>
  );
};

const CardItem = ({label}: {label: string}) => {
  return (
  <div className="relative">
    <Card style={{ width: '100px', height: '100px' }} />
    <span className={styles.label}>{label}</span>
  </div>
  )
}

const OneRecipient = () => {
  const { security } = useWizzardContext();

  return (
    <>
      <DraggableNumberInput
        value={security.noOfAdditionalPieces.value}
        onChange={security.noOfAdditionalPieces.setValue}
        max={MAX_NO_OF_ADDITIONAL_PIECES}
        min={MIN_NO_OF_ADDITIONAL_PIECES}
      />{' '}
      extra keys
    </>
  );
};

const ManyRecipients = () => {
  const { security } = useWizzardContext();

  const handleNoOfPiecesChange = useCallback(
    (val: number) => {
      security.noOfAdditionalPieces.setValue(
        val - security.noOfRecipients.value,
      );
    },
    [security.noOfAdditionalPieces, security.noOfRecipients],
  );
  return (
    <>
      <DraggableNumberInput
        value={
          security.noOfAdditionalPieces.value + security.noOfRecipients.value
        }
        onChange={handleNoOfPiecesChange}
        min={security.noOfRecipients.value}
        max={security.noOfRecipients.value + MAX_NO_OF_ADDITIONAL_PIECES}
      />{' '}
      pieces to be distributed
    </>
  );
};
