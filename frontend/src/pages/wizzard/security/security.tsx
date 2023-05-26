import { ReactComponent as KeyPerson } from './icons/key-person.svg';
import { ReactComponent as Key } from './icons/key.svg';

export const Security = () => {
  return (
    <div>
      <div className="flex flex-row items-center">
        <span className="flex flex-row w-40 justify-around">
          <KeyPerson style={{ width: '100px', height: '100px' }} />
          <span style={{ fontSize: '50px', marginLeft: '5px' }}>&#215;4</span>
        </span>
        <p className="mx-5">
          I want any 4 recipients to come together to read the message
        </p>
      </div>

      <div className="flex flex-raw items-center">
        <span className="flex flex-row w-40 justify-between">
          <Key style={{ width: '100px', height: '100px' }} />
          <span style={{ fontSize: '50px', marginLeft: '5px' }}>+1</span>
        </span>
        <p className="mx-5">
          For redundancy I want 5 pieces to be distributed
        </p>
      </div>
    </div>
  );
};
