import { Card, CardProps, majorScale } from 'evergreen-ui';

type Props = CardProps;
export const Box = ({ children, ...rest }: CardProps) => (
  <Card flex="1" maxWidth="50vw" elevation={2} padding={majorScale(2)} marginY={majorScale(1)} {...rest}>
    {children}
  </Card>
);
