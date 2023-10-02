import { Heading, Link, ListItem, majorScale, Pane, Text, UnorderedList } from 'evergreen-ui';
import { useCallback, useState } from 'react';

import { Container } from '../../components/container';
import { Navigation } from '../../components/navigation';
import { ProgressBar } from '../../components/progress-bar';
import { MessageEditor } from '../../components/message-editor';
import { FUNNY } from './example_messages';

const useEditorState = () => {
  const [value, setValue] = useState('');
  const [isPristine, setIsPristine] = useState(true);
  const handleChange = useCallback(
    (newVal: string) => {
      if (value !== newVal) {
        setValue(newVal);
        setIsPristine(false);
      }
    },
    [value],
  );

  const resetWithValue = useCallback(
    (newVal: string) => {
      if (!isPristine) {
        // TODO [ToDr] Consider using some react confirmation dialog instead.
        const confirmed = window.confirm('This action will overwrite your message.');
        if (!confirmed) {
          return;
        }
      }
      setValue(newVal);
      // TODO [ToDr] Figure out why the handleChange fires twice and why there are changes in the example.
      setIsPristine(true);
    },
    [isPristine],
  );

  return { value, handleChange, resetWithValue };
};

export const Secure = () => {
  const { value, handleChange, resetWithValue } = useEditorState();

  return (
    <>
      <Navigation />
      <Container>
        <ProgressBar progress="10%" />
        <Heading marginTop={majorScale(3)}>What message would you like to encrypt?</Heading>
        <Heading size={300} marginTop={majorScale(1)} marginBottom={majorScale(2)}>
          Fell free to start with something basic for now, you will have a chance to edit it any time.
        </Heading>
        <Pane display="flex" padding={0}>
          <Pane padding={0} margin={0} flex="6">
            <MessageEditor value={value} onChange={handleChange} />
          </Pane>
          <Pane margin="0" paddingTop="0" flex="2">
            <Text>If you need help writing the message you may try some of the templates below.</Text>
            <UnorderedList>
              <ListItem>
                <Link href="#" onClick={() => resetWithValue(Examples.funny)}>
                  Funny Text
                </Link>
              </ListItem>
            </UnorderedList>
          </Pane>
        </Pane>
      </Container>
    </>
  );
};

const Examples = {
  funny: FUNNY,
};
