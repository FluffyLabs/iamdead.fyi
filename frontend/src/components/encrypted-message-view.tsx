import { ReactNode } from 'react';
import { Heading, LockIcon, majorScale } from 'evergreen-ui';
import { Row } from './row';

export const EncryptedMessageView = ({ messageBytes, children }: { messageBytes: number; children: ReactNode }) => {
  return (
    <Row>
      <LockIcon size={majorScale(5)} />
      <Heading
        size={400}
        marginLeft={majorScale(2)}
      >
        Encrypted message ({messageBytes} bytes)
      </Heading>
      {children}
    </Row>
  );
};
