import { Card, majorScale } from 'evergreen-ui';
import { ReactNode } from 'react';

export const Row = ({ children }: { children: ReactNode }) => {
  return (
    <Card elevation={1} display="flex" padding={majorScale(2)} marginY={majorScale(3)} alignItems="center">
      {children}
    </Card>
  );
};
