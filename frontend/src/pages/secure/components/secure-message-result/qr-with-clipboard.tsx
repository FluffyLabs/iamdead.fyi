import { useCallback, useEffect, useState } from 'react';
import { Link, Tooltip, Position } from 'evergreen-ui';
import { QRCodeSVG } from 'qrcode.react';

export function QRWithClipboard({ value }: { value: string }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const copyToClipboard = useCallback(() => {
    window.navigator.clipboard.writeText(value);
    setShowTooltip(true);
  }, [value]);

  useEffect(() => {
    const id = showTooltip ? setTimeout(() => setShowTooltip(false), 700) : null;
    return () => {
      if (id) {
        clearTimeout(id);
      }
    };
  }, [showTooltip]);

  return (
    <Tooltip isShown={showTooltip} content="Copied to clipboard" position={Position.TOP}>
      <Link onClick={copyToClipboard} style={{ cursor: 'copy' }}>
        <QRCodeSVG value={value} />
      </Link>
    </Tooltip>
  );
}
