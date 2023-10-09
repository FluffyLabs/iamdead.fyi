import { Heading, Link, ListItem, majorScale, Pane, Text, UnorderedList } from 'evergreen-ui';
import { MouseEvent } from 'react';
import { MessageEditor } from '../../../components/message-editor';
import { FUNNY } from './example-messages';
import { Slab } from '../../../components/slab';

const Examples = {
  funny: FUNNY,
};

type EditorProps = {
  value: string;
  onChange: (a0: string, a1?: boolean) => void;
};

export const Editor = ({ value, onChange }: EditorProps) => {
  return (
    <>
      <Heading marginTop={majorScale(3)}>What message would you like to encrypt?</Heading>
      <Heading size={300} marginTop={majorScale(1)} marginBottom={majorScale(2)}>
        Fell free to start with something basic for now, you will have a chance to edit it any time.
      </Heading>
      <Slab display="flex" padding={0}>
        <Pane flex="6">
          <MessageEditor value={value} onChange={onChange} />
        </Pane>
        <Slab margin="0" paddingTop="0" flex="2">
          <Text>If you need help writing the message you may try some of the templates below.</Text>
          <UnorderedList>
            <ListItem>
              <Link
                href="#"
                onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  onChange(Examples.funny, true);
                  return false;
                }}
              >
                Funny Text
              </Link>
            </ListItem>
          </UnorderedList>
        </Slab>
      </Slab>
    </>
  );
};
