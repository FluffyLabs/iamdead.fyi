import { Heading, Pane, majorScale, UnlockIcon, CogIcon, Link } from 'evergreen-ui';
import { Props } from './secure-message-result';
import { Slab } from '../../../../components/slab';

// TODO [ToDr] Summary should be editable:
// 1. The message should open a dialog with editor
// 2. The encryption should use DraggableNumber
export const Summary = ({ message, chunksConfiguration }: Props) => {
  return (
    <>
      <Slab background="tint2">
        <Pane display="flex" alignItems="center">
          <UnlockIcon size={majorScale(5)} marginRight={majorScale(2)} />
          <Heading>
            Original Message: {message.length} characters ({Math.ceil(message.length / 256)} bytes)
            <Link marginLeft={majorScale(1)} href="#">
              (edit)
            </Link>
          </Heading>
        </Pane>
        <Slab padding="0" marginY={majorScale(2)} display="flex" alignItems="center">
          <CogIcon size={majorScale(5)} marginRight={majorScale(2)} />
          <Heading>
            Encryption: {chunksConfiguration.required} pieces required out of all{' '}
            {chunksConfiguration.required + chunksConfiguration.spare}
            <Link marginLeft={majorScale(1)} href="#">
              (edit)
            </Link>
          </Heading>
        </Slab>
      </Slab>
    </>
  );
};
