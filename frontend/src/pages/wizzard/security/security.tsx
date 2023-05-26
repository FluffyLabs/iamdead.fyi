import { ReactComponent as KeyPerson } from './icons/key-person.svg';
import { ReactComponent as Key } from './icons/key.svg';
import { CSSProperties, ComponentType, SVGProps } from 'react';

const MULTIPLICATION_CHAR = '\u{215}';

export const Security = () => {
  const data = {
    noOfRecipients: 4,
    noOfAdditionalPieces: 1,
  };
  return (
    <div>
      <Row
        Icon={KeyPerson}
        counter={`${MULTIPLICATION_CHAR}${data.noOfRecipients}`}
        text={`I want any ${data.noOfRecipients} recipients to come together to read the message`}
      />

      <Row
        Icon={Key}
        counter={`+${data.noOfAdditionalPieces}`}
        text={`For redundancy I want ${data.noOfAdditionalPieces} pieces to be distributed`}
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