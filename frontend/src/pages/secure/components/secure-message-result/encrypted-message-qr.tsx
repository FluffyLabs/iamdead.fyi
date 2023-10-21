import { useCallback, useEffect, useState } from 'react';
import {
  Heading,
  Pane,
  majorScale,
  Group,
  Button,
  ChevronLeftIcon,
  PlayIcon,
  ChevronRightIcon,
  PauseIcon,
} from 'evergreen-ui';
import { QRWithClipboard } from '../../../../components/qr-with-clipboard';

export function EncryptedMessageQr({ data }: { data: string[] }) {
  const [selectedPart, setSelectedPart] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const part = data[selectedPart];

  const prev = useCallback(
    () => (selectedPart > 0 ? setSelectedPart(selectedPart - 1) : setSelectedPart(data.length - 1)),
    [data, selectedPart],
  );
  const next = useCallback(() => {
    setSelectedPart((selectedPart + 1) % data.length);
  }, [selectedPart, data.length]);

  const toggle = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    const id = isPlaying ? window.setInterval(next, 1000) : null;
    return () => {
      if (id) {
        window.clearInterval(id);
      }
    };
  }, [isPlaying, next]);

  const needsNav = data.length > 1;

  return (
    <>
      <Pane
        title={part}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Heading
          size={300}
          textAlign="center"
          marginBottom={majorScale(1)}
        >
          Part {selectedPart + 1} / {data.length}
        </Heading>
        <QRWithClipboard value={part.toUpperCase()} />
        <Group
          size="small"
          marginTop={majorScale(2)}
        >
          <Button
            onClick={prev}
            disabled={!needsNav || isPlaying}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            onClick={toggle}
            disabled={!needsNav}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </Button>
          <Button
            onClick={next}
            disabled={!needsNav || isPlaying}
          >
            <ChevronRightIcon />
          </Button>
        </Group>
      </Pane>
    </>
  );
}
