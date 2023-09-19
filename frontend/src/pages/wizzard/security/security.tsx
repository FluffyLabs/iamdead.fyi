import { useWizzardContext } from '../wizzard-context';
import { ReactComponent as KeyPerson } from './icons/key-person.svg';
import { ReactComponent as Key } from './icons/key.svg';
import { ReactComponent as Card } from './icons/card.svg';
import { ComponentType, SVGProps, useCallback, useMemo } from 'react';
import { DraggableNumberInput } from '../../../components/draggable-number-input';

const MULTIPLICATION_CHAR = '×';

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
              min={1}
            />
          </>
        }
        text={
          <>
            I want any{' '}
            <DraggableNumberInput
              value={security.noOfRecipients.value}
              onChange={security.noOfRecipients.setValue}
              min={1}
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
    <div className="flex flex-wrap justify-center gap-1 px-8">
      {array.map((i) => (
        <Card style={{ width: '100px', height: '100px' }} key={i} />
      ))}
    </div>
  );
};

const OneRecipient = () => {
  const { security } = useWizzardContext();

  return (
    <>
      <DraggableNumberInput
        value={security.noOfAdditionalPieces.value}
        onChange={security.noOfAdditionalPieces.setValue}
        max={9}
        min={0}
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
        max={security.noOfRecipients.value + 9}
      />{' '}
      pieces to be distributed
    </>
  );
};
