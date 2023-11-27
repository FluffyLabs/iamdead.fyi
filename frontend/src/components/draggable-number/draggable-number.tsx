import { InputHTMLAttributes, useCallback, useEffect, useRef } from 'react';
import { CaretLeftIcon, CaretRightIcon, IconButton, Pane } from 'evergreen-ui';
import { clsx } from 'clsx';

import { clamp } from '../../utils/math';

import styles from './styles.module.scss';

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 9;

/// How far (pixels) from the starting point we can drag the value.
/// This is an upper limit of the width, which is naturally limited by the screen
/// width otherwise.
const WIDTH_LIMIT = 1000;

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'min' | 'max'> & {
  onChange: (val: number) => void;
  value: number;
  buttons?: boolean;
  min?: number;
  max?: number;
};

export const DraggableNumber = ({
  onChange,
  min = DEFAULT_MIN,
  max = DEFAULT_MAX,
  value,
  buttons = true,
  ...inputProps
}: Props) => {
  const startConditions = useRef({
    position: 0,
    value: 0,
  });

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const startPosition = startConditions.current.position;
      const valueWhenDragged = startConditions.current.value;
      const distanceToScreenEdge = Math.min(window.innerWidth - startPosition, startPosition);
      const limit = Math.min(distanceToScreenEdge, startPosition, WIDTH_LIMIT) / 2;
      const currentX = clamp(Math.ceil(e.clientX), startPosition - limit, startPosition + limit);

      const newVal =
        currentX <= startPosition
          ? ((currentX - startPosition + limit) / limit) * (valueWhenDragged - min) + min
          : ((currentX - startPosition) / limit) * (max - valueWhenDragged) + valueWhenDragged;

      onChange(Math.round(newVal));
    },
    [onChange, min, max],
  );

  const handleMouseUp = useCallback(() => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  // To be super-duper safe, we don't leave anything behind.
  // We also unsubscribe in case the component is destroyed.
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
      startConditions.current = {
        position: e.clientX,
        value,
      };
      // add global listener
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // make sure that user-defined callback works.
      inputProps.onMouseDown?.(e);
    },
    [startConditions, handleMouseMove, handleMouseUp, value, inputProps],
  );

  const alter = useCallback(
    (diff: number) => {
      const newVal = clamp(value + diff, min, max);
      if (value === newVal) {
        return;
      }
      onChange(newVal);
    },
    [onChange, min, max, value],
  );

  const text = (
    <span
      {...inputProps}
      className={clsx(styles.input, inputProps.className)}
      onMouseDown={handleMouseDown}
    >
      {value}
    </span>
  );

  if (!buttons) {
    return text;
  }

  return (
    <div
      {...inputProps}
      className={clsx(styles.input, inputProps.className, styles.inputWithButtons)}
      onMouseDown={handleMouseDown}
    >
      <Pane
        display="flex"
        alignItems="center"
        flexDirection="row"
      >
        <IconButton
          icon={<CaretLeftIcon />}
          size="small"
          appearance="minimal"
          padding="0.05em"
          disabled={value <= min}
          onClick={() => alter(-1)}
        />
        <span>{value}</span>
        <IconButton
          icon={<CaretRightIcon />}
          size="small"
          appearance="minimal"
          padding="0.05em"
          disabled={value >= max}
          onClick={() => alter(+1)}
        />
      </Pane>
    </div>
  );
};
