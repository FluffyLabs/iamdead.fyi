import QrScanner from 'qr-scanner';
import { CSSProperties, ReactNode, useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  // start scanning delay
  delay?: number;
  // deal with succesful scan
  onResult: (a0: string) => void;
  // fallback displayed in case there is no camera.
  children: ReactNode;
  // apply custom video styles
  videoStyles?: CSSProperties;
};

export const QrReader = ({ delay = 100, onResult, children, videoStyles }: Props) => {
  const videoRef = useRef(null);
  // use ref for `onResult` function to avoid `QrScanner` re-init.
  const onResultRef = useRef(onResult);

  const [hasCamera, setHasCamera] = useState(null as boolean | null);

  const qrScanner = useMemo(() => {
    if (!videoRef.current || !hasCamera) {
      return null;
    }

    const qrScanner = new QrScanner(
      videoRef.current,
      (result) => {
        onResultRef.current(result.data);
      },
      {
        onDecodeError: (error) => console.warn(error),
        preferredCamera: 'environment',
        maxScansPerSecond: 10,
      },
    );

    return qrScanner;
  }, [onResultRef, hasCamera]);

  // update onResultRef
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResultRef, onResult]);

  // check if there is a camera available
  useEffect(() => {
    QrScanner.hasCamera().then((hasCamera) => {
      setHasCamera(hasCamera);
    });
  }, [QrScanner, setHasCamera]);

  // start scanning after delay.
  useEffect(() => {
    const timeout = setTimeout(() => {
      qrScanner?.start();
    }, delay);

    return () => {
      console.log('Destroying qrScanner');
      qrScanner?.destroy();
      timeout && clearTimeout(timeout);
    };
  }, [qrScanner, delay]);

  const videoStylesToApply = useMemo(() => {
    const def = {
      width: '100%',
      height: 'auto',
      minHeight: '100px',
      ...videoStyles,
    };
    return def;
  }, [videoStyles]);

  // display video only if we get a positive camera result from `QrScanner`.
  return (
    <>
      {hasCamera === false ? (
        children
      ) : (
        <video
          ref={videoRef}
          style={videoStylesToApply}
        ></video>
      )}
    </>
  );
};
