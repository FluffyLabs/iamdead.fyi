import { useWizzardContext } from '../wizzard-context';
import { ReactComponent as KeyPerson } from './icons/key-person.svg';
import { ReactComponent as Key } from './icons/key.svg';
import { ComponentType, SVGProps } from 'react';

const MULTIPLICATION_CHAR = '×';

export const Security = () => {
  const { security } = useWizzardContext();

  return (
    <div>
      <Row
        Icon={KeyPerson}
        counter={`${MULTIPLICATION_CHAR}${security.noOfRecipients.value}`}
        text={`I want any ${security.noOfRecipients.value} recipients to come together to read the message`}
      />

      <Row
        Icon={Key}
        counter={`+${security.noOfAdditionalPieces.value}`}
        text={`For redundancy I want ${security.noOfAdditionalPieces.value} pieces to be distributed`}
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
  counter: string;
  text: string;
}) => {
  return (
    <div className="flex flex-row items-center">
      <span className="flex flex-row w-40 justify-around">
        <Icon style={{ width: '100px', height: '100px' }} />
        <span style={{ fontSize: '50px', marginLeft: '5px' }}>{counter}</span>
      </span>
      <p className="mx-5">
        {text}
      </p>
    </div>
  );
};