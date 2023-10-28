import { Button, Card, Heading, OfflineIcon, Paragraph, UnlockIcon, majorScale } from 'evergreen-ui';
import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Slab } from '../../../components/slab';

export const Intro = () => {
  const navigate = useNavigate();
  const Btn = ({ children, onClick, intent }: { children: ReactNode; onClick?: () => void; intent?: string }) => (
    <Button
      alignItems="flex-start"
      boxShadow="3px 3px 5px #e0e0e0"
      flex="1"
      height={250}
      intent={intent}
      marginBottom={majorScale(2)}
      marginX={majorScale(3)}
      minWidth="200px"
      onClick={onClick}
      paddingTop={majorScale(2)}
      whiteSpace="pre-wrap"
    >
      <Card padding={majorScale(2)}>{children}</Card>
    </Button>
  );

  return (
    <Slab
      display="flex"
      flexWrap="wrap"
    >
      <Btn
        intent="success"
        onClick={() => navigate('/scan')}
      >
        <OfflineIcon
          size={majorScale(5)}
          marginBottom={majorScale(2)}
        />
        <Heading size={400}>I've prepared the message off-line (recommended).</Heading>
        <Paragraph
          size={300}
          marginY={majorScale(1)}
        >
          The encryption process happens on an off-line device, and QR codes are scanned to continue the process here.
        </Paragraph>
      </Btn>
      <Btn onClick={() => navigate('/secure')}>
        <UnlockIcon
          size={majorScale(5)}
          marginBottom={majorScale(2)}
        />
        <Heading size={400}>Let me prepare the message now.</Heading>
        <Paragraph
          size={300}
          marginY={majorScale(1)}
        >
          You'll prepare the message on the current device. Note that it is not recommended to do so for security
          reasons.
        </Paragraph>
      </Btn>
    </Slab>
  );
};
