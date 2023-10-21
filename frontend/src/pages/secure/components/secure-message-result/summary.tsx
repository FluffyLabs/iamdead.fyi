import { Heading, Pane, majorScale, UnlockIcon, CogIcon, Link, EditIcon } from 'evergreen-ui';
import { Slab } from '../../../../components/slab';
import { ChunksConfiguration } from '../../../../services/crypto';

// TODO [ToDr] Summary should be editable:
// 1. The message should open a dialog with editor
// 2. The encryption should use DraggableNumber
type SummaryProps = {
  message: string;
  chunksConfiguration: ChunksConfiguration;
};
export const Summary = ({ message, chunksConfiguration }: SummaryProps) => {
  return (
    <>
      <Slab background="tint2">
        <Pane
          display="flex"
          alignItems="center"
        >
          <UnlockIcon
            size={majorScale(3)}
            marginRight={majorScale(2)}
          />
          <Heading size={400}>
            Original Message: {message.length} characters ({Math.ceil(message.length / 256)} bytes)
            <Link
              marginLeft={majorScale(1)}
              href="#"
            >
              <EditIcon />
            </Link>
          </Heading>
        </Pane>
        <Slab
          padding="0"
          marginY={majorScale(2)}
          display="flex"
          alignItems="center"
        >
          <CogIcon
            size={majorScale(3)}
            marginRight={majorScale(2)}
          />
          <Heading size={400}>
            Encryption: {chunksConfiguration.required} pieces required out of all{' '}
            {chunksConfiguration.required + chunksConfiguration.spare}
            <Link
              marginLeft={majorScale(1)}
              href="#"
            >
              <EditIcon />
            </Link>
          </Heading>
        </Slab>
      </Slab>
    </>
  );
};
