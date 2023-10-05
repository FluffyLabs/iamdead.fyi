import { InputHTMLAttributes, useCallback, useEffect, useState } from 'react';
import { clsx } from 'clsx';

import { clamp } from '../../utils/math';

import styles from './styles.module.scss';
import { usePrevious } from '../../hooks/use-previous';

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 9;

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'min' | 'max'> & {
  onChange: (val: number) => void;
  value: number;
  // TODO [ToDr] Add in a separate task.
  buttons?: boolean;
  min?: number;
  max?: number;
};

export const DraggableNumber = ({ onChange, min = DEFAULT_MIN, max = DEFAULT_MAX, value, ...inputProps }: Props) => {
  const [startPosition, setStartPositon] = useState(0);
  const [isDragged, setDragged] = useState(false);
  const wasDragged = usePrevious(isDragged);
  const [valueWhenDragged, setValueWhenDragged] = useState(0);
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
      setStartPositon(e.clientX);
      setValueWhenDragged(value);
      setDragged(true);
      inputProps.onMouseDown?.(e);
    },
    [setStartPositon, setDragged, value, inputProps],
  );

  useEffect(() => {
    // TODO [ToDr] Use add/removeEventListener instead of ovewriting the globals.
    if (isDragged) {
      document.onmouseup = function (e: MouseEvent) {
        setDragged(false);
      };

      const distanceToScreenEdge = Math.min(window.innerWidth - startPosition, startPosition);
      const limit = Math.min(distanceToScreenEdge, startPosition, 1000) / 2;

      document.onmousemove = function (e: MouseEvent) {
        const currentX = clamp(Math.ceil(e.clientX), startPosition - limit, startPosition + limit);

        const newVal =
          currentX <= startPosition
            ? ((currentX - startPosition + limit) / limit) * (valueWhenDragged - min) + min
            : ((currentX - startPosition) / limit) * (max - valueWhenDragged) + valueWhenDragged;
        onChange(Math.round(newVal));
      };
    } else if (wasDragged) {
      document.onmousemove = null;
      document.onmouseup = null;
    }
  }, [isDragged, setDragged, startPosition, max, min, onChange, wasDragged, valueWhenDragged]);

  const text = (
    <span {...inputProps} className={clsx(styles.input, inputProps.className)} onMouseDown={handleMouseDown}>
      {value}
    </span>
  );

  return text;
};
