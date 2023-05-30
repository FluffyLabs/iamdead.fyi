import { useWizzardContext } from '../wizzard-context';
import { ReactComponent as KeyPerson } from './icons/key-person.svg';
import { ReactComponent as Key } from './icons/key.svg';
import { ComponentType, SVGProps, useState, useCallback, ChangeEvent } from 'react';
import { useOutsideClick } from '../../../hooks/use-outside-click';

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
            <Popover
              label={`${security.noOfRecipients.value}`}
              popoverLabel="Number of recipients"
              value={security.noOfRecipients.value}
              onChange={security.noOfRecipients.setValue}
              min={1}
            />
          </>
        }
        text={
          <>I want any             <Popover
              label={`${security.noOfRecipients.value}`}
              popoverLabel="Number of recipients"
              value={security.noOfRecipients.value}
              onChange={security.noOfRecipients.setValue}
              min={1}
              /> {' '}
              recipients to come together to read the message</>
        }
      />

      <Row
        Icon={Key}
        counter={
          <>
            +
            <Popover
              label={`${security.noOfAdditionalPieces.value}`}
              popoverLabel="Number of additional pieces"
              value={security.noOfAdditionalPieces.value}
              onChange={security.noOfAdditionalPieces.setValue}
            />
          </>
        }
        text={
          <>
            For redundancy I want{' '}
            <Popover
              label={`${security.noOfAdditionalPieces.value}`}
              popoverLabel="Number of additional pieces"
              value={security.noOfAdditionalPieces.value}
              onChange={security.noOfAdditionalPieces.setValue}
            />{' '}
            pieces to be distributed
          </>
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
      <span className="flex flex-row w-40 justify-around">
        <Icon style={{ width: '100px', height: '100px' }} />
        <span style={{ fontSize: '50px', marginLeft: '5px' }}>{counter}</span>
      </span>
      <span className="mx-5">{text}</span>
    </div>
  );
};

const Popover = ({
  label,
  popoverLabel,
  value,
  onChange,
  min = 0,
}: {
  label: string;
  popoverLabel: string;
  value: number;
  onChange: (val: number) => void;
  min?: number
}) => {
  const [isVisible, setVisible] = useState(false);
  const show = useCallback(() => setVisible(true), [setVisible]);
  const hide = useCallback(() => setVisible(false), [setVisible]);
  const ref = useOutsideClick<HTMLDivElement>(hide);
  const onCLick = useCallback(
    () =>
      setVisible((prev) => {
        return !prev;
      }),
    [setVisible],
  );
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(parseInt(event.currentTarget.value, 10));
    },
    [onChange],
  );
  return (
    <>
      <div className="relative inline-block">
        <button
          type="button"
          className="inline"
          onClick={onCLick}
          onMouseEnter={show}
        >
          {label}
        </button>
        {isVisible && (
          <div
            className="absolute bg-white shadow-md rounded p-4 mt-2 text-base z-10"
            ref={ref}
          >
            <label
              htmlFor="range"
              className="mb-2 inline-block text-neutral-700"
            >
              {popoverLabel}
            </label>
            <input
              type="range"
              className="transparent h-1.5 w-32 cursor-pointer appearance-none rounded-lg border-transparent bg-neutral-200"
              id="range"
              value={value}
              onChange={handleChange}
              min={min}
              max={9}
            />
          </div>
        )}
      </div>
    </>
  );
};
