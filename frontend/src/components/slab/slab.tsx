import { Pane, PaneProps, majorScale } from 'evergreen-ui';
import { ReactNode } from 'react';

type Props = PaneProps & {
  children: ReactNode;
};

export const Slab = ({ children, ...props }: Props) => (
  <Pane
    padding={majorScale(3)}
    marginY={majorScale(3)}
    {...props}
  >
    {children}
  </Pane>
);
