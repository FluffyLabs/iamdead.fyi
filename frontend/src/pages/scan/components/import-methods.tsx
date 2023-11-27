import { Card, majorScale } from 'evergreen-ui';
import { QrImport } from './qr-import';
import { FileImport } from './file-import';

export type OnImport = (err: Error | null, input: string | null) => void;

export const ImportMethods = ({ onImport, error }: { onImport: OnImport; error: string | null }) => {
  return (
    <>
      <Card
        elevation={1}
        flex="1"
        padding={majorScale(2)}
        marginRight={majorScale(3)}
        marginBottom={majorScale(2)}
        textAlign="center"
      >
        <FileImport
          onImport={onImport}
          error={error}
        />
      </Card>
      <Card
        elevation={1}
        flex="1"
        padding={majorScale(2)}
        marginBottom={majorScale(2)}
        textAlign="center"
      >
        <QrImport onImport={onImport} />
      </Card>
    </>
  );
};
