import { InputHTMLAttributes, useCallback, useEffect, useState } from "react"
import { clsx } from 'clsx';

import { clamp } from '../../utils/math';

import styles from './styles.module.scss';
import { usePrevious } from "../../hooks/use-previous";

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 9;

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'|'value'|'min'|'max'> & {
  onChange: (val: number) => void;
  value: number;
  min?: number;
  max?: number;
};

export const DraggableNumberInput = ({
  onChange,
  min = DEFAULT_MIN,
  max = DEFAULT_MAX,
  ...inputProps
}: Props) => {
  const [startPosition, setStartPositon] = useState(0);
  const [isDragged, setDragged] = useState(false);
  const wasDragged = usePrevious(isDragged);
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
      setStartPositon(e.clientX);
      setDragged(true);
      inputProps.onMouseDown?.(e);
    },
    [setStartPositon, setDragged, inputProps],
  );

  useEffect(() => {
    if (isDragged) {
      document.onmouseup = function (e: MouseEvent) {
        setDragged(false);
      };

      const distanceToScreenEdge = Math.min(
        window.innerWidth - startPosition,
        startPosition,
      );
      const limit = Math.min(distanceToScreenEdge, startPosition) / 2;

      document.onmousemove = function (e: MouseEvent) {
        const delta = clamp(
          Math.ceil(e.clientX),
          startPosition - limit,
          startPosition + limit,
        );

        const newVal = Math.round(
          ((delta - (startPosition - limit)) / (2 * limit)) * (max - min) + min,
        );
        onChange(newVal);
      };
    } else if (wasDragged) {
      document.onmousemove = null;
      document.onmouseup = null;
    }
  }, [isDragged, setDragged, startPosition, max, min, onChange, wasDragged]);

  return (
    <input
      {...inputProps}
      className={clsx(styles.input, inputProps.className)}
      onMouseDown={handleMouseDown}
      readOnly
      size={1}
    />
  );
};

