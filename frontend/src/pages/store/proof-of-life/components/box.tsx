import { Card, CardProps, majorScale } from 'evergreen-ui';

export const Box = ({ children, ...rest }: CardProps) => (
  <Card
    flex="1"
    minWidth="200px"
    maxWidth="40vw"
    elevation={2}
    padding={majorScale(2)}
    marginY={majorScale(1)}
    {...rest}
  >
    {children}
  </Card>
);
